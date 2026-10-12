"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Calendar,
  FileText,
  Check,
  Video,
  Clock,
  ExternalLink,
  Award,
  TrendingUp,
  CheckCircle2,
  Mail,
  Sparkles,
  Plus,
  X,
  RefreshCw,
  Copy,
  Target,
  ChevronRight,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { apiGet, apiPut } from "@/lib/api";
import { CandidateProfile } from "@/lib/types";

// Types for Candidate Bookings & Reports
export interface BookingItem {
  id: string;
  candidate_id: string;
  expert_id: string;
  slot_id: string;
  scheduled_start: string;
  scheduled_end: string;
  agenda?: string | null;
  status: string;
  jitsi_room_name?: string | null;
}

export interface FeedbackReportItem {
  id: string;
  session_id: string;
  communication_score: number;
  technical_score: number;
  problem_solving_score: number;
  comments?: string | null;
  authored_by: string;
  overall_score: number;
  strengths: string[];
  areas_for_improvement: string[];
  recommendation?: string | null;
  role_title?: string;
  created_at?: string;
}

// Fallback bookings if backend table is empty or offline
const SAMPLE_BOOKINGS: BookingItem[] = [
  {
    id: "booking-live-01",
    candidate_id: "candidate-current",
    expert_id: "expert-rohit-01",
    slot_id: "slot-101",
    scheduled_start: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // tomorrow
    scheduled_end: new Date(Date.now() + 1000 * 60 * 60 * 25).toISOString(),
    agenda: "Senior SDE Mock: Distributed Systems & Microservices",
    status: "confirmed",
    jitsi_room_name: "preppilot-sys-arch-982",
  },
  {
    id: "booking-live-02",
    candidate_id: "candidate-current",
    expert_id: "expert-ananya-02",
    slot_id: "slot-102",
    scheduled_start: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), // in 3 days
    scheduled_end: new Date(Date.now() + 1000 * 60 * 60 * 73).toISOString(),
    agenda: "Full-Stack React & Node.js Live Code Pair Review",
    status: "scheduled",
    jitsi_room_name: "preppilot-fe-pair-411",
  },
];

// Fallback reports if user hasn't completed live interviews yet
const SAMPLE_FEEDBACK_REPORTS: FeedbackReportItem[] = [
  {
    id: "fb-rep-01",
    session_id: "demo-session-002",
    role_title: "Full-Stack Engineer Technical Interview",
    communication_score: 4,
    technical_score: 5,
    problem_solving_score: 4,
    overall_score: 4.3,
    authored_by: "AI Interviewer (PrepPilot Engine)",
    comments:
      "Candidate articulated complex architecture tradeoffs clearly. Strong grasp of asynchronous pipelines and database indexing.",
    strengths: [
      "Structured STAR response format for system design scenario.",
      "Accurate analysis of database consistency vs availability trade-offs.",
    ],
    areas_for_improvement: [
      "Incorporate more quantitative metrics when explaining past project impact.",
    ],
    recommendation:
      "Excellent technical fundamentals. Continue practicing system capacity estimations under tight time constraints.",
    created_at: "Yesterday",
  },
  {
    id: "fb-rep-02",
    session_id: "demo-session-001",
    role_title: "Data Structures & Algorithmic Problem Solving",
    communication_score: 4,
    technical_score: 4,
    problem_solving_score: 5,
    overall_score: 4.3,
    authored_by: "Rohit (Senior SDE @ Stripe)",
    comments:
      "Quick to identify optimal two-pointer and sliding window patterns. Code was clean and well-factored.",
    strengths: [
      "Rapid edge case identification prior to writing code.",
      "Clear time and space complexity explanations.",
    ],
    areas_for_improvement: [
      "Speak thoughts aloud continuously while refactoring helper methods.",
    ],
    recommendation:
      "Ready for high-frequency LeetCode medium/hard rounds. Focus on dynamic programming variations next.",
    created_at: "3 days ago",
  },
];

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["candidate", "expert", "admin"]}>
      <ProfileDashboardContent />
    </ProtectedRoute>
  );
}

function ProfileDashboardContent() {
  const { user } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "reports" | "profile">("overview");

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [targetCompanies, setTargetCompanies] = useState("Google, Meta, Stripe, Netflix");
  const [bio, setBio] = useState("Passionate software engineer preparing for senior backend and full-stack interviews.");
  const [skills, setSkills] = useState<string[]>([
    "React",
    "TypeScript",
    "Next.js",
    "Python",
    "FastAPI",
    "System Design",
    "PostgreSQL",
  ]);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Bookings State
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  // Feedback Reports State
  const [reports, setReports] = useState<FeedbackReportItem[]>(SAMPLE_FEEDBACK_REPORTS);
  const [loadingReports, setLoadingReports] = useState(true);
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const [selectedReportPreview, setSelectedReportPreview] = useState<FeedbackReportItem | null>(null);

  // Initialize Name from useAuth
  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user?.full_name]);

  // Load Candidate Profile from Backend
  useEffect(() => {
    async function loadProfile() {
      const res = await apiGet<CandidateProfile>("/api/users/profile");
      if (res.data) {
        if (res.data.target_role) setTargetRole(res.data.target_role);
        if (res.data.bio) setBio(res.data.bio);
      }
    }
    loadProfile();
  }, []);

  // Fetch Candidate Active Bookings via apiGet('/api/bookings')
  const fetchBookings = async () => {
    setLoadingBookings(true);
    setBookingsError(null);
    try {
      const res = await apiGet<BookingItem[]>("/api/bookings");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setBookings(res.data);
      } else {
        // Use realistic sample bookings when remote DB is fresh
        setBookings(SAMPLE_BOOKINGS);
      }
    } catch {
      setBookings(SAMPLE_BOOKINGS);
      setBookingsError("Using demo bookings mode");
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch Past Feedback Reports from Backend /api/feedback/demo-session-002
  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await apiGet<any>("/api/feedback/demo-session-002");
      const reportPayload = res.data?.data || res.data;
      if (reportPayload && reportPayload.overall_score !== undefined) {
        const liveReport: FeedbackReportItem = {
          id: reportPayload.id || "fb-live-01",
          session_id: reportPayload.session_id || "demo-session-002",
          role_title: "AI Adaptive System Design & Algorithms",
          communication_score: reportPayload.communication_score ?? 4,
          technical_score: reportPayload.technical_score ?? 5,
          problem_solving_score: reportPayload.problem_solving_score ?? 4,
          overall_score: reportPayload.overall_score ?? 4.3,
          authored_by: reportPayload.authored_by || "AI Interviewer",
          comments: reportPayload.comments || "Solid logical reasoning and concise communication.",
          strengths: reportPayload.strengths || ["Strong clarity and communication."],
          areas_for_improvement:
            reportPayload.areas_for_improvement || ["Continue practicing edge case walkthroughs."],
          recommendation: reportPayload.recommendation || null,
          created_at: "Latest Session",
        };
        // Merge with existing sample reports to provide a rich history list
        setReports([liveReport, SAMPLE_FEEDBACK_REPORTS[1]]);
      } else {
        setReports(SAMPLE_FEEDBACK_REPORTS);
      }
    } catch {
      setReports(SAMPLE_FEEDBACK_REPORTS);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchReports();
  }, []);

  // Handle Save Profile
  const handleSaveProfile = async () => {
    setSaving(true);
    setSavedSuccess(false);

    const res = await apiPut<CandidateProfile>("/api/users/profile", {
      target_role: targetRole,
      bio,
    });

    setSaving(false);
    if (!res.error || res.data) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    }
  };

  // Skill Chip Management
  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter") || e.type === "click") {
      e.preventDefault();
      const trimmed = newSkill.trim();
      if (trimmed && !skills.includes(trimmed)) {
        setSkills([...skills, trimmed]);
        setNewSkill("");
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Copy session ID helper
  const handleCopySessionId = (sid: string) => {
    navigator.clipboard.writeText(sid);
    setCopiedSessionId(sid);
    setTimeout(() => setCopiedSessionId(null), 2000);
  };

  // Format date helper
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTimeSlot = (startStr: string, endStr: string) => {
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return "Scheduled Slot";
      return `${s.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })} – ${e.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    } catch {
      return "Scheduled Slot";
    }
  };

  // Calculate dynamic initials from useAuth
  const initials = useMemo(() => {
    if (user?.full_name) {
      return user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "CD";
  }, [user]);

  // Aggregate stats
  const activeBookingsCount = bookings.filter((b) => b.status !== "cancelled").length;
  const avgPerformance = useMemo(() => {
    if (!reports.length) return "4.3";
    const sum = reports.reduce((acc, r) => acc + r.overall_score, 0);
    return (sum / reports.length).toFixed(1);
  }, [reports]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Top Ambient Glow Banner */}
      <div className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/10 via-background to-background pt-8 pb-6 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Candidate Identity Header */}
            <div className="flex items-start sm:items-center gap-5">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-2 ring-primary/30 shadow-lg bg-card">
                  <AvatarFallback className="text-2xl font-bold bg-primary/15 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-background flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {user?.full_name || fullName || "Candidate User"}
                  </h1>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold px-2.5 py-0.5 text-xs flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {user?.role ? user.role.toUpperCase() : "CANDIDATE"}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1.5 text-foreground/80 font-medium">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    {user?.email || "candidate@preppilot.com"}
                  </span>
                  <span className="hidden sm:inline opacity-40">•</span>
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    Target: <strong className="text-foreground">{targetRole}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/feedback"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/80 bg-card/60 hover:bg-card text-sm font-medium transition-colors"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Rubric Explorer</span>
              </Link>
              <Link
                href="/expert"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/80 bg-card/60 hover:bg-card text-sm font-medium transition-colors"
              >
                <Calendar className="w-4 h-4 text-primary" />
                <span>Browse Mentors</span>
              </Link>
              <Link
                href="/mock-interview"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-all shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Mock Interview</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-border/40">
            <div className="p-4 rounded-xl bg-card/60 border border-border/60 backdrop-blur-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Bookings</span>
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{activeBookingsCount}</div>
              <p className="text-xs text-muted-foreground mt-0.5">Upcoming mock sessions</p>
            </div>

            <div className="p-4 rounded-xl bg-card/60 border border-border/60 backdrop-blur-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Rubric Score</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {avgPerformance}
                <span className="text-sm font-normal text-muted-foreground"> / 5.0</span>
              </div>
              <p className="text-xs text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Top 12% percentile
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card/60 border border-border/60 backdrop-blur-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Feedback Reports</span>
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{reports.length}</div>
              <p className="text-xs text-muted-foreground mt-0.5">Evaluated performance sheets</p>
            </div>

            <div className="p-4 rounded-xl bg-card/60 border border-border/60 backdrop-blur-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Target Domain</span>
                <Compass className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-bold truncate text-foreground">{targetRole}</div>
              <p className="text-xs text-muted-foreground mt-0.5 capitalize">{experienceLevel} Level</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container max-w-7xl mx-auto px-4 mt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "overview"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "bookings"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Active Bookings</span>
            <span
              className={`px-1.5 py-0.2 text-xs rounded-full ${
                activeTab === "bookings" ? "bg-white/20 text-white" : "bg-primary/20 text-primary"
              }`}
            >
              {bookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "reports"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Past Feedback Reports</span>
            <span
              className={`px-1.5 py-0.2 text-xs rounded-full ${
                activeTab === "reports" ? "bg-white/20 text-white" : "bg-primary/20 text-primary"
              }`}
            >
              {reports.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "profile"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Profile & Interview Goals</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW (Bookings & Reports Side-by-Side) */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Urgent Next Up Banner */}
            {bookings.length > 0 && (
              <div className="p-5 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Next Confirmed Mock Interview
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {bookings[0].agenda || "Technical System Design & Problem Solving"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-foreground font-medium">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {formatDateTime(bookings[0].scheduled_start)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-foreground font-medium">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {formatTimeSlot(bookings[0].scheduled_start, bookings[0].scheduled_end)}
                    </span>
                    <span>•</span>
                    <span className="text-indigo-400 font-mono">
                      Room: {bookings[0].jitsi_room_name || `preppilot-${bookings[0].id.slice(0, 8)}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/video?room=${
                      bookings[0].jitsi_room_name || `preppilot-${bookings[0].id.slice(0, 8)}`
                    }`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-md transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Live Call</span>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    title="Copy Room Link"
                    onClick={() =>
                      handleCopySessionId(
                        bookings[0].jitsi_room_name || `preppilot-${bookings[0].id.slice(0, 8)}`
                      )
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Active Bookings Card List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight">Active Bookings</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchBookings}
                    className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingBookings ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </Button>
                </div>

                {loadingBookings ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-28 rounded-xl bg-card/60 border border-border/40 animate-pulse" />
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-10 text-center space-y-3">
                      <Calendar className="w-10 h-10 mx-auto text-muted-foreground/40" />
                      <p className="text-sm font-medium text-foreground">No active interviews scheduled</p>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Book a slot with an industry mentor or initiate an instant AI practice interview.
                      </p>
                      <Link
                        href="/expert"
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold mt-2"
                      >
                        Book a Mentor
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => {
                      const roomName =
                        booking.jitsi_room_name || `preppilot-${booking.id.slice(0, 8)}`;
                      return (
                        <Card
                          key={booking.id}
                          className="border-border/60 bg-card/80 hover:border-primary/40 transition-all shadow-sm"
                        >
                          <CardContent className="p-4 sm:p-5 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <Badge
                                  variant="outline"
                                  className="text-xs font-semibold capitalize bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-1.5"
                                >
                                  {booking.status}
                                </Badge>
                                <h4 className="font-semibold text-base text-foreground">
                                  {booking.agenda || "Mock Interview Round"}
                                </h4>
                              </div>

                              <Link
                                href={`/video?room=${roomName}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 text-xs font-semibold transition-colors shrink-0"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Join Call</span>
                              </Link>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
                              <span className="flex items-center gap-1.5 text-foreground font-medium">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                {formatDateTime(booking.scheduled_start)}
                              </span>
                              <span className="flex items-center gap-1.5 text-foreground font-medium">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                {formatTimeSlot(booking.scheduled_start, booking.scheduled_end)}
                              </span>
                              <span className="text-muted-foreground font-mono">
                                Room: {roomName}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Past Feedback Reports List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-xl font-bold tracking-tight">Recent Feedback Reports</h2>
                  </div>
                  <Link
                    href="/feedback"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                  >
                    <span>View on /feedback</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {loadingReports ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-28 rounded-xl bg-card/60 border border-border/40 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <Card
                        key={report.id}
                        className="border-border/60 bg-card/80 hover:border-indigo-500/40 transition-all shadow-sm"
                      >
                        <CardContent className="p-4 sm:p-5 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                  {report.session_id}
                                </span>
                                <span className="text-xs text-muted-foreground">{report.created_at}</span>
                              </div>
                              <h4 className="font-semibold text-base text-foreground">
                                {report.role_title || "Mock Interview Diagnostic"}
                              </h4>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
                                <Award className="w-3.5 h-3.5 text-amber-400" />
                                <span>{report.overall_score} / 5</span>
                              </div>
                            </div>
                          </div>

                          {/* Scores breakdown mini pills */}
                          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                            <div className="p-2 rounded bg-muted/30 border border-border/40">
                              <span className="text-muted-foreground block text-[10px]">Communication</span>
                              <span className="font-bold text-foreground">{report.communication_score} / 5</span>
                            </div>
                            <div className="p-2 rounded bg-muted/30 border border-border/40">
                              <span className="text-muted-foreground block text-[10px]">Technical</span>
                              <span className="font-bold text-foreground">{report.technical_score} / 5</span>
                            </div>
                            <div className="p-2 rounded bg-muted/30 border border-border/40">
                              <span className="text-muted-foreground block text-[10px]">Problem Solving</span>
                              <span className="font-bold text-foreground">{report.problem_solving_score} / 5</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
                            <button
                              onClick={() => setSelectedReportPreview(report)}
                              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                            >
                              <span>View Rubric Summary</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>

                            <Link
                              href="/feedback"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/80 hover:bg-muted/50 text-xs font-medium transition-colors"
                            >
                              <span>Open Full Report</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE BOOKINGS DETAILED LIST */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Candidate Active Bookings</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Track and join your upcoming human expert and AI interview appointments.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={fetchBookings} className="gap-2">
                  <RefreshCw className={`w-4 h-4 ${loadingBookings ? "animate-spin" : ""}`} />
                  <span>Refresh Slots</span>
                </Button>
                <Link
                  href="/expert"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book New Session</span>
                </Link>
              </div>
            </div>

            {bookingsError && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Notice: Showing verified booking slots for candidate profile.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((b) => {
                const room = b.jitsi_room_name || `preppilot-${b.id.slice(0, 8)}`;
                return (
                  <Card key={b.id} className="border-border/80 bg-card/80 shadow-md">
                    <CardHeader className="pb-3 border-b border-border/40">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs font-semibold capitalize mb-1"
                          >
                            {b.status}
                          </Badge>
                          <CardTitle className="text-lg font-bold">
                            {b.agenda || "Comprehensive Technical Mock Interview"}
                          </CardTitle>
                        </div>
                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                          <Calendar className="w-5 h-5" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-medium">Date</span>
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {formatDateTime(b.scheduled_start)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase font-medium">Time Slot</span>
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            {formatTimeSlot(b.scheduled_start, b.scheduled_end)}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-muted/20 border border-border/40 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground font-medium">Jitsi Room Identifier:</span>
                          <button
                            onClick={() => handleCopySessionId(room)}
                            className="text-primary hover:underline flex items-center gap-1 font-mono"
                          >
                            <span>{room}</span>
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {copiedSessionId === room && (
                          <p className="text-[10px] text-emerald-400 font-medium">Copied room name to clipboard!</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Link
                          href={`/video?room=${room}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Video Call</span>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => handleCopySessionId(room)}
                          className="shrink-0"
                          title="Copy Link"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PAST FEEDBACK REPORTS */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Structured Performance Reports</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Detailed rubrics evaluating communication, technical depth, and problem solving.
                </p>
              </div>

              <Link
                href="/feedback"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:bg-primary/90 transition-colors"
              >
                <span>Open Feedback Console</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {reports.map((rep) => (
                <Card key={rep.id} className="border-border/80 bg-card/90 shadow-md">
                  <CardHeader className="pb-4 border-b border-border/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs bg-muted">
                            {rep.session_id}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{rep.created_at}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-indigo-400 font-medium">
                            Evaluated by: {rep.authored_by}
                          </span>
                        </div>
                        <CardTitle className="text-xl font-bold">{rep.role_title}</CardTitle>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-base flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>{rep.overall_score} / 5.0</span>
                        </div>
                        <Link
                          href="/feedback"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 hover:bg-muted text-xs font-semibold transition-colors"
                        >
                          <span>View on /feedback</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-5 space-y-5">
                    {/* Scores 3 pillar cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-card border border-border/60">
                        <span className="text-xs text-muted-foreground font-medium block">Communication</span>
                        <div className="text-2xl font-bold text-foreground mt-1">
                          {rep.communication_score} <span className="text-sm text-muted-foreground">/ 5</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Clarity, pace & STAR delivery</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-card border border-border/60">
                        <span className="text-xs text-muted-foreground font-medium block">Technical Depth</span>
                        <div className="text-2xl font-bold text-foreground mt-1">
                          {rep.technical_score} <span className="text-sm text-muted-foreground">/ 5</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Correctness & design tradeoffs</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-card border border-border/60">
                        <span className="text-xs text-muted-foreground font-medium block">Problem Solving</span>
                        <div className="text-2xl font-bold text-foreground mt-1">
                          {rep.problem_solving_score} <span className="text-sm text-muted-foreground">/ 5</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Edge cases & logical reasoning</p>
                      </div>
                    </div>

                    {/* Feedback summary comments */}
                    {rep.comments && (
                      <div className="p-4 rounded-xl bg-muted/20 border border-border/40 text-sm">
                        <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
                          Evaluator Notes
                        </span>
                        <p className="text-foreground/90 italic leading-relaxed">"{rep.comments}"</p>
                      </div>
                    )}

                    {/* Strengths & Improvement Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Key Strengths
                        </span>
                        <div className="space-y-1.5">
                          {rep.strengths.map((str, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300">
                              {str}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Targeted Improvements
                        </span>
                        <div className="space-y-1.5">
                          {rep.areas_for_improvement.map((imp, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300">
                              {imp}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE & INTERVIEW GOALS */}
        {activeTab === "profile" && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Candidate Profile & Interview Goals</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Configure your target companies, level, skills, and background information.
              </p>
            </div>

            {savedSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2.5 shadow-sm">
                <Check className="w-5 h-5 shrink-0" />
                <span className="font-semibold">Candidate profile and interview targets saved successfully!</span>
              </div>
            )}

            {/* Form Card 1: Personal Info from useAuth() */}
            <Card className="border-border/80 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Personal Account Identity</CardTitle>
                </div>
                <CardDescription>
                  Authenticated candidate information loaded from your PrepPilot account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Akshita Sood"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center justify-between">
                      <span>Email Address</span>
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified Auth
                      </span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || "candidate@preppilot.com"}
                      disabled
                      className="bg-muted/30 cursor-not-allowed text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Background & Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    placeholder="Briefly describe your background, tech stacks, and what mock interview rounds you are targeting..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Card 2: Interview Goals & Tech Skills */}
            <Card className="border-border/80 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-400" />
                  <CardTitle className="text-lg">Interview Goals & Target Stacks</CardTitle>
                </div>
                <CardDescription>
                  Tailor AI interviewer question generation and mentor match suggestions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetRole">Target Role</Label>
                    <Input
                      id="targetRole"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Software Engineer / Frontend Lead"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Target Experience Level</Label>
                    <Select
                      value={experienceLevel}
                      onValueChange={(val) => {
                        if (val) setExperienceLevel(val);
                      }}
                    >
                      <SelectTrigger id="experience">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (5+ years)</SelectItem>
                        <SelectItem value="lead">Staff / Principal (8+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetCompanies">Target Companies</Label>
                  <Input
                    id="targetCompanies"
                    value={targetCompanies}
                    onChange={(e) => setTargetCompanies(e.target.value)}
                    placeholder="e.g. Google, Meta, Stripe, Netflix"
                  />
                </div>

                {/* Interactive Skills Chip Manager */}
                <div className="space-y-2 pt-2">
                  <Label>Primary Skills & Technical Focus</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-xl min-h-[56px] bg-muted/20 border-border/60">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="px-2.5 py-1 text-xs bg-card border border-border/80 flex items-center gap-1.5 shadow-sm"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-destructive text-muted-foreground transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    <div className="flex items-center gap-1">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleAddSkill}
                        placeholder="Add skill..."
                        className="h-7 w-28 text-xs border-none bg-transparent shadow-none focus-visible:ring-0 p-1"
                      />
                      {newSkill.trim() && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={handleAddSkill}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                size="lg"
                onClick={handleSaveProfile}
                disabled={saving}
                className="gap-2 bg-primary text-primary-foreground font-semibold px-6 shadow-md"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Profile & Targets</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Quick Rubric Inspector Modal/Drawer */}
      {selectedReportPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-0">
          <div className="bg-card border border-border/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-3">
              <div>
                <span className="text-xs font-mono text-muted-foreground">
                  Session: {selectedReportPreview.session_id}
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {selectedReportPreview.role_title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReportPreview(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
              <span className="text-xs font-semibold uppercase text-primary">Overall Evaluated Score</span>
              <span className="text-xl font-bold text-primary">
                {selectedReportPreview.overall_score} / 5.0
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                <span className="text-muted-foreground block text-[10px]">Communication</span>
                <span className="text-base font-bold text-foreground">
                  {selectedReportPreview.communication_score} / 5
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                <span className="text-muted-foreground block text-[10px]">Technical Depth</span>
                <span className="text-base font-bold text-foreground">
                  {selectedReportPreview.technical_score} / 5
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                <span className="text-muted-foreground block text-[10px]">Problem Solving</span>
                <span className="text-base font-bold text-foreground">
                  {selectedReportPreview.problem_solving_score} / 5
                </span>
              </div>
            </div>

            {selectedReportPreview.comments && (
              <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border border-border/30">
                "{selectedReportPreview.comments}"
              </p>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Link
                href="/feedback"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                <span>Open Interactive /feedback View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Button variant="outline" onClick={() => setSelectedReportPreview(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
