"use client";

import Link from "next/link";
import { useState } from "react";

interface CuratedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  tags: string[];
  descriptionSnippet: string;
}

const SAMPLE_JOBS: CuratedJob[] = [
  {
    id: "job-1",
    title: "Staff Distributed Systems Engineer",
    company: "Stripe",
    location: "Remote (US)",
    salary: "$240k - $320k",
    matchScore: 94,
    tags: ["Kafka", "Distributed Ledger", "PostgreSQL", "Go"],
    descriptionSnippet: "Architect hyper-scale ledger infrastructure processing over $1T annually with zero-loss partition tolerance.",
  },
  {
    id: "job-2",
    title: "Senior ML Infrastructure Engineer",
    company: "OpenAI",
    location: "San Francisco, CA",
    salary: "$260k - $340k",
    matchScore: 89,
    tags: ["PyTorch", "CUDA", "GPU Clusters", "Distributed Training"],
    descriptionSnippet: "Build high-throughput LLM serving clusters, optimizing memory bandwidth and model parallel shard synchronization.",
  },
  {
    id: "job-3",
    title: "Principal Cloud Architect (L7)",
    company: "Amazon Web Services",
    location: "Seattle, WA / Remote",
    salary: "$280k - $370k",
    matchScore: 91,
    tags: ["AWS Core", "System Design", "Multi-Region", "SRE"],
    descriptionSnippet: "Lead cross-organizational Bar-Raiser reviews and design resilient multi-region cell architectures for Tier-0 services.",
  },
  {
    id: "job-4",
    title: "Senior Backend Engineer (Platform)",
    company: "Figma",
    location: "San Francisco, CA / Remote",
    salary: "$190k - $250k",
    matchScore: 86,
    tags: ["Rust", "TypeScript", "CRDTs", "WebSockets"],
    descriptionSnippet: "Scale collaborative multiplayer engine handling concurrent document state synchronization for millions of daily creators.",
  },
];

export default function JobsPage() {
  const [search, setSearch] = useState("");

  const filtered = SAMPLE_JOBS.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-32 pb-12 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-white/[0.08] w-fit">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-code-mono text-xs text-primary uppercase tracking-wider">
              Microservice 05 • Curated Jobs & Matcher
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Target Job Matcher & Openings
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            Curated high-signal engineering openings. Benchmark your resume against real JDs and immediately launch tailored AI mock interviews.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search openings by title, company, or technical stack..."
            className="w-full bg-surface-container text-on-surface pl-11 pr-4 py-3 rounded-xl border border-white/[0.08] text-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Job Cards */}
        <div className="flex flex-col gap-4">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="bg-surface-container rounded-2xl p-6 border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg hover:border-primary/40 transition-all"
            >
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {job.company}
                  </span>
                  <span className="text-xs text-outline font-mono">
                    {job.location}
                  </span>
                  <span className="text-xs font-semibold text-tertiary font-mono ml-auto md:ml-0">
                    {job.salary}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-on-surface">
                  {job.title}
                </h3>
                <p className="text-xs text-on-surface-variant line-clamp-2">
                  {job.descriptionSnippet}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-high text-[11px] text-on-surface-variant border border-white/[0.04]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-semibold border border-tertiary/20">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  {job.matchScore}% Match
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto mt-2">
                  <Link
                    href={`/mock-interview`}
                    className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-xs font-semibold text-white shadow hover:brightness-110 transition-all text-center"
                  >
                    Practice Role
                  </Link>
                  <Link
                    href="/jd-analyzer"
                    className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-on-surface border border-white/[0.08] transition-all text-center"
                  >
                    Analyze JD
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
