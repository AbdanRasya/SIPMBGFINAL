import { CheckCircle, AlertTriangle, XCircle, Clock, ChevronRight } from "lucide-react";
import { BLUE, GREEN, AMBER, RED, ThemeProps } from "@/app/data/constants";
import { useNotifications } from "@/app/context/NotificationContext";
import { useNavigate } from "react-router";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { motion } from "motion/react";
import { useInView } from "@/app/hooks/useInView";

export function NotificationSection({ theme }: { theme: ThemeProps }) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <section id="notifications" className="max-w-screen-xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <SectionHeader
        badge="🔔 Pusat Notifikasi"
        title="Peringatan Sistem Real-time"
        subtitle="Notifikasi proaktif dari sistem AI dan monitoring untuk anomali gizi, batas waktu distribusi, dan laporan masyarakat."
        dark={theme.dark}
      />

      <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {notifications.slice(0, 4).map((notif, i) => (
          <motion.div 
            key={notif.id} 
            initial={{ opacity: 0, x: -10 }} 
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            onClick={() => { markAsRead(notif.id); navigate(notif.path); }}
            className="rounded-2xl border p-4 sm:p-5 flex items-start gap-3 sm:gap-4 transition-transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-500 shadow-sm hover:shadow-md cursor-pointer"
            style={{
              background: notif.isRead ? theme.cardBg : theme.inputBg,
              borderColor: theme.borderColor,
              borderLeftWidth: 4,
              borderLeftColor: notif.tipe === "critical" ? RED : notif.tipe === "warning" ? AMBER : GREEN,
              opacity: notif.isRead ? 0.8 : 1
            }}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ background: notif.tipe === "critical" ? "#FEE2E2" : notif.tipe === "warning" ? "#FEF3C7" : "#DCFCE7" }}>
              {notif.tipe === "critical" ? <XCircle size={20} style={{ color: RED }} aria-hidden="true" /> :
                notif.tipe === "warning" ? <AlertTriangle size={20} style={{ color: AMBER }} aria-hidden="true" /> :
                  <CheckCircle size={20} style={{ color: GREEN }} aria-hidden="true" />}
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-between h-full pt-0.5">
              <div className="text-sm sm:text-base mb-3 sm:mb-4 leading-snug flex justify-between gap-2" style={{ color: theme.textMain }}>
                <span className={notif.isRead ? "font-medium" : "font-bold"}>{notif.pesan}</span>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: RED }} />
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mt-auto">
                <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>
                  <Clock size={12} aria-hidden="true" />
                  {notif.waktu}
                </div>
                <div 
                  className="w-fit text-xs sm:text-sm font-extrabold flex items-center gap-1 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
                  style={{ color: notif.tipe === "critical" ? RED : notif.tipe === "warning" ? AMBER : GREEN, outlineColor: BLUE }}
                  aria-label={`${notif.aksi} untuk notifikasi: ${notif.pesan}`}
                >
                  {notif.aksi}
                  <ChevronRight size={14} aria-hidden="true" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <button 
          onClick={() => navigate("/notifications")}
          className="px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 border"
          style={{ background: theme.cardBg, color: theme.textMain, borderColor: theme.borderColor }}>
          Lihat Semua Riwayat Sistem
        </button>
      </div>
    </section>
  );
}
