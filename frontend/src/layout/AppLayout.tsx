import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";

const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const sidebarOpen = isExpanded || isHovered;

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-950 dark:bg-[#101218] dark:text-white">
      <div className="fixed inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(16,185,129,0.07)_42%,rgba(245,158,11,0.06))] dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(16,185,129,0.08)_42%,rgba(245,158,11,0.08))]" />
      <div className="relative z-10 min-h-screen">
        <AppSidebar />
        <Backdrop />

        <div
          className={`min-h-screen transition-[margin] duration-300 ease-out ${
            sidebarOpen ? "lg:ml-[280px]" : "lg:ml-[88px]"
          } ${isMobileOpen ? "ml-0" : ""}`}
        >
          <AppHeader />
          <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

const AppLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
