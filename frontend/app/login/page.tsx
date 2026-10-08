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
import { Rocket, Shield, GraduationCap, User as UserIcon, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      router.push("/resume");
    } else {
      setError(result.error || "Failed to log in. Please check your credentials.");
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    await loginAsDemo(role);
    setLoading(false);
    if (role === "admin") {
      router.push("/admin");
    } else if (role === "expert") {
      router.push("/expert");
    } else {
      router.push("/resume");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/30 p-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Welcome back to PrepPilot</h1>
          <p className="text-sm text-muted-foreground">Sign in to access your mock interview dashboard</p>
        </div>

        <Card className="border-border/80 shadow-lg">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Log In</CardTitle>
              <CardDescription>Enter your email and password below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Authenticating..." : "Log In"}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="flex flex-col gap-4 border-t pt-4">
            <div className="text-sm text-center text-muted-foreground w-full">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </div>

            <div className="relative w-full my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or One-Click Demo Mode</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("candidate")}
                disabled={loading}
                className="text-xs flex flex-col h-auto py-2 gap-1 border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-500/5"
              >
                <UserIcon className="w-4 h-4 text-emerald-400" />
                <span>Candidate</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("expert")}
                disabled={loading}
                className="text-xs flex flex-col h-auto py-2 gap-1 border-indigo-500/20 hover:border-indigo-500 hover:bg-indigo-500/5"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>Expert</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("admin")}
                disabled={loading}
                className="text-xs flex flex-col h-auto py-2 gap-1 border-rose-500/20 hover:border-rose-500 hover:bg-rose-500/5"
              >
                <Shield className="w-4 h-4 text-rose-400" />
                <span>Admin</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

