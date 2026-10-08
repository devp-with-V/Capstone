"use client";

import { useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";

const API_BASE_URL = "http://127.0.0.1:8000/api";

type Session = {
  id: string;
  room_name: string;
  user_id: string;
  status: string;
  created_at: string;
  ended_at?: string | null;
};

export default function VideoPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createSession = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/video/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "mock-user-123",
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
    <main className="min-h-screen bg-gray-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">PrepPilot Video Interview</h1>

        <p className="mt-2 text-gray-400">
          Start a video interview session using Jitsi Meet.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {!session && (
          <button
            onClick={createSession}
            disabled={loading}
            className="mt-8 rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Interview Session"}
          </button>
        )}

        {session && (
          <div className="mt-8">
            <div className="mb-6 rounded-lg border border-gray-800 bg-gray-900 p-5">
              <p>
                <span className="text-gray-400">Status:</span>{" "}
                <span className="font-semibold capitalize">
                  {session.status}
                </span>
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Room: {session.room_name}
              </p>

              {session.status === "waiting" && (
                <button
                  onClick={joinSession}
                  disabled={loading}
                  className="mt-5 rounded-lg bg-green-600 px-6 py-3 font-medium hover:bg-green-500 disabled:opacity-50"
                >
                  {loading ? "Joining..." : "Join Interview"}
                </button>
              )}

              {session.status === "active" && (
                <button
                  onClick={endSession}
                  disabled={loading}
                  className="mt-5 rounded-lg bg-red-600 px-6 py-3 font-medium hover:bg-red-500 disabled:opacity-50"
                >
                  {loading ? "Ending..." : "End Interview"}
                </button>
              )}

              {session.status === "ended" && (
                <p className="mt-5 text-red-400">
                  This interview session has ended.
                </p>
              )}
            </div>

            {session.status === "active" && (
              <div className="overflow-hidden rounded-xl border border-gray-800 bg-black">
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
                    displayName: "PrepPilot Candidate",
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
      </div>
    </main>
  );
}