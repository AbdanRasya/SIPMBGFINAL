import { useState, useEffect, useMemo } from "react";
import { Search, Download, Loader2 } from "lucide-react";
import { BLUE, GREEN, RED, ThemeProps } from "@/app/data/constants";
import api from "@/lib/api";

export function MonitoringSection({ theme }: { theme: ThemeProps }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    api.get('/schedules')
      .then(r => setSchedules(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => {
    return schedules.filter(item =>
      item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [schedules, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const statusBg = (status: string) =>
    status === "Beroperasi" ? (theme.dark ? "rgba(22,163,74,0.15)" : "#DCFCE7")
    : status === "Selesai" ? (theme.dark ? "rgba(37,99,235,0.15)" : "#DBEAFE")
    : (theme.dark ? "rgba(220,38,38,0.15)" : "#FEE2E2");

  const statusColor = (status: string) =>
    status === "Beroperasi" ? GREEN : status === "Selesai" ? BLUE : RED;

  return (
    <section id="monitoring" className="py-16 sm:py-24" style={{ background: theme.dark ? "#0B1120" : "#F8FAFC" }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4" style={{ background: theme.dark ? "rgba(37,99,235,0.15)" : "#EFF6FF", color: BLUE }}>
              Monitoring Real-time
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: theme.textMain }}>Dashboard Monitoring Nasional</h2>
            <p className="text-sm sm:text-base" style={{ color: theme.textMuted }}>Pantau status distribusi, target porsi, dan lokasi SPPG aktif dari database langsung.</p>
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-3 pointer-events-none" size={16} style={{ color: theme.textMuted }} />
              <input type="text" placeholder="Cari lokasi..." value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ background: theme.cardBg, borderColor: theme.borderColor, color: theme.textMain }} />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: BLUE }}>
              <Download size={16} /><span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap min-w-[700px]">
              <thead>
                <tr style={{ background: theme.dark ? "#0F172A" : "#F8FAFC", borderBottom: `1px solid ${theme.borderColor}` }}>
                  {["Lokasi SPPG","Alamat","Tanggal","Target Porsi","Kendaraan","Status"].map(h => (
                    <th key={h} className="px-5 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="animate-spin inline-block" style={{ color: BLUE }} size={24} /></td></tr>
                ) : paginatedData.length > 0 ? paginatedData.map((row, i) => (
                  <tr key={i} className="border-b transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30" style={{ borderColor: theme.borderColor }}>
                    <td className="px-5 py-4 font-bold" style={{ color: theme.textMain }}>{row.location}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: theme.textMuted }}><div className="truncate max-w-[180px]">{row.address}</div></td>
                    <td className="px-5 py-4 text-sm" style={{ color: theme.textMuted }}>{row.date}</td>
                    <td className="px-5 py-4 font-semibold" style={{ color: theme.textMain }}>{(row.packages||0).toLocaleString("id-ID")} porsi</td>
                    <td className="px-5 py-4 text-sm text-center" style={{ color: theme.textMain }}>{row.vehicles_active}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase" style={{ background: statusBg(row.status), color: statusColor(row.status), border: `1px solid ${statusColor(row.status)}40` }}>{row.status}</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="py-12 text-center text-sm" style={{ color: theme.textMuted }}>
                    {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Belum ada jadwal. Tambahkan dari panel admin."}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          {!loading && filteredData.length > itemsPerPage && (
            <div className="px-5 py-4 flex items-center justify-between border-t" style={{ borderColor: theme.borderColor }}>
              <span className="text-xs" style={{ color: theme.textMuted }}>
                {(currentPage-1)*itemsPerPage+1}–{Math.min(currentPage*itemsPerPage,filteredData.length)} dari {filteredData.length}
              </span>
              <div className="flex gap-1.5">
                <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1}
                  className="px-3 py-1 rounded-lg text-xs font-semibold border disabled:opacity-50"
                  style={{ color: theme.textMain, borderColor: theme.borderColor, background: theme.cardBg }}>Prev</button>
                {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setCurrentPage(p)} className="w-8 h-8 rounded-lg text-xs font-bold"
                    style={{ background: currentPage===p ? BLUE : "transparent", color: currentPage===p ? "white" : theme.textMuted }}>{p}</button>
                ))}
                <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages}
                  className="px-3 py-1 rounded-lg text-xs font-semibold border disabled:opacity-50"
                  style={{ color: theme.textMain, borderColor: theme.borderColor, background: theme.cardBg }}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}