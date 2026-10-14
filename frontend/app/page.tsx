"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"ai" | "mentor">("ai");

  return (
    <div className="bg-background font-sans text-body-md text-on-surface antialiased min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* MAIN CONTAINER */}
      <main className="w-full pt-32 pb-16">
        {/* HERO SECTION */}
        <section className="relative w-full pt-10 pb-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col items-center">
          {/* Atmospheric Ambient Glows */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary-container/15 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute top-48 right-12 w-[300px] h-[300px] bg-secondary-container/20 rounded-full blur-[120px] pointer-events-none -z-10" />

          {/* Status Ribbon */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-white/[0.08] mb-6">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="font-code-mono text-xs text-on-surface-variant">
              Target Any Job Description • Dual AI + Mentor Proof Loop
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display-hero text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-on-surface max-w-5xl tracking-tight leading-[1.15]">
            Master your next interview with{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              real JD evidence
            </span>
            , 24/7 AI, and elite human mentors.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-on-surface-variant text-center max-w-3xl leading-relaxed">
            Target any Job Description. Practice adaptive conversational AI mock interviews, get instant ATS &amp; 4-pillar resume rewrites, and book 1-on-1 sessions with verified FAANG+ principal interviewers.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-base font-semibold text-white hover:brightness-110 transition-all shadow-[0_12px_28px_-4px_rgba(128,131,255,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
              Get Started Free
            </Link>
            <a
              href="#microservices"
              className="px-8 py-4 rounded-xl bg-surface-container-high text-base font-medium text-on-surface hover:bg-surface-bright transition-all border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">hub</span>
              Explore 7 Core Microservices
            </a>
          </div>

          {/* Trust & Integrations Banner */}
          <div className="w-full max-w-5xl mt-14 pt-8 flex flex-wrap items-center justify-between gap-y-4 gap-x-6 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
              <span className="font-code-mono text-xs sm:text-sm text-on-surface-variant">SOC-2 Type II Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">sync_alt</span>
              <span className="font-code-mono text-xs sm:text-sm text-on-surface-variant">ATS Mesh: Ashby, Greenhouse, Lever, Workday</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">trending_up</span>
              <span className="font-code-mono text-xs sm:text-sm text-on-surface-variant">98.4% Offer Conversion Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[18px]">school</span>
              <span className="font-code-mono text-xs sm:text-sm text-on-surface-variant">30+ Global Campus Placements</span>
            </div>
          </div>

          {/* INTERACTIVE HERO SPLIT DEMO PREVIEW */}
          <div className="w-full max-w-6xl mt-14 rounded-2xl bg-surface-container-lowest border border-white/[0.08] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden" id="demo-preview">
            {/* Window Control Header */}
            <div className="px-5 py-3 bg-surface-container flex items-center justify-between border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-error-container inline-block" />
                <span className="w-3 h-3 rounded-full bg-surface-variant inline-block" />
                <span className="w-3 h-3 rounded-full bg-tertiary-container inline-block" />
                <span className="ml-3 font-code-mono text-xs text-on-surface-variant">session_id: preppilot_live_0942x_fintech</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-0.5 rounded-full bg-surface-container-high font-code-mono text-xs text-tertiary flex items-center gap-1.5 border border-tertiary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" /> JITSI MESH ACTIVE
                </span>
                <span className="font-code-mono text-xs text-outline">Latency: 14ms</span>
              </div>
            </div>

            {/* Split Card Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
              {/* Left Pane: Target JD Breakdown */}
              <div className="lg:col-span-5 p-6 bg-surface-container-low flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.05]">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-code-mono text-xs text-primary uppercase tracking-wider font-semibold">Target Role Blueprint</span>
                    <span className="px-2 py-0.5 rounded bg-primary-container/20 font-code-mono text-xs text-primary border border-primary/20">
                      Microservice #06
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-xl font-bold text-on-surface">Staff Backend Engineer</h3>
                    <p className="text-sm text-on-surface-variant mt-0.5">FinTech Core Payments &amp; Settlement Systems</p>
                  </div>

                  {/* Signal Extraction Chips */}
                  <div className="flex flex-col gap-2 pt-1">
                    <span className="font-code-mono text-xs text-outline uppercase tracking-wider">Extracted Hard Signal Requirements</span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-surface-container-high font-code-mono text-xs text-on-surface border border-white/[0.06]">
                        Distributed Consensus (Raft)
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-surface-container-high font-code-mono text-xs text-tertiary border border-tertiary/20">
                        Golang 1.23 High Concurrency
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-surface-container-high font-code-mono text-xs text-secondary border border-secondary/20">
                        Idempotency &amp; Saga State
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-surface-container-high font-code-mono text-xs text-on-surface border border-white/[0.06]">
                        Kafka Partition Lag Optimization
                      </span>
                    </div>
                  </div>

                  {/* Extracted Rubric Breakdown */}
                  <div className="p-3.5 rounded-xl bg-surface-container flex flex-col gap-2 border border-white/[0.04]">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-on-surface">JD Alignment Match</span>
                      <span className="text-tertiary font-code-mono font-bold">92.4% Optimal</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-tertiary w-[92.4%]" />
                    </div>
                    <span className="text-xs text-outline">Missing Signal: Experience with Zero-Loss Ledger Rollbacks</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs text-on-surface-variant border-t border-white/[0.04] mt-4">
                  <span className="flex items-center gap-1.5 font-code-mono">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">tune</span> 4 Evaluation Rubrics Ingested
                  </span>
                  <Link href="/jd-analyzer" className="font-code-mono text-primary hover:underline flex items-center gap-0.5">
                    Re-parse JD →
                  </Link>
                </div>
              </div>

              {/* Right Pane: Live Session Switcher & Stream */}
              <div className="lg:col-span-7 p-6 bg-surface flex flex-col justify-between gap-4">
                {/* Session Switcher Tabs */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg border border-white/[0.05]">
                    <button
                      onClick={() => setActiveTab("ai")}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        activeTab === "ai"
                          ? "bg-surface-container-high text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-primary"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px] text-primary">smart_toy</span> 24/7 AI Interviewer
                    </button>
                    <button
                      onClick={() => setActiveTab("mentor")}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        activeTab === "mentor"
                          ? "bg-surface-container-high text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-secondary"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px] text-secondary">record_voice_over</span> Mentor Room
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-code-mono text-xs text-outline uppercase">Active Rubric Score</span>
                    <span className="px-2.5 py-0.5 rounded bg-tertiary-container/30 font-code-mono text-sm font-bold text-tertiary border border-tertiary/20">
                      89/100
                    </span>
                  </div>
                </div>

                {/* Tab 1: AI Interviewer */}
                {activeTab === "ai" && (
                  <div className="flex flex-col gap-4">
                    {/* AI Prompt Speech Box */}
                    <div className="p-4 rounded-xl bg-surface-container-low border border-white/[0.05] flex items-start gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                      <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">graphic_eq</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-on-surface">Autonomous AI Proctor</span>
                          <span className="font-code-mono text-[11px] text-outline">12:44:09 EST</span>
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          “Given a ledger system processing 45,000 transactions/sec, how do you handle partial state rollbacks across dual-write datastores without introducing locks that degrade p99 latency?”
                        </p>
                      </div>
                    </div>

                    {/* Candidate Response Visualizer */}
                    <div className="p-4 rounded-xl bg-surface-container-high border border-white/[0.06] flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-code-mono text-xs text-secondary uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" /> Candidate Audio Ingestion (Stream)
                        </span>
                        <span className="font-code-mono text-xs text-tertiary">STAR Matrix Aligned</span>
                      </div>
                      {/* Simulated Waveform */}
                      <div className="flex items-end gap-1.5 h-8 py-1">
                        <div className="w-1.5 h-3 bg-primary rounded-full animate-bounce" />
                        <div className="w-1.5 h-6 bg-secondary rounded-full animate-bounce [animation-delay:0.1s]" />
                        <div className="w-1.5 h-4 bg-tertiary rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-7 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                        <div className="w-1.5 h-5 bg-secondary rounded-full animate-bounce [animation-delay:0.25s]" />
                        <div className="w-1.5 h-8 bg-tertiary rounded-full animate-bounce [animation-delay:0.05s]" />
                        <div className="w-1.5 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
                        <div className="w-1.5 h-6 bg-secondary rounded-full animate-bounce [animation-delay:0.18s]" />
                        <div className="w-1.5 h-4 bg-tertiary rounded-full animate-bounce [animation-delay:0.22s]" />
                        <div className="w-1.5 h-7 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
                        <div className="w-1.5 h-5 bg-secondary rounded-full animate-bounce [animation-delay:0.35s]" />
                        <div className="w-1.5 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.08s]" />
                      </div>
                      <p className="text-xs text-on-surface-variant italic mt-1 leading-relaxed">
                        “I leverage an Outbox pattern with Change Data Capture on the primary write path, ensuring isolation while emitting idempotent compaction events to the read replica...”
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Mentor Room */}
                {activeTab === "mentor" && (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-xl bg-surface-container-low border border-white/[0.05] flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center font-bold text-white shadow-md">
                          AR
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-on-surface">Alex Rivera</h4>
                          <p className="text-xs text-outline">Principal Architect • Ex-Stripe • 140+ Mocks Led</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-tertiary-container/30 text-tertiary font-code-mono text-xs flex items-center gap-1 border border-tertiary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary" /> Slot Available Today
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-container-high border border-white/[0.06] flex flex-col gap-2.5">
                      <span className="font-code-mono text-xs text-on-surface-variant uppercase tracking-wider">Live Mentor Evaluation Telemetry</span>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-on-surface">Distributed Systems Architecture</span>
                            <span className="font-code-mono text-tertiary font-semibold">Tier-1 Outstanding</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                            <div className="h-full bg-tertiary w-[95%]" />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-on-surface">Concurrency &amp; Data Consistency</span>
                            <span className="font-code-mono text-primary font-semibold">Strong Hire</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                            <div className="h-full bg-primary w-[88%]" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-on-surface-variant italic pt-2 border-t border-white/[0.04]">
                        “Candidate has exceptional intuition around distributed consensus. Advised sharpening discussion on partition tolerance under geo-replication.”
                      </p>
                    </div>
                  </div>
                )}

                {/* Bottom Telemetry Badges */}
                <div className="flex items-center justify-between pt-2 text-xs text-outline font-code-mono border-t border-white/[0.04]">
                  <span className="flex items-center gap-1 text-tertiary">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> System Design Scoring Active
                  </span>
                  <span>WebRTC Video Socket 256-bit Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER SECTION TITLE */}
        <section className="w-full py-12 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-code-mono text-xs uppercase tracking-widest">
            <span>Core Product Suite</span>
            <span className="w-8 h-[1px] bg-primary/40" />
            <span>Comprehensive Interview Readiness</span>
          </div>
          <h2 className="font-headline-xl text-3xl sm:text-4xl font-bold text-on-surface">
            From preparation to placement. A complete end-to-end platform.
          </h2>
          <p className="text-base sm:text-lg text-on-surface-variant max-w-3xl">
            Explore our 7 integrated microservices designed to diagnose gaps, sharpen responses with AI and live industry mentors, and help you land top-tier tech offers.
          </p>
        </section>

        {/* 7 CORE MICROSERVICES EXPANSIVE SHOWCASE */}
        <section className="w-full pb-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col gap-20" id="microservices">
          {/* 01 RESUME REVIEW SERVICE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-primary-container/20 font-code-mono text-xs text-primary uppercase tracking-wider font-semibold border border-primary/20">
                  Microservice #01 • Resume Intelligence
                </span>
              </div>
              <h3 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
                Resume Review Service: ATS &amp; 4-Pillar Evaluation
              </h3>
              <p className="text-base text-on-surface-variant leading-relaxed">
                High-throughput PDF byte parsing, instant applicant tracking system compatibility verification, and mathematical scoring across 4 evaluation pillars: Impact, Brevity, Style, and Hard Skills.
              </p>
              <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Real-time ATS parsing benchmarked against Lever, Greenhouse, and Workday formats.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Inline before/after bullet revisions with green highlight diffs and quantified metric injection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Unsupervised hard skill graph extraction mapping experience to senior role levels.</span>
                </li>
              </ul>
              <div className="pt-1">
                <Link href="/resume" className="text-sm font-semibold text-primary hover:text-primary-fixed flex items-center gap-1 group">
                  Scan Your Resume Now <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

            {/* Service 01 Interactive Artifact Card */}
            <div className="lg:col-span-7 rounded-2xl bg-surface-container p-6 border border-white/[0.08] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">description</span>
                  <span className="font-bold text-sm text-on-surface">Resume Diagnostic Output</span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-tertiary-container/20 font-code-mono text-xs text-tertiary border border-tertiary/20">
                  Parse Latency: 320ms
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-surface-container-high flex flex-col border border-white/[0.04]">
                  <span className="font-code-mono text-[11px] text-outline uppercase">Impact Score</span>
                  <span className="text-2xl font-bold text-tertiary mt-1">91/100</span>
                  <span className="text-[11px] text-tertiary-fixed-dim">Quantified metrics</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-high flex flex-col border border-white/[0.04]">
                  <span className="font-code-mono text-[11px] text-outline uppercase">Brevity</span>
                  <span className="text-2xl font-bold text-on-surface mt-1">84/100</span>
                  <span className="text-[11px] text-outline">1 page optimal</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-high flex flex-col border border-white/[0.04]">
                  <span className="font-code-mono text-[11px] text-outline uppercase">Style &amp; Tone</span>
                  <span className="text-2xl font-bold text-on-surface mt-1">88/100</span>
                  <span className="text-[11px] text-outline">Active verbs</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-high flex flex-col border border-white/[0.04]">
                  <span className="font-code-mono text-[11px] text-outline uppercase">Hard Skills</span>
                  <span className="text-2xl font-bold text-primary mt-1">94/100</span>
                  <span className="text-[11px] text-primary">FinTech matches</span>
                </div>
              </div>

              {/* Before / After Bullet Diff */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-white/[0.05] flex flex-col gap-2">
                <span className="font-code-mono text-xs text-outline uppercase tracking-wider font-semibold">Semantic Rewrite Differential</span>
                <div className="p-3 rounded-lg bg-error-container/15 text-xs font-code-mono text-error flex items-start gap-2 border border-error/20">
                  <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">remove</span>
                  <span>Worked on backend payment infrastructure to make transactions run faster for database queries.</span>
                </div>
                <div className="p-3 rounded-lg bg-tertiary-container/20 text-xs font-code-mono text-tertiary flex items-start gap-2 border border-tertiary/20">
                  <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">add</span>
                  <span>Architected zero-downtime distributed PostgreSQL shard cluster, decreasing p99 settlement latency by 38% across $1.4B quarterly volume.</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-outline font-code-mono">
                <span>ATS Pass Probability: 96.8%</span>
                <span className="text-tertiary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary" /> Ready for Export
                </span>
              </div>
            </div>
          </div>

          {/* 02 AI MOCK INTERVIEW SERVICE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 rounded-2xl bg-surface-container p-6 border border-white/[0.08] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">smart_toy</span>
                  <span className="font-bold text-sm text-on-surface">Adaptive Conversational Engine</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 font-code-mono text-xs text-primary border border-primary/20">
                  Voice Synthesis: 280ms TTS
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-xl bg-surface-container-high border border-white/[0.04] flex flex-col gap-1">
                  <span className="font-code-mono text-xs text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">psychology</span> AI Deep-Dive Challenge Level 3
                  </span>
                  <p className="text-sm text-on-surface leading-relaxed">
                    “You mentioned partitioning Kafka events by user ID. What strategy preserves strict ordering during hot-partition rebalancing when a VIP user triggers 10,000 tx/sec?”
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low border-l-2 border-l-secondary pl-4 flex flex-col gap-1">
                  <span className="font-code-mono text-xs text-secondary font-semibold">Candidate Response Evaluated</span>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    “I introduce a secondary compound hash key (userID + bucketID modulo 16) with virtual consumer groups to disperse hot load while maintaining deterministic state boundaries.”
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-surface-container-high flex flex-col border border-white/[0.04]">
                  <span className="font-code-mono text-[11px] text-outline">System Depth</span>
                  <span className="text-lg font-bold text-tertiary">96%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-high flex flex-col border border-white/[0.04]">
                  <span className="font-code-mono text-[11px] text-outline">Clarity</span>
                  <span className="text-lg font-bold text-on-surface">88%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-high flex flex-col border border-white/[0.04]">
                  <span className="font-code-mono text-[11px] text-outline">STAR Score</span>
                  <span className="text-lg font-bold text-secondary">92%</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-secondary-container/30 font-code-mono text-xs text-secondary uppercase tracking-wider font-semibold border border-secondary/20">
                  Microservice #02 • AI Mock Interviewer
                </span>
              </div>
              <h3 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
                AI Mock Interview Service: 24/7 Adaptive Voice &amp; Text
              </h3>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Never practice into a void. Engage with an autonomous, adaptive conversational interviewer that dynamically generates multi-tier follow-up questions customized to your spoken or typed answers.
              </p>
              <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Ultra-low latency streaming voice input and real-time speech-to-text tokenization.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Dynamic difficulty scaling: answers trigger deeper architectural stress tests.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Live rubric score telemetry tracking confidence, filler word velocity, and algorithmic accuracy.</span>
                </li>
              </ul>
              <div className="pt-1">
                <Link href="/mock-interview" className="text-sm font-semibold text-secondary hover:text-secondary-fixed flex items-center gap-1 group">
                  Launch Instant AI Simulation <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 03 MENTOR INTERVIEW SERVICE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-tertiary-container/30 font-code-mono text-xs text-tertiary uppercase tracking-wider font-semibold border border-tertiary/20">
                  Microservice #03 • Expert Marketplace
                </span>
              </div>
              <h3 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
                Mentor Interview Service: Human Expert Marketplace
              </h3>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Connect directly with verified staff/principal engineers, engineering managers, and directors actively conducting hiring rounds at premier technology organizations.
              </p>
              <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Real-time calendar synchronization across global timezones with 1-click slot locks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Embedded high-definition Jitsi WebRTC video rooms with zero installs required.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Standardized enterprise rubrics returned within 60 minutes of session wrap.</span>
                </li>
              </ul>
              <div className="pt-1">
                <Link href="/mentors" className="text-sm font-semibold text-tertiary hover:text-tertiary-fixed flex items-center gap-1 group">
                  Browse Verified Mentor Roster <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-2xl bg-surface-container p-6 border border-white/[0.08] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-on-primary">
                    AR
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">Alex Rivera</h4>
                    <p className="text-xs text-outline">Principal Architect • Ex-Stripe • 140+ Mocks Led</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-tertiary-container/30 font-code-mono text-xs text-tertiary flex items-center gap-1 border border-tertiary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary" /> Slot Available Today
                </span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-white/[0.05] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-code-mono text-xs text-on-surface-variant uppercase">Structured Mentor Rubric Ingestion</span>
                  <span className="font-code-mono text-xs text-secondary font-semibold">Verified Evaluation</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface">Distributed Systems Architecture</span>
                      <span className="font-code-mono text-tertiary font-semibold">Outstanding (Tier 1)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-tertiary w-[95%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface">Concurrency &amp; Data Consistency Tradeoffs</span>
                      <span className="font-code-mono text-primary font-semibold">Strong Hire</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-primary w-[88%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface">Executive Leadership &amp; Conflict Navigation</span>
                      <span className="font-code-mono text-secondary font-semibold">Hire</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-secondary w-[82%]" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant italic pt-2 border-t border-white/[0.04]">
                  “Candidate showed phenomenal grasp of distributed consensus. Advised sharpening discussion on partition tolerance under geo-replication.”
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 font-code-mono text-xs text-outline">
                <span className="flex items-center gap-1.5 text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">videocam</span> WebRTC Session Room #0912
                </span>
                <Link href="/mentors" className="text-primary hover:underline flex items-center gap-1">
                  Instant Calendar Lock →
                </Link>
              </div>
            </div>
          </div>

          {/* 04 OVERALL REPORT SERVICE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 rounded-2xl bg-surface-container p-6 border border-white/[0.08] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[22px]">analytics</span>
                  <span className="font-bold text-sm text-on-surface">Candidate Readiness Index Engine</span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-surface-container-high font-code-mono text-xs text-on-surface border border-white/[0.06]">
                  Normalized 0–100 Scale
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-6 flex flex-col items-center justify-center p-4 rounded-xl bg-surface-container-lowest border border-white/[0.04]">
                  {/* SVG Competency Radar */}
                  <svg className="w-36 h-36 text-primary" viewBox="0 0 160 160">
                    <polygon fill="none" points="80,15 142,59 118,131 42,131 18,59" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
                    <polygon fill="none" points="80,35 124,67 107,119 53,119 36,67" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
                    <polygon fill="none" points="80,55 106,75 96,107 64,107 54,75" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
                    <polygon fill="currentColor" fillOpacity="0.25" points="80,22 135,62 109,125 48,115 28,65" stroke="currentColor" strokeWidth="2" />
                    <circle className="fill-tertiary" cx="80" cy="22" r="3" />
                    <circle className="fill-primary" cx="135" cy="62" r="3" />
                    <circle className="fill-secondary" cx="109" cy="125" r="3" />
                    <circle className="fill-primary" cx="48" cy="115" r="3" />
                    <circle className="fill-tertiary" cx="28" cy="65" r="3" />
                  </svg>
                  <span className="font-code-mono text-xs text-on-surface-variant mt-2">5-Axis Competency Geometry</span>
                </div>
                <div className="sm:col-span-6 flex flex-col gap-2">
                  <div className="p-2.5 rounded-lg bg-surface-container-high flex justify-between items-center text-xs">
                    <span className="text-on-surface">System Architecture</span>
                    <span className="font-code-mono text-tertiary font-bold">94/100</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-high flex justify-between items-center text-xs">
                    <span className="text-on-surface">Algorithmic Precision</span>
                    <span className="font-code-mono text-primary font-bold">89/100</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-high flex justify-between items-center text-xs">
                    <span className="text-on-surface">Behavioral STAR Delivery</span>
                    <span className="font-code-mono text-secondary font-bold">92/100</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-high flex justify-between items-center text-xs">
                    <span className="text-on-surface">Problem Solving Speed</span>
                    <span className="font-code-mono text-on-surface font-bold">87/100</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-high flex items-center justify-between border border-white/[0.06]">
                <div className="flex flex-col">
                  <span className="font-code-mono text-xs text-outline uppercase">Computed Composite Readiness</span>
                  <span className="text-base font-bold text-on-surface">Ready for Staff Assessment</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-tertiary leading-none">91</span>
                  <span className="font-code-mono text-xs text-tertiary-fixed-dim">/ 100</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-tertiary-container/20 font-code-mono text-xs text-tertiary uppercase tracking-wider font-semibold border border-tertiary/20">
                  Microservice #04 • Readiness Engine
                </span>
              </div>
              <h3 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
                Overall Report Service: Holistic Candidate Readiness
              </h3>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Synthesizes signals from AI practice rounds, human mentor evaluations, and resume ATS scans into an authoritative, single-source-of-truth score report.
              </p>
              <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Mathematical readiness index factoring complexity, speed, and communication rubrics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Interactive multi-axis radar chart showing relative percentile vs. 40,000+ peers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Longitudinal growth trajectory analytics tracking readiness over repeated attempts.</span>
                </li>
              </ul>
              <div className="pt-1">
                <Link href="/report" className="text-sm font-semibold text-tertiary hover:text-tertiary-fixed flex items-center gap-1 group">
                  Inspect Sample Telemetry Report <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 05 SUGGESTED JOBS SCRAPER SERVICE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-primary-container/20 font-code-mono text-xs text-primary uppercase tracking-wider font-semibold border border-primary/20">
                  Microservice #05 • Live Job Matcher
                </span>
              </div>
              <h3 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
                Suggested Jobs Scraper: Intelligent Semantic Matching
              </h3>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Our distributed crawler indexes thousands of fresh technical openings across leading platforms daily, matching your verified readiness profile directly to hiring requirements.
              </p>
              <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Semantic compatibility calculation matching your verified skills against raw job postings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Gap detector: flags the exact 1 or 2 missing topics to practice before submitting an application.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Direct ATS links and tailored question designer bridge for instant practice.</span>
                </li>
              </ul>
              <div className="pt-1">
                <Link href="/jobs" className="text-sm font-semibold text-primary hover:text-primary-fixed flex items-center gap-1 group">
                  View Live Ingested Openings <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-2xl bg-surface-container p-6 border border-white/[0.08] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">manage_search</span>
                  <span className="font-bold text-sm text-on-surface">Live Ingested Tech Postings</span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-surface-container-high font-code-mono text-xs text-tertiary border border-white/[0.06]">
                  Indexed 12m ago
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low transition-colors">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-on-surface">Staff Platform Engineer</span>
                      <span className="px-2 py-0.5 rounded bg-tertiary-container/20 font-code-mono text-xs text-tertiary font-semibold">
                        96% Fit
                      </span>
                    </div>
                    <p className="text-xs text-outline">Datadog • Remote • $240k – $285k Base + Equity</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded bg-surface-container-high font-code-mono text-[11px] text-on-surface-variant">eBPF</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-high font-code-mono text-[11px] text-on-surface-variant">Kubernetes Operator SDK</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-high font-code-mono text-[11px] text-tertiary font-semibold">Profile Validated</span>
                    </div>
                  </div>
                  <Link href="/jd-analyzer" className="px-3.5 py-1.5 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-bright transition-colors shrink-0 text-center border border-white/[0.08]">
                    Apply With Blueprint
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-lowest border border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low transition-colors">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-on-surface">Lead Distributed Storage Eng</span>
                      <span className="px-2 py-0.5 rounded bg-primary-container/20 font-code-mono text-xs text-primary font-semibold">
                        91% Fit
                      </span>
                    </div>
                    <p className="text-xs text-outline">Cloudflare • Austin / Hybrid • $230k – $270k</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded bg-surface-container-high font-code-mono text-[11px] text-on-surface-variant">Rust</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-high font-code-mono text-[11px] text-on-surface-variant">WASM</span>
                      <span className="px-2 py-0.5 rounded bg-error-container/20 font-code-mono text-[11px] text-error font-semibold">Gap: Raft Multi-Paxos</span>
                    </div>
                  </div>
                  <Link href="/mock-interview" className="px-3.5 py-1.5 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-bright transition-colors shrink-0 text-center border border-white/[0.08]">
                    Practice Gap Topics
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-outline font-code-mono">
                <span>Targeting 3,420 Active Mid-to-Staff Engineering Openings</span>
                <Link href="/jobs" className="text-primary hover:underline">
                  Configure Alerts →
                </Link>
              </div>
            </div>
          </div>

          {/* 06 JD ANALYZER & CUSTOM INTERVIEW DESIGNER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 rounded-2xl bg-surface-container p-6 border border-white/[0.08] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">auto_stories</span>
                  <span className="font-bold text-sm text-on-surface">Auto-Generated Question Blueprint</span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-secondary-container/20 font-code-mono text-xs text-secondary border border-secondary/20">
                  Target: Tier-1 Autonomous Auto
                </span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-white/[0.05] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-code-mono text-xs text-outline uppercase">Custom Script Generation Telemetry</span>
                  <span className="font-code-mono text-xs text-tertiary font-semibold">4 Distinct Rounds Created</span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-surface-container-high border border-white/[0.04] flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-on-surface">Round 1: Low-Latency Event Pipeline</span>
                      <span className="font-code-mono text-xs text-primary font-medium">Technical Arch</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Scenario: Sensor stream telemetry ingest over UDP with zero packet drops under network degradation.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container-high border border-white/[0.04] flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-on-surface">Round 2: Cross-Functional Incident Leadership</span>
                      <span className="font-code-mono text-xs text-secondary font-medium">Behavioral STAR</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Scenario: Resolving priority conflict between safety audit teams and delivery release velocity.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 font-code-mono text-xs text-outline">
                <span>Blueprint Accuracy Confidence: 99.1%</span>
                <span className="text-tertiary">Exportable to PDF &amp; IDE</span>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-secondary-container/30 font-code-mono text-xs text-secondary uppercase tracking-wider font-semibold border border-secondary/20">
                  Microservice #06 • Target Role Blueprint
                </span>
              </div>
              <h3 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
                JD Analyzer &amp; Custom Interview Designer
              </h3>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Paste any raw Job Description. The parser uncovers hidden hiring preferences, implicit cultural signals, and automatically synthesizes a bespoke multi-round interview curriculum.
              </p>
              <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Detects implicit company interview philosophies (e.g. Amazon Leadership Principles vs. Google Googlyness).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Generates role-tailored system design prompts, coding tasks, and edge-case follow-ups.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Instant sync with Microservice 02 (AI voice) or Microservice 03 (Live mentor).</span>
                </li>
              </ul>
              <div className="pt-1">
                <Link href="/jd-analyzer" className="text-sm font-semibold text-secondary hover:text-secondary-fixed flex items-center gap-1 group">
                  Build Custom JD Blueprint Now <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 07 CONNECTED TEAMS PREPARATION SERVICE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" id="teams-preview">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-tertiary-container/30 font-code-mono text-xs text-tertiary uppercase tracking-wider font-semibold border border-tertiary/20">
                  Microservice #07 • Enterprise &amp; Campus OS
                </span>
              </div>
              <h3 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
                Connected Teams Preparation: Institutional Enterprise OS
              </h3>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Turnkey operating platform for university career offices, software bootcamps, and corporate internal mobility programs to scale structured mock practice across large candidate cohorts.
              </p>
              <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Batch student management with SSO, CSV bulk onboarding, and dynamic group assigners.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Dean &amp; Director Analytics: identify class-wide conceptual deficiencies before placement drives.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">check</span>
                  <span>Automated interview pass/fail predictions and institutional talent export feeds.</span>
                </li>
              </ul>
              <div className="pt-1">
                <Link href="/teams" className="text-sm font-semibold text-tertiary hover:text-tertiary-fixed flex items-center gap-1 group">
                  Explore Institutional Portal <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-2xl bg-surface-container p-6 border border-white/[0.08] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-tertiary text-[22px]">domain</span>
                  <div>
                    <span className="font-bold text-sm text-on-surface">Institutional Cohort Dashboard</span>
                    <p className="text-xs text-outline">Carnegie Mellon Graduate CS • Spring Placement Batch</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-tertiary-container/20 font-code-mono text-xs text-tertiary border border-tertiary/20">
                  342 Active Students
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-surface-container-high flex flex-col border border-white/[0.04]">
                  <span className="font-code-mono text-[11px] text-outline">Readiness Avg</span>
                  <span className="text-xl font-bold text-tertiary mt-1">84.2%</span>
                  <span className="text-[11px] text-tertiary-fixed-dim">+12.4% this mo</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-high flex flex-col border border-white/[0.04]">
                  <span className="font-code-mono text-[11px] text-outline">Completed</span>
                  <span className="text-xl font-bold text-on-surface mt-1">1,894</span>
                  <span className="text-[11px] text-outline">AI &amp; Mentors</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-high flex flex-col border border-white/[0.04]">
                  <span className="font-code-mono text-[11px] text-outline">Offers Secured</span>
                  <span className="text-xl font-bold text-primary mt-1">142</span>
                  <span className="text-[11px] text-primary">Tier-1 Placed</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-white/[0.05] flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-code-mono text-outline uppercase">Cohort Skill Deficiency Heatmap</span>
                  <span className="font-code-mono text-tertiary">Live Batch Telemetry</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-code-mono text-xs">
                  <div className="p-2 rounded-lg bg-tertiary-container/30 text-tertiary border border-tertiary/20">Concurrency (91%)</div>
                  <div className="p-2 rounded-lg bg-tertiary-container/30 text-tertiary border border-tertiary/20">Algorithms (88%)</div>
                  <div className="p-2 rounded-lg bg-error-container/30 text-error border border-error/30 font-bold">System Scale (54%)</div>
                  <div className="p-2 rounded-lg bg-surface-container-high text-on-surface border border-white/[0.05]">STAR Delivery (76%)</div>
                </div>
                <span className="text-xs text-outline mt-1">System Action: 48 remedial mock sessions automatically scheduled on Distributed System Scale.</span>
              </div>
            </div>
          </div>
        </section>

        {/* HOW THE EVIDENCE LOOP WORKS (4-STEP WORKFLOW) */}
        <section className="w-full py-20 bg-surface-container-lowest border-y border-white/[0.05]" id="evidence-loop">
          <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col gap-2 text-center items-center">
              <span className="font-code-mono text-xs text-primary uppercase tracking-widest">End-To-End Closed Loop Pipeline</span>
              <h2 className="font-headline-xl text-3xl sm:text-4xl font-bold text-on-surface">How the Evidence Loop Works</h2>
              <p className="text-base text-on-surface-variant max-w-2xl">
                From the first pasted URL to signing your written offer letter, every milestone is verified through computational proof.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-surface-container flex flex-col justify-between border border-white/[0.06] group hover:border-primary/40 transition-colors">
                <div className="flex flex-col gap-3">
                  <span className="font-headline-lg text-3xl font-extrabold text-outline group-hover:text-primary transition-colors">01</span>
                  <h4 className="font-bold text-base text-on-surface">Target JD Ingestion</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Paste the job description URL or raw text. Microservices extract technical stack mandates, tacit culture signals, and create custom rubrics.
                  </p>
                </div>
                <div className="mt-4 pt-2 font-code-mono text-xs text-primary border-t border-white/[0.05]">
                  Outputs: Custom Blueprint
                </div>
              </div>
              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-surface-container flex flex-col justify-between border border-white/[0.06] group hover:border-secondary/40 transition-colors">
                <div className="flex flex-col gap-3">
                  <span className="font-headline-lg text-3xl font-extrabold text-outline group-hover:text-secondary transition-colors">02</span>
                  <h4 className="font-bold text-base text-on-surface">Resume Calibration</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Upload your resume for real-time 4-pillar analysis. Automatically rewrite bullets with verified quantified metrics and match ATS requirements.
                  </p>
                </div>
                <div className="mt-4 pt-2 font-code-mono text-xs text-secondary border-t border-white/[0.05]">
                  Outputs: 95%+ ATS Ready PDF
                </div>
              </div>
              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-surface-container flex flex-col justify-between border border-white/[0.06] group hover:border-tertiary/40 transition-colors">
                <div className="flex flex-col gap-3">
                  <span className="font-headline-lg text-3xl font-extrabold text-outline group-hover:text-tertiary transition-colors">03</span>
                  <h4 className="font-bold text-base text-on-surface">Dual-Track Practice</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Run unlimited 24/7 adaptive AI voice rounds to iron out technical accuracy, then lock in high-stakes human mock sessions with senior leaders.
                  </p>
                </div>
                <div className="mt-4 pt-2 font-code-mono text-xs text-tertiary border-t border-white/[0.05]">
                  Outputs: Encrypted Recordings
                </div>
              </div>
              {/* Step 4 */}
              <div className="p-6 rounded-2xl bg-surface-container flex flex-col justify-between border border-white/[0.06] group hover:border-primary-fixed/40 transition-colors">
                <div className="flex flex-col gap-3">
                  <span className="font-headline-lg text-3xl font-extrabold text-outline group-hover:text-primary-fixed transition-colors">04</span>
                  <h4 className="font-bold text-base text-on-surface">Readiness &amp; Match</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Review your composite Readiness Index score. Receive direct introductions to vetted job postings where your skills already exceed the hire bar.
                  </p>
                </div>
                <div className="mt-4 pt-2 font-code-mono text-xs text-primary-fixed border-t border-white/[0.05]">
                  Outputs: Fast-Track Ingestion
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF & TESTIMONIALS */}
        <section className="w-full py-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col items-center text-center gap-2">
            <span className="font-code-mono text-xs text-tertiary uppercase tracking-widest">Empirical Outcomes</span>
            <h2 className="font-headline-xl text-3xl sm:text-4xl font-bold text-on-surface">Proven at the highest levels of tech hiring.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface-container flex flex-col justify-between border border-white/[0.06]">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1 text-tertiary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[18px]">star</span>
                  ))}
                </div>
                <p className="text-sm text-on-surface leading-relaxed">
                  “The JD Analyzer predicted the exact distributed system failure questions I was asked in my Meta E6 loop. Practicing them 10+ times with the 24/7 AI gave me rock-solid confidence.”
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container text-xs">
                  TL
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-on-surface">Tanay L.</h5>
                  <p className="text-[11px] text-outline">Now Staff SWE at Meta</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container flex flex-col justify-between border border-white/[0.06]">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1 text-tertiary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[18px]">star</span>
                  ))}
                </div>
                <p className="text-sm text-on-surface leading-relaxed">
                  “The mentor mock with an ex-Stripe lead completely changed how I framed my concurrency answers. Within 3 weeks I converted 2 of my 3 on-sites into offers.”
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container text-xs">
                  SN
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-on-surface">Siddharth N.</h5>
                  <p className="text-[11px] text-outline">Senior Infrastructure Lead at Stripe</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container flex flex-col justify-between border border-white/[0.06]">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1 text-tertiary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[18px]">star</span>
                  ))}
                </div>
                <p className="text-sm text-on-surface leading-relaxed">
                  “Deploying the Connected Teams portal to 400 engineering master students resulted in a 42% increase in early-round placement conversion. The heatmap analytics are invaluable.”
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                <div className="w-9 h-9 rounded-full bg-tertiary-container flex items-center justify-center font-bold text-on-tertiary-container text-xs">
                  ER
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-on-surface">Dr. Elena Rostova</h5>
                  <p className="text-[11px] text-outline">Dean of Career Placement • Engineering</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING & TIERS */}
        <section className="w-full py-20 bg-surface-container-low border-y border-white/[0.05]" id="pricing">
          <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col items-center text-center gap-2">
              <span className="font-code-mono text-xs text-primary uppercase tracking-widest">Clear &amp; Transparent Scaling</span>
              <h2 className="font-headline-xl text-3xl sm:text-4xl font-bold text-on-surface">Invest in verified interview readiness.</h2>
              <p className="text-base text-on-surface-variant max-w-2xl">
                Choose candidate access for personal interview acceleration or institutional suites for universities and enterprises.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {/* Candidate Pro Tier */}
              <div className="p-6 rounded-2xl bg-surface-container flex flex-col justify-between border border-white/[0.06]">
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="font-code-mono text-xs text-primary uppercase tracking-wider font-semibold">Candidate Self-Paced</span>
                    <h3 className="font-headline-lg text-2xl font-bold text-on-surface mt-1">Candidate Pro</h3>
                    <p className="text-xs text-on-surface-variant">Unlimited AI voice interviews &amp; JD blueprints</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-on-surface">$49</span>
                    <span className="text-xs text-outline">/ month</span>
                  </div>
                  <ul className="flex flex-col gap-2 text-xs text-on-surface-variant pt-2 border-t border-white/[0.05]">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check</span> Unlimited 24/7 AI Voice Simulations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check</span> Real-time ATS &amp; 4-Pillar Resume Parser
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check</span> 25 JD Blueprint Analyses per month
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check</span> Suggested Jobs Semantic Scraper
                    </li>
                  </ul>
                </div>
                <Link
                  href="/signup"
                  className="mt-6 w-full py-3 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-bright transition-all text-center border border-white/[0.08]"
                >
                  Start Candidate Pro
                </Link>
              </div>

              {/* Mentor Plus Tier */}
              <div className="p-6 rounded-2xl bg-surface-container-high flex flex-col justify-between border border-primary/40 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-primary-container to-secondary-container font-code-mono text-[11px] text-white uppercase tracking-wider font-semibold shadow-md">
                  Most Comprehensive
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="font-code-mono text-xs text-secondary uppercase tracking-wider font-semibold">AI + Human Mentorship</span>
                    <h3 className="font-headline-lg text-2xl font-bold text-on-surface mt-1">Mentor Plus</h3>
                    <p className="text-xs text-on-surface-variant">Complete hybrid preparation with FAANG leaders</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-on-surface">$249</span>
                    <span className="text-xs text-outline">/ month</span>
                  </div>
                  <ul className="flex flex-col gap-2 text-xs text-on-surface-variant pt-2 border-t border-white/[0.05]">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check</span> Everything in Candidate Pro
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check</span> 3 Live 60-min Human Mock Interviews
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check</span> Written Rubric Delivery within 60 mins
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check</span> HD Jitsi Video Recording &amp; Transcript
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check</span> Direct Mentor Chat &amp; Follow-up
                    </li>
                  </ul>
                </div>
                <Link
                  href="/signup"
                  className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-xs font-semibold text-white hover:brightness-110 transition-all text-center shadow-[0_8px_20px_-4px_rgba(99,102,241,0.5)]"
                >
                  Get Mentor Plus Access
                </Link>
              </div>

              {/* Institutional Enterprise Tier */}
              <div className="p-6 rounded-2xl bg-surface-container flex flex-col justify-between border border-white/[0.06]">
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="font-code-mono text-xs text-tertiary uppercase tracking-wider font-semibold">Universities &amp; Bootcamps</span>
                    <h3 className="font-headline-lg text-2xl font-bold text-on-surface mt-1">Institutional Matrix</h3>
                    <p className="text-xs text-on-surface-variant">Batch management &amp; candidate readiness OS</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-on-surface">Custom</span>
                    <span className="text-xs text-outline">/ annual seat pool</span>
                  </div>
                  <ul className="flex flex-col gap-2 text-xs text-on-surface-variant pt-2 border-t border-white/[0.05]">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check</span> Microservice 07: Connected Teams OS
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check</span> Aggregate Cohort Skill Deficiency Heatmaps
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check</span> Canvas / Blackboard / LMS API Webhooks
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check</span> Dedicated Engineering Success Lead
                    </li>
                  </ul>
                </div>
                <Link
                  href="/teams"
                  className="mt-6 w-full py-3 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-bright transition-all text-center border border-white/[0.08]"
                >
                  Schedule Institutional Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION FINAL BANNER */}
        <section className="w-full py-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="relative w-full rounded-3xl bg-gradient-to-br from-surface-container via-surface to-surface-container-high p-8 sm:p-14 lg:p-20 overflow-hidden border border-white/[0.1] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col items-center text-center gap-4">
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary-container/20 rounded-full blur-[120px] pointer-events-none" />
            <span className="font-code-mono text-xs text-tertiary uppercase tracking-widest font-semibold">Empowered by Evidence</span>
            <h2 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface max-w-3xl leading-tight">
              Start with your target JD today. Turn every interview into an offer.
            </h2>
            <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl">
              Upload your resume and the posting you want to land. Our microservices will calculate your exact gap in under 60 seconds.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/jd-analyzer"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-sm sm:text-base font-semibold text-white hover:brightness-110 transition-all shadow-[0_12px_28px_-4px_rgba(128,131,255,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                Analyze My First JD For Free
              </Link>
              <Link
                href="/teams"
                className="px-8 py-4 rounded-xl bg-surface-container-high text-sm sm:text-base font-medium text-on-surface hover:bg-surface-bright transition-all border border-white/[0.08] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px] text-tertiary">support_agent</span>
                Talk to Enterprise Solutions
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 font-code-mono text-xs text-outline">
              <span>• No credit card required</span>
              <span>• SOC2 Type II Encrypted</span>
              <span>• 24/7 Global Availability</span>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
