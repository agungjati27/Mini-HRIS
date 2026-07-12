import { useEffect, useState } from "react";
import {
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
  UserX,
} from "lucide-react";
import {
  adminCreateEmployee,
  adminDeleteEmployee,
  adminGetEmployees,
  adminUpdateEmployee,
  adminUpdateEmployeeStatus,
} from "../services/adminEmployeeService";

const initialForm = {
  id: null,
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

export default function Employees() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);

  const load = async () => {
    setLoading(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const res = await adminGetEmployees();
      setEmployees(res.data || []);
    } catch (e) {
      setErrorMessage(e?.response?.data?.message || "Gagal memuat karyawan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setIsEditing(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const buildPayload = () => ({
    full_name: form.full_name.trim(),
    nik: form.nik.trim(),
    gender: form.gender || null,
    birth_date: form.birth_date || null,
    phone: form.phone || null,
    address: form.address || null,
    department: form.department || null,
    position: form.position || null,
    join_date: form.join_date || null,
    status: form.status || "active",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (!form.full_name.trim() || !form.nik.trim()) {
      setErrorMessage("Nama lengkap dan NIK wajib diisi");
      return;
    }

    setSaving(true);

    try {
      const payload = buildPayload();

      if (isEditing && form.id) {
        const response = await adminUpdateEmployee(form.id, payload);
        setEmployees((current) =>
          current.map((employee) =>
            String(employee.id) === String(form.id) ? { ...employee, ...response.data } : employee
          )
        );
        setStatusMessage("Data employee berhasil diperbarui");
      } else {
        const response = await adminCreateEmployee(payload);
        setEmployees((current) => [response.data, ...current]);
        setStatusMessage("Employee berhasil ditambahkan");
      }

      resetForm();
    } catch (e) {
      setErrorMessage(e?.response?.data?.message || "Gagal menyimpan data employee");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employee) => {
    setForm({
      id: employee.id,
      full_name: employee.full_name || "",
      nik: employee.nik || "",
      gender: employee.gender || "",
      birth_date: employee.birth_date || "",
      phone: employee.phone || "",
      address: employee.address || "",
      department: employee.department || "",
      position: employee.position || "",
      join_date: employee.join_date || "",
      status: String(employee.status || "active").toLowerCase(),
    });
    setIsEditing(true);
    setErrorMessage("");
    setStatusMessage("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Hapus employee ini?");
    if (!confirmed) return;

    setErrorMessage("");
    setStatusMessage("");

    try {
      await adminDeleteEmployee(id);
      setEmployees((current) => current.filter((employee) => String(employee.id) !== String(id)));
      setStatusMessage("Employee berhasil dihapus");
    } catch (e) {
      setErrorMessage(e?.response?.data?.message || "Gagal menghapus employee");
    }
  };

  const updateStatus = async (id, nextStatus) => {
    setUpdatingId(id);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await adminUpdateEmployeeStatus(id, nextStatus);
      setStatusMessage("Status employee berhasil diperbarui");

      setEmployees((current) =>
        current.map((emp) =>
          String(emp.id) === String(id) ? { ...emp, status: nextStatus } : emp
        )
      );
    } catch (e) {
      setErrorMessage(e?.response?.data?.message || "Gagal memperbarui status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50/80 px-3 py-1 text-sm font-medium text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
            <ShieldCheck className="h-4 w-4" />
            Admin Panel
          </div>
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">
            Manajemen Karyawan
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            Tambah, edit, hapus, dan ubah status karyawan untuk akses sistem.
          </p>
        </div>

        <button
          onClick={load}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          disabled={loading}
          type="button"
        >
          <RefreshCw className="h-4 w-4" />
          {loading ? "Memuat..." : "Refresh"}
        </button>
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

      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {isEditing ? "Edit employee" : "Tambah employee baru"}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Isi data dasar karyawan lalu simpan.
            </p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            {isEditing ? "Batal edit" : "Reset form"}
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="mb-1 block">Nama lengkap</span>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              placeholder="Nama lengkap"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="mb-1 block">NIK</span>
            <input
              name="nik"
              value={form.nik}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              placeholder="NIK"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="mb-1 block">Jenis kelamin</span>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            >
              <option value="">Pilih</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="mb-1 block">Tanggal lahir</span>
            <input
              type="date"
              name="birth_date"
              value={form.birth_date}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="mb-1 block">Nomor telepon</span>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              placeholder="08xxxxxxxxxx"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="mb-1 block">Alamat</span>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              placeholder="Alamat lengkap"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="mb-1 block">Departemen</span>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              placeholder="Departemen"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="mb-1 block">Jabatan</span>
            <input
              name="position"
              value={form.position}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              placeholder="Jabatan"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="mb-1 block">Tanggal bergabung</span>
            <input
              type="date"
              name="join_date"
              value={form.join_date}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="mb-1 block">Status</span>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {saving ? "Menyimpan..." : isEditing ? "Simpan perubahan" : <><Plus className="h-4 w-4" /> Tambah employee</>}
          </button>
        </div>
      </form>

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-220 rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
          <div className="flex items-center gap-3">
            <UserRound className="h-5 w-5 text-slate-500" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Data Karyawan
            </p>
          </div>

          <div className="mt-4">
            {loading ? (
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Memuat data...
              </p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Nama</th>
                    <th className="py-2 pr-4">NIK</th>
                    <th className="py-2 pr-4">Departemen</th>
                    <th className="py-2 pr-4">Jabatan</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-sm text-slate-600 dark:text-slate-300">
                        Tidak ada data karyawan
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => {
                      const empStatus = String(emp.status || "active").toLowerCase();
                      const isActive = empStatus === "active";
                      return (
                        <tr key={emp.id} className="border-t border-slate-200/60 dark:border-white/10">
                          <td className="py-3 pr-4 text-sm font-medium text-slate-900 dark:text-white">
                            {emp.full_name}
                          </td>
                          <td className="py-3 pr-4 text-sm text-slate-700 dark:text-slate-200">
                            {emp.nik || "-"}
                          </td>
                          <td className="py-3 pr-4 text-sm text-slate-700 dark:text-slate-200">
                            {emp.department || "-"}
                          </td>
                          <td className="py-3 pr-4 text-sm text-slate-700 dark:text-slate-200">
                            {emp.position || "-"}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                isActive
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-400/10 dark:text-emerald-200 dark:border-emerald-400/20"
                                  : "bg-rose-50 text-rose-700 border border-rose-200/70 dark:bg-rose-400/10 dark:text-rose-200 dark:border-rose-400/20"
                              }`}
                            >
                              {isActive ? "active" : "inactive"}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                onClick={() => handleEdit(emp)}
                              >
                                <Pencil className="mr-1 h-3.5 w-3.5" />
                                Edit
                              </button>

                              <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                disabled={updatingId === emp.id || isActive}
                                onClick={() => updateStatus(emp.id, "active")}
                              >
                                Active
                              </button>

                              <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200"
                                disabled={updatingId === emp.id || !isActive}
                                onClick={() => updateStatus(emp.id, "inactive")}
                              >
                                <UserX className="mr-1 h-3.5 w-3.5" />
                                Inactive
                              </button>

                              <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200"
                                onClick={() => handleDelete(emp.id)}
                              >
                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
