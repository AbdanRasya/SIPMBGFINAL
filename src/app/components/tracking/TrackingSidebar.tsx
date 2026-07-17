import { Search, MapPin } from "lucide-react";
import { BLUE, GREEN, SLATE, ThemeProps } from "@/app/data/constants";
import { useState } from "react";

interface TrackingSidebarProps {
  theme: ThemeProps;
  schedules: any[];
  onSelectSppg: (lat: number, lng: number) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export function TrackingSidebar({ theme, schedules, onSelectSppg, activeFilter, setActiveFilter }: TrackingSidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = schedules.filter(s => 
    ((s.location || "").toLowerCase().includes(search.toLowerCase()) || (s.address || "").toLowerCase().includes(search.toLowerCase())) &&
    (activeFilter === "Semua" ? true : s.status === activeFilter)
  );

  return (
    <div className="w-full lg:w-80 flex flex-col h-full border-r transition-colors duration-300" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
      <div className="p-4 border-b" style={{ borderColor: theme.borderColor }}>
        <h2 className="font-bold text-lg mb-4" style={{ color: theme.textMain }}>Lokasi & Jadwal</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Cari Lokasi/Kota..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border outline-none transition-colors"
            style={{ background: theme.dark ? "rgba(255,255,255,0.05)" : "#F8FAFC", borderColor: theme.borderColor, color: theme.textMain }}
          />
          <Search size={16} className="absolute left-3 top-2.5" style={{ color: theme.textMuted }} />
        </div>
      </div>

      <div className="p-4 border-b flex gap-2 overflow-x-auto no-scrollbar" style={{ borderColor: theme.borderColor }}>
        {["Semua", "Beroperasi", "Belum Beroperasi", "Selesai"].map(filter => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border"
              style={{
                background: isActive ? BLUE : (theme.dark ? "rgba(255,255,255,0.05)" : "#F1F5F9"),
                color: isActive ? "white" : theme.textMuted,
                borderColor: isActive ? BLUE : theme.borderColor
              }}
            >
              {filter}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((sppg, i) => (
              <div 
                key={i}
                onClick={() => onSelectSppg(sppg.lat, sppg.lng)}
                className="p-3 rounded-xl cursor-pointer transition-colors group relative"
                onMouseEnter={(e) => e.currentTarget.style.background = theme.dark ? "rgba(37,99,235,0.1)" : "#EFF6FF"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: theme.dark ? "rgba(255,255,255,0.05)" : "#F1F5F9" }}>
                    <MapPin size={14} style={{ color: sppg.status === "Beroperasi" ? GREEN : (sppg.status === "Selesai" ? BLUE : SLATE) }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm group-hover:text-blue-500 transition-colors line-clamp-1" style={{ color: theme.textMain }}>{sppg.location}</h3>
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: theme.textMuted }}>{sppg.address}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" 
                        style={{ 
                          background: sppg.status === "Beroperasi" ? "rgba(22, 163, 74, 0.1)" : (sppg.status === "Selesai" ? "rgba(37, 99, 235, 0.1)" : "rgba(100, 116, 139, 0.1)"), 
                          color: sppg.status === "Beroperasi" ? GREEN : (sppg.status === "Selesai" ? BLUE : SLATE) 
                        }}>
                        {sppg.status}
                      </span>
                      <span className="text-[10px] opacity-70" style={{ color: theme.textMuted }}>{sppg.packages} paket</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-6 text-sm" style={{ color: theme.textMuted }}>
              Tidak ada data yang sesuai.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
