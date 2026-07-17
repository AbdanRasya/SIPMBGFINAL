import { Globe } from "lucide-react";
import { BLUE, NAV_LINKS, ThemeProps } from "@/app/data/constants";

export function Footer({ theme }: { theme: ThemeProps }) {
  // Footer is always dark based on design system
  const bg = "#0F172A";
  const borderColor = "rgba(255,255,255,0.06)";
  
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const section = document.getElementById(id);
    if (section) {
      const yOffset = -80;
      const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t" style={{ background: bg, borderColor }}>
      <div className="max-w-screen-xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo.png" alt="Logo SIPMBG" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <div>
                <div className="font-bold text-white">SIPMBG</div>
                <div className="text-xs text-slate-400">Program Makan Bergizi Gratis</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs mb-6">
              Platform teknologi pemerintah untuk monitoring distribusi makanan bergizi, transparansi anggaran, dan analisis gizi berbasis AI.
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl inline-flex w-fit"
              style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.2)" }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs text-green-400 font-medium">Sistem Aktif · 99.97% Uptime</span>
            </div>
          </div>

          {/* Links: Platform */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Platform</h2>
            <nav aria-label="Footer Platform Links" className="space-y-3 flex flex-col">
              {NAV_LINKS.slice(0, 5).map(link => (
                <a 
                  key={link.label} 
                  href={`#${link.sectionId}`}
                  onClick={(e) => handleScroll(e, link.sectionId)}
                  className="w-fit text-sm text-slate-400 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 rounded-sm"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Links: Dukungan */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Dukungan</h2>
            <nav aria-label="Footer Dukungan Links" className="space-y-3 flex flex-col">
              {["Kebijakan Privasi", "Syarat & Ketentuan", "Bantuan & FAQ", "Kontak Tim"].map(link => (
                <a 
                  key={link} 
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="w-fit text-sm text-slate-400 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 rounded-sm"
                >
                  {link}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} SIPMBG · Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi RI · Semua hak dilindungi
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Government Technology Platform</span>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Globe size={12} />
              <span>Indonesia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
