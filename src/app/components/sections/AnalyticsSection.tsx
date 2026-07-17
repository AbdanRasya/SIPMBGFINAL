import { BLUE, GREEN, ThemeProps, analyticsData, trendData } from "@/app/data/constants";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { CircularProgress } from "@/app/components/shared/CircularProgress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function AnalyticsSection({ theme }: { theme: ThemeProps }) {
  const tooltipStyle = { 
    background: theme.cardBg, 
    border: `1px solid ${theme.borderColor}`, 
    borderRadius: 12, 
    color: theme.textMain, 
    fontSize: 12,
    boxShadow: theme.cardShadow
  };

  return (
    <section id="analytics" className="py-16 sm:py-24 border-y border-slate-200 dark:border-slate-800" style={{ background: theme.dark ? "#0B1120" : "#F8FAFC" }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <SectionHeader
          badge="📈 Analytics Center"
          title="Dashboard Kinerja Eksekutif"
          subtitle="Gambaran ringkas dan padat (bird's eye view) terhadap seluruh Key Performance Indicator (KPI) program MBG nasional hari ini."
          dark={theme.dark}
        />

        {/* Circular progress KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mb-6 sm:mb-8">
          {analyticsData.map((item, i) => (
            <div key={i} className="rounded-2xl border p-4 sm:p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
              style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
              <div className="relative mb-3 sm:mb-4 group">
                <CircularProgress value={item.value} size={84} strokeWidth={8} color={item.color} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-sm sm:text-base font-black transition-transform group-hover:scale-110" style={{ color: item.color }}>
                    {item.value}<span className="text-[10px]">{item.unit}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs sm:text-sm font-bold leading-tight px-2" style={{ color: theme.textMain }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Wide KPI Chart */}
        <div className="rounded-2xl border p-5 sm:p-8 shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl mb-1" style={{ color: theme.textMain }}>Tren Distribusi Harian Nasional</h3>
              <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>Kinerja seminggu terakhir dibandingkan dengan baseline target nasional</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm self-start sm:self-auto"
                style={{ background: theme.dark ? "rgba(22,163,74,0.1)" : "#DCFCE7", color: GREEN, borderColor: theme.dark ? "rgba(22,163,74,0.2)" : "#BBF7D0" }}>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
                LIVE UPDATE
              </div>
            </div>
          </div>
          
          <div className="w-full h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={theme.dark ? "#1E293B" : "#F1F5F9"} />
                <XAxis dataKey="hari" tick={{ fontSize: 12, fill: theme.textMuted, fontWeight: 500 }} axisLine={false} tickLine={false} dy={15} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 12, fill: theme.textMuted, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: theme.borderColor, strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Line 
                  type="monotone" 
                  dataKey="distribusi" 
                  name="Capaian Distribusi %" 
                  stroke={BLUE} 
                  strokeWidth={4}
                  dot={{ r: 5, fill: theme.cardBg, stroke: BLUE, strokeWidth: 3 }} 
                  activeDot={{ r: 8, fill: BLUE, stroke: theme.cardBg, strokeWidth: 3 }}
                />
                <Line 
                  type="step" 
                  dataKey="target" 
                  name="Target Nasional %" 
                  stroke={GREEN} 
                  strokeWidth={2} 
                  strokeDasharray="6 6"
                  dot={false} 
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-center sm:justify-start gap-6 sm:gap-8 mt-6 pt-6 border-t" style={{ borderColor: theme.borderColor }}>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <div className="w-4 h-4 rounded-full border-[3px]" style={{ borderColor: BLUE, background: theme.cardBg }}></div>
              <span style={{ color: theme.textMain }}>Capaian Aktual</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <div className="w-4 h-0.5 rounded-full" style={{ background: GREEN }}></div>
              <div className="w-4 h-0.5 rounded-full" style={{ background: GREEN }}></div>
              <span style={{ color: theme.textMain }}>Target Minimal (95%)</span>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
