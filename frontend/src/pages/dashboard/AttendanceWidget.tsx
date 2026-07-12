import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Clock3,
  Crosshair,
  Loader2,
  MapPin,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useEmployee from "../../hooks/useEmployee";
import { getEmployeeProfile } from "../../services/employeeService";
import { supabase } from "../../services/supabase";
import { uploadAttendancePhoto } from "../../services/storageService";
import {
  formatTimeLabel,
  getDistanceMeters,
  getJakartaMinutes,
  getTodayJakarta,
  loadAttendanceSettings,
  timeToMinutes,
  type AttendanceSettings,
} from "../../services/attendanceSettings";

type AttendanceMode = "check_in" | "check_out";

type LocationState = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type AttendanceUpload = {
  path: string;
  publicUrl: string;
};

const dataUrlToBlob = async (dataUrl: string) => {
  const response = await fetch(dataUrl);
  return response.blob();
};

const getAttendanceStatus = (
  mode: AttendanceMode,
  settings: AttendanceSettings,
  date = new Date(),
) => {
  if (mode !== "check_in") return "Hadir";

  return getJakartaMinutes(date) > timeToMinutes(settings.checkInLimit) ? "Telat" : "Hadir";
};

const hasOfficeCoordinate = (settings: AttendanceSettings) =>
  settings.officeLatitude !== "" &&
  settings.officeLongitude !== "" &&
  Number.isFinite(Number(settings.officeLatitude)) &&
  Number.isFinite(Number(settings.officeLongitude));

export default function AttendanceWidget() {
  const { user } = useAuth();
  const { employee } = useEmployee();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [settings, setSettings] = useState<AttendanceSettings>(() => loadAttendanceSettings());
  const [mode, setMode] = useState<AttendanceMode>("check_in");
  const [cameraReady, setCameraReady] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [location, setLocation] = useState<LocationState | null>(null);
  const [status, setStatus] = useState("Siapkan foto dan lokasi untuk absensi");
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);

  const displayName =
    employee?.full_name ||
    user?.user_metadata?.full_name ||
    user?.name ||
    user?.email ||
    "Admin User";

  const predictedStatus = getAttendanceStatus(mode, settings);
  const isLate = predictedStatus === "Telat";

  const distanceFromOffice = useMemo(() => {
    if (!location || !hasOfficeCoordinate(settings)) return null;

    return getDistanceMeters(
      Number(settings.officeLatitude),
      Number(settings.officeLongitude),
      location.latitude,
      location.longitude,
    );
  }, [location, settings]);

  const isInsideRadius =
    distanceFromOffice === null || distanceFromOffice <= Number(settings.radiusMeters);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const ensureEmployee = async () => {
    if (employee?.id) return employee;

    const result = await getEmployeeProfile();

    if (!result?.success || !result?.data?.id) {
      throw new Error(result?.message || "Data karyawan tidak ditemukan");
    }

    return result.data;
  };

  const loadTodayAttendance = async () => {
    if (!user) return;

    let employeeData = employee;

    try {
      employeeData = employeeData?.id ? employeeData : await ensureEmployee();
    } catch {
      setTodayAttendance(null);
      return;
    }

    const query = supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", employeeData.id)
      .eq("date", getTodayJakarta())
      .maybeSingle();

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return;
    }

    setTodayAttendance(data);

    if (!data?.check_in) {
      setMode("check_in");
    } else if (!data?.check_out) {
      setMode("check_out");
    }
  };

  useEffect(() => {
    setSettings(loadAttendanceSettings());
    loadTodayAttendance();

    return () => stopCamera();
  }, [user?.id, employee?.id]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation tidak tersedia di browser ini");
      return;
    }

    setStatus("Mendeteksi lokasi");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setStatus("Lokasi berhasil dideteksi");
      },
      () => {
        setStatus("Akses lokasi ditolak atau tidak tersedia");
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("Kamera tidak tersedia di browser ini");
      return;
    }

    try {
      setPhotoPreview("");
      detectLocation();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraReady(true);
      setStatus("Kamera aktif");
    } catch {
      setStatus("Akses kamera ditolak atau kamera tidak tersedia");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setStatus("Kamera belum siap");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotoPreview(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
    setStatus("Foto tersimpan sementara dan kamera sudah dimatikan");
  };

  const resetPhoto = () => {
    setPhotoPreview("");
    stopCamera();
    setLocation(null);
    setStatus("Foto diulang");
  };

  const validateAttendance = () => {
    if (!photoPreview) return "Ambil foto terlebih dahulu";
    if (!location) return "Deteksi lokasi terlebih dahulu";
    if (!isInsideRadius) return "Lokasi berada di luar radius attendance";

    if (mode === "check_in" && todayAttendance?.check_in) {
      return "Anda sudah melakukan Check In hari ini";
    }

    if (mode === "check_out" && !todayAttendance?.check_in) {
      return "Silakan Check In terlebih dahulu";
    }

    if (mode === "check_out" && todayAttendance?.check_out) {
      return "Anda sudah melakukan Check Out";
    }

    if (mode === "check_out" && getJakartaMinutes() < timeToMinutes(settings.checkOutStart)) {
      return `Check Out baru bisa dilakukan mulai ${formatTimeLabel(settings.checkOutStart)}`;
    }

    return "";
  };

  const submitAttendance = async () => {
    const validationMessage = validateAttendance();

    if (validationMessage) {
      setStatus(validationMessage);
      return;
    }

    setLoading(true);
    setStatus("Menyimpan absensi");

    let employeeData = employee;

    if (!employeeData?.id) {
      try {
        setStatus("Memuat data karyawan...");
        employeeData = await ensureEmployee();
      } catch (error) {
        console.error("Gagal memuat data karyawan:", error);
        setStatus("Employee ID tidak tersedia. Coba login ulang atau lengkapi data karyawan.");
        setLoading(false);
        return;
      }
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const attendanceStatus = getAttendanceStatus(mode, settings, now);
    let uploadResult: AttendanceUpload;

    try {
      const blob = await dataUrlToBlob(photoPreview);
      uploadResult = await uploadAttendancePhoto(blob, employeeData.id);
    } catch (uploadError) {
      console.error("Upload attendance photo failed:", uploadError);
      setStatus("Gagal mengunggah foto absensi. Coba lagi.");
      setLoading(false);
      return;
    }

    const locationText = `${location!.latitude}, ${location!.longitude}`;

    const record = {
      employee_id: employeeData.id,
      employee_name: displayName,
      email: user?.email || "",
      date: getTodayJakarta(),
      check_in: nowIso,
      check_out: null,
      status: attendanceStatus,
      qr_code: "",
      latitude: location!.latitude,
      longitude: location!.longitude,
      accuracy: location!.accuracy,
      location: locationText,
      photo_url: uploadResult.publicUrl,
      photo_name: uploadResult.path,
      address: "",
    };

    let error;

    if (mode === "check_in") {
      ({ error } = await supabase.from("attendance").insert([record]).select().single());
    } else {
      const checkInDate = new Date(todayAttendance.check_in);
      const workDuration = Math.max(0, Math.floor((now.getTime() - checkInDate.getTime()) / 60000));

      ({ error } = await supabase
        .from("attendance")
        .update({
          check_out: nowIso,
          work_duration: workDuration,
          latitude: location!.latitude,
          longitude: location!.longitude,
          accuracy: location!.accuracy,
          location: locationText,
          photo_url: uploadResult.publicUrl,
          photo_name: uploadResult.path,
          address: "",
        })
        .eq("id", todayAttendance.id));
    }

    stopCamera();

    if (error) {
      console.error("Attendance save failed:", error);
      setStatus(error.message || "Gagal menyimpan absensi. Coba lagi.");
      setLoading(false);
      return;
    }

    await loadTodayAttendance();
    setPhotoPreview("");
    setLoading(false);
    setStatus(
      attendanceStatus === "Telat"
        ? "Absensi berhasil disimpan dengan status telat"
        : "Absensi berhasil disimpan ke Supabase",
    );
  };

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            Foto dan lokasi aktif
          </div>
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">
            Attendance
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            Absensi karyawan memakai foto langsung dari kamera dan tracking lokasi GPS.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[340px]">
          <div className="flex rounded-2xl border border-white/80 bg-white/70 p-1 shadow-sm dark:border-white/10 dark:bg-white/10">
            {(["check_in", "check_out"] as AttendanceMode[]).map((item) => (
              <button
                className={`h-10 flex-1 rounded-xl px-4 text-sm font-semibold transition-colors ${
                  mode === item
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                    : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                }`}
                key={item}
                onClick={() => setMode(item)}
                type="button"
              >
                {item === "check_in" ? "Check In" : "Check Out"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-white/70 pt-3 text-sm dark:border-white/10">
            <div>
              <span className="block text-slate-500 dark:text-slate-400">Batas Check In</span>
              <span className="font-semibold text-slate-950 dark:text-white">
                {formatTimeLabel(settings.checkInLimit)}
              </span>
            </div>
            <div>
              <span className="block text-slate-500 dark:text-slate-400">Minimal Check Out</span>
              <span className="font-semibold text-slate-950 dark:text-white">
                {formatTimeLabel(settings.checkOutStart)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="overflow-hidden rounded-3xl bg-slate-950">
            {photoPreview ? (
              <img
                alt="Preview foto absensi"
                className="aspect-video w-full object-cover"
                src={photoPreview}
              />
            ) : (
              <video
                autoPlay
                className="aspect-video w-full object-cover"
                muted
                playsInline
                ref={videoRef}
              />
            )}
          </div>

          <canvas className="hidden" ref={canvasRef} />

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:text-white"
              onClick={startCamera}
              type="button"
            >
              <Camera className="h-4 w-4" />
              Kamera
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:text-white"
              disabled={!cameraReady}
              onClick={capturePhoto}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
              Ambil Foto
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:text-white"
              onClick={resetPhoto}
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
              Ulang
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              disabled={
                loading ||
                !photoPreview ||
                !location ||
                !isInsideRadius ||
                (mode === "check_in" && todayAttendance?.check_in) ||
                (mode === "check_out" && todayAttendance?.check_out)
              }
              onClick={submitAttendance}
              type="button"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Simpan
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="border-b border-white/70 pb-5 dark:border-white/10">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-200">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Tracking Lokasi
                </p>
                <button
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:text-white"
                  onClick={detectLocation}
                  type="button"
                >
                  <Crosshair className="h-4 w-4" />
                  Deteksi Lokasi
                </button>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Latitude</dt>
                <dd className="font-semibold text-slate-950 dark:text-white">
                  {location ? location.latitude.toFixed(6) : "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Longitude</dt>
                <dd className="font-semibold text-slate-950 dark:text-white">
                  {location ? location.longitude.toFixed(6) : "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Akurasi</dt>
                <dd className="font-semibold text-slate-950 dark:text-white">
                  {location ? `${Math.round(location.accuracy)} meter` : "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Jarak Kantor</dt>
                <dd
                  className={`font-semibold ${
                    isInsideRadius
                      ? "text-slate-950 dark:text-white"
                      : "text-rose-600 dark:text-rose-300"
                  }`}
                >
                  {distanceFromOffice === null ? "-" : `${Math.round(distanceFromOffice)} meter`}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  isLate
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-200"
                    : "bg-sky-500/15 text-sky-700 dark:text-sky-200"
                }`}
              >
                <Clock3 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Status Absensi
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                  {status}
                </h3>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Mode</dt>
                <dd className="font-semibold text-slate-950 dark:text-white">
                  {mode === "check_in" ? "Masuk" : "Pulang"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Prediksi Status</dt>
                <dd
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isLate
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200"
                  }`}
                >
                  {isLate ? "Telat" : "Tepat waktu"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Radius</dt>
                <dd className="font-semibold text-slate-950 dark:text-white">
                  {settings.radiusMeters} meter
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Karyawan</dt>
                <dd className="max-w-44 truncate text-right font-semibold text-slate-950 dark:text-white">
                  {displayName}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
