import { useState, useEffect } from "react";
import { Plus, Search, Trash2, X, Loader2, Upload, Edit } from "lucide-react";
import { BLUE, GREEN, ThemeProps } from "@/app/data/constants";
import api from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES = ["Makan Siang", "Sarapan", "Makan Malam", "Snack", "Lauk Pauk", "Sayuran", "Buah", "Minuman"];

export function AdminMenusPage({ theme }: { theme: ThemeProps }) {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  
  const [form, setForm] = useState({ name: "", category: "Makan Siang", date: new Date().toISOString().split("T")[0], calories: "", protein: "", carbs: "", fat: "", vitamins: "", minerals: "", description: "" });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchMenus = async () => {
    setLoading(true);
    try { const r = await api.get('/menus'); setMenus(r.data); }
    catch { toast.error("Gagal memuat menu"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMenus(); }, []);

  const handleOpenAdd = () => {
    setEditingMenu(null);
    setForm({ name: "", category: "Makan Siang", date: new Date().toISOString().split("T")[0], calories: "", protein: "", carbs: "", fat: "", vitamins: "", minerals: "", description: "" });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: any) => {
    setEditingMenu(m);
    setForm({
      name: m.name,
      category: m.category,
      date: m.date,
      calories: String(m.calories || ""),
      protein: String(m.protein || ""),
      carbs: String(m.carbs || ""),
      fat: String(m.fat || ""),
      vitamins: m.vitamins || "",
      minerals: m.minerals || "",
      description: m.description || ""
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);

      if (editingMenu) {
        await api.put(`/menus/${editingMenu.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("Menu berhasil diperbarui!");
      } else {
        await api.post('/menus', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("Menu berhasil ditambahkan!");
      }

      fetchMenus();
      setIsModalOpen(false);
      setImageFile(null);
    } catch { toast.error(editingMenu ? "Gagal memperbarui menu" : "Gagal menambahkan menu"); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus menu ini?")) return;
    try { await api.delete(`/menus/${id}`); toast.success("Menu dihapus"); fetchMenus(); }
    catch { toast.error("Gagal menghapus menu"); }
  };

  const filtered = menus.filter(m => (m.name || "").toLowerCase().includes(search.toLowerCase()) || (m.category || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: theme.textMain }}>Kelola Menu Makanan</h2>
          <p className="text-sm" style={{ color: theme.textMuted }}>Total {menus.length} menu tersedia.</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity" style={{ background: BLUE }}>
          <Plus size={16} /> Tambah Menu
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input type="text" placeholder="Cari menu..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: theme.cardBg, borderColor: theme.borderColor, color: theme.textMain }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex justify-center py-12"><Loader2 className="animate-spin" style={{ color: BLUE }} size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 text-center py-12" style={{ color: theme.textMuted }}>Belum ada menu. Klik tombol Tambah untuk mulai.</div>
        ) : filtered.map(m => (
          <div key={m.id} className="rounded-2xl border overflow-hidden" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            {m.image ? (
              <img src={`http://localhost:3000${m.image}`} alt={m.name} className="w-full h-36 object-cover" />
            ) : (
              <div className="w-full h-36 flex items-center justify-center text-4xl" style={{ background: theme.dark ? "#1E293B" : "#F1F5F9" }}>🍽️</div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: theme.textMain }}>{m.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded mt-1 inline-block" style={{ background: `${BLUE}18`, color: BLUE }}>{m.category}</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleOpenEdit(m)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors" title="Edit Menu"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Hapus Menu"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-center">
                <div className="p-2 rounded-lg" style={{ background: theme.dark ? "#0F172A" : "#F8FAFC" }}>
                  <div className="font-bold" style={{ color: theme.textMain }}>{m.calories}</div>
                  <div style={{ color: theme.textMuted }}>kkal</div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: theme.dark ? "#0F172A" : "#F8FAFC" }}>
                  <div className="font-bold" style={{ color: theme.textMain }}>{m.protein}g</div>
                  <div style={{ color: theme.textMuted }}>protein</div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: theme.dark ? "#0F172A" : "#F8FAFC" }}>
                  <div className="font-bold" style={{ color: theme.textMain }}>{m.date}</div>
                  <div style={{ color: theme.textMuted }}>tanggal</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="rounded-2xl shadow-2xl w-full max-w-lg border max-h-[90vh] flex flex-col" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ borderColor: theme.borderColor }}>
              <h3 className="font-bold" style={{ color: theme.textMain }}>{editingMenu ? "Ubah Menu Makanan" : "Tambah Menu Makanan"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-black/10 transition-colors"><X size={16} style={{ color: theme.textMuted }} /></button>
            </div>
            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} id="menu-form" className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Nama Menu</label>
                    <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nasi Ayam Sayur..."
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Kategori</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Tanggal Saji</label>
                    <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Kalori (kkal)</label>
                    <input type="number" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} placeholder="450"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Protein (g)</label>
                    <input type="number" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} placeholder="25"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Karbohidrat (g)</label>
                    <input type="number" value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} placeholder="55"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Lemak (g)</label>
                    <input type="number" value={form.fat} onChange={e => setForm({ ...form, fat: e.target.value })} placeholder="12"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Vitamin</label>
                    <input type="text" value={form.vitamins} onChange={e => setForm({ ...form, vitamins: e.target.value })} placeholder="Vit A, B, C..."
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Mineral</label>
                    <input type="text" value={form.minerals} onChange={e => setForm({ ...form, minerals: e.target.value })} placeholder="Zat Besi, Kalsium..."
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Deskripsi</label>
                    <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat menu..."
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Foto Menu</label>
                    <label className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ borderColor: theme.borderColor, borderStyle: "dashed" }}>
                      <Upload size={18} style={{ color: theme.textMuted }} />
                      <span className="text-sm" style={{ color: theme.textMuted }}>{imageFile ? imageFile.name : "Pilih foto menu..."}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-4 border-t flex justify-end gap-3 flex-shrink-0" style={{ borderColor: theme.borderColor }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ color: theme.textMain, background: theme.inputBg }}>Batal</button>
              <button form="menu-form" type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-70 flex items-center gap-2" style={{ background: BLUE }}>
                {isSubmitting && <Loader2 size={14} className="animate-spin" />} {editingMenu ? "Simpan Perubahan" : "Tambah Menu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
