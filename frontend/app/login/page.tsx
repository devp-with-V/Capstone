"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { PageShell, ObsidianCard } from "@/components/layout/PageShell";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<"candidate" | "expert">("candidate");
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
      if (result.user?.role === "expert" || role === "expert") {
        router.push("/expert");
      } else {
        router.push("/resume");
      }
    } else {
      setError(result.error || "Failed to log in. Please check your credentials.");
    }
  };

  return (
    <PageShell
      eyebrow="Access // Candidate Auth"
      title="Welcome back"
      description="Sign in to access your dashboard."
      icon="login"
    >
      <div className="w-full max-w-md mx-auto">
        <ObsidianCard>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Log In</h2>
              <p className="text-sm text-on-surface-variant">Enter your email and password below</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setRole("candidate")}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl cursor-pointer transition-all border ${
                  role === "candidate"
                    ? "border-primary bg-primary-container/15 text-on-surface border"
                    : "bg-surface-container-high text-on-surface-variant border-white/[0.06] hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">person</span>
                <span className="text-sm font-medium">Student</span>
              </div>
              <div
                onClick={() => setRole("expert")}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl cursor-pointer transition-all border ${
                  role === "expert"
                    ? "border-primary bg-primary-container/15 text-on-surface border"
                    : "bg-surface-container-high text-on-surface-variant border-white/[0.06] hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">school</span>
                <span className="text-sm font-medium">Mentor</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-on-surface-variant">Email</label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-on-surface-variant">Password</label>
                <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-sm font-semibold text-white hover:brightness-110 transition-all disabled:opacity-40"
            >
              {loading ? "Authenticating..." : "Log In"}
            </button>
          </form>

          <div className="text-sm text-center text-on-surface-variant w-full mt-6 pt-4 border-t border-white/[0.08]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </ObsidianCard>
      </div>
    </PageShell>
  );
}
