import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Brand } from "@/components/Brand";
import { Badge } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
import type { Permission } from "@/features/auth/types";

const links: {
  to: string;
  label: string;
  Icon: typeof LayoutDashboard;
  permission?: Permission;
}[] = [
  { to: "/app/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  {
    to: "/app/peserta",
    label: "Peserta & Regu",
    Icon: Users,
    permission: "participants:view",
  },
  {
    to: "/app/hasil",
    label: "Hasil Lomba",
    Icon: Trophy,
    permission: "results:view",
  },
  { to: "/app/jadwal", label: "Jadwal & Arena", Icon: CalendarDays },
  {
    to: "/app/media",
    label: "Berita & Galeri",
    Icon: Newspaper,
    permission: "news:write",
  },
  {
    to: "/app/laporan",
    label: "Laporan",
    Icon: BarChart3,
    permission: "reports:view",
  },
  {
    to: "/app/pengaturan",
    label: "Pengaturan",
    Icon: Settings,
    permission: "settings:manage",
  },
  { to: "/app/profil", label: "Profil Saya", Icon: UserRound },
];
export function AdminShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const auth = useAuth();
  const visibleLinks = links.filter(
    (link) => !link.permission || auth.hasPermission(link.permission),
  );
  const activeRole =
    auth.assignments[0]?.role.replace("_", " ") ?? "tanpa peran";
  const initials = (auth.user?.displayName || auth.user?.email || "AP")
    .split(/\s|@/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div className={`admin-shell ${collapsed ? "is-collapsed" : ""}`}>
      <a className="skip-link" href="#admin-main">
        Lewati ke konten utama
      </a>
      <aside className={mobile ? "mobile-open" : ""}>
        <div className="side-brand">
          <Brand inverse compact={collapsed} />
        </div>
        <nav aria-label="Navigasi portal panitia">
          {visibleLinks.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} onClick={() => setMobile(false)}>
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="spark-card">
          <span>⚡ Firebase Spark</span>
          <small>Arsitektur tanpa billing</small>
        </div>
        <button
          className="public-link signout-link"
          onClick={() => auth.signOutUser()}
        >
          <LogOut />
          <span>Keluar dari akun</span>
        </button>
        <NavLink className="public-link" to="/">
          <LogOut />
          <span>Kembali ke portal publik</span>
        </NavLink>
        <button
          className="collapse"
          aria-label="Ciutkan sidebar"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft />
        </button>
      </aside>
      {mobile && (
        <button
          className="backdrop"
          aria-label="Tutup navigasi"
          onClick={() => setMobile(false)}
        />
      )}
      <section className="admin-area">
        <header className="admin-topbar">
          <button
            className="admin-menu"
            aria-label="Buka navigasi"
            onClick={() => setMobile(true)}
          >
            <Menu />
          </button>
          <div className="workspace-title">
            <strong>MTQH XXXV Pinrang</strong>
            <span>Workspace Persiapan</span>
          </div>
          <div className="account">
            <Badge tone="warning">SIMULASI</Badge>
            <div className="avatar">{initials}</div>
            <div>
              <strong>{auth.user?.displayName || auth.user?.email}</strong>
              <span>{activeRole} · akses terbatas</span>
            </div>
          </div>
        </header>
        <main id="admin-main">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
