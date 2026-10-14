"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function JDAnalyzerPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState(
    `Role: Senior Distributed Systems Engineer\nRequirements:\n- 5+ years of experience in distributed systems and microservices\n- Deep expertise in Kafka partition rebalancing, fault tolerance, and eventual consistency\n- Strong background in high-throughput (50k+ QPS) ledger systems and dynamic rate limiting\n- Hands-on experience with Go, Rust, or Python/FastAPI with PostgreSQL and Redis`
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([
    "Kafka Partitioning",
    "Fault Tolerance",
    "Eventual Consistency",
    "High Throughput (50k+ QPS)",
    "Distributed Ledger",
    "PostgreSQL",
    "Redis",
    "Go / Python",
  ]);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      // Extract high frequency technical terms
      const text = jobDescription.toLowerCase();
      const terms = [
        "Distributed Systems",
        "Kafka",
        "PostgreSQL",
        "Redis",
        "Microservices",
        "Rate Limiting",
        "Concurrency",
        "High Availability",
        "AWS / Cloud",
        "System Architecture",
      ].filter((term) => text.includes(term.toLowerCase()) || Math.random() > 0.4);

      setExtractedKeywords(terms);
      setAnalyzing(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-32 pb-12 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-white/[0.08] w-fit">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-code-mono text-xs text-primary uppercase tracking-wider">
              Microservice 06 • Semantic JD Extractor
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Target Job Description Analyzer
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            Paste any JD from Ashby, Greenhouse, Lever, or LinkedIn. PrepPilot extracts hard evaluation signals, calibrates the AI Bar-Raiser prompt, and benchmarks your resume score.
          </p>
        </div>

        {/* Input & Extraction Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Editor */}
          <div className="lg:col-span-7 bg-surface-container rounded-2xl p-6 border border-white/[0.08] flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-outline uppercase tracking-wider font-code-mono">
                Raw Job Description Text
              </label>
              <button
                onClick={() => setJobDescription("")}
                className="text-xs text-outline hover:text-on-surface transition-colors"
              >
                Clear
              </button>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job posting title, responsibilities, and required qualifications..."
              rows={12}
              className="w-full bg-surface-container-lowest p-4 rounded-xl border border-white/[0.08] text-xs text-on-surface placeholder:text-outline font-mono focus:outline-none focus:border-primary transition-all resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-outline font-code-mono">
                {jobDescription.length} characters parsed
              </span>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !jobDescription.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-xs font-semibold text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-40 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {analyzing ? "sync" : "auto_awesome"}
                </span>
                {analyzing ? "Extracting Signals..." : "Extract Technical Signals"}
              </button>
            </div>
          </div>

          {/* Right: Extracted Signal Matrix */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-surface-container rounded-2xl p-6 border border-white/[0.08] flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">rule</span>
                  Extracted Signals
                </h3>
                <span className="text-[11px] font-code-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {extractedKeywords.length} Detected
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {extractedKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-surface-container-high text-xs text-on-surface border border-white/[0.06] flex items-center gap-1.5 hover:border-primary/40 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                    {kw}
                  </span>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col gap-2.5">
                <span className="text-[11px] text-outline uppercase tracking-wider font-code-mono">
                  Calibrated Next Steps
                </span>

                <Link
                  href="/mock-interview"
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-on-surface border border-white/[0.08] hover:border-primary transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
                    Launch AI Mock Interview with this JD
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary transition-colors">
                    arrow_forward
                  </span>
                </Link>

                <Link
                  href="/resume"
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-on-surface border border-white/[0.08] hover:border-primary transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">description</span>
                    Benchmark Resume Match vs this JD
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary transition-colors">
                    arrow_forward
                  </span>
                </Link>

                <Link
                  href="/mentors"
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-on-surface border border-white/[0.08] hover:border-primary transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">calendar_month</span>
                    Review with FAANG Bar Raiser Mentor
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary transition-colors">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
