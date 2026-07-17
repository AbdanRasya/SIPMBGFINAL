import { useState, useEffect, useRef } from "react";
import { Upload, Eye, Check, Loader2, Camera, X } from "lucide-react";
import { BLUE, GREEN, SLATE, ThemeProps } from "@/app/data/constants";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { CircularProgress } from "@/app/components/shared/CircularProgress";
import { motion } from "motion/react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

export function AIAnalyzerSection({ theme }: { theme: ThemeProps }) {
  const { user } = useAuth();
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto scanning state
  const [isScanning, setIsScanning] = useState(false);
  const isUploadingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Continuous auto-scan loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cameraActive) {
      interval = setInterval(() => {
        if (isUploadingRef.current) return;
        
        if (videoRef.current && videoRef.current.readyState === 4) { // HAVE_ENOUGH_DATA
          const canvas = document.createElement("canvas");
          canvas.width = 400; // Low-res for fast transmission
          canvas.height = 300;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(async (blob) => {
              if (!blob) return;
              const f = new File([blob], `kamera-auto.jpg`, { type: "image/jpeg" });
              
              setIsScanning(true);
              isUploadingRef.current = true;
              try {
                const formData = new FormData();
                formData.append("image", f);
                if (user?.id) formData.append("user_id", String(user.id));
                
                const res = await api.post("/ai/predict", formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                });
                
                setPrediction({
                  ...res.data,
                  confidence: res.data.confidence / 100,
                });
                setAnalyzed(true);
              } catch (err) {
                console.error("Auto scan failed", err);
              } finally {
                isUploadingRef.current = false;
                setTimeout(() => setIsScanning(false), 800);
              }
            }, "image/jpeg", 0.85);
          }
        }
      }, 3000); // scan every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cameraActive, user]);

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      setCameraError("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan di browser.");
      toast.error("Akses kamera ditolak.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const f = new File([blob], `kamera-${Date.now()}.jpg`, { type: "image/jpeg" });
      handleFileUpload(f);
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPEG, PNG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 10 MB.");
      return;
    }

    setLoading(true);
    setPrediction(null);
    setAnalyzed(false);

    try {
      const formData = new FormData();
      formData.append("image", file);
      if (user?.id) {
        formData.append("user_id", String(user.id));
      }

      const res = await api.post("/ai/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Divide by 100 because the local component does Math.round(prediction.confidence * 100)
      setPrediction({
        ...res.data,
        confidence: res.data.confidence / 100,
      });
      setAnalyzed(true);
      toast.success("Analisis selesai! 🎉");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Gagal menganalisis gambar. Coba lagi.";
      toast.error(msg);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <section id="ai-analyzer" className="max-w-screen-xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <SectionHeader
        badge="✦ Fitur Unggulan"
        title="AI Nutrition Analyzer"
        subtitle="Unggah foto makanan dan biarkan AI kami menganalisis kandungan gizi secara otomatis menggunakan Computer Vision terdepan."
        dark={theme.dark}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Upload area */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {cameraActive ? (
            <div 
              className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 bg-black relative overflow-hidden"
              style={{ borderColor: theme.borderColor, minHeight: 280 }}
            >
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scan {
                  0% { top: 16px; }
                  50% { top: 200px; }
                  100% { top: 16px; }
                }
              `}} />
              
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-52 object-cover rounded-xl" />
              
              {/* Pulsing Scanning Badge */}
              <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md transition-opacity duration-300">
                <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? "bg-green-400 animate-ping" : "bg-blue-400"}`}></span>
                {isScanning ? "✦ AI Sedang Memindai..." : "Live Camera (Auto-Scan)"}
              </div>

              {/* Laser scan line overlay */}
              {isScanning && (
                <div 
                  className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_12px_#34d399]"
                  style={{
                    animation: "scan 1.5s ease-in-out infinite",
                  }}
                />
              )}

              <div className="flex gap-4 mt-4 relative z-10">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  style={{ background: BLUE, color: "white" }}
                  title="Ambil foto (Freeze)"
                >
                  <Camera size={20} />
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform bg-slate-700"
                  style={{ color: "white" }}
                  title="Batalkan"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ) : !analyzed ? (
            <div
              className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 sm:p-10 cursor-pointer transition-all hover:border-blue-500 focus-visible:outline-2"
              style={{
                borderColor: dragging ? BLUE : (theme.dark ? "#334155" : "#CBD5E1"),
                background: dragging ? (theme.dark ? "rgba(37,99,235,0.12)" : "#EFF6FF") : (theme.dark ? "#1E293B" : "#F8FAFC"),
                minHeight: 280
              }}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest(".action-btn")) return;
                fileInputRef.current?.click();
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} 
                className="hidden" 
                accept="image/*"
              />
              
              {loading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                  <div className="text-sm font-semibold" style={{ color: theme.textMain }}>Sedang dianalisis...</div>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ background: theme.dark ? "rgba(37,99,235,0.15)" : "#EFF6FF" }}>
                    <Upload size={28} style={{ color: BLUE }} />
                  </div>
                  <div className="text-base font-semibold mb-1 text-center" style={{ color: theme.textMain }}>Drag & Drop Foto Makanan</div>
                  <div className="text-sm mb-6 text-center" style={{ color: theme.textMuted }}>atau klik untuk memilih file</div>
                  
                  {cameraError && (
                    <div className="text-xs text-red-500 mb-4 text-center max-w-xs">{cameraError}</div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                    <button
                      type="button"
                      className="action-btn px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm"
                      style={{ background: BLUE }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Pilih Gambar
                    </button>
                    <button
                      type="button"
                      className="action-btn px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 shadow-sm flex items-center justify-center gap-2"
                      style={{ 
                        background: theme.dark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                        color: theme.textMain,
                        border: `1px solid ${theme.borderColor}`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera();
                      }}
                    >
                      <Camera size={16} /> Gunakan Kamera
                    </button>
                  </div>
                  <div className="text-xs mt-5 text-center" style={{ color: theme.textMuted }}>Mendukung: JPG, PNG, WebP — Maksimal 10 MB</div>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border relative" style={{ borderColor: theme.borderColor, boxShadow: theme.cardShadow }}>
              <img
                src={prediction?.image ? `http://localhost:3000${prediction.image}` : "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600"}
                alt="Makanan yang dianalisis"
                className="w-full object-cover transition-opacity duration-300"
                style={{ height: 260 }}
              />
              <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-md" style={{ background: GREEN, color: "white" }}>
                ✓ Teranalisis
              </div>
              <button 
                onClick={() => setAnalyzed(false)}
                className="absolute bottom-3 right-3 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all hover:scale-105"
                style={{ background: theme.dark ? "#0F172A" : "white", color: theme.textMain, border: `1px solid ${theme.borderColor}` }}>
                Ganti Foto
              </button>
            </div>
          )}

          {/* Detected foods card */}
          {analyzed && prediction && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="rounded-2xl p-5 sm:p-6 border" style={{ background: theme.cardBg, borderColor: theme.borderColor, boxShadow: theme.cardShadow }}>
              <div className="flex items-center gap-3 mb-5 border-b pb-4" style={{ borderColor: theme.borderColor }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: theme.dark ? "rgba(37,99,235,0.15)" : "#EFF6FF" }}>
                  <Eye size={16} style={{ color: BLUE }} />
                </div>
                <h3 className="font-bold text-sm sm:text-base" style={{ color: theme.textMain }}>Komponen Utama: {prediction.food_name}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <Check size={16} style={{ color: GREEN }} />
                    <span className="text-sm font-medium" style={{ color: theme.textMain }}>Kalori Total</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: theme.dark ? "#0F172A" : "#F1F5F9", color: theme.textMuted }}>
                    {prediction.calories} kkal
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <Check size={16} style={{ color: GREEN }} />
                    <span className="text-sm font-medium" style={{ color: theme.textMain }}>Protein</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: theme.dark ? "#0F172A" : "#F1F5F9", color: theme.textMuted }}>
                    {prediction.protein}g
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <Check size={16} style={{ color: GREEN }} />
                    <span className="text-sm font-medium" style={{ color: theme.textMain }}>Karbohidrat</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: theme.dark ? "#0F172A" : "#F1F5F9", color: theme.textMuted }}>
                    {prediction.carbs}g
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <Check size={16} style={{ color: GREEN }} />
                    <span className="text-sm font-medium" style={{ color: theme.textMain }}>Lemak</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: theme.dark ? "#0F172A" : "#F1F5F9", color: theme.textMuted }}>
                    {prediction.fat}g
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Analysis results */}
        <div className="lg:col-span-3 flex flex-col gap-6 lg:gap-8">
          <div className="rounded-2xl p-5 sm:p-8 border flex-1" style={{ background: theme.cardBg, borderColor: theme.borderColor, boxShadow: theme.cardShadow }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <div>
                <h3 className="font-bold text-lg sm:text-xl mb-1" style={{ color: theme.textMain }}>Kepatuhan Nutrisi Harian</h3>
                <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>Berdasarkan standar Angka Kecukupan Gizi (AKG) Kemendikbud</p>
              </div>
              {analyzed && prediction && (
                <div className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold self-start sm:self-auto flex-shrink-0 border" 
                  style={{ background: theme.dark ? "rgba(22,163,74,0.15)" : "#DCFCE7", color: GREEN, borderColor: theme.dark ? "rgba(22,163,74,0.3)" : "#BBF7D0" }}>
                  {prediction.status}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {[
                { label: "Karbohidrat", met: analyzed, icon: "🍚", detail: "45-65% Energi Total" },
                { label: "Protein", met: analyzed, icon: "🥩", detail: "10-35% Energi Total" },
                { label: "Sayuran", met: analyzed, icon: "🥦", detail: "Minimal 100g/hari" },
                { label: "Buah-buahan", met: analyzed, icon: "🍌", detail: "Minimal 150g/hari" },
                { label: "Susu & Olahan", met: analyzed, icon: "🥛", detail: "Min 200ml/hari" },
                { label: "Lemak Baik", met: analyzed, icon: "🫒", detail: "20-35% Energi Total" },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-3 sm:p-4 border flex flex-col sm:flex-row items-start gap-2 sm:gap-3 transition-colors"
                  style={{
                    background: item.met ? (theme.dark ? "rgba(22,163,74,0.1)" : "#F0FDF4") : (theme.dark ? "#1E293B" : "#F8FAFC"),
                    borderColor: item.met ? (theme.dark ? "rgba(22,163,74,0.25)" : "#BBF7D0") : theme.borderColor
                  }}>
                  <span className="text-xl sm:text-2xl leading-none">{item.icon}</span>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 leading-tight" style={{ color: theme.textMain }}>{item.label}</div>
                    <div className="text-[10px] sm:text-xs font-medium mb-1" style={{ color: item.met ? GREEN : theme.textMuted }}>
                      {item.met ? "✓ Terpenuhi" : "Menunggu Data"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Score */}
            {analyzed && prediction ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.4 }}
                className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 sm:gap-6 border"
                style={{ background: `linear-gradient(135deg, ${theme.dark ? 'rgba(22,163,74,0.1)' : '#F0FDF4'} 0%, ${theme.dark ? 'rgba(37,99,235,0.05)' : '#F0F9FF'} 100%)`, borderColor: theme.dark ? 'rgba(22,163,74,0.2)' : '#BBF7D0' }}>
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <CircularProgress value={Math.round(prediction.confidence * 100)} size={110} strokeWidth={9} color={GREEN} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black" style={{ color: GREEN }}>{Math.round(prediction.confidence * 100)}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: SLATE }}>Skor AI</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: GREEN }}>Rekomendasi</div>
                  <div className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight" style={{ color: theme.textMain }}>{prediction.status}</div>
                  <div className="text-xs sm:text-sm leading-relaxed" style={{ color: theme.textMuted }}>
                    {prediction.recommendation}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="rounded-2xl p-8 sm:p-12 text-center border-2 border-dashed flex flex-col items-center justify-center h-40 sm:h-48" 
                style={{ borderColor: theme.dark ? "#334155" : "#E2E8F0", background: theme.dark ? "rgba(15,23,42,0.3)" : "rgba(248,250,252,0.5)" }}>
                <div className="text-4xl sm:text-5xl mb-4 grayscale opacity-50">🤖</div>
                <div className="text-sm sm:text-base font-semibold mb-1" style={{ color: theme.textMain }}>Menunggu input gambar</div>
                <div className="text-xs sm:text-sm max-w-sm" style={{ color: theme.textMuted }}>AI akan mendeteksi komponen makanan dan menghitung kalori serta kepatuhan gizi secara otomatis.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
