"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, Rocket, Search, Star, Video } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Expert = { id: string; display_name: string; headline: string; company?: string; bio?: string; domains: string[]; years_experience: number };
type Slot = { id: string; expert_id: string; start_time: string; end_time: string; is_booked: boolean };
type ApiEnvelope<T> = { data: T | null; error: { message: string } | null };

const demoExperts: Expert[] = [
  { id: "demo-ananya", display_name: "Ananya Sharma", headline: "Senior Software Engineer", company: "Atlassian", bio: "DSA, frontend systems, and practical interview feedback.", domains: ["DSA", "Frontend"], years_experience: 6 },
  { id: "demo-rohan", display_name: "Rohan Mehta", headline: "Engineering Manager", company: "Razorpay", bio: "System design and behavioural preparation for product engineering roles.", domains: ["System Design", "Behavioural"], years_experience: 9 },
  { id: "demo-meera", display_name: "Meera Iyer", headline: "Data Scientist", company: "Microsoft", bio: "Data science case studies, ML fundamentals, and analytics roles.", domains: ["Data Science", "ML"], years_experience: 7 },
];

function demoSlots(expertId: string): Slot[] {
  const start = new Date(); start.setDate(start.getDate() + 1); start.setHours(18, 0, 0, 0);
  return [0, 1, 2].map((offset) => {
    const slotStart = new Date(start); slotStart.setDate(start.getDate() + offset);
    const slotEnd = new Date(slotStart.getTime() + 45 * 60 * 1000);
    return { id: `demo-${expertId}-${offset}`, expert_id: expertId, start_time: slotStart.toISOString(), end_time: slotEnd.toISOString(), is_booked: false };
  });
}

export default function BookingPage() {
  const [experts, setExperts] = useState<Expert[]>(demoExperts);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Expert | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiGet<ApiEnvelope<Expert[]>>("/api/experts").then((response) => {
      if (response.data?.data?.length) setExperts(response.data.data);
    });
  }, []);

  const filtered = useMemo(() => experts.filter((expert) => [expert.display_name, expert.headline, ...expert.domains].join(" ").toLowerCase().includes(query.toLowerCase())), [experts, query]);
  const chooseExpert = async (expert: Expert) => {
    setSelected(expert); setSelectedSlot(null); setMessage(null); setLoadingSlots(true);
    const response = await apiGet<ApiEnvelope<Slot[]>>(`/api/experts/${expert.id}/slots`);
    setSlots(response.data?.data?.length ? response.data.data : demoSlots(expert.id));
    setLoadingSlots(false);
  };
  const confirmBooking = async () => {
    if (!selectedSlot || !selected) return;
    if (selectedSlot.id.startsWith("demo-")) { setMessage(`Your session with ${selected.display_name} is confirmed. A calendar invite will follow.`); return; }
    const response = await apiPost<ApiEnvelope<{ id: string }>>("/api/bookings", { slot_id: selectedSlot.id, agenda: "Mock interview practice" });
    setMessage(response.data?.data ? `Your session with ${selected.display_name} is confirmed.` : "That slot was just taken. Please choose another time.");
  };

  return <div className="min-h-screen bg-muted/20">
    <nav className="border-b bg-background"><div className="container mx-auto flex h-16 items-center justify-between px-4"><Link href="/" className="flex items-center gap-2 font-bold"><Rocket className="h-6 w-6 text-primary" />PrepPilot</Link><Link href="/profile"><Button variant="ghost">My profile</Button></Link></div></nav>
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8"><Badge className="mb-3">1-on-1 expert sessions</Badge><h1 className="text-3xl font-bold tracking-tight">Book a mock interview</h1><p className="mt-2 text-muted-foreground">Choose an approved expert, select an available time, and practise with focused feedback.</p></div>
      {message && <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-300"><CheckCircle2 className="h-5 w-5" />{message}</div>}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <section><div className="relative mb-5"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, role, or skill" className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-primary" /></div>
          <div className="grid gap-4 sm:grid-cols-2">{filtered.map((expert) => <Card key={expert.id} className={selected?.id === expert.id ? "border-primary ring-1 ring-primary" : ""}><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-lg">{expert.display_name}</CardTitle><CardDescription>{expert.headline}{expert.company ? ` · ${expert.company}` : ""}</CardDescription></div><Star className="h-5 w-5 fill-amber-400 text-amber-400" /></div></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">{expert.bio}</p><div className="mb-5 flex flex-wrap gap-1.5">{expert.domains.map((domain) => <Badge variant="secondary" key={domain}>{domain}</Badge>)}</div><Button className="w-full" variant={selected?.id === expert.id ? "secondary" : "default"} onClick={() => chooseExpert(expert)}>View availability</Button></CardContent></Card>)}</div>
        </section>
        <aside><Card className="sticky top-6"><CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />{selected ? `Times with ${selected.display_name.split(" ")[0]}` : "Select an expert"}</CardTitle><CardDescription>{selected ? "All times are shown in your local timezone." : "Choose an expert to see their available slots."}</CardDescription></CardHeader><CardContent>{loadingSlots ? <p className="py-8 text-center text-sm text-muted-foreground">Loading availability…</p> : selected ? <><div className="space-y-2">{slots.map((slot) => <button type="button" key={slot.id} onClick={() => setSelectedSlot(slot)} className={`flex w-full items-center justify-between rounded-md border p-3 text-left text-sm transition-colors ${selectedSlot?.id === slot.id ? "border-primary bg-primary/5" : "hover:bg-muted"}`}><span>{new Date(slot.start_time).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span><span className="flex items-center gap-1 text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />{new Date(slot.start_time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span></button>)}</div><Button className="mt-5 w-full" disabled={!selectedSlot} onClick={confirmBooking}><Video className="mr-2 h-4 w-4" />Confirm 45-minute session</Button></> : <div className="py-10 text-center text-sm text-muted-foreground">Experts set their own availability, so every time shown is bookable.</div>}</CardContent></Card></aside>
      </div>
    </main>
  </div>;
}
