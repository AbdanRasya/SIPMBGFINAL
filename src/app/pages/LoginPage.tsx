import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { ThemeProps, BLUE } from "../data/constants";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function LoginPage({ theme }: { theme: ThemeProps }) {
  const [tab, setTab] = useState<"login" | "register">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPw, setShowRegPw] = useState(false);
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail || !loginPassword) {
      setLoginError("Email dan password tidak boleh kosong.");
      return;
    }
    setLoginLoading(true);
    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      // Admin diarahkan ke panel admin, user ke dashboard
      if (result.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      setLoginError(result.error || "Gagal masuk.");
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setRegError("Semua field wajib diisi.");
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError("Konfirmasi password tidak cocok.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password minimal 6 karakter.");
      return;
    }
    setRegLoading(true);
    const result = await register(regName, regEmail, regPassword);
    if (result.success) {
      navigate("/");
    } else {
      setRegError(result.error || "Gagal mendaftar.");
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-900 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden transition-colors duration-300">
      {/* Floating Blobs outside the card */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-900/50 blur-3xl pointer-events-none z-0"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 10, delay: 2 }}
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-300 dark:bg-indigo-900/50 blur-3xl pointer-events-none z-0"
      />

      {/* Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="w-full max-w-[1000px] bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 min-h-[600px] border border-white/20 dark:border-slate-700"
      >
        
        {/* Left Column - Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-slate-800 relative z-20">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: theme.textMain }}>
              {tab === "login" ? "LOGIN" : "REGISTER"}
            </h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              {tab === "login" 
                ? "Silakan masuk ke akun SIPMBG Anda" 
                : "Daftarkan diri Anda untuk mengakses SIPMBG"}
            </p>
          </div>

          <div className="relative w-full mb-8 flex justify-center">
             <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1.5 rounded-full w-full max-w-[280px]">
                <button
                  onClick={() => { setTab("login"); setLoginError(""); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${tab === 'login' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  Masuk
                </button>
                <button
                  onClick={() => { setTab("register"); setRegError(""); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${tab === 'register' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  Daftar
                </button>
             </div>
          </div>

          <div className="w-full max-w-[320px] mx-auto relative min-h-[320px]">
            <AnimatePresence mode="wait">
              {tab === "login" ? (
                <motion.form 
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin} 
                  className="space-y-5"
                >
                  {/* Email Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="Alamat Email"
                      disabled={loginLoading}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      style={{ color: theme.textMain }}
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showLoginPw ? "text" : "password"}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="Password"
                      disabled={loginLoading}
                      className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      style={{ color: theme.textMain }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw(!showLoginPw)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showLoginPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {loginError && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-center border border-red-100 dark:border-red-800/50">
                      {loginError}
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3.5 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:hover:scale-100"
                    style={{ background: BLUE }}
                  >
                    {loginLoading ? <><Loader2 size={18} className="animate-spin" /><span>Memverifikasi...</span></> : <span>Login Now</span>}
                  </motion.button>
                  
                  <div className="pt-4 flex items-center justify-center gap-2">
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                    <span className="text-xs text-slate-400 font-medium">Info Admin</span>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 inline-block text-slate-500 font-mono">
                      admin@kemdikbud.go.id / admin123
                    </div>
                  </div>
                </motion.form>
              ) : (
                <motion.form 
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegister} 
                  className="space-y-4"
                >
                  {/* Name Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Nama Lengkap"
                      disabled={regLoading}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      style={{ color: theme.textMain }}
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="Alamat Email"
                      disabled={regLoading}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      style={{ color: theme.textMain }}
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showRegPw ? "text" : "password"}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Password"
                      disabled={regLoading}
                      className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      style={{ color: theme.textMain }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPw(!showRegPw)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showRegPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      value={regConfirm}
                      onChange={e => setRegConfirm(e.target.value)}
                      placeholder="Ulangi Password"
                      disabled={regLoading}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      style={{ color: theme.textMain }}
                    />
                  </div>

                  {regError && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-center border border-red-100 dark:border-red-800/50">
                      {regError}
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-3.5 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:hover:scale-100"
                    style={{ background: BLUE }}
                  >
                    {regLoading ? <><Loader2 size={18} className="animate-spin" /><span>Processing...</span></> : <span>Register Now</span>}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-xs mt-8" style={{ color: theme.textMuted }}>
            © 2026 SIPMBG · Kemdikbud Ristek RI
          </p>
        </div>

        {/* Right Column - Graphic */}
        <div 
          className="hidden md:flex w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden bg-blue-600"
        >
          {/* Abstract wavy background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg viewBox="0 0 800 800" className="w-full h-full object-cover">
              <path d="M0,300 C200,500 400,100 800,300 L800,0 L0,0 Z" fill="#ffffff"></path>
              <path d="M0,800 C300,500 500,900 800,600 L800,800 L0,800 Z" fill="#ffffff"></path>
              <circle cx="150" cy="200" r="100" fill="transparent" stroke="#ffffff" strokeWidth="20" opacity="0.5" />
              <circle cx="700" cy="500" r="150" fill="transparent" stroke="#ffffff" strokeWidth="30" opacity="0.3" />
            </svg>
          </div>
          
          {/* Main Visual */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            className="relative z-10 w-full max-w-sm flex flex-col items-center"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center text-center">
              <div className="w-32 h-32 mb-6 bg-white rounded-3xl shadow-inner p-2 flex items-center justify-center">
                <img src="/logo.png" alt="SIPMBG Logo" className="w-full h-full object-contain" />
              </div>
              <h3 className="font-extrabold text-2xl text-white mb-3">SIPMBG</h3>
              <p className="text-sm text-blue-50 font-medium leading-relaxed">
                Sistem Informasi Program Makan Bergizi Gratis.<br/>
                Generasi Sehat, Cerdas, dan Kuat.
              </p>
            </div>
          </motion.div>

          {/* Floating decorations */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-1/4 left-12 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl z-20"
          >
            <span className="text-2xl">🥗</span>
          </motion.div>
          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-12 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl z-20"
          >
            <span className="text-xl">🎓</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
