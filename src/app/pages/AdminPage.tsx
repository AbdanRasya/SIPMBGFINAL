import { useState, useEffect } from "react";
import { Plus, Search, Trash2, X, Loader2, Users, Database, LayoutDashboard, Settings } from "lucide-react";
import { BLUE, GREEN, ThemeProps } from "@/app/data/constants";
import api from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import { Navigate, useNavigate } from "react-router";

export function AdminPage({ theme }: { theme: ThemeProps }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (user?.role !== "admin") return <Navigate to="/" />;

  const [activeTab, setActiveTab] = useState("users");
  
  // Data State
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "user"
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      toast.error("Gagal mengambil data pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUsers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/users', formData);
      toast.success("Pengguna berhasil ditambahkan");
      fetchUsers();
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "user" });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal menambahkan pengguna");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus pengguna ini?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("Pengguna berhasil dihapus");
      fetchUsers();
    } catch (err) {
      toast.error("Gagal menghapus pengguna");
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen py-24 sm:py-32 animate-in fade-in" style={{ background: theme.bg }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-28 rounded-2xl border p-4 shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <h2 className="font-bold mb-4 px-2" style={{ color: theme.textMain }}>Menu Data Master</h2>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                style={{ color: activeTab === 'dashboard' ? BLUE : theme.textMain }}>
                <LayoutDashboard size={18} /> Ringkasan
              </button>
              <button 
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                style={{ color: activeTab === 'users' ? BLUE : theme.textMain }}>
                <Users size={18} /> Kelola Pengguna
              </button>
              <button 
                onClick={() => navigate('/menus')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800`}
                style={{ color: theme.textMain }}>
                <Database size={18} /> Kelola Menu Makanan
              </button>
              <button 
                onClick={() => navigate('/lacak')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800`}
                style={{ color: theme.textMain }}>
                <Database size={18} /> Kelola Jadwal SPPG
              </button>
              <button 
                onClick={() => navigate('/feedback')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800`}
                style={{ color: theme.textMain }}>
                <Database size={18} /> Kelola Pengaduan
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="rounded-2xl border p-6 sm:p-8" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.textMain }}>Ringkasan Sistem</h1>
              <p className="text-sm mb-6" style={{ color: theme.textMuted }}>Pilih menu di samping untuk mengelola seluruh data aplikasi SIPMBG secara terpusat.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 border rounded-xl" style={{ borderColor: theme.borderColor }}>
                  <h3 className="font-semibold text-lg mb-1" style={{ color: theme.textMain }}>Total Pengguna</h3>
                  <div className="text-3xl font-black" style={{ color: BLUE }}>{users.length}</div>
                </div>
                <div className="p-5 border rounded-xl" style={{ borderColor: theme.borderColor }}>
                  <h3 className="font-semibold text-lg mb-1" style={{ color: theme.textMain }}>Status Server</h3>
                  <div className="text-xl font-bold flex items-center gap-2" style={{ color: GREEN }}>
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div> Online
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1" style={{ color: theme.textMain }}>Kelola Pengguna</h1>
                  <p className="text-sm" style={{ color: theme.textMuted }}>Manajemen data admin dan pengguna sistem.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 transition-opacity" style={{ background: BLUE }}>
                  <Plus size={16} /> Tambah
                </button>
              </div>

              <div className="mb-4 relative max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari pengguna..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: theme.cardBg, borderColor: theme.borderColor, color: theme.textMain }}
                />
              </div>

              <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="border-b" style={{ borderColor: theme.borderColor, background: theme.dark ? "rgba(255,255,255,0.02)" : "#F8FAFC" }}>
                      <tr>
                        <th className="px-5 py-3 font-semibold" style={{ color: theme.textMain }}>Nama</th>
                        <th className="px-5 py-3 font-semibold" style={{ color: theme.textMain }}>Email</th>
                        <th className="px-5 py-3 font-semibold" style={{ color: theme.textMain }}>Peran</th>
                        <th className="px-5 py-3 font-semibold text-right" style={{ color: theme.textMain }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: theme.borderColor }}>
                      {loading ? (
                        <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin inline-block text-blue-500" /></td></tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center opacity-60" style={{ color: theme.textMuted }}>Tidak ada pengguna ditemukan.</td></tr>
                      ) : (
                        filteredUsers.map(u => (
                          <tr key={u.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                            <td className="px-5 py-3 font-medium" style={{ color: theme.textMain }}>{u.name}</td>
                            <td className="px-5 py-3" style={{ color: theme.textMuted }}>{u.email}</td>
                            <td className="px-5 py-3">
                              <span className="px-2 py-0.5 rounded text-xs font-bold" 
                                style={{ background: u.role === "admin" ? "rgba(37,99,235,0.1)" : "rgba(22,163,74,0.1)", color: u.role === "admin" ? BLUE : GREEN }}>
                                {u.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              {u.email !== "admin@kemdikbud.go.id" && (
                                <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="rounded-2xl shadow-2xl w-full max-w-md flex flex-col border" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.borderColor }}>
              <h2 className="font-bold text-lg" style={{ color: theme.textMain }}>Tambah Pengguna</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                <X size={18} style={{ color: theme.textMuted }} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Nama Lengkap</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Peran (Role)</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-4 mt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold transition-colors" style={{ color: theme.textMain, background: theme.inputBg }}>Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md disabled:opacity-70 transition-opacity hover:opacity-90" style={{ background: BLUE }}>
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
