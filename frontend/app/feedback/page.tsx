"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api";
import {
  Rocket,
  MessageSquare,
  Code2,
  Lightbulb,
  UserRound,
  Award,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

export default function FeedbackPage() {
  const [sessionId, setSessionId] = useState("demo-session-002");
  const [report, setReport] = useState<FeedbackReport["data"]>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReport = async (requestedId = sessionId) => {
    setError("");
    setReport(null);

    if (!requestedId.trim()) {
      setError("Please enter an interview session ID.");
      return;
    }

    setLoading(true);

    const result = await apiGet<FeedbackReport>(
      `/api/feedback/${encodeURIComponent(requestedId.trim())}`
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
    const requestedId = new URLSearchParams(window.location.search).get("session")?.trim();
    if (requestedId) setSessionId(requestedId);
    void loadReport(requestedId || undefined);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              PrepPilot
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* Page heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Interview Performance
              </h1>
              <p className="mt-1 text-muted-foreground">
                Your AI-generated interview feedback and performance report.
              </p>
            </div>
          </div>
        </div>

        {/* Session selector */}
        <Card className="mb-6">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserRound className="h-5 w-5 text-primary" />
              </div>

              <div>
                <CardTitle>Interview Session</CardTitle>
                <CardDescription>
                  View the performance report generated for your interview.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter interview session ID"
                className="bg-background"
              />

              <Button onClick={() => void loadReport()} disabled={loading}>
                {loading ? "Loading..." : "View Report"}
              </Button>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Your report is generated from the results of your interview.
            </p>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Report */}
        {report && (
          <div className="space-y-6">
            {/* Overall score */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-7 w-7 text-primary" />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Overall Interview Score
                  </p>

                  <p className="mt-1 text-5xl font-bold">
                    {report.overall_score}
                    <span className="text-2xl text-muted-foreground">
                      /5
                    </span>
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Session: {report.session_id}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Category scores */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
                <CardDescription>
                  Your performance across the key interview areas.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <p className="font-medium">Communication</p>
                    </div>

                    <p className="text-3xl font-bold">
                      {report.communication_score}
                      <span className="text-base font-normal text-muted-foreground">
                        /5
                      </span>
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Clarity, confidence and communication.
                    </p>
                  </div>

                  <div className="rounded-lg border p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-primary" />
                      <p className="font-medium">Technical Knowledge</p>
                    </div>

                    <p className="text-3xl font-bold">
                      {report.technical_score}
                      <span className="text-base font-normal text-muted-foreground">
                        /5
                      </span>
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Technical understanding and accuracy.
                    </p>
                  </div>

                  <div className="rounded-lg border p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <p className="font-medium">Problem Solving</p>
                    </div>

                    <p className="text-3xl font-bold">
                      {report.problem_solving_score}
                      <span className="text-base font-normal text-muted-foreground">
                        /5
                      </span>
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Logical thinking and approach to problems.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <CardTitle>Strengths</CardTitle>
                    <CardDescription>
                      Areas where you performed well.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {report.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border p-4"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <p className="text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Areas for improvement */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <CardTitle>Areas for Improvement</CardTitle>
                    <CardDescription>
                      Suggestions to help you perform better in future
                      interviews.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {report.areas_for_improvement.map((area, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border p-4"
                    >
                      <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <p className="text-sm">{area}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI recommendation */}
            {report.recommendation && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                      <CardTitle>AI Recommendation</CardTitle>
                      <CardDescription>
                        Personalized guidance based on your interview
                        performance.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="rounded-lg border bg-muted/20 p-5">
                    <p className="text-sm leading-6">
                      {report.recommendation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interview comments */}
            {report.comments && (
              <Card>
                <CardHeader>
                  <CardTitle>Interview Summary</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {report.comments}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
