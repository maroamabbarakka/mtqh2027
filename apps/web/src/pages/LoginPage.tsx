import { zodResolver } from "@hookform/resolvers/zod";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui";
import { getFirebaseServices } from "@/config/firebase-services";
import { useAuth } from "@/features/auth/AuthContext";
import { recordUserActivity } from "@/features/auth/activity";

const schema = z.object({
  email: z.email("Masukkan alamat email yang valid."),
  password: z
    .string()
    .refine(
      (value) => value === "123456" || value.length >= 8,
      "Kata sandi minimal 8 karakter.",
    ),
});
type LoginValues = z.infer<typeof schema>;
const rememberedEmailKey = "mtqh-remembered-email";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(() => Boolean(localStorage.getItem(rememberedEmailKey)));
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: localStorage.getItem(rememberedEmailKey) ?? "", password: "" },
  });
  if (!auth.loading && auth.user && auth.assignments.length > 0)
    return <Navigate to="/app/dashboard" replace />;
  const submit = handleSubmit(async (values) => {
    const services = getFirebaseServices();
    if (!services) {
      setServerError("Layanan masuk belum tersedia. Silakan coba beberapa saat lagi.");
      return;
    }
    try {
      setServerError(null);
      const credential = await signInWithEmailAndPassword(
        services.auth,
        values.email,
        values.password,
      );
      await recordUserActivity(
        services.firestore,
        credential.user.uid,
        "login",
        "Berhasil masuk ke portal",
      );
      if (rememberEmail) localStorage.setItem(rememberedEmailKey, values.email);
      else localStorage.removeItem(rememberedEmailKey);
      const destination =
        (location.state as { from?: string } | null)?.from ?? "/app/dashboard";
      navigate(destination, { replace: true });
    } catch {
      setServerError(
        "Email atau kata sandi tidak cocok. Periksa kembali akun Anda.",
      );
    }
  });
  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand-inner">
          <Brand inverse />
          <div>
            <span>PORTAL PANITIA</span>
            <h1>Kelola kegiatan dengan akses yang tepat.</h1>
            <p>
              Setiap akun bekerja sesuai peran, wilayah, dan cabang yang
              diberikan administrator.
            </p>
          </div>
          <ul>
            <li>
              <ShieldCheck /> Data privat terlindungi
            </li>
            <li>
              <ShieldCheck /> Aktivitas sensitif diaudit
            </li>
            <li>
              <ShieldCheck /> Pengesahan membutuhkan otorisasi
            </li>
          </ul>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <Link to="/" className="back-public">
            <ArrowLeft size={15} /> Kembali ke portal publik
          </Link>
          <div className="auth-heading">
            <span className="auth-icon">
              <LockKeyhole />
            </span>
            <h2>Masuk ke Portal Panitia</h2>
            <p>Gunakan akun yang telah didaftarkan oleh administrator.</p>
          </div>
          {serverError && (
            <div className="form-alert" role="alert">
              {serverError}
            </div>
          )}
          <form onSubmit={submit} noValidate>
            <label>
              Email
              <div className="input-wrap">
                <Mail />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="nama@contoh.id"
                  {...register("email")}
                />
              </div>
              {errors.email && <small>{errors.email.message}</small>}
            </label>
            <label>
              Kata sandi
              <div className="input-wrap">
                <LockKeyhole />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && <small>{errors.password.message}</small>}
            </label>
            <div className="form-meta">
              <label className="check">
                <input type="checkbox" checked={rememberEmail} onChange={(event) => { setRememberEmail(event.target.checked); if (event.target.checked) localStorage.setItem(rememberedEmailKey, getValues("email")); else localStorage.removeItem(rememberedEmailKey); }} /> Ingat email di perangkat ini
              </label>
              <Link to="/lupa-password">Lupa kata sandi?</Link>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Memverifikasi…" : "Masuk dengan aman"}
            </Button>
          </form>
          <p className="auth-help">
            Belum memiliki akses? Hubungi administrator acara. Akun baru tidak
            memperoleh peran secara otomatis.
          </p>
        </div>
      </section>
    </main>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const services = getFirebaseServices();
    if (!services) {
      setError("Layanan pemulihan belum tersedia. Silakan coba beberapa saat lagi.");
      return;
    }
    try {
      await sendPasswordResetEmail(services.auth, email);
      setSent(true);
      setError(null);
    } catch {
      setError("Permintaan belum dapat diproses. Periksa email dan coba lagi.");
    }
  }
  return (
    <main className="simple-auth">
      <div className="auth-form-wrap">
        <Brand />
        <span className="auth-icon">
          <Mail />
        </span>
        <h1>Atur ulang kata sandi</h1>
        {sent ? (
          <div className="success-box">
            <ShieldCheck />
            <div>
              <strong>Periksa email Anda</strong>
              <p>Jika akun terdaftar, tautan pemulihan telah dikirim.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <label>
              Email akun
              <div className="input-wrap">
                <Mail />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </label>
            {error && <div className="form-alert">{error}</div>}
            <Button type="submit">Kirim tautan pemulihan</Button>
          </form>
        )}
        <Link to="/login"><ArrowLeft size={15} /> Kembali ke halaman masuk</Link>
      </div>
    </main>
  );
}
