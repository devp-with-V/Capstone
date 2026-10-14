"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell, ObsidianCard } from "@/components/layout/PageShell";
import { apiGet, apiPost } from "@/lib/api";

type Expert = { id: string; display_name: string; headline: string; company?: string; bio?: string; domains: string[]; years_experience: number };
type Slot = { id: string; expert_id: string; start_time: string; end_time: string; is_booked: boolean };
type ApiEnvelope<T> = { data: T | null; error: { message: string } | null };

const INPUT_CLASS =
  "w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-white/[0.08] text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary";
const PRIMARY_BTN =
  "px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-sm font-semibold text-white hover:brightness-110 transition-all disabled:opacity-40";
const SECONDARY_BTN =
  "px-4 py-2 rounded-xl bg-surface-container-high text-sm font-medium text-on-surface hover:bg-surface-bright border border-white/[0.08]";

export default function BookingPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Expert | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<ApiEnvelope<Expert[]>>("/api/experts").then((response) => {
      if (response.data?.data) {
        setExperts(response.data.data);
      }
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => experts.filter((expert) => [expert.display_name, expert.headline, ...(expert.domains || [])].join(" ").toLowerCase().includes(query.toLowerCase())), [experts, query]);
  const chooseExpert = async (expert: Expert) => {
    setSelected(expert); setSelectedSlot(null); setMessage(null); setLoadingSlots(true);
    const response = await apiGet<ApiEnvelope<Slot[]>>(`/api/experts/${expert.id}/slots`);
    setSlots(response.data?.data || []);
    setLoadingSlots(false);
  };
  const confirmBooking = async () => {
    if (!selectedSlot || !selected) return;
    if (selectedSlot.id.startsWith("demo-")) { setMessage(`Your session with ${selected.display_name} is confirmed. A calendar invite will follow.`); return; }
    const response = await apiPost<ApiEnvelope<{ id: string }>>("/api/bookings", { slot_id: selectedSlot.id, agenda: "Mock interview practice" });
    setMessage(response.data?.data ? `Your session with ${selected.display_name} is confirmed.` : "That slot was just taken. Please choose another time.");
  };

  return (
    <PageShell
      eyebrow="Mentors // 1-on-1 Sessions"
      title="Book a mock interview"
      description="Choose an approved expert, select an available time, and practise with focused feedback."
      icon="calendar_month"
      wide
    >
      {message && (
        <div className="p-3 rounded-xl bg-tertiary-container/20 border border-tertiary/30 text-tertiary text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px]">
            check_circle
          </span>
          {message}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <section>
          <div className="relative mb-5">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
              search
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, role, or skill"
              className={`${INPUT_CLASS} pl-10`}
            />
          </div>
          {loading ? (
            <p className="py-8 text-center text-sm text-outline">
              Loading experts…
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((expert) => (
                <div
                  key={expert.id}
                  className={`rounded-2xl bg-surface-container border p-5 ${
                    selected?.id === expert.id
                      ? "border-primary/50"
                      : "border-white/[0.08]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-on-surface">
                        {expert.display_name}
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        {expert.headline}
                        {expert.company ? ` · ${expert.company}` : ""}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      star
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-on-surface-variant">
                    {expert.bio}
                  </p>
                  <div className="mb-5 flex flex-wrap gap-1.5">
                    {expert.domains.map((domain) => (
                      <span
                        key={domain}
                        className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-white/[0.05] text-[11px] text-on-surface-variant"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                  <button
                    className={`w-full ${selected?.id === expert.id ? SECONDARY_BTN : PRIMARY_BTN}`}
                    onClick={() => chooseExpert(expert)}
                  >
                    View availability
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        <aside>
          <ObsidianCard className="lg:sticky lg:top-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[20px]">
                calendar_month
              </span>
              <h3 className="text-base font-semibold text-on-surface">
                {selected
                  ? `Times with ${selected.display_name.split(" ")[0]}`
                  : "Select an expert"}
              </h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-5">
              {selected
                ? "All times are shown in your local timezone."
                : "Choose an expert to see their available slots."}
            </p>
            {loadingSlots ? (
              <p className="py-8 text-center text-sm text-outline">
                Loading availability…
              </p>
            ) : selected ? (
              <>
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm transition-colors ${
                        selectedSlot?.id === slot.id
                          ? "border-primary/50 bg-primary-container/10 text-on-surface"
                          : "border-white/[0.08] text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      <span>
                        {new Date(slot.start_time).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">
                          schedule
                        </span>
                        {new Date(slot.start_time).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  className={`mt-5 w-full ${PRIMARY_BTN} flex items-center justify-center gap-2`}
                  disabled={!selectedSlot}
                  onClick={confirmBooking}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    videocam
                  </span>
                  Confirm 45-minute session
                </button>
              </>
            ) : (
              <div className="py-10 text-center text-sm text-outline">
                Experts set their own availability, so every time shown is
                bookable.
              </div>
            )}
          </ObsidianCard>
        </aside>
      </div>
    </PageShell>
  );
}
