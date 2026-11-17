import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { getFirebaseServices } from "@/config/firebase-services";
import { useAuth } from "@/features/auth/AuthContext";
import { recordUserActivity } from "@/features/auth/activity";

type Activity = {
  id: string;
  action: string;
  summary: string;
  createdAt?: Timestamp;
};
const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  event_admin: "Admin Event",
  oversight: "Pengawas",
  kafilah_admin: "Admin Kafilah",
  branch_admin: "Admin Cabang",
  verifier: "Verifikator",
  editor: "Editor",
  contributor: "Kontributor",
};

export function AccountPage() {
  const auth = useAuth();
  const services = getFirebaseServices();
  const [displayName, setDisplayName] = useState(
    auth.profile?.displayName ?? auth.user?.displayName ?? "",
  );
  const [phone, setPhone] = useState(auth.profile?.phone ?? "");
  const [organization, setOrganization] = useState(
    auth.profile?.organization ?? "",
  );
  const [position, setPosition] = useState(auth.profile?.position ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!services || !auth.user) return;
    getDocs(
      query(
        collection(services.firestore, "users", auth.user.uid, "activity"),
        orderBy("createdAt", "desc"),
        limit(20),
      ),
    )
      .then((snapshot) =>
        setActivities(
          snapshot.docs.map(
            (item) => ({ id: item.id, ...item.data() }) as Activity,
          ),
        ),
      )
      .catch(() => setError("Riwayat aktivitas belum dapat dimuat."));
  }, [auth.user, services]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!services || !auth.user) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const cleanName = displayName.trim();
      if (cleanName.length < 3)
        throw new Error("Nama lengkap minimal 3 karakter.");
      await updateDoc(doc(services.firestore, "users", auth.user.uid), {
        displayName: cleanName,
        phone: phone.trim(),
        organization: organization.trim(),
        position: position.trim(),
        updatedAt: serverTimestamp(),
      });
      await updateProfile(auth.user, { displayName: cleanName });
      await recordUserActivity(
        services.firestore,
        auth.user.uid,
        "profile_updated",
        "Profil pribadi diperbarui",
      );
      await auth.refreshProfile();
      setMessage("Profil berhasil diperbarui.");
    } catch {
      setError("Profil belum berhasil diperbarui. Periksa isian dan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    if (!services || !auth.user || !auth.user.email) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      if (newPassword.length < 8)
        throw new Error("Kata sandi baru minimal 8 karakter.");
      if (newPassword === "123456")
        throw new Error(
          "Kata sandi baru harus berbeda dari kata sandi sementara.",
        );
      if (newPassword !== confirmPassword)
        throw new Error("Konfirmasi kata sandi tidak sama.");
      await reauthenticateWithCredential(
        auth.user,
        EmailAuthProvider.credential(auth.user.email, currentPassword),
      );
      await updatePassword(auth.user, newPassword);
      await updateDoc(doc(services.firestore, "users", auth.user.uid), {
        mustChangePassword: false,
        lastPasswordChangeAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await recordUserActivity(
        services.firestore,
        auth.user.uid,
        "password_changed",
        "Kata sandi akun diubah",
      );
      await auth.refreshProfile();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Kata sandi berhasil diubah.");
    } catch {
      setError(
        "Kata sandi tidak dapat diubah. Periksa kata sandi saat ini dan ketentuan kata sandi baru.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page account-page">
      <div className="admin-heading">
        <div>
          <span>AKUN & KEAMANAN</span>
          <h1>Profil pengguna</h1>
          <p>Lengkapi identitas kerja dan amankan akun pribadi Anda.</p>
        </div>
      </div>
      {auth.profile?.mustChangePassword && (
        <div className="security-notice">
          <ShieldCheck />
          <div>
            <strong>Ganti kata sandi sementara</strong>
            <span>
              Anda wajib membuat kata sandi pribadi sebelum menggunakan modul
              lain.
            </span>
          </div>
        </div>
      )}
      {error && (
        <div className="form-alert" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="success-box" role="status">
          <ShieldCheck />
          <div>
            <strong>Berhasil</strong>
            <p>{message}</p>
          </div>
        </div>
      )}
      <div className="account-grid">
        <form className="surface account-form" onSubmit={saveProfile} noValidate>
          <div className="form-section-title">
            <UserRound />
            <div>
              <strong>Informasi profil</strong>
              <span>Email dan hak akses tidak dapat diubah sendiri.</span>
            </div>
          </div>
          <label>
            Nama lengkap
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={80}
            />
          </label>
          <label>
            Email
            <input value={auth.user?.email ?? ""} disabled />
          </label>
          <label>
            Nomor telepon
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              maxLength={24}
              placeholder="Opsional"
            />
          </label>
          <label>
            Instansi / kafilah
            <input
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              maxLength={100}
              placeholder="Opsional"
            />
          </label>
          <label>
            Jabatan / fungsi
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              maxLength={80}
              placeholder="Opsional"
            />
          </label>
          <button className="button button-primary" disabled={saving}>
            <Save /> Simpan profil
          </button>
          <div className="role-summary">
            <strong>Penugasan aktif</strong>
            {auth.assignments.map((assignment, index) => (
              <span key={`${assignment.role}-${index}`}>
                {roleLabels[assignment.role] ?? assignment.role} ·{" "}
                {assignment.eventId}
              </span>
            ))}
          </div>
        </form>
        <form className="surface account-form" onSubmit={changePassword} noValidate>
          <div className="form-section-title">
            <KeyRound />
            <div>
              <strong>Ubah kata sandi</strong>
              <span>Gunakan minimal 8 karakter dan jangan dibagikan.</span>
            </div>
          </div>
          <label>
            Kata sandi saat ini
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <label>
            Kata sandi baru
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
          <label>
            Konfirmasi kata sandi baru
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
          <button className="button button-primary" disabled={saving}>
            <KeyRound /> Perbarui kata sandi
          </button>
          <div className="activity-list">
            <strong>Aktivitas akun terbaru</strong>
            {activities.length === 0 ? (
              <span>Belum ada aktivitas tercatat.</span>
            ) : (
              activities.map((item) => (
                <div key={item.id}>
                  <span>{item.summary}</span>
                  <small>
                    {item.createdAt
                      ?.toDate()
                      .toLocaleString("id-ID", {
                        timeZone: "Asia/Makassar",
                        hour12: false,
                      }) ?? "Baru saja"}{" "}
                    WITA
                  </small>
                </div>
              ))
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
