export type AttendanceSettings = {
  checkInLimit: string;
  checkOutStart: string;
  officeLatitude: string;
  officeLongitude: string;
  radiusMeters: number;
};

export const ATTENDANCE_SETTINGS_KEY = "mini-hris-attendance-settings";

export const DEFAULT_ATTENDANCE_SETTINGS: AttendanceSettings = {
  checkInLimit: "08:00",
  checkOutStart: "16:30",
  officeLatitude: "",
  officeLongitude: "",
  radiusMeters: 100,
};

const isBrowser = typeof window !== "undefined";

export const loadAttendanceSettings = (): AttendanceSettings => {
  if (!isBrowser) return DEFAULT_ATTENDANCE_SETTINGS;

  const rawSettings = window.localStorage.getItem(ATTENDANCE_SETTINGS_KEY);

  if (!rawSettings) return DEFAULT_ATTENDANCE_SETTINGS;

  try {
    const settings = JSON.parse(rawSettings) as Partial<AttendanceSettings>;

    return {
      ...DEFAULT_ATTENDANCE_SETTINGS,
      ...settings,
      radiusMeters: Number(settings.radiusMeters) || DEFAULT_ATTENDANCE_SETTINGS.radiusMeters,
    };
  } catch {
    return DEFAULT_ATTENDANCE_SETTINGS;
  }
};

export const saveAttendanceSettings = (settings: AttendanceSettings) => {
  if (!isBrowser) return;

  window.localStorage.setItem(
    ATTENDANCE_SETTINGS_KEY,
    JSON.stringify({
      ...settings,
      radiusMeters: Number(settings.radiusMeters) || DEFAULT_ATTENDANCE_SETTINGS.radiusMeters,
    }),
  );
};

export const timeToMinutes = (time: string) => {
  const [hour = "0", minute = "0"] = time.split(":");
  return Number(hour) * 60 + Number(minute);
};

export const formatTimeLabel = (time: string) => `${time} WIB`;

export const getTodayJakarta = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export const getJakartaMinutes = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);

  return hour * 60 + minute;
};

export const getDistanceMeters = (
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number,
) => {
  const earthRadiusMeters = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(endLatitude - startLatitude);
  const longitudeDelta = toRadians(endLongitude - startLongitude);
  const startLatRadians = toRadians(startLatitude);
  const endLatRadians = toRadians(endLatitude);

  const distanceFactor =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(startLatRadians) *
      Math.cos(endLatRadians) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(distanceFactor), Math.sqrt(1 - distanceFactor));
};
