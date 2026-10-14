"use client";

import Link from "next/link";
import { useState } from "react";

export default function TeamsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-32 pb-12 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-white/[0.08] w-fit">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="font-code-mono text-xs text-tertiary uppercase tracking-wider">
              Microservice 07 • Institutional & Campus OS
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Institutional Placement Matrix & Teams OS
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            Empower university engineering cohorts, bootcamps, and career accelerators with batch candidate interview readiness heatmaps, automated rubric delivery, and enterprise LMS integrations.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container rounded-2xl p-6 border border-white/[0.08] flex flex-col gap-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">bar_chart</span>
            </div>
            <h3 className="text-base font-bold text-on-surface">Cohort Heatmaps</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Identify aggregate technical deficiencies across data structures, system design, and communication before campus placement rounds begin.
            </p>
          </div>

          <div className="bg-surface-container rounded-2xl p-6 border border-white/[0.08] flex flex-col gap-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[22px]">groups</span>
            </div>
            <h3 className="text-base font-bold text-on-surface">Batch Mentor Slots</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Provision private mentor pools with verified FAANG+ leaders dedicated to your university cohort or department track.
            </p>
          </div>

          <div className="bg-surface-container rounded-2xl p-6 border border-white/[0.08] flex flex-col gap-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[22px]">api</span>
            </div>
            <h3 className="text-base font-bold text-on-surface">LMS Webhook Integrations</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Seamlessly sync candidate mock performance scores, transcripts, and 4-pillar rubrics back into Canvas, Blackboard, or internal HR tools.
            </p>
          </div>
        </div>

        {/* Institutional Demo Request Card */}
        <div className="bg-surface-container-high rounded-2xl p-8 border border-white/[0.08] max-w-2xl mx-auto w-full shadow-2xl flex flex-col gap-4">
          <h2 className="text-xl font-bold text-on-surface">
            Request an Institutional Pilot
          </h2>
          <p className="text-xs text-on-surface-variant">
            Join 30+ university career centers and accelerated engineering cohorts preparing candidates on PrepPilot.
          </p>

          {submitted ? (
            <div className="p-4 rounded-xl bg-tertiary/10 border border-tertiary/30 text-xs text-tertiary flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Thank you! Our engineering partnership lead will contact you within 24 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-outline font-medium">Institution or Organization</label>
                <input
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Stanford Career Center, General Assembly"
                  className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-white/[0.08] text-xs focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-outline font-medium">Work / University Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="placement-lead@institution.edu"
                  className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-white/[0.08] text-xs focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-xs font-semibold text-white shadow hover:brightness-110 transition-all"
              >
                Schedule Campus Demo & Ingestion Walkthrough
              </button>
            </form>
          )}

          <div className="pt-2 text-center">
            <Link href="/" className="text-xs text-outline hover:text-on-surface transition-colors">
              &larr; Return to PrepPilot Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
