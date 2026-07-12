import { Bell, Menu, Search, Sparkles, X } from "lucide-react";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import { useSidebar } from "../context/SidebarContext";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { normalizeRole } from "../utils/auth";

const AppHeader = () => {
  const { isMobileOpen, toggleMobileSidebar, toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
      return;
    }

    toggleMobileSidebar();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const displayName =
    user?.full_name ||
    user?.user_metadata?.full_name ||
    user?.name ||
    user?.email ||
    "User";

  const profileRole = user?.role ?? user?.user?.role ?? "";
  const normalizedRole = normalizeRole(profileRole);
  const roleLabel =
    normalizedRole === "admin"
      ? "Admin"
      : normalizedRole === "employee"
      ? "Pegawai"
      : normalizedRole
      ? normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)
      : "User";

  const initials = displayName
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55">
      <div className="flex min-h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          aria-label="Toggle sidebar"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/80 text-slate-600 shadow-sm transition-colors hover:text-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-slate-300 dark:hover:text-white"
          onClick={handleToggle}
          type="button"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="hidden min-w-0 flex-1 md:block">
          <label className="relative block max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-11 w-full rounded-2xl border border-white/80 bg-white/75 pl-11 pr-4 text-sm text-slate-800 outline-none shadow-sm transition focus:border-sky-300 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-500"
              placeholder="Search employees, attendance, reports"
              type="search"
            />
          </label>
        </div>

        <div className="ml-auto flex items-center gap-2">

          <ThemeToggleButton />

          <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-1.5 pr-3 shadow-sm dark:border-white/10 dark:bg-white/10">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
              {user?.avatar ? (
                <img alt={displayName} className="h-full w-full object-cover" src={user.avatar} />
              ) : (
                initials
              )}
            </span>
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-36 truncate text-sm font-semibold text-slate-900 dark:text-white">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabel}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            type="button"
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
