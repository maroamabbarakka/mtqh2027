import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Users,
  WifiOff,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Badge, Button } from "@/components/ui";
import { getFirebaseServices } from "@/config/firebase-services";
import { useAuth } from "@/features/auth/AuthContext";
import { loadMasterData } from "@/features/master-data/repository";
import type { Branch, District, Division } from "@/features/master-data/types";
import {
  buildRegistrationCsv,
  registrationExportFilename,
} from "@/features/registration/export";
import {
  createDraftRegistration,
  loadRegistrations,
  transitionRegistration,
  type RegistrationTransition,
} from "@/features/registration/repository";
import {
  registrationSchema,
  reviewReasonSchema,
  type RegistrationInput,
} from "@/features/registration/schemas";
import type { Registration } from "@/features/registration/types";

const defaults: RegistrationInput = {
  entryType: "individual",
  districtId: "",
  divisionId: "",
  fullName: "",
  gender: "belum-ditetapkan",
  teamName: "",
  memberNames: "",
  managerName: "",
  managerPhone: "",
  notes: "",
  acknowledgement: false,
};
const statusLabels = {
  draft: "Draft",
  submitted: "Diajukan",
  under_review: "Sedang diperiksa",
  verified: "Terverifikasi",
  revision_required: "Perlu revisi",
  rejected: "Ditolak",
} as const;

export function RegistrationPage() {
  const auth = useAuth();
  const services = useMemo(() => getFirebaseServices(), []);
  const assignment = auth.assignments.find((item) => item.status === "active");
  const eventId = assignment?.eventId ?? "mtqh-pinrang-2027";
  const lockedDistricts = useMemo(
    () =>
      assignment?.role === "kafilah_admin"
        ? (assignment.districtIds ?? [])
        : undefined,
    [assignment],
  );
  const canWrite =
    auth.hasPermission("participants:write") && assignment?.role !== "verifier";
  const canExport = auth.assignments.some(
    (item) =>
      item.status === "active" &&
      ["super_admin", "event_admin", "kafilah_admin"].includes(item.role),
  );
  const isReviewer = auth.assignments.some(
    (item) =>
      item.status === "active" &&
      ["super_admin", "event_admin", "verifier"].includes(item.role),
  );
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    Registration["status"] | "all"
  >("all");
  const [reviewTarget, setReviewTarget] = useState<Registration | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: defaults,
  });
  const entryType = useWatch({ control: form.control, name: "entryType" });
  const selectedDivision = useWatch({
    control: form.control,
    name: "divisionId",
  });

  const reload = useCallback(async () => {
    if (!services) return;
    setLoading(true);
    setError(null);
    try {
      const [master, entries] = await Promise.all([
        loadMasterData(services.firestore, eventId),
        loadRegistrations(services.firestore, eventId, lockedDistricts),
      ]);
      setDistricts(master.districts);
      setBranches(master.branches);
      setDivisions(master.divisions);
      setRegistrations(entries);
    } catch {
      setError(
        "Data pendaftaran belum dapat dimuat. Periksa koneksi lalu coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }, [eventId, lockedDistricts, services]);
  useEffect(() => {
    const timer = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timer);
  }, [reload]);
  useEffect(() => {
    if (lockedDistricts?.length === 1)
      form.setValue("districtId", lockedDistricts[0]);
  }, [form, lockedDistricts]);
  useEffect(() => {
    const division = divisions.find((item) => item.id === selectedDivision);
    if (division) {
      form.setValue("entryType", division.teamMode);
      form.setValue("gender", division.gender as RegistrationInput["gender"]);
    }
  }, [divisions, form, selectedDivision]);

  const names = useMemo(
    () => ({
      districts: Object.fromEntries(districts.map((x) => [x.id, x.name])),
      divisions: Object.fromEntries(divisions.map((x) => [x.id, x.name])),
    }),
    [districts, divisions],
  );
  const visible = registrations.filter(
    (item) =>
      (statusFilter === "all" || item.status === statusFilter) &&
      `${item.displayName} ${names.districts[item.districtId]} ${names.divisions[item.divisionId]}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function closeWizard() {
    setOpen(false);
    setStep(1);
    form.reset({ ...defaults, districtId: lockedDistricts?.[0] ?? "" });
  }
  async function save(input: RegistrationInput) {
    if (!services || !auth.user) return;
    const division = divisions.find((item) => item.id === input.divisionId);
    if (!division) return;
    const duplicate = registrations.some(
      (item) =>
        item.districtId === input.districtId &&
        item.divisionId === input.divisionId &&
        item.displayName.toLocaleLowerCase("id") ===
          (input.entryType === "team"
            ? input.teamName
            : input.fullName
          ).toLocaleLowerCase("id"),
    );
    if (duplicate) {
      setError(
        "Entri dengan nama, kecamatan, dan golongan yang sama sudah ada pada daftar ini.",
      );
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createDraftRegistration(
        services.firestore,
        eventId,
        auth.user.uid,
        division.branchId,
        input,
      );
      setSuccess(
        "Pendaftaran tersimpan sebagai draft dan menunggu pemeriksaan manual.",
      );
      closeWizard();
      await reload();
    } catch {
      setError(
        "Pendaftaran belum berhasil disimpan. Periksa isian lalu coba lagi.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function moveStatus(
    item: Registration,
    nextStatus: RegistrationTransition,
    reason?: string,
  ) {
    if (!services || !auth.user || saving) return;
    setSaving(true);
    setError(null);
    try {
      await transitionRegistration(
        services.firestore,
        eventId,
        item.id,
        auth.user.uid,
        nextStatus,
        reason,
      );
      const messages = {
        submitted: "Pendaftaran berhasil diajukan.",
        under_review: "Pemeriksaan dimulai.",
        revision_required: "Pendaftaran dikembalikan untuk revisi.",
        rejected: "Pendaftaran ditolak secara administratif.",
      };
      setSuccess(messages[nextStatus]);
      setReviewTarget(null);
      setReviewReason("");
      await reload();
    } catch {
      setError(
        "Perubahan status ditolak. Muat ulang data dan pastikan akun memiliki kewenangan.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function decideReview(nextStatus: "revision_required" | "rejected") {
    if (!reviewTarget) return;
    const parsed = reviewReasonSchema.safeParse({ reason: reviewReason });
    if (!parsed.success) {
      setReviewError(parsed.error.issues[0]?.message ?? "Alasan tidak valid.");
      return;
    }
    setReviewError(null);
    await moveStatus(reviewTarget, nextStatus, parsed.data.reason);
  }
  function exportCsv() {
    if (!canExport || visible.length === 0) return;
    const scopeLabel = lockedDistricts?.length
      ? `Kecamatan: ${lockedDistricts.map((id) => names.districts[id] ?? id).join(", ")}`
      : "Seluruh kecamatan pada kegiatan ini";
    const filterLabel = `Status: ${statusFilter === "all" ? "Semua" : statusLabels[statusFilter]}; Pencarian: ${search.trim() || "Tidak ada"}`;
    const csv = buildRegistrationCsv({
      eventId,
      registrations: visible,
      districtNames: names.districts,
      divisionNames: names.divisions,
      statusLabels,
      scopeLabel,
      filterLabel,
    });
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = registrationExportFilename(eventId);
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setSuccess(`${visible.length} entri berhasil diunduh sebagai berkas data.`);
  }

  if (loading)
    return (
      <main className="admin-page">
        <div className="registration-skeleton">
          <span />
          <span />
          <span />
        </div>
      </main>
    );
  return (
    <main className="admin-page registration-page">
      <header className="admin-heading">
        <div>
          <span>Administrasi peserta • sesuai wilayah tugas</span>
          <h1>Peserta & Regu</h1>
          <p>
            Kelola pendaftaran sesuai kewenangan tanpa menampilkan data pribadi
            ke publik.
          </p>
        </div>
        <div className="registration-heading-actions">
          {canExport && (
            <Button
              variant="secondary"
              onClick={exportCsv}
              disabled={visible.length === 0}
            >
              <Download size={17} /> Unduh data ({visible.length})
            </Button>
          )}
          {canWrite && (
            <Button onClick={() => setOpen(true)}>
              <Plus size={17} /> Pendaftaran baru
            </Button>
          )}
        </div>
      </header>
      {!navigator.onLine && (
        <div className="stale-banner">
          <WifiOff />
          <div>
            <strong>Anda sedang offline</strong>
            <span>Aksi simpan dinonaktifkan sampai koneksi pulih.</span>
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
      <section className="registration-summary">
        <article>
          <Users />
          <span>Total sesuai kewenangan</span>
          <strong>{registrations.length}</strong>
        </article>
        <article>
          <ClipboardList />
          <span>Menunggu pemeriksaan</span>
          <strong>
            {registrations.filter((x) => x.status === "submitted").length}
          </strong>
        </article>
        <article>
          <ShieldCheck />
          <span>Dalam pemeriksaan</span>
          <strong>
            {registrations.filter((x) => x.status === "under_review").length}
          </strong>
        </article>
      </section>
      <section className="surface registration-list">
        <div className="registration-toolbar">
          <div>
            <h2>Daftar pendaftaran</h2>
            <small>Menampilkan maksimal 50 pendaftaran terbaru.</small>
          </div>
          <label className="master-search">
            <Search />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau wilayah"
              aria-label="Cari pendaftaran"
            />
          </label>
        </div>
        <div className="status-filters" aria-label="Filter status">
          {(
            [
              "all",
              "draft",
              "submitted",
              "under_review",
              "revision_required",
              "rejected",
            ] as const
          ).map((status) => (
            <button
              key={status}
              className={statusFilter === status ? "active" : ""}
              onClick={() => setStatusFilter(status)}
            >
              {status === "all" ? "Semua" : statusLabels[status]}
            </button>
          ))}
        </div>
        {visible.length === 0 ? (
          <div className="master-empty">
            <Users />
            <strong>Tidak ada pendaftaran</strong>
            <span>
              {canWrite
                ? "Buat draf baru atau ubah pilihan status."
                : "Data akan muncul sesuai kewenangan dan pilihan penyaringan Anda."}
            </span>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nama entri</th>
                  <th>Wilayah</th>
                  <th>Golongan</th>
                  <th>Status</th>
                  <th>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.displayName}</strong>
                      <small className="table-subtext">
                        {item.entryType === "team" ? "Regu" : "Perorangan"} • Nomor{" "}
                        {item.id.slice(0, 8)}
                      </small>
                    </td>
                    <td>
                      {names.districts[item.districtId] ?? item.districtId}
                    </td>
                    <td>
                      {names.divisions[item.divisionId] ?? item.divisionId}
                    </td>
                    <td>
                      <Badge
                        tone={
                          item.status === "verified"
                            ? "success"
                            : item.status === "rejected"
                              ? "neutral"
                              : "warning"
                        }
                      >
                        {statusLabels[item.status]}
                      </Badge>
                      {item.reviewReason && (
                        <small className="table-subtext">
                          {item.reviewReason}
                        </small>
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        {canWrite &&
                          auth.user?.uid === item.createdBy &&
                          ["draft", "revision_required"].includes(
                            item.status,
                          ) && (
                            <Button
                              variant="secondary"
                              disabled={saving || !navigator.onLine}
                              onClick={() => void moveStatus(item, "submitted")}
                            >
                              <Send size={15} /> Ajukan
                            </Button>
                          )}
                        {isReviewer &&
                          auth.user?.uid !== item.createdBy &&
                          item.status === "submitted" && (
                            <Button
                              variant="secondary"
                              disabled={saving || !navigator.onLine}
                              onClick={() =>
                                void moveStatus(item, "under_review")
                              }
                            >
                              <Eye size={15} /> Mulai review
                            </Button>
                          )}
                        {isReviewer &&
                          item.status === "under_review" &&
                          item.reviewedBy === auth.user?.uid && (
                            <Button
                              variant="secondary"
                              onClick={() => setReviewTarget(item)}
                            >
                              <ClipboardList size={15} /> Putuskan
                            </Button>
                          )}
                        {item.status === "verified" && (
                          <span className="verified-lock">
                            <ShieldCheck size={15} /> Final
                          </span>
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
        <div className="modal-backdrop" role="presentation">
          <section
            className="registration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-title"
          >
            <header>
              <div>
                <span>Langkah {step} dari 3</span>
                <h2 id="registration-title">Pendaftaran baru</h2>
              </div>
              <button onClick={closeWizard} aria-label="Tutup">
                <X />
              </button>
            </header>
            <div className="stepper">
              <span className={step >= 1 ? "active" : ""}>1. Scope</span>
              <span className={step >= 2 ? "active" : ""}>2. Data</span>
              <span className={step >= 3 ? "active" : ""}>3. Konfirmasi</span>
            </div>
            <form
              onSubmit={form.handleSubmit(save)}
              className="registration-form"
              noValidate
            >
              {step === 1 && (
                <>
                  <label>
                    Kecamatan
                    <select
                      {...form.register("districtId")}
                      disabled={lockedDistricts?.length === 1}
                    >
                      <option value="">Pilih kecamatan</option>
                      {districts
                        .filter(
                          (x) =>
                            !lockedDistricts || lockedDistricts.includes(x.id),
                        )
                        .map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.name}
                          </option>
                        ))}
                    </select>
                    <small>{form.formState.errors.districtId?.message}</small>
                  </label>
                  <label>
                    Golongan
                    <select {...form.register("divisionId")}>
                      <option value="">Pilih golongan draft</option>
                      {divisions.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name} •{" "}
                          {branches.find((b) => b.id === x.branchId)?.shortName}
                        </option>
                      ))}
                    </select>
                    <small>{form.formState.errors.divisionId?.message}</small>
                  </label>
                  <div className="safe-master-note">
                    <AlertTriangle /> Golongan masih konfigurasi draft. Batas
                    usia dan kuota belum disahkan sehingga kelayakan wajib
                    diperiksa manual.
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="entry-switch">
                    <button
                      type="button"
                      className={entryType === "individual" ? "active" : ""}
                      onClick={() => form.setValue("entryType", "individual")}
                      disabled={!!selectedDivision}
                    >
                      Perorangan
                    </button>
                    <button
                      type="button"
                      className={entryType === "team" ? "active" : ""}
                      onClick={() => form.setValue("entryType", "team")}
                      disabled={!!selectedDivision}
                    >
                      Regu
                    </button>
                  </div>
                  {entryType === "individual" ? (
                    <label>
                      Nama lengkap peserta
                      <input
                        {...form.register("fullName")}
                        placeholder="Sesuai dokumen resmi"
                      />
                      <small>{form.formState.errors.fullName?.message}</small>
                    </label>
                  ) : (
                    <>
                      <label>
                        Nama regu
                        <input
                          {...form.register("teamName")}
                          placeholder="Contoh: Regu Fahmil Tiroang"
                        />
                        <small>{form.formState.errors.teamName?.message}</small>
                      </label>
                      <label>
                        Nama anggota
                        <textarea
                          {...form.register("memberNames")}
                          rows={4}
                          placeholder={"Satu nama per baris\nAnggota kedua"}
                        />
                        <small>
                          {form.formState.errors.memberNames?.message}
                        </small>
                      </label>
                    </>
                  )}
                  <div className="form-two">
                    <label>
                      Nama pengurus
                      <input {...form.register("managerName")} />
                      <small>
                        {form.formState.errors.managerName?.message}
                      </small>
                    </label>
                    <label>
                      Nomor pengurus
                      <input
                        {...form.register("managerPhone")}
                        inputMode="tel"
                      />
                      <small>
                        {form.formState.errors.managerPhone?.message}
                      </small>
                    </label>
                  </div>
                  <label>
                    Catatan opsional
                    <textarea {...form.register("notes")} rows={3} />
                    <small>{form.formState.errors.notes?.message}</small>
                  </label>
                </>
              )}
              {step === 3 && (
                <div className="confirmation-card">
                  <ShieldCheck />
                  <h3>Periksa sebelum menyimpan</h3>
                  <p>
                    Entri akan tersimpan sebagai <strong>draft</strong>. Tidak
                    ada NIK, tanggal lahir, atau dokumen identitas yang
                    dikumpulkan pada tahap ini.
                  </p>
                  <label className="check-line">
                    <input
                      type="checkbox"
                      {...form.register("acknowledgement")}
                    />{" "}
                    Saya memastikan data sesuai sumber administrasi kafilah.
                  </label>
                  <small>
                    {form.formState.errors.acknowledgement?.message}
                  </small>
                </div>
              )}
              <footer>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    step === 1 ? closeWizard() : setStep(step - 1)
                  }
                >
                  {step === 1 ? "Batal" : "Kembali"}
                </Button>
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={async () => {
                      const fields =
                        step === 1
                          ? (["districtId", "divisionId"] as const)
                          : entryType === "team"
                            ? ([
                                "teamName",
                                "memberNames",
                                "managerName",
                                "managerPhone",
                              ] as const)
                            : ([
                                "fullName",
                                "managerName",
                                "managerPhone",
                              ] as const);
                      if (await form.trigger(fields)) setStep(step + 1);
                    }}
                  >
                    Lanjut
                  </Button>
                ) : (
                  <Button type="submit" disabled={saving || !navigator.onLine}>
                    {saving ? "Menyimpan…" : "Simpan draft"}
                  </Button>
                )}
              </footer>
            </form>
          </section>
        </div>
      )}
      {reviewTarget && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="registration-modal review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
          >
            <header>
              <div>
                <span>Pemeriksaan administratif</span>
                <h2 id="review-title">Putuskan tindak lanjut</h2>
              </div>
              <button onClick={() => setReviewTarget(null)} aria-label="Tutup">
                <X />
              </button>
            </header>
            <div className="review-body">
              <dl>
                <div>
                  <dt>Entri</dt>
                  <dd>{reviewTarget.displayName}</dd>
                </div>
                <div>
                  <dt>Wilayah</dt>
                  <dd>{names.districts[reviewTarget.districtId]}</dd>
                </div>
                <div>
                  <dt>Golongan</dt>
                  <dd>{names.divisions[reviewTarget.divisionId]}</dd>
                </div>
              </dl>
              <div className="safe-master-note">
                <ShieldCheck /> Verifikasi final belum tersedia. Pemeriksaan ini
                hanya dapat meminta revisi atau menolak secara administratif.
              </div>
              <label>
                Alasan keputusan
                <textarea
                  rows={5}
                  value={reviewReason}
                  onChange={(event) => setReviewReason(event.target.value)}
                  placeholder="Jelaskan data yang perlu diperbaiki atau dasar penolakan."
                />
                <small>{reviewError}</small>
              </label>
              <footer>
                <Button
                  variant="secondary"
                  onClick={() => void decideReview("revision_required")}
                  disabled={saving}
                >
                  Minta revisi
                </Button>
                <Button
                  onClick={() => void decideReview("rejected")}
                  disabled={saving}
                >
                  Tolak pendaftaran
                </Button>
              </footer>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
