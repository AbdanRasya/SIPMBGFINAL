import { Cpu } from "lucide-react";
import { BLUE, GREEN, PURPLE, ThemeProps } from "@/app/data/constants";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { motion } from "motion/react";
import { useInView } from "@/app/hooks/useInView";

export function FoodDetectionSection({ theme }: { theme: ThemeProps }) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1 });

  const boxes = [
    { label: "Nasi", conf: 99, x: "8%", y: "30%", w: "28%", h: "42%", color: "#F59E0B" },
    { label: "Ayam Goreng", conf: 98, x: "38%", y: "18%", w: "24%", h: "38%", color: BLUE },
    { label: "Sayuran", conf: 97, x: "63%", y: "28%", w: "20%", h: "36%", color: GREEN },
    { label: "Pisang", conf: 95, x: "15%", y: "72%", w: "22%", h: "20%", color: "#F59E0B" },
    { label: "Susu", conf: 96, x: "72%", y: "64%", w: "18%", h: "28%", color: PURPLE },
  ];

  const confidences = [
    { label: "Nasi Putih", conf: 99, color: "#F59E0B", emoji: "🍚" },
    { label: "Ayam Goreng", conf: 98, color: BLUE, emoji: "🍗" },
    { label: "Sayuran", conf: 97, color: GREEN, emoji: "🥦" },
    { label: "Susu UHT", conf: 96, color: PURPLE, emoji: "🥛" },
    { label: "Buah Pisang", conf: 95, color: "#F59E0B", emoji: "🍌" },
  ];

  return (
    <section id="food-detection" className="max-w-screen-xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
      <SectionHeader
        badge="🔍 Computer Vision"
        title="Visualisasi Deteksi Makanan"
        subtitle="AI secara otomatis mengidentifikasi dan melokalisasi setiap komponen makanan secara real-time menggunakan teknologi object detection terdepan."
        dark={theme.dark}
      />

      <div ref={ref} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border flex flex-col shadow-sm" style={{ borderColor: theme.borderColor, background: theme.cardBg }}>
          {/* Header Bar */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b flex items-center justify-between" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: theme.dark ? "rgba(37,99,235,0.15)" : "#EFF6FF" }}>
                <Cpu size={16} style={{ color: BLUE }} />
              </div>
              <span className="font-bold text-sm sm:text-base tracking-tight" style={{ color: theme.textMain }}>Real-time Object Detection</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border shadow-sm"
              style={{ background: theme.dark ? "rgba(22,163,74,0.1)" : "#DCFCE7", color: GREEN, borderColor: theme.dark ? "rgba(22,163,74,0.3)" : "#BBF7D0" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
              <span className="hidden sm:inline">Model</span> Aktif
            </div>
          </div>
          
          {/* Visualization Area */}
          <div className="relative w-full overflow-hidden flex-1" style={{ minHeight: "240px", height: "auto", aspectRatio: "16/9" }}>
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&h=560&fit=crop&auto=format"
              alt="Food tray visualization"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              style={{ filter: theme.dark ? "brightness(0.7) contrast(1.1)" : "brightness(0.9) contrast(1.05)" }}
            />
            
            {isInView && boxes.map((box, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (i * 0.1), duration: 0.4 }}
                className="absolute z-10" 
                style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
              >
                <div className="w-full h-full rounded-lg sm:rounded-xl shadow-lg transition-colors hover:bg-black/10" 
                  style={{ border: `2.5px solid ${box.color}`, position: "relative" }}>
                  <div className="absolute -top-6 sm:-top-7 left-0 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow-md z-20"
                    style={{ background: box.color, color: "white", whiteSpace: "nowrap" }}>
                    {box.label} <span className="opacity-80 ml-1">{box.conf}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right column: Confidences */}
        <div className="rounded-2xl border p-5 sm:p-6 flex flex-col shadow-sm" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
          <h3 className="font-bold text-base sm:text-lg mb-5 sm:mb-6" style={{ color: theme.textMain }}>Tingkat Kepercayaan AI</h3>
          
          <div className="space-y-4 sm:space-y-5 flex-1">
            {confidences.map((item, i) => (
              <div key={i} className="group cursor-default">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <div className="flex items-center gap-2 sm:gap-2.5 text-sm" style={{ color: theme.textMain }}>
                    <span className="text-base sm:text-lg" aria-hidden="true">{item.emoji}</span>
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-black" style={{ color: item.color }}>{item.conf}%</span>
                </div>
                <div className="h-2 sm:h-2.5 rounded-full overflow-hidden shadow-inner" style={{ background: theme.dark ? "rgba(15,23,42,0.6)" : "#F1F5F9" }}>
                  {isInView && (
                    <motion.div
                      initial={{ width: 0 }} 
                      animate={{ width: `${item.conf}%` }}
                      transition={{ delay: i * 0.1 + 0.4, duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full relative overflow-hidden"
                      style={{ background: `linear-gradient(90deg, ${item.color}cc, ${item.color})` }}
                    >
                      {/* Shine effect */}
                      <div className="absolute top-0 bottom-0 left-0 right-0" style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                        animation: "shimmer 2s infinite linear"
                      }}></div>
                    </motion.div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl p-4 sm:p-5 border shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30" 
            style={{ background: theme.dark ? "rgba(15,23,42,0.5)" : "#F8FAFC", borderColor: theme.borderColor }}>
            <div className="text-[10px] sm:text-xs font-bold mb-3 sm:mb-4 tracking-wider uppercase border-b pb-2" style={{ color: theme.textMuted, borderColor: theme.borderColor }}>Metadata Model</div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span style={{ color: theme.textMuted }}>Arsitektur</span>
                <span className="font-semibold" style={{ color: theme.textMain }}>YOLOv10-MBG-v2.4</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span style={{ color: theme.textMuted }}>Waktu Inferensi</span>
                <span className="font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">24ms / frame</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span style={{ color: theme.textMuted }}>Training Data</span>
                <span className="font-semibold" style={{ color: theme.textMain }}>48.5K gambar beranotasi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
