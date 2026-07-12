import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { loginUser } from "../services/authService";
import useAuth from "../hooks/useAuth";
import { supabase } from "../services/supabase";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!errorMessage) return undefined;

    const timer = window.setTimeout(() => {
      setErrorMessage("");
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [errorMessage]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = String(form.email || "").trim();
    const password = String(form.password || "").trim();

    if (!email || !password) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const result = await loginUser({ ...form, email, password });

      await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });

      login(result);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f7fb] text-slate-950 dark:bg-[#101218] dark:text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.10),rgba(16,185,129,0.08)_42%,rgba(245,158,11,0.07))] dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(16,185,129,0.10)_42%,rgba(245,158,11,0.10))]" />

      <section className="relative z-10 grid min-h-screen grid-cols-1 items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.55fr)] lg:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-1 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            Mini HRIS
          </div>

          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-5xl">
            Sistem Informasi Sumber Daya Manusia Mini
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Kelola data karyawan, absensi, dan laporan kehadiran dengan mudah menggunakan Mini HRIS. Sistem ini dirancang untuk membantu perusahaan dalam mengelola sumber daya manusia secara efisien dan efektif.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-6">
          <div className="mb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-950">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-white">
              Login
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Masukkan email dan password untuk masuk ke akun Anda.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-2xl border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Email</span>
              <span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-white/80 bg-white/75 px-3 shadow-sm dark:border-white/10 dark:bg-slate-950/30">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="nama@email.com"
                  type="email"
                  value={form.email}
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Password</span>
              <span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-white/80 bg-white/75 px-3 shadow-sm dark:border-white/10 dark:bg-slate-950/30">
                <LockKeyhole className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Password"
                  type="password"
                  value={form.password}
                />
              </span>
            </label>

            <button
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              disabled={loading}
              type="submit"
            >
              {loading ? "Memproses..." : "Masuk"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Belum mempunyai akun?{" "}
            <Link className="font-semibold text-slate-950 dark:text-white" to="/register">
              Daftar
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
