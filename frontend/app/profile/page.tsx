"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageShell, ObsidianCard } from "@/components/layout/PageShell";
import { apiGet, apiPut } from "@/lib/api";
import { CandidateProfile } from "@/lib/types";

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["candidate", "expert", "admin"]}>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary";
const LABEL_CLS = "text-xs font-medium text-on-surface-variant";

function ProfilePageContent() {
  const { user } = useAuth();
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [bio, setBio] = useState("Candidate preparing for tech interviews");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    const res = await apiPut<CandidateProfile>("/api/users/profile", {
      target_role: targetRole,
      bio,
    });
    setSaving(false);
    if (res.data) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "CD";

  return (
    <PageShell
      eyebrow="Candidate // Profile"
      title={user?.full_name || "Candidate Profile"}
      description={user?.email || ""}
      icon="person"
      wide
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6 min-w-0">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-code-mono uppercase tracking-wider bg-surface-container-high text-primary border border-primary/20 capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          <ObsidianCard>
            <h2 className="text-base font-bold text-on-surface">Personal Info</h2>
            <p className="text-xs text-on-surface-variant mt-0.5 mb-4">
              Update your personal details and bio.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={LABEL_CLS}>Full Name</label>
                  <input className={INPUT_CLS} defaultValue={user?.full_name || ""} />
                </div>
                <div className="space-y-1.5">
                  <label className={LABEL_CLS}>Email</label>
                  <input className={INPUT_CLS} type="email" defaultValue={user?.email || ""} disabled />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={LABEL_CLS}>Bio</label>
                <textarea
                  className={`${INPUT_CLS} resize-none`}
                  rows={3}
                  placeholder="Tell us a little about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          </ObsidianCard>

          <ObsidianCard>
            <h2 className="text-base font-bold text-on-surface">Interview Goals</h2>
            <p className="text-xs text-on-surface-variant mt-0.5 mb-4">
              What roles and companies are you targeting?
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={LABEL_CLS}>Target Role</label>
                  <input
                    className={INPUT_CLS}
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={LABEL_CLS}>Experience Level</label>
                  <select className={INPUT_CLS} defaultValue="mid">
                    <option value="junior">Junior (0-2 years)</option>
                    <option value="mid">Mid-Level (3-5 years)</option>
                    <option value="senior">Senior (5+ years)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={LABEL_CLS}>Target Companies (comma separated)</label>
                <input className={INPUT_CLS} defaultValue="Google, Meta, Vercel, Stripe" />
              </div>
              <div className="space-y-1.5">
                <label className={LABEL_CLS}>Key Skills</label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-surface-container-lowest border border-white/[0.06] min-h-[50px]">
                  {["React", "TypeScript", "Next.js", "Tailwind CSS"].map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-white/[0.06] text-xs text-on-surface"
                    >
                      {s}
                    </span>
                  ))}
                  <input
                    className="bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none w-32"
                    placeholder="Add skill..."
                  />
                </div>
              </div>
            </div>
          </ObsidianCard>

          <div className="flex items-center justify-between">
            {savedSuccess ? (
              <div className="flex items-center gap-1.5 text-xs text-tertiary font-medium">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Profile updated successfully!</span>
              </div>
            ) : (
              <div />
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-sm font-semibold text-white hover:brightness-110 transition-all disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 space-y-6 shrink-0">
          <ObsidianCard>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[20px]">description</span>
              <h3 className="text-sm font-bold text-on-surface">Recent Reports</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-white/[0.05] pb-3">
                <div>
                  <p className="font-medium text-sm text-on-surface">Frontend Resume v2.pdf</p>
                  <p className="text-xs text-outline">Analyzed 2 days ago</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-code-mono bg-tertiary-container/20 text-tertiary border border-tertiary/20">
                  84
                </span>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm text-on-surface">Software Eng Resume.pdf</p>
                  <p className="text-xs text-outline">Analyzed 2 weeks ago</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-code-mono bg-surface-container-high text-secondary border border-secondary/20">
                  71
                </span>
              </div>
            </div>
            <Link
              href="/report"
              className="block text-center mt-3 text-xs font-semibold text-primary hover:underline"
            >
              View all reports
            </Link>
          </ObsidianCard>

          <ObsidianCard>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">calendar_month</span>
              <h3 className="text-sm font-bold text-on-surface">Upcoming Interviews</h3>
            </div>
            <div className="text-center py-6 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-outline text-[40px] opacity-40">
                work
              </span>
              <p className="mt-2">No upcoming interviews.</p>
              <Link
                href="/mentors"
                className="inline-block mt-4 px-4 py-2 rounded-xl bg-surface-container-high text-xs font-medium text-on-surface hover:bg-surface-bright border border-white/[0.08]"
              >
                Book a session
              </Link>
            </div>
          </ObsidianCard>
        </div>
      </div>
    </PageShell>
  );
}
