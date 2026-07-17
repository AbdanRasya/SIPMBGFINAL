import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { BLUE, GREEN, SLATE, ThemeProps } from "@/app/data/constants";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { motion } from "motion/react";
import { useInView } from "@/app/hooks/useInView";
import api from "@/lib/api";


// Leaflet
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue in Leaflet + Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom HTML Marker matching the previous SVG style
const createCustomMarker = (isActive: boolean) => {
  return L.divIcon({
    className: "custom-sppg-marker",
    html: `
      <div style="
        position: relative;
        width: ${isActive ? '32px' : '22px'};
        height: ${isActive ? '32px' : '22px'};
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
      ">
        <!-- Outer pulsing circle -->
        <div style="
          position: absolute;
          inset: 0;
          background: ${BLUE};
          opacity: 0.2;
          border-radius: 50%;
          animation: ${isActive ? 'pulse 1.5s infinite' : 'none'};
        "></div>
        <!-- Inner solid circle -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${isActive ? '14px' : '10px'};
          height: ${isActive ? '14px' : '10px'};
          background: ${BLUE};
          border: ${isActive ? '2px' : '1.5px'} solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        "></div>
      </div>
    `,
    iconSize: [0, 0], // Center exactly on coordinates
    iconAnchor: [0, 0]
  });
};

export function MapSection({ theme }: { theme: ThemeProps }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.2 });
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/schedules')
      .then(r => setSchedules(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const containerBg = theme.dark ? "#0B1120" : "#EFF6FF";
  const mapTileUrl = theme.dark 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <section id="map" style={{ background: containerBg }} className="py-16 sm:py-24 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <SectionHeader
          badge="🗺️ Peta Distribusi"
          title="Jaringan Distribusi Nasional"
          subtitle="Pantau pusat logistik (SPPG) dan sebaran distribusi program makan bergizi gratis ke seluruh penjuru Indonesia secara real-time."
          dark={theme.dark}
        />

        <div ref={ref} className="relative w-full rounded-2xl overflow-hidden shadow-xl border" style={{ borderColor: theme.borderColor, height: "450px" }}>
          
          {loading ? (
            <div className="w-full h-full flex items-center justify-center" style={{ background: theme.dark ? "#0f172a" : "#e2e8f0" }}>
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
          ) : isInView && (
            <MapContainer 
              center={[-2.5489, 118.0149]} 
              zoom={5} 
              scrollWheelZoom={false}
              style={{ width: "100%", height: "100%", background: theme.dark ? "#0f172a" : "#cbd5e1" }}
              attributionControl={false}
            >
              <TileLayer url={mapTileUrl} />

              {schedules.map((loc, i) => (
                <Marker 
                  key={i} 
                  position={[loc.lat, loc.lng]} 
                  icon={createCustomMarker(hovered === i)}
                  eventHandlers={{
                    mouseover: () => setHovered(i),
                    mouseout: () => setHovered(null),
                    click: () => setHovered(i)
                  }}
                >
                  <Tooltip 
                    direction="top" 
                    offset={[0, -10]} 
                    opacity={1}
                    className="custom-leaflet-tooltip"
                  >
                    <div className="px-1 py-0.5 min-w-[180px]">
                      <div className="font-extrabold mb-2 text-sm border-b pb-1.5" style={{ color: "#0F172A", borderColor: "#E2E8F0" }}>
                        {loc.location}
                      </div>
                      <div className="flex justify-between gap-6 mb-1.5">
                        <span style={{ color: SLATE, fontSize: '11px' }}>Target Harian</span>
                        <span className="font-bold tracking-tight" style={{ color: BLUE }}>{(loc.packages || 0).toLocaleString("id-ID")} porsi</span>
                      </div>
                      <div className="flex justify-between gap-6">
                        <span style={{ color: SLATE, fontSize: '11px' }}>Status Logistik</span>
                        <span className="font-bold px-1.5 rounded text-[10px] uppercase tracking-wider" style={{ background: "#DCFCE7", color: GREEN }}>
                          {loc.status}
                        </span>
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              ))}
            </MapContainer>
          )}

          {/* Legend Overlay */}
          <div className="absolute bottom-6 left-6 rounded-xl px-4 py-3 text-xs font-medium shadow-lg z-[400]"
            style={{ background: theme.dark ? "rgba(30,41,59,0.9)" : "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: `1px solid ${theme.borderColor}` }}>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: BLUE }}></div>
              <span style={{ color: theme.textMuted }}>Lokasi SPPG Aktif</span>
            </div>
            <div className="font-bold text-sm" style={{ color: theme.textMain }}>
              {schedules.length} Sentra Logistik
            </div>
          </div>
        </div>

        {/* CSS overrides for Leaflet Tooltip to match theme */}
        <style dangerouslySetInnerHTML={{__html: `
          .custom-leaflet-tooltip {
            background: white !important;
            border: 1px solid #E2E8F0 !important;
            border-radius: 12px !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
            padding: 8px 12px !important;
          }
          .custom-leaflet-tooltip::before {
            border-top-color: white !important;
          }
          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.5; }
            50% { transform: scale(1.3); opacity: 0.1; }
            100% { transform: scale(0.95); opacity: 0.5; }
          }
        `}} />

        {/* Quick Stats Grid Below Map */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mt-6 sm:mt-8">
          {schedules.slice(0, 4).map((loc, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="rounded-xl p-3 sm:p-5 border text-center transition-transform hover:-translate-y-1 hover:shadow-lg"
              style={{ background: theme.cardBg, borderColor: theme.borderColor, boxShadow: theme.cardShadow }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full mb-2 sm:mb-3 flex items-center justify-center" style={{ background: theme.dark ? "rgba(37,99,235,0.1)" : "#EFF6FF" }}>
                <MapPin size={18} style={{ color: BLUE }} />
              </div>
              <h3 className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1 truncate px-1" style={{ color: theme.textMain }}>{loc.address || loc.location}</h3>
              <div className="text-lg sm:text-2xl font-black tracking-tight leading-none mb-1" style={{ color: BLUE }}>{(loc.packages || 0).toLocaleString("id-ID")}</div>
              <div className="text-[10px] sm:text-xs font-medium uppercase tracking-widest opacity-80" style={{ color: theme.textMuted }}>porsi/hari</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

