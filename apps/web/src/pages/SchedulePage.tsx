import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, MapPin, Plus, Search, WifiOff, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { getFirebaseServices } from "@/config/firebase-services";
import { useAuth } from "@/features/auth/AuthContext";
import { loadMasterData } from "@/features/master-data/repository";
import type { Branch, Division } from "@/features/master-data/types";
import { createDraftSchedule, createDraftVenue, loadDraftSchedules } from "@/features/schedule/repository";
import { scheduleSchema, venueSchema } from "@/features/schedule/schemas";
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
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<"venue" | "schedule" | null>(null);
  const [venueForm, setVenueForm] = useState({ id: "", name: "", description: "" });
  const [scheduleForm, setScheduleForm] = useState({ divisionId: "", venueId: "", title: "", date: "", startTime: "08:00", endTime: "11:30", notes: "" });

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

  async function saveVenue(event: React.FormEvent) {
    event.preventDefault();
    if (!services || !auth.user) return;
    const parsed = venueSchema.safeParse(venueForm);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Data arena belum lengkap."); return; }
    setSaving(true); setError(null);
    try { await createDraftVenue(services.firestore, eventId, auth.user.uid, parsed.data); setSuccess("Arena berhasil disimpan sebagai draf."); setEditor(null); setVenueForm({ id: "", name: "", description: "" }); await reload(); }
    catch { setError("Arena belum dapat disimpan. Pastikan kode belum digunakan."); }
    finally { setSaving(false); }
  }

  async function saveSchedule(event: React.FormEvent) {
    event.preventDefault();
    if (!services || !auth.user) return;
    const parsed = scheduleSchema.safeParse(scheduleForm);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Data sesi belum lengkap."); return; }
    const division = divisions.find((item) => item.id === parsed.data.divisionId);
    if (!division) { setError("Golongan yang dipilih tidak tersedia."); return; }
    setSaving(true); setError(null);
    try { await createDraftSchedule(services.firestore, eventId, auth.user.uid, division.branchId, parsed.data); setSuccess("Sesi berhasil disimpan sebagai draf."); setEditor(null); setScheduleForm({ divisionId: "", venueId: "", title: "", date: "", startTime: "08:00", endTime: "11:30", notes: "" }); await reload(); }
    catch { setError("Sesi belum dapat disimpan. Periksa pilihan golongan dan arena."); }
    finally { setSaving(false); }
  }

  if (loading) return <main className="admin-page"><div className="registration-skeleton"><span/><span/><span/></div></main>;
  return <main className="admin-page schedule-page">
    <header className="admin-heading"><div><span>Agenda internal • belum dipublikasikan</span><h1>Jadwal & Arena</h1><p>Tinjau susunan sesi simulasi sambil menunggu tanggal dan arena resmi panitia.</p></div>{auth.hasPermission("settings:manage") ? <div><Button variant="secondary" onClick={() => setEditor("venue")}><Plus size={16}/> Tambah arena</Button><Button onClick={() => setEditor("schedule")} disabled={venues.length === 0}><Plus size={16}/> Tambah sesi</Button></div> : <div aria-hidden="true"/>}</header>
    {!navigator.onLine && <div className="stale-banner"><WifiOff/><div><strong>Anda sedang offline</strong><span>Data yang terlihat mungkin belum diperbarui.</span></div></div>}
    {error && <div className="registration-alert error" role="alert"><AlertTriangle/><span>{error}</span><Button variant="secondary" onClick={() => void reload()}>Coba lagi</Button></div>}
    {success && <div className="registration-alert success" role="status"><CheckCircle2/><span>{success}</span><button onClick={() => setSuccess(null)} aria-label="Tutup"><X/></button></div>}
    <div className="safe-master-note"><AlertTriangle/> Seluruh jadwal di halaman ini adalah simulasi internal. Tanggal, jam, dan arena belum menjadi informasi resmi.</div>
    <section className="surface schedule-surface">
      <div className="schedule-toolbar"><div><h2>Daftar sesi draf</h2><small>{visible.length} dari maksimal 50 sesi</small></div><label className="master-search"><Search/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari golongan atau arena" aria-label="Cari jadwal"/></label></div>
      <div className="schedule-filters"><label>Cabang<select value={branchId} onChange={(event) => setBranchId(event.target.value)}><option value="">Semua cabang</option>{branches.map((item) => <option key={item.id} value={item.id}>{item.shortName}</option>)}</select></label><label>Tanggal simulasi<input type="date" value={date} onChange={(event) => setDate(event.target.value)}/></label>{(branchId || date || search) && <Button variant="secondary" onClick={() => { setBranchId(""); setDate(""); setSearch(""); }}>Bersihkan filter</Button>}</div>
      {visible.length === 0 ? <div className="master-empty"><CalendarDays/><strong>Tidak ada sesi yang sesuai</strong><span>Ubah pilihan filter atau tunggu jadwal draf ditambahkan.</span></div> : <div className="schedule-grid">{visible.map((item) => <article className="schedule-card" key={item.id}><header><Badge tone="warning">SIMULASI</Badge><span>{branchNames[item.branchId] ?? item.branchId}</span></header><h3>{divisionNames[item.divisionId] ?? item.title}</h3><p>{item.title}</p><dl><div><CalendarDays/><dt>Tanggal</dt><dd>{formatDate(item)}</dd></div><div><Clock3/><dt>Waktu</dt><dd>{formatTime(item)}</dd></div><div><MapPin/><dt>Arena</dt><dd>{item.venueId ? venueNames[item.venueId] ?? "Arena draf" : "Belum ditetapkan"}</dd></div></dl></article>)}</div>}
    </section>
    {editor === "venue" && <div className="modal-backdrop"><section className="registration-modal" role="dialog" aria-modal="true" aria-labelledby="venue-editor-title"><header><div><span>Data acuan draf</span><h2 id="venue-editor-title">Tambah arena</h2></div><button onClick={() => setEditor(null)} aria-label="Tutup"><X/></button></header><form className="registration-form" onSubmit={saveVenue} noValidate><label>Kode arena<input value={venueForm.id} onChange={(event) => setVenueForm({ ...venueForm, id: event.target.value })} placeholder="arena-utama"/></label><label>Nama arena<input value={venueForm.name} onChange={(event) => setVenueForm({ ...venueForm, name: event.target.value })} placeholder="Nama lokasi"/></label><label>Keterangan<textarea rows={3} value={venueForm.description} onChange={(event) => setVenueForm({ ...venueForm, description: event.target.value })}/></label><div className="safe-master-note"><AlertTriangle/> Arena tersimpan sebagai draf internal dan belum tampil di portal publik.</div><footer><Button type="button" variant="secondary" onClick={() => setEditor(null)}>Batal</Button><Button type="submit" disabled={saving || !navigator.onLine}>{saving ? "Menyimpan…" : "Simpan arena"}</Button></footer></form></section></div>}
    {editor === "schedule" && <div className="modal-backdrop"><section className="registration-modal" role="dialog" aria-modal="true" aria-labelledby="schedule-editor-title"><header><div><span>Agenda draf</span><h2 id="schedule-editor-title">Tambah sesi</h2></div><button onClick={() => setEditor(null)} aria-label="Tutup"><X/></button></header><form className="registration-form" onSubmit={saveSchedule} noValidate><label>Golongan<select value={scheduleForm.divisionId} onChange={(event) => setScheduleForm({ ...scheduleForm, divisionId: event.target.value })}><option value="">Pilih golongan</option>{divisions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Arena<select value={scheduleForm.venueId} onChange={(event) => setScheduleForm({ ...scheduleForm, venueId: event.target.value })}><option value="">Pilih arena</option>{venues.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Judul sesi<input value={scheduleForm.title} onChange={(event) => setScheduleForm({ ...scheduleForm, title: event.target.value })} placeholder="Contoh: Babak penyisihan"/></label><div className="form-two"><label>Tanggal<input type="date" value={scheduleForm.date} onChange={(event) => setScheduleForm({ ...scheduleForm, date: event.target.value })}/></label><label>Waktu mulai<input type="time" value={scheduleForm.startTime} onChange={(event) => setScheduleForm({ ...scheduleForm, startTime: event.target.value })}/></label></div><label>Waktu selesai<input type="time" value={scheduleForm.endTime} onChange={(event) => setScheduleForm({ ...scheduleForm, endTime: event.target.value })}/></label><label>Catatan internal<textarea rows={3} value={scheduleForm.notes} onChange={(event) => setScheduleForm({ ...scheduleForm, notes: event.target.value })}/></label><div className="safe-master-note"><AlertTriangle/> Sesi tersimpan sebagai draf dan tidak dipublikasikan otomatis.</div><footer><Button type="button" variant="secondary" onClick={() => setEditor(null)}>Batal</Button><Button type="submit" disabled={saving || !navigator.onLine}>{saving ? "Menyimpan…" : "Simpan sesi"}</Button></footer></form></section></div>}
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
