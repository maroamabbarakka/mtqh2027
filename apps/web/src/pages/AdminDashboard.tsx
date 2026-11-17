import {
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  FileCheck2,
  Newspaper,
  Trophy,
  Users,
  UserRoundCheck,
} from "lucide-react";
import BranchChart from "@/components/BranchChart";
import { Badge, Button, SectionTitle, StatCard } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
export function AdminDashboard() {
  const auth = useAuth();
  const displayName = auth.user?.displayName?.trim() || "Panitia";
  return (
    <div className="admin-page">
      <div className="admin-heading">
        <div>
          <span>Ahad, 15 November 2026 · WITA</span>
          <h1>Selamat datang, {displayName}</h1>
          <p>
            Pantau kesiapan acara melalui data yang terukur dan terverifikasi.
          </p>
        </div>
        <div>
          <Badge tone="warning">EVENT DRAFT</Badge>
          <Button>Tinjau persiapan</Button>
        </div>
      </div>
      <div className="stale-banner">
        <CircleDashed />
        <div>
          <strong>Mode demonstrasi aktif</strong>
          <span>
            Data di halaman ini adalah simulasi untuk menguji antarmuka—bukan
            data resmi MTQH 2027.
          </span>
        </div>
      </div>
      <section className="admin-stats">
        <StatCard
          icon={Users}
          label="Kafilah"
          value="12"
          note="Data wilayah resmi"
        />
        <StatCard
          icon={UserRoundCheck}
          label="Peserta"
          value="—"
          note="Belum ada data resmi"
          tone="blue"
        />
        <StatCard
          icon={Trophy}
          label="Hasil disahkan"
          value="0"
          note="Publikasi terlindungi"
          tone="gold"
        />
        <StatCard
          icon={Newspaper}
          label="Antrean redaksi"
          value="0"
          note="Belum ada kiriman"
          tone="purple"
        />
      </section>
      <section className="dashboard-grid">
        <article className="surface chart-card">
          <SectionTitle
            eyebrow="Data simulasi"
            title="Sebaran peserta per cabang"
            action={
              <select aria-label="Rentang data">
                <option>Semua cabang</option>
              </select>
            }
          />
          <div className="chart-wrap">
            <BranchChart showAxis />
          </div>
        </article>
        <article className="surface progress-card">
          <SectionTitle eyebrow="Tahapan" title="Progres persiapan" />
          <div className="progress-ring">
            <div>
              <strong>12%</strong>
              <span>Simulasi</span>
            </div>
          </div>
          <ul>
            <li className="done">
              <CheckCircle2 />
              <span>
                <strong>Fondasi platform</strong>
                <small>Design system & navigasi</small>
              </span>
            </li>
            <li>
              <CircleDashed />
              <span>
                <strong>Konfigurasi acara</strong>
                <small>Menunggu juknis resmi</small>
              </span>
            </li>
            <li>
              <CircleDashed />
              <span>
                <strong>Pendaftaran</strong>
                <small>Belum dibuka</small>
              </span>
            </li>
            <li>
              <CircleDashed />
              <span>
                <strong>Pelaksanaan</strong>
                <small>Belum dimulai</small>
              </span>
            </li>
          </ul>
        </article>
      </section>
      <section className="dashboard-lower">
        <article className="surface">
          <SectionTitle eyebrow="Aksi terarah" title="Tugas berikutnya" />
          <div className="task-list">
            <div>
              <span className="task-icon">
                <FileCheck2 />
              </span>
              <div>
                <strong>Verifikasi konfigurasi awal</strong>
                <span>Pastikan semua data berlabel belum disahkan.</span>
              </div>
              <Badge tone="warning">Perlu tinjauan</Badge>
            </div>
            <div>
              <span className="task-icon">
                <CalendarClock />
              </span>
              <div>
                <strong>Lengkapi tanggal dan arena</strong>
                <span>Menunggu keputusan resmi panitia.</span>
              </div>
              <Badge tone="neutral">Diblokir keputusan</Badge>
            </div>
          </div>
        </article>
        <article className="surface quota-card">
          <SectionTitle eyebrow="Guardrail biaya" title="Status Spark" />
          <div className="quota-value">
            <strong>Aman</strong>
            <span>Fondasi tanpa layanan berbayar</span>
          </div>
          <div className="quota-bar">
            <span style={{ width: "12%" }} />
          </div>
          <small>Ringkasan pemantauan internal.</small>
        </article>
      </section>
    </div>
  );
}
