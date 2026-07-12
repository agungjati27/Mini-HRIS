import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Coffee,
  Download,
  MapPin,
  TimerReset,
  UserRound,
  UsersRound,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useEmployee from "../../hooks/useEmployee";
import { supabase } from "../../services/supabase";

type AttendanceRecord = {
  id?: string | number;
  employee_name?: string;
  full_name?: string;
  email?: string;
  date?: string;
  check_in?: string | null;
  check_out?: string | null;
  status?: string;
  work_mode?: string;
  location?: string;
  created_at?: string;
};

type MetricCard = {
  title: string;
  value: string;
  change: string;
  tone: "sky" | "emerald" | "amber" | "rose";
  icon: typeof UsersRound;
};

const fallbackAttendance: AttendanceRecord[] = [
  {
    id: "demo-1",
    employee_name: "Nadia Putri",
    date: "2026-07-02",
    check_in: "2026-07-02T08:03:00+07:00",
    check_out: null,
    status: "Present",
    work_mode: "Office",
    location: "Jakarta HQ",
  },
  {
    id: "demo-2",
    employee_name: "Raka Pratama",
    date: "2026-07-02",
    check_in: "2026-07-02T08:26:00+07:00",
    check_out: null,
    status: "Late",
    work_mode: "Hybrid",
    location: "Bandung",
  },
  {
    id: "demo-3",
    employee_name: "Dewi Anggraini",
    date: "2026-07-02",
    check_in: "2026-07-02T07:54:00+07:00",
    check_out: "2026-07-02T16:48:00+07:00",
    status: "Present",
    work_mode: "Remote",
    location: "Yogyakarta",
  },
];

const teamMembers = [
  { name: "People Ops", count: 8, fill: "w-[72%]", tone: "bg-sky-500" },
  { name: "Engineering", count: 14, fill: "w-[88%]", tone: "bg-emerald-500" },
  { name: "Finance", count: 5, fill: "w-[46%]", tone: "bg-amber-500" },
];

const formatTime = (value?: string | null) => {
  if (!value) return "--:--";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
};

const getToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const getStatusStyle = (status?: string) => {
  const normalized = status?.toLowerCase();

  if (normalized === "late" || normalized === "telat") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200";
  }

  if (normalized === "leave" || normalized === "izin") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-200";
  }

  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200";
};

const Dashboard = () => {
  const { user } = useAuth();
  const { employee, loading: employeeLoading } = useEmployee();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(fallbackAttendance);
  const [syncState, setSyncState] = useState("Loading attendance data");
  const today = getToday();

  const displayName =
    employee?.full_name ||
    user?.user_metadata?.full_name ||
    user?.name ||
    user?.email ||
    "Admin User";

  const currentUserAttendance = useMemo(() => {
    return attendance.find((item) => {
      const sameDate = (item.date || item.created_at || "").startsWith(today);
      const sameUser =
        item.email === user?.email ||
        item.employee_name === employee?.full_name ||
        item.full_name === employee?.full_name;

      return sameDate && (sameUser || item.id === "local-user");
    });
  }, [attendance, employee?.full_name, today, user?.email]);

  const employeeCount = useMemo(() => {
    const uniqueEmployees = attendance
      .map((item) => item.employee_name || item.full_name || item.email || item.id)
      .filter(Boolean);

    return new Set(uniqueEmployees).size;
  }, [attendance]);

  const presentCount = attendance.filter((item) => {
    const sameDate = (item.date || item.created_at || "").startsWith(today);
    return sameDate && !["Leave", "Izin"].includes(item.status || "");
  }).length;

  const lateCount = attendance.filter((item) => {
    const sameDate = (item.date || item.created_at || "").startsWith(today);
    return sameDate && ["Late", "Telat"].includes(item.status || "");
  }).length;

  const checkedOutCount = attendance.filter((item) => {
    const sameDate = (item.date || item.created_at || "").startsWith(today);
    return sameDate && item.check_out;
  }).length;

  const metrics: MetricCard[] = [
    {
      title: "Total Employees",
      value: String(employeeCount),
      change: "Based on current records",
      tone: "sky",
      icon: UsersRound,
    },
    {
      title: "Present Today",
      value: String(presentCount),
      change: "Live attendance",
      tone: "emerald",
      icon: CalendarCheck2,
    },
    {
      title: "Late Arrival",
      value: String(lateCount),
      change: "Needs review",
      tone: "amber",
      icon: Clock3,
    },
    {
      title: "Checked Out",
      value: String(checkedOutCount),
      change: "Completed shift",
      tone: "rose",
      icon: CheckCircle2,
    },
  ];

  useEffect(() => {
    let ignore = false;

    async function loadAttendance() {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);

      if (ignore) return;

      if (error) {
        setSyncState("Using demo data until Supabase attendance is ready");
        return;
      }

      setAttendance(data?.length ? data : fallbackAttendance);
      setSyncState("Synced with Supabase attendance");
    }

    loadAttendance();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">
              Selamat Datang, {displayName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
              Sistem Informasi Sumber Daya Manusia (HRIS) ini membantu dalam mengelola kehadiran, kinerja, dan data karyawan secara efisien.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const toneMap = {
            sky: "bg-sky-500/15 text-sky-700 dark:text-sky-200",
            emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
            amber: "bg-amber-500/15 text-amber-700 dark:text-amber-200",
            rose: "bg-rose-500/15 text-rose-700 dark:text-rose-200",
          };

          return (
            <div
              className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10"
              key={metric.title}
            >
              <div className="flex items-start justify-between gap-4">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneMap[metric.tone]}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {metric.change}
                </span>
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                {metric.title}
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
                {metric.value}
              </p>
            </div>
          );
        })}
      </section>

      <section
        id="reports"
        className="grid grid-cols-1 gap-6 rounded-3xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10 lg:grid-cols-[1fr_auto] lg:items-center sm:p-6"
      >
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Laporan</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            Absensi & Kehadiran Karyawan
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Laporan ini memberikan ringkasan kehadiran karyawan, termasuk jumlah hadir, terlambat, dan cuti, membantu manajemen dalam pengambilan keputusan terkait sumber daya manusia.
          </p>
        </div>
        <a
          href="/reports"
          className="inline-flex h-11 w-fit items-center gap-2 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:text-white"
        >
          <Download className="h-4 w-4" />
          Open Reports
        </a>
      </section>
    </div>
  );
};

export default Dashboard;
