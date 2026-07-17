import { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router";
import {
  LayoutDashboard, UtensilsCrossed, Users, MessageSquare,
  MapPin, LogOut, ChevronLeft, Menu as MenuIcon, X, Sun, Moon, Settings
} from "lucide-react";
import { ThemeProps, BLUE, RED, PURPLE } from "@/app/data/constants";
import { useAuth } from "@/app/context/AuthContext";

interface AdminLayoutProps {
  theme: ThemeProps;
  dark: boolean;
  setDark: (v: boolean) => void;
}

const ADMIN_MENU = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Kelola Menu", path: "/admin/menus", icon: UtensilsCrossed },
  { label: "Kelola Pengguna", path: "/admin/pengguna", icon: Users },
  { label: "Kelola Pengaduan", path: "/admin/pengaduan", icon: MessageSquare },
  { label: "Kelola Jadwal SPPG", path: "/admin/jadwal", icon: MapPin },
];

export function AdminLayout({ theme, dark, setDark }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden relative z-10" style={{ background: "transparent" }}>
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 flex flex-col border-r transition-all duration-300 ${sidebarOpen ? "w-60" : "w-16"}`}
        style={{ background: dark ? "#0F172A" : "#1E293B", borderColor: "rgba(255,255,255,0.05)" }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {sidebarOpen && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/logo.png" alt="Logo SIPMBG" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">SIPMBG</div>
                <div className="text-[10px] text-slate-400 leading-tight">Admin Panel</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <MenuIcon size={16} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {ADMIN_MENU.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? `rgba(37,99,235,0.25)` : undefined,
                color: undefined,
              })}
              title={!sidebarOpen ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className="flex-shrink-0"
                    style={{ color: isActive ? BLUE : undefined }}
                  />
                  {sidebarOpen && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t p-3 space-y-1 flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <button
            onClick={() => setDark(!dark)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title={!sidebarOpen ? (dark ? "Mode Terang" : "Mode Gelap") : undefined}
          >
            {dark ? <Sun size={16} className="flex-shrink-0 text-yellow-400" /> : <Moon size={16} className="flex-shrink-0" />}
            {sidebarOpen && <span>{dark ? "Mode Terang" : "Mode Gelap"}</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
            title={!sidebarOpen ? "Keluar" : undefined}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="flex-shrink-0 flex items-center justify-between h-16 px-6 border-b"
          style={{ background: theme.cardBg, borderColor: theme.borderColor }}
        >
          <div>
            <h1 className="text-base font-bold" style={{ color: theme.textMain }}>Panel Administrator</h1>
            <p className="text-xs" style={{ color: theme.textMuted }}>SIPMBG · Kemdikbud Ristek RI</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors hover:opacity-80"
              style={{ borderColor: theme.borderColor, color: theme.textMuted }}
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Lihat Website</span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: theme.borderColor }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: `linear-gradient(135deg, ${BLUE}, ${PURPLE})` }}
              >
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold leading-tight" style={{ color: theme.textMain }}>{user?.name}</div>
                <div className="text-[10px] leading-tight" style={{ color: theme.textMuted }}>Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
