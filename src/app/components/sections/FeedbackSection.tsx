import { useState, useEffect } from "react";
import { Star, Shield, ArrowRight } from "lucide-react";
import { BLUE, AMBER, GREEN, PURPLE, ThemeProps } from "@/app/data/constants";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { motion } from "motion/react";
import { useInView } from "@/app/hooks/useInView";
import { useNavigate } from "react-router";
import api from "@/lib/api";

export function FeedbackSection({ theme }: { theme: ThemeProps }) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await api.get('/feedbacks');
        // Ambil 3 teratas
        setFeedbacks(res.data.slice(0, 3));
      } catch (error) {
        console.error(error);
      }
    };
    fetchFeedbacks();
  }, []);

  return (
    <section id="feedback" className="py-16 sm:py-24 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <SectionHeader
          badge="💬 Umpan Balik"
          title="Transparansi & Evaluasi Publik"
          subtitle="Kami berkomitmen untuk terus meningkatkan kualitas. Berikut adalah beberapa masukan langsung dari lapangan."
          dark={theme.dark}
        />

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {feedbacks.length > 0 ? feedbacks.map((fb, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border p-6 flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer"
              style={{ background: theme.cardBg, borderColor: theme.borderColor, boxShadow: theme.cardShadow }}
              onClick={() => navigate("/feedback")}
            >
              <div className="flex items-center gap-4 mb-4">
                <img src={fb.image ? `http://localhost:3000${fb.image}` : `https://ui-avatars.com/api/?name=${fb.user_name || 'User'}&background=random`} alt={fb.user_name || 'User'} className="w-12 h-12 rounded-full object-cover border-2" style={{ borderColor: theme.bg }} loading="lazy" referrerPolicy="no-referrer" />
                <div>
                  <h3 className="font-bold text-sm" style={{ color: theme.textMain }}>{fb.user_name || 'Anonymous'}</h3>
                  <div className="text-xs font-medium opacity-80" style={{ color: theme.textMuted }}>{fb.type}</div>
                </div>
              </div>
              
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} fill={j < fb.rating ? AMBER : "transparent"} color={j < fb.rating ? AMBER : theme.textMuted} className={j < fb.rating ? "" : "opacity-30"} />
                ))}
              </div>
              
              <p className="text-sm italic mb-6 flex-1 leading-relaxed" style={{ color: theme.textMain }}>"{fb.message}"</p>
              
              {fb.reply && (
                <div className="rounded-xl p-4 border-l-4 mt-auto" style={{ background: theme.dark ? "rgba(37,99,235,0.08)" : "#F8FAFC", borderLeftColor: BLUE }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Shield size={14} style={{ color: BLUE }} />
                    <span className="text-xs font-bold" style={{ color: BLUE }}>Tanggapan SIPMBG</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: theme.textMain }}>{fb.reply}</p>
                </div>
              )}
            </motion.div>
          )) : (
            <div className="col-span-3 text-center py-10 opacity-60">Belum ada feedback.</div>
          )}
        </div>

        {/* Call to Action to open Feedback Page */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <button 
            onClick={() => navigate("/feedback")}
            className="group cursor-pointer inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-blue-500/25 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #1D4ED8 100%)` }}
          >
            Tulis Pengaduan Anda
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
