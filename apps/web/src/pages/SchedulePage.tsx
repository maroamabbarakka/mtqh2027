import { AlertTriangle, CalendarDays, Clock3, MapPin, Search, WifiOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { getFirebaseServices } from "@/config/firebase-services";
import { useAuth } from "@/features/auth/AuthContext";
import { loadMasterData } from "@/features/master-data/repository";
import type { Branch, Division } from "@/features/master-data/types";
import { loadDraftSchedules } from "@/features/schedule/repository";
import type { Schedule, Venue } from "@/features/schedule/types";

export function SchedulePage() {
  const auth = useAuth();
  const services = useMemo(() => getFirebaseServices(), []);
  const eventId = auth.assignments.find((item) => item.status === "active")?.eventId ?? "mtqh-pinrang-2027";
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [branchId, setBranchId] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!services) return;
    setLoading(true);
    setError(null);
    try {
      const [master, scheduleData] = await Promise.all([
        loadMasterData(services.firestore, eventId),
        loadDraftSchedules(services.firestore, eventId),
      ]);
      setBranches(master.branches);
      setDivisions(master.divisions);
      setSchedules(scheduleData.schedules);
      setVenues(scheduleData.venues);
    } catch {
      setError("Jadwal draf belum dapat dimuat. Periksa koneksi lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [eventId, services]);

  useEffect(() => {
    const timer = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  const branchNames = useMemo(() => Object.fromEntries(branches.map((item) => [item.id, item.shortName])), [branches]);
  const divisionNames = useMemo(() => Object.fromEntries(divisions.map((item) => [item.id, item.name])), [divisions]);
  const venueNames = useMemo(() => Object.fromEntries(venues.map((item) => [item.id, item.name])), [venues]);
  const visible = schedules.filter((item) => {
    const haystack = `${item.title} ${divisionNames[item.divisionId] ?? ""} ${venueNames[item.venueId ?? ""] ?? ""}`.toLocaleLowerCase("id");
    return (!branchId || item.branchId === branchId) && (!date || item.date === date) && haystack.includes(search.toLocaleLowerCase("id"));
  });

  if (loading) return <main className="admin-page"><div className="registration-skeleton"><span/><span/><span/></div></main>;
  return <main className="admin-page schedule-page">
    <header className="admin-heading"><div><span>Agenda internal • belum dipublikasikan</span><h1>Jadwal & Arena</h1><p>Tinjau susunan sesi simulasi sambil menunggu tanggal dan arena resmi panitia.</p></div><div aria-hidden="true"/></header>
    {!navigator.onLine && <div className="stale-banner"><WifiOff/><div><strong>Anda sedang offline</strong><span>Data yang terlihat mungkin belum diperbarui.</span></div></div>}
    {error && <div className="registration-alert error" role="alert"><AlertTriangle/><span>{error}</span><Button variant="secondary" onClick={() => void reload()}>Coba lagi</Button></div>}
    <div className="safe-master-note"><AlertTriangle/> Seluruh jadwal di halaman ini adalah simulasi internal. Tanggal, jam, dan arena belum menjadi informasi resmi.</div>
    <section className="surface schedule-surface">
      <div className="schedule-toolbar"><div><h2>Daftar sesi draf</h2><small>{visible.length} dari maksimal 50 sesi</small></div><label className="master-search"><Search/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari golongan atau arena" aria-label="Cari jadwal"/></label></div>
      <div className="schedule-filters"><label>Cabang<select value={branchId} onChange={(event) => setBranchId(event.target.value)}><option value="">Semua cabang</option>{branches.map((item) => <option key={item.id} value={item.id}>{item.shortName}</option>)}</select></label><label>Tanggal simulasi<input type="date" value={date} onChange={(event) => setDate(event.target.value)}/></label>{(branchId || date || search) && <Button variant="secondary" onClick={() => { setBranchId(""); setDate(""); setSearch(""); }}>Bersihkan filter</Button>}</div>
      {visible.length === 0 ? <div className="master-empty"><CalendarDays/><strong>Tidak ada sesi yang sesuai</strong><span>Ubah pilihan filter atau tunggu jadwal draf ditambahkan.</span></div> : <div className="schedule-grid">{visible.map((item) => <article className="schedule-card" key={item.id}><header><Badge tone="warning">SIMULASI</Badge><span>{branchNames[item.branchId] ?? item.branchId}</span></header><h3>{divisionNames[item.divisionId] ?? item.title}</h3><p>{item.title}</p><dl><div><CalendarDays/><dt>Tanggal</dt><dd>{formatDate(item)}</dd></div><div><Clock3/><dt>Waktu</dt><dd>{formatTime(item)}</dd></div><div><MapPin/><dt>Arena</dt><dd>{item.venueId ? venueNames[item.venueId] ?? "Arena draf" : "Belum ditetapkan"}</dd></div></dl></article>)}</div>}
    </section>
  </main>;
}

function formatDate(item: Schedule) {
  const value = item.startAt?.toDate() ?? (item.date ? new Date(`${item.date}T00:00:00+08:00`) : null);
  return value ? value.toLocaleDateString("id-ID", { timeZone: "Asia/Makassar", day: "2-digit", month: "long", year: "numeric" }) : "Belum ditetapkan";
}

function formatTime(item: Schedule) {
  if (item.startAt && item.endAt) return `${item.startAt.toDate().toLocaleTimeString("id-ID", { timeZone: "Asia/Makassar", hour: "2-digit", minute: "2-digit", hour12: false })}–${item.endAt.toDate().toLocaleTimeString("id-ID", { timeZone: "Asia/Makassar", hour: "2-digit", minute: "2-digit", hour12: false })} WITA`;
  return item.startTime && item.endTime ? `${item.startTime}–${item.endTime} WITA` : "Belum ditetapkan";
}
