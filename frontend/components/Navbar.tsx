"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Rocket, Shield, GraduationCap, User as UserIcon, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, logout, switchRole } = useAuth();
  const pathname = usePathname();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Hide navbar on standalone auth pages if preferred, or show it for consistent navigation
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return {
          label: "Admin",
          className: "bg-rose-500/15 text-rose-400 border-rose-500/30",
          icon: Shield,
        };
      case "expert":
        return {
          label: "Expert",
          className: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
          icon: GraduationCap,
        };
      case "candidate":
      default:
        return {
          label: "Candidate",
          className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          icon: UserIcon,
        };
    }
  };

  const badge = user ? getRoleBadge(user.role) : null;
  const RoleIcon = badge?.icon;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Prep<span className="text-primary">Pilot</span>
            </span>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pathname === "/" ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              href="/resume"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pathname.startsWith("/resume") ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Resume AI
            </Link>
            <Link
              href="/profile"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pathname === "/profile" ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Profile
            </Link>
            <Link
              href="/expert"
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                pathname.startsWith("/expert") ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Expert Hub</span>
              {user?.role === "expert" && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </Link>
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                pathname.startsWith("/admin") ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Admin</span>
              {user?.role === "admin" && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              )}
            </Link>
          </nav>
        </div>

        {/* Right side: Auth & Role Control */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Role Switcher dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${badge?.className} hover:brightness-110`}
                  title="Click to switch role (Dev Mode)"
                >
                  {RoleIcon && <RoleIcon className="w-3.5 h-3.5" />}
                  <span>{badge?.label}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Switch Role (Demo)
                    </div>
                    {(["candidate", "expert", "admin"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors ${
                          user.role === r
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="capitalize">{r}</span>
                        {user.role === r && <span className="text-[10px] bg-primary/20 px-1.5 py-0.5 rounded">Active</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User greeting */}
              <span className="hidden lg:inline text-xs text-muted-foreground">
                {user.full_name || user.email}
              </span>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 px-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-1 text-xs">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="text-xs">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
