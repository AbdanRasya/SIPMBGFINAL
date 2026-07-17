import { School, Building2, Layers, Users, Check } from "lucide-react";
import { BLUE, GREEN, AMBER, PURPLE, ThemeProps } from "@/app/data/constants";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { motion } from "motion/react";
import { useInView } from "@/app/hooks/useInView";

export function BenefitsSection({ theme }: { theme: ThemeProps }) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1 });

  const benefits = [
    {
      icon: School, color: BLUE, bg: theme.dark ? "rgba(37,99,235,0.1)" : "#EFF6FF",
      title: "Sekolah & Guru",
      subtitle: "Manajemen Cepat & Akurat",
      points: ["Dashboard pemantauan siswa", "Sistem notifikasi logistik otomatis", "Buku laporan gizi digital", "Arsip data historis terpusat"]
    },
    {
      icon: Building2, color: GREEN, bg: theme.dark ? "rgba(22,163,74,0.1)" : "#F0FDF4",
      title: "Pemerintah Pusat",
      subtitle: "Pengawasan Skala Nasional",
      points: ["Analitik program nasional terpadu", "Deteksi anomali anggaran via AI", "Evaluasi efektivitas berbasis data", "Meningkatkan transparansi publik"]
    },
    {
      icon: Layers, color: PURPLE, bg: theme.dark ? "rgba(124,58,237,0.1)" : "#F5F3FF",
      title: "Mitra Logistik (SPPG)",
      subtitle: "Operasional yang Optimal",
      points: ["Manajemen inventaris & menu", "Optimasi rute distribusi", "Verifikasi standar gizi otomatis", "Koordinasi lancar antar wilayah"]
    },
    {
      icon: Users, color: AMBER, bg: theme.dark ? "rgba(217,119,6,0.1)" : "#FFFBEB",
      title: "Wali Murid & Publik",
      subtitle: "Kontrol & Transparansi",
      points: ["Pelacakan status porsi harian", "Akses bebas ke laporan publik", "Kanal pengaduan resmi & langsung", "Pemantauan realisasi anggaran"]
    },
  ];

  return (
    <section id="benefits" className="py-16 sm:py-24 border-y border-slate-200 dark:border-slate-800" style={{ background: theme.dark ? "#0B1120" : "#F8FAFC" }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <SectionHeader
          badge="🤝 Nilai Tambah"
          title="Manfaat Ekosistem Digital"
          subtitle="Platform SIPMBG dirancang untuk menyatukan seluruh pemangku kepentingan dan memberikan manfaat terukur bagi kesuksesan program nasional."
          dark={theme.dark}
        />

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {benefits.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }} 
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-2xl border p-5 sm:p-7 flex flex-col gap-4 shadow-sm transition-transform hover:-translate-y-2 hover:shadow-lg bg-white dark:bg-slate-900 group focus-within:ring-2 focus-within:ring-blue-500"
                style={{ background: theme.cardBg, borderColor: theme.borderColor }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: card.bg }}>
                  <Icon size={24} sm={{size: 28}} style={{ color: card.color }} aria-hidden="true" />
                </div>
                
                <div className="mt-2">
                  <h3 className="text-lg sm:text-xl font-black mb-1 tracking-tight" style={{ color: theme.textMain }}>{card.title}</h3>
                  <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>{card.subtitle}</div>
                </div>
                
                <ul className="space-y-3 sm:space-y-4 my-4 flex-1">
                  {card.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium leading-relaxed" style={{ color: theme.textMuted }}>
                      <div className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: card.bg }}>
                        <Check size={10} sm={{size: 12}} style={{ color: card.color }} aria-hidden="true" />
                      </div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  className="w-full mt-auto py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all hover:opacity-90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 shadow-sm"
                  style={{ background: card.bg, color: card.color }}
                  aria-label={`Pelajari lebih lanjut tentang manfaat untuk ${card.title}`}
                >
                  Pelajari Lebih Lanjut →
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
