import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { AdminShell } from "@/layouts/AdminShell";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { AccountPage } from "@/pages/AccountPage";
import { MasterDataPage } from "@/pages/MasterDataPage";
import { RegistrationPage } from "@/pages/RegistrationPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

export default function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<ProtectedRoute permission="dashboard:view" />}>
          <Route element={<AdminShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="keamanan" element={<AccountPage />} />
            <Route path="profil" element={<AccountPage />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route element={<ProtectedRoute permission="participants:view" />}>
              <Route path="peserta" element={<RegistrationPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="results:view" />}>
              <Route
                path="hasil"
                element={
                  <PlaceholderPage
                    title="Hasil Lomba"
                    description="Input hanya susunan juara dari berita acara resmi—tanpa komponen skor."
                    admin
                  />
                }
              />
            </Route>
            <Route
              path="jadwal"
              element={
                <PlaceholderPage
                  title="Jadwal & Arena"
                  description="Tanggal dan venue rinci belum disahkan panitia."
                  admin
                />
              }
            />
            <Route element={<ProtectedRoute permission="news:write" />}>
              <Route
                path="media"
                element={
                  <PlaceholderPage
                    title="Berita & Galeri"
                    description="Kiriman harus dimoderasi redaksi sebelum menjadi publik."
                    admin
                  />
                }
              />
            </Route>
            <Route element={<ProtectedRoute permission="reports:view" />}>
              <Route
                path="laporan"
                element={
                  <PlaceholderPage
                    title="Laporan"
                    description="Laporan mengikuti scope akun dan tidak mengekspos data pribadi."
                    admin
                  />
                }
              />
            </Route>
            <Route element={<ProtectedRoute permission="settings:manage" />}>
              <Route
                path="pengaturan"
                element={<MasterDataPage />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
