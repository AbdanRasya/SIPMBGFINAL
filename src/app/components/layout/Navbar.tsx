import { Bell, Sun, Moon, Menu, X as CloseX, ChevronDown } from "lucide-react";
import { NAV_LINKS, BLUE, RED, AMBER, GREEN, PURPLE, ThemeProps } from "@/app/data/constants";
import { useClickOutside } from "@/app/hooks/useClickOutside";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

interface NavbarProps {
  theme: ThemeProps;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
}

// 4 menu utama selalu tampil, sisanya dalam "Lainnya"
const PRIMARY_LABELS = ["Dashboard", "Menu Makanan", "Lacak SPPG", "Pengaduan"];

export function Navbar({ theme, activeNav, setActiveNav, dark, setDark }: NavbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();

  const notifRef = useClickOutside<HTMLDivElement>(() => setNotifOpen(false), notifOpen);
  const mobileMenuRef = useClickOutside<HTMLDivElement>(() => setMobileMenu(false), mobileMenu);
  const moreRef = useClickOutside<HTMLDivElement>(() => setMoreOpen(false), moreOpen);

  // User hanya lihat NAV_LINKS biasa, tanpa panel admin
  const primaryLinks = NAV_LINKS.filter(l => PRIMARY_LABELS.includes(l.label));
  const secondaryLinks = NAV_LINKS.filter(l => !PRIMARY_LABELS.includes(l.label));

  const isActive = (link: any) =>
    activeNav === link.label || (link.path && location.pathname === link.path);

  const handleNavClick = (link: any) => {
    setActiveNav(link.label);
    setMobileMenu(false);
    setMoreOpen(false);

    if (link.path) {
      navigate(link.path);
      return;
    }

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(link.sectionId);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
      }, 100);
      return;
    }

    const el = document.getElementById(link.sectionId);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  const handleLogoClick = () => {
    if (location.pathname !== "/") navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pt-3 px-4 sm:px-6 w-full max-w-screen-xl mx-auto pointer-events-none">
      <nav
        className="pointer-events-auto rounded-[18px] border shadow-lg transition-colors duration-300"
        role="navigation"
        style={{
          background: dark ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.92)",
          borderColor: theme.borderColor,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="px-4 sm:px-5 flex items-center justify-between h-14 gap-3">

          {/* Logo */}
          <div onClick={handleLogoClick} className="flex items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/logo.png" alt="Logo SIPMBG" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-sm leading-tight" style={{ color: theme.textMain }}>SIPMBG</div>
              <div className="text-[10px] leading-tight" style={{ color: theme.textMuted }}>MBG Platform</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5 flex-shrink-0">
            {primaryLinks.map(link => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="cursor-pointer px-3 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap hover:opacity-80"
                style={{
                  background: isActive(link) ? (dark ? "rgba(37,99,235,0.2)" : "#EFF6FF") : "transparent",
                  color: isActive(link) ? BLUE : theme.textMuted,
                  fontWeight: isActive(link) ? 600 : 400,
                }}
              >
                {link.label}
              </button>
            ))}

            {secondaryLinks.length > 0 && (
              <div className="relative" ref={moreRef}>
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap hover:opacity-80"
                  style={{
                    background: moreOpen ? (dark ? "rgba(37,99,235,0.2)" : "#EFF6FF") : "transparent",
                    color: moreOpen ? BLUE : theme.textMuted,
                  }}
                >
                  Lainnya
                  <ChevronDown size={14} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
                </button>
                {moreOpen && (
                  <div
                    className="absolute top-full mt-2 left-0 min-w-[180px] rounded-xl border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-[10001]"
                    style={{ background: theme.cardBg, borderColor: theme.borderColor }}
                  >
                    {secondaryLinks.map(link => (
                      <button
                        key={link.label}
                        onClick={() => handleNavClick(link)}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80 flex items-center gap-2"
                        style={{
                          color: isActive(link) ? BLUE : theme.textMain,
                          background: isActive(link) ? (dark ? "rgba(37,99,235,0.1)" : "#EFF6FF") : "transparent",
                        }}
                      >
                        {isActive(link) && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: BLUE }} />}
                        {link.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">

            {/* Tombol Panel Admin — hanya untuk admin */}
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="hidden sm:flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all hover:opacity-80"
                style={{
                  background: `linear-gradient(135deg, ${BLUE}22, #7C3AED22)`,
                  color: BLUE,
                  border: `1px solid ${BLUE}33`,
                }}
                title="Buka Panel Admin"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
                </svg>
                Panel Admin
              </button>
            )}

            {/* Notification */}
            <div className="relative" ref={notifRef}>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setNotifOpen(!notifOpen)}
                className="cursor-pointer relative w-8 h-8 rounded-[10px] flex items-center justify-center transition-all hover:opacity-80"
                style={{ background: dark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }}
              >
                <Bell size={15} style={{ color: theme.textMuted }} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full border-2 text-[9px] font-bold text-white flex items-center justify-center px-0.5"
                    style={{ background: RED, borderColor: dark ? "rgba(15,23,42,1)" : "white" }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 rounded-2xl shadow-2xl border p-4 w-80 z-[10000] origin-top-right animate-in fade-in zoom-in-95 duration-200"
                  style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
                  <div className="font-semibold mb-3 flex items-center justify-between" style={{ color: theme.textMain }}>
                    <span>Notifikasi Terbaru</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs font-normal cursor-pointer hover:underline" style={{ color: BLUE }}>Tandai dibaca</button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1">
                    {notifications.slice(0, 5).map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => { markAsRead(n.id); navigate(n.path); setNotifOpen(false); }}
                        className="flex gap-3 py-2.5 border-b last:border-0 p-2 -mx-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        style={{ borderColor: theme.borderColor, opacity: n.isRead ? 0.7 : 1 }}>
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: n.tipe === "critical" ? RED : n.tipe === "warning" ? AMBER : GREEN, opacity: n.isRead ? 0 : 1 }} />
                        <div>
                          <div className={`text-xs leading-relaxed ${n.isRead ? "font-normal" : "font-semibold"}`} style={{ color: theme.textMain }}>{n.pesan}</div>
                          <div className="text-xs mt-1" style={{ color: theme.textMuted }}>{n.waktu}</div>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="text-xs text-center py-4" style={{ color: theme.textMuted }}>Tidak ada notifikasi</div>
                    )}
                  </div>
                  <button 
                    onClick={() => { navigate("/notifications"); setNotifOpen(false); }}
                    className="w-full text-center text-xs mt-2 pt-2 border-t font-semibold hover:underline cursor-pointer"
                    style={{ color: BLUE, borderColor: theme.borderColor }}>
                    Lihat Semua
                  </button>
                </div>
              )}
            </div>

            {/* Dark mode */}
            <button
              onClick={() => setDark(!dark)}
              className="cursor-pointer w-8 h-8 rounded-[10px] flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: dark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }}
            >
              {dark ? <Sun size={15} style={{ color: "#FCD34D" }} /> : <Moon size={15} style={{ color: theme.textMuted }} />}
            </button>

            {/* Profile */}
            <div
              onClick={() => navigate("/account")}
              className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l cursor-pointer hover:opacity-80 transition-opacity group"
              style={{ borderColor: theme.borderColor }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm transition-transform group-hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${PURPLE} 100%)` }}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold leading-tight" style={{ color: theme.textMain }}>{user?.name || "Pengguna"}</div>
                <div className="text-[10px] leading-tight capitalize" style={{ color: theme.textMuted }}>{user?.role || "user"}</div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              title="Keluar"
              className="hidden sm:flex cursor-pointer w-8 h-8 rounded-[10px] items-center justify-center transition-all hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>

            {/* Mobile Hamburger */}
            <div ref={mobileMenuRef} className="lg:hidden relative">
              <button
                className="cursor-pointer w-8 h-8 rounded-[10px] flex items-center justify-center hover:opacity-80"
                style={{ background: dark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setMobileMenu(!mobileMenu)}
              >
                {mobileMenu ? <CloseX size={15} style={{ color: theme.textMuted }} /> : <Menu size={15} style={{ color: theme.textMuted }} />}
              </button>

              {mobileMenu && (
                <div className="absolute top-11 right-0 w-56 rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-[10000]"
                  style={{ borderColor: theme.borderColor, background: theme.cardBg }}>
                  <div className="p-2 space-y-0.5">
                    {NAV_LINKS.map(link => (
                      <button
                        key={link.label}
                        onClick={() => handleNavClick(link)}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        style={{
                          color: isActive(link) ? BLUE : theme.textMain,
                          background: isActive(link) ? (dark ? "rgba(37,99,235,0.1)" : "#EFF6FF") : "transparent",
                        }}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t p-3 space-y-1" style={{ borderColor: theme.borderColor }}>
                    <button
                      onClick={() => { navigate("/account"); setMobileMenu(false); }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3"
                      style={{ color: theme.textMain }}
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: `linear-gradient(135deg, ${BLUE}, ${PURPLE})` }}>
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{user?.name}</div>
                        <div className="text-[10px] capitalize" style={{ color: theme.textMuted }}>{user?.role}</div>
                      </div>
                    </button>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => { navigate("/admin"); setMobileMenu(false); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
                        style={{ color: BLUE, background: `${BLUE}12` }}
                      >
                        🛠️ Panel Admin
                      </button>
                    )}
                    <button
                      onClick={() => { logout(); setMobileMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Keluar (Logout)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
