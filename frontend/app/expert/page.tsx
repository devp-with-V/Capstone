"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { ExpertProfile } from "@/lib/types";
import { apiGet, apiPut } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, CheckCircle2, Clock, Star, Briefcase, Code, Check } from "lucide-react";

export default function ExpertPage() {
  return (
    <ProtectedRoute allowedRoles={["expert", "admin"]}>
      <ExpertDashboardContent />
    </ProtectedRoute>
  );
}

function ExpertDashboardContent() {
  const { user } = useAuth();
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
    <div className="container max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Role: Expert
            </span>
            <span className="text-xs text-muted-foreground">Authorized Mentorship Portal</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Expert Mentorship Hub</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your mock interview credentials, domains, and mentor status.
          </p>
        </div>

        {/* Approval Badge */}
        {profile?.approved ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified Expert (Active)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold self-start sm:self-auto">
            <Clock className="w-4 h-4" />
            <span>Pending Admin Review</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium">Average Rating</CardDescription>
            <div className="flex items-center gap-2">
              <CardTitle className="text-3xl font-bold">{profile?.avg_rating || 4.9}</CardTitle>
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium">Domain Specialties</CardDescription>
            <CardTitle className="text-base font-semibold truncate">
              {domains || "DSA, System Design"}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium">Current Role</CardDescription>
            <CardTitle className="text-base font-semibold truncate">
              {companyTitle || "Senior Software Engineer"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Edit Profile Form */}
      <Card className="border-border/80 shadow-md">
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle className="text-xl">Expert Profile & Credentials</CardTitle>
            <CardDescription>
              These details will be displayed to candidates booking mock interview sessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {savedSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Expert profile updated successfully!</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="companyTitle">Current Title & Organization</Label>
              <Input
                id="companyTitle"
                placeholder="e.g. SDE-2 at Microsoft or Alum (Class of 2023)"
                value={companyTitle}
                onChange={(e) => setCompanyTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domains">Interview Domains (comma separated)</Label>
              <Input
                id="domains"
                placeholder="e.g. Data Structures & Algorithms, System Design, Behavioral/HR"
                value={domains}
                onChange={(e) => setDomains(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio & Mentorship Philosophy</Label>
              <textarea
                id="bio"
                rows={4}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Share your experience, what rounds you've passed, and how you conduct your mock interviews..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Expert Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
