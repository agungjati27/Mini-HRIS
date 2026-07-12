import { useEffect, useState } from "react";
import { Crosshair, MapPin, Save, Settings2 } from "lucide-react";
import {
  DEFAULT_ATTENDANCE_SETTINGS,
  type AttendanceSettings,
  formatTimeLabel,
  loadAttendanceSettings,
  saveAttendanceSettings,
} from "../services/attendanceSettings";

export default function AttendanceSettingsPage() {
  const [settings, setSettings] = useState<AttendanceSettings>(DEFAULT_ATTENDANCE_SETTINGS);
  const [status, setStatus] = useState("Pengaturan attendance siap diperbarui");

  useEffect(() => {
    setSettings(loadAttendanceSettings());
  }, []);

  const updateField = (field: keyof AttendanceSettings, value: string) => {
    setSettings((current) => ({
      ...current,
      [field]: field === "radiusMeters" ? Number(value) : value,
    }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation tidak tersedia di browser ini");
      return;
    }

    setStatus("Mengambil titik lokasi kantor");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSettings((current) => ({
          ...current,
          officeLatitude: String(position.coords.latitude),
          officeLongitude: String(position.coords.longitude),
        }));
        setStatus("Titik lokasi kantor berhasil diisi");
      },
      () => setStatus("Gagal mengambil lokasi. Pastikan izin lokasi aktif."),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  };

  const saveSettings = () => {
    saveAttendanceSettings(settings);
    setStatus("Pengaturan attendance berhasil disimpan");
  };

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50/80 px-3 py-1 text-sm font-medium text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
            <Settings2 className="h-4 w-4" />
            Attendance Settings
          </div>
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">
            Settings
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            Atur batas waktu attendance dan radius lokasi check in/check out.
          </p>
        </div>

        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          onClick={saveSettings}
          type="button"
        >
          <Save className="h-4 w-4" />
          Simpan
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block rounded-2xl border border-white/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/10">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Batas Check In
            </span>
            <input
              className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
              onChange={(event) => updateField("checkInLimit", event.target.value)}
              type="time"
              value={settings.checkInLimit}
            />
          </label>

          <label className="block rounded-2xl border border-white/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/10">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Minimal Check Out
            </span>
            <input
              className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
              onChange={(event) => updateField("checkOutStart", event.target.value)}
              type="time"
              value={settings.checkOutStart}
            />
          </label>

          <label className="block rounded-2xl border border-white/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/10">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Latitude Kantor
            </span>
            <input
              className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
              onChange={(event) => updateField("officeLatitude", event.target.value)}
              placeholder="-6.200000"
              type="number"
              value={settings.officeLatitude}
            />
          </label>

          <label className="block rounded-2xl border border-white/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/10">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Longitude Kantor
            </span>
            <input
              className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
              onChange={(event) => updateField("officeLongitude", event.target.value)}
              placeholder="106.816666"
              type="number"
              value={settings.officeLongitude}
            />
          </label>

          <label className="block rounded-2xl border border-white/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/10 md:col-span-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Radius Attendance
            </span>
            <input
              className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
              min={10}
              onChange={(event) => updateField("radiusMeters", event.target.value)}
              step={10}
              type="number"
              value={settings.radiusMeters}
            />
          </label>
        </div>

        <aside className="space-y-4 rounded-2xl border border-white/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/10">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-200">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Ringkasan
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                {formatTimeLabel(settings.checkInLimit)} / {formatTimeLabel(settings.checkOutStart)}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Radius aktif {settings.radiusMeters} meter dari titik kantor yang tersimpan.
              </p>
            </div>
          </div>

          <button
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:text-white"
            onClick={useCurrentLocation}
            type="button"
          >
            <Crosshair className="h-4 w-4" />
            Pakai Lokasi Saat Ini
          </button>

          <p className="rounded-xl bg-slate-950/5 px-3 py-2 text-sm font-medium text-slate-600 dark:bg-white/10 dark:text-slate-200">
            {status}
          </p>
        </aside>
      </div>
    </section>
  );
}
