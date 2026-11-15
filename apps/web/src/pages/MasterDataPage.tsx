import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  GitBranch,
  Layers3,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Badge, Button } from "@/components/ui";
import { getFirebaseServices } from "@/config/firebase-services";
import { useAuth } from "@/features/auth/AuthContext";
import {
  branchSchema,
  divisionSchema,
  type BranchInput,
  type DivisionInput,
} from "@/features/master-data/schemas";
import {
  createDraftBranch,
  createDraftDivision,
  loadMasterData,
  updateDraftBranch,
  updateDraftDivision,
} from "@/features/master-data/repository";
import type {
  Branch,
  District,
  Division,
  EventConfiguration,
} from "@/features/master-data/types";

type Tab = "event" | "districts" | "branches" | "divisions";
const branchDefaults: BranchInput = {
  id: "",
  name: "",
  shortName: "",
  description: "",
};
const divisionDefaults: DivisionInput = {
  id: "",
  branchId: "",
  name: "",
  gender: "belum-ditetapkan",
  teamMode: "individual",
};

export function MasterDataPage() {
  const auth = useAuth();
  const services = useMemo(() => getFirebaseServices(), []);
  const eventId = auth.assignments[0]?.eventId ?? "mtqh-pinrang-2027";
  const [event, setEvent] = useState<EventConfiguration | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [tab, setTab] = useState<Tab>("event");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [branchEditor, setBranchEditor] = useState<Branch | null>(null);
  const [divisionEditor, setDivisionEditor] = useState<Division | null>(null);
  const branchForm = useForm<BranchInput>({
    resolver: zodResolver(branchSchema),
    defaultValues: branchDefaults,
  });
  const divisionForm = useForm<DivisionInput>({
    resolver: zodResolver(divisionSchema),
    defaultValues: divisionDefaults,
  });
  const reload = useCallback(async () => {
    if (!services) return;
    setLoading(true);
    setError(null);
    try {
      const data = await loadMasterData(services.firestore, eventId);
      setEvent(data.event);
      setDistricts(data.districts);
      setBranches(data.branches);
      setDivisions(data.divisions);
    } catch {
      setError(
        "Master data belum dapat dimuat. Periksa emulator/koneksi lalu coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }, [eventId, services]);
  useEffect(() => {
    const timer = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timer);
  }, [reload]);
  async function saveBranch(input: BranchInput) {
    if (!services || !auth.user) return;
    setError(null);
    setSuccess(null);
    try {
      if (branchEditor)
        await updateDraftBranch(
          services.firestore,
          eventId,
          auth.user.uid,
          input,
          branchEditor.revision,
        );
      else
        await createDraftBranch(
          services.firestore,
          eventId,
          auth.user.uid,
          input,
        );
      setSuccess(
        branchEditor ? "Cabang draft diperbarui." : "Cabang draft ditambahkan.",
      );
      setBranchEditor(null);
      branchForm.reset(branchDefaults);
      await reload();
    } catch {
      setError(
        "Cabang tidak dapat disimpan. Pastikan ID unik dan akun memiliki izin.",
      );
    }
  }
  async function saveDivision(input: DivisionInput) {
    if (!services || !auth.user) return;
    setError(null);
    setSuccess(null);
    try {
      if (divisionEditor)
        await updateDraftDivision(
          services.firestore,
          eventId,
          auth.user.uid,
          input,
          divisionEditor.revision,
        );
      else
        await createDraftDivision(
          services.firestore,
          eventId,
          auth.user.uid,
          input,
        );
      setSuccess(
        divisionEditor
          ? "Golongan draft diperbarui."
          : "Golongan draft ditambahkan.",
      );
      setDivisionEditor(null);
      divisionForm.reset(divisionDefaults);
      await reload();
    } catch {
      setError(
        "Golongan tidak dapat disimpan. Pastikan ID unik dan cabang dipilih.",
      );
    }
  }
  function editBranch(item: Branch) {
    setTab("branches");
    setBranchEditor(item);
    branchForm.reset({
      id: item.id,
      name: item.name,
      shortName: item.shortName,
      description: item.description,
    });
  }
  function editDivision(item: Division) {
    setTab("divisions");
    setDivisionEditor(item);
    divisionForm.reset({
      id: item.id,
      branchId: item.branchId,
      name: item.name,
      gender: item.gender as DivisionInput["gender"],
      teamMode: item.teamMode,
    });
  }
  const filter = (value: string) =>
    value.toLocaleLowerCase("id").includes(search.toLocaleLowerCase("id"));
  const visibleDistricts = districts.filter((item) => filter(item.name));
  const visibleBranches = branches.filter((item) =>
    filter(`${item.name} ${item.shortName} ${item.id}`),
  );
  const visibleDivisions = divisions.filter((item) =>
    filter(`${item.name} ${item.branchId} ${item.id}`),
  );
  if (loading)
    return (
      <div className="admin-page">
        <div className="master-skeleton" aria-label="Memuat master data">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  return (
    <div className="admin-page master-page">
      <div className="admin-heading">
        <div>
          <span>KONFIGURASI DRAFT</span>
          <h1>Master data acara</h1>
          <p>
            Kelola referensi teknis tanpa menganggap cabang, golongan, atau
            jadwal telah disahkan.
          </p>
        </div>
        <div>
          <Badge tone="warning">BELUM DISAHKAN</Badge>
          <Button variant="secondary" onClick={() => void reload()}>
            <RefreshCw /> Muat ulang
          </Button>
        </div>
      </div>
      {!navigator.onLine && (
        <div className="stale-banner">
          <WifiOff />
          <div>
            <strong>Anda sedang offline</strong>
            <span>
              Perubahan dinonaktifkan sampai koneksi kembali tersedia.
            </span>
          </div>
        </div>
      )}
      {error && (
        <div className="form-alert" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="success-box" role="status">
          <CheckCircle2 />
          <div>
            <strong>Berhasil</strong>
            <p>{success}</p>
          </div>
        </div>
      )}
      <div className="master-summary">
        <article>
          <Building2 />
          <span>Event</span>
          <strong>{event ? 1 : 0}</strong>
        </article>
        <article>
          <Layers3 />
          <span>Kecamatan</span>
          <strong>{districts.length}</strong>
        </article>
        <article>
          <GitBranch />
          <span>Cabang draft</span>
          <strong>{branches.length}</strong>
        </article>
        <article>
          <Layers3 />
          <span>Golongan draft</span>
          <strong>{divisions.length}</strong>
        </article>
      </div>
      <div className="master-toolbar">
        <div className="master-tabs" role="tablist">
          {(
            [
              ["event", "Event"],
              ["districts", "Kecamatan"],
              ["branches", "Cabang"],
              ["divisions", "Golongan"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        {tab !== "event" && (
          <label className="master-search">
            <Search />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari data…"
              aria-label="Cari master data"
            />
          </label>
        )}
      </div>
      {tab === "event" && (
        <section className="surface event-config">
          <div>
            <Badge tone="warning">DRAFT</Badge>
            <h2>{event?.name ?? "Event belum tersedia"}</h2>
            <p>
              ID stabil: <code>{eventId}</code>
            </p>
          </div>
          <dl>
            <div>
              <dt>Tahun</dt>
              <dd>{event?.year ?? "—"}</dd>
            </div>
            <div>
              <dt>Zona waktu</dt>
              <dd>{event?.timezone ?? "Asia/Makassar"}</dd>
            </div>
            <div>
              <dt>Tahap</dt>
              <dd>{event?.stage ?? "draft"}</dd>
            </div>
            <div>
              <dt>Keputusan</dt>
              <dd>{event?.decisionsStatus ?? "Menunggu pengesahan"}</dd>
            </div>
          </dl>
          <div className="safe-master-note">
            <AlertTriangle />
            <span>
              Nama kerja dan konfigurasi operasional tetap draft. Perubahan
              status resmi membutuhkan jalur approval server-side pada fase
              berikutnya.
            </span>
          </div>
        </section>
      )}
      {tab === "districts" && (
        <section className="master-list">
          {visibleDistricts.length === 0 ? (
            <EmptyMaster label="kecamatan" />
          ) : (
            visibleDistricts.map((item) => (
              <article className="surface master-row" key={item.id}>
                <span className="master-icon">
                  <Building2 />
                </span>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.id}</small>
                </div>
                <Badge tone="success">REFERENSI RESMI</Badge>
              </article>
            ))
          )}
        </section>
      )}
      {tab === "branches" && (
        <div className="master-split">
          <section className="master-list">
            {visibleBranches.length === 0 ? (
              <EmptyMaster label="cabang" />
            ) : (
              visibleBranches.map((item) => (
                <article className="surface master-row" key={item.id}>
                  <span className="master-icon">
                    <GitBranch />
                  </span>
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {item.id} · revisi {item.revision}
                    </small>
                  </div>
                  <Badge tone="warning">DRAFT</Badge>
                  <button
                    className="icon-action"
                    aria-label={`Edit ${item.name}`}
                    onClick={() => editBranch(item)}
                  >
                    <Pencil />
                  </button>
                </article>
              ))
            )}
          </section>
          <form
            className="surface master-form"
            onSubmit={branchForm.handleSubmit(saveBranch)}
          >
            <h2>
              {branchEditor ? "Edit cabang draft" : "Tambah cabang draft"}
            </h2>
            <p>ID teknis tidak dapat diubah setelah dibuat.</p>
            <FormField
              label="ID teknis"
              error={branchForm.formState.errors.id?.message}
            >
              <input
                {...branchForm.register("id")}
                disabled={!!branchEditor}
                placeholder="contoh-cabang"
              />
            </FormField>
            <FormField
              label="Nama cabang"
              error={branchForm.formState.errors.name?.message}
            >
              <input
                {...branchForm.register("name")}
                placeholder="Nama sesuai keputusan"
              />
            </FormField>
            <FormField
              label="Nama singkat"
              error={branchForm.formState.errors.shortName?.message}
            >
              <input
                {...branchForm.register("shortName")}
                placeholder="Nama navigasi"
              />
            </FormField>
            <FormField
              label="Deskripsi"
              error={branchForm.formState.errors.description?.message}
            >
              <textarea {...branchForm.register("description")} rows={3} />
            </FormField>
            <Button
              type="submit"
              disabled={!navigator.onLine || branchForm.formState.isSubmitting}
            >
              <Plus /> {branchEditor ? "Simpan revisi" : "Tambah sebagai draft"}
            </Button>
            {branchEditor && (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setBranchEditor(null);
                  branchForm.reset(branchDefaults);
                }}
              >
                Batal edit
              </button>
            )}
          </form>
        </div>
      )}
      {tab === "divisions" && (
        <div className="master-split">
          <section className="master-list">
            {visibleDivisions.length === 0 ? (
              <EmptyMaster label="golongan" />
            ) : (
              visibleDivisions.map((item) => (
                <article className="surface master-row" key={item.id}>
                  <span className="master-icon">
                    <Layers3 />
                  </span>
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {item.branchId} ·{" "}
                      {item.teamMode === "team" ? "Regu" : "Individu"} · revisi{" "}
                      {item.revision}
                    </small>
                  </div>
                  <Badge tone="warning">JUKNIS DRAFT</Badge>
                  <button
                    className="icon-action"
                    aria-label={`Edit ${item.name}`}
                    onClick={() => editDivision(item)}
                  >
                    <Pencil />
                  </button>
                </article>
              ))
            )}
          </section>
          <form
            className="surface master-form"
            onSubmit={divisionForm.handleSubmit(saveDivision)}
          >
            <h2>
              {divisionEditor ? "Edit golongan draft" : "Tambah golongan draft"}
            </h2>
            <p>Kuota dan batas usia belum tersedia sampai juknis disahkan.</p>
            <FormField
              label="ID teknis"
              error={divisionForm.formState.errors.id?.message}
            >
              <input
                {...divisionForm.register("id")}
                disabled={!!divisionEditor}
                placeholder="cabang-kategori"
              />
            </FormField>
            <FormField
              label="Cabang"
              error={divisionForm.formState.errors.branchId?.message}
            >
              <select {...divisionForm.register("branchId")}>
                <option value="">Pilih cabang</option>
                {branches.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              label="Nama golongan"
              error={divisionForm.formState.errors.name?.message}
            >
              <input
                {...divisionForm.register("name")}
                placeholder="Nama belum disahkan"
              />
            </FormField>
            <FormField
              label="Kategori"
              error={divisionForm.formState.errors.gender?.message}
            >
              <select {...divisionForm.register("gender")}>
                <option value="belum-ditetapkan">Belum ditetapkan</option>
                <option value="putra">Putra</option>
                <option value="putri">Putri</option>
                <option value="campuran">Campuran</option>
              </select>
            </FormField>
            <FormField
              label="Mode peserta"
              error={divisionForm.formState.errors.teamMode?.message}
            >
              <select {...divisionForm.register("teamMode")}>
                <option value="individual">Individu</option>
                <option value="team">Regu</option>
              </select>
            </FormField>
            <Button
              type="submit"
              disabled={
                !navigator.onLine || divisionForm.formState.isSubmitting
              }
            >
              <Plus />{" "}
              {divisionEditor ? "Simpan revisi" : "Tambah sebagai draft"}
            </Button>
            {divisionEditor && (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setDivisionEditor(null);
                  divisionForm.reset(divisionDefaults);
                }}
              >
                Batal edit
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      {label}
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
function EmptyMaster({ label }: { label: string }) {
  return (
    <div className="surface master-empty">
      <Layers3 />
      <strong>Belum ada {label}</strong>
      <span>Tambahkan data draft atau ubah kata pencarian.</span>
    </div>
  );
}
