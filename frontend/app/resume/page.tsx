"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUpload } from "@/lib/api";

interface DiffState {
  rev1Accepted: boolean;
  rev2Accepted: boolean;
  rev3Accepted: boolean;
  ebpfInjected: boolean;
}

export default function ResumeReviewPage() {
  const router = useRouter();

  // Navigation & View State
  const [activePillar, setActivePillar] = useState<1 | 2 | 3 | 4>(1);
  const [diffState, setDiffState] = useState<DiffState>({
    rev1Accepted: false,
    rev2Accepted: false,
    rev3Accepted: false,
    ebpfInjected: false,
  });

  // Re-scan / Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("sde");
  const [jobDescription, setJobDescription] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [analyzedData, setAnalyzedData] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [exportState, setExportState] = useState<"idle" | "compiling" | "ready">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directFileInputRef = useRef<HTMLInputElement>(null);

  // Restore cached report if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem("prepPilot_mockReport");
      if (saved) {
        setAnalyzedData(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);


  // Smooth scroll to revision
  const scrollToRevision = (id: string) => {
    setActivePillar(1);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary", "scale-[1.01]");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-primary", "scale-[1.01]");
        }, 1500);
      }
    }, 50);
  };

  const handleAcceptDiff = (rev: "rev1" | "rev2" | "rev3") => {
    setDiffState((prev) => ({
      ...prev,
      [`${rev}Accepted`]: true,
    }));
  };

  const handleAcceptAll = () => {
    setDiffState((prev) => ({
      ...prev,
      rev1Accepted: true,
      rev2Accepted: true,
      rev3Accepted: true,
    }));
  };

  const handleExportPdf = () => {
    setExportState("compiling");
    setTimeout(() => {
      setExportState("ready");
      setTimeout(() => setExportState("idle"), 2500);
    }, 1400);
  };

  // Upload Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleRunAnalysis = async () => {
    if (!file) {
      alert("Please select or drop a PDF resume first.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (targetRole) {
        formData.append("target_role", targetRole);
      }
      if (jobDescription) {
        formData.append("job_description", jobDescription);
      }
      if (candidateName) {
        formData.append("candidate_name", candidateName);
      }
      if (candidateEmail) {
        formData.append("candidate_email", candidateEmail);
      }
      const res = await apiUpload<any>("/api/resume/analyze", formData);
      if (res.data) {
        const reportData = (res.data as any).data || res.data;
        if (reportData && reportData.overall_score !== undefined) {
          setAnalyzedData(reportData);
          localStorage.setItem("prepPilot_mockReport", JSON.stringify(reportData));
        }
      }
    } catch (err) {
      console.warn("Backend unavailable, using simulated state:", err);
    } finally {
      setIsAnalyzing(false);
      setShowUploadModal(false);
    }
  };


  const allAccepted = diffState.rev1Accepted && diffState.rev2Accepted && diffState.rev3Accepted;

  return (
    <div className="bg-background font-sans text-body-md text-on-surface antialiased min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* MAIN DIAGNOSTIC WORKSPACE */}
      <main className="w-full pt-32 pb-24">
        {/* Ambient Glows */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-[128px] pointer-events-none -z-10" />
          <div className="absolute top-20 right-10 w-80 h-80 bg-secondary-container/15 rounded-full blur-[140px] pointer-events-none -z-10" />

          <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col gap-8">
            {/* Breadcrumb & Control Super-header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-code-mono text-xs text-primary uppercase tracking-widest font-semibold">Diagnostic Engine // ATS Core 4.2</span>
                  <span className="text-outline text-xs">/</span>
                  <span className="font-code-mono text-xs text-on-surface-variant">Artifact: {file ? file.name : "resume_v4_lead_backend.pdf"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                    Executive Resume Telemetry &amp; ATS DeepScan
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-code-mono text-xs flex items-center gap-1 border border-tertiary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" /> PASS: 4/4 ENGINES
                  </span>
                </div>
              </div>

              {/* Quick Top Action Controls */}
              <div className="flex items-center flex-wrap gap-2.5">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white text-xs font-bold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md shadow-primary-container/20 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  Upload Resume (PDF)
                </button>
                <button
                  onClick={handleAcceptAll}
                  disabled={allAccepted}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg ${
                    allAccepted
                      ? "bg-tertiary-container text-white cursor-default"
                      : "bg-gradient-to-r from-primary-container to-secondary-container text-white hover:brightness-110 shadow-primary-container/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{allAccepted ? "done_all" : "auto_fix_high"}</span>
                  {allAccepted ? "All 3 Rewrites Applied" : "Batch Accept All Rewrites (3)"}
                </button>
                <button
                  onClick={handleExportPdf}
                  className="px-4 py-2 rounded-xl bg-surface-container-highest text-primary text-xs font-semibold hover:bg-surface-bright transition-all flex items-center gap-1.5 border border-white/[0.08] shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {exportState === "compiling" ? "progress_activity" : exportState === "ready" ? "download_done" : "download"}
                  </span>
                  {exportState === "compiling" ? "Compiling..." : exportState === "ready" ? "Downloaded!" : "Export ATS PDF"}
                </button>
              </div>
            </div>

            {/* DIRECT RESUME UPLOAD & ATS SCAN HERO PANEL */}
            <div className="bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-high/70 border border-primary/30 rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.45)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
              
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                {/* Left Description & Inputs */}
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-code-mono font-bold border border-primary/25 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> LIVE ATS SCANNER
                    </span>
                    <span className="text-xs text-outline font-code-mono">SDE &amp; Data Role Taxonomies Active</span>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                      Upload Your Resume for Instant ATS Scoring
                    </h2>
                    <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
                      Upload your PDF resume to extract contact info, work history, and skills. Our ATS engine matches against standard SDE and Data roles, checks section completeness, evaluates action verbs, and generates an executive score.
                    </p>
                  </div>

                  {/* Target Role & JD Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-outline uppercase font-code-mono">Target Role Track</label>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-xs text-on-surface focus:outline-none focus:border-primary"
                      >
                        <option value="sde">Software Development Engineer (SDE)</option>
                        <option value="backend_engineer">Backend Engineer</option>
                        <option value="frontend_engineer">Frontend Engineer</option>
                        <option value="fullstack_engineer">Full Stack Engineer</option>
                        <option value="devops_cloud_engineer">DevOps &amp; Cloud Engineer</option>
                        <option value="data_analyst">Data Analyst / BI</option>
                        <option value="data_engineer">Data Engineer</option>
                        <option value="data_scientist">Data Scientist</option>
                        <option value="ml_ai_engineer">Machine Learning &amp; AI Engineer</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-outline uppercase font-code-mono">Target Job Description (Optional)</label>
                      <input
                        type="text"
                        placeholder="Paste target JD or requirements for exact match..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Dropzone & Upload Button */}
                <div className="w-full lg:w-96 shrink-0 flex flex-col gap-3">
                  <div
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center transition-all ${
                      isDragging
                        ? "border-primary bg-primary/10"
                        : "border-white/[0.15] hover:border-primary/60 hover:bg-surface-container-high/50"
                    } ${file ? "bg-surface-container-high/80 border-solid border-primary/40" : "bg-surface-container-lowest/60"}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => directFileInputRef.current?.click()}
                  >
                    <input type="file" ref={directFileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
                    {file ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-2">
                          <span className="material-symbols-outlined text-[28px]">picture_as_pdf</span>
                        </div>
                        <p className="font-bold text-sm text-on-surface mb-0.5 truncate max-w-[240px]">{file.name}</p>
                        <p className="text-xs text-outline mb-2">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF Attached</p>
                        <span className="text-[11px] text-tertiary font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span> Ready to Analyze
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center mb-2 border border-white/[0.06] group-hover:scale-105 transition-transform">
                          <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
                        </div>
                        <p className="font-semibold text-sm text-on-surface mb-0.5">Click to Browse or Drag PDF</p>
                        <p className="text-xs text-outline">Supports PDF format (Max 10MB)</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleRunAnalysis}
                    disabled={!file || isAnalyzing}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary-container via-primary to-secondary-container text-white font-bold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(99,102,241,0.5)] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">{isAnalyzing ? "progress_activity" : "bolt"}</span>
                    {isAnalyzing ? "Parsing & Scoring with ATS Core..." : file ? "Run ATS Diagnostic & Score" : "Select PDF Resume to Scan"}
                  </button>
                </div>
              </div>

              {/* Status Banner when Analyzed */}
              {analyzedData && (
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-tertiary">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Active ATS Report: <strong>{analyzedData.parsed_data?.contact?.name || "Candidate"}</strong></span>
                    <span className="px-2 py-0.5 rounded bg-tertiary/20 text-tertiary font-code-mono font-bold">Grade {analyzedData.grade} ({analyzedData.overall_score}%)</span>
                  </div>
                  <span className="text-outline font-code-mono">
                    {analyzedData.keyword_matching?.jd_match ? "Matched against target Job Description" : `Aligned with ${analyzedData.target_role?.toUpperCase() || "SDE"} taxonomy`}
                  </span>
                </div>
              )}
            </div>

            {/* Top Stats & ATS Engine Validation Banner (Bento Matrix) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Score Card 1: ATS Overall */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-white/[0.06] shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-white/[0.12] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-code-mono text-xs uppercase tracking-wider text-outline font-semibold">ATS Compatibility</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-extrabold text-on-surface">
                        {analyzedData ? analyzedData.overall_score : (allAccepted ? "96" : "92")}
                      </span>
                      <span className="font-code-mono text-xs text-outline">/100</span>
                    </div>
                  </div>
                  {/* Radial Micro Meter Chart */}
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path
                        className="text-tertiary transition-all duration-1000"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={`${analyzedData ? analyzedData.overall_score : (allAccepted ? 96 : 92)}, 100`}
                        strokeLinecap="round"
                        strokeWidth="3"
                      />
                    </svg>
                    <span className="absolute material-symbols-outlined text-tertiary text-[18px]">verified</span>
                  </div>
                </div>
                <div className="mt-4 pt-2.5 bg-surface-container-lowest/60 -mx-5 -mb-5 px-5 py-2 rounded-b-2xl flex items-center justify-between border-t border-white/[0.04]">
                  <span className="font-code-mono text-[10px] text-tertiary">
                    {analyzedData ? `GRADE: ${analyzedData.grade} • GREENHOUSE & ASHBY READY` : "GREENHOUSE • LEVER • ASHBY • WORKDAY"}
                  </span>
                  <span className="material-symbols-outlined text-[14px] text-tertiary">done_all</span>
                </div>
              </div>


              {/* Score Card 2: Impact Score */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-white/[0.06] shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-white/[0.12] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-code-mono text-xs uppercase tracking-wider text-outline font-semibold">Quantified Impact</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-extrabold text-primary">
                        {analyzedData
                          ? (analyzedData.category_scores?.find((c: any) => c.category_name.toLowerCase().includes("impact"))?.score ?? 91)
                          : (diffState.rev1Accepted ? "98" : "91")}
                      </span>
                      <span className="font-code-mono text-xs text-outline">/100</span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">query_stats</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-code-mono">
                    <span className="text-on-surface-variant">Metric Velocity</span>
                    <span className="text-primary font-semibold">
                      {analyzedData?.formatting_evaluation?.impact_evaluation
                        ? `${analyzedData.formatting_evaluation.impact_evaluation.bullets_with_metrics} Metrics / ${analyzedData.formatting_evaluation.impact_evaluation.total_bullets_analyzed} Bullets`
                        : (diffState.rev1Accepted ? "17 Metrics / 6 Exp" : "14 Metrics / 6 Exp")}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-variant overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${analyzedData
                          ? (analyzedData.category_scores?.find((c: any) => c.category_name.toLowerCase().includes("impact"))?.score ?? 91)
                          : (diffState.rev1Accepted ? 98 : 91)}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Score Card 3: Brevity & Precision */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-white/[0.06] shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-white/[0.12] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-code-mono text-xs uppercase tracking-wider text-outline font-semibold">Brevity &amp; Density</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-extrabold text-secondary">
                        {analyzedData
                          ? (analyzedData.category_scores?.find((c: any) => c.category_name.toLowerCase().includes("structure"))?.score ?? 84)
                          : (diffState.rev2Accepted ? "92" : "84")}
                      </span>
                      <span className="font-code-mono text-xs text-outline">/100</span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-secondary-container/20 border border-secondary/30 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[22px]">compress</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-code-mono">
                    <span className="text-on-surface-variant">Density Ratio</span>
                    <span className="text-secondary font-semibold">
                      {analyzedData?.formatting_evaluation?.layout_metrics?.words_per_page
                        ? `${analyzedData.formatting_evaluation.layout_metrics.words_per_page} w/pg (${analyzedData.formatting_evaluation.layout_metrics.page_count} pg)`
                        : "18.4 words (Optimal)"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-variant overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all duration-500"
                      style={{
                        width: `${analyzedData
                          ? (analyzedData.category_scores?.find((c: any) => c.category_name.toLowerCase().includes("structure"))?.score ?? 84)
                          : (diffState.rev2Accepted ? 92 : 84)}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Score Card 4: Keyword Index */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-white/[0.06] shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-white/[0.12] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-code-mono text-xs uppercase tracking-wider text-outline font-semibold">Hard Skill Match</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-extrabold text-tertiary">
                        {analyzedData
                          ? `${analyzedData.category_scores?.find((c: any) => c.category_name.toLowerCase().includes("keyword"))?.score ?? 88}%`
                          : (diffState.ebpfInjected ? "98%" : "94%")}
                      </span>
                      <span className="font-code-mono text-xs text-outline">
                        {analyzedData?.keyword_matching?.jd_match
                          ? `${analyzedData.keyword_matching.jd_match.matched_count}/${analyzedData.keyword_matching.jd_match.total_jd_keywords}`
                          : (diffState.ebpfInjected ? "19/19" : "18/19")}
                      </span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-tertiary-container/20 border border-tertiary/30 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[22px]">schema</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-code-mono">
                    <span className="text-on-surface-variant">Role Profile</span>
                    <span className="text-tertiary font-semibold truncate max-w-[140px]">
                      {analyzedData?.keyword_matching?.role_match?.role_title || "Staff / Principal SWE"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-variant overflow-hidden">
                    <div
                      className="h-full bg-tertiary rounded-full transition-all duration-500"
                      style={{
                        width: `${analyzedData
                          ? (analyzedData.category_scores?.find((c: any) => c.category_name.toLowerCase().includes("keyword"))?.score ?? 88)
                          : (diffState.ebpfInjected ? 98 : 94)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Split View Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT PANEL: Parsed Resume Stream with Interactive Heatmaps (5 Columns) */}
              <div className="lg:col-span-5 flex flex-col gap-4 bg-surface-container-lowest p-5 rounded-2xl border border-white/[0.06] shadow-2xl">
                {/* Document Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">picture_as_pdf</span>
                    <span className="font-code-mono text-xs text-on-surface font-semibold truncate max-w-[210px]">
                      {file ? file.name : (analyzedData ? `${analyzedData.parsed_data?.contact?.name?.toLowerCase().replace(/\s+/g, '_')}_resume.pdf` : "resume_lead_backend.pdf")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-code-mono text-[10px]">
                      {analyzedData ? `${analyzedData.grade} RATED` : "148ms PARSE"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-code-mono text-[10px]">
                      {analyzedData?.formatting_evaluation?.layout_metrics?.total_words
                        ? `${analyzedData.formatting_evaluation.layout_metrics.total_words} WORDS`
                        : "582 WORDS"}
                    </span>
                    <button
                      onClick={() => setShowDiffModal(true)}
                      className="p-1 rounded bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                      title="Enlarge Diff Viewer"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_full</span>
                    </button>
                  </div>
                </div>

                {/* Parsed Text Interactive Canvas (Simulated Document Layout) */}
                <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-4 text-xs text-on-surface-variant border border-white/[0.04] shadow-inner max-h-[780px] overflow-y-auto">
                  {/* Candidate Header */}
                  <div className="flex flex-col items-center text-center pb-3 bg-surface-container-lowest/50 p-3 rounded-xl border border-white/[0.04]">
                    <span className="font-bold text-sm text-on-surface tracking-wide">
                      {(analyzedData?.parsed_data?.contact?.name || "ALEXANDER CHEN").toUpperCase()}
                    </span>
                    <span className="font-code-mono text-[11px] text-primary mt-0.5">
                      {analyzedData?.parsed_data?.contact?.email
                        ? `${analyzedData.parsed_data.contact.location || "Location Detected"} • ${analyzedData.parsed_data.contact.email} • ${analyzedData.parsed_data.contact.phone || analyzedData.parsed_data.contact.github || ""}`
                        : "SF Bay Area • alexander.chen@dev.io • github.com/achen-distributed"}
                    </span>
                    <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                      {analyzedData?.skills && analyzedData.skills.length > 0 ? (
                        analyzedData.skills.flatMap((sg: any) => sg.skills).slice(0, 6).map((skill: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-primary-container/20 text-primary text-[10px] font-code-mono border border-primary/20">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary text-[10px] font-code-mono border border-primary/20">Go / Rust / C++</span>
                          <span className="px-2 py-0.5 rounded bg-secondary-container/20 text-secondary text-[10px] font-code-mono border border-secondary/20">Raft Consensus</span>
                          <span className="px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary text-[10px] font-code-mono border border-tertiary/20">High-throughput Kafka</span>
                        </>
                      )}
                      {diffState.ebpfInjected && (
                        <span className="px-2 py-0.5 rounded bg-tertiary-container/30 text-tertiary text-[10px] font-code-mono border border-tertiary/30 animate-pulse">
                          eBPF Observability
                        </span>
                      )}
                    </div>
                  </div>


                  {/* Experience Item 1 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-xs text-on-surface">Staff Infrastructure Engineer • FinCloud Inc.</span>
                      <span className="font-code-mono text-[11px] text-outline">2021 — Present</span>
                    </div>

                    {/* Bullet 1 */}
                    <div className="p-2.5 rounded-xl bg-surface-container border border-white/[0.04] transition-all flex flex-col gap-1.5" id="bullet-preview-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-code-mono uppercase flex items-center gap-1 font-semibold ${diffState.rev1Accepted ? "text-tertiary" : "text-error"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${diffState.rev1Accepted ? "bg-tertiary" : "bg-error"}`} />
                          {diffState.rev1Accepted ? "Rewritten & Quantified" : "Flagged: Low Impact & Unquantified"}
                        </span>
                        {!diffState.rev1Accepted && (
                          <button onClick={() => scrollToRevision("rev-1")} className="text-[10px] font-code-mono text-primary hover:underline">
                            View Fix #1 →
                          </button>
                        )}
                      </div>
                      {diffState.rev1Accepted ? (
                        <p className="text-on-surface bg-tertiary-container/15 p-2 rounded-lg text-xs leading-relaxed border border-tertiary/20">
                          Architected zero-downtime distributed <strong className="text-primary">PostgreSQL shard cluster</strong>, decreasing p99 settlement latency by <strong className="text-tertiary">38%</strong> across <strong className="text-tertiary">$1.4B quarterly volume</strong> while automating MTTR from 45m to 3.2m.
                        </p>
                      ) : (
                        <p className="text-on-surface bg-error-container/20 p-2 rounded-lg text-xs leading-relaxed line-through text-outline border border-error/20">
                          Worked on backend payment infrastructure, managed database migrations, and improved team response times for system alerts.
                        </p>
                      )}
                    </div>

                    {/* Good Bullet Highlighted */}
                    <div className="p-2.5 rounded-xl bg-surface-container-high/40 border border-white/[0.04] flex flex-col gap-1">
                      <p className="text-xs leading-relaxed text-on-surface">
                        Engineered real-time transaction reconciliation pipeline in{" "}
                        <mark className="bg-primary/20 text-primary px-1 rounded font-code-mono">Go</mark> and{" "}
                        <mark className="bg-primary/20 text-primary px-1 rounded font-code-mono">Kafka</mark>, handling{" "}
                        <span className="text-tertiary font-semibold">85,000 req/sec</span> with p99 latencies under{" "}
                        <span className="text-tertiary font-semibold">12ms</span> across 6 global AWS regions.
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-code-mono text-tertiary mt-0.5">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span> Perfect X-Y-Z Metric Framing
                      </div>
                    </div>

                    {/* Bullet 2 */}
                    <div className="p-2.5 rounded-xl bg-surface-container border border-white/[0.04] transition-all flex flex-col gap-1.5" id="bullet-preview-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-code-mono uppercase flex items-center gap-1 font-semibold ${diffState.rev2Accepted ? "text-tertiary" : "text-secondary"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${diffState.rev2Accepted ? "bg-tertiary" : "bg-secondary"}`} />
                          {diffState.rev2Accepted ? "Rewritten & Active Voice" : "Passive Voice & Line Bloat"}
                        </span>
                        {!diffState.rev2Accepted && (
                          <button onClick={() => scrollToRevision("rev-2")} className="text-[10px] font-code-mono text-primary hover:underline">
                            View Fix #2 →
                          </button>
                        )}
                      </div>
                      {diffState.rev2Accepted ? (
                        <p className="text-on-surface bg-tertiary-container/15 p-2 rounded-lg text-xs leading-relaxed border border-tertiary/20">
                          Orchestrated zero-incident migration of <strong className="text-on-surface font-semibold">42 production services</strong> to multi-region <strong className="text-primary font-semibold">Kubernetes (EKS)</strong>, trimming compute spend by <strong className="text-tertiary font-semibold">$340K annually</strong>.
                        </p>
                      ) : (
                        <p className="text-on-surface bg-secondary-container/20 p-2 rounded-lg text-xs leading-relaxed border border-secondary/20">
                          Responsible for spearheading the migration from monolithic architecture to <mark className="bg-primary/20 text-primary px-1 rounded font-code-mono">Kubernetes</mark> clusters.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Experience Item 2 */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.04]">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-xs text-on-surface">Senior Distributed Systems Engineer • VectorData Labs</span>
                      <span className="font-code-mono text-[11px] text-outline">2018 — 2021</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-container-high/40 border border-white/[0.04] flex flex-col gap-1">
                      <p className="text-xs leading-relaxed text-on-surface">
                        Spearheaded the core consensus module implementation using <mark className="bg-primary/20 text-primary px-1 rounded font-code-mono">Raft</mark>, preventing split-brain states across <span className="text-tertiary font-semibold">450+ physical bare-metal nodes</span> and reducing customer failover time by <span className="text-tertiary font-semibold">74%</span>.
                      </p>
                    </div>

                    {/* Bullet 3 */}
                    <div className="p-2.5 rounded-xl bg-surface-container border border-white/[0.04] transition-all flex flex-col gap-1.5" id="bullet-preview-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-code-mono uppercase flex items-center gap-1 font-semibold ${diffState.rev3Accepted ? "text-tertiary" : "text-error"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${diffState.rev3Accepted ? "bg-tertiary" : "bg-error"}`} />
                          {diffState.rev3Accepted ? "Metrics & Scale Added" : "Vague Scale Attribution"}
                        </span>
                        {!diffState.rev3Accepted && (
                          <button onClick={() => scrollToRevision("rev-3")} className="text-[10px] font-code-mono text-primary hover:underline">
                            View Fix #3 →
                          </button>
                        )}
                      </div>
                      {diffState.rev3Accepted ? (
                        <p className="text-on-surface bg-tertiary-container/15 p-2 rounded-lg text-xs leading-relaxed border border-tertiary/20">
                          Configured distributed <strong className="text-primary font-semibold">Redis Cluster layer with L1 memory caching</strong>, elevating hit ratios to <strong className="text-tertiary font-semibold">99.4%</strong> and shedding 140ms off API gateway response times.
                        </p>
                      ) : (
                        <p className="text-on-surface bg-error-container/20 p-2 rounded-lg text-xs leading-relaxed border border-error/20">
                          Helped configure Redis caches and improved query performance for API clients.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Parsed Skills Cloud */}
                  <div className="pt-2 flex flex-col gap-1.5 border-t border-white/[0.04]">
                    <span className="font-code-mono text-[10px] uppercase tracking-wider text-outline font-semibold">ATS Parsed Technical Taxonomy</span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[11px] font-code-mono border border-white/[0.06]">Go (Golang)</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[11px] font-code-mono border border-white/[0.06]">Rust</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[11px] font-code-mono border border-white/[0.06]">Distributed Consensus</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[11px] font-code-mono border border-white/[0.06]">Apache Kafka</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[11px] font-code-mono border border-white/[0.06]">PostgreSQL</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[11px] font-code-mono border border-white/[0.06]">Kubernetes (K8s)</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[11px] font-code-mono border border-white/[0.06]">gRPC / Protobuf</span>
                      {diffState.ebpfInjected && (
                        <span className="px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary text-[11px] font-code-mono border border-tertiary/20">eBPF</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Heatmap Legend */}
                <div className="flex flex-wrap items-center justify-between text-[10px] text-outline font-code-mono pt-1 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-error/80" /> Gaps &amp; Low Impact
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-secondary/80" /> Verb Velocity / Fluff
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-primary/80" /> Target Keyword
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-tertiary/80" /> Quantified Metric
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL: The 4-Pillar Diagnostic Engine (7 Columns) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Diagnostic Tab Navigation */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setActivePillar(1)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                      activePillar === 1
                        ? "bg-surface-container-high text-primary shadow-md border border-primary/30"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">data_thresholding</span>
                    1. Impact &amp; Metrics
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-code-mono">
                      {diffState.rev1Accepted ? "98" : "91"}
                    </span>
                  </button>
                  <button
                    onClick={() => setActivePillar(2)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                      activePillar === 2
                        ? "bg-surface-container-high text-secondary shadow-md border border-secondary/30"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">reorder</span>
                    2. Brevity &amp; Flow
                    <span className="px-1.5 py-0.5 rounded-full bg-surface-variant text-on-surface-variant text-[10px] font-code-mono">
                      {diffState.rev2Accepted ? "92" : "84"}
                    </span>
                  </button>
                  <button
                    onClick={() => setActivePillar(3)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                      activePillar === 3
                        ? "bg-surface-container-high text-primary shadow-md border border-primary/30"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    3. Executive Tone
                    <span className="px-1.5 py-0.5 rounded-full bg-surface-variant text-on-surface-variant text-[10px] font-code-mono">88</span>
                  </button>
                  <button
                    onClick={() => setActivePillar(4)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                      activePillar === 4
                        ? "bg-surface-container-high text-tertiary shadow-md border border-tertiary/30"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">tag</span>
                    4. Tech Skills
                    <span className="px-1.5 py-0.5 rounded-full bg-tertiary/20 text-tertiary text-[10px] font-code-mono">
                      {diffState.ebpfInjected ? "98" : "94"}
                    </span>
                  </button>
                </div>

                {/* PILLAR 1: Impact & Quantified Metrics Section */}
                {activePillar === 1 && (
                  <div className="bg-surface-container-low rounded-2xl p-6 border border-white/[0.06] shadow-xl flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[20px]">trending_up</span>
                        </div>
                        <div>
                          <h3 className="font-headline-sm text-base font-bold text-on-surface">Pillar 1: Quantified Impact Engine</h3>
                          <p className="text-xs text-on-surface-variant">Converting passive descriptions into measurable scale wins.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-tertiary-container/20 text-tertiary font-code-mono text-xs font-semibold border border-tertiary/20">
                        +14.2% ATS Lift Potential
                      </span>
                    </div>

                    {/* Diff Card 1 */}
                    <div className={`bg-surface-container rounded-xl p-4 flex flex-col gap-3 border transition-all ${diffState.rev1Accepted ? "border-tertiary/30 opacity-75" : "border-white/[0.06] shadow-md"}`} id="rev-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-error-container/40 text-error font-code-mono text-[10px] font-bold uppercase">
                            High Priority Diff
                          </span>
                          <span className="text-xs text-outline font-code-mono">FinCloud Inc. • Lead Infrastructure</span>
                        </div>
                        <span className="font-code-mono text-xs text-tertiary font-semibold">+22 Pts Metric Power</span>
                      </div>

                      <div className="bg-surface-container-lowest/80 p-3 rounded-xl flex items-start gap-2 border border-white/[0.04]">
                        <span className="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">remove_circle_outline</span>
                        <div className="flex flex-col">
                          <span className="font-code-mono text-[10px] text-error font-semibold uppercase">Current Input (Passive / Unquantified)</span>
                          <p className="text-xs text-outline line-through leading-relaxed mt-0.5">
                            Worked on backend payment infrastructure, managed database migrations, and improved team response times for system alerts.
                          </p>
                        </div>
                      </div>

                      <div className="bg-surface-container-high p-3 rounded-xl flex items-start gap-2 border border-white/[0.06]">
                        <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">add_circle</span>
                        <div className="flex flex-col w-full">
                          <span className="font-code-mono text-[10px] text-tertiary font-semibold uppercase">Engine Suggestion (XYZ Framework: Accomplished X by doing Y as measured by Z)</span>
                          <p className="text-xs text-on-surface leading-relaxed mt-0.5">
                            Architected zero-downtime distributed <strong className="text-primary font-semibold">PostgreSQL shard cluster</strong>, decreasing p99 settlement latency by <strong className="text-tertiary font-semibold">38%</strong> across <strong className="text-tertiary font-semibold">$1.4B quarterly volume</strong> while automating MTTR from 45m to 3.2m.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3 text-[11px] text-on-surface-variant font-code-mono">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-primary">psychology</span> Added 3 High-Value Verbs</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-tertiary">attach_money</span> Scale Attribution</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptDiff("rev1")}
                            disabled={diffState.rev1Accepted}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              diffState.rev1Accepted
                                ? "bg-tertiary-container text-white cursor-default"
                                : "bg-primary-container text-white hover:brightness-110 shadow-sm"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">{diffState.rev1Accepted ? "done" : "check"}</span>
                            {diffState.rev1Accepted ? "Applied" : "Accept Revision"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Diff Card 2 */}
                    <div className={`bg-surface-container rounded-xl p-4 flex flex-col gap-3 border transition-all ${diffState.rev2Accepted ? "border-tertiary/30 opacity-75" : "border-white/[0.06] shadow-md"}`} id="rev-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-secondary-container/40 text-secondary font-code-mono text-[10px] font-bold uppercase">
                            Verb Velocity Diff
                          </span>
                          <span className="text-xs text-outline font-code-mono">FinCloud Inc. • Cloud Strategy</span>
                        </div>
                        <span className="font-code-mono text-xs text-tertiary font-semibold">+15 Pts Brevity Lift</span>
                      </div>

                      <div className="bg-surface-container-lowest/80 p-3 rounded-xl flex items-start gap-2 border border-white/[0.04]">
                        <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">remove_circle_outline</span>
                        <div className="flex flex-col">
                          <span className="font-code-mono text-[10px] text-secondary font-semibold uppercase">Current Input (Weak Lead Verb &amp; Vagueness)</span>
                          <p className="text-xs text-outline line-through leading-relaxed mt-0.5">
                            Responsible for spearheading the migration from monolithic architecture to Kubernetes clusters.
                          </p>
                        </div>
                      </div>

                      <div className="bg-surface-container-high p-3 rounded-xl flex items-start gap-2 border border-white/[0.06]">
                        <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">add_circle</span>
                        <div className="flex flex-col w-full">
                          <span className="font-code-mono text-[10px] text-tertiary font-semibold uppercase">Engine Suggestion (Action-Driven Velocity)</span>
                          <p className="text-xs text-on-surface leading-relaxed mt-0.5">
                            Orchestrated zero-incident migration of <strong className="text-on-surface font-semibold">42 production services</strong> to multi-region <strong className="text-primary font-semibold">Kubernetes (EKS)</strong>, trimming compute infrastructure spend by <strong className="text-tertiary font-semibold">$340K annually</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-on-surface-variant flex items-center gap-1 font-code-mono">
                          <span className="material-symbols-outlined text-[14px] text-tertiary">speed</span> Eradicated fluff prefix ‘Responsible for’
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptDiff("rev2")}
                            disabled={diffState.rev2Accepted}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              diffState.rev2Accepted
                                ? "bg-tertiary-container text-white cursor-default"
                                : "bg-primary-container text-white hover:brightness-110 shadow-sm"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">{diffState.rev2Accepted ? "done" : "check"}</span>
                            {diffState.rev2Accepted ? "Applied" : "Accept Revision"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Diff Card 3 */}
                    <div className={`bg-surface-container rounded-xl p-4 flex flex-col gap-3 border transition-all ${diffState.rev3Accepted ? "border-tertiary/30 opacity-75" : "border-white/[0.06] shadow-md"}`} id="rev-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-error-container/40 text-error font-code-mono text-[10px] font-bold uppercase">
                            Metrics Infusion
                          </span>
                          <span className="text-xs text-outline font-code-mono">VectorData Labs • Core Caching</span>
                        </div>
                        <span className="font-code-mono text-xs text-tertiary font-semibold">+18 Pts Impact Lift</span>
                      </div>

                      <div className="bg-surface-container-lowest/80 p-3 rounded-xl flex items-start gap-2 border border-white/[0.04]">
                        <span className="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">remove_circle_outline</span>
                        <div className="flex flex-col">
                          <span className="font-code-mono text-[10px] text-error font-semibold uppercase">Current Input</span>
                          <p className="text-xs text-outline line-through leading-relaxed mt-0.5">
                            Helped configure Redis caches and improved query performance for API clients.
                          </p>
                        </div>
                      </div>

                      <div className="bg-surface-container-high p-3 rounded-xl flex items-start gap-2 border border-white/[0.06]">
                        <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">add_circle</span>
                        <div className="flex flex-col w-full">
                          <span className="font-code-mono text-[10px] text-tertiary font-semibold uppercase">Engine Suggestion</span>
                          <p className="text-xs text-on-surface leading-relaxed mt-0.5">
                            Configured distributed <strong className="text-primary font-semibold">Redis Cluster layer with L1 memory caching</strong>, elevating hit ratios to <strong className="text-tertiary font-semibold">99.4%</strong> and shedding 140ms off API gateway response times.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-on-surface-variant flex items-center gap-1 font-code-mono">
                          <span className="material-symbols-outlined text-[14px] text-primary">token</span> Injected hit ratios and latency metrics
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptDiff("rev3")}
                            disabled={diffState.rev3Accepted}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              diffState.rev3Accepted
                                ? "bg-tertiary-container text-white cursor-default"
                                : "bg-primary-container text-white hover:brightness-110 shadow-sm"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">{diffState.rev3Accepted ? "done" : "check"}</span>
                            {diffState.rev3Accepted ? "Applied" : "Accept Revision"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PILLAR 2: Brevity & Structure Card */}
                {activePillar === 2 && (
                  <div className="bg-surface-container-low rounded-2xl p-6 border border-white/[0.06] shadow-xl flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-secondary-container/20 border border-secondary/30 flex items-center justify-center text-secondary">
                          <span className="material-symbols-outlined text-[20px]">compress</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-on-surface">Pillar 2: Brevity &amp; Flow</h4>
                          <p className="text-xs text-on-surface-variant">Ensuring high information density with zero run-on sentences.</p>
                        </div>
                      </div>
                      <span className="font-code-mono text-sm text-secondary font-bold">84/100</span>
                    </div>

                    {/* Micro Histogram for Line Length */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs font-code-mono">
                        <span className="text-on-surface-variant">Bullet Word Length Distribution</span>
                        <span className="text-tertiary">Optimum Range: 14–22 words</span>
                      </div>
                      {/* SVG Bar Histogram */}
                      <div className="h-20 w-full bg-surface-container rounded-xl p-3 flex items-end justify-between gap-2 border border-white/[0.04]">
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-surface-variant rounded-t h-3" title="6-10 words: 1 bullet" />
                          <span className="text-[10px] font-code-mono text-outline">6-10</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-surface-variant rounded-t h-6" title="11-13 words: 2 bullets" />
                          <span className="text-[10px] font-code-mono text-outline">11-13</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-secondary rounded-t h-12" title="14-17 words: 7 bullets" />
                          <span className="text-[10px] font-code-mono text-secondary font-bold">14-17</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-secondary-container rounded-t h-10" title="18-21 words: 6 bullets" />
                          <span className="text-[10px] font-code-mono text-secondary font-bold">18-21</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-error rounded-t h-5" title="22-26 words: 3 bullets" />
                          <span className="text-[10px] font-code-mono text-error">22-26</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-error-container rounded-t h-2" title="27+ words: 1 bullet" />
                          <span className="text-[10px] font-code-mono text-error">27+</span>
                        </div>
                      </div>
                    </div>

                    {/* Fluff Word Detector Tags */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.04]">
                      <span className="font-code-mono text-xs text-outline uppercase tracking-wider font-semibold">
                        Fluff Phrases Flagged for Pruning
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-surface-container text-error text-xs font-code-mono flex items-center gap-1.5 border border-error/20">
                          <span className="material-symbols-outlined text-[14px]">close</span> “Responsible for”
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-surface-container text-error text-xs font-code-mono flex items-center gap-1.5 border border-error/20">
                          <span className="material-symbols-outlined text-[14px]">close</span> “Assisted with”
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface text-xs font-code-mono flex items-center gap-1.5 border border-white/[0.06]">
                          <span className="material-symbols-outlined text-[14px] text-tertiary">check</span> “Architected”
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PILLAR 3: Executive Tone & Style Card */}
                {activePillar === 3 && (
                  <div className="bg-surface-container-low rounded-2xl p-6 border border-white/[0.06] shadow-xl flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[20px]">bolt</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-on-surface">Pillar 3: Tone &amp; Velocity</h4>
                          <p className="text-xs text-on-surface-variant">Replacing collaborative ambiguity with decisive engineering ownership.</p>
                        </div>
                      </div>
                      <span className="font-code-mono text-sm text-primary font-bold">88/100</span>
                    </div>

                    {/* Verb Category Spark-Bars */}
                    <div className="flex flex-col gap-3 font-code-mono text-xs">
                      <div>
                        <div className="flex justify-between text-on-surface-variant mb-1.5">
                          <span>Executive Strategy (Orchestrated, Chaired)</span>
                          <span className="text-primary font-bold">32%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: "32%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-on-surface-variant mb-1.5">
                          <span>Technical Architecture (Built, Sharded, Deployed)</span>
                          <span className="text-secondary font-bold">54%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                          <div className="h-full bg-secondary rounded-full" style={{ width: "54%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-on-surface-variant mb-1.5">
                          <span>Passive Operational (Monitored, Helped, Maintained)</span>
                          <span className="text-error font-bold">14% (Goal &lt; 5%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                          <div className="h-full bg-error rounded-full" style={{ width: "14%" }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container flex items-center gap-3 border border-white/[0.04]">
                      <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
                      <span className="text-xs text-on-surface-variant leading-relaxed">
                        Replace 2 remaining collaborative verbs with decisive engineering ownership predicates to score &gt;95 in Executive Tone.
                      </span>
                    </div>
                  </div>
                )}

                {/* PILLAR 4: Hard Skills & Keyword Extraction Engine */}
                {activePillar === 4 && (
                  <div className="bg-surface-container-low rounded-2xl p-6 border border-white/[0.06] shadow-xl flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-tertiary-container/20 border border-tertiary/30 flex items-center justify-center text-tertiary">
                          <span className="material-symbols-outlined text-[20px]">tag</span>
                        </div>
                        <div>
                          <h3 className="font-headline-sm text-base font-bold text-on-surface">Pillar 4: Tech Stack &amp; ATS Keyword Taxonomy</h3>
                          <p className="text-xs text-on-surface-variant">Validated against 4,200 Tier-1 Tech L6/L7 Staff Backend Engine Specs.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-surface-container text-tertiary font-code-mono text-xs font-semibold border border-tertiary/20">
                        {diffState.ebpfInjected ? "98% Match Index" : "94% Match Index"}
                      </span>
                    </div>

                    {/* Keyword Matrix Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-outline font-code-mono text-[11px] uppercase tracking-wider bg-surface-container-lowest/50">
                            <th className="py-2.5 px-3 rounded-l-lg">Tier-1 Keyword Target</th>
                            <th className="py-2.5 px-3">ATS Extraction Count</th>
                            <th className="py-2.5 px-3">Contextual Rigor</th>
                            <th className="py-2.5 px-3 rounded-r-lg text-right">JD Importance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          <tr className="hover:bg-surface-container transition-colors">
                            <td className="py-2.5 px-3 font-code-mono text-on-surface font-semibold flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-tertiary" /> Go / Golang
                            </td>
                            <td className="py-2.5 px-3 text-on-surface-variant font-code-mono">6 instances</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary text-[11px] font-medium border border-tertiary/20">
                                Production Architecture
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-code-mono text-primary font-bold">Mandatory (10/10)</td>
                          </tr>
                          <tr className="hover:bg-surface-container transition-colors">
                            <td className="py-2.5 px-3 font-code-mono text-on-surface font-semibold flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-tertiary" /> Distributed Consensus (Raft/Paxos)
                            </td>
                            <td className="py-2.5 px-3 text-on-surface-variant font-code-mono">2 instances</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary text-[11px] font-medium border border-tertiary/20">
                                Core Bare-Metal Scale
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-code-mono text-primary font-bold">Crucial (9/10)</td>
                          </tr>
                          <tr className="hover:bg-surface-container transition-colors">
                            <td className="py-2.5 px-3 font-code-mono text-on-surface font-semibold flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-tertiary" /> Apache Kafka Event Streaming
                            </td>
                            <td className="py-2.5 px-3 text-on-surface-variant font-code-mono">3 instances</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary text-[11px] font-medium border border-tertiary/20">
                                High-Throughput Partitioning
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-code-mono text-primary font-bold">Crucial (9/10)</td>
                          </tr>
                          <tr className="hover:bg-surface-container transition-colors">
                            <td className="py-2.5 px-3 font-code-mono text-on-surface font-semibold flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-tertiary" /> Kubernetes / K8s
                            </td>
                            <td className="py-2.5 px-3 text-on-surface-variant font-code-mono">4 instances</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary text-[11px] font-medium border border-tertiary/20">
                                Container Orchestration
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-code-mono text-primary font-bold">Mandatory (9/10)</td>
                          </tr>
                          <tr className="hover:bg-surface-container transition-colors">
                            <td className="py-2.5 px-3 font-code-mono text-on-surface font-semibold flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${diffState.ebpfInjected ? "bg-tertiary" : "bg-error animate-pulse"}`} />
                              eBPF Kernel Tracing
                            </td>
                            <td className={`py-2.5 px-3 font-code-mono ${diffState.ebpfInjected ? "text-tertiary" : "text-error"}`}>
                              {diffState.ebpfInjected ? "1 instance (Injected)" : "0 instances (Missing)"}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${diffState.ebpfInjected ? "bg-tertiary-container/20 text-tertiary border-tertiary/20" : "bg-error-container/30 text-error border-error/30"}`}>
                                {diffState.ebpfInjected ? "Observability Layer" : "High Match Delta"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-code-mono text-outline font-bold">Preferred (6/10)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Single-Click Quick Fix for Missing Keywords */}
                    <div className="p-3.5 rounded-xl bg-surface-container-highest/60 flex items-center justify-between border border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">add_task</span>
                        <span className="text-xs text-on-surface">Inject ‘eBPF Observability’ into Senior Systems role?</span>
                      </div>
                      <button
                        onClick={() => setDiffState((prev) => ({ ...prev, ebpfInjected: !prev.ebpfInjected }))}
                        className="px-3 py-1.5 rounded-lg bg-surface-container text-primary hover:bg-surface-bright text-xs font-semibold transition-all border border-primary/20 shadow-sm"
                      >
                        {diffState.ebpfInjected ? "✓ Injected (+2% Match)" : "Quick Inject (+2% Match)"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Sticky Context Control Deck */}
            <div className="sticky bottom-4 z-40 w-full bg-surface-container-highest/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/[0.1] shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-tertiary-container/30 text-tertiary border border-tertiary/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">verified_user</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-on-surface">Target Ready for Submission</span>
                  <span className="font-code-mono text-xs text-on-surface-variant">
                    Predicted ATS Pass-Through Confidence: {allAccepted ? "99.2%" : "98.4%"} across Fortune 500 ATS
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDiffModal(true)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface-variant hover:text-on-surface border border-white/[0.08] transition-colors"
                >
                  Compare Raw Diff
                </button>
                <button
                  onClick={handleExportPdf}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-xs font-bold text-white shadow-lg shadow-primary-container/25 hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {exportState === "compiling" ? "progress_activity" : exportState === "ready" ? "download_done" : "file_download"}
                  </span>
                  {exportState === "compiling" ? "Compiling TeX..." : exportState === "ready" ? "Download Ready!" : "Download ATS-Guaranteed PDF"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* RE-SCAN / UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-white/[0.1] rounded-3xl max-w-lg w-full p-6 sm:p-8 flex flex-col gap-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface">Re-scan with Target JD</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer flex flex-col items-center justify-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-white/[0.12] hover:border-primary/50 hover:bg-surface-container"
              } ${file ? "bg-surface-container-high border-solid" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
              {file ? (
                <div className="flex flex-col items-center">
                  <span className="material-symbols-outlined text-primary text-[36px] mb-2">description</span>
                  <p className="font-semibold text-sm text-on-surface mb-1">{file.name}</p>
                  <p className="text-xs text-outline mb-3">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs text-error hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span> Remove file
                  </button>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-primary text-[36px] mb-2">cloud_upload</span>
                  <p className="font-semibold text-sm text-on-surface mb-1">Drag &amp; drop updated PDF resume</p>
                  <p className="text-xs text-outline mb-2">or click to browse files</p>
                  <span className="text-[10px] font-code-mono text-outline bg-surface-container px-2.5 py-0.5 rounded-full">
                    Max 5MB • PDF format
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant">Target Role or Job Description URL</label>
              <input
                type="text"
                placeholder="e.g. Staff Backend Engineer @ Stripe"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-white/[0.08] text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface-variant hover:text-on-surface border border-white/[0.08]"
              >
                Cancel
              </button>
              <button
                onClick={handleRunAnalysis}
                disabled={!file || isAnalyzing}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-xs font-semibold text-white hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">{isAnalyzing ? "progress_activity" : "bolt"}</span>
                {isAnalyzing ? "Parsing with Core 4.2..." : "Run ATS Scan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAW DIFF MODAL */}
      {showDiffModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-white/[0.1] rounded-3xl max-w-3xl w-full p-6 sm:p-8 flex flex-col gap-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">difference</span>
                <h3 className="text-base font-bold text-on-surface">Raw Semantic Differential</h3>
              </div>
              <button onClick={() => setShowDiffModal(false)} className="text-on-surface-variant hover:text-on-surface p-1">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-container border border-white/[0.04]">
                <span className="font-code-mono text-outline text-[10px] uppercase font-bold">Diff 1: Metric Attribution</span>
                <p className="line-through text-error bg-error-container/15 p-2 rounded-lg mt-1 font-code-mono">
                  Worked on backend payment infrastructure, managed database migrations, and improved team response times for system alerts.
                </p>
                <p className="text-tertiary bg-tertiary-container/15 p-2 rounded-lg mt-1 font-code-mono">
                  Architected zero-downtime distributed PostgreSQL shard cluster, decreasing p99 settlement latency by 38% across $1.4B quarterly volume while automating MTTR from 45m to 3.2m.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container border border-white/[0.04]">
                <span className="font-code-mono text-outline text-[10px] uppercase font-bold">Diff 2: Verb Velocity</span>
                <p className="line-through text-secondary bg-secondary-container/15 p-2 rounded-lg mt-1 font-code-mono">
                  Responsible for spearheading the migration from monolithic architecture to Kubernetes clusters.
                </p>
                <p className="text-tertiary bg-tertiary-container/15 p-2 rounded-lg mt-1 font-code-mono">
                  Orchestrated zero-incident migration of 42 production services to multi-region Kubernetes (EKS), trimming compute infrastructure spend by $340K annually.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container border border-white/[0.04]">
                <span className="font-code-mono text-outline text-[10px] uppercase font-bold">Diff 3: Scale Attribution</span>
                <p className="line-through text-error bg-error-container/15 p-2 rounded-lg mt-1 font-code-mono">
                  Helped configure Redis caches and improved query performance for API clients.
                </p>
                <p className="text-tertiary bg-tertiary-container/15 p-2 rounded-lg mt-1 font-code-mono">
                  Configured distributed Redis Cluster layer with L1 memory caching, elevating hit ratios to 99.4% and shedding 140ms off API gateway response times.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDiffModal(false)}
                className="px-5 py-2 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-bright"
              >
                Close Diff
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
