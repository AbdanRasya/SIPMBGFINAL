import { useState, useEffect, useRef } from "react";
import { User, Shield, Bell, Settings, LogOut, ChevronRight, Check, Smartphone } from "lucide-react";
import { BLUE, GREEN, PURPLE, RED, ThemeProps } from "@/app/data/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useNavigate } from "react-router";
import api from "@/lib/api";
import { toast } from "sonner";

export function AccountPage({ theme }: { theme: ThemeProps }) {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Profile states - seeded from real user
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Security states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) { setName(user.name); setEmail(user.email); }
  }, [user]);

  // Notifications states
  const [notifState, setNotifState] = useState([true, true, false]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSave = async () => {
    if (!user) return;
    
    // Validation for security tab
    if (activeTab === "security") {
      if (!currentPassword) {
        toast.error("Kata sandi saat ini harus diisi.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Konfirmasi kata sandi baru tidak cocok.");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("Kata sandi baru minimal 6 karakter.");
        return;
      }
    }

    setIsSaving(true);
    setSaved(false);

    try {
      const response = await api.put(`/users/${user.id}/profile`, {
        name,
        email,
        password: activeTab === "security" ? newPassword : undefined
      });

      // Update global context & localstorage
      updateUser(response.data);
      setSaved(true);
      toast.success("Perubahan profil berhasil disimpan!");

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Gagal menyimpan perubahan.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profil Pribadi", icon: User },
    { id: "security", label: "Keamanan", icon: Shield },
    { id: "notifications", label: "Notifikasi", icon: Bell },
    { id: "preferences", label: "Preferensi", icon: Settings },
  ];

  return (
    <main id="main-content" className="min-h-screen py-24 sm:py-32 animate-in fade-in duration-500" style={{ background: theme.bg }}>
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: theme.textMain }}>Pengaturan Akun</h1>
          <p className="text-sm sm:text-base" style={{ color: theme.textMuted }}>Kelola informasi profil, keamanan, dan preferensi Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="rounded-2xl border p-4 sticky top-24 shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
              <nav className="flex flex-col space-y-1" aria-label="Menu Pengaturan Akun">
                {tabs.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 hover:opacity-80 cursor-pointer"
                      style={{ 
                        background: isActive ? (theme.dark ? "rgba(37,99,235,0.15)" : "#EFF6FF") : "transparent",
                        color: isActive ? BLUE : theme.textMuted
                      }}>
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        {item.label}
                      </div>
                      {isActive && <ChevronRight size={16} />}
                    </button>
                  );
                })}
                <div className="pt-4 mt-2 border-t" style={{ borderColor: theme.borderColor }}>
                  <button
                    onClick={() => { logout(); navigate("/login"); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 cursor-pointer"
                    style={{ color: RED }}>
                    <LogOut size={18} />
                    Keluar Sistem
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-8 lg:col-span-9 space-y-8">
            
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <section className="rounded-2xl border overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
                <div className="p-6 sm:p-8 border-b" style={{ borderColor: theme.borderColor }}>
                  <h2 className="text-xl font-bold mb-1" style={{ color: theme.textMain }}>Informasi Pribadi</h2>
                  <p className="text-sm" style={{ color: theme.textMuted }}>Perbarui foto dan detail identitas Anda.</p>
                </div>
                
                <div className="p-6 sm:p-8 space-y-8">
                  {/* Avatar upload */}
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full rounded-full object-cover shadow-md" />
                      ) : (
                        <div className="w-full h-full rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md"
                          style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${PURPLE} 100%)` }}>
                          {(name || "A").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex gap-3 mb-2">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 cursor-pointer"
                          style={{ background: BLUE }}>
                          Ubah Foto
                        </button>
                        <button
                          type="button"
                          onClick={() => setAvatarPreview(null)}
                          className="px-4 py-2 rounded-xl text-sm font-bold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          style={{ color: theme.textMain, border: `1px solid ${theme.borderColor}`, background: theme.inputBg }}>
                          Hapus
                        </button>
                      </div>
                      <p className="text-xs" style={{ color: theme.textMuted }}>JPG, GIF atau PNG. Maksimal 2MB.</p>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.size <= 2 * 1024 * 1024) {
                            const url = URL.createObjectURL(file);
                            setAvatarPreview(url);
                          } else if (file) {
                            toast.error("Ukuran file melebihi 2MB");
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: theme.textMain }}>Nama Lengkap</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
                        style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: theme.textMain }}>Peran / Jabatan</label>
                      <input type="text" defaultValue="Admin Pusat Kemendikbud" disabled
                        className="w-full px-4 py-2.5 rounded-xl border text-sm opacity-70 cursor-not-allowed"
                        style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMuted }} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold mb-2" style={{ color: theme.textMain }}>Email Instansi</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
                        style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                    </div>
                  </div>
                </div>
                
                <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/50 border-t flex justify-end gap-3 items-center" style={{ borderColor: theme.borderColor }}>
                  {saved && <span className="text-sm font-bold flex items-center gap-1 animate-in zoom-in" style={{ color: GREEN }}><Check size={16}/> Tersimpan!</span>}
                  <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 w-48 flex items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    style={{ background: BLUE }}>
                    {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Simpan Perubahan"}
                  </button>
                </div>
              </section>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <section className="rounded-2xl border overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
                <div className="p-6 sm:p-8 border-b" style={{ borderColor: theme.borderColor }}>
                  <h2 className="text-xl font-bold mb-1" style={{ color: theme.textMain }}>Keamanan Akun</h2>
                  <p className="text-sm" style={{ color: theme.textMuted }}>Ubah kata sandi dan amankan akun Anda.</p>
                </div>
                
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.textMain }}>Kata Sandi Saat Ini</label>
                    <input type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full max-w-md px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.textMain }}>Kata Sandi Baru</label>
                    <input type="password" placeholder="Ketik sandi baru" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      className="w-full max-w-md px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.textMain }}>Konfirmasi Sandi Baru</label>
                    <input type="password" placeholder="Ulangi sandi baru" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full max-w-md px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }} />
                  </div>
                  
                  <div className="pt-4 border-t mt-6" style={{ borderColor: theme.borderColor }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: theme.dark ? "rgba(37,99,235,0.15)" : "#EFF6FF", color: BLUE }}>
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-sm" style={{ color: theme.textMain }}>Autentikasi Dua Langkah (2FA)</div>
                          <div className="text-xs mt-0.5" style={{ color: theme.textMuted }}>Tambahkan lapisan keamanan ekstra.</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-xl text-xs font-bold border transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        style={{ borderColor: theme.borderColor, color: theme.textMain }}>Aktifkan</button>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/50 border-t flex justify-end gap-3 items-center" style={{ borderColor: theme.borderColor }}>
                  {saved && <span className="text-sm font-bold flex items-center gap-1 animate-in zoom-in" style={{ color: GREEN }}><Check size={16}/> Tersimpan!</span>}
                  <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 w-40 flex items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    style={{ background: BLUE }}>
                    {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Perbarui Sandi"}
                  </button>
                </div>
              </section>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <section className="rounded-2xl border overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
                <div className="p-6 sm:p-8 border-b" style={{ borderColor: theme.borderColor }}>
                  <h2 className="text-xl font-bold mb-1" style={{ color: theme.textMain }}>Preferensi Notifikasi</h2>
                  <p className="text-sm" style={{ color: theme.textMuted }}>Atur laporan dan peringatan apa saja yang ingin Anda terima.</p>
                </div>
                
                <div className="p-6 sm:p-8 space-y-5">
                  {[
                    { title: "Laporan Harian Gizi", desc: "Ringkasan kepatuhan nutrisi harian nasional." },
                    { title: "Peringatan Anomali (AI)", desc: "Email otomatis saat AI mendeteksi kecurangan/kekurangan gizi." },
                    { title: "Notifikasi Pengaduan Publik", desc: "Masukan dari masyarakat dan wali murid." },
                  ].map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        const newArr = [...notifState];
                        newArr[i] = !newArr[i];
                        setNotifState(newArr);
                      }}
                      className="flex items-start gap-4 p-4 rounded-xl border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer"
                      style={{ borderColor: theme.borderColor }}>
                      <div className="mt-0.5 relative cursor-pointer">
                        <div className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                          style={{ 
                            borderColor: notifState[i] ? BLUE : theme.borderColor,
                            background: notifState[i] ? BLUE : "transparent"
                          }}>
                          <Check size={14} className={`text-white transition-opacity ${notifState[i] ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-bold cursor-pointer" style={{ color: theme.textMain }}>{item.title}</div>
                        <p className="text-xs mt-1" style={{ color: theme.textMuted }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/50 border-t flex justify-end gap-3 items-center" style={{ borderColor: theme.borderColor }}>
                  {saved && <span className="text-sm font-bold flex items-center gap-1 animate-in zoom-in" style={{ color: GREEN }}><Check size={16}/> Tersimpan!</span>}
                  <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 w-40 flex items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    style={{ background: BLUE }}>
                    {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Simpan Pilihan"}
                  </button>
                </div>
              </section>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === "preferences" && (
              <section className="rounded-2xl border overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
                <div className="p-6 sm:p-8 border-b" style={{ borderColor: theme.borderColor }}>
                  <h2 className="text-xl font-bold mb-1" style={{ color: theme.textMain }}>Preferensi Umum</h2>
                  <p className="text-sm" style={{ color: theme.textMuted }}>Pengaturan tampilan dan regionalisasi sistem.</p>
                </div>
                
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.textMain }}>Bahasa Antarmuka</label>
                    <select className="w-full max-w-md px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }}>
                      <option>Bahasa Indonesia</option>
                      <option>English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.textMain }}>Zona Waktu Dashboard</label>
                    <select className="w-full max-w-md px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }}>
                      <option>Waktu Indonesia Barat (WIB)</option>
                      <option>Waktu Indonesia Tengah (WITA)</option>
                      <option>Waktu Indonesia Timur (WIT)</option>
                    </select>
                  </div>
                </div>
                <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/50 border-t flex justify-end gap-3 items-center" style={{ borderColor: theme.borderColor }}>
                  {saved && <span className="text-sm font-bold flex items-center gap-1 animate-in zoom-in" style={{ color: GREEN }}><Check size={16}/> Tersimpan!</span>}
                  <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 w-40 flex items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    style={{ background: BLUE }}>
                    {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Simpan Pilihan"}
                  </button>
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
