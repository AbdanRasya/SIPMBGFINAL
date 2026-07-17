import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, X, Loader2 } from "lucide-react";
import { BLUE, GREEN, SLATE, ThemeProps } from "@/app/data/constants";
import api from "@/lib/api";
import { toast } from "sonner";

const STATUS_OPTIONS = ["Beroperasi", "Belum Beroperasi", "Selesai"];
const EMPTY_FORM = { location: "", address: "", lat: "", lng: "", date: new Date().toISOString().split("T")[0], status: "Beroperasi", packages: "", vehicles_active: "" };

export function AdminJadwalPage({ theme }: { theme: ThemeProps }) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchSchedules = async () => {
    setLoading(true);
    try { const r = await api.get('/schedules'); setSchedules(r.data); }
    catch { toast.error("Gagal memuat jadwal"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSchedules(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setModalMode("add"); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (s: any) => {
    setForm({ location: s.location, address: s.address, lat: String(s.lat), lng: String(s.lng), date: s.date, status: s.status, packages: String(s.packages), vehicles_active: String(s.vehicles_active) });
    setModalMode("edit"); setEditingId(s.id); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      if (modalMode === "add") { await api.post('/schedules', form); toast.success("Jadwal ditambahkan!"); }
      else { await api.put("/schedules/" + editingId, form); toast.success("Jadwal diperbarui!"); }
      fetchSchedules(); setIsModalOpen(false);
    } catch { toast.error("Gagal menyimpan jadwal"); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus jadwal ini?")) return;
    try { await api.delete("/schedules/" + id); toast.success("Jadwal dihapus"); fetchSchedules(); }
    catch { toast.error("Gagal menghapus jadwal"); }
  };

  const statusColor = (s: string) => s === "Beroperasi" ? GREEN : s === "Selesai" ? BLUE : SLATE;
  const FIELDS = [
    { label: "Nama Lokasi", key: "location", type: "text", col: 2, placeholder: "SPPG Jakarta Selatan" },
    { label: "Alamat", key: "address", type: "text", col: 2, placeholder: "Jl. Contoh No. 1" },
    { label: "Latitude", key: "lat", type: "number", col: 1, placeholder: "-6.2" },
    { label: "Longitude", key: "lng", type: "number", col: 1, placeholder: "106.8" },
    { label: "Tanggal", key: "date", type: "date", col: 1, placeholder: "" },
    { label: "Jumlah Paket", key: "packages", type: "number", col: 1, placeholder: "500" },
    { label: "Kendaraan Aktif", key: "vehicles_active", type: "number", col: 1, placeholder: "5" },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: theme.textMain }}>Kelola Jadwal SPPG</h2>
          <p className="text-sm" style={{ color: theme.textMuted }}>Total {schedules.length} jadwal distribusi.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity" style={{ background: BLUE }}>
          <Plus size={16} /> Tambah Jadwal
        </button>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="border-b text-left" style={{ borderColor: theme.borderColor, background: theme.dark ? "rgba(255,255,255,0.02)" : "#F8FAFC" }}>
              <tr>
                {["Lokasi", "Tanggal", "Status", "Paket", "Kendaraan", "Aksi"].map(h => (
                  <th key={h} className={"px-5 py-3 font-semibold" + (h === "Aksi" ? " text-right" : "")} style={{ color: theme.textMain }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: theme.borderColor }}>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="animate-spin inline-block" style={{ color: BLUE }} /></td></tr>
              ) : schedules.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center" style={{ color: theme.textMuted }}>Belum ada jadwal.</td></tr>
              ) : schedules.map(s => (
                <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium" style={{ color: theme.textMain }}>{s.location}</div>
                    <div className="text-xs" style={{ color: theme.textMuted }}>{s.address}</div>
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: theme.textMuted }}>{s.date}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: statusColor(s.status) + "18", color: statusColor(s.status) }}>{s.status}</span>
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: theme.textMain }}>{s.packages}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: theme.textMain }}>{s.vehicles_active}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="rounded-2xl shadow-2xl w-full max-w-lg border max-h-[90vh] flex flex-col" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ borderColor: theme.borderColor }}>
              <h3 className="font-bold" style={{ color: theme.textMain }}>{modalMode === "add" ? "Tambah" : "Edit"} Jadwal SPPG</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-black/10 transition-colors"><X size={16} style={{ color: theme.textMuted }} /></button>
            </div>
            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} id="jadwal-form" className="p-5 grid grid-cols-2 gap-4">
                {FIELDS.map(f => (
                  <div key={f.key} className={f.col === 2 ? "col-span-2" : ""}>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>{f.label}</label>
                    <input required type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }}>
                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </form>
            </div>
            <div className="p-4 border-t flex justify-end gap-3 flex-shrink-0" style={{ borderColor: theme.borderColor }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ color: theme.textMain, background: theme.inputBg }}>Batal</button>
              <button form="jadwal-form" type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-70 flex items-center gap-2" style={{ background: BLUE }}>
                {isSubmitting && <Loader2 size={14} className="animate-spin" />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}