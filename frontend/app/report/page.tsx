"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

export default function ReadinessReportPage() {
  const [feedbackScore, setFeedbackScore] = useState<number | null>(4.3);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet<any>("/api/feedback/demo-session-002").then((res) => {
      const payload = res.data?.data || res.data;
      if (payload?.overall_score) {
        setFeedbackScore(payload.overall_score);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-32 pb-12 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-white/[0.08] w-fit">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="font-code-mono text-xs text-tertiary uppercase tracking-wider">
              Microservice 04 • Unified Readiness Index
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Authoritative Candidate Readiness Report
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            Consolidating real-time ATS keyword matching, AI proctored mock interview diagnostics, and verified human mentor evaluations into a single offer-readiness composite.
          </p>
        </div>

        {/* Score Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container rounded-2xl p-6 border border-white/[0.08] flex flex-col gap-2 shadow-xl">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider font-code-mono">
              ATS Compatibility Index
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">88</span>
              <span className="text-sm text-outline">/ 100 (Grade A)</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Parsed via 4-pillar deterministic engine. High keyword density for Staff & Principal roles.
            </p>
            <Link
              href="/resume"
              className="mt-4 text-xs text-primary hover:underline flex items-center gap-1"
            >
              View Full ATS Diagnostic &rarr;
            </Link>
          </div>

          <div className="bg-surface-container rounded-2xl p-6 border border-white/[0.08] flex flex-col gap-2 shadow-xl">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider font-code-mono">
              AI Mock Bar-Raiser Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-secondary">{feedbackScore || 4.2}</span>
              <span className="text-sm text-outline">/ 5.0 (Passed)</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Calibrated against partition skew, distributed locks, and dynamic rate-limiting loops.
            </p>
            <Link
              href="/feedback"
              className="mt-4 text-xs text-secondary hover:underline flex items-center gap-1"
            >
              Open Interview Rubric & Feedback &rarr;
            </Link>
          </div>

          <div className="bg-surface-container rounded-2xl p-6 border border-white/[0.08] flex flex-col gap-2 shadow-xl">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider font-code-mono">
              Live Mentor Verification
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-tertiary">Verified</span>
              <span className="text-sm text-outline">FAANG Ready</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Endorsed by Alex Rivera (Principal Architect) for L6/L7 Distributed Infrastructure rounds.
            </p>
            <Link
              href="/mentors"
              className="mt-4 text-xs text-tertiary hover:underline flex items-center gap-1"
            >
              Book Follow-up Calibration &rarr;
            </Link>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-surface-container-high rounded-2xl p-6 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-on-surface">
              Ready to practice another interview round?
            </h3>
            <p className="text-xs text-on-surface-variant">
              Generate dynamic interview follow-ups tailored to your target job posting.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/mock-interview"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-xs font-semibold text-white shadow-md hover:brightness-110 transition-all"
            >
              Start New AI Mock
            </Link>
            <Link
              href="/jd-analyzer"
              className="px-5 py-2.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface border border-white/[0.08] hover:bg-surface-bright transition-all"
            >
              Switch Target JD
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
