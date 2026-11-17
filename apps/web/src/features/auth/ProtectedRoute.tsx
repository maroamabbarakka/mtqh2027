import { Navigate, Outlet, useLocation } from "react-router-dom";
import { StatePanel } from "@/components/ui";
import { useAuth } from "./AuthContext";
import type { Permission } from "./types";

export function ProtectedRoute({ permission }: { permission?: Permission }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.loading)
    return (
      <main className="center-page">
        <div className="auth-loader" aria-label="Memverifikasi akses">
          <span />
          <p>Memverifikasi akses aman…</p>
        </div>
      </main>
    );
  if (!auth.configured)
    return (
      <main className="center-page">
        <StatePanel type="error" onRetry={() => window.location.reload()} />
      </main>
    );
  if (!auth.user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (auth.disabled || auth.assignments.length === 0)
    return <Navigate to="/akun-menunggu-aktivasi" replace />;
  if (auth.profile?.mustChangePassword && location.pathname !== "/app/keamanan")
    return <Navigate to="/app/keamanan" replace />;
  if (permission && !auth.hasPermission(permission))
    return <Navigate to="/403" replace />;
  return <Outlet />;
}
