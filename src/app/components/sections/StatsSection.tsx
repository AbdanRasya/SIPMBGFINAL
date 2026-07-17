import { useState, useEffect } from "react";
import { Package, Users, Target, MessageSquare, ArrowUpRight, ArrowDownRight, Utensils } from "lucide-react";
import { BLUE, GREEN, PURPLE, AMBER, RED, ThemeProps } from "@/app/data/constants";
import { AnimatedCounter } from "@/app/components/shared/AnimatedCounter";
import api from "@/lib/api";
import { motion } from "motion/react";
import { useInView } from "@/app/hooks/useInView";

export function StatsSection({ theme }: { theme: ThemeProps }) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const [data, setData] = useState({ totalMenus: 0, totalUsers: 0, totalAi: 0, totalFeedbacks: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: "Total Menu Makanan", value: data.totalMenus, suffix: "", icon: Utensils, color: BLUE, trend: "Baru", up: true },
    { label: "Total Pengguna", value: data.totalUsers, suffix: "", icon: Users, color: GREEN, trend: "Aktif", up: true },
    { label: "Total Deteksi AI", value: data.totalAi, suffix: "", icon: Target, color: PURPLE, trend: "Akurat", up: true },
    { label: "Total Pengaduan", value: data.totalFeedbacks, suffix: "", icon: MessageSquare, color: AMBER, trend: "Terbaru", up: true },
  ];

  return (
    <section id="stats" className="max-w-screen-xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 mb-8 sm:mb-12">
      <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl p-5 sm:p-6 border transition-all hover:-translate-y-1 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500"
              style={{ background: theme.cardBg, borderColor: theme.borderColor, boxShadow: theme.cardShadow }}>
              
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: `${stat.color}18` }}>
                  <Icon size={20} style={{ color: stat.color }} aria-hidden="true" />
                </div>
                
                <div 
                  className={`flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 py-1 rounded-full`}
                  style={{
                    color: stat.up ? GREEN : RED,
                    background: stat.up ? (theme.dark ? "rgba(22,163,74,0.15)" : "#DCFCE7") : (theme.dark ? "rgba(220,38,38,0.15)" : "#FEE2E2")
                  }}
                  aria-label={`Trend: ${stat.trend}`}>
                  {stat.up ? <ArrowUpRight size={12} aria-hidden="true" /> : <ArrowDownRight size={12} aria-hidden="true" />}
                  {stat.trend}
                </div>
              </div>
              
              <div className="text-2xl sm:text-3xl font-extrabold mb-1 tracking-tight truncate" style={{ color: theme.textMain }}>
                {isInView ? <AnimatedCounter target={stat.value} suffix={stat.suffix} /> : "0"}
              </div>
              
              <div className="text-xs sm:text-sm font-medium" style={{ color: theme.textMuted }}>
                {stat.label}
              </div>
              
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
