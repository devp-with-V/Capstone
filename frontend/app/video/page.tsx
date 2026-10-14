"use client";

import { useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { PageShell, ObsidianCard } from "@/components/layout/PageShell";
import { useAuth } from "@/lib/auth-context";
import { getAuthToken } from "@/lib/api";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/api";

type Session = {
  id: string;
  room_name: string;
  user_id: string;
  status: string;
  created_at: string;
  ended_at?: string | null;
};

function authHeaders(hasBody = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export default function VideoPage() {
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = user?.id ?? "";
  const displayName = user?.full_name || "PrepPilot Candidate";
  const email = user?.email || "candidate@preppilot.com";

  const createSession = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/video/session`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create video session");
      }

      const data = await response.json();
      setSession(data);
    } catch (err) {
      setError("Could not create video session.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/video/session/${session.id}/join`,
        {
          method: "POST",
          headers: authHeaders(true),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to join video session");
      }

      const data = await response.json();

      setSession((current) =>
        current
          ? {
              ...current,
              status: data.status,
            }
          : current
      );
    } catch (err) {
      setError("Could not join video session.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/video/session/${session.id}/end`,
        {
          method: "POST",
          headers: authHeaders(true),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to end video session");
      }

      const data = await response.json();

      setSession((current) =>
        current
          ? {
              ...current,
              status: data.status,
              ended_at: data.ended_at,
            }
          : current
      );
    } catch (err) {
      setError("Could not end video session.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      eyebrow="Video // Jitsi WebRTC"
      title="Video Interview"
      description="Start a video interview session using Jitsi Meet."
      icon="videocam"
    >
      {error && (
        <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-sm">
          {error}
        </div>
      )}

      {!session && (
        <ObsidianCard>
          <p className="text-sm text-on-surface-variant mb-5">
            Create a new interview room, then join when you are ready.
          </p>
          <button
            onClick={createSession}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-sm font-semibold text-white hover:brightness-110 transition-all disabled:opacity-40"
          >
            {loading ? "Creating..." : "Create Interview Session"}
          </button>
        </ObsidianCard>
      )}

      {session && (
        <div className="flex flex-col gap-6">
          <ObsidianCard>
            <p className="text-sm text-on-surface-variant">
              Status:{" "}
              <span className="font-semibold capitalize text-on-surface">
                {session.status}
              </span>
            </p>

            <p className="mt-2 font-code-mono text-xs text-outline">
              Room: {session.room_name}
            </p>

            {session.status === "waiting" && (
              <button
                onClick={joinSession}
                disabled={loading}
                className="mt-5 px-4 py-2.5 rounded-xl bg-tertiary-container/30 text-tertiary border border-tertiary/30 text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-40"
              >
                {loading ? "Joining..." : "Join Interview"}
              </button>
            )}

            {session.status === "active" && (
              <button
                onClick={endSession}
                disabled={loading}
                className="mt-5 px-4 py-2.5 rounded-xl bg-error-container/20 border border-error/30 text-error text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-40"
              >
                {loading ? "Ending..." : "End Interview"}
              </button>
            )}

            {session.status === "ended" && (
              <p className="mt-5 text-sm text-error">
                This interview session has ended.
              </p>
            )}
          </ObsidianCard>

          {session.status === "active" && (
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-container-lowest">
              <JitsiMeeting
                domain="meet.jit.si"
                roomName={session.room_name}
                configOverwrite={{
                  startWithAudioMuted: false,
                  startWithVideoMuted: false,
                  disableModeratorIndicator: true,
                }}
                interfaceConfigOverwrite={{
                  SHOW_JITSI_WATERMARK: false,
                }}
                userInfo={{
                  displayName,
                  email,
                }}
                getIFrameRef={(iframe) => {
                  iframe.style.height = "700px";
                  iframe.style.width = "100%";
                }}
              />
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
