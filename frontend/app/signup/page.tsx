"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, User, GraduationCap, AlertCircle } from "lucide-react";
import { cn } from "cn";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [role, setRole] = useState<"candidate" | "expert">("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signup(email, password, name, role);
    setLoading(false);

    if (result.success) {
      if (role === "expert") {
        router.push("/expert");
      } else {
        router.push("/resume");
      }
    } else {
      setError(result.error || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/30 p-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Join PrepPilot</h1>
          <p className="text-sm text-muted-foreground">Create an account to start your preparation journey</p>
        </div>

        <Card className="border-border/80 shadow-lg">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>Select your account type and fill in your details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-2">
                <div 
                  className={cn(
                    "border rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all",
                    role === "candidate" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted"
                  )}
                  onClick={() => setRole("candidate")}
                >
                  <User className={cn("h-6 w-6", role === "candidate" ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-sm font-medium">I&apos;m a Candidate</span>
                </div>
                <div 
                  className={cn(
                    "border rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all",
                    role === "expert" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted"
                  )}
                  onClick={() => setRole("expert")}
                >
                  <GraduationCap className={cn("h-6 w-6", role === "expert" ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-sm font-medium">I&apos;m an Expert</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? "Creating Account..." : `Sign Up as ${role === "expert" ? "Expert" : "Candidate"}`}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="border-t pt-4">
            <div className="text-sm text-center text-muted-foreground w-full">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

