"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole, AuthResponse } from "@/lib/types";
import { apiGet, apiPost } from "@/lib/api";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "preppilot_token";
const USER_KEY = "preppilot_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Default to a candidate demo session so user can explore immediately
          const defaultUser: User = {
            id: "mock-candidate-001",
            email: "candidate@preppilot.com",
            role: "candidate",
            full_name: "Demo Candidate (Ananya)",
          };
          const defaultToken = "demo-token-candidate";
          setToken(defaultToken);
          setUser(defaultUser);
          localStorage.setItem(TOKEN_KEY, defaultToken);
          localStorage.setItem(USER_KEY, JSON.stringify(defaultUser));
        }

        // Verify with Supabase if configured
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const role = (session.user.user_metadata?.role as UserRole) || "candidate";
            const supaUser: User = {
              id: session.user.id,
              email: session.user.email || "",
              role,
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
            };
            setUser(supaUser);
            setToken(session.access_token);
            localStorage.setItem(TOKEN_KEY, session.access_token);
            localStorage.setItem(USER_KEY, JSON.stringify(supaUser));
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // 1. If Supabase configured, attempt Supabase Auth first
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.session) {
          const role = (data.user.user_metadata?.role as UserRole) || "candidate";
          const supaUser: User = {
            id: data.user.id,
            email: data.user.email || email,
            role,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          };
          setUser(supaUser);
          setToken(data.session.access_token);
          localStorage.setItem(TOKEN_KEY, data.session.access_token);
          localStorage.setItem(USER_KEY, JSON.stringify(supaUser));
          setIsLoading(false);
          return { success: true };
        }
      }

      // 2. Fallback to backend API login
      const res = await apiPost<AuthResponse>("/api/auth/login", { email, password });
      if (res.error) {
        setIsLoading(false);
        return { success: false, error: res.error };
      }

      if (res.data) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: "Failed to authenticate" };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || "An unexpected error occurred" };
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // 1. If Supabase configured, attempt Supabase Auth
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role },
          },
        });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        if (data.session) {
          const supaUser: User = {
            id: data.user?.id || "user-" + Date.now(),
            email: data.user?.email || email,
            role,
            full_name: fullName,
          };
          setUser(supaUser);
          setToken(data.session.access_token);
          localStorage.setItem(TOKEN_KEY, data.session.access_token);
          localStorage.setItem(USER_KEY, JSON.stringify(supaUser));
          setIsLoading(false);
          return { success: true };
        }
      }

      // 2. Fallback to backend API signup
      const res = await apiPost<AuthResponse>("/api/auth/signup", {
        email,
        password,
        full_name: fullName,
        role,
      });

      if (res.error) {
        setIsLoading(false);
        return { success: false, error: res.error };
      }

      if (res.data) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: "Signup could not be completed" };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || "An unexpected error occurred" };
    }
  };

  const loginAsDemo = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await apiPost<AuthResponse>("/api/auth/demo-login", { role });
      if (res.data) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      } else {
        // Direct fallback
        const fallbackUser: User = {
          id: `mock-${role}-001`,
          email: `${role}@preppilot.com`,
          role,
          full_name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        };
        const fallbackToken = `demo-token-${role}`;
        setUser(fallbackUser);
        setToken(fallbackToken);
        localStorage.setItem(TOKEN_KEY, fallbackToken);
        localStorage.setItem(USER_KEY, JSON.stringify(fallbackUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: UserRole) => {
    await loginAsDemo(role);
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(console.error);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        loginAsDemo,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
