"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { User, UserRole } from "@/lib/types";
import { apiGet, apiPost } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, UserCheck, GraduationCap, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await apiGet<User[]>("/api/users/admin/users");
    if (res.data) {
      setUsers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    const res = await apiPost<User>("/api/users/admin/change-role", {
      user_id: userId,
      new_role: newRole,
    });
    if (res.data) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setActionMessage(`Role updated for user ${userId} to ${newRole}`);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleApproveExpert = async (userId: string, approved: boolean) => {
    const res = await apiPost<{ user_id: string; approved: boolean }>("/api/users/admin/approve-expert", {
      user_id: userId,
      approved,
    });
    if (res.data) {
      setActionMessage(`Expert application for ${userId} set to ${approved ? "Approved" : "Rejected"}`);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const candidateCount = users.filter((u) => u.role === "candidate").length;
  const expertCount = users.filter((u) => u.role === "expert").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Role: Admin
            </span>
            <span className="text-xs text-muted-foreground">Authorized Access Only</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admin & RBAC Control Console</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage user roles, review expert credentials, and audit role-based access control.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={loading}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Users
        </Button>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium">Total Users</CardDescription>
            <CardTitle className="text-3xl font-bold">{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium text-emerald-400">Candidates</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-400">{candidateCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-indigo-500/5 border-indigo-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium text-indigo-400">Experts</CardDescription>
            <CardTitle className="text-3xl font-bold text-indigo-400">{expertCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-rose-500/5 border-rose-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium text-rose-400">Administrators</CardDescription>
            <CardTitle className="text-3xl font-bold text-rose-400">{adminCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* User Management Table Card */}
      <Card className="border-border/80 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">User Directory & Role Permissions</CardTitle>
              <CardDescription>
                Live role assignments verified by FastAPI <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">require_admin</code> guard.
              </CardDescription>
            </div>
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Fetching registered users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No users registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground text-xs uppercase">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Current Role</th>
                    <th className="pb-3 font-semibold">Role Action</th>
                    <th className="pb-3 font-semibold text-right">Expert Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5">
                        <div className="font-medium text-foreground">{u.full_name || "Unnamed"}</div>
                        <div className="text-xs text-muted-foreground font-mono">{u.email}</div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`capitalize px-2.5 py-0.5 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${
                            u.role === "admin"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : u.role === "expert"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {u.role === "admin" && <Shield className="w-3 h-3" />}
                          {u.role === "expert" && <GraduationCap className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          {(["candidate", "expert", "admin"] as UserRole[]).map((r) => (
                            <Button
                              key={r}
                              size="sm"
                              variant={u.role === r ? "secondary" : "outline"}
                              onClick={() => handleChangeRole(u.id, r)}
                              disabled={u.role === r}
                              className="text-xs h-7 px-2"
                            >
                              Make {r}
                            </Button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        {u.role === "expert" ? (
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveExpert(u.id, true)}
                              className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border-emerald-500/30"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApproveExpert(u.id, false)}
                              className="h-7 text-xs text-muted-foreground hover:text-destructive"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
