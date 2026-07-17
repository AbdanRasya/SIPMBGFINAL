import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Pencil, X, Loader2 } from "lucide-react";
import { BLUE, GREEN, ThemeProps } from "@/app/data/constants";
import api from "@/lib/api";
import { toast } from "sonner";

const EMPTY_FORM = { name: "", email: "", password: "", role: "user" };

export function AdminUsersPage({ theme }: { theme: ThemeProps }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchUsers = async () => {
    setLoading(true);
    try { const r = await api.get('/users'); setUsers(r.data); }
    catch { toast.error("Gagal memuat data pengguna"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setModalMode("add"); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (u: any) => {
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setModalMode("edit"); setEditingId(u.id); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      if (modalMode === "add") {
        await api.post('/users', form);
        toast.success("Pengguna berhasil ditambahkan");
      } else {
        await api.put("/users/" + editingId, form);
        toast.success("Pengguna berhasil diperbarui");
      }
      fetchUsers(); setIsModalOpen(false); setForm(EMPTY_FORM);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Gagal menyimpan pengguna");
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number, email: string) => {
    if (email === "admin@kemdikbud.go.id") return toast.error("Tidak bisa menghapus akun admin utama.");
    if (!confirm("Hapus pengguna ini?")) return;
    try { await api.delete("/users/" + id); toast.success("Pengguna dihapus"); fetchUsers(); }
    catch { toast.error("Gagal menghapus pengguna"); }
  };

  const filtered = users.filter(u => (u.name || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: theme.textMain }}>Kelola Pengguna</h2>
          <p className="text-sm" style={{ color: theme.textMuted }}>Total {users.length} pengguna terdaftar.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity" style={{ background: BLUE }}>
          <Plus size={16} /> Tambah Pengguna
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input type="text" placeholder="Cari pengguna..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: theme.cardBg, borderColor: theme.borderColor, color: theme.textMain }} />
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="border-b text-left" style={{ borderColor: theme.borderColor, background: theme.dark ? "rgba(255,255,255,0.02)" : "#F8FAFC" }}>
              <tr>
                {["Nama", "Email", "Role", "Bergabung", "Aksi"].map(h => (
                  <th key={h} className={"px-5 py-3 font-semibold" + (h === "Aksi" ? " text-right" : "")} style={{ color: theme.textMain }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: theme.borderColor }}>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin inline-block" style={{ color: BLUE }} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center" style={{ color: theme.textMuted }}>Tidak ada data.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 font-medium" style={{ color: theme.textMain }}>{u.name}</td>
                  <td className="px-5 py-3" style={{ color: theme.textMuted }}>{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{ background: u.role === "admin" ? BLUE + "18" : GREEN + "18", color: u.role === "admin" ? BLUE : GREEN }}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: theme.textMuted }}>{new Date(u.created_at).toLocaleDateString("id-ID")}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(u.id, u.email)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={15} /></button>
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
          <div className="rounded-2xl shadow-2xl w-full max-w-md border" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.borderColor }}>
              <h3 className="font-bold" style={{ color: theme.textMain }}>{modalMode === "add" ? "Tambah" : "Edit"} Pengguna</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-black/10 transition-colors"><X size={16} style={{ color: theme.textMuted }} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {[
                { label: "Nama Lengkap", key: "name", type: "text", placeholder: "Nama..." },
                { label: "Email", key: "email", type: "email", placeholder: "email@..." },
                { label: modalMode === "edit" ? "Password Baru (kosongkan jika tidak ganti)" : "Password", key: "password", type: "password", placeholder: "••••••" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} required={f.key !== "password" || modalMode === "add"}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: theme.textMain }}>Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ color: theme.textMain, background: theme.inputBg }}>Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-70 flex items-center gap-2" style={{ background: BLUE }}>
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}