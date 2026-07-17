import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { BLUE, GREEN, ThemeProps, analyticsData, trendData } from "@/app/data/constants";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { CircularProgress } from "@/app/components/shared/CircularProgress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function LaporanPage({ theme }: { theme: ThemeProps }) {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const tooltipStyle = {
    background: theme.cardBg, border: `1px solid ${theme.borderColor}`,
    borderRadius: 12, color: theme.textMain, fontSize: 12, boxShadow: theme.cardShadow
  };

  return (
    <main className="min-h-screen py-24 sm:py-32 animate-in fade-in" style={{ background: theme.dark ? "#0B1120" : "#F8FAFC" }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium mb-8 hover:opacity-70 transition-opacity" style={{ color: theme.textMuted }}>
          <ArrowLeft size={16} /> Kembali
        </button>

        <SectionHeader
          badge="📈 Analytics Center"
          title="Dashboard Kinerja Eksekutif"
          subtitle="Gambaran ringkas dan padat (bird's eye view) terhadap seluruh Key Performance Indicator (KPI) program MBG nasional hari ini."
          dark={theme.dark}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mb-8">
          {analyticsData.map((item, i) => (
            <div key={i} className="rounded-2xl border p-4 sm:p-6 flex flex-col items-center text-center shadow-sm"
              style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
              <div className="relative mb-3 group">
                <CircularProgress value={item.value} size={84} strokeWidth={8} color={item.color} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-base font-black" style={{ color: item.color }}>
                    {item.value}<span className="text-[10px]">{item.unit}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs sm:text-sm font-bold leading-tight" style={{ color: theme.textMain }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border p-5 sm:p-8 shadow-sm mb-8" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
          <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
            <div>
              <h3 className="font-extrabold text-lg mb-1" style={{ color: theme.textMain }}>Tren Distribusi Harian Nasional</h3>
              <p className="text-sm" style={{ color: theme.textMuted }}>Kinerja seminggu terakhir vs. target nasional</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border self-start"
              style={{ background: theme.dark ? "rgba(22,163,74,0.1)" : "#DCFCE7", color: GREEN, borderColor: "#BBF7D0" }}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
              LIVE UPDATE
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={theme.dark ? "#1E293B" : "#F1F5F9"} />
                <XAxis dataKey="hari" tick={{ fontSize: 12, fill: theme.textMuted }} axisLine={false} tickLine={false} dy={15} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 12, fill: theme.textMuted }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="distribusi" name="Capaian %" stroke={BLUE} strokeWidth={4}
                  dot={{ r: 5, fill: theme.cardBg, stroke: BLUE, strokeWidth: 3 }}
                  activeDot={{ r: 8, fill: BLUE, stroke: theme.cardBg, strokeWidth: 3 }} />
                <Line type="step" dataKey="target" name="Target %" stroke={GREEN} strokeWidth={2} strokeDasharray="6 6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary table */}
        <div className="rounded-2xl border p-5 sm:p-7 shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
          <h3 className="font-bold text-lg mb-4" style={{ color: theme.textMain }}>Rekapitulasi KPI Bulanan</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left" style={{ borderColor: theme.borderColor }}>
                <tr>
                  <th className="px-4 py-3 font-semibold" style={{ color: theme.textMain }}>Indikator</th>
                  <th className="px-4 py-3 font-semibold text-center" style={{ color: theme.textMain }}>Target</th>
                  <th className="px-4 py-3 font-semibold text-center" style={{ color: theme.textMain }}>Capaian</th>
                  <th className="px-4 py-3 font-semibold text-center" style={{ color: theme.textMain }}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: theme.borderColor }}>
                {analyticsData.map((item, i) => {
                  const capaian = `${item.value}${item.unit}`;
                  const onTrack = item.value >= 80;
                  return (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium" style={{ color: theme.textMain }}>{item.label}</td>
                      <td className="px-4 py-3 text-center" style={{ color: theme.textMuted }}>≥ 80{item.unit}</td>
                      <td className="px-4 py-3 text-center font-bold" style={{ color: item.color }}>{capaian}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded text-xs font-bold"
                          style={{ background: onTrack ? `${GREEN}15` : `#EF444415`, color: onTrack ? GREEN : "#EF4444" }}>
                          {onTrack ? "✓ On Track" : "⚠ Perhatian"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
