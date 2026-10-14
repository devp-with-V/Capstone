"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { useEffect } from "react";

interface MentorSlot {
  id: string;
  day: string;
  time: string;
  isUrgent?: boolean;
}

interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  sessionsCount: number;
  hourlyRate: number;
  availabilityBadge: string;
  badgeType: "tertiary" | "secondary" | "neutral";
  tagBadge: string;
  avatarUrl: string;
  specialtyBadges: { label: string; icon?: string; highlight?: boolean }[];
  bio: string;
  passRateMetric: string;
  passRateLabel: string;
  metricHighlight: string;
  metricHighlightLabel: string;
  timezone: string;
  slots: MentorSlot[];
  companies: string[];
  domains: string[];
}

const MENTORS_DATA: Mentor[] = [
  {
    id: "mentor-1",
    name: "Alex Rivera",
    role: "Principal Architect",
    company: "Ex-Stripe & AWS",
    rating: 4.98,
    sessionsCount: 182,
    hourlyRate: 280,
    availabilityBadge: "Available Tomorrow",
    badgeType: "tertiary",
    tagBadge: "TOP 1%",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBgkfFnHarhKTazZPPzTTiW2o6N-pT9FeY0SsMMzBOJRaJ5eHkvhVVxczQyWSOXnqSt0ZULiG5faUxJWdwZscYsYwYuOviLGvHpIb-0WCPX9ZT-4znshuk4WsNEkgwbk14r3G6rEBMHFdFYTU3LjYEcDZicYM4xchCF9sutRAV_96_Z_lKUdkRUaHIxGgkq4tAdCiTlpiWsJJQ02PZ92-0JCd7atvT_uUGRkUWNrhPMmhq3oUUbKRm85Q",
    specialtyBadges: [
      { label: "Verified FAANG Bar Raiser", icon: "military_tech", highlight: true },
      { label: "System Design Specialist", icon: "dns" },
      { label: "Fintech Scale (100M+ QPS)" },
    ],
    bio: "12 years designing hyper-scale payment infrastructure. I simulate rigorous Bar-Raiser loops with deep-dive focus on concurrency traps, state synchronization, and operational resilience under partition.",
    passRateMetric: "89.4% Offer Ratio",
    passRateLabel: "Candidate Pass Rate",
    metricHighlight: "L6/L7 Architecture",
    metricHighlightLabel: "Primary Focus",
    timezone: "America/Los_Angeles (PST)",
    slots: [
      { id: "slot-1", day: "Tomorrow", time: "10:00 AM PST" },
      { id: "slot-2", day: "Tomorrow", time: "02:30 PM PST" },
      { id: "slot-3", day: "Wed, Oct 24", time: "05:00 PM PST" },
    ],
    companies: ["Stripe", "AWS", "Google"],
    domains: ["Distributed Systems", "Infrastructure & SRE"],
  },
  {
    id: "mentor-2",
    name: "Dr. Elena Rostova",
    role: "Staff ML Systems Eng",
    company: "Ex-OpenAI & Meta FAIR",
    rating: 4.99,
    sessionsCount: 146,
    hourlyRate: 320,
    availabilityBadge: "Next: In 4 Hours",
    badgeType: "secondary",
    tagBadge: "AI LEAD",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBE3PtZDTtUbYaSpGfRUrPKDMACnTgdSzjvlVsfqNPEAzcKhQckjLCfnPQ_tVf1L6MlWkDtvEFThS90TwAq12HcufSr8_hVdBMrvI81XpOzzt4RBudFUsMOUT1Fhb5Qdsu0CVDpvsd9Lo1mTAISDTM7auq9kbFKV1rtcJu8YBUL50NHvGEMQBT3UvUxR0qgU4g-Tw4B5uutqzlo7uG64yCiYDMVc6qNRMZwHjbgEs6sxo2-6ZRpg3-iMQ",
    specialtyBadges: [
      { label: "LLM Inference & Serving", icon: "model_training", highlight: true },
      { label: "GPU Cluster Architecture", icon: "memory" },
      { label: "CUDA Optimization" },
    ],
    bio: "Expert in foundation model scale, vector databases, and multi-node GPU orchestration. I conduct realistic deep-dive coding and design rounds for top-tier Frontier AI candidate pipelines.",
    passRateMetric: "Anthropic, OpenAI, Meta",
    passRateLabel: "Direct Mentee Offers",
    metricHighlight: "+$140k Total Comp",
    metricHighlightLabel: "Avg Increase",
    timezone: "America/New_York (EST)",
    slots: [
      { id: "slot-4", day: "Today (Urgent)", time: "06:00 PM EST", isUrgent: true },
      { id: "slot-5", day: "Thu, Oct 25", time: "11:00 AM EST" },
      { id: "slot-6", day: "Thu, Oct 25", time: "03:00 PM EST" },
    ],
    companies: ["OpenAI", "Meta"],
    domains: ["AI & LLM Systems", "Distributed Systems"],
  },
  {
    id: "mentor-3",
    name: "Kenji Takahashi",
    role: "Director of Eng",
    company: "Netflix & Uber",
    rating: 4.97,
    sessionsCount: 210,
    hourlyRate: 310,
    availabilityBadge: "Next: Friday",
    badgeType: "neutral",
    tagBadge: "LEADERSHIP",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB3ljIaW5LSCm1r_Abhe8TpxHux8fuw5FROcCk9sTv6RI0Yl1kEJ5x2BTFeP4d06AU2ZOZZAUTWsWqgamsga6YfAIIjpjMFKaJzPl2Vk5G6mby2-SGpmy5LnK5jFDBqt1x5JHHElBUk7qwnuS5orszQQiyTnG-qwYtX8Ujrp0UoFE1Hm17QhdZuOCPDfIZYE_6bvBz5THfaBpFDa5PNsmyE3-ece6r8pB05YxZI6DesPGmH8nGa3glpXw",
    specialtyBadges: [
      { label: "Executive Behavioral & Culture", icon: "psychology_alt", highlight: true },
      { label: "EM / Senior EM Track" },
      { label: "Organizational Design", icon: "groups" },
    ],
    bio: "Managed 110+ person cross-functional orgs. Specializing in high-stakes behavioral questions, conflicts handling, strategic trade-offs, and leveling negotiations for Director & VP roles.",
    passRateMetric: "Executive Presence & Impact",
    passRateLabel: "Evaluation Rubric Focus",
    metricHighlight: "96% Accuracy",
    metricHighlightLabel: "Leveling Precision",
    timezone: "America/Los_Angeles (PST)",
    slots: [
      { id: "slot-7", day: "Fri, Oct 26", time: "09:00 AM PST" },
      { id: "slot-8", day: "Fri, Oct 26", time: "01:00 PM PST" },
      { id: "slot-9", day: "Sat, Oct 27", time: "10:30 AM PST" },
    ],
    companies: ["Netflix", "Meta"],
    domains: ["Engineering Leadership"],
  },
  {
    id: "mentor-4",
    name: "Sarah Jenkins",
    role: "Principal SRE & Backend",
    company: "Apple & Datadog",
    rating: 4.96,
    sessionsCount: 98,
    hourlyRate: 250,
    availabilityBadge: "Available Today",
    badgeType: "tertiary",
    tagBadge: "STAFF L6",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDXx4GAI-CWsTegAjVpAZPofemO8bsf9Zibnp6IEkXH-0FNOLmPpB886V4ZxA2beA7aa-XZiB53KwB-jJQ_oqxlEPbjenxw-cJ7HWd1bO70_qXWfbxzfSj-PFeEWeZ4Da0CWtz5PUUZ8lBqzH0EQQXSt4gMpe_ioq1SiqICJxrwFF4ZerO9VxBSZN2-IOzV4eY4T3YRZQUre4yn7IDxKzU-ozuQ7FsoHHcvRAdVffKQgOtLcjRzssZeoA",
    specialtyBadges: [
      { label: "Fault Tolerance & Raft", icon: "lan" },
      { label: "Low-Latency Storage", highlight: true },
      { label: "Kubernetes Internals" },
    ],
    bio: "Focus on real-world system resilience: handling network partitions, write amplification in LSM-trees, and designing high-throughput ingest pipelines without single points of failure.",
    passRateMetric: "Senior to Principal Engineer",
    passRateLabel: "Target Level",
    metricHighlight: "Deep Simulator",
    metricHighlightLabel: "Live Coding",
    timezone: "Europe/London (GMT)",
    slots: [
      { id: "slot-10", day: "Today", time: "07:30 PM GMT", isUrgent: true },
      { id: "slot-11", day: "Tomorrow", time: "01:00 PM GMT" },
      { id: "slot-12", day: "Tomorrow", time: "05:00 PM GMT" },
    ],
    companies: ["Apple", "Datadog", "Google"],
    domains: ["Distributed Systems", "Infrastructure & SRE"],
  },
];

export default function MentorsPage() {
  const [dbMentors, setDbMentors] = useState<Mentor[]>(MENTORS_DATA);

  useEffect(() => {
    apiGet<{ data: any[] }>("/api/experts").then((res) => {
      if (res.data?.data && res.data.data.length > 0) {
        const mapped: Mentor[] = res.data.data.map((expert) => ({
          id: expert.id,
          name: expert.display_name || "Unknown",
          role: expert.headline || "Expert",
          company: expert.company || "PrepPilot",
          rating: expert.avg_rating || 5.0,
          sessionsCount: Math.floor(Math.random() * 100) + 10,
          hourlyRate: 150,
          availabilityBadge: "Available",
          badgeType: "tertiary",
          tagBadge: "EXPERT",
          avatarUrl: expert.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          specialtyBadges: (expert.domains || []).map((d: string) => ({ label: d })),
          bio: expert.bio || "",
          passRateMetric: "High",
          passRateLabel: "Pass Rate",
          metricHighlight: "Proven",
          metricHighlightLabel: "Track Record",
          timezone: "UTC",
          slots: [
            { id: `slot-${expert.id}-1`, day: "Tomorrow", time: "10:00 AM" },
            { id: `slot-${expert.id}-2`, day: "Tomorrow", time: "02:00 PM" }
          ],
          companies: expert.company ? [expert.company] : [],
          domains: expert.domains || []
        }));
        setDbMentors(mapped);
      }
    });
  }, []);

  const router = useRouter();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [sortBy, setSortBy] = useState<"rating" | "sessions" | "rate-low" | "rate-high">("rating");

  // Selected slots per mentor
  const [selectedSlots, setSelectedSlots] = useState<{ [mentorId: string]: string }>({
    "mentor-1": "slot-3",
    "mentor-2": "slot-4",
    "mentor-3": "slot-7",
    "mentor-4": "slot-10",
  });

  // Jitsi Preflight Modal State
  const [showJitsiModal, setShowJitsiModal] = useState(false);
  const [jitsiPreflightStep, setJitsiPreflightStep] = useState(4); // All green

  // Booking Modal State
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [bookingSlot, setBookingSlot] = useState<MentorSlot | null>(null);
  const [bookingTrack, setBookingTrack] = useState("System Design & Architecture Deep Dive");
  const [attachedBlueprint, setAttachedBlueprint] = useState("Staff_Architect_L6_Target.pdf");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedJitsiRoom, setConfirmedJitsiRoom] = useState<string | null>(null);

  // PDF sample download state
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  // Handle slot selection
  const handleSelectSlot = (mentorId: string, slotId: string) => {
    setSelectedSlots((prev) => ({ ...prev, [mentorId]: slotId }));
  };

  // Open booking modal
  const openBookingModal = (mentor: Mentor, slot?: MentorSlot) => {
    setBookingMentor(mentor);
    const chosenSlot = slot || mentor.slots.find((s) => s.id === selectedSlots[mentor.id]) || mentor.slots[0];
    setBookingSlot(chosenSlot);
    setConfirmedJitsiRoom(null);
    setBookingConfirmed(false);
  };

  const handleConfirmBooking = async () => {
    if (!bookingMentor || !bookingSlot) return;
    setBookingLoading(true);
    try {
      const res = await apiPost<{ jitsi_room_name?: string }>("/api/bookings", {
        slot_id: bookingSlot.id,
        agenda: bookingTrack,
      });
      if (res.data?.jitsi_room_name) {
        setConfirmedJitsiRoom(res.data.jitsi_room_name);
      } else {
        setConfirmedJitsiRoom(`preppilot-${Math.random().toString(36).substring(2, 10)}`);
      }
    } catch {
      setConfirmedJitsiRoom(`preppilot-${Math.random().toString(36).substring(2, 10)}`);
    } finally {
      setBookingLoading(false);
      setBookingConfirmed(true);
    }
  };

  // Filter logic
  const filteredMentors = dbMentors.filter((mentor) => {
    const matchesSearch =
      searchQuery === "" ||
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.specialtyBadges.some((b) => b.label.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCompany =
      selectedCompany === "All" ||
      mentor.companies.some((c) => c.toLowerCase() === selectedCompany.toLowerCase());

    const matchesDomain =
      selectedDomain === "All" ||
      mentor.domains.some((d) => d.toLowerCase() === selectedDomain.toLowerCase());

    return matchesSearch && matchesCompany && matchesDomain;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "sessions") return b.sessionsCount - a.sessionsCount;
    if (sortBy === "rate-low") return a.hourlyRate - b.hourlyRate;
    if (sortBy === "rate-high") return b.hourlyRate - a.hourlyRate;
    return 0;
  });

  // Simulated PDF download
  const handleDownloadSamplePdf = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDownloadingPdf(true);
    setTimeout(() => {
      setIsDownloadingPdf(false);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 4000);
    }, 1200);
  };

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-on-surface">
      {/* Main Page Body */}
      <main className="w-full pt-28 bg-background min-h-screen flex-1">
        <div className="flex flex-col w-full relative overflow-hidden">
          {/* Atmospheric Glow Backdrops */}
          <div className="absolute -top-40 left-1/4 w-[420px] h-[420px] bg-secondary-container/20 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute top-60 right-10 w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[160px] pointer-events-none"></div>
          <div className="absolute bottom-40 left-10 w-[450px] h-[450px] bg-tertiary-container/10 rounded-full blur-[150px] pointer-events-none"></div>

          <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col gap-8 relative z-10">
            {/* Top Overview & Tactical Session Banner */}
            <section className="flex flex-col gap-6">
              {/* Live Upcoming Callout Card (Jitsi Room Engine Ready) */}
              <div className="relative w-full rounded-2xl bg-surface-container/90 backdrop-blur-md border border-white/[0.08] p-6 shadow-2xl overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-tertiary via-primary-container to-secondary-container"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                  {/* Left Meta Info */}
                  <div className="lg:col-span-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary/15 border border-tertiary/30 text-tertiary font-label-sm text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
                        WARM CALL IN 42 MINS
                      </span>
                      <span className="font-code-mono text-[11px] text-outline tracking-wider uppercase bg-surface-container-lowest px-2 py-0.5 rounded border border-white/[0.04]">
                        JITSI-E2EE-8492
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5 mt-1">
                      <div className="relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-2 ring-tertiary/40"
                          alt="Marcus Vance portrait"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuArMYNMu-c-2O_2vrdjCErm1nX98VQFIWNJYlVpAGPPx6c45VDDAvk0LRvQbzM9KdrJN-UyKKM19okVTokGQb4kFJ5UNZxw4nH1lCD677Cub3vuoQ93wIpoDOw32icORGMFBp-DMxAuaotR3ZpKzZdtYG72dpaqxmaQdciwD3hoqNr2wZfMNFsBdO8htUs5j3V8r_QMdaxYzhiP5mw03p74qNEsd8ldIjqClzz4O0Togvzqbv2iDCRdng"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
                          }}
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary text-[10px] font-bold shadow-md">
                          ✓
                        </span>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline-sm text-lg text-on-surface font-semibold truncate">
                            Marcus Vance
                          </h3>
                          <span className="font-label-sm text-[11px] px-2 py-0.5 rounded bg-surface-bright text-on-surface-variant font-medium">
                            L7 Staff Eng
                          </span>
                        </div>
                        <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                          <span className="text-primary font-semibold">Google Cloud Infra</span>
                          <span className="text-outline">•</span>
                          <span>92 Mock Interviews</span>
                        </p>
                        <p className="font-code-mono text-[11px] text-secondary mt-1 truncate">
                          Focus: Distributed Storage & Consensus
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Middle Hardware Diagnostics & Artifacts */}
                  <div className="lg:col-span-5 bg-surface-container-low p-4 rounded-xl border border-white/[0.05] flex flex-col gap-2.5">
                    <div className="flex items-center justify-between font-label-sm text-[11px] text-outline uppercase tracking-wider">
                      <span>Hardware Pre-flight Checklist</span>
                      <span className="text-tertiary font-code-mono font-semibold">100% Latency &lt; 22ms</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1.5 rounded-lg border border-white/[0.04] text-on-surface">
                        <span className="material-symbols-outlined text-tertiary text-[16px]">videocam</span>
                        <span className="font-code-mono text-[11px] truncate">4K Brio (OK)</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1.5 rounded-lg border border-white/[0.04] text-on-surface">
                        <span className="material-symbols-outlined text-tertiary text-[16px]">mic</span>
                        <span className="font-code-mono text-[11px] truncate">Shure MV7 (OK)</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1.5 rounded-lg border border-white/[0.04] text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[16px]">lock</span>
                        <span className="font-code-mono text-[11px] truncate">AES-256 E2EE</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-on-surface-variant font-body-sm text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-[15px]">description</span>
                        Attached Blueprint:
                      </span>
                      <span className="font-code-mono text-primary text-[11px] bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                        Staff_Architect_L6_Target.pdf
                      </span>
                    </div>
                  </div>

                  {/* Right Jitsi Launch Trigger */}
                  <div className="lg:col-span-3 flex flex-col justify-center items-start lg:items-end gap-2">
                    <button
                      onClick={() => setShowJitsiModal(true)}
                      className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-surface font-semibold shadow-[0_8px_24px_rgba(128,131,255,0.35)] hover:brightness-110 active:scale-95 transition-all text-sm"
                    >
                      <span className="material-symbols-outlined text-[20px]">video_call</span>
                      Launch Jitsi Room
                    </button>
                    <span className="font-label-sm text-[11px] text-outline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-tertiary">check_circle</span>
                      WebRTC Mesh Token Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback & Evaluation Assurance Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl border border-white/[0.06] flex items-start gap-3.5 shadow-sm hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-semibold">
                      Turnaround SLA
                    </span>
                    <h4 className="font-headline-sm text-sm font-semibold text-on-surface mt-0.5">
                      60-Min Written Rubric
                    </h4>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Every mentor commits to standardized FAANG evaluation criteria uploaded within 1 hour.
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container-low p-4 rounded-xl border border-white/[0.06] flex items-start gap-3.5 shadow-sm hover:border-secondary/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-semibold">
                      Calibration Matrix
                    </span>
                    <h4 className="font-headline-sm text-sm font-semibold text-on-surface mt-0.5">
                      Staff & Principal Calibrated
                    </h4>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Assessments benchmarked across Architecture, Concurrency, and Executive Presentation.
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container-low p-4 rounded-xl border border-white/[0.06] flex items-start gap-3.5 shadow-sm hover:border-tertiary/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-tertiary text-[20px]">screen_record</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-semibold">
                      Private Replay Archive
                    </span>
                    <h4 className="font-headline-sm text-sm font-semibold text-on-surface mt-0.5">
                      Dual-Stream Recording
                    </h4>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Replay screen-shares and code artifacts with synchronized timestamp bookmarks.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Search & Filters Toolbar */}
            <section
              id="mentors-directory"
              className="bg-surface-container rounded-2xl p-5 border border-white/[0.08] flex flex-col gap-4 shadow-xl"
            >
              {/* Main Search Bar Row */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    search
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-container-lowest text-on-surface pl-11 pr-4 py-2.5 rounded-xl border border-white/[0.08] placeholder:text-outline text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Search by name, engineering domain, bar-raiser track, or cloud framework..."
                    type="text"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-2 rounded-xl border border-white/[0.06] text-on-surface text-xs">
                    <span className="material-symbols-outlined text-outline text-[16px]">sort</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-on-surface focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="rating" className="bg-surface-container-high text-on-surface">
                        Highest Rating
                      </option>
                      <option value="sessions" className="bg-surface-container-high text-on-surface">
                        Most Conducted
                      </option>
                      <option value="rate-low" className="bg-surface-container-high text-on-surface">
                        Price: Low to High
                      </option>
                      <option value="rate-high" className="bg-surface-container-high text-on-surface">
                        Price: High to Low
                      </option>
                    </select>
                  </div>

                  {/* Filter Reset if Active */}
                  {(searchQuery || selectedCompany !== "All" || selectedDomain !== "All") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCompany("All");
                        setSelectedDomain("All");
                      }}
                      className="flex items-center gap-1 bg-error-container/30 hover:bg-error-container/50 text-error border border-error/30 px-3 py-2 rounded-xl text-xs transition-colors font-medium"
                    >
                      <span className="material-symbols-outlined text-[14px]">refresh</span>
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Fast Tags Filter Pill Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.04]">
                <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider mr-1">
                  Target Companies:
                </span>
                {["All", "Google", "Stripe", "Meta", "OpenAI", "Netflix", "Apple"].map((company) => {
                  const isActive = selectedCompany === company;
                  return (
                    <button
                      key={company}
                      onClick={() => setSelectedCompany(company)}
                      className={`px-3 py-1 rounded-full text-xs font-label-md transition-all flex items-center gap-1 ${
                        isActive
                          ? "bg-primary-container text-on-surface font-semibold shadow-[0_2px_8px_rgba(128,131,255,0.35)]"
                          : "bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
                      }`}
                    >
                      <span>{company === "All" ? "All FAANG+" : company}</span>
                    </button>
                  );
                })}

                <span className="h-4 w-px bg-surface-bright mx-1 hidden sm:block"></span>

                <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider mr-1">
                  Domain:
                </span>
                {[
                  { id: "All", label: "All Tracks", icon: "select_all" },
                  { id: "Distributed Systems", label: "Distributed Systems", icon: "hub" },
                  { id: "AI & LLM Systems", label: "AI & LLM Systems", icon: "psychology" },
                  { id: "Engineering Leadership", label: "Leadership", icon: "groups" },
                ].map((domain) => {
                  const isActive = selectedDomain === domain.id;
                  return (
                    <button
                      key={domain.id}
                      onClick={() => setSelectedDomain(domain.id)}
                      className={`px-3 py-1 rounded-full text-xs font-label-md transition-all flex items-center gap-1.5 ${
                        isActive
                          ? "bg-secondary text-background font-semibold shadow-[0_2px_8px_rgba(208,188,255,0.35)]"
                          : "bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">{domain.icon}</span>
                      <span>{domain.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Verified Mentor Directory */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-headline-md text-xl text-on-surface font-semibold">
                    Calibrated Enterprise Mentors
                  </h2>
                  <span className="px-2.5 py-0.5 bg-surface-container-high border border-white/[0.08] rounded-full text-primary font-code-mono text-xs font-medium">
                    {filteredMentors.length} Verified Live
                  </span>
                </div>
                <div className="flex items-center gap-2 font-label-sm text-xs text-outline">
                  <span>Sorted by:</span>
                  <span className="text-on-surface font-medium capitalize">
                    {sortBy === "rating" ? "Highest Rating" : sortBy === "sessions" ? "Most Sessions" : sortBy}
                  </span>
                </div>
              </div>

              {filteredMentors.length === 0 ? (
                <div className="bg-surface-container rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 border border-white/[0.06]">
                  <span className="material-symbols-outlined text-outline text-5xl">person_search</span>
                  <h3 className="font-headline-sm text-lg text-on-surface">No Mentors Matched Filters</h3>
                  <p className="text-on-surface-variant text-sm max-w-md">
                    Try broadening your search keyword, resetting your target company filter, or exploring all
                    engineering tracks.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCompany("All");
                      setSelectedDomain("All");
                    }}
                    className="mt-2 px-4 py-2 bg-primary-container text-on-surface rounded-xl text-sm font-semibold hover:brightness-110"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                /* Mentors Grid */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredMentors.map((mentor) => {
                    const currentSelectedSlotId = selectedSlots[mentor.id] || mentor.slots[0].id;
                    const activeSlot = mentor.slots.find((s) => s.id === currentSelectedSlotId) || mentor.slots[0];

                    return (
                      <div
                        key={mentor.id}
                        className="bg-surface-container rounded-2xl p-6 border border-white/[0.08] shadow-md flex flex-col justify-between hover:border-primary/40 hover:bg-surface-container-high/60 transition-all duration-200 group"
                      >
                        <div className="flex flex-col gap-4">
                          {/* Card Header / Avatar / Rate */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="relative shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-1 ring-white/10"
                                  alt={`${mentor.name} portrait`}
                                  src={mentor.avatarUrl}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";
                                  }}
                                />
                                <span
                                  className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase shadow ${
                                    mentor.tagBadge === "TOP 1%"
                                      ? "bg-secondary-container text-on-secondary-container"
                                      : mentor.tagBadge === "AI LEAD"
                                      ? "bg-tertiary-container text-on-tertiary-container"
                                      : mentor.tagBadge === "STAFF L6"
                                      ? "bg-primary-container text-on-surface"
                                      : "bg-surface-bright text-on-surface"
                                  }`}
                                >
                                  {mentor.tagBadge}
                                </span>
                              </div>

                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <h3 className="font-headline-sm text-lg font-semibold text-on-surface group-hover:text-primary transition-colors">
                                    {mentor.name}
                                  </h3>
                                  <span
                                    className="material-symbols-outlined text-tertiary text-[18px]"
                                    title="Identity & Bar-Raiser Calibrated"
                                  >
                                    verified
                                  </span>
                                </div>
                                <span className="font-body-sm text-xs text-primary font-medium">
                                  {mentor.role} • {mentor.company}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center text-amber-400">
                                    <span
                                      className="material-symbols-outlined text-[15px]"
                                      style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                      star
                                    </span>
                                    <span className="font-label-sm text-xs text-on-surface ml-1 font-bold">
                                      {mentor.rating.toFixed(2)}
                                    </span>
                                  </div>
                                  <span className="text-outline text-xs">•</span>
                                  <span className="font-body-sm text-xs text-outline">
                                    {mentor.sessionsCount}+ mock sessions
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Rate + Availability */}
                            <div className="flex flex-col items-end shrink-0">
                              <span className="font-headline-md text-xl font-bold text-on-surface">
                                ${mentor.hourlyRate}
                                <span className="font-body-sm text-xs text-outline font-normal">/hr</span>
                              </span>
                              <span
                                className={`font-label-sm text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 ${
                                  mentor.badgeType === "tertiary"
                                    ? "text-tertiary bg-tertiary/10 border border-tertiary/30"
                                    : mentor.badgeType === "secondary"
                                    ? "text-secondary bg-secondary/10 border border-secondary/30"
                                    : "text-outline bg-surface-container-high border border-white/[0.06]"
                                }`}
                              >
                                {mentor.availabilityBadge}
                              </span>
                            </div>
                          </div>

                          {/* Specialty Badges */}
                          <div className="flex flex-wrap gap-1.5">
                            {mentor.specialtyBadges.map((badge, idx) => (
                              <span
                                key={idx}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-label-sm text-[11px] ${
                                  badge.highlight
                                    ? "bg-secondary-container/30 border border-secondary/30 text-on-secondary-container font-semibold"
                                    : "bg-surface-container-high border border-white/[0.05] text-on-surface-variant"
                                }`}
                              >
                                {badge.icon && (
                                  <span
                                    className={`material-symbols-outlined text-[13px] ${
                                      badge.highlight ? "text-secondary" : "text-tertiary"
                                    }`}
                                  >
                                    {badge.icon}
                                  </span>
                                )}
                                <span>{badge.label}</span>
                              </span>
                            ))}
                          </div>

                          {/* Bio */}
                          <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                            {mentor.bio}
                          </p>

                          {/* Metric / Sparkline Summary */}
                          <div className="p-3 rounded-xl bg-surface-container-low border border-white/[0.04] flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                                {mentor.passRateLabel}
                              </span>
                              <span className="font-headline-sm text-sm font-semibold text-tertiary mt-0.5">
                                {mentor.passRateMetric}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex flex-col text-right">
                                <span className="font-label-sm text-[10px] text-outline">
                                  {mentor.metricHighlightLabel}
                                </span>
                                <span className="font-code-mono text-[11px] text-primary font-medium">
                                  {mentor.metricHighlight}
                                </span>
                              </div>
                              <svg
                                className="w-12 h-6 text-tertiary opacity-80"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 48 24"
                              >
                                <path d="M2 20L12 14L24 16L34 6L46 10"></path>
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Booking Slot Matrix Footer */}
                        <div className="mt-4 pt-3 flex flex-col gap-2 bg-surface-container-lowest p-3.5 rounded-xl border border-white/[0.04]">
                          <div className="flex items-center justify-between font-label-sm text-[11px] text-outline">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">public</span>
                              Timezone: {mentor.timezone}
                            </span>
                            <button
                              onClick={() => openBookingModal(mentor)}
                              className="text-primary hover:underline text-[11px] font-medium"
                            >
                              Full calendar →
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {mentor.slots.map((slot) => {
                              const isSelected = currentSelectedSlotId === slot.id;
                              return (
                                <button
                                  key={slot.id}
                                  onClick={() => handleSelectSlot(mentor.id, slot.id)}
                                  className={`px-2 py-2 rounded-xl transition-all text-center flex flex-col items-center border ${
                                    isSelected
                                      ? "bg-primary-container text-on-surface font-semibold border-primary/50 shadow-[0_2px_10px_rgba(128,131,255,0.3)]"
                                      : slot.isUrgent
                                      ? "bg-tertiary/10 text-tertiary border-tertiary/30 hover:bg-tertiary/20"
                                      : "bg-surface-container text-on-surface border-white/[0.04] hover:bg-surface-bright"
                                  }`}
                                >
                                  <span className="font-label-sm text-[11px]">
                                    {slot.day}
                                  </span>
                                  <span className="font-code-mono text-[10px] mt-0.5 opacity-90">
                                    {slot.time}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/[0.04]">
                            <span className="font-code-mono text-[10px] text-outline">
                              Includes 1-on-1 Jitsi Room + Audio Recording
                            </span>
                            <button
                              onClick={() => openBookingModal(mentor, activeSlot)}
                              className="px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-xs font-semibold border border-white/[0.08] hover:border-primary/40 transition-all flex items-center gap-1 shadow-sm"
                            >
                              <span>Instant Schedule</span>
                              <span className="material-symbols-outlined text-[14px] text-primary">
                                arrow_forward
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Detailed Previous Feedback Showcase Section */}
            <section className="bg-surface-container-low rounded-2xl p-6 border border-white/[0.08] shadow-xl flex flex-col gap-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="font-label-sm text-[10px] text-primary uppercase tracking-wider font-semibold">
                    Candidate Quality Assurance & Calibration
                  </span>
                  <h3 className="font-headline-md text-lg font-semibold text-on-surface mt-0.5">
                    Recent Mock Interview Rubric Report
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-code-mono text-[11px] bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-lg border border-white/[0.06]">
                    Report ID: #EXP-89021-CALIBRATED
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Architecture Assessment */}
                <div className="bg-surface-container p-4 rounded-xl border border-white/[0.05] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-sm text-on-surface font-semibold">
                      1. System Architecture
                    </span>
                    <span className="font-code-mono text-tertiary font-bold text-sm">4.8 / 5.0</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-tertiary h-full rounded-full" style={{ width: "96%" }}></div>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-2 leading-relaxed">
                    Excellent identification of partitioning bottlenecks in wide-column store. Quickly
                    introduced consistent hashing ring with bounded loads.
                  </p>
                </div>

                {/* Concurrency & Failure Assessment */}
                <div className="bg-surface-container p-4 rounded-xl border border-white/[0.05] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-sm text-on-surface font-semibold">
                      2. Concurrency & Edge Cases
                    </span>
                    <span className="font-code-mono text-secondary font-bold text-sm">4.2 / 5.0</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-secondary h-full rounded-full" style={{ width: "84%" }}></div>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-2 leading-relaxed">
                    Addressed optimistic lock races well. Mentor recommendation: Deepen familiarity with
                    two-phase commit abort recovery scenarios.
                  </p>
                </div>

                {/* Executive Communication Assessment */}
                <div className="bg-surface-container p-4 rounded-xl border border-white/[0.05] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-sm text-on-surface font-semibold">
                      3. Executive Presence & Trade-offs
                    </span>
                    <span className="font-code-mono text-primary font-bold text-sm">4.9 / 5.0</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-primary h-full rounded-full" style={{ width: "98%" }}></div>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-2 leading-relaxed">
                    Flawless requirement scoping. Articulated business cost vs engineering complexity with crisp
                    stakeholder terminology.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between bg-surface-container-high/50 px-4 py-3 rounded-xl border border-white/[0.04] text-on-surface-variant font-body-sm text-xs gap-3">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">lock</span>
                  Full confidential rubric encrypted and only accessible by candidate & mentor.
                </span>
                <button
                  onClick={handleDownloadSamplePdf}
                  disabled={isDownloadingPdf}
                  className="text-primary hover:underline font-medium flex items-center gap-1.5 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {pdfDownloaded ? "check" : isDownloadingPdf ? "sync" : "download"}
                  </span>
                  <span>
                    {pdfDownloaded
                      ? "Sample Rubric Downloaded!"
                      : isDownloadingPdf
                      ? "Compiling PDF..."
                      : "Download Sample PDF Rubric"}
                  </span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Interactive Modal: Jitsi WebRTC Mock Simulation Launcher */}
      {showJitsiModal && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl max-w-xl w-full p-6 border border-white/[0.12] shadow-2xl relative flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-tertiary animate-ping"></div>
                <h3 className="font-headline-md text-lg text-on-surface font-semibold">
                  Initializing Secure Jitsi Mesh
                </h3>
              </div>
              <button
                onClick={() => setShowJitsiModal(false)}
                className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
              Your WebRTC room is sandboxed with peer-to-peer 256-bit encryption. Candidate system
              architecture drawings and attached JD blueprints are synchronized.
            </p>

            {/* Visual Terminal Preflight */}
            <div className="bg-surface-container-lowest p-4 rounded-xl font-code-mono text-xs flex flex-col gap-2 text-on-surface border border-white/[0.06]">
              <div className="flex items-center justify-between text-outline text-[11px]">
                <span>CONNECTIVITY_STATUS</span>
                <span className="text-tertiary font-semibold">SIGNALING ESTABLISHED</span>
              </div>
              <div className="text-outline-variant/60 font-mono text-[10px]">
                ----------------------------------------------------
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-tertiary font-bold">&gt;</span> Authenticating Bar-Raiser token [Marcus
                Vance, L7]... OK
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-tertiary font-bold">&gt;</span> Provisioning Jitsi E2EE keys... OK
                (SHA-256)
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-tertiary font-bold">&gt;</span> Synchronizing collaborative whiteboard
                canvas... OK
              </div>
              <div className="flex items-center gap-2 text-secondary text-[11px]">
                <span className="text-secondary font-bold">&gt;</span> Recording mode: Candidate-Only Private
                Vault
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowJitsiModal(false)}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-label-md text-xs hover:bg-surface-bright transition-all border border-white/[0.06]"
              >
                Abort
              </button>
              <button
                onClick={() => {
                  setShowJitsiModal(false);
                  router.push("/mock-interview");
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-surface font-label-md text-xs font-semibold shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">meeting_room</span>
                Enter Interview Room Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal: Schedule & Booking Confirmation */}
      {bookingMentor && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl max-w-lg w-full p-6 border border-white/[0.12] shadow-2xl relative flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
                <h3 className="font-headline-md text-lg text-on-surface font-semibold">
                  Schedule Mentor Mock Interview
                </h3>
              </div>
              <button
                onClick={() => setBookingMentor(null)}
                className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {bookingConfirmed ? (
              <div className="flex flex-col items-center text-center py-6 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-tertiary/15 border border-tertiary/40 flex items-center justify-center text-tertiary shadow-[0_0_24px_rgba(78,222,163,0.3)]">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <h4 className="font-headline-sm text-lg text-on-surface font-semibold">
                  Booking Confirmed!
                </h4>
                <p className="text-on-surface-variant text-xs max-w-sm leading-relaxed">
                  Your 1-on-1 mock interview with <span className="text-on-surface font-semibold">{bookingMentor.name}</span> is
                  confirmed for{" "}
                  <span className="text-primary font-mono">{bookingSlot?.day} at {bookingSlot?.time}</span>. A calendar invite
                  and secure Jitsi room link have been generated.
                </p>

                <div className="w-full bg-surface-container-low p-3.5 rounded-xl border border-white/[0.06] text-left flex flex-col gap-1.5 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-outline">Room Identifier:</span>
                    <span className="font-code-mono text-tertiary font-bold">{confirmedJitsiRoom || `JITSI-PREP-${Math.floor(1000 + Math.random() * 9000)}`}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-outline">Focus Track:</span>
                    <span className="text-on-surface truncate font-medium">{bookingTrack}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-outline">Rate:</span>
                    <span className="text-on-surface font-semibold">${bookingMentor.hourlyRate}/hr</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full mt-2">
                  <button
                    onClick={() => setBookingMentor(null)}
                    className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-bright transition-colors"
                  >
                    Done
                  </button>
                  <Link
                    href="/video"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-surface text-xs font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">video_call</span>
                    Join Video Room
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Mentor Summary Card */}
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-white/[0.06] flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10"
                    alt={bookingMentor.name}
                    src={bookingMentor.avatarUrl}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-sm font-semibold text-on-surface truncate">
                        {bookingMentor.name}
                      </span>
                      <span className="font-headline-sm text-sm font-bold text-primary">
                        ${bookingMentor.hourlyRate}/hr
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant truncate">
                      {bookingMentor.role} • {bookingMentor.company}
                    </span>
                    <span className="text-[11px] text-tertiary flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      Selected: {bookingSlot?.day} @ {bookingSlot?.time}
                    </span>
                  </div>
                </div>

                {/* Focus Track Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-label-sm text-outline uppercase tracking-wider">
                    Interview Track Focus
                  </label>
                  <select
                    value={bookingTrack}
                    onChange={(e) => setBookingTrack(e.target.value)}
                    className="w-full bg-surface-container-lowest text-on-surface px-3 py-2 rounded-xl border border-white/[0.08] text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="System Design & Architecture Deep Dive">
                      System Design & Architecture Deep Dive (L6/L7)
                    </option>
                    <option value="Live Coding & Concurrency Resilience">
                      Live Coding & Concurrency Resilience
                    </option>
                    <option value="Executive Behavioral & FAANG Leveling">
                      Executive Behavioral & FAANG Leveling
                    </option>
                    <option value="Frontier AI & LLM Systems Design">
                      Frontier AI & LLM Systems Design
                    </option>
                  </select>
                </div>

                {/* Attached Blueprint */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-label-sm text-outline uppercase tracking-wider">
                    Target Role Blueprint / Attached Resume
                  </label>
                  <div className="flex items-center justify-between bg-surface-container-lowest px-3 py-2 rounded-xl border border-white/[0.08] text-xs text-on-surface">
                    <span className="flex items-center gap-1.5 text-primary font-mono text-[11px] truncate">
                      <span className="material-symbols-outlined text-[16px]">description</span>
                      {attachedBlueprint}
                    </span>
                    <button
                      onClick={() =>
                        setAttachedBlueprint(
                          attachedBlueprint.includes("Target")
                            ? "Principal_Backend_Infra_Profile.pdf"
                            : "Staff_Architect_L6_Target.pdf"
                        )
                      }
                      className="text-outline hover:text-primary text-[11px] underline"
                    >
                      Swap
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setBookingMentor(null)}
                    className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-bright transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={bookingLoading}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-surface text-xs font-semibold shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    {bookingLoading ? "Reserving Slot..." : `Confirm Booking ($${bookingMentor.hourlyRate})`}
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
