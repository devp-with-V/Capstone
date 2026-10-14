"use client";

import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest text-on-surface-variant py-14 border-t border-white/[0.04]">
      <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col gap-10">
        <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-surface text-[18px]">
                rocket_launch
              </span>
            </div>
            <span className="font-bold text-base text-on-surface">
              PrepPilot Platform Matrix
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-white/[0.06]">
              <span className="material-symbols-outlined text-tertiary text-[14px]">
                verified_user
              </span>
              <span className="text-xs text-on-surface">SOC2 Type II</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-white/[0.06]">
              <span className="material-symbols-outlined text-secondary text-[14px]">
                hub
              </span>
              <span className="text-xs text-on-surface">ATS Ingestion API</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-white/[0.06]">
              <span className="material-symbols-outlined text-primary text-[14px]">
                videocam
              </span>
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
            <span className="font-semibold text-on-surface uppercase tracking-wider mb-1 font-code-mono">
              Candidate Services
            </span>
            <Link href="/resume" className="hover:text-on-surface transition-colors">
              ATS Resume Review
            </Link>
            <Link href="/mock-interview" className="hover:text-on-surface transition-colors">
              AI Mock Simulation
            </Link>
            <Link href="/mentors" className="hover:text-on-surface transition-colors">
              Verified Mentors
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-on-surface uppercase tracking-wider mb-1 font-code-mono">
              Intelligence &amp; Jobs
            </span>
            <Link href="/report" className="hover:text-on-surface transition-colors">
              Readiness Index &amp; Radar
            </Link>
            <Link href="/jobs" className="hover:text-on-surface transition-colors">
              Live Job Matching
            </Link>
            <Link href="/jd-analyzer" className="hover:text-on-surface transition-colors">
              JD Blueprint Designer
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-on-surface uppercase tracking-wider mb-1 font-code-mono">
              Enterprise &amp; Trust
            </span>
            <Link href="/teams" className="hover:text-on-surface transition-colors">
              Institutional Teams OS
            </Link>
            <Link href="/report" className="hover:text-on-surface transition-colors">
              FERPA &amp; GDPR Policies
            </Link>
            <Link href="/report" className="hover:text-on-surface transition-colors">
              Security Whitepaper
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-on-surface uppercase tracking-wider mb-1 font-code-mono">
              Platform Status
            </span>
            <div className="flex items-center gap-2 text-tertiary font-code-mono">
              <span className="w-2 h-2 rounded-full bg-tertiary" />
              All Services Operational
            </div>
            <span className="text-outline text-[11px] font-code-mono">
              Global Edge Latency: ~18ms
            </span>
          </div>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-outline border-t border-white/[0.04]">
          <p>© 2025–2026 PrepPilot AI &amp; Mentor Matrix Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-on-surface transition-colors">
              Privacy Architecture
            </Link>
            <Link href="#" className="hover:text-on-surface transition-colors">
              Security Whitepaper
            </Link>
            <Link href="#" className="hover:text-on-surface transition-colors">
              System Telemetry
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
