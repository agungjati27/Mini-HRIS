import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Camera,
  IdCard,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { registerUser } from "../services/authService";

const inputClass =
  "w-full bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-white";

const fieldShellClass =
  "mt-2 flex min-h-12 items-center gap-3 rounded-xl border border-white/80 bg-white/75 px-3 shadow-sm transition focus-within:border-sky-300 dark:border-white/10 dark:bg-slate-950/30";

function FormField({ icon: Icon, label, name, placeholder, type = "text", error, value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <span className={fieldShellClass}>
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          className={inputClass}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      </span>
      {error && <p className="mt-1 text-sm font-medium text-rose-600 dark:text-rose-300">{error}</p>}
    </label>
  );
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    nik: "",
    gender: "",
    phone: "",
    address: "",
    department: "",
    position: "",
    avatar: null,
  });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasFieldErrors = Object.keys(errors).length > 0;

    if (!errorMessage && !hasFieldErrors) return undefined;

    const timer = window.setTimeout(() => {
      setErrorMessage("");
      setErrors({});
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [errorMessage, errors]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    setErrors((current) => {
      if (!current[name]) return current;

      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
    setErrorMessage("");

    if (files) {
      const file = files[0];
      setForm((current) => ({
        ...current,
        avatar: file,
      }));

      if (file) {
        setPreview(URL.createObjectURL(file));
      }
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.full_name.trim()) newErrors.full_name = "Nama lengkap wajib diisi";
    if (!form.email.trim()) newErrors.email = "Email wajib diisi";
    if (!form.password) {
      newErrors.password = "Password wajib diisi";
    } else if (form.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }
    if (!form.nik.trim()) newErrors.nik = "NIK wajib diisi";
    if (!form.phone.trim()) newErrors.phone = "Nomor HP wajib diisi";
    if (!form.gender) newErrors.gender = "Gender wajib dipilih";
    if (!form.department.trim()) newErrors.department = "Departemen wajib diisi";
    if (!form.position.trim()) newErrors.position = "Jabatan wajib diisi";
    if (!form.address.trim()) newErrors.address = "Alamat wajib diisi";
    if (!form.avatar) newErrors.avatar = "Foto profil wajib dipilih";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!validate()) return;

    setLoading(true);

    try {
      const data = new FormData();

      Object.keys(form).forEach((key) => {
        data.append(key, form[key]);
      });

      await registerUser(data);
      navigate("/");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Gagal registrasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f7fb] text-slate-950 dark:bg-[#101218] dark:text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.10),rgba(16,185,129,0.08)_42%,rgba(245,158,11,0.07))] dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(16,185,129,0.10)_42%,rgba(245,158,11,0.10))]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,0.45fr)_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-white/70 bg-white/65 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Employee Access
            </div>

            <h1 className="mt-6 text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">
              Registrasi Pegawai
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Masukkan data diri Anda untuk membuat akun pegawai baru. Pastikan semua informasi yang dimasukkan sudah benar.
            </p>

            <div className="mt-8 text-center">
              <img
                alt="Preview avatar"
                className="mx-auto h-32 w-32 rounded-3xl border border-white/80 object-cover shadow-sm dark:border-white/10"
                src={preview || "/default-avatar.jpg"}
              />

              <label className="mt-4 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:text-white">
                <Camera className="h-4 w-4" />
                Upload Foto
                <input
                  accept="image/*"
                  className="hidden"
                  name="avatar"
                  onChange={handleChange}
                  type="file"
                />
              </label>
              {errors.avatar && (
                <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-300">
                  {errors.avatar}
                </p>
              )}
            </div>

            <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
              Sudah mempunyai akun?{" "}
              <Link className="font-semibold text-slate-950 dark:text-white" to="/">
                Login
              </Link>
            </p>
          </aside>

          <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-6">
            {errorMessage && (
              <div className="mb-4 rounded-2xl border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
                {errorMessage}
              </div>
            )}

            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submit}>
              <FormField
                error={errors.full_name}
                icon={UserRound}
                label="Nama Lengkap"
                name="full_name"
                onChange={handleChange}
                placeholder="Nama karyawan"
                value={form.full_name}
              />
              <FormField
                error={errors.nik}
                icon={IdCard}
                label="NIK"
                name="nik"
                onChange={handleChange}
                placeholder="Nomor induk karyawan"
                value={form.nik}
              />
              <FormField
                error={errors.email}
                icon={Mail}
                label="Email"
                name="email"
                onChange={handleChange}
                placeholder="nama@email.com"
                type="email"
                value={form.email}
              />
              <FormField
                error={errors.password}
                icon={LockKeyhole}
                label="Password"
                name="password"
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                type="password"
                value={form.password}
              />
              <FormField
                icon={Phone}
                error={errors.phone}
                label="Nomor HP"
                name="phone"
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                value={form.phone}
              />
              <label className="block">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Gender</span>
                <span className={fieldShellClass}>
                  <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                  <select
                    className={inputClass}
                    name="gender"
                    onChange={handleChange}
                    value={form.gender}
                  >
                    <option value="">Pilih gender</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </span>
                {errors.gender && (
                  <p className="mt-1 text-sm font-medium text-rose-600 dark:text-rose-300">
                    {errors.gender}
                  </p>
                )}
              </label>
              <FormField
                icon={Building2}
                error={errors.department}
                label="Departemen"
                name="department"
                onChange={handleChange}
                placeholder="People Operations"
                value={form.department}
              />
              <FormField
                icon={BriefcaseBusiness}
                error={errors.position}
                label="Jabatan"
                name="position"
                onChange={handleChange}
                placeholder="HR Administrator"
                value={form.position}
              />

              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Alamat</span>
                <span className="mt-2 flex min-h-28 items-start gap-3 rounded-xl border border-white/80 bg-white/75 px-3 py-3 shadow-sm transition focus-within:border-sky-300 dark:border-white/10 dark:bg-slate-950/30">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <textarea
                    className={`${inputClass} min-h-20 resize-none`}
                    name="address"
                    onChange={handleChange}
                    placeholder="Alamat lengkap"
                    value={form.address}
                  />
                </span>
                {errors.address && (
                  <p className="mt-1 text-sm font-medium text-rose-600 dark:text-rose-300">
                    {errors.address}
                  </p>
                )}
              </label>

              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 md:col-span-2"
                disabled={loading}
                type="submit"
              >
                {loading ? "Memproses..." : "Daftar"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;
