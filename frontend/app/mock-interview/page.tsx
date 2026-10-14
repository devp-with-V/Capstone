"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost, apiUpload } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface DialogueMessage {
  id: string;
  sender: "ai" | "candidate";
  senderName: string;
  timestamp: string;
  content: string;
  isStreaming?: boolean;
  isBlueprint?: boolean;
}

export default function MockInterviewPage() {
  return (
    <ProtectedRoute allowedRoles={["candidate", "expert", "admin"]}>
      <MockInterviewContent />
    </ProtectedRoute>
  );
}

const ROLE_PRESETS = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "ML Engineer",
  "Data Engineer",
  "DevOps / SRE",
  "Engineering Manager",
];

const DOMAIN_OPTIONS = [
  "Data Structures & Algorithms",
  "System Design",
  "Distributed Systems & Concurrency",
  "Behavioral & Leadership",
  "Frontend & UI Engineering",
];

const DURATION_OPTIONS = [15, 30, 45];
const QUESTION_OPTIONS = [5, 8, 12];

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary";
const LABEL_CLS = "text-xs font-medium text-on-surface-variant";

function MockInterviewContent() {
  const router = useRouter();

  // ---- Setup phase (prerequisites & config) ----
  const [phase, setPhase] = useState<"setup" | "live">("setup");
  const [targetRole, setTargetRole] = useState("Backend Engineer");
  const [level, setLevel] = useState("Senior");
  const [domain, setDomain] = useState(DOMAIN_OPTIONS[2]);
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [durationMin, setDurationMin] = useState(30);
  const [questionCount, setQuestionCount] = useState(8);
  const [jobDescription, setJobDescription] = useState("");
  const [micStatus, setMicStatus] = useState<"idle" | "checking" | "ready" | "denied">("idle");
  const [camStatus, setCamStatus] = useState<"idle" | "checking" | "ready" | "denied">("idle");
  const setupPreviewRef = useRef<HTMLVideoElement | null>(null);

  const checkMic = async () => {
    setMicStatus("checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicStatus("ready");
    } catch {
      setMicStatus("denied");
    }
  };

  // Camera is mandatory for the interview: the whole session is recorded.
  // The granted stream is kept and reused when the live session starts.
  const checkCamera = async () => {
    setCamStatus("checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      streamRef.current = stream;
      if (setupPreviewRef.current) {
        setupPreviewRef.current.srcObject = stream;
      }
      setCamStatus("ready");
      setCameraActive(true);
    } catch {
      setCamStatus("denied");
    }
  };

  const canStart =
    targetRole.trim().length > 0 &&
    camStatus === "ready" &&
    (mode === "text" || micStatus === "ready");

  // ---- Live session engine: backend session + recording + TTS ----
  // Elapsed Timer state (runs only during live session)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    if (phase !== "live") return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const formatTimer = (total: number) => {
    const mins = String(Math.floor(total / 60)).padStart(2, "0");
    const secs = String(total % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Dialogue messages state (seeded on Start from setup config)
  const [messages, setMessages] = useState<DialogueMessage[]>([]);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState("");
  const [liveScores, setLiveScores] = useState<{
    depth: number;
    clarity: number;
    star: number;
    note: string;
    count: number;
  } | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState("");
  const [sessionVideoUrl, setSessionVideoUrl] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const sessionRecorderRef = useRef<MediaRecorder | null>(null);
  const sessionChunksRef = useRef<Blob[]>([]);
  const answerRecorderRef = useRef<MediaRecorder | null>(null);
  const answerChunksRef = useRef<Blob[]>([]);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const qIndexRef = useRef(0);
  const questionsRef = useRef<string[]>([]);
  const meterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const meterRef = useRef<{ ctx: AudioContext; raf: number } | null>(null);
  const recStartRef = useRef(0);
  const [recSeconds, setRecSeconds] = useState(0);

  // Browser TTS: the AI's questions are spoken aloud, no backend key needed.
  // `speakingId` drives the Replay/volume indicator + orb state.
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const pickVoice = (): SpeechSynthesisVoice | null => {
    try {
      const voices = window.speechSynthesis.getVoices();
      return (
        voices.find((v) => v.lang.startsWith("en") && /google|natural/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        null
      );
    } catch {
      return null;
    }
  };

  // Warm the (async-loading) voice list so the first question has a voice ready.
  useEffect(() => {
    try {
      window.speechSynthesis?.getVoices();
      const onVoices = () => window.speechSynthesis?.getVoices();
      window.speechSynthesis?.addEventListener?.("voiceschanged", onVoices);
      return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", onVoices);
    } catch {
      return undefined;
    }
  }, []);

  const speak = (text: string, msgId?: string) => {
    try {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text.replace(/^[“"]|[”"]$/g, ""));
      utter.rate = 1;
      const voice = pickVoice();
      if (voice) utter.voice = voice;
      utter.onend = () => setSpeakingId(null);
      utter.onerror = () => setSpeakingId(null);
      setSpeakingId(msgId || "live");
      window.speechSynthesis.speak(utter);
      // Safety: some browsers drop the utterance silently — clear a stuck state.
      setTimeout(() => {
        try {
          if (!window.speechSynthesis.speaking) setSpeakingId(null);
        } catch {
          /* noop */
        }
      }, 15000);
    } catch {
      setSpeakingId(null);
    }
  };

  const pickMime = (candidates: string[]): string => {
    try {
      for (const c of candidates) {
        if (window.MediaRecorder && MediaRecorder.isTypeSupported(c)) return c;
      }
    } catch {
      /* fall through to default */
    }
    return "";
  };

  const pushAiMessage = (content: string, streaming = false) => {
    setMessages((prev) =>
      prev.concat({
        id: `msg-ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: "ai",
        senderName: "AI Proctor (AURA)",
        timestamp: formatTimer(elapsedSeconds),
        content,
        isStreaming: streaming || undefined,
      })
    );
  };

  const pushCandidateMessage = (content: string) => {
    setMessages((prev) =>
      prev.concat({
        id: `msg-${Date.now()}`,
        sender: "candidate",
        senderName: "You (Candidate)",
        timestamp: formatTimer(elapsedSeconds),
        content,
      })
    );
  };

  const askQuestion = (idx: number, list: string[]) => {
    const q = list[idx];
    if (!q) return;
    pushAiMessage(`“Q${idx + 1}/${list.length}: ${q}”`);
    speak(`Question ${idx + 1}. ${q}`);
  };

  const ensureStream = async (): Promise<MediaStream> => {
    const existing = streamRef.current;
    if (existing && existing.getVideoTracks().some((t) => t.readyState === "live")) {
      return existing;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true,
    });
    streamRef.current = stream;
    return stream;
  };

  const stopAllMedia = () => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* noop */
    }
    for (const rec of [answerRecorderRef.current, sessionRecorderRef.current]) {
      try {
        if (rec && rec.state !== "inactive") rec.stop();
      } catch {
        /* noop */
      }
    }
    answerRecorderRef.current = null;
    sessionRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // Stop tracks when leaving the page mid-interview.
  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* noop */
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Auto-scroll the dialogue as it grows.
  useEffect(() => {
    const el = document.getElementById("dialogue-container");
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Attach the camera stream once the live layout (and its <video>) mounts.
  useEffect(() => {
    if (phase === "live" && liveVideoRef.current && streamRef.current) {
      liveVideoRef.current.srcObject = streamRef.current;
    }
  }, [phase]);

  // Recording timer.
  useEffect(() => {
    if (!recording) return;
    setRecSeconds(0);
    const t = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const stopMeter = () => {
    const m = meterRef.current;
    meterRef.current = null;
    if (!m) return;
    try {
      cancelAnimationFrame(m.raf);
    } catch {
      /* noop */
    }
    try {
      void m.ctx.close();
    } catch {
      /* noop */
    }
  };

  // Live mic level meter (AnalyserNode → canvas) while recording.
  // Direct canvas drawing: no re-renders, proof on stage that voice is captured.
  useEffect(() => {
    if (!recording) {
      stopMeter();
      return;
    }
    const stream = streamRef.current;
    const canvas = meterCanvasRef.current;
    if (!stream || !canvas) return;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      void ctx.resume().catch(() => undefined);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        const c = meterCanvasRef.current;
        const m = meterRef.current;
        if (!c || !m) return;
        analyser.getByteFrequencyData(data);
        const g = c.getContext("2d");
        if (!g) return;
        const W = (c.width = c.offsetWidth * 2 || 600);
        const H = (c.height = 64);
        g.clearRect(0, 0, W, H);
        const bars = 48;
        const step = W / bars;
        for (let i = 0; i < bars; i++) {
          const v = data[Math.floor((i / bars) * data.length)] / 255;
          const h = Math.max(5, v * H);
          g.fillStyle = v > 0.6 ? "#4edea3" : v > 0.25 ? "#c0c1ff" : "#464554";
          g.fillRect(i * step + step * 0.2, (H - h) / 2, step * 0.6, h);
        }
        m.raf = requestAnimationFrame(draw);
      };
      meterRef.current = { ctx, raf: requestAnimationFrame(draw) };
    } catch {
      /* decorative only — recording still works */
    }
    return () => stopMeter();
  }, [recording]);

  const handleStart = async () => {
    if (!canStart || starting) return;
    setStarting(true);
    setStartError("");
    try {
      // 1. Create the backend session → model writes tailored questions for this position.
      const res = await apiPost<{
        id: string;
        questions: string[];
        status: string;
      }>("/api/ai/sessions", {
        target_role: targetRole.trim(),
        level,
        domain,
        duration_min: durationMin,
        question_count: questionCount,
        job_description: jobDescription.trim() || undefined,
        mode,
      });
      if (res.error || !res.data) {
        throw new Error(res.error || "Could not create the interview session.");
      }
      const qs =
        res.data.questions && res.data.questions.length > 0
          ? res.data.questions
          : ["Give me a brief overview of your experience most relevant to this role."];
      sessionIdRef.current = res.data.id;
      setSessionId(res.data.id);
      questionsRef.current = qs;
      setQuestions(qs);
      qIndexRef.current = 0;
      setQIndex(0);
      setTurnCount(0);
      setLiveScores(null);
      setElapsedSeconds(0);
      setMessages([]);

      // 2. Camera + session recording (local only). Recording must never
      // block the interview: degrade gracefully if the encoder balks.
      const stream = await ensureStream();
      if (liveVideoRef.current) liveVideoRef.current.srcObject = stream;
      sessionChunksRef.current = [];
      const videoCandidates = [
        pickMime(["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]),
        "",
      ];
      for (const videoMime of videoCandidates) {
        try {
          const sessionRec = videoMime
            ? new MediaRecorder(stream, { mimeType: videoMime })
            : new MediaRecorder(stream);
          sessionRec.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) sessionChunksRef.current.push(e.data);
          };
          sessionRec.start(2000);
          sessionRecorderRef.current = sessionRec;
          break;
        } catch (e) {
          sessionRecorderRef.current = null;
          console.warn("[mock-interview] session recorder fallback:", e);
        }
      }

      // 3. Go live: greeting + first question, spoken aloud.
      setPhase("live");
      pushAiMessage(
        `“Welcome. This is a ${durationMin}-minute ${level} ${targetRole.trim()} interview on ${domain} — ${qs.length} questions. Your camera is recording. Let's begin.”`
      );
      setTimeout(() => askQuestion(0, qs), 600);
    } catch (e: any) {
      setStartError(e?.message || "Could not start the interview. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  // Submit one answer: audio blob (voice) or raw text (typed fallback).
  // Backend detaches audio → transcript (Groq Whisper) → live AI analysis.
  const submitAnswer = async (opts: { audioBlob?: Blob; text?: string }) => {
    const sid = sessionIdRef.current;
    if (!sid || submitting) return;
    const idx = qIndexRef.current;
    const list = questionsRef.current;
    setSubmitting(true);
    setAnswerError("");
    const thinkingId = `thinking-${Date.now()}`;
    setMessages((prev) =>
      prev.concat({
        id: thinkingId,
        sender: "ai",
        senderName: "AI Proctor (AURA)",
        timestamp: formatTimer(elapsedSeconds),
        content: "Transcribing and analyzing your answer...",
        isStreaming: true,
      })
    );
    try {
      const fd = new FormData();
      fd.append("question_idx", String(idx));
      if (opts.audioBlob) {
        fd.append("audio", opts.audioBlob, "answer.webm");
      } else {
        fd.append("transcript", opts.text || "");
      }
      const res = await apiUpload<{
        transcript: string;
        analysis: { depth: number; clarity: number; star: number; note: string };
      }>(`/api/ai/sessions/${sid}/turns`, fd);
      if (res.error || !res.data) {
        throw new Error(res.error || "Answer analysis failed.");
      }
      const { transcript, analysis } = res.data;
      setMessages((prev) => prev.filter((m) => m.id !== thinkingId));
      pushCandidateMessage(transcript);
      setLiveScores((prev) => {
        const n = (prev?.count || 0) + 1;
        const avg = (old: number, cur: number) => Math.round((old * (n - 1) + cur) / n);
        return {
          depth: avg(prev?.depth || 0, analysis.depth),
          clarity: avg(prev?.clarity || 0, analysis.clarity),
          star: avg(prev?.star || 0, analysis.star),
          note: analysis.note,
          count: n,
        };
      });
      setTurnCount((c) => c + 1);
      if (idx + 1 < list.length) {
        const next = idx + 1;
        qIndexRef.current = next;
        setQIndex(next);
        pushAiMessage(`“${analysis.note}”`);
        setTimeout(() => askQuestion(next, list), 900);
      } else {
        pushAiMessage(
          "“That was the final question. Press Finish Round whenever you're ready and I'll compile your full report — it takes a few seconds.”"
        );
        speak("That was the final question. Press Finish Round and I'll compile your report.");
      }
    } catch (e: any) {
      setMessages((prev) => prev.filter((m) => m.id !== thinkingId));
      setAnswerError(e?.message || "Could not analyze that answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartAnswer = () => {
    if (recording || submitting || !streamRef.current) return;
    setAnswerError("");
    answerChunksRef.current = [];
    const stream = streamRef.current;
    // isTypeSupported() can lie (reports audio/webm OK, then start() throws
    // NotSupportedError on some Chrome/Edge builds), so try mime list in
    // order and fall back to the browser default. Never leave the user dead.
    const candidates = [
      pickMime(["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]),
      "",
    ];
    let rec: MediaRecorder | null = null;
    for (const mime of candidates) {
      try {
        rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        rec.start();
        break;
      } catch {
        rec = null;
      }
    }
    if (!rec) {
      setAnswerError("Voice recording isn't supported in this browser — please type your answer instead.");
      return;
    }
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) answerChunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const elapsed = Date.now() - recStartRef.current;
      const blob = new Blob(answerChunksRef.current, { type: rec.mimeType || "audio/webm" });
      setRecording(false);
      if (elapsed < 1500 || blob.size < 2000) {
        setAnswerError("That was too short — hold your answer for at least a couple of seconds, then Stop & Send.");
        return;
      }
      if (blob.size > 0) {
        void submitAnswer({ audioBlob: blob });
      }
    };
    answerRecorderRef.current = rec;
    recStartRef.current = Date.now();
    setRecording(true);
  };

  const handleStopAnswer = () => {
    try {
      answerRecorderRef.current?.stop();
    } catch {
      setRecording(false);
    }
  };

  const collectSessionVideo = async (): Promise<Blob | null> => {
    const rec = sessionRecorderRef.current;
    if (!rec) {
      return sessionChunksRef.current.length
        ? new Blob(sessionChunksRef.current, { type: "video/webm" })
        : null;
    }
    if (rec.state === "inactive") {
      return sessionChunksRef.current.length
        ? new Blob(sessionChunksRef.current, { type: rec.mimeType || "video/webm" })
        : null;
    }
    return new Promise((resolve) => {
      const done = () => {
        try {
          rec.removeEventListener("stop", done);
        } catch {
          /* noop */
        }
        resolve(
          sessionChunksRef.current.length
            ? new Blob(sessionChunksRef.current, { type: rec.mimeType || "video/webm" })
            : null
        );
      };
      rec.addEventListener("stop", done);
      try {
        rec.stop();
      } catch {
        done();
      }
      setTimeout(done, 4000);
    });
  };

  const handleFinish = async () => {
    const sid = sessionIdRef.current;
    if (!sid || finishing) return;
    setFinishing(true);
    setFinishError("");
    try {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* noop */
      }
      // Keep the camera recording on this device only — downloadable below,
      // never uploaded anywhere.
      const videoBlob = await collectSessionVideo();
      stopAllMedia();
      if (videoBlob && videoBlob.size > 0) {
        setSessionVideoUrl(URL.createObjectURL(videoBlob));
      }
      const res = await apiPost<{ session_id: string }>(
        `/api/ai/sessions/${sid}/finish`,
        {}
      );
      if (res.error || !res.data) {
        throw new Error(res.error || "Report generation failed.");
      }
      router.push(`/feedback?sessionId=${res.data.session_id}`);
    } catch (e: any) {
      setFinishError(e?.message || "Could not generate the report. Please try again.");
      setFinishing(false);
    }
  };

  // Audio / Video Controls state
  const [isMuted, setIsMuted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

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

  // Send typed answer (fallback / text-only mode) — same backend analysis path.
  const handleSendAnswer = async () => {
    if (!inputAnswer.trim() || submitting || recording) return;
    const answerText = inputAnswer.trim();
    setInputAnswer("");
    await submitAnswer({ text: answerText });
  };

  if (phase === "setup") {
    return (
      <div className="bg-background font-sans text-body-md text-on-surface antialiased min-h-screen selection:bg-primary-container selection:text-on-primary-container">
        <main className="w-full pt-32 pb-20 relative overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[420px] h-[420px] bg-secondary-container/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-60 right-10 w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[160px] pointer-events-none" />
          <div className="w-full px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto flex flex-col gap-6 relative z-10">
            <section className="flex flex-col gap-2">
              <span className="font-code-mono text-xs text-primary uppercase tracking-widest font-semibold">
                AI Mock Interview // Setup
              </span>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[28px]">smart_toy</span>
                <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                  Configure your AI interview
                </h1>
              </div>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-3xl">
                No scheduling needed — AURA is available 24/7 and starts instantly. Tell it what
                you&apos;re preparing for, check your mic, then launch. A rubric report is generated
                when you finish.
              </p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: what the interview covers */}
              <div className="lg:col-span-7 rounded-2xl bg-surface-container p-6 border border-white/[0.08] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col gap-4">
                <h2 className="text-base font-bold text-on-surface">What this interview is about</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={LABEL_CLS}>Target Role</label>
                    <select
                      className={INPUT_CLS}
                      value={ROLE_PRESETS.includes(targetRole) ? targetRole : "custom"}
                      onChange={(e) =>
                        setTargetRole(e.target.value === "custom" ? "" : e.target.value)
                      }
                    >
                      {ROLE_PRESETS.map((r) => (
                        <option key={r} value={r} className="bg-surface-container-high">
                          {r}
                        </option>
                      ))}
                      <option value="custom" className="bg-surface-container-high">
                        Custom…
                      </option>
                    </select>
                    {!ROLE_PRESETS.includes(targetRole) && (
                      <input
                        className={INPUT_CLS}
                        placeholder="e.g. Staff Backend Engineer"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                      />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className={LABEL_CLS}>Level</label>
                    <select
                      className={INPUT_CLS}
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      {["Junior", "Mid-level", "Senior", "Staff", "Principal"].map((l) => (
                        <option key={l} value={l} className="bg-surface-container-high">
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={LABEL_CLS}>Focus Domain</label>
                  <div className="flex flex-wrap gap-2">
                    {DOMAIN_OPTIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDomain(d)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          domain === d
                            ? "bg-primary-container/20 text-primary border-primary/40"
                            : "bg-surface-container-high text-on-surface-variant hover:text-on-surface border-white/[0.06]"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={LABEL_CLS}>
                    Job Description <span className="text-outline">(optional — tailors questions)</span>
                  </label>
                  <textarea
                    className={`${INPUT_CLS} resize-none font-code-mono text-xs`}
                    rows={4}
                    placeholder="Paste the target JD here, or analyze one first in the JD Analyzer…"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  <Link href="/jd-analyzer" className="text-xs font-semibold text-secondary hover:underline">
                    Open JD Analyzer →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={LABEL_CLS}>Duration</label>
                    <div className="flex gap-2">
                      {DURATION_OPTIONS.map((m) => (
                        <button
                          key={m}
                          onClick={() => setDurationMin(m)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            durationMin === m
                              ? "bg-primary-container/20 text-primary border-primary/40"
                              : "bg-surface-container-high text-on-surface-variant border-white/[0.06]"
                          }`}
                        >
                          {m} min
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={LABEL_CLS}>Questions</label>
                    <div className="flex gap-2">
                      {QUESTION_OPTIONS.map((q) => (
                        <button
                          key={q}
                          onClick={() => setQuestionCount(q)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            questionCount === q
                              ? "bg-primary-container/20 text-primary border-primary/40"
                              : "bg-surface-container-high text-on-surface-variant border-white/[0.06]"
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: prerequisites + launch */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="rounded-2xl bg-surface-container p-6 border border-white/[0.08] flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[20px]">checklist</span>
                    <h2 className="text-base font-bold text-on-surface">Pre-flight checklist</h2>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/[0.04] flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-[18px]">mic</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-on-surface">Microphone access</p>
                      <p className="text-[11px] text-outline mt-0.5">
                        {mode === "text"
                          ? "Text-only mode — mic optional."
                          : micStatus === "ready"
                          ? "Mic live. AURA can hear you."
                          : micStatus === "denied"
                          ? "Mic blocked — allow access or switch to text-only."
                          : "Required for voice mode."}
                      </p>
                    </div>
                    <button
                      onClick={checkMic}
                      disabled={micStatus === "checking"}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all disabled:opacity-40 ${
                        micStatus === "ready"
                          ? "bg-tertiary-container/20 text-tertiary border-tertiary/30"
                          : "bg-surface-container-high text-on-surface border-white/[0.08] hover:bg-surface-bright"
                      }`}
                    >
                      {micStatus === "checking"
                        ? "Checking…"
                        : micStatus === "ready"
                        ? "Ready ✓"
                        : "Test Mic"}
                    </button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/[0.04] flex flex-col gap-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-primary text-[18px]">videocam</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-on-surface">
                          Camera access <span className="text-error">(required)</span>
                        </p>
                        <p className="text-[11px] text-outline mt-0.5">
                          {camStatus === "ready"
                            ? "Camera live. Recording stays on this device — nothing is uploaded."
                            : camStatus === "denied"
                            ? "Camera blocked — allow access to start the interview."
                            : "The interviewer needs to see you; recording starts on launch."}
                        </p>
                      </div>
                      <button
                        onClick={checkCamera}
                        disabled={camStatus === "checking"}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all disabled:opacity-40 shrink-0 ${
                          camStatus === "ready"
                            ? "bg-tertiary-container/20 text-tertiary border-tertiary/30"
                            : "bg-surface-container-high text-on-surface border-white/[0.08] hover:bg-surface-bright"
                        }`}
                      >
                        {camStatus === "checking"
                          ? "Checking…"
                          : camStatus === "ready"
                          ? "Ready ✓"
                          : "Enable Camera"}
                      </button>
                    </div>
                    {camStatus === "ready" && (
                      <video
                        ref={setupPreviewRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-36 object-cover rounded-lg border border-white/[0.06] bg-black"
                      />
                    )}
                  </div>
                  <div className="flex rounded-xl overflow-hidden border border-white/[0.06]">
                    {(["voice", "text"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex-1 py-2 text-xs font-semibold transition-all ${
                          mode === m
                            ? "bg-surface-container-high text-primary"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {m === "voice" ? "Voice + Text" : "Text Only"}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      speak("Hi, I'm AURA, your AI interviewer. If you can hear this, your audio is ready for the interview.")
                    }
                    className="w-full py-2 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-bright border border-white/[0.08] transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      {speakingId ? "volume_up" : "brand_awareness"}
                    </span>
                    {speakingId ? "Playing…" : "Test AURA's voice"}
                  </button>
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/[0.04] text-[11px] text-on-surface-variant leading-relaxed">
                    Quiet room recommended. Answers are scored live on depth, clarity, and STAR
                    structure. Finish anytime to generate your rubric report.
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  disabled={!canStart || starting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-sm font-semibold text-white hover:brightness-110 transition-all disabled:opacity-40 shadow-[0_12px_28px_-4px_rgba(128,131,255,0.4)] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                  {starting
                    ? "Writing your questions…"
                    : `Start ${durationMin}-min Interview • ${questionCount} Questions`}
                </button>
                {startError && (
                  <p className="text-xs text-center text-error bg-error-container/20 border border-error/30 rounded-xl px-3 py-2">
                    {startError}
                  </p>
                )}
                {!canStart && (
                  <p className="text-[11px] text-center text-outline font-code-mono">
                    {camStatus !== "ready"
                      ? "Enable your camera to start — recording is mandatory."
                      : "Test your mic above — or switch to Text Only to start now."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background font-sans text-body-md text-on-surface antialiased min-h-screen selection:bg-primary-container selection:text-on-primary-container">
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
                  <span className="font-headline-sm text-base font-bold text-on-surface">{domain}</span>
                  <span className="font-code-mono text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-primary border border-primary/20">
                    {level}
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant">Target: {level} {targetRole}{jobDescription.trim() ? " (JD-tailored)" : ""} • {mode === "voice" ? "Voice + Text" : "Text Only"} • {questionCount} questions</span>
                <span className="font-code-mono text-[11px] px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary border border-tertiary/20 w-fit">
                  Q{qIndex + 1}/{questions.length || questionCount} • {turnCount} answered
                </span>
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
                <span className={`w-2 h-2 rounded-full ${recording ? "bg-error animate-ping" : "bg-surface-bright"}`} />
                <div className="flex flex-col">
                  <span className="font-code-mono text-[10px] text-outline uppercase tracking-wider">Answer Rec</span>
                  <span className={`font-code-mono text-xs font-bold ${recording ? "text-error" : "text-on-surface-variant"}`}>
                    {recording ? "REC" : submitting ? "Scoring…" : "Idle"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowFinishModal(true)}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-error hover:text-white text-error transition-all duration-200 text-xs font-semibold flex items-center gap-1.5 border border-error/30 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">call_end</span>
                Finish Round
              </button>
            </div>
          </div>

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
                    <span className="truncate max-w-64">
                      {questions[qIndex]
                        ? `Evaluating Q${qIndex + 1}: ${questions[qIndex].slice(0, 64)}${questions[qIndex].length > 64 ? "…" : ""}`
                        : "Preparing questions…"}
                    </span>
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
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        speakingId ? "bg-primary animate-ping" : "bg-tertiary"
                      }`}
                    />
                    <span className="font-semibold">
                      {speakingId
                        ? "AURA IS SPEAKING — LISTEN IN…"
                        : `CHALLENGE STATE: QUESTION ${qIndex + 1} OF ${questions.length || questionCount}`}
                    </span>
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
                          {msg.sender === "ai" && !msg.isStreaming && !msg.isBlueprint && (
                            <button
                              onClick={() => speak(msg.content, msg.id)}
                              className="p-1 rounded-lg text-outline hover:text-primary hover:bg-surface-container-high transition-all"
                              title="Replay aloud"
                            >
                              <span
                                className={`material-symbols-outlined text-[16px] ${
                                  speakingId === msg.id ? "animate-pulse text-primary" : ""
                                }`}
                              >
                                {speakingId === msg.id ? "volume_up" : "replay"}
                              </span>
                            </button>
                          )}
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
                {answerError && (
                  <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs">
                    {answerError}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  {mode === "voice" &&
                    (recording ? (
                      <button
                        onClick={handleStopAnswer}
                        className="px-4 py-2.5 rounded-xl bg-error/20 text-error text-xs font-semibold hover:bg-error hover:text-white transition-all flex items-center gap-1 border border-error/40 shrink-0"
                      >
                        <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                        Stop & Send
                      </button>
                    ) : (
                      <button
                        onClick={handleStartAnswer}
                        disabled={submitting}
                        className="px-4 py-2.5 rounded-xl bg-tertiary-container/20 text-tertiary text-xs font-semibold hover:bg-tertiary-container/30 transition-all disabled:opacity-40 flex items-center gap-1 border border-tertiary/30 shrink-0"
                      >
                        <span className="material-symbols-outlined text-[16px]">mic</span>
                        Answer
                      </button>
                    ))}
                  <input
                    type="text"
                    value={inputAnswer}
                    onChange={(e) => setInputAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendAnswer()}
                    placeholder={
                      recording
                        ? "Recording your voice answer — press Stop & Send…"
                        : "Type your answer, or press Answer to speak…"
                    }
                    disabled={recording || submitting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendAnswer}
                    disabled={!inputAnswer.trim() || submitting || recording}
                    className="px-4 py-2.5 rounded-xl bg-primary-container text-white text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 flex items-center gap-1 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    {submitting ? "Scoring…" : "Send"}
                  </button>
                </div>

                {/* Mic Capture Bar & Voice Waveform (live meter while recording) */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-white/[0.05] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isMuted ? "bg-error" : recording ? "bg-error animate-ping" : "bg-tertiary animate-pulse"}`} />
                      {isMuted
                        ? "Microphone Muted"
                        : recording
                        ? `Recording answer • REC ${formatTimer(recSeconds)}`
                        : "Mic Capture (High Definition Studio 48kHz)"}
                    </span>
                    <span className="text-outline font-code-mono text-xs">
                      {recording ? "Speak now — bars jump as you talk" : "Dynamic Noise Gate: -42dB"}
                    </span>
                  </div>

                  <canvas ref={meterCanvasRef} className="w-full h-8" />

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
                      onClick={() => {
                        const next = !isMuted;
                        setIsMuted(next);
                        streamRef.current?.getAudioTracks().forEach((t) => {
                          t.enabled = !next;
                        });
                      }}
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
                      onClick={() => {
                        const next = !cameraActive;
                        setCameraActive(next);
                        streamRef.current?.getVideoTracks().forEach((t) => {
                          t.enabled = next;
                        });
                      }}
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
              {/* Live Camera Preview (mandatory recording) */}
              <div className="w-full bg-surface-container rounded-2xl overflow-hidden border border-white/[0.08] shadow-lg">
                <div className="relative bg-black">
                  <video
                    ref={liveVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-error/40">
                    <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                    <span className="font-code-mono text-[10px] font-bold text-error uppercase tracking-wider">
                      Recording
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 font-code-mono text-[10px] text-on-surface">
                    You • {formatTimer(elapsedSeconds)}
                  </div>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between border-t border-white/[0.05]">
                  <span className="font-code-mono text-[11px] text-outline uppercase tracking-wider">
                    Session capture → this device
                  </span>
                  <span className="font-code-mono text-[11px] text-tertiary">
                    {turnCount} answer{turnCount === 1 ? "" : "s"} saved
                  </span>
                </div>
              </div>
              {/* Live Rubric Telemetry Card */}
              <div className="w-full bg-surface-container rounded-2xl p-6 border border-white/[0.08] shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[20px]">analytics</span>
                    <h3 className="font-headline-sm text-base font-bold text-on-surface">Live Rubric Telemetry</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-code-mono text-xs border border-tertiary/20">
                    A-Tier Target
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
                      <span className="font-code-mono text-primary font-bold">
                        {liveScores ? `${liveScores.depth}%` : "—"}
                      </span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-gradient-to-r from-primary-container to-primary h-full rounded-full transition-all"
                        style={{ width: `${liveScores?.depth || 0}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-outline mt-0.5">Running average across answered questions.</span>
                  </div>

                  {/* Communication Clarity */}
                  <div className="flex flex-col gap-1 bg-surface-container-low p-3.5 rounded-xl border border-white/[0.04]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface flex items-center gap-1.5 font-medium">
                        <span className="material-symbols-outlined text-tertiary text-[16px]">record_voice_over</span>
                        Communication Clarity
                      </span>
                      <span className="font-code-mono text-tertiary font-bold">
                        {liveScores ? `${liveScores.clarity}%` : "—"}
                      </span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-gradient-to-r from-tertiary-container to-tertiary h-full rounded-full transition-all"
                        style={{ width: `${liveScores?.clarity || 0}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-outline mt-0.5">Precise nomenclature, direct responses without hedging behavior.</span>
                  </div>

                  {/* STAR Framework */}
                  <div className="flex flex-col gap-1 bg-surface-container-low p-3.5 rounded-xl border border-white/[0.04]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface flex items-center gap-1.5 font-medium">
                        <span className="material-symbols-outlined text-secondary text-[16px]">stars</span>
                        STAR Framework Fidelity
                      </span>
                      <span className="font-code-mono text-secondary font-bold">
                        {liveScores ? `${liveScores.star}%` : "—"}
                      </span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-gradient-to-r from-secondary-container to-secondary h-full rounded-full transition-all"
                        style={{ width: `${liveScores?.star || 0}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-outline mt-0.5">
                      {liveScores?.note || "Answer questions to start live scoring."}
                    </span>
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

      {/* FINISH ROUND SUMMARY MODAL */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-white/[0.1] rounded-3xl max-w-lg w-full p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-tertiary-container/30 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">task_alt</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface">End Interview & Get Report</h3>
              </div>
              {!finishing && (
                <button onClick={() => setShowFinishModal(false)} className="text-outline hover:text-on-surface">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </div>

            {finishError && (
              <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs">
                {finishError}
              </div>
            )}

            {finishing ? (
              <div className="flex flex-col items-center text-center gap-3 py-6">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm font-semibold text-on-surface">
                  Analyzing your full interview…
                </p>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  Saving the session recording, aggregating per-answer scores, and writing your
                  rubric report. This takes a few seconds.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center text-center gap-2">
                  <span className="font-code-mono text-xs text-tertiary uppercase tracking-wider font-semibold">
                    {turnCount} of {questions.length || questionCount} answered
                  </span>
                  <p className="text-xs text-on-surface-variant max-w-sm mt-1">
                    Ending generates an AI rubric report from every transcribed answer and takes
                    you straight to it. Your camera recording stays on this device only.
                  </p>
                  {sessionVideoUrl && (
                    <a
                      href={sessionVideoUrl}
                      download={`preppilot-interview-${sessionIdRef.current || "session"}.webm`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high text-xs font-medium text-on-surface hover:bg-surface-bright border border-white/[0.08]"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      Download my recording
                    </a>
                  )}
                </div>

                {liveScores && (
                  <div className="grid grid-cols-3 gap-2.5 text-center font-code-mono text-xs">
                    <div className="p-3 rounded-xl bg-surface-container border border-white/[0.04]">
                      <span className="text-[10px] text-outline uppercase block">Depth</span>
                      <span className="text-primary font-bold text-sm">{liveScores.depth}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container border border-white/[0.04]">
                      <span className="text-[10px] text-outline uppercase block">Clarity</span>
                      <span className="text-tertiary font-bold text-sm">{liveScores.clarity}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container border border-white/[0.04]">
                      <span className="text-[10px] text-outline uppercase block">STAR</span>
                      <span className="text-secondary font-bold text-sm">{liveScores.star}%</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowFinishModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface-variant hover:text-on-surface border border-white/[0.08]"
                  >
                    Keep Answering
                  </button>
                  <button
                    onClick={handleFinish}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-xs font-semibold text-white hover:brightness-110 shadow-md flex items-center justify-center gap-1"
                  >
                    End & Generate Report →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
