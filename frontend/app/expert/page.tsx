"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ExpertProfile } from "@/lib/types";
import { apiGet, apiPut } from "@/lib/api";
import { PageShell, ObsidianCard } from "@/components/layout/PageShell";

export default function ExpertPage() {
  return (
    <ProtectedRoute allowedRoles={["expert", "admin"]}>
      <ExpertDashboardContent />
    </ProtectedRoute>
  );
}

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary";
const LABEL_CLS = "text-xs font-medium text-on-surface-variant";

function ExpertDashboardContent() {
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [companyTitle, setCompanyTitle] = useState("");
  const [domains, setDomains] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExpertProfile() {
      setLoading(true);
      const res = await apiGet<ExpertProfile>("/api/users/expert/profile");
      if (res.data) {
        setProfile(res.data);
        setCompanyTitle(res.data.company_title || "");
        setDomains(res.data.domains || "");
        setBio(res.data.bio || "");
      }
      setLoading(false);
    }
    loadExpertProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const res = await apiPut<ExpertProfile>("/api/users/expert/profile", {
      company_title: companyTitle,
      domains: domains,
      bio: bio,
    });

    setSaving(false);
    if (res.data) {
      setProfile(res.data);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <PageShell
      eyebrow="Expert // Mentorship Portal"
      title="Expert Mentorship Hub"
      description="Manage your mock interview credentials, domains, and mentor status."
      icon="record_voice_over"
      wide
      action={
        profile?.approved ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-tertiary-container/20 border border-tertiary/30 text-tertiary text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Verified Expert (Active)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-high border border-secondary/30 text-secondary text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Pending Admin Review</span>
          </div>
        )
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container border border-white/[0.08]">
          <span className="font-code-mono text-[11px] text-outline uppercase tracking-wider">
            Average Rating
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-bold text-on-surface">
              {loading ? "—" : profile?.avg_rating || 4.9}
            </span>
            <span className="material-symbols-outlined text-amber-400 text-[20px]">star</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container border border-white/[0.08]">
          <span className="font-code-mono text-[11px] text-outline uppercase tracking-wider">
            Domain Specialties
          </span>
          <p className="text-base font-semibold text-on-surface truncate mt-1">
            {domains || "DSA, System Design"}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container border border-white/[0.08]">
          <span className="font-code-mono text-[11px] text-outline uppercase tracking-wider">
            Current Role
          </span>
          <p className="text-base font-semibold text-on-surface truncate mt-1">
            {companyTitle || "Senior Software Engineer"}
          </p>
        </div>
      </div>

      {/* Edit Profile Form */}
      <ObsidianCard>
        <form onSubmit={handleSave}>
          <h2 className="text-base font-bold text-on-surface">Expert Profile & Credentials</h2>
          <p className="text-xs text-on-surface-variant mt-0.5 mb-4">
            These details will be displayed to candidates booking mock interview sessions.
          </p>
          <div className="space-y-4">
            {savedSuccess && (
              <div className="p-3 rounded-xl bg-tertiary-container/20 border border-tertiary/30 text-tertiary text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Expert profile updated successfully!</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className={LABEL_CLS}>Current Title & Organization</label>
              <input
                className={INPUT_CLS}
                placeholder="e.g. SDE-2 at Microsoft or Alum (Class of 2023)"
                value={companyTitle}
                onChange={(e) => setCompanyTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className={LABEL_CLS}>Interview Domains (comma separated)</label>
              <input
                className={INPUT_CLS}
                placeholder="e.g. Data Structures & Algorithms, System Design, Behavioral/HR"
                value={domains}
                onChange={(e) => setDomains(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className={LABEL_CLS}>Professional Bio & Mentorship Philosophy</label>
              <textarea
                rows={4}
                className={`${INPUT_CLS} resize-none`}
                placeholder="Share your experience, what rounds you've passed, and how you conduct your mock interviews..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>
          <div className="border-t border-white/[0.06] mt-5 pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-sm font-semibold text-white hover:brightness-110 transition-all disabled:opacity-40"
            >
              {saving ? "Saving Changes..." : "Save Expert Profile"}
            </button>
          </div>
        </form>
      </ObsidianCard>
    </PageShell>
  );
}
