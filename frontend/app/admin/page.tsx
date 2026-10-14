"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { User, UserRole } from "@/lib/types";
import { apiGet, apiPost } from "@/lib/api";
import { PageShell, ObsidianCard } from "@/components/layout/PageShell";

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function roleBadge(role: string) {
  if (role === "admin")
    return "bg-error-container/20 text-error border-error/30";
  if (role === "expert")
    return "bg-secondary-container/30 text-secondary border-secondary/30";
  return "bg-tertiary-container/20 text-tertiary border-tertiary/30";
}

function AdminDashboardContent() {
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
    <PageShell
      eyebrow="Admin // RBAC Control"
      title="Admin & RBAC Control Console"
      description="Manage user roles, review expert credentials, and audit role-based access control. Authorized access only."
      icon="shield"
      wide
      action={
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-xs font-medium text-on-surface hover:bg-surface-bright border border-white/[0.08] disabled:opacity-40"
        >
          <span className={`material-symbols-outlined text-[16px] ${loading ? "animate-spin" : ""}`}>
            refresh
          </span>
          Refresh Users
        </button>
      }
    >
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-tertiary-container/20 border border-tertiary/30 text-tertiary text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.length, valueCls: "text-on-surface" },
          { label: "Candidates", value: candidateCount, valueCls: "text-tertiary" },
          { label: "Experts", value: expertCount, valueCls: "text-secondary" },
          { label: "Administrators", value: adminCount, valueCls: "text-error" },
        ].map((m) => (
          <div
            key={m.label}
            className="p-5 rounded-2xl bg-surface-container border border-white/[0.08]"
          >
            <span className="font-code-mono text-[11px] text-outline uppercase tracking-wider">
              {m.label}
            </span>
            <p className={`text-3xl font-bold mt-1 ${m.valueCls}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* User Management Table Card */}
      <ObsidianCard>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-on-surface">User Directory & Role Permissions</h2>
          <span className="material-symbols-outlined text-outline text-[20px]">group</span>
        </div>
        <p className="text-xs text-on-surface-variant mb-4">
          Live role assignments verified by FastAPI <code className="font-code-mono text-[11px] bg-surface-container-high px-1.5 py-0.5 rounded text-primary">require_admin</code> guard.
        </p>
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-on-surface-variant">Fetching registered users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-outline text-sm">
            No users registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-outline font-code-mono text-[11px] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Current Role</th>
                  <th className="pb-3 font-semibold">Role Action</th>
                  <th className="pb-3 font-semibold text-right">Expert Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-medium text-on-surface">{u.full_name || "Unnamed"}</div>
                      <div className="text-xs text-outline font-code-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`capitalize px-2.5 py-0.5 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${roleBadge(u.role)}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(["candidate", "expert", "admin"] as UserRole[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => handleChangeRole(u.id, r)}
                            disabled={u.role === r}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all disabled:opacity-40 ${
                              u.role === r
                                ? "bg-primary-container/20 text-primary border-primary/30"
                                : "bg-surface-container-high text-on-surface-variant hover:text-on-surface border-white/[0.08]"
                            }`}
                          >
                            Make {r}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 text-right">
                      {u.role === "expert" ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleApproveExpert(u.id, true)}
                            className="px-2.5 py-1 rounded-lg text-[11px] text-tertiary hover:bg-tertiary-container/20 border border-tertiary/30 inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveExpert(u.id, false)}
                            className="px-2.5 py-1 rounded-lg text-[11px] text-outline hover:text-error"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-outline">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ObsidianCard>
    </PageShell>
  );
}
