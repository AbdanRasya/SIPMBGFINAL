import { useState, useEffect } from "react";
import { ThemeProps } from "@/app/data/constants";
import { TrackingSidebar } from "@/app/components/tracking/TrackingSidebar";
import { TrackingMap } from "@/app/components/tracking/TrackingMap";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function TrackingPage({ theme }: { theme: ThemeProps }) {
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>(null);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get("/schedules")
      .then(res => setSchedules(res.data))
      .catch(() => toast.error("Gagal memuat jadwal dari server"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="w-full h-screen pt-20 animate-in fade-in duration-500 flex flex-col lg:flex-row overflow-hidden" style={{ background: theme.bg }}>
      <div className="w-full lg:w-80 h-1/2 lg:h-full flex-shrink-0 z-10 shadow-lg">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center" style={{ background: theme.cardBg }}>
            <Loader2 className="animate-spin text-blue-500" size={24} />
          </div>
        ) : (
          <TrackingSidebar 
            theme={theme} 
            schedules={schedules}
            onSelectSppg={(lat, lng) => setSelectedCoord([lat, lng])}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        )}
      </div>

      <div className="flex-1 h-1/2 lg:h-full relative z-0">
        <TrackingMap 
          theme={theme} 
          schedules={schedules}
          selectedCoord={selectedCoord} 
          activeFilter={activeFilter}
        />
      </div>
    </main>
  );
}
