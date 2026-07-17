import { useEffect } from "react";
import { ThemeProps, BLUE, GREEN, pieData, barData, lineData } from "@/app/data/constants";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { TrendingUp, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from "recharts";

export function BudgetPage({ theme }: { theme: ThemeProps }) {
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const tooltipStyle = {
    background: theme.cardBg, border: `1px solid ${theme.borderColor}`,
    borderRadius: 12, color: theme.textMain, fontSize: 12, boxShadow: theme.cardShadow
  };

  const detailRows = [
    { komponen: "Bahan Makanan Pokok", alokasi: "35.2", realisasi: "12.5", persentase: "35.5%" },
    { komponen: "Lauk Pauk Protein", alokasi: "40.5", realisasi: "15.2", persentase: "37.5%" },
    { komponen: "Susu & Minuman Bergizi", alokasi: "20.1", realisasi: "6.8", persentase: "33.8%" },
    { komponen: "Logistik & Distribusi", alokasi: "15.0", realisasi: "4.5", persentase: "30.0%" },
    { komponen: "Operasional & Edukasi", alokasi: "5.2", realisasi: "1.1", persentase: "21.1%" },
  ];

  return (
    <main className="min-h-screen py-24 sm:py-32 animate-in fade-in" style={{ background: theme.bg }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium mb-8 hover:opacity-70 transition-opacity" style={{ color: theme.textMuted }}>
          <ArrowLeft size={16} /> Kembali
        </button>

        <SectionHeader
          badge="💰 Transparansi"
          title="Transparansi Anggaran & Performa"
          subtitle="Data pengelolaan anggaran program MBG yang akuntabel dan dapat diakses oleh seluruh masyarakat untuk pengawasan bersama."
          dark={theme.dark}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-10">
          <div className="rounded-2xl border p-5 sm:p-7 flex flex-col shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <h3 className="font-bold text-lg mb-1" style={{ color: theme.textMain }}>Alokasi Anggaran</h3>
            <p className="text-xs sm:text-sm mb-6" style={{ color: theme.textMuted }}>Proporsi pengeluaran per komponen</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, "Porsi"]} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4 pt-4 border-t" style={{ borderColor: theme.borderColor }}>
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-1.5 rounded-lg">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: item.color }} /><span style={{ color: theme.textMuted }}>{item.name}</span></div>
                  <span className="font-bold" style={{ color: theme.textMain }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-5 sm:p-7 flex flex-col shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <h3 className="font-bold text-lg mb-1" style={{ color: theme.textMain }}>Realisasi Bulanan</h3>
            <p className="text-xs sm:text-sm mb-4" style={{ color: theme.textMuted }}>Anggaran vs Realisasi (Triliun Rp)</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} barSize={12} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.dark ? "#1E293B" : "#F1F5F9"} />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: theme.textMuted }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 11, fill: theme.textMuted }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="anggaran" fill={`${BLUE}40`} radius={[4, 4, 0, 0]} name="Anggaran (T)" />
                <Bar dataKey="realisasi" fill={BLUE} radius={[4, 4, 0, 0]} name="Realisasi (T)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border p-5 sm:p-7 flex flex-col shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <h3 className="font-bold text-lg mb-1" style={{ color: theme.textMain }}>Tren Kualitas Program</h3>
            <p className="text-xs sm:text-sm mb-4" style={{ color: theme.textMuted }}>Rata-rata skor kepatuhan gizi nasional</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.dark ? "#1E293B" : "#F1F5F9"} />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: theme.textMuted }} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: theme.textMuted }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="nilai" name="Skor Gizi" stroke={GREEN} strokeWidth={3}
                  dot={{ r: 4, fill: theme.cardBg, stroke: GREEN, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: GREEN, stroke: theme.cardBg, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: theme.borderColor }}>
              <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg" style={{ background: theme.dark ? "rgba(22,163,74,0.1)" : "#F0FDF4", color: GREEN }}>
                <TrendingUp size={16} /><span className="font-bold">+11 poin (YTD)</span>
              </div>
              <span className="text-xs font-medium" style={{ color: theme.textMuted }}>Target 2026: 95</span>
            </div>
          </div>
        </div>

        {/* Full Detail Table */}
        <div className="rounded-2xl border p-5 sm:p-7 shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
          <h3 className="font-bold text-lg mb-4" style={{ color: theme.textMain }}>Rincian Penggunaan Anggaran</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b" style={{ borderColor: theme.borderColor, background: theme.dark ? "rgba(255,255,255,0.02)" : "#F8FAFC" }}>
                <tr>
                  <th className="px-4 py-4 font-semibold" style={{ color: theme.textMain }}>Komponen</th>
                  <th className="px-4 py-4 font-semibold text-right" style={{ color: theme.textMain }}>Alokasi (T Rp)</th>
                  <th className="px-4 py-4 font-semibold text-right" style={{ color: theme.textMain }}>Realisasi (T Rp)</th>
                  <th className="px-4 py-4 font-semibold text-center" style={{ color: theme.textMain }}>% Realisasi</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: theme.borderColor }}>
                {detailRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4 font-medium" style={{ color: theme.textMain }}>{r.komponen}</td>
                    <td className="px-4 py-4 text-right" style={{ color: theme.textMuted }}>{r.alokasi}</td>
                    <td className="px-4 py-4 text-right font-semibold" style={{ color: BLUE }}>{r.realisasi}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${BLUE}15`, color: BLUE }}>{r.persentase}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
