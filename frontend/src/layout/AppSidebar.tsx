import {
  BarChart3,
  CalendarCheck2,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import useAuth from "../hooks/useAuth";
import { normalizeRole } from "../utils/auth";

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } =
    useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const isOpen = isExpanded || isHovered || isMobileOpen;

  const resolvedRole = user?.role ?? user?.user?.role ?? "";
  const role = normalizeRole(resolvedRole);
  const isAdmin = role === "admin";

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Absensi", path: "/attendance", icon: CalendarCheck2 },
    ...(isAdmin ? [{ name: "Employees", path: "/employees", icon: UsersRound }] : []),
    ...(isAdmin ? [{ name: "Reports", path: "/reports", icon: BarChart3 }] : [{ name: "Reports", path: "/dashboard#reports", icon: BarChart3 }]),
    { name: "Profile", path: "/profile", icon: UserRound },
  ];

const utilityItems = [
  { name: "Pengajuan Cuti", path: "/approvals", icon: ClipboardList },
  ...(isAdmin ? [{ name: "Settings", path: "/settings", icon: Settings }] : []),
];

  const navClass = (path?: string) => {
    const [pathname, hash] = (path || "").split("#");
    const isActive =
      location.pathname === pathname && (hash ? location.hash === `#${hash}` : !location.hash);

    return [
      "group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
      !isOpen ? "lg:justify-center" : "",
      isActive
        ? "bg-white/80 text-slate-950 shadow-sm ring-1 ring-white/80 dark:bg-white/12 dark:text-white dark:ring-white/10"
        : "text-slate-500 hover:bg-white/60 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white",
    ].join(" ");
  };

  const logoClass =
    [
      "flex items-center gap-3",
      !isOpen ? "lg:justify-center" : "",
    ].join(" ");

  return (
    <aside
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/70 bg-white/70 px-4 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-slate-950/60 ${
        isOpen ? "w-[280px]" : "w-[88px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      <div className={`flex h-14 items-center ${isOpen ? "justify-between" : "justify-center"}`}>
        <Link to="/dashboard" className={logoClass}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-950">
            <ShieldCheck className="h-5 w-5" />
          </span>
          {isOpen && (
            <span className="min-w-0">
              <span className="block text-base font-semibold text-slate-950 dark:text-white">
                Mini HRIS
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Admin Console
              </span>
            </span>
          )}
        </Link>
      </div>

      <nav className="mt-8 flex-1 space-y-8 overflow-y-auto pb-4">
        <div>
          {isOpen && (
            <p className="mb-3 px-3 text-xs font-semibold uppercase text-slate-400">
              Workspace
            </p>
          )}
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => isMobileOpen && toggleMobileSidebar()}
                  className={navClass(item.path)}
                  title={item.name}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {isOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          {isOpen && (
            <p className="mb-3 px-3 text-xs font-semibold uppercase text-slate-400">
              Manage
            </p>
          )}
          <div className="space-y-2">
            {utilityItems.map((item) => {
              const Icon = item.icon;
              return item.path ? (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => isMobileOpen && toggleMobileSidebar()}
                  className={navClass(item.path)}
                  title={item.name}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {isOpen && <span>{item.name}</span>}
                </Link>
              ) : (
                <button
                  key={item.name}
                  className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-white/60 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white ${
                    !isOpen ? "lg:justify-center" : ""
                  }`}
                  title={item.name}
                  type="button"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {isOpen && <span>{item.name}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

    </aside>
  );
};

export default AppSidebar;
