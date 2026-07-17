import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { ThemeProps, BLUE, GREEN, SLATE } from "@/app/data/constants";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const iconBeroperasi = createCustomIcon(GREEN);
const iconBelumBeroperasi = createCustomIcon(SLATE);
const iconSelesai = createCustomIcon(BLUE);

function ChangeView({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 12, { animate: true });
    }
  }, [center, map]);
  return null;
}

interface TrackingMapProps {
  theme: ThemeProps;
  schedules: any[];
  selectedCoord: [number, number] | null;
  activeFilter: string;
}

export function TrackingMap({ theme, schedules, selectedCoord, activeFilter }: TrackingMapProps) {
  const defaultCenter: [number, number] = [-2.5489, 118.0149];
  const [zoom, setZoom] = useState(5);

  const filtered = schedules.filter(s => activeFilter === "Semua" ? true : s.status === activeFilter);

  const tileUrl = theme.dark 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={false}
      >
        <ChangeView center={selectedCoord} />
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {filtered.map((sppg, i) => {
          let icon = iconBelumBeroperasi;
          if (sppg.status === "Beroperasi") icon = iconBeroperasi;
          else if (sppg.status === "Selesai") icon = iconSelesai;

          const lat = parseFloat(sppg.lat);
          const lng = parseFloat(sppg.lng);
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker 
              key={i} 
              position={[lat, lng]} 
              icon={icon}
            >
              <Popup className={theme.dark ? "dark-popup" : ""}>
                <div style={{ color: theme.dark ? "#F1F5F9" : "#0F172A", padding: "4px" }}>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "bold" }}>{sppg.location}</h3>
                  <p style={{ margin: "0 0 8px 0", fontSize: "12px", opacity: 0.8 }}>{sppg.address}</p>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "11px" }}>
                    <span>Status:</span>
                    <strong style={{ color: sppg.status === "Beroperasi" ? GREEN : (sppg.status === "Selesai" ? BLUE : SLATE) }}>{sppg.status}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "11px" }}>
                    <span>Target:</span>
                    <strong>{sppg.packages} Paket</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      <style>{`
        .dark-popup .leaflet-popup-content-wrapper,
        .dark-popup .leaflet-popup-tip {
          background: #1E293B;
          color: #F1F5F9;
        }
      `}</style>
    </div>
  );
}
