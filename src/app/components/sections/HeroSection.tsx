import { BLUE, GREEN, AMBER, PURPLE, SLATE, ThemeProps } from "@/app/data/constants";
import { AlertTriangle } from "lucide-react";

export function HeroSection({ theme }: { theme: ThemeProps }) {
  const scrollToStats = () => {
    document.getElementById("stats")?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, rgba(30, 58, 138, 0.85) 0%, rgba(37, 99, 235, 0.85) 50%, rgba(2, 132, 199, 0.85) 100%)`, backdropFilter: "blur(2px)" }}>
      {/* Background decoration */}
      <div className="absolute inset-0" style={{ opacity: 0.08 }}>
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }}></div>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 rounded-full" style={{ background: "rgba(255,255,255,0.05)", transform: "translate(30%, -30%)" }}></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 md:w-72 md:h-72 rounded-full" style={{ background: "rgba(255,255,255,0.04)", transform: "translate(-30%, 30%)" }}></div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-28 pb-16 md:pt-36 md:pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-1.5 rounded-full mb-6 text-xs md:text-sm font-semibold shadow-sm"
              style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Sistem Aktif · Pemantauan Real-time
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 md:mb-6 tracking-tight">
              Sistem Monitoring Program Makan Bergizi Gratis Berbasis AI
            </h1>
            
            <p className="text-base md:text-lg text-blue-100 leading-relaxed mb-8 md:mb-10 max-w-xl">
              Platform digital untuk memantau distribusi makanan bergizi, transparansi anggaran, serta analisis gizi berbasis Computer Vision.
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
              <button 
                onClick={scrollToStats}
                aria-label="Mulai monitoring sekarang"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm md:text-base transition-all hover:scale-105 active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                style={{ background: "white", color: BLUE, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                Monitor Sekarang
              </button>
              <button 
                aria-label="Pelajari cara kerja sistem"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm md:text-base transition-all hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1.5px solid rgba(255,255,255,0.25)" }}>
                Pelajari Sistem
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-10">
              {[
                { val: "125K+", label: "Paket/hari" },
                { val: "742", label: "Sekolah" },
                { val: "96%", label: "Akurasi AI" },
              ].map((item, i) => (
                <div key={i} className="text-white">
                  <div className="text-2xl font-extrabold">{item.val}</div>
                  <div className="text-xs text-blue-200">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Illustration */}
          <div className="relative mt-8 lg:mt-0 w-full max-w-lg mx-auto lg:max-w-none">
            {/* Main dashboard preview card */}
            <div className="rounded-3xl p-5 md:p-6 shadow-2xl relative z-10" 
              style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              
              <div className="flex items-center gap-3 mb-5">
                <div className="flex gap-1.5">
                  {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-full shadow-sm" style={{ background: c }}></div>
                  ))}
                </div>
                <div className="text-xs text-blue-100 font-medium tracking-wide uppercase">AI Nutrition Dashboard</div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-2.5 md:gap-3 mb-4">
                {[
                  { label: "Gizi Terpenuhi", val: "96%", icon: "🥗", color: GREEN },
                  { label: "Paket Hari Ini", val: "125K", icon: "📦", color: BLUE },
                  { label: "Sekolah Aktif", val: "742", icon: "🏫", color: PURPLE },
                  { label: "AI Score", val: "A+", icon: "🤖", color: AMBER },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl p-3 flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div className="text-xl mb-1.5">{item.icon}</div>
                    <div>
                      <div className="text-white font-bold text-lg leading-tight">{item.val}</div>
                      <div className="text-blue-200 text-xs mt-0.5">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini chart bars */}
              <div className="rounded-xl p-3 md:p-4 mt-2" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="text-xs text-blue-200 mb-3 font-medium">Distribusi Mingguan</div>
                <div className="flex items-end gap-1 md:gap-1.5 h-12 md:h-14">
                  {[65, 80, 72, 90, 85, 95, 88].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md transition-all hover:opacity-80" 
                      style={{ height: `${h}%`, background: i === 5 ? "white" : "rgba(255,255,255,0.35)" }}></div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] md:text-xs text-blue-200 mt-2 font-medium">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(d => <span key={d}>{d}</span>)}
                </div>
              </div>
            </div>

            {/* Floating AI card - Hidden on mobile to prevent layout shift/overflow */}
            <div className="hidden lg:block absolute -left-8 bottom-8 rounded-2xl px-4 py-3 shadow-xl z-20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
              style={{ background: "white", border: `2px solid ${GREEN}`, minWidth: 160 }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: GREEN }}></div>
                <span className="text-xs font-semibold" style={{ color: GREEN }}>AI Analysis Live</span>
              </div>
              <div className="text-sm font-bold" style={{ color: "#0F172A" }}>Score: 96/100</div>
              <div className="text-xs mt-0.5" style={{ color: SLATE }}>Semua komponen gizi ✓</div>
            </div>

            {/* Floating alert card - Hidden on mobile */}
            <div className="hidden lg:block absolute -right-6 top-6 rounded-2xl px-4 py-3 shadow-xl z-20 animate-in fade-in slide-in-from-top-4 duration-700 delay-500"
              style={{ background: "white", minWidth: 170 }}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={14} style={{ color: AMBER }} />
                <span className="text-xs font-semibold" style={{ color: AMBER }}>Notifikasi AI</span>
              </div>
              <div className="text-xs font-medium" style={{ color: "#0F172A" }}>3 sekolah butuh perhatian</div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
