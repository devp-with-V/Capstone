"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const PRIMARY_LINKS = [
  { href: "/resume", label: "Resume Diagnostic" },
  { href: "/mock-interview", label: "AI Mock Room" },
  { href: "/mentors", label: "Live Mentors" },
  { href: "/report", label: "Readiness" },
];

const SERVICE_LINKS = [
  { href: "/resume", label: "Resume Review", icon: "description" },
  { href: "/mock-interview", label: "AI Mock Interview", icon: "smart_toy" },
  { href: "/mentors", label: "Mentor Marketplace", icon: "record_voice_over" },
  { href: "/report", label: "Readiness Report", icon: "analytics" },
  { href: "/jobs", label: "Jobs & Matcher", icon: "manage_search" },
  { href: "/jd-analyzer", label: "Custom JD Analyzer", icon: "auto_stories" },
  { href: "/teams", label: "Institutional Teams OS", icon: "domain" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="h-20 w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shadow-[0_0_20px_rgba(128,131,255,0.35)] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-white text-[22px]">
              rocket_launch
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-lg font-bold text-on-surface tracking-tight leading-none group-hover:text-primary transition-colors">
              PrepPilot
            </span>
            <span className="font-code-mono text-[10px] text-primary uppercase tracking-widest mt-1">
              AI &amp; Mentor Matrix
            </span>
          </div>
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high border border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
            <span className="font-code-mono text-[11px] text-tertiary uppercase tracking-wider">
              v3.4 Production Ready
            </span>
          </div>
        </Link>

        <nav className="hidden xl:flex items-center gap-1">
          {PRIMARY_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                isActive(l.href)
                  ? "text-primary bg-surface-container-high border border-primary/20"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <span className="hidden lg:inline text-xs text-on-surface-variant font-code-mono max-w-40 truncate">
                {user.full_name || user.email}
              </span>
              <Link
                href="/profile"
                className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center hover:border-primary transition-colors"
                title="Candidate Profile"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">
                  person
                </span>
              </Link>
              <button
                onClick={logout}
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-surface-container-high text-sm font-medium text-on-surface hover:bg-surface-bright transition-all border border-white/[0.08]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/mock-interview"
                className="hidden md:inline-flex items-center px-4 py-2 rounded-lg bg-surface-container-high text-sm font-medium text-on-surface hover:bg-surface-bright transition-all border border-white/[0.08]"
              >
                <span className="material-symbols-outlined text-[18px] mr-1.5 text-primary">
                  smart_toy
                </span>
                Try AI Interview
              </Link>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-surface-container-high text-sm font-medium text-on-surface hover:bg-surface-bright transition-all border border-white/[0.08]"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-sm font-semibold text-white hover:brightness-110 transition-all shadow-[0_8px_20px_-4px_rgba(99,102,241,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]"
              >
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-white/[0.04] bg-surface-container-lowest/90 px-4 sm:px-8 lg:px-12 py-1.5 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 max-w-7xl mx-auto text-xs whitespace-nowrap">
          <span className="text-outline uppercase tracking-widest text-[10px] font-code-mono pr-2">
            Microservices:
          </span>
          {SERVICE_LINKS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                isActive(s.href)
                  ? "text-primary font-semibold bg-surface-container-high border border-primary/20"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {s.icon}
              </span>
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
