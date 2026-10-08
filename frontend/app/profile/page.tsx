"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, FileText, Check } from "lucide-react";
import { apiGet, apiPut } from "@/lib/api";
import { CandidateProfile } from "@/lib/types";

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["candidate", "expert", "admin"]}>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}

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
    <div className="min-h-screen bg-background">
      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{user?.full_name || "Candidate User"}</h1>
                  <Badge variant="outline" className="capitalize">
                    {user?.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>


            <Card>
              <CardHeader>
                <CardTitle>Personal Info</CardTitle>
                <CardDescription>Update your personal details and bio.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a little about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interview Goals</CardTitle>
                <CardDescription>What roles and companies are you targeting?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Target Role</Label>
                    <Input
                      id="role"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select defaultValue="mid">
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (5+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companies">Target Companies (comma separated)</Label>
                  <Input id="companies" defaultValue="Google, Meta, Vercel, Stripe" />
                </div>
                <div className="space-y-2 pt-2">
                  <Label>Key Skills</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[50px] bg-muted/20">
                    <Badge variant="secondary">React</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                    <Badge variant="secondary">Next.js</Badge>
                    <Badge variant="secondary">Tailwind CSS</Badge>
                    <Input className="h-6 w-32 border-none bg-transparent focus-visible:ring-0 p-0 text-sm shadow-none" placeholder="Add skill..." />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              {savedSuccess ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <Check className="w-4 h-4" />
                  <span>Profile updated successfully!</span>
                </div>
              ) : <div />}
              <Button size="lg" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>

          </div>

          {/* Sidebar */}
          <div className="w-full md:w-80 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Recent Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b pb-3">
                    <div>
                      <p className="font-medium text-sm">Frontend Resume v2.pdf</p>
                      <p className="text-xs text-muted-foreground">Analyzed 2 days ago</p>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Score: 84</Badge>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">Software Eng Resume.pdf</p>
                      <p className="text-xs text-muted-foreground">Analyzed 2 weeks ago</p>
                    </div>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">Score: 71</Badge>
                  </div>
                </div>
                <Button variant="link" className="w-full mt-2 text-primary">View all reports</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Upcoming Interviews</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No upcoming interviews.</p>
                  <Button variant="outline" size="sm" className="mt-4">Book a session</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
