import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Camera,
  IdCard,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { getUserProfile, updateUserProfile } from "../services/profileService";

const inputClass =
  "w-full bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-white";

const fieldShellClass =
  "mt-2 flex min-h-12 items-center gap-3 rounded-xl border border-white/80 bg-white/75 px-3 shadow-sm transition focus-within:border-sky-300 dark:border-white/10 dark:bg-slate-950/30";

function Field({ icon: Icon, label, name, value, onChange, placeholder, type = "text", error }) {
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

const initialForm = {
  email: "",
  password: "",
  full_name: "",
  nik: "",
  gender: "",
  birth_date: "",
  phone: "",
  address: "",
  department: "",
  position: "",
  join_date: "",
  status: "active",
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const completion = useMemo(() => {
    const requiredFields = [
      "email",
      "full_name",
      "nik",
      "gender",
      "phone",
      "address",
      "department",
      "position",
    ];
    const filled = requiredFields.filter((field) => String(form[field] || "").trim()).length;
    return Math.round((filled / requiredFields.length) * 100);
  }, [form]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await getUserProfile();
        const profile = result.data?.profile || {};
        const employee = result.data?.employee || {};

        setForm({
          email: profile.email || user?.email || "",
          password: "",
          full_name: employee.full_name || user?.name || "",
          nik: employee.nik || "",
          gender: employee.gender || "",
          birth_date: employee.birth_date || "",
          phone: employee.phone || "",
          address: employee.address || "",
          department: employee.department || "",
          position: employee.position || "",
          join_date: employee.join_date || "",
          status: employee.status || "active",
        });
        setAvatarPreview(profile.avatar_url || user?.avatar || "");
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Gagal memuat profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.avatar, user?.email, user?.name]);

  useEffect(() => {
    if (!statusMessage && !errorMessage && Object.keys(errors).length === 0) return undefined;

    const timer = window.setTimeout(() => {
      setStatusMessage("");
      setErrorMessage("");
      setErrors({});
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [statusMessage, errorMessage, errors]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name]) return current;

      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrorMessage("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) nextErrors.email = "Email wajib diisi";
    if (!form.full_name.trim()) nextErrors.full_name = "Nama lengkap wajib diisi";
    if (!form.nik.trim()) nextErrors.nik = "NIK wajib diisi";
    if (form.password && form.password.length < 6) {
      nextErrors.password = "Password minimal 6 karakter";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (!validate()) return;

    setSaving(true);

    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "password" && !value) return;
        data.append(key, value);
      });

      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const result = await updateUserProfile(data);
      const profile = result.data?.profile || {};
      const employee = result.data?.employee || {};

      updateUser?.({
        email: profile.email || form.email,
        name: employee.full_name || form.full_name,
        avatar: profile.avatar_url || avatarPreview,
      });

      setForm((current) => ({
        ...current,
        password: "",
      }));
      setStatusMessage("Profile berhasil diperbarui");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Gagal menyimpan profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-[28px] border border-white/70 bg-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Memuat profile...</p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50/80 px-3 py-1 text-sm font-medium text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
            <ShieldCheck className="h-4 w-4" />
            Account Settings
          </div>
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">
            Profile
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            Perbarui foto, data diri, informasi kerja, email akun, dan password.
          </p>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Kelengkapan Profile</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">{completion}%</p>
          <div className="mt-3 h-2 w-48 rounded-full bg-slate-200/80 dark:bg-white/10">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      {(statusMessage || errorMessage) && (
        <div
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
            statusMessage
              ? "border-emerald-200/80 bg-emerald-50/80 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200"
              : "border-rose-200/80 bg-rose-50/80 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200"
          }`}
        >
          {statusMessage || errorMessage}
        </div>
      )}

      <form className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]" onSubmit={submit}>
        <aside className="rounded-2xl border border-white/70 bg-white/60 p-5 text-center shadow-sm dark:border-white/10 dark:bg-white/10">
          <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-3xl border border-white/80 bg-slate-950 text-4xl font-semibold text-white shadow-sm dark:border-white/10 dark:bg-white dark:text-slate-950">
            {avatarPreview ? (
              <img alt="Foto profile" className="h-full w-full object-cover" src={avatarPreview} />
            ) : (
              form.full_name.slice(0, 2).toUpperCase() || "HR"
            )}
          </div>

          <label className="mt-4 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:text-white">
            <Camera className="h-4 w-4" />
            Update Foto
            <input
              accept="image/*"
              className="hidden"
              name="avatar"
              onChange={handleAvatarChange}
              type="file"
            />
          </label>

          <div className="mt-5 rounded-2xl bg-slate-950/5 px-4 py-3 text-left dark:bg-white/10">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {form.full_name || "Nama belum diisi"}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {form.position || "Jabatan belum diisi"}
            </p>
          </div>
        </aside>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            error={errors.full_name}
            icon={UserRound}
            label="Nama Lengkap"
            name="full_name"
            onChange={handleChange}
            placeholder="Nama karyawan"
            value={form.full_name}
          />
          <Field
            error={errors.nik}
            icon={IdCard}
            label="NIK"
            name="nik"
            onChange={handleChange}
            placeholder="Nomor induk"
            value={form.nik}
          />
          <Field
            error={errors.email}
            icon={Mail}
            label="Email Akun"
            name="email"
            onChange={handleChange}
            placeholder="nama@email.com"
            type="email"
            value={form.email}
          />
          <Field
            error={errors.password}
            icon={LockKeyhole}
            label="Password Baru"
            name="password"
            onChange={handleChange}
            placeholder="Kosongkan jika tidak diganti"
            type="password"
            value={form.password}
          />

          <label className="block">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Gender</span>
            <span className={fieldShellClass}>
              <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
              <select className={inputClass} name="gender" onChange={handleChange} value={form.gender}>
                <option value="">Pilih gender</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </span>
          </label>

          <Field
            icon={Phone}
            label="Nomor HP"
            name="phone"
            onChange={handleChange}
            placeholder="08xxxxxxxxxx"
            value={form.phone}
          />
          <Field
            icon={Building2}
            label="Departemen"
            name="department"
            onChange={handleChange}
            placeholder="People Operations"
            value={form.department}
          />
          <Field
            icon={BriefcaseBusiness}
            label="Jabatan"
            name="position"
            onChange={handleChange}
            placeholder="HR Administrator"
            value={form.position}
          />
          <Field
            icon={IdCard}
            label="Tanggal Lahir"
            name="birth_date"
            onChange={handleChange}
            type="date"
            value={form.birth_date}
          />
          <Field
            icon={BriefcaseBusiness}
            label="Tanggal Bergabung"
            name="join_date"
            onChange={handleChange}
            type="date"
            value={form.join_date}
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
          </label>

          <button
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 md:col-span-2"
            disabled={saving}
            type="submit"
          >
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan Profile"}
          </button>
        </div>
      </form>
    </section>
  );
}
