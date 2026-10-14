"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { PageShell, ObsidianCard } from "@/components/layout/PageShell";

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
    <PageShell
      eyebrow="Access // Join PrepPilot"
      title="Join PrepPilot"
      description="Create an account to start your preparation journey."
      icon="rocket_launch"
    >
      <div className="w-full max-w-md mx-auto">
        <ObsidianCard>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Create an account</h2>
              <p className="text-sm text-on-surface-variant">Select your account type and fill in your details</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setRole("candidate")}
                className={`rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all border ${
                  role === "candidate"
                    ? "border-primary bg-primary-container/15 text-on-surface border"
                    : "bg-surface-container-high text-on-surface-variant border-white/[0.06] hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">person</span>
                <span className="text-sm font-medium">Student</span>
              </div>
              <div
                onClick={() => setRole("expert")}
                className={`rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all border ${
                  role === "expert"
                    ? "border-primary bg-primary-container/15 text-on-surface border"
                    : "bg-surface-container-high text-on-surface-variant border-white/[0.06] hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">school</span>
                <span className="text-sm font-medium">Mentor</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-medium text-on-surface-variant">Full Name</label>
              <input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>
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
              <label htmlFor="password" className="text-xs font-medium text-on-surface-variant">Password</label>
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
              {loading ? "Creating Account..." : `Sign Up as ${role === "expert" ? "Expert" : "Candidate"}`}
            </button>
          </form>

          <div className="text-sm text-center text-on-surface-variant w-full mt-6 pt-4 border-t border-white/[0.08]">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </div>
        </ObsidianCard>
      </div>
    </PageShell>
  );
}
