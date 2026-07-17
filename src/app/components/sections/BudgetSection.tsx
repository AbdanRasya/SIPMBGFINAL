import { TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { BLUE, GREEN, pieData, barData, lineData, ThemeProps } from "@/app/data/constants";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from "recharts";

export function BudgetSection({ theme }: { theme: ThemeProps }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Common recharts tooltip style
  const tooltipStyle = { 
    background: theme.cardBg, 
    border: `1px solid ${theme.borderColor}`, 
    borderRadius: 12, 
    color: theme.textMain, 
    fontSize: 12,
    boxShadow: theme.cardShadow
  };

  return (
    <section id="budget" className="max-w-screen-xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <SectionHeader
        badge="💰 Transparansi"
        title="Transparansi Anggaran & Performa"
        subtitle="Data pengelolaan anggaran program MBG yang akuntabel dan dapat diakses oleh seluruh masyarakat untuk pengawasan bersama."
        dark={theme.dark}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Card 1 - Pie chart */}
        <div className="rounded-2xl border p-5 sm:p-7 flex flex-col shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-1" style={{ color: theme.textMain }}>Alokasi Anggaran</h3>
            <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>Proporsi pengeluaran per komponen gizi</p>
          </div>
          
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [`${val}%`, "Porsi"]} contentStyle={tooltipStyle} itemStyle={{ fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2.5 mt-4 pt-4 border-t" style={{ borderColor: theme.borderColor }}>
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs sm:text-sm p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ background: item.color }}></div>
                  <span className="font-medium" style={{ color: theme.textMuted }}>{item.name}</span>
                </div>
                <span className="font-bold" style={{ color: theme.textMain }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 - Bar chart */}
        <div className="rounded-2xl border p-5 sm:p-7 flex flex-col shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg mb-1" style={{ color: theme.textMain }}>Realisasi Bulanan</h3>
              <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>Anggaran vs Realisasi (Triliun Rp)</p>
            </div>
          </div>
          
          <div className="flex-1 mt-auto">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} barSize={12} barCategoryGap="30%" margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.dark ? "#1E293B" : "#F1F5F9"} />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: theme.textMuted }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 11, fill: theme.textMuted }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                <Bar dataKey="anggaran" fill={`${BLUE}40`} radius={[4, 4, 0, 0]} name="Anggaran (T)" />
                <Bar dataKey="realisasi" fill={BLUE} radius={[4, 4, 0, 0]} name="Realisasi (T)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t" style={{ borderColor: theme.borderColor }}>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-blue-500/40"></div>
              <span style={{ color: theme.textMuted }}>Anggaran</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-blue-600"></div>
              <span style={{ color: theme.textMuted }}>Realisasi</span>
            </div>
          </div>
        </div>

        {/* Card 3 - Line chart */}
        <div className="rounded-2xl border p-5 sm:p-7 flex flex-col shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-1" style={{ color: theme.textMain }}>Tren Kualitas Program</h3>
            <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>Rata-rata skor kepatuhan gizi nasional</p>
          </div>
          
          <div className="flex-1 mt-auto">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.dark ? "#1E293B" : "#F1F5F9"} />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: theme.textMuted }} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: theme.textMuted }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line 
                  type="monotone" 
                  dataKey="nilai" 
                  name="Skor Gizi"
                  stroke={GREEN} 
                  strokeWidth={3}
                  dot={{ r: 4, fill: theme.cardBg, stroke: GREEN, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: GREEN, stroke: theme.cardBg, strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: theme.borderColor }}>
            <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg" style={{ background: theme.dark ? "rgba(22,163,74,0.1)" : "#F0FDF4", color: GREEN }}>
              <TrendingUp size={16} />
              <span className="font-bold">+11 poin (YTD)</span>
            </div>
            <span className="text-xs font-medium" style={{ color: theme.textMuted }}>Target 2026: 95</span>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <div className="mt-10 flex justify-center">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-6 py-3 rounded-full border text-sm font-semibold transition-all hover:opacity-80 shadow-sm"
          style={{ background: theme.cardBg, borderColor: theme.borderColor, color: BLUE }}
        >
          {isExpanded ? "Tutup Rincian Transparansi" : "Buka Rincian Transparansi Anggaran"}
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="rounded-2xl border p-5 sm:p-7 shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: theme.textMain }}>Rincian Laporan Penggunaan Anggaran</h3>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                 <thead className="border-b" style={{ borderColor: theme.borderColor, background: theme.dark ? "rgba(255,255,255,0.02)" : "#F8FAFC" }}>
                   <tr>
                     <th className="px-4 py-4 font-semibold" style={{ color: theme.textMain }}>Komponen</th>
                     <th className="px-4 py-4 font-semibold text-right" style={{ color: theme.textMain }}>Alokasi (Triliun Rp)</th>
                     <th className="px-4 py-4 font-semibold text-right" style={{ color: theme.textMain }}>Realisasi (Triliun Rp)</th>
                     <th className="px-4 py-4 font-semibold text-center" style={{ color: theme.textMain }}>Persentase Realisasi</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y" style={{ borderColor: theme.borderColor }}>
                   {[
                     { komponen: "Bahan Makanan Pokok", alokasi: "35.2", realisasi: "12.5", persentase: "35.5%" },
                     { komponen: "Lauk Pauk Protein", alokasi: "40.5", realisasi: "15.2", persentase: "37.5%" },
                     { komponen: "Susu & Minuman Bergizi", alokasi: "20.1", realisasi: "6.8", persentase: "33.8%" },
                     { komponen: "Logistik & Distribusi", alokasi: "15.0", realisasi: "4.5", persentase: "30.0%" },
                     { komponen: "Operasional & Edukasi", alokasi: "5.2", realisasi: "1.1", persentase: "21.1%" },
                   ].map((row, idx) => (
                     <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                       <td className="px-4 py-4 font-medium" style={{ color: theme.textMain }}>{row.komponen}</td>
                       <td className="px-4 py-4 text-right" style={{ color: theme.textMuted }}>{row.alokasi}</td>
                       <td className="px-4 py-4 text-right font-semibold" style={{ color: BLUE }}>{row.realisasi}</td>
                       <td className="px-4 py-4 text-center">
                         <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: theme.dark ? "rgba(37,99,235,0.1)" : "#EFF6FF", color: BLUE }}>
                           {row.persentase}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
