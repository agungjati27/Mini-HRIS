import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Clock3,
  Download,
  FileText,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import * as XLSX from "xlsx";
import axiosClient from "../api/axiosClient";
import useAuth from "../hooks/useAuth";
import { normalizeRole } from "../utils/auth";

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

const formatTime = (value) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

const getStatusColor = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized.includes("telat") || normalized.includes("late")) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  }

  if (normalized.includes("hadir") || normalized.includes("present")) {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  }

  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
};

const exportToXlsx = (records) => {
  const rows = records.map((item) => ({
    Nama: item.employees?.full_name || "-",
    NIK: item.employees?.nik || "-",
    Departemen: item.employees?.department || "-",
    Tanggal: item.date || "-",
    CheckIn: item.check_in || "-",
    Status: item.status || "-",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Absensi");
  XLSX.writeFile(workbook, "laporan-absensi.xlsx");
};

const exportToCsv = (records) => {
  const rows = records.map((item) => ({
    Nama: item.employees?.full_name || "-",
    NIK: item.employees?.nik || "-",
    Departemen: item.employees?.department || "-",
    Tanggal: item.date || "-",
    CheckIn: item.check_in || "-",
    Status: item.status || "-",
  }));

  const headers = ["Nama", "NIK", "Departemen", "Tanggal", "CheckIn", "Status"];
  const csvRows = [headers.join(",")];

  rows.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header] ?? "";
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  });

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = "laporan-absensi.csv";
  link.click();
  URL.revokeObjectURL(url);
};

const exportToPdf = (records) => {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;

  const rows = records
    .map(
      (item) => `
        <tr>
          <td>${item.employees?.full_name || "-"}</td>
          <td>${item.employees?.nik || "-"}</td>
          <td>${item.employees?.department || "-"}</td>
          <td>${item.date || "-"}</td>
          <td>${item.check_in || "-"}</td>
          <td>${item.status || "-"}</td>
        </tr>
      `,
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Laporan Absensi</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>Laporan Absensi</h1>
        <p>Diunduh dari halaman admin reports.</p>
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>NIK</th>
              <th>Departemen</th>
              <th>Tanggal</th>
              <th>Check In</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 300);
};

const Reports = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const role = normalizeRole(user?.role ?? user?.user?.role ?? "");

  useEffect(() => {
    const fetchReports = async () => {
      if (role !== "admin") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosClient.get("/admin/attendance");
        setRecords(response?.data?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Gagal memuat laporan absensi.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [role]);

  const filteredRecords = useMemo(() => {
    if (!startDate && !endDate) {
      return records;
    }

    return records.filter((item) => {
      const itemDate = String(item.date || "").trim();
      if (!itemDate) {
        return true;
      }

      if (startDate && itemDate < startDate) {
        return false;
      }

      if (endDate && itemDate > endDate) {
        return false;
      }

      return true;
    });
  }, [records, startDate, endDate]);

  const summary = useMemo(() => {
    const total = filteredRecords.length;
    const hadir = filteredRecords.filter((item) => String(item.status || "").toLowerCase().includes("hadir") || String(item.status || "").toLowerCase().includes("present")).length;
    const telat = filteredRecords.filter((item) => String(item.status || "").toLowerCase().includes("telat") || String(item.status || "").toLowerCase().includes("late")).length;
    const departments = new Map();

    filteredRecords.forEach((item) => {
      const department = item.employees?.department || "-";
      departments.set(department, (departments.get(department) || 0) + 1);
    });

    return {
      total,
      hadir,
      telat,
      departments,
    };
  }, [filteredRecords]);

  if (role !== "admin") {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-700 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
        <p className="font-semibold">Akses dibatasi</p>
        <p className="mt-2 text-sm">Halaman laporan hanya tersedia untuk akun admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-400">
              <BarChart3 className="h-4 w-4" />
              Reports
            </div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
              Laporan absensi admin
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Ringkasan absensi karyawan, status kehadiran, dan daftar rekaman terbaru yang bisa dipakai untuk evaluasi harian atau mingguan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">Total data</p>
              <p className="text-2xl font-semibold text-slate-950 dark:text-white">{summary.total}</p>
            </div>
            <button
              type="button"
              onClick={() => exportToXlsx(filteredRecords)}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              <Download className="h-4 w-4" />
              Export XLSX
            </button>
            <button
              type="button"
              onClick={() => exportToCsv(filteredRecords)}
              className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => exportToPdf(filteredRecords)}
              className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Filter data</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Menampilkan {filteredRecords.length} dari {records.length} rekaman.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-col text-sm text-slate-600 dark:text-slate-400">
              <span className="mb-1 font-medium">Dari</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-0 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-600 dark:text-slate-400">
              <span className="mb-1 font-medium">Sampai</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-0 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Rekaman</p>
            <CalendarDays className="h-5 w-5 text-sky-500" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{summary.total}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Hadir</p>
            <UserRoundCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{summary.hadir}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Telat</p>
            <Clock3 className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{summary.telat}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Departemen</p>
            <UsersRound className="h-5 w-5 text-violet-500" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{summary.departments.size}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Rekap absensi terbaru</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Data dari tabel attendance yang sudah tersedia di backend.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center px-6 py-10 text-sm text-slate-500 dark:text-slate-400">
            Memuat data laporan...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex items-center gap-3 px-6 py-10 text-sm text-slate-500 dark:text-slate-400">
            <AlertTriangle className="h-5 w-5" />
            Belum ada data absensi yang tersedia.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
              <thead className="bg-slate-50/80 dark:bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Karyawan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Departemen</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {filteredRecords.map((item) => (
                  <tr key={item.id} className="bg-white/70 hover:bg-slate-50 dark:bg-transparent dark:hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.employees?.full_name || "-"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {item.employees?.nik || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {item.employees?.department || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {formatTime(item.check_in)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(item.status)}`}>
                        {item.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
