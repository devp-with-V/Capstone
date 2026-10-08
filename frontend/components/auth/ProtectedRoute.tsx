"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Lock, ArrowLeft, RefreshCw } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, switchRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground animate-pulse">Verifying credentials & permissions...</p>
      </div>
    );
  }

  // Case 1: Unauthenticated
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border/80 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 text-amber-500" />
            </div>
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <CardDescription>
              You need to sign in to access this page.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            <Link href="/login" className="w-full">
              <Button className="w-full">Log In</Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Case 2: Role not authorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-destructive/30 shadow-xl bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <ShieldAlert className="w-7 h-7 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Access Restricted</CardTitle>
            <CardDescription className="text-base mt-1">
              Your current role does not have authorization to view this area.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-2 border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Role:</span>
                <span className="capitalize font-semibold px-2.5 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Required Role(s):</span>
                <div className="flex gap-1.5">
                  {allowedRoles.map((r) => (
                    <span
                      key={r}
                      className="capitalize font-semibold px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Switch role below for evaluation & local testing:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant={user.role === "candidate" ? "default" : "outline"}
                  onClick={() => switchRole("candidate")}
                  className="text-xs"
                >
                  Candidate
                </Button>
                <Button
                  size="sm"
                  variant={user.role === "expert" ? "default" : "outline"}
                  onClick={() => switchRole("expert")}
                  className="text-xs"
                >
                  Expert
                </Button>
                <Button
                  size="sm"
                  variant={user.role === "admin" ? "default" : "outline"}
                  onClick={() => switchRole("admin")}
                  className="text-xs"
                >
                  Admin
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Link href="/" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Case 3: Authorized!
  return <>{children}</>;
}
