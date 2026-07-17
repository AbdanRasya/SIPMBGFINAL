import { useState, useEffect, useRef } from "react";
import { Star, Shield, Send, CheckCircle, AlertCircle, X } from "lucide-react";
import { BLUE, GREEN, PURPLE, AMBER, ThemeProps } from "@/app/data/constants";
import api from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

export function FeedbackPage({ theme }: { theme: ThemeProps }) {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  
  // Form State
  const [type, setType] = useState("Kritik");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchFeedbacks = async () => {
    try {
      const res = await api.get('/feedbacks');
      setFeedbacks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || rating === 0) {
      setError("Mohon isi komentar dan berikan rating bintang.");
      return;
    }
    
    setError("");
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      if (user?.id) {
        formData.append("user_id", String(user.id));
      }
      formData.append("message", comment);
      formData.append("type", type);
      formData.append("rating", String(rating));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.post('/feedbacks', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setIsSuccess(true);
      setComment("");
      setRating(0);
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchFeedbacks();
      
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error(err);
      setError("Gagal mengirim pengaduan. Silakan coba lagi.");
      toast.error("Gagal mengirim pengaduan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen py-24 sm:py-32 animate-in fade-in duration-500" style={{ background: theme.bg }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 border shadow-sm"
            style={{ color: BLUE, background: theme.dark ? "rgba(37,99,235,0.1)" : "#EFF6FF", borderColor: theme.dark ? "rgba(37,99,235,0.2)" : "#DBEAFE" }}>
            <Star size={14} fill="currentColor" />
            Layanan Pengaduan
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" style={{ color: theme.textMain }}>
            Suara Anda Sangat Berarti
          </h1>
          <p className="text-base sm:text-lg" style={{ color: theme.textMuted }}>
            Kirimkan pengaduan, masukan, atau testimoni terkait program makan bergizi gratis di sekolah anak Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Form Section */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border p-6 sm:p-8 shadow-lg sticky top-24" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: theme.textMain }}>Tulis Ulasan Anda</h2>
              
              {isSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center shadow-lg" style={{ background: GREEN }}>
                    <CheckCircle size={32} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: theme.textMain }}>Laporan Terkirim!</h3>
                  <p className="text-sm" style={{ color: theme.textMuted }}>Terima kasih atas masukan Anda. Kami akan segera menindaklanjuti laporan ini.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3 rounded-xl flex items-start gap-2 text-sm font-medium animate-in slide-in-from-top-1" style={{ background: "rgba(220,38,38,0.1)", color: "#DC2626" }}>
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.textMain }}>Tipe Masukan</label>
                    <select value={type} onChange={e => setType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }}>
                      <option>Kritik</option>
                      <option>Saran</option>
                      <option>Apresiasi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.textMain }}>Penilaian Anda</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="cursor-pointer p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star 
                            size={28} 
                            fill={(hoverRating || rating) >= star ? AMBER : "transparent"} 
                            color={(hoverRating || rating) >= star ? AMBER : theme.textMuted} 
                            style={{ opacity: (hoverRating || rating) >= star ? 1 : 0.3 }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.textMain }}>Komentar / Keluhan</label>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Tuliskan pengalaman atau keluhan Anda di sini..." rows={4}
                      className="w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none cursor-text"
                      style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }}></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: theme.textMain }}>Lampirkan Foto (Opsional)</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 hover:opacity-80 cursor-pointer"
                        style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }}
                      >
                        Pilih Gambar
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                        accept="image/*"
                      />
                      {imageFile && (
                        <div className="flex items-center gap-2 border px-3 py-1 rounded-xl" style={{ borderColor: theme.borderColor }}>
                          <span className="text-xs truncate max-w-[120px]" style={{ color: theme.textMuted }}>{imageFile.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="p-1 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ background: BLUE }}>
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={18} />
                        Kirim Pengaduan
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold" style={{ color: theme.textMain }}>Ulasan Publik Terbaru</h2>
              <span className="text-sm font-medium px-3 py-1 rounded-full border" style={{ color: BLUE, background: theme.dark ? "rgba(37,99,235,0.1)" : "#EFF6FF", borderColor: theme.borderColor }}>
                {feedbacks.length} Ulasan
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {feedbacks.map((fb, i) => (
                <div key={i} className="rounded-2xl border p-5 sm:p-6 transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-4"
                  style={{ background: theme.cardBg, borderColor: theme.borderColor, animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-start gap-4 mb-4">
                    <img src={fb.image ? `http://localhost:3000${fb.image}` : `https://ui-avatars.com/api/?name=${fb.user_name || 'Anonymous'}&background=random`} alt={fb.user_name} className="w-12 h-12 rounded-full object-cover border-2 shadow-sm" style={{ borderColor: theme.bg }} loading="lazy" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm sm:text-base leading-tight" style={{ color: theme.textMain }}>{fb.user_name || 'Anonymous'}</h3>
                        <div className="flex">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={14} fill={j < fb.rating ? AMBER : "transparent"} color={j < fb.rating ? AMBER : theme.textMuted} className={j < fb.rating ? "" : "opacity-30"} />
                          ))}
                        </div>
                      </div>
                      <div className="text-xs mt-1 font-medium" style={{ color: theme.textMuted }}>
                        Tipe: {fb.type}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm italic mb-4 leading-relaxed" style={{ color: theme.textMain }}>"{fb.message}"</p>
                  
                  {fb.reply && (
                    <div className="mt-4 rounded-xl p-4 border-l-4" style={{ background: theme.dark ? "rgba(37,99,235,0.08)" : "#F8FAFC", borderLeftColor: BLUE }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Shield size={14} style={{ color: BLUE }} />
                        <span className="text-xs font-bold" style={{ color: BLUE }}>Tanggapan SIPMBG</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: theme.textMain }}>{fb.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {feedbacks.length === 0 && (
              <div className="text-center py-12 text-sm opacity-60">Belum ada ulasan. Jadilah yang pertama memberikan masukan!</div>
            )}
          </div>
          
        </div>
      </div>
    </main>
  );
}
