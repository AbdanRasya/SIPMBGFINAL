import { useState, useEffect } from "react";
import { UtensilsCrossed, Users, MessageSquare, MapPin, TrendingUp, Loader2 } from "lucide-react";
import { BLUE, GREEN, AMBER, RED, ThemeProps } from "@/app/data/constants";
import api from "@/lib/api";
import { useNavigate } from "react-router";

export function AdminDashboard({ theme }: { theme: ThemeProps }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Menu", value: stats?.totalMenus ?? 0, icon: UtensilsCrossed, color: BLUE, path: "/admin/menus" },
    { label: "Pengguna", value: stats?.totalUsers ?? 0, icon: Users, color: GREEN, path: "/admin/pengguna" },
    { label: "Pengaduan", value: stats?.totalFeedbacks ?? 0, icon: MessageSquare, color: AMBER, path: "/admin/pengaduan" },
    { label: "Analisis AI", value: stats?.totalAi ?? 0, icon: TrendingUp, color: RED, path: "#" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: theme.textMain }}>Ringkasan Sistem</h2>
        <p className="text-sm" style={{ color: theme.textMuted }}>Selamat datang di Panel Admin SIPMBG. Kelola seluruh data dari sini.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(c => (
            <div
              key={c.label}
              onClick={() => c.path !== "#" && navigate(c.path)}
              className="p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all"
              style={{ background: theme.cardBg, borderColor: theme.borderColor }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${c.color}18` }}>
                <c.icon size={20} style={{ color: c.color }} />
              </div>
              <div className="text-2xl font-black mb-0.5" style={{ color: theme.textMain }}>{c.value}</div>
              <div className="text-xs font-medium" style={{ color: theme.textMuted }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border p-5" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
        <h3 className="font-bold mb-4" style={{ color: theme.textMain }}>Akses Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Tambah Menu Makanan Baru", icon: UtensilsCrossed, path: "/admin/menus", color: BLUE },
            { label: "Tambah Pengguna Baru", icon: Users, path: "/admin/pengguna", color: GREEN },
            { label: "Balas Pengaduan", icon: MessageSquare, path: "/admin/pengaduan", color: AMBER },
            { label: "Tambah Jadwal SPPG", icon: MapPin, path: "/admin/jadwal", color: RED },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 p-4 rounded-xl border text-left hover:opacity-80 transition-opacity"
              style={{ borderColor: theme.borderColor }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}18` }}>
                <item.icon size={18} style={{ color: item.color }} />
              </div>
              <span className="text-sm font-medium" style={{ color: theme.textMain }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
