"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

interface DialogueMessage {
  id: string;
  sender: "ai" | "candidate";
  senderName: string;
  timestamp: string;
  content: string;
  isStreaming?: boolean;
  isBlueprint?: boolean;
}

interface InterviewRubric {
  communication_score: number;
  technical_score: number;
  problem_solving_score: number;
  star_score: number;
  summary: string;
  scoring_method: string;
}

export default function MockInterviewPage() {
  const router = useRouter();

  // Elapsed Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (total: number) => {
    const mins = String(Math.floor(total / 60)).padStart(2, "0");
    const secs = String(total % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Audio / Video Controls state
  const [isMuted, setIsMuted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [interviewError, setInterviewError] = useState("");

  // Scratchpad diagram text
  const [scratchpadText, setScratchpadText] = useState(`[Client API Gateway] --> [Partition Key Dispatcher / Dynamic Salting]
                               |
        +----------------------+----------------------+
        |                                             |
[Partition 03: Suffix #1]                  [Partition 48: Suffix #2]
        |                                             |
 [Consumer Group Instance A]              [Consumer Group Instance B]
        \\                                             /
         +------------> [Global Sequence Buffer] <---+`);

  // Dialogue messages state
  const [messages, setMessages] = useState<DialogueMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      senderName: "AI Proctor (AURA)",
      timestamp: "00:00",
      content:
        "Tell me about a distributed system you designed. What were its constraints, the decisions you made, and the result?",
    },
  ]);

  const [inputAnswer, setInputAnswer] = useState("");

  // Commit diagram from whiteboard
  const handleBroadcastDiagram = () => {
    setShowWhiteboard(false);
    const newMsg: DialogueMessage = {
      id: `msg-${Date.now()}`,
      sender: "candidate",
      senderName: "You (Candidate Scratchpad)",
      timestamp: formatTimer(elapsedSeconds),
      content: `[Attached Architectural Blueprint for Partition Sharding & Rebalancing]\n${scratchpadText}`,
      isBlueprint: true,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  // Send candidate message
  const handleSendAnswer = async () => {
    if (!inputAnswer.trim() || isReplying || isEnding) return;
    setInterviewError("");
    setIsReplying(true);
    const answerText = inputAnswer.trim();
    const candidateMsg: DialogueMessage = {
      id: `msg-${Date.now()}`,
      sender: "candidate",
      senderName: "You (Candidate)",
      timestamp: formatTimer(elapsedSeconds),
      content: answerText,
    };
    
    const updatedMessages = [...messages, candidateMsg];
    setMessages(updatedMessages);
    setInputAnswer("");

    // Temporary typing indicator
    const thinkingMsgId = `thinking-${Date.now()}`;
    const thinkingMsg: DialogueMessage = {
      id: thinkingMsgId,
      sender: "ai",
      senderName: "AI Proctor (AURA)",
      timestamp: formatTimer(elapsedSeconds + 1),
      content: "Analyzing architectural response...",
      isStreaming: true,
    };
    setMessages((prev) => [...prev, thinkingMsg]);

    try {
      const res = await apiPost<{ reply: string; sender_name?: string }>("/api/ai/interview/chat", {
        messages: updatedMessages.map((m) => ({
          sender: m.sender,
          content: m.content,
          sender_name: m.senderName,
        })),
        target_role: "Staff Distributed Systems Engineer",
      });

      if (res.error || !res.data?.reply) {
        throw new Error(res.error || "The interviewer could not respond. Please try again.");
      }

      const replyContent = res.data.reply;

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== thinkingMsgId)
          .concat({
            id: `msg-ai-${Date.now()}`,
            sender: "ai",
            senderName: res.data?.sender_name || "AI Proctor (AURA)",
            timestamp: formatTimer(elapsedSeconds + 3),
            content: `“${replyContent.replace(/^[“"]|[”"]$/g, "")}”`,
          })
      );
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== thinkingMsgId));
      setInterviewError(error instanceof Error ? error.message : "Could not get an interviewer response.");
    } finally {
      setIsReplying(false);
    }
  };

  const handleEndInterview = async () => {
    if (isEnding || isReplying) return;
    const transcript = messages.filter((message) => !message.id.startsWith("thinking-"));
    if (!transcript.some((message) => message.sender === "candidate" && !message.isBlueprint)) {
      setInterviewError("Answer at least one question before ending the interview.");
      return;
    }

    setIsEnding(true);
    setInterviewError("");
    try {
      const rubricResult = await apiPost<InterviewRubric>("/api/ai/interview/rubric", {
        messages: transcript.map((message) => ({
          sender: message.sender,
          sender_name: message.senderName,
          content: message.content,
          is_blueprint: Boolean(message.isBlueprint),
        })),
        target_role: "Staff Distributed Systems Engineer",
      });
      if (rubricResult.error || !rubricResult.data) {
        throw new Error(rubricResult.error || "Could not generate the interview rubric.");
      }

      const rubric = rubricResult.data;
      const sessionId = crypto.randomUUID();
      const fullTranscript = transcript
        .map((message) => `${message.sender === "ai" ? "AURA" : "Candidate"} (${message.timestamp}): ${message.content}`)
        .join("\n\n");
      const feedbackResult = await apiPost<{ session_id: string }>("/api/feedback", {
        session_id: sessionId,
        communication_score: rubric.communication_score,
        technical_score: rubric.technical_score,
        problem_solving_score: rubric.problem_solving_score,
        authored_by: "ai",
        comments: `${rubric.summary}\nSTAR average: ${rubric.star_score}/5. Scoring: ${rubric.scoring_method}.\n\nInterview transcript:\n${fullTranscript}`,
      });
      if (feedbackResult.error || !feedbackResult.data?.session_id) {
        throw new Error(feedbackResult.error || "Could not save the interview feedback.");
      }
      router.push(`/feedback?session=${encodeURIComponent(sessionId)}`);
    } catch (error) {
      setInterviewError(error instanceof Error ? error.message : "Could not finish the interview.");
      setIsEnding(false);
    }
  };

  return (
    <div className="bg-background font-sans text-body-md text-on-surface antialiased min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* HEADER / NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_12px_rgba(0,0,0,0.5)]">
        <div className="h-20 w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shadow-[0_0_20px_rgba(128,131,255,0.35)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-white text-[22px]">rocket_launch</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-lg font-bold text-on-surface tracking-tight leading-none group-hover:text-primary transition-colors">
                PrepPilot
              </span>
              <span className="font-code-mono text-[10px] text-primary uppercase tracking-widest mt-1">
                Intelligence &amp; Career Suite
              </span>
            </div>
            <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high border border-white/[0.08]">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              <span className="font-code-mono text-[11px] text-tertiary uppercase tracking-wider">
                v3.4 Production Ready
              </span>
            </div>
          </Link>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/mock-interview"
              className="hidden md:inline-flex items-center px-4 py-2 rounded-lg bg-surface-container-high text-sm font-semibold text-primary border border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <span className="material-symbols-outlined text-[18px] mr-1.5 text-primary">smart_toy</span>
              Active Simulation
            </Link>
            <Link
              href="/mentors"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-sm font-semibold text-white hover:brightness-110 transition-all shadow-[0_8px_20px_-4px_rgba(99,102,241,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]"
            >
              <span className="material-symbols-outlined text-[18px] mr-1.5">calendar_month</span>
              Book Mentor
            </Link>
            <Link
              href="/profile"
              className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center hover:border-primary transition-colors"
              title="Candidate Profile"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">person</span>
            </Link>
          </div>
        </div>

        {/* Secondary Services Navigation Strip */}
        <div className="border-t border-white/[0.04] bg-surface-container-lowest/90 px-4 sm:px-8 lg:px-12 py-1.5 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 max-w-7xl mx-auto text-xs whitespace-nowrap">
            <Link href="/resume" className="px-2.5 py-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">description</span> Resume Review
            </Link>
            <Link
              href="/mock-interview"
              className="px-3 py-1 rounded-md text-primary font-semibold bg-surface-container-high shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center gap-1 border border-primary/20"
            >
              <span className="material-symbols-outlined text-[14px]">smart_toy</span> AI Mock Interview
            </Link>
            <Link href="/mentors" className="px-2.5 py-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">record_voice_over</span> Mentor Marketplace
            </Link>
            <Link href="/report" className="px-2.5 py-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">analytics</span> Readiness Report
            </Link>
            <Link href="/jobs" className="px-2.5 py-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">manage_search</span> Jobs &amp; Matcher
            </Link>
            <Link href="/jd-analyzer" className="px-2.5 py-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">auto_stories</span> Custom JD Analyzer
            </Link>
            <Link href="/teams" className="px-2.5 py-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">domain</span> Institutional Teams OS
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full pt-32 pb-20">
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col gap-6">
          {/* Live Session Status Super-header */}
          <div className="w-full bg-surface-container-low p-4 rounded-2xl border border-white/[0.06] shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-error-container/40 text-error border border-error/30">
                <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                <span className="font-code-mono text-xs font-bold uppercase tracking-wider">Live Simulation</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-base font-bold text-on-surface">Distributed Systems &amp; Concurrency</span>
                  <span className="font-code-mono text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-primary border border-primary/20">
                    Staff Level
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant">Target: Staff Backend Engineer @ Stripe (Ledger Infrastructure)</span>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-xl border border-white/[0.04] shadow-sm">
                <span className="material-symbols-outlined text-outline text-[18px]">timer</span>
                <div className="flex flex-col">
                  <span className="font-code-mono text-[10px] text-outline uppercase tracking-wider">Elapsed</span>
                  <span className="font-code-mono text-xs font-bold text-on-surface">{formatTimer(elapsedSeconds)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-xl border border-white/[0.04] shadow-sm">
                <span className="material-symbols-outlined text-tertiary text-[18px]">network_check</span>
                <div className="flex flex-col">
                  <span className="font-code-mono text-[10px] text-outline uppercase tracking-wider">Voice Latency</span>
                  <span className="font-code-mono text-xs font-bold text-tertiary">186ms RTT</span>
                </div>
              </div>
              <button
                onClick={handleEndInterview}
                disabled={isEnding || isReplying}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-error hover:text-white text-error transition-all duration-200 text-xs font-semibold flex items-center gap-1.5 border border-error/30 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">call_end</span>
                {isEnding ? "Generating rubric..." : "End Interview"}
              </button>
            </div>
          </div>

          {interviewError && (
            <div role="alert" className="rounded-xl border border-error/30 bg-error-container/30 px-4 py-3 text-sm text-error">
              {interviewError}
            </div>
          )}

          {/* Grid: Main Left 8 Columns / Telemetry Right 4 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            {/* Left 8 Columns */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Adaptive Synthesizer Neural Waveform Card */}
              <div className="w-full bg-surface-container rounded-2xl p-6 border border-white/[0.08] shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[320px]">
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
                <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between z-10 w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                    <span className="font-code-mono text-xs uppercase tracking-widest text-secondary font-semibold">Adaptive Synthesizer</span>
                    <span className="text-outline font-code-mono text-xs">• AURA-v4 Proctored</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-full text-on-surface-variant text-xs border border-white/[0.04]">
                    <span className="material-symbols-outlined text-primary text-[14px]">psychology</span>
                    <span>Evaluating: Kafka Hotspotting Under VIP Burst</span>
                  </div>
                </div>

                {/* Central Neural Orb & Waveform */}
                <div className="my-4 flex flex-col items-center justify-center relative z-10 py-2">
                  <div className="relative flex items-center justify-center mb-4">
                    <div
                      className="w-20 h-20 rounded-full bg-gradient-to-tr from-secondary-container via-primary-container to-tertiary-container p-0.5 shadow-xl shadow-primary-container/20 animate-spin"
                      style={{ animationDuration: "12s" }}
                    >
                      <div className="w-full h-full bg-surface-container-lowest rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[32px]">neurology</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-md -z-10 scale-125" />
                  </div>

                  {/* Waveform Equalizer */}
                  <div className="w-full max-w-md flex items-center justify-center gap-1.5 h-14 px-4">
                    <span className="w-1.5 bg-secondary rounded-full animate-bounce h-5 [animation-delay:0.1s]" />
                    <span className="w-1.5 bg-primary rounded-full animate-bounce h-9 [animation-delay:0.25s]" />
                    <span className="w-1.5 bg-tertiary rounded-full animate-bounce h-12 [animation-delay:0.05s]" />
                    <span className="w-1.5 bg-secondary rounded-full animate-bounce h-7 [animation-delay:0.3s]" />
                    <span className="w-1.5 bg-primary-container rounded-full animate-bounce h-14 [animation-delay:0.15s]" />
                    <span className="w-1.5 bg-tertiary-fixed rounded-full animate-bounce h-10 [animation-delay:0.4s]" />
                    <span className="w-1.5 bg-secondary-fixed rounded-full animate-bounce h-6 [animation-delay:0.2s]" />
                    <span className="w-1.5 bg-primary rounded-full animate-bounce h-12 [animation-delay:0.35s]" />
                    <span className="w-1.5 bg-tertiary rounded-full animate-bounce h-8 [animation-delay:0.1s]" />
                    <span className="w-1.5 bg-secondary rounded-full animate-bounce h-14 [animation-delay:0.22s]" />
                    <span className="w-1.5 bg-primary-container rounded-full animate-bounce h-5 [animation-delay:0.45s]" />
                    <span className="w-1.5 bg-tertiary-fixed rounded-full animate-bounce h-10 [animation-delay:0.18s]" />
                    <span className="w-1.5 bg-secondary rounded-full animate-bounce h-4 [animation-delay:0.32s]" />
                  </div>

                  <div className="mt-2 flex items-center gap-2 font-code-mono text-xs text-primary">
                    <span className="inline-block w-2 h-2 rounded-full bg-tertiary" />
                    <span className="font-semibold">CHALLENGE STATE: DEEP ARCHITECTURAL DRILL-DOWN</span>
                  </div>
                </div>

                <div className="flex items-center justify-between z-10 w-full pt-1 text-on-surface-variant text-xs border-t border-white/[0.04]">
                  <span>Mode: Interactive Dynamic Voice Sync</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">graphic_eq</span>
                    <span className="font-code-mono">Audio Bandwidth: Lossless 48kHz PCM</span>
                  </div>
                </div>
              </div>

              {/* Real-Time Dialogue Stream Card */}
              <div className="w-full bg-surface-container rounded-2xl p-6 border border-white/[0.08] shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-primary text-[20px]">forum</span>
                    <h2 className="font-headline-sm text-base font-bold">Real-Time Dialogue Stream</h2>
                  </div>
                  <div className="flex items-center gap-1 text-outline text-xs font-code-mono">
                    <span className="material-symbols-outlined text-[14px]">auto_read_pause</span>
                    <span>Continuous Speech Ingestion</span>
                  </div>
                </div>

                {/* Dialogue Container */}
                <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[380px] pr-1 scrollbar-none" id="dialogue-container">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-2 p-4 rounded-xl border shadow-sm ${
                        msg.sender === "ai"
                          ? "bg-surface-container-low border-white/[0.05]"
                          : "bg-surface-container-high border-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold flex items-center gap-1.5 ${
                            msg.sender === "ai" ? "text-secondary" : "text-primary"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {msg.sender === "ai" ? "smart_toy" : "account_circle"}
                          </span>
                          {msg.senderName}
                        </span>
                        <div className="flex items-center gap-2">
                          {msg.isStreaming && (
                            <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary font-code-mono text-[10px] border border-tertiary/20">
                              Streaming
                            </span>
                          )}
                          <span className="font-code-mono text-xs text-outline">{msg.timestamp}</span>
                        </div>
                      </div>
                      {msg.isBlueprint ? (
                        <pre className="font-code-mono text-xs text-primary bg-surface-container-lowest p-3 rounded-lg border border-white/[0.05] overflow-x-auto whitespace-pre">
                          {msg.content}
                        </pre>
                      ) : (
                        <p className="text-xs sm:text-sm text-on-surface leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Candidate Typed Response Input (Sync with Voice) */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={inputAnswer}
                    onChange={(e) => setInputAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendAnswer()}
                    placeholder="Type supplementary explanation or architectural clarification..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleSendAnswer}
                    disabled={!inputAnswer.trim() || isReplying || isEnding}
                    className="px-4 py-2.5 rounded-xl bg-primary-container text-white text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span> Send
                  </button>
                </div>

                {/* Mic Capture Bar & Voice Waveform */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-white/[0.05] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isMuted ? "bg-error" : "bg-tertiary animate-pulse"}`} />
                      {isMuted ? "Microphone Muted" : "Mic Capture (High Definition Studio 48kHz)"}
                    </span>
                    <span className="text-outline font-code-mono text-xs">Dynamic Noise Gate: -42dB</span>
                  </div>

                  <div className="flex items-center gap-2 h-8 w-full py-1">
                    <div className={`h-2 rounded-full w-2 ${isMuted ? "bg-outline/20" : "bg-tertiary/40"}`} />
                    <div className={`h-4 rounded-full w-2 ${isMuted ? "bg-outline/20" : "bg-tertiary/70"}`} />
                    <div className={`h-6 rounded-full w-2 ${isMuted ? "bg-outline/20" : "bg-tertiary"}`} />
                    <div className={`h-3 rounded-full w-2 ${isMuted ? "bg-outline/20" : "bg-tertiary/60"}`} />
                    <div className={`h-5 rounded-full w-2 ${isMuted ? "bg-outline/20" : "bg-tertiary"}`} />
                    <div className={`h-2 rounded-full w-2 ${isMuted ? "bg-outline/20" : "bg-tertiary/40"}`} />
                    <div className={`h-7 rounded-full w-2 ${isMuted ? "bg-outline/20" : "bg-tertiary animate-pulse"}`} />
                    <div className={`h-4 rounded-full w-2 ${isMuted ? "bg-outline/20" : "bg-tertiary/80"}`} />
                    <div className={`h-2 rounded-full w-2 ${isMuted ? "bg-outline/20" : "bg-tertiary/30"}`} />
                    <div className={`h-5 rounded-full w-2 ${isMuted ? "bg-outline/20" : "bg-tertiary"}`} />
                    <div className={`h-3 rounded-full w-2 ${isMuted ? "bg-outline/20" : "bg-tertiary/60"}`} />
                    <div className={`h-6 rounded-full w-2 ${isMuted ? "bg-outline/20" : "bg-tertiary"}`} />
                    <div className="flex-1 bg-surface-container-high h-1.5 rounded-full overflow-hidden ml-3">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isMuted ? "bg-outline/30 w-0" : "bg-gradient-to-r from-tertiary via-primary to-secondary w-3/4"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-code-mono text-outline pt-1">
                    <div className="flex items-center gap-3">
                      <span>Filler Words: <strong className="text-secondary font-bold">2</strong> (e.g. &apos;like&apos;)</span>
                      <span>•</span>
                      <span>Pacing: <strong className="text-tertiary">142 WPM</strong> (Optimal)</span>
                    </div>
                    <span className="text-on-surface-variant">Speech Sentiment: Analytical &amp; Assertive</span>
                  </div>
                </div>

                {/* Bottom Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold border ${
                        isMuted
                          ? "bg-error/20 text-error border-error/30"
                          : "bg-surface-container-high hover:bg-surface-bright text-on-surface border-white/[0.08]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{isMuted ? "mic_off" : "mic"}</span>
                      <span>{isMuted ? "Unmute Mic" : "Mute Audio"}</span>
                    </button>

                    <button
                      onClick={() => setCameraActive(!cameraActive)}
                      className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold border ${
                        cameraActive
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-surface-container-high hover:bg-surface-bright text-on-surface border-white/[0.08]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">videocam</span>
                      <span>{cameraActive ? "Camera Active" : "Camera Stream"}</span>
                    </button>

                    <button
                      onClick={() => setShowWhiteboard(true)}
                      className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all flex items-center gap-1.5 text-xs font-semibold border border-white/[0.08]"
                    >
                      <span className="material-symbols-outlined text-secondary text-[18px]">draw</span>
                      <span>System Whiteboard</span>
                    </button>
                  </div>
                  <span className="text-xs font-code-mono text-outline">Auto-recalibration: 05:42</span>
                </div>
              </div>
            </div>

            {/* Right 4 Columns */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Rubric is calculated from completed answers at the end. */}
              <div className="w-full bg-surface-container rounded-2xl p-6 border border-white/[0.08] shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[20px]">analytics</span>
                    <h3 className="font-headline-sm text-base font-bold text-on-surface">Interview Rubric</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-code-mono text-xs border border-tertiary/20">
                    Text answers
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {/* System Depth */}
                  <div className="flex flex-col gap-1 bg-surface-container-low p-3.5 rounded-xl border border-white/[0.04]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface flex items-center gap-1.5 font-medium">
                        <span className="material-symbols-outlined text-primary text-[16px]">account_tree</span>
                        System Depth &amp; Trade-offs
                      </span>
                      <span className="font-code-mono text-primary font-bold">Pending</span>
                    </div>
                    <span className="text-[11px] text-outline mt-0.5">Evaluated from your completed answers.</span>
                  </div>

                  {/* Communication Clarity */}
                  <div className="flex flex-col gap-1 bg-surface-container-low p-3.5 rounded-xl border border-white/[0.04]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface flex items-center gap-1.5 font-medium">
                        <span className="material-symbols-outlined text-tertiary text-[16px]">record_voice_over</span>
                        Communication Clarity
                      </span>
                      <span className="font-code-mono text-tertiary font-bold">Pending</span>
                    </div>
                    <span className="text-[11px] text-outline mt-0.5">Speech delivery is not scored in this text interview.</span>
                  </div>

                  {/* STAR Framework */}
                  <div className="flex flex-col gap-1 bg-surface-container-low p-3.5 rounded-xl border border-white/[0.04]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface flex items-center gap-1.5 font-medium">
                        <span className="material-symbols-outlined text-secondary text-[16px]">stars</span>
                        STAR Framework Fidelity
                      </span>
                      <span className="font-code-mono text-secondary font-bold">Pending</span>
                    </div>
                    <span className="text-[11px] text-outline mt-0.5">Based on your answers when you end the interview.</span>
                  </div>
                </div>

                {/* 6-Axis Live Radar Competency */}
                <div className="flex flex-col gap-1 bg-surface-container-low p-3.5 rounded-xl border border-white/[0.04]">
                  <span className="font-code-mono text-[11px] uppercase tracking-wider text-outline font-semibold">
                    Live Radar Competency
                  </span>
                  <div className="w-full flex items-center justify-center py-2">
                    <svg className="w-48 h-48 overflow-visible" viewBox="0 0 200 200">
                      <polygon
                        className="text-outline-variant"
                        fill="none"
                        points="100,15 178,57 178,143 100,185 22,143 22,57"
                        stroke="currentColor"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <polygon
                        className="text-outline-variant"
                        fill="none"
                        points="100,45 145,69 145,121 100,145 55,121 55,69"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <polygon
                        className="text-primary/20"
                        fill="currentColor"
                        points="100,24 170,62 165,138 100,172 38,135 32,65"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle className="fill-primary" cx="100" cy="24" r="3" />
                      <circle className="fill-secondary" cx="170" cy="62" r="3" />
                      <circle className="fill-tertiary" cx="165" cy="138" r="3" />
                      <circle className="fill-primary" cx="100" cy="172" r="3" />
                      <circle className="fill-secondary" cx="38" cy="135" r="3" />
                      <circle className="fill-tertiary" cx="32" cy="65" r="3" />
                      <text className="fill-on-surface font-code-mono text-[9px]" textAnchor="middle" x="100" y="8">
                        CAP / Dist
                      </text>
                      <text className="fill-on-surface font-code-mono text-[9px]" textAnchor="start" x="185" y="58">
                        Concurrency
                      </text>
                      <text className="fill-on-surface font-code-mono text-[9px]" textAnchor="start" x="180" y="148">
                        Latency SLA
                      </text>
                      <text className="fill-on-surface font-code-mono text-[9px]" textAnchor="middle" x="100" y="198">
                        Data Schema
                      </text>
                      <text className="fill-on-surface font-code-mono text-[9px]" textAnchor="end" x="15" y="148">
                        Failure Recovery
                      </text>
                      <text className="fill-on-surface font-code-mono text-[9px]" textAnchor="end" x="20" y="58">
                        Ledger Logic
                      </text>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Dynamic Stress Injections Card */}
              <div className="w-full bg-surface-container rounded-2xl p-6 border border-white/[0.08] shadow-lg flex flex-col gap-3">
                <div className="flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[20px]">bolt</span>
                  <h4 className="font-headline-sm text-base font-bold">Dynamic Stress Injections</h4>
                </div>
                <span className="text-xs text-on-surface-variant leading-relaxed">
                  Autonomous Proctor evaluates weak signals and applies real-time follow-up pressure:
                </span>
                <div className="flex flex-col gap-2 mt-1">
                  <div className="p-3 rounded-xl bg-surface-container-high border border-white/[0.05] flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">notification_important</span>
                    <div className="flex flex-col">
                      <span className="text-xs text-on-surface font-semibold">Algorithmic Edge-Case Test</span>
                      <span className="text-[11px] text-outline">Injecting partition rebalance event while distributed locks are held.</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-white/[0.04] flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <div className="flex flex-col">
                      <span className="text-xs text-on-surface-variant font-medium">Resolved: Consensus Protocols</span>
                      <span className="text-[11px] text-outline">Candidate successfully defended Raft over multi-Paxos for this tier.</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-white/[0.04] flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-outline text-[18px] shrink-0 mt-0.5">schedule</span>
                    <div className="flex flex-col">
                      <span className="text-xs text-on-surface-variant font-medium">Pending: Failure Isolation</span>
                      <span className="text-[11px] text-outline">Will trigger if candidate finishes partition skew explanation in &lt; 2m.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proctor Assessment Note Banner */}
              <div className="w-full bg-surface-container-high rounded-2xl p-4 border border-white/[0.08] shadow-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container border border-white/[0.06] flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface">Proctor Assessment Note</span>
                    <span className="text-xs text-tertiary font-semibold">Senior Staff bar met on 4/5 vectors</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-[20px]">chevron_right</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SYSTEM WHITEBOARD / SCRATCHPAD MODAL */}
      {showWhiteboard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col p-6 sm:p-8 gap-4 max-h-[90vh] border border-white/[0.1]">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[24px]">architecture</span>
                <h3 className="font-headline-md text-lg font-bold text-on-surface">Distributed Architectural Scratchpad</h3>
              </div>
              <button
                onClick={() => setShowWhiteboard(false)}
                className="p-1 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant">
              Visual ASCII schemas and diagrams typed here are analyzed simultaneously by the AI Proctor alongside your voice response.
            </p>
            <textarea
              className="w-full bg-surface-container-lowest rounded-xl p-4 font-code-mono text-xs text-primary placeholder-outline focus:outline-none focus:border-primary shadow-inner resize-none border border-white/[0.05]"
              rows={12}
              value={scratchpadText}
              onChange={(e) => setScratchpadText(e.target.value)}
            />
            <div className="flex items-center justify-between pt-2">
              <span className="font-code-mono text-xs text-outline">Sync State: Synced with AI Proctor Context Window</span>
              <button
                onClick={handleBroadcastDiagram}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-semibold text-xs hover:brightness-110 transition-all shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">podcasts</span>
                Broadcast Diagram to Proctor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-lowest text-on-surface-variant py-14 border-t border-white/[0.04]">
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-surface text-[18px]">rocket_launch</span>
              </div>
              <span className="font-bold text-base text-on-surface">PrepPilot Platform Matrix</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-white/[0.06]">
                <span className="material-symbols-outlined text-tertiary text-[14px]">verified_user</span>
                <span className="text-xs text-on-surface">SOC2 Type II</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-white/[0.06]">
                <span className="material-symbols-outlined text-secondary text-[14px]">hub</span>
                <span className="text-xs text-on-surface">ATS Ingestion API</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-white/[0.06]">
                <span className="material-symbols-outlined text-primary text-[14px]">videocam</span>
                <span className="text-xs text-on-surface">Jitsi WebRTC Mesh</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-white/[0.06]">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                <span className="text-xs text-on-surface">99.9% Core SLA</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-on-surface uppercase tracking-wider mb-1 font-code-mono">Candidate Services</span>
              <Link href="/resume" className="hover:text-on-surface transition-colors">ATS Resume Review</Link>
              <Link href="/mock-interview" className="hover:text-on-surface transition-colors">AI Mock Simulation</Link>
              <Link href="/mentors" className="hover:text-on-surface transition-colors">Verified Mentors</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-on-surface uppercase tracking-wider mb-1 font-code-mono">Intelligence &amp; Jobs</span>
              <Link href="/report" className="hover:text-on-surface transition-colors">Readiness Index &amp; Radar</Link>
              <Link href="/jobs" className="hover:text-on-surface transition-colors">Live Job Matching</Link>
              <Link href="/jd-analyzer" className="hover:text-on-surface transition-colors">JD Blueprint Designer</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-on-surface uppercase tracking-wider mb-1 font-code-mono">Enterprise &amp; Trust</span>
              <Link href="/teams" className="hover:text-on-surface transition-colors">Institutional Teams OS</Link>
              <Link href="/report" className="hover:text-on-surface transition-colors">FERPA &amp; GDPR Policies</Link>
              <Link href="/report" className="hover:text-on-surface transition-colors">Security Whitepaper</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-on-surface uppercase tracking-wider mb-1 font-code-mono">Platform Status</span>
              <div className="flex items-center gap-2 text-tertiary font-code-mono">
                <span className="w-2 h-2 rounded-full bg-tertiary" />All Services Operational
              </div>
              <span className="text-outline text-[11px] font-code-mono">Global Edge Latency: ~18ms</span>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-outline border-t border-white/[0.04]">
            <p>© 2025–2026 PrepPilot AI &amp; Mentor Matrix Inc. All sovereign computing rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-on-surface transition-colors">Privacy Architecture</Link>
              <Link href="#" className="hover:text-on-surface transition-colors">Security Whitepaper</Link>
              <Link href="#" className="hover:text-on-surface transition-colors">System Telemetry</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
