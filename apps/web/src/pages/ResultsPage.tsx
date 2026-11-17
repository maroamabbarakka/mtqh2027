import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Medal,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  WifiOff,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { getFirebaseServices } from "@/config/firebase-services";
import { useAuth } from "@/features/auth/AuthContext";
import { loadMasterData } from "@/features/master-data/repository";
import type { Division } from "@/features/master-data/types";
import type { Registration } from "@/features/registration/types";
import {
  createDraftResult,
  loadResultSubmissions,
  loadVerifiedEntries,
} from "@/features/results/repository";
import { transitionResult, type ResultAction } from "@/features/results/api";
import { resultSubmissionSchema } from "@/features/results/schemas";
import type {
  ResultSubmission,
  ResultSubmissionInput,
} from "@/features/results/types";

const defaults: ResultSubmissionInput = {
  branchId: "",
  divisionId: "",
  winners: [],
  sourceDocumentNumber: "",
  establishedAt: "",
  notes: "",
};

export function ResultsPage() {
  const auth = useAuth();
  const services = useMemo(() => getFirebaseServices(), []);
  const assignment = auth.assignments.find((item) => item.status === "active");
  const eventId = assignment?.eventId ?? "mtqh-pinrang-2027";
  const branchIds = useMemo(
    () =>
      assignment?.role === "branch_admin"
        ? (assignment.branchIds ?? [])
        : undefined,
    [assignment],
  );
  const canSubmit = auth.hasPermission("results:submit");
  const canApprove = auth.hasPermission("results:approve");
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [submissions, setSubmissions] = useState<ResultSubmission[]>([]);
  const [entries, setEntries] = useState<Registration[]>([]);
  const [form, setForm] = useState<ResultSubmissionInput>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<ResultSubmission | null>(
    null,
  );
  const [reviewReason, setReviewReason] = useState("");
  const selected = divisions.find((item) => item.id === form.divisionId);
  const availableDivisions = divisions.filter(
    (item) =>
      (!branchIds || branchIds.includes(item.branchId)) &&
      item.awardSlots.length > 0,
  );

  const reload = useCallback(async () => {
    if (!services) return;
    setLoading(true);
    setError(null);
    try {
      const [master, resultItems] = await Promise.all([
        loadMasterData(services.firestore, eventId),
        loadResultSubmissions(services.firestore, eventId, branchIds),
      ]);
      setDivisions(master.divisions);
      setSubmissions(resultItems);
    } catch {
      setError(
        "Data hasil belum dapat dimuat. Periksa koneksi dan kewenangan akun.",
      );
    } finally {
      setLoading(false);
    }
  }, [branchIds, eventId, services]);
  useEffect(() => {
    const timer = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  async function chooseDivision(divisionId: string) {
    const division = divisions.find((item) => item.id === divisionId);
    setForm({
      ...defaults,
      divisionId,
      branchId: division?.branchId ?? "",
      winners:
        division?.awardSlots.map((slot) => ({
          awardId: slot.id,
          entryId: "",
        })) ?? [],
    });
    if (!services || !divisionId) {
      setEntries([]);
      return;
    }
    try {
      setEntries(
        await loadVerifiedEntries(
          services.firestore,
          eventId,
          division?.branchId ?? "",
          divisionId,
        ),
      );
    } catch {
      setEntries([]);
      setError("Daftar peserta terverifikasi gagal dimuat.");
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!services || !auth.user || !selected) return;
    const parsed = resultSubmissionSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data hasil belum lengkap.");
      return;
    }
    const allowedSlots = new Set(selected.awardSlots.map((slot) => slot.id));
    const verified = new Set(entries.map((entry) => entry.id));
    if (
      parsed.data.winners.some(
        (winner) =>
          !allowedSlots.has(winner.awardId) || !verified.has(winner.entryId),
      )
    ) {
      setError("Slot atau peserta tidak lagi valid. Muat ulang data.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createDraftResult(
        services.firestore,
        eventId,
        auth.user.uid,
        parsed.data,
      );
      setSuccess(
        "Draf hasil berhasil disimpan. Data belum diajukan atau dipublikasikan.",
      );
      setOpen(false);
      setForm(defaults);
      await reload();
    } catch {
      setError(
        "Draf hasil belum dapat disimpan. Pastikan peserta telah diverifikasi dan cabang sesuai kewenangan.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function move(
    item: ResultSubmission,
    action: ResultAction,
    reason?: string,
  ) {
    if (!services || saving) return;
    setSaving(true);
    setError(null);
    try {
      await transitionResult(services.auth, eventId, item.id, action, reason);
      const messages = {
        submit: "Draft diajukan dan dikunci untuk review.",
        start_review: "Review hasil dimulai.",
        return: "Hasil dikembalikan untuk revisi.",
        approve: "Hasil disahkan sebagai hasil resmi.",
      };
      setSuccess(messages[action]);
      setReviewTarget(null);
      setReviewReason("");
      await reload();
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : "unknown";
      setError(
        code === "worker_not_configured"
          ? "Layanan pengesahan belum tersedia. Data tetap aman sebagai draf."
          : "Perubahan belum dapat diproses. Muat ulang halaman lalu coba lagi.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <main className="admin-page">
        <div className="registration-skeleton">
          <span />
          <span />
        </div>
      </main>
    );
  return (
    <main className="admin-page registration-page">
      <header className="admin-heading">
        <div>
          <span>Pengelolaan hasil • berdasarkan berita acara</span>
          <h1>Hasil Lomba</h1>
          <p>
            Susun penerima penghargaan dari peserta terverifikasi berdasarkan
            berita acara.
          </p>
        </div>
        {canSubmit && (
          <div className="registration-heading-actions">
            <Button onClick={() => setOpen(true)}>
              <Plus size={17} /> Buat draf hasil
            </Button>
          </div>
        )}
      </header>
      {!navigator.onLine && (
        <div className="stale-banner">
          <WifiOff />
          <div>
            <strong>Anda sedang offline</strong>
            <span>Penyimpanan draft dinonaktifkan.</span>
          </div>
        </div>
      )}
      {error && (
        <div className="registration-alert error">
          <AlertTriangle />
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Tutup">
            <X />
          </button>
        </div>
      )}
      {success && (
        <div className="registration-alert success">
          <CheckCircle2 />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} aria-label="Tutup">
            <X />
          </button>
        </div>
      )}
      <div className="safe-master-note">
        <ShieldCheck /> Pengajuan dan pengesahan diproses melalui layanan aman.
        Klasemen serta publikasi belum diaktifkan.
      </div>
      <section className="surface registration-list results-list">
        <div className="registration-toolbar">
          <div>
            <h2>Draf sesuai kewenangan</h2>
            <small>Menampilkan maksimal 50 pengajuan terbaru.</small>
          </div>
        </div>
        {submissions.length === 0 ? (
          <div className="master-empty">
            <Medal />
            <strong>Belum ada draf hasil</strong>
            <span>
              {canSubmit
                ? "Buat draf setelah penerima penghargaan dan peserta terverifikasi tersedia."
                : "Data tampil sesuai kewenangan akun."}
            </span>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Golongan</th>
                  <th>Berita acara</th>
                  <th>Penerima</th>
                  <th>Status</th>
                  <th>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {divisions.find((x) => x.id === item.divisionId)?.name ??
                        item.divisionId}
                    </td>
                    <td>
                      {item.sourceDocumentNumber}
                      <small className="table-subtext">
                        {item.establishedAt}
                      </small>
                    </td>
                    <td>{item.winners.length} slot</td>
                    <td>
                      <Badge
                        tone={
                          item.status === "approved" ? "success" : "warning"
                        }
                      >
                        {item.status.replaceAll("_", " ")}
                      </Badge>
                    </td>
                    <td>
                      <div className="row-actions">
                        {canSubmit &&
                          item.status === "draft" &&
                          item.createdBy === auth.user?.uid && (
                            <Button
                              variant="secondary"
                              disabled={saving}
                              onClick={() => void move(item, "submit")}
                            >
                              <Send size={14} /> Ajukan
                            </Button>
                          )}
                        {canApprove &&
                          item.status === "submitted" &&
                          item.createdBy !== auth.user?.uid && (
                            <Button
                              variant="secondary"
                              disabled={saving}
                              onClick={() => void move(item, "start_review")}
                            >
                              <Eye size={14} /> Mulai review
                            </Button>
                          )}
                        {canApprove &&
                          item.status === "under_review" &&
                          item.reviewedBy === auth.user?.uid && (
                            <Button
                              variant="secondary"
                              onClick={() => setReviewTarget(item)}
                            >
                              <ShieldCheck size={14} /> Putuskan
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {open && (
        <div className="modal-backdrop">
          <section
            className="registration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-title"
          >
            <header>
              <div>
                <span>Draf internal</span>
                <h2 id="result-title">Susun hasil lomba</h2>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Tutup">
                <X />
              </button>
            </header>
            <form className="registration-form" onSubmit={save} noValidate>
              <label>
                Golongan
                <select
                  value={form.divisionId}
                  onChange={(e) => void chooseDivision(e.target.value)}
                >
                  <option value="">Pilih golongan</option>
                  {availableDivisions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              {selected?.awardSlots.map((slot, index) => (
                <div className="result-winner" key={slot.id}>
                  <strong>{slot.label}</strong>
                  <label>
                    Peserta/regu terverifikasi
                    <select
                      value={form.winners[index]?.entryId ?? ""}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          winners: current.winners.map((winner, position) =>
                            position === index
                              ? { ...winner, entryId: event.target.value }
                              : winner,
                          ),
                        }))
                      }
                    >
                      <option value="">Pilih penerima</option>
                      {entries.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.displayName} • {entry.districtId}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
              {selected && entries.length === 0 && (
                <div className="safe-master-note">
                  <AlertTriangle /> Belum ada pendaftaran terverifikasi pada
                  golongan ini.
                </div>
              )}
              <div className="form-two">
                <label>
                  Nomor berita acara
                  <input
                    value={form.sourceDocumentNumber}
                    onChange={(e) =>
                      setForm({ ...form, sourceDocumentNumber: e.target.value })
                    }
                    placeholder="Nomor dokumen resmi"
                  />
                </label>
                <label>
                  Tanggal penetapan
                  <input
                    type="date"
                    value={form.establishedAt}
                    onChange={(e) =>
                      setForm({ ...form, establishedAt: e.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                Catatan internal
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </label>
              <footer>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !navigator.onLine || entries.length === 0}
                >
                  {saving ? "Menyimpan…" : "Simpan draft"}
                </Button>
              </footer>
            </form>
          </section>
        </div>
      )}
      {reviewTarget && (
        <div className="modal-backdrop">
          <section
            className="registration-modal review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-review-title"
          >
            <header>
              <div>
                <span>Pemeriksaan oleh petugas berbeda</span>
                <h2 id="result-review-title">Keputusan hasil lomba</h2>
              </div>
              <button onClick={() => setReviewTarget(null)} aria-label="Tutup">
                <X />
              </button>
            </header>
            <div className="review-body">
              <div className="safe-master-note">
                <ShieldCheck /> Pengesahan membuat hasil resmi, tetapi belum
                menghitung klasemen sampai kebijakan poin disahkan.
              </div>
              <label>
                Alasan revisi
                <textarea
                  rows={4}
                  value={reviewReason}
                  onChange={(event) => setReviewReason(event.target.value)}
                  placeholder="Wajib minimal 10 karakter jika dikembalikan."
                />
              </label>
              <footer>
                <Button
                  variant="secondary"
                  disabled={saving || reviewReason.trim().length < 10}
                  onClick={() =>
                    void move(reviewTarget, "return", reviewReason)
                  }
                >
                  <RotateCcw size={15} /> Minta revisi
                </Button>
                <Button
                  disabled={saving}
                  onClick={() => void move(reviewTarget, "approve")}
                >
                  <ShieldCheck size={15} /> Sahkan hasil
                </Button>
              </footer>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
