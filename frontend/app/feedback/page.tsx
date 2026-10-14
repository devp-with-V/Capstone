"use client";

import { useEffect, useState } from "react";
import { PageShell, ObsidianCard } from "@/components/layout/PageShell";
import { apiGet } from "@/lib/api";

type FeedbackReport = {
  data: {
    id: string;
    session_id: string;
    communication_score: number;
    technical_score: number;
    problem_solving_score: number;
    comments: string | null;
    authored_by: string;
    overall_score: number;
    strengths: string[];
    areas_for_improvement: string[];
    recommendation: string | null;
  } | null;
  error: {
    message: string;
  } | null;
};

const INPUT_CLASS =
  "w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary";
const PRIMARY_BTN =
  "px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-sm font-semibold text-white hover:brightness-110 transition-all disabled:opacity-40";

export default function FeedbackPage() {
  const [sessionId, setSessionId] = useState("");
  const [report, setReport] = useState<FeedbackReport["data"]>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReport = async (id?: string) => {
    const lookupId = (id ?? sessionId).trim();
    setError("");
    setReport(null);

    if (!lookupId) {
      setError("Please enter an interview session ID.");
      return;
    }

    setLoading(true);

    const result = await apiGet<FeedbackReport>(
      `/api/feedback/${lookupId}`
    );

    if (result.error) {
      setError(result.error);
    } else {
      const reportPayload = (result.data as any)?.data || result.data;
      if (reportPayload && reportPayload.overall_score !== undefined) {
        setReport(reportPayload);
      } else if ((result.data as any)?.error) {
        setError((result.data as any).error.message || "Failed to load report");
      } else {
        setError("No feedback report was found for this session.");
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    // Deep link from a finished AI interview: /feedback?sessionId=<ai-session-id>
    const q = new URLSearchParams(window.location.search).get("sessionId");
    if (q && q.trim()) {
      setSessionId(q.trim());
      loadReport(q.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell
      eyebrow="Feedback // Session Report"
      title="Interview Performance"
      description="Your AI-generated interview feedback and performance report."
      icon="forum"
      wide
    >
      {/* Session selector */}
      <ObsidianCard>
        <div className="flex items-center gap-3 mb-5">
          <span className="material-symbols-outlined text-primary text-[22px]">
            person
          </span>
          <div>
            <h2 className="text-base font-semibold text-on-surface">
              Interview Session
            </h2>
            <p className="text-sm text-on-surface-variant">
              View the performance report generated for your interview.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Enter interview session ID"
            className={INPUT_CLASS}
          />
          <button
            onClick={() => loadReport()}
            disabled={loading}
            className={`${PRIMARY_BTN} shrink-0`}
          >
            {loading ? "Loading..." : "View Report"}
          </button>
        </div>
        <p className="mt-2 text-xs text-outline">
          Your report is generated from the results of your interview.
        </p>
      </ObsidianCard>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-sm">
          {error}
        </div>
      )}

      {/* Report */}
      {report && (
        <div className="space-y-6">
          {/* Overall score hero */}
          <ObsidianCard className="text-center">
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-primary text-[40px] mb-3">
                workspace_premium
              </span>
              <p className="font-code-mono text-[11px] text-outline uppercase">
                Overall Interview Score
              </p>
              <p className="mt-1 text-5xl font-bold text-on-surface">
                {report.overall_score}
                <span className="text-2xl text-outline">/5</span>
              </p>
              <p className="mt-2 font-code-mono text-xs text-outline">
                Session: {report.session_id}
              </p>
            </div>
          </ObsidianCard>

          {/* Category scores */}
          <ObsidianCard>
            <h2 className="text-base font-semibold text-on-surface">
              Performance Breakdown
            </h2>
            <p className="text-sm text-on-surface-variant mb-5">
              Your performance across the key interview areas.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-xl bg-surface-container-high border border-white/[0.04]">
                <div className="mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    record_voice_over
                  </span>
                  <p className="text-sm font-medium text-on-surface">
                    Communication
                  </p>
                </div>
                <p className="text-3xl font-bold text-on-surface">
                  {report.communication_score}
                  <span className="text-base font-normal text-outline">/5</span>
                </p>
                <p className="mt-2 font-code-mono text-[11px] text-outline uppercase">
                  Clarity &amp; confidence
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-high border border-white/[0.04]">
                <div className="mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    code
                  </span>
                  <p className="text-sm font-medium text-on-surface">
                    Technical Knowledge
                  </p>
                </div>
                <p className="text-3xl font-bold text-on-surface">
                  {report.technical_score}
                  <span className="text-base font-normal text-outline">/5</span>
                </p>
                <p className="mt-2 font-code-mono text-[11px] text-outline uppercase">
                  Understanding &amp; accuracy
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-high border border-white/[0.04]">
                <div className="mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    psychology
                  </span>
                  <p className="text-sm font-medium text-on-surface">
                    Problem Solving
                  </p>
                </div>
                <p className="text-3xl font-bold text-on-surface">
                  {report.problem_solving_score}
                  <span className="text-base font-normal text-outline">/5</span>
                </p>
                <p className="mt-2 font-code-mono text-[11px] text-outline uppercase">
                  Logic &amp; approach
                </p>
              </div>
            </div>
          </ObsidianCard>

          {/* Strengths */}
          <ObsidianCard>
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-tertiary text-[22px]">
                check_circle
              </span>
              <div>
                <h2 className="text-base font-semibold text-on-surface">
                  Strengths
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Areas where you performed well.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {report.strengths.map((strength, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl bg-surface-container-low border border-white/[0.08] p-4"
                >
                  <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5 shrink-0">
                    check_circle
                  </span>
                  <p className="text-sm text-on-surface">{strength}</p>
                </div>
              ))}
            </div>
          </ObsidianCard>

          {/* Areas for improvement */}
          <ObsidianCard>
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-primary text-[22px]">
                trending_up
              </span>
              <div>
                <h2 className="text-base font-semibold text-on-surface">
                  Areas for Improvement
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Suggestions to help you perform better in future interviews.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {report.areas_for_improvement.map((area, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl bg-surface-container-low border border-white/[0.08] p-4"
                >
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">
                    trending_up
                  </span>
                  <p className="text-sm text-on-surface">{area}</p>
                </div>
              ))}
            </div>
          </ObsidianCard>

          {/* AI recommendation */}
          {report.recommendation && (
            <ObsidianCard>
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-secondary text-[22px]">
                  sparkles
                </span>
                <div>
                  <h2 className="text-base font-semibold text-on-surface">
                    AI Recommendation
                  </h2>
                  <p className="text-sm text-on-surface-variant">
                    Personalized guidance based on your interview performance.
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-surface-container-low border border-white/[0.08] p-5">
                <p className="text-sm leading-6 text-on-surface">
                  {report.recommendation}
                </p>
              </div>
            </ObsidianCard>
          )}

          {/* Interview comments */}
          {report.comments && (
            <ObsidianCard>
              <h2 className="text-base font-semibold text-on-surface mb-3">
                Interview Summary
              </h2>
              <p className="text-sm leading-6 text-on-surface-variant">
                {report.comments}
              </p>
            </ObsidianCard>
          )}
        </div>
      )}
    </PageShell>
  );
}
