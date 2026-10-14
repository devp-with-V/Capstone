"use client";

import React, { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import { ObsidianCard } from "@/components/layout/PageShell";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-on-surface-variant animate-pulse">Verifying credentials &amp; permissions...</p>
      </div>
    );
  }

  // Case 1: Unauthenticated — redirect to login, render minimal verifying state
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-on-surface-variant">Redirecting to sign in...</p>
      </div>
    );
  }

  // Case 2: Role not authorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <ObsidianCard className="max-w-lg w-full">
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-error-container/20 border border-error/30 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-error text-[28px]">shield</span>
            </div>
            <h2 className="font-headline-lg text-2xl font-bold text-on-surface">Access Restricted</h2>
            <p className="text-sm mt-1 text-on-surface-variant">
              Your current role does not have authorization to view this area.
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-lowest border border-white/[0.08] p-4 flex flex-col gap-2 mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Your Role:</span>
              <span className="capitalize font-semibold px-2.5 py-0.5 rounded-full text-xs bg-surface-container-high text-on-surface border border-white/[0.08]">
                {user.role}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm gap-3">
              <span className="text-on-surface-variant shrink-0">Required Role(s):</span>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {allowedRoles.map((r) => (
                  <span
                    key={r}
                    className="capitalize font-semibold px-2.5 py-0.5 rounded-full text-xs bg-primary-container/15 text-on-surface border border-primary/20"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Link
            href="/"
            className="mt-6 w-full flex items-center justify-center px-4 py-2 rounded-xl bg-surface-container-high text-sm font-medium text-on-surface hover:bg-surface-bright border border-white/[0.08]"
          >
            <span className="material-symbols-outlined text-base mr-2">arrow_back</span>
            Back to Home
          </Link>
        </ObsidianCard>
      </div>
    );
  }

  // Case 3: Authorized!
  return <>{children}</>;
}
