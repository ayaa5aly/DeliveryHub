import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUI } from "@/hooks/useUI";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout() {
  const { sidebarOpen, openSidebar } = useUI();

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <Sidebar className="hidden lg:flex" />

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => openSidebar(false)}
          />
          <Sidebar className="fixed inset-y-0 left-0 z-50 lg:hidden" />
        </>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onMenuClick={() => openSidebar(true)} />
        <main className={cn("flex-1 overflow-y-auto p-6")}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
