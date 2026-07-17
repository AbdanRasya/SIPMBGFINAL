import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, Edit, Trash2, X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { BLUE, GREEN, RED, ThemeProps } from "@/app/data/constants";
import api from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

export function MenuPage({ theme }: { theme: ThemeProps }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("view");
  const [currentMenu, setCurrentMenu] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "", category: "Makan Siang", date: "", calories: 0, protein: 0, carbs: 0, fat: 0, vitamins: "", minerals: "", description: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/menus');
      setMenus(res.data);
    } catch (err) {
      toast.error("Gagal mengambil data menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleOpenModal = (mode: "add" | "edit" | "view", menu: any = null) => {
    setModalMode(mode);
    if (menu) {
      setCurrentMenu(menu);
      setFormData({
        name: menu.name, category: menu.category, date: menu.date, calories: menu.calories, protein: menu.protein,
        carbs: menu.carbs, fat: menu.fat, vitamins: menu.vitamins, minerals: menu.minerals, description: menu.description
      });
    } else {
      setCurrentMenu(null);
      setFormData({
        name: "", category: "Makan Siang", date: new Date().toISOString().split('T')[0], calories: 0, protein: 0, carbs: 0, fat: 0, vitamins: "", minerals: "", description: ""
      });
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMenu(null);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === "add") {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, String(value)));
        if (imageFile) data.append("image", imageFile);

        await api.post('/menus', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("Menu berhasil ditambahkan");
      } else if (modalMode === "edit" && currentMenu) {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, String(value)));
        if (imageFile) data.append("image", imageFile);

        await api.put(`/menus/${currentMenu.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("Menu berhasil diperbarui");
      }
      fetchMenus();
      handleCloseModal();
    } catch (err) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus menu ini?")) return;
    try {
      await api.delete(`/menus/${id}`);
      toast.success("Menu berhasil dihapus");
      fetchMenus();
    } catch (err) {
      toast.error("Gagal menghapus menu");
    }
  };

  const filteredMenus = menus.filter(m => 
    (m.name || "").toLowerCase().includes(search.toLowerCase()) &&
    (filterCategory ? m.category === filterCategory : true) &&
    (filterDate ? m.date === filterDate : true)
  );

  return (
    <main className="min-h-screen py-24 sm:py-32 animate-in fade-in" style={{ background: theme.bg }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: theme.textMain }}>Menu Makanan</h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>Jelajahi daftar menu gizi seimbang MBG.</p>
          </div>
          {isAdmin && (
            <button onClick={() => handleOpenModal("add")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90" style={{ background: BLUE }}>
              <Plus size={16} /> Tambah Menu
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-8">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama makanan..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: theme.cardBg, borderColor: theme.borderColor, color: theme.textMain }}
            />
          </div>
          <div className="sm:col-span-3 relative">
            <Filter className="absolute left-3 top-3 text-gray-400" size={18} />
            <select 
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: theme.cardBg, borderColor: theme.borderColor, color: theme.textMain }}
            >
              <option value="">Semua Kategori</option>
              <option value="Makan Siang">Makan Siang</option>
              <option value="Sarapan">Sarapan</option>
              <option value="Makan Malam">Makan Malam</option>
              <option value="Snack">Snack</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <input 
              type="date" 
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: theme.cardBg, borderColor: theme.borderColor, color: theme.textMain }}
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
        ) : filteredMenus.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl border-dashed" style={{ borderColor: theme.borderColor, color: theme.textMuted }}>
            <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
            <p>Tidak ada menu yang ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMenus.map(m => (
              <div key={m.id} className="rounded-2xl border overflow-hidden transition-all hover:shadow-lg flex flex-col cursor-pointer" 
                style={{ background: theme.cardBg, borderColor: theme.borderColor }}
                onClick={() => handleOpenModal("view", m)}>
                
                <div className="h-40 relative">
                  <img src={m.image ? `http://localhost:3000${m.image}` : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"} 
                    alt={m.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold text-white shadow" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    {m.date}
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: BLUE }}>{m.category}</div>
                  <h3 className="font-bold text-base mb-2 line-clamp-1" style={{ color: theme.textMain }}>{m.name}</h3>
                  <div className="flex items-center gap-3 text-xs mb-4" style={{ color: theme.textMuted }}>
                    <span>🔥 {m.calories} kkal</span>
                    <span>🥩 {m.protein}g</span>
                  </div>
                  
                  {isAdmin && (
                    <div className="mt-auto pt-4 border-t flex justify-end gap-2" style={{ borderColor: theme.borderColor }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal View / Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col border"
            style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            
            <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
              <h2 className="text-xl font-bold" style={{ color: theme.textMain }}>
                {modalMode === "view" ? "Detail Menu" : modalMode === "add" ? "Tambah Menu" : "Edit Menu"}
              </h2>
              <button onClick={handleCloseModal} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                <X size={20} style={{ color: theme.textMuted }} />
              </button>
            </div>

            <div className="p-5 sm:p-6 flex-1">
              {modalMode === "view" && currentMenu ? (
                <div className="space-y-6">
                  <img src={currentMenu.image ? `http://localhost:3000${currentMenu.image}` : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"} 
                    alt={currentMenu.name} className="w-full h-64 object-cover rounded-xl" />
                  
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: BLUE }}>{currentMenu.category} • {currentMenu.date}</div>
                    <h3 className="text-2xl font-bold mb-3" style={{ color: theme.textMain }}>{currentMenu.name}</h3>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: theme.textMuted }}>{currentMenu.description || "Tidak ada deskripsi."}</p>
                    
                    <h4 className="font-bold text-sm mb-3" style={{ color: theme.textMain }}>Kandungan Gizi</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl border text-center" style={{ background: theme.inputBg, borderColor: theme.borderColor }}>
                        <div className="text-xl mb-1">🔥</div>
                        <div className="text-lg font-bold" style={{ color: theme.textMain }}>{currentMenu.calories}</div>
                        <div className="text-xs" style={{ color: theme.textMuted }}>Kalori (kkal)</div>
                      </div>
                      <div className="p-3 rounded-xl border text-center" style={{ background: theme.inputBg, borderColor: theme.borderColor }}>
                        <div className="text-xl mb-1">🥩</div>
                        <div className="text-lg font-bold" style={{ color: theme.textMain }}>{currentMenu.protein}</div>
                        <div className="text-xs" style={{ color: theme.textMuted }}>Protein (g)</div>
                      </div>
                      <div className="p-3 rounded-xl border text-center" style={{ background: theme.inputBg, borderColor: theme.borderColor }}>
                        <div className="text-xl mb-1">🍚</div>
                        <div className="text-lg font-bold" style={{ color: theme.textMain }}>{currentMenu.carbs}</div>
                        <div className="text-xs" style={{ color: theme.textMuted }}>Karbo (g)</div>
                      </div>
                      <div className="p-3 rounded-xl border text-center" style={{ background: theme.inputBg, borderColor: theme.borderColor }}>
                        <div className="text-xl mb-1">🫒</div>
                        <div className="text-lg font-bold" style={{ color: theme.textMain }}>{currentMenu.fat}</div>
                        <div className="text-xs" style={{ color: theme.textMuted }}>Lemak (g)</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-3 rounded-xl border" style={{ background: theme.inputBg, borderColor: theme.borderColor }}>
                        <span className="text-xs font-bold block mb-1" style={{ color: theme.textMuted }}>Vitamin</span>
                        <span className="text-sm font-semibold" style={{ color: theme.textMain }}>{currentMenu.vitamins || "-"}</span>
                      </div>
                      <div className="p-3 rounded-xl border" style={{ background: theme.inputBg, borderColor: theme.borderColor }}>
                        <span className="text-xs font-bold block mb-1" style={{ color: theme.textMuted }}>Mineral</span>
                        <span className="text-sm font-semibold" style={{ color: theme.textMain }}>{currentMenu.minerals || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textMain }}>Nama Menu</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textMain }}>Tanggal</label>
                      <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} 
                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textMain }}>Kategori</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} 
                      className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }}>
                      <option>Makan Siang</option>
                      <option>Sarapan</option>
                      <option>Snack Tambahan</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textMain }}>Kalori (kkal)</label>
                      <input required type="number" min="0" value={formData.calories} onChange={e => setFormData({...formData, calories: Number(e.target.value)})} 
                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textMain }}>Protein (g)</label>
                      <input required type="number" step="0.1" min="0" value={formData.protein} onChange={e => setFormData({...formData, protein: Number(e.target.value)})} 
                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textMain }}>Karbo (g)</label>
                      <input required type="number" step="0.1" min="0" value={formData.carbs} onChange={e => setFormData({...formData, carbs: Number(e.target.value)})} 
                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textMain }}>Lemak (g)</label>
                      <input required type="number" step="0.1" min="0" value={formData.fat} onChange={e => setFormData({...formData, fat: Number(e.target.value)})} 
                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textMain }}>Vitamin</label>
                      <input type="text" placeholder="Vit A, B, C" value={formData.vitamins} onChange={e => setFormData({...formData, vitamins: e.target.value})} 
                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textMain }}>Mineral</label>
                      <input type="text" placeholder="Zat Besi, Kalsium" value={formData.minerals} onChange={e => setFormData({...formData, minerals: e.target.value})} 
                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textMain }}>Deskripsi</label>
                    <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
                      className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textMain }}>Foto Menu</label>
                    <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors hover:border-blue-500"
                      style={{ borderColor: theme.borderColor, background: theme.inputBg }}>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {
                        if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                      }} />
                      <Upload size={24} style={{ color: BLUE }} className="mb-2" />
                      <span className="text-sm font-medium" style={{ color: theme.textMain }}>
                        {imageFile ? imageFile.name : "Klik untuk upload foto"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-end gap-3" style={{ borderColor: theme.borderColor }}>
                    <button type="button" onClick={handleCloseModal} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ color: theme.textMain, background: theme.inputBg }}>
                      Batal
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white shadow-md disabled:opacity-70 hover:opacity-90" style={{ background: BLUE }}>
                      {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                      Simpan Menu
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
