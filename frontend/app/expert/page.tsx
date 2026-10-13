"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { ExpertProfile } from "@/lib/types";
import { apiGet, apiPost, apiPut } from "@/lib/api";
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
  const [expertId, setExpertId] = useState("");
const [slots, setSlots] = useState<any[]>([]);
const [slotDate, setSlotDate] = useState("");
const [startTime, setStartTime] = useState("09:00");
const [endTime, setEndTime] = useState("09:30");
const [slotMessage, setSlotMessage] = useState("");
const [slotLoading, setSlotLoading] = useState(false);
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [companyTitle, setCompanyTitle] = useState("");
  const [domains, setDomains] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
    const handleAddSlot = async () => {
    if (!expertId || !slotDate) {
      setSlotMessage("Please select a date first.");
      return;
    }

    const start = new Date(`${slotDate}T${startTime}:00`);
    const end = new Date(`${slotDate}T${endTime}:00`);

    if (end <= start) {
      setSlotMessage("End time must be later than start time.");
      return;
    }

    setSlotLoading(true);
    setSlotMessage("");

    const result = await apiPost(
      `/api/experts/${expertId}/slots`,
      {
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      }
    );

    if (result.error) {
      setSlotMessage(result.error);
    } else {
      setSlotMessage("Availability slot added successfully.");
      await loadSlots(expertId);
    }

    setSlotLoading(false);
  };
    const loadSlots = async (id: string) => {
    const result = await apiGet<any[]>(`/api/experts/${id}/slots`);

    if (result.data) {
      setSlots(result.data);
    }
  };
    const handleRemoveSlot = async (slotId: string) => {
    if (!expertId) return;

    setSlotLoading(true);
    setSlotMessage("");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/experts/${expertId}/slots/${slotId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );

    if (response.ok) {
      setSlotMessage("Availability slot removed successfully.");
      await loadSlots(expertId);
    } else {
      const error = await response.json().catch(() => null);
      setSlotMessage(error?.detail || "Failed to remove the slot.");
    }

    setSlotLoading(false);
  };

  useEffect(() => {
    async function loadExpertProfile() {
      setLoading(true);
      const expertRes = await apiGet<{ id: string }>("/api/experts/me");

if (expertRes.data) {
  setExpertId(expertRes.data.id);
}
      if (expertRes.data) {
        await loadSlots(expertRes.data.id);
      }
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

      {/* Expert Availability Slots */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Availability</CardTitle>
          <CardDescription>
            Add time slots when candidates can book sessions with you.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slot-date">Date</Label>
              <Input
                id="slot-date"
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slot-start">Start Time</Label>
              <Input
                id="slot-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slot-end">End Time</Label>
              <Input
                id="slot-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="button"
            disabled={slotLoading || !expertId || !slotDate}
            onClick={handleAddSlot}
          >
            {slotLoading ? "Adding Slot..." : "Add Availability Slot"}
          </Button>

          {slotMessage && (
            <p className="text-sm text-muted-foreground">{slotMessage}</p>
          )}

          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold">Your Upcoming Slots</h3>

            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming availability slots found.
              </p>
            ) : (
              slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(slot.start_time).toLocaleDateString()}{" "}
                      {new Date(slot.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" – "}
                      {new Date(slot.end_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {slot.is_booked ? "Booked" : "Available"}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={slot.is_booked || slotLoading}
                    onClick={() => handleRemoveSlot(slot.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
