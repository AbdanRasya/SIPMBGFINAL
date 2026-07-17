import { ThemeProps, BLUE, RED, AMBER, GREEN } from "@/app/data/constants";
import { useNotifications } from "@/app/context/NotificationContext";
import { CheckCircle, AlertTriangle, XCircle, Clock, ChevronRight, Check } from "lucide-react";
import { useNavigate } from "react-router";

export function NotificationPage({ theme }: { theme: ThemeProps }) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    navigate(notif.path);
  };

  return (
    <main className="min-h-screen pt-24 pb-16 animate-in fade-in" style={{ background: theme.bg }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: theme.textMain }}>Riwayat Sistem</h1>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Semua notifikasi dan peringatan dari sistem.</p>
          </div>
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: BLUE }}
          >
            <Check size={16} />
            Tandai semua dibaca
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className="rounded-2xl border p-4 sm:p-5 flex items-start gap-4 transition-all cursor-pointer hover:shadow-md active:scale-[0.99]"
              style={{
                background: notif.isRead ? theme.cardBg : theme.inputBg,
                borderColor: theme.borderColor,
                borderLeftWidth: 4,
                borderLeftColor: notif.tipe === "critical" ? RED : notif.tipe === "warning" ? AMBER : GREEN,
              }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ background: notif.tipe === "critical" ? "#FEE2E2" : notif.tipe === "warning" ? "#FEF3C7" : "#DCFCE7" }}>
                {notif.tipe === "critical" ? <XCircle size={24} style={{ color: RED }} /> :
                  notif.tipe === "warning" ? <AlertTriangle size={24} style={{ color: AMBER }} /> :
                    <CheckCircle size={24} style={{ color: GREEN }} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className={`text-base leading-snug ${notif.isRead ? "font-medium" : "font-bold"}`} style={{ color: theme.textMain }}>
                    {notif.pesan}
                  </div>
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: RED }} />
                  )}
                </div>
                
                <div className="flex items-center gap-1.5 text-xs font-medium mb-3" style={{ color: theme.textMuted }}>
                  <Clock size={14} />
                  {notif.waktu}
                </div>
                <div 
                  className="w-fit text-sm font-extrabold flex items-center gap-1 hover:underline"
                  style={{ color: notif.tipe === "critical" ? RED : notif.tipe === "warning" ? AMBER : GREEN }}
                >
                  {notif.aksi}
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-12 text-sm font-medium" style={{ color: theme.textMuted }}>
              Tidak ada notifikasi saat ini.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
