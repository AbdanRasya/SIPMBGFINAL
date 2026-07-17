import { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload, Camera, X, Zap, RotateCcw, Trash2, Eye,
  CheckCircle, AlertTriangle, XCircle, History,
  ChevronLeft, Loader2, FlaskConical, Leaf
} from "lucide-react";
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { BLUE, GREEN, AMBER, RED, PURPLE, SLATE, ThemeProps } from "@/app/data/constants";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalysisResult {
  id: number;
  image: string;
  food_name: string;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vitamins: string;
  minerals: string;
  status: string;
  recommendation: string;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: typeof CheckCircle; label: string }> = {
  "Sangat Sehat": { color: GREEN,  bg: `${GREEN}15`,  icon: CheckCircle,     label: "Sangat Sehat" },
  "Sehat":        { color: BLUE,   bg: `${BLUE}15`,   icon: CheckCircle,     label: "Sehat" },
  "Kurang Sehat": { color: AMBER,  bg: `${AMBER}15`,  icon: AlertTriangle,   label: "Kurang Sehat" },
  "Tidak Sehat":  { color: RED,    bg: `${RED}15`,    icon: XCircle,         label: "Tidak Sehat" },
};

function statusCfg(status: string) {
  return STATUS_CONFIG[status] || STATUS_CONFIG["Sehat"];
}

const IMG_BASE = "http://localhost:3000";

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Skeleton loader card */
function SkeletonCard({ theme }: { theme: ThemeProps }) {
  return (
    <div className="rounded-2xl border p-5 animate-pulse" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
      <div className="h-4 w-2/3 rounded mb-3" style={{ background: theme.dark ? "#334155" : "#E2E8F0" }} />
      <div className="h-3 w-1/2 rounded mb-6" style={{ background: theme.dark ? "#1E293B" : "#F1F5F9" }} />
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-16 rounded-xl" style={{ background: theme.dark ? "#1E293B" : "#F1F5F9" }} />
        ))}
      </div>
      <div className="h-20 rounded-xl" style={{ background: theme.dark ? "#1E293B" : "#F1F5F9" }} />
    </div>
  );
}

/** Nutrisi badge */
function NutriBadge({ label, value, unit, color, theme }: { label: string; value: number; unit: string; color: string; theme: ThemeProps }) {
  return (
    <div className="flex flex-col items-center p-3 rounded-xl text-center" style={{ background: `${color}12` }}>
      <span className="text-lg font-black" style={{ color }}>{value}<span className="text-xs font-semibold">{unit}</span></span>
      <span className="text-xs font-medium mt-0.5" style={{ color: theme.textMuted }}>{label}</span>
    </div>
  );
}

/** Progress bar komponen */
function ProgressBar({ progress, theme }: { progress: number; theme: ThemeProps }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs mb-1.5" style={{ color: theme.textMuted }}>
        <span>Menganalisis gambar...</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: theme.dark ? "#1E293B" : "#E2E8F0" }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${BLUE}, ${PURPLE})`,
          }}
        />
      </div>
      <p className="text-xs text-center mt-2" style={{ color: theme.textMuted }}>
        {progress < 30 ? "Mempersiapkan gambar..." : progress < 60 ? "Mendeteksi makanan..." : progress < 85 ? "Menghitung kandungan gizi..." : "Menyimpan hasil analisis..."}
      </p>
    </div>
  );
}

/** Hasil analisis */
function ResultCard({ result, theme, onReset }: { result: AnalysisResult; theme: ThemeProps; onReset: () => void }) {
  const cfg = statusCfg(result.status);
  const StatusIcon = cfg.icon;

  const vitamins = result.vitamins?.split(",").map(s => s.trim()).filter(Boolean) || [];
  const minerals = result.minerals?.split(",").map(s => s.trim()).filter(Boolean) || [];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header result */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
        <div className="flex items-start gap-4 p-5 border-b" style={{ borderColor: theme.borderColor }}>
          {/* Foto */}
          <img
            src={`${IMG_BASE}${result.image}`}
            alt={result.food_name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover flex-shrink-0 shadow-sm"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/96?text=🍽️"; }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h2 className="text-xl font-black" style={{ color: theme.textMain }}>{result.food_name}</h2>
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                <StatusIcon size={13} />
                {result.status}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: result.confidence >= 85 ? GREEN : result.confidence >= 70 ? AMBER : RED }} />
                <span className="text-sm font-semibold" style={{ color: theme.textMuted }}>Confidence: <span style={{ color: theme.textMain }}>{result.confidence}%</span></span>
              </div>
            </div>
            <p className="text-xs mt-1.5" style={{ color: theme.textMuted }}>
              {new Date(result.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Nutrisi Grid */}
        <div className="p-5 border-b" style={{ borderColor: theme.borderColor }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: theme.textMain }}>Kandungan Gizi per Porsi</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <NutriBadge label="Kalori" value={result.calories} unit=" kkal" color={RED} theme={theme} />
            <NutriBadge label="Protein" value={result.protein} unit="g" color={BLUE} theme={theme} />
            <NutriBadge label="Karbohidrat" value={result.carbs} unit="g" color={AMBER} theme={theme} />
            <NutriBadge label="Lemak" value={result.fat} unit="g" color={PURPLE} theme={theme} />
          </div>
        </div>

        {/* Vitamin & Mineral */}
        {(vitamins.length > 0 || minerals.length > 0) && (
          <div className="p-5 border-b" style={{ borderColor: theme.borderColor }}>
            {vitamins.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <FlaskConical size={14} style={{ color: GREEN }} />
                  <span className="text-xs font-bold" style={{ color: theme.textMain }}>Vitamin</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {vitamins.map((v, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${GREEN}15`, color: GREEN }}>{v}</span>
                  ))}
                </div>
              </div>
            )}
            {minerals.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Leaf size={14} style={{ color: AMBER }} />
                  <span className="text-xs font-bold" style={{ color: theme.textMain }}>Mineral</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {minerals.map((m, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${AMBER}15`, color: AMBER }}>{m}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rekomendasi */}
        <div className="p-5">
          <div className="p-4 rounded-xl" style={{ background: theme.dark ? "#0F172A" : "#F8FAFC", borderLeft: `3px solid ${cfg.color}` }}>
            <p className="text-xs font-bold mb-1.5" style={{ color: cfg.color }}>💡 Rekomendasi</p>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMain }}>{result.recommendation}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-colors hover:opacity-80"
        style={{ borderColor: theme.borderColor, color: theme.textMuted }}
      >
        <RotateCcw size={15} /> Analisis Gambar Lain
      </button>
    </div>
  );
}

/** Kartu riwayat */
function HistoryCard({ record, theme, onDelete, onDetail }: {
  record: AnalysisResult; theme: ThemeProps;
  onDelete: (id: number) => void; onDetail: (r: AnalysisResult) => void;
}) {
  const cfg = statusCfg(record.status);
  const StatusIcon = cfg.icon;

  return (
    <div className="rounded-2xl border overflow-hidden hover:shadow-md transition-shadow" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
      <div className="relative">
        <img
          src={`${IMG_BASE}${record.image}`}
          alt={record.food_name}
          className="w-full h-36 object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x144?text=🍽️"; }}
        />
        <span
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: cfg.bg, color: cfg.color, backdropFilter: "blur(8px)" }}
        >
          <StatusIcon size={11} /> {record.status}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-sm mb-0.5 truncate" style={{ color: theme.textMain }}>{record.food_name}</h3>
        <p className="text-xs mb-3" style={{ color: theme.textMuted }}>
          {new Date(record.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          {" · "}{record.confidence}% confidence
        </p>
        <div className="grid grid-cols-3 gap-1.5 text-center text-xs mb-3">
          <div className="p-1.5 rounded-lg" style={{ background: `${RED}12` }}>
            <div className="font-black text-sm" style={{ color: RED }}>{record.calories}</div>
            <div style={{ color: theme.textMuted }}>kkal</div>
          </div>
          <div className="p-1.5 rounded-lg" style={{ background: `${BLUE}12` }}>
            <div className="font-black text-sm" style={{ color: BLUE }}>{record.protein}g</div>
            <div style={{ color: theme.textMuted }}>protein</div>
          </div>
          <div className="p-1.5 rounded-lg" style={{ background: `${AMBER}12` }}>
            <div className="font-black text-sm" style={{ color: AMBER }}>{record.carbs}g</div>
            <div style={{ color: theme.textMuted }}>karbo</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDetail(record)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors hover:opacity-80"
            style={{ background: `${BLUE}15`, color: BLUE }}
          >
            <Eye size={13} /> Detail
          </button>
          <button
            onClick={() => onDelete(record.id)}
            className="flex items-center justify-center w-9 rounded-xl transition-colors hover:opacity-80"
            style={{ background: `${RED}12`, color: RED }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Modal detail */
function DetailModal({ record, theme, onClose, onDelete }: {
  record: AnalysisResult; theme: ThemeProps;
  onClose: () => void; onDelete: (id: number) => void;
}) {
  const cfg = statusCfg(record.status);
  const StatusIcon = cfg.icon;
  const vitamins = record.vitamins?.split(",").map(s => s.trim()).filter(Boolean) || [];
  const minerals = record.minerals?.split(",").map(s => s.trim()).filter(Boolean) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-2xl sm:rounded-2xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: theme.cardBg, borderColor: theme.borderColor }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ borderColor: theme.borderColor }}>
          <h3 className="font-bold" style={{ color: theme.textMain }}>Detail Analisis</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10 transition-colors">
            <X size={16} style={{ color: theme.textMuted }} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <img
            src={`${IMG_BASE}${record.image}`}
            alt={record.food_name}
            className="w-full h-52 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x208?text=🍽️"; }}
          />

          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-black" style={{ color: theme.textMain }}>{record.food_name}</h2>
                <p className="text-sm" style={{ color: theme.textMuted }}>Confidence: {record.confidence}%</p>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
                style={{ background: cfg.bg, color: cfg.color }}>
                <StatusIcon size={12} /> {record.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <NutriBadge label="Kalori" value={record.calories} unit=" kkal" color={RED} theme={theme} />
              <NutriBadge label="Protein" value={record.protein} unit="g" color={BLUE} theme={theme} />
              <NutriBadge label="Karbohidrat" value={record.carbs} unit="g" color={AMBER} theme={theme} />
              <NutriBadge label="Lemak" value={record.fat} unit="g" color={PURPLE} theme={theme} />
            </div>

            {vitamins.length > 0 && (
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: theme.textMain }}>Vitamin</p>
                <div className="flex flex-wrap gap-1.5">
                  {vitamins.map((v, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{ background: `${GREEN}15`, color: GREEN }}>{v}</span>
                  ))}
                </div>
              </div>
            )}

            {minerals.length > 0 && (
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: theme.textMain }}>Mineral</p>
                <div className="flex flex-wrap gap-1.5">
                  {minerals.map((m, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{ background: `${AMBER}15`, color: AMBER }}>{m}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl" style={{ background: theme.dark ? "#0F172A" : "#F8FAFC", borderLeft: `3px solid ${cfg.color}` }}>
              <p className="text-xs font-bold mb-1.5" style={{ color: cfg.color }}>💡 Rekomendasi</p>
              <p className="text-sm leading-relaxed" style={{ color: theme.textMain }}>{record.recommendation}</p>
            </div>

            <p className="text-xs text-center" style={{ color: theme.textMuted }}>
              Dianalisis pada {new Date(record.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="p-4 border-t flex gap-3 flex-shrink-0" style={{ borderColor: theme.borderColor }}>
          <button
            onClick={() => { onDelete(record.id); onClose(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors hover:opacity-80"
            style={{ background: `${RED}15`, color: RED }}
          >
            <Trash2 size={14} /> Hapus
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors hover:opacity-80" style={{ background: BLUE, color: "#fff" }}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function AIPage({ theme }: { theme: ThemeProps }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"analyze" | "history">("analyze");

  // AI Model state
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const requestRef = useRef<number>();

  useEffect(() => {
    // Load COCO-SSD model
    cocoSsd.load().then(loadedModel => {
      setModel(loadedModel);
    }).catch(err => {
      console.error("Failed to load TFJS model", err);
    });
  }, []);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-scanning state
  const [isScanning, setIsScanning] = useState(false);
  const isUploadingRef = useRef(false);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  // History state
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailRecord, setDetailRecord] = useState<AnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    return () => { stopCamera(); };
  }, []);

  // ─── Hybrid Detection: COCO-SSD for bboxes + Backend for Indonesian food labels ────
  const backendLabelRef = useRef<{ food_name: string; confidence: number; color: string } | null>(null);
  const lastBackendCallRef = useRef<number>(0);
  const isBackendCallingRef = useRef(false);

  // Color mapping for food categories from backend
  const getFoodColor = (foodName: string): string => {
    const name = foodName.toLowerCase();
    if (name.includes("sayur") || name.includes("bayam") || name.includes("pecel") || name.includes("gado") || name.includes("cap cay")) return "#10B981";
    if (name.includes("buah") || name.includes("rujak")) return "#F97316";
    if (name.includes("nasi") || name.includes("lontong") || name.includes("bubur") || name.includes("mie") || name.includes("ketoprak")) return "#F59E0B";
    if (name.includes("ayam") || name.includes("sate") || name.includes("rendang") || name.includes("bakso") || name.includes("soto")) return "#3B82F6";
    if (name.includes("tempe") || name.includes("tahu")) return "#8B5CF6";
    return "#2563EB";
  };

  useEffect(() => {
    let animationId: number;

    const detectFrame = async () => {
      if (!cameraActive || !model || !videoRef.current || videoRef.current.readyState !== 4) {
        if (cameraActive) animationId = requestAnimationFrame(detectFrame);
        return;
      }

      try {
        const video = videoRef.current;

        // ─── 1. Real-time COCO-SSD bounding boxes ───────────────────────────
        const preds = await model.detect(video);

        // ─── 2. Every 4 seconds, call backend for Indonesian food label ──────
        const now = Date.now();
        if (now - lastBackendCallRef.current > 4000 && !isBackendCallingRef.current && preds.length > 0) {
          lastBackendCallRef.current = now;
          isBackendCallingRef.current = true;

          const canvas = document.createElement("canvas");
          canvas.width = 400;
          canvas.height = 300;
          canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(async (blob) => {
            if (!blob) { isBackendCallingRef.current = false; return; }
            try {
              const formData = new FormData();
              formData.append("image", new File([blob], "scan.jpg", { type: "image/jpeg" }));
              if (user?.id) formData.append("user_id", String(user.id));

              const res = await api.post("/ai/predict", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });

              const color = getFoodColor(res.data.food_name);
              backendLabelRef.current = {
                food_name: res.data.food_name,
                confidence: res.data.confidence,
                color,
              };
              setResult(res.data); // juga update panel hasil analisis
            } catch (e) {
              // silent fail — bounding box tetap tampil
            } finally {
              isBackendCallingRef.current = false;
            }
          }, "image/jpeg", 0.75);
        }

        // ─── 3. Merge COCO-SSD boxes dengan label dari backend ───────────────
        const backendLabel = backendLabelRef.current;
        const mappedPreds = preds.map((p, i) => {
          // Objek pertama (paling yakin) pakai label backend jika ada
          if (i === 0 && backendLabel) {
            return {
              ...p,
              sipmbgLabel: backendLabel.food_name,
              sipmbgColor: backendLabel.color,
              sipmbgScore: backendLabel.confidence,
              fromBackend: true,
            };
          }

          // Objek lain tetap pakai COCO-SSD mapping
          let label = p.class;
          let color = "#3B82F6";
          if (["bowl", "cup", "bottle", "spoon", "fork"].includes(p.class)) { label = "Wadah Makanan"; color = "#8B5CF6"; }
          else if (["apple", "banana", "orange"].includes(p.class)) { label = "Buah-buahan"; color = "#F97316"; }
          else if (["broccoli", "carrot", "potted plant"].includes(p.class)) { label = "Sayuran"; color = "#10B981"; }
          else if (["hot dog", "pizza", "donut", "cake", "sandwich"].includes(p.class)) { label = "Makanan Berat"; color = "#F59E0B"; }
          else if (p.class === "person") { label = "Orang"; color = "#64748B"; }

          return { ...p, sipmbgLabel: label, sipmbgColor: color, sipmbgScore: Math.round(p.score * 100), fromBackend: false };
        });

        setPredictions(mappedPreds);
        setIsScanning(mappedPreds.length > 0);
      } catch (err) {
        console.error("Detection error", err);
      }

      animationId = requestAnimationFrame(detectFrame);
    };

    if (cameraActive && model) {
      detectFrame();
    } else {
      setPredictions([]);
      setIsScanning(false);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [cameraActive, model, user]);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab]);

  // ─── File handling ────────────────────────────────────────────────────────
  const validateAndSetFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPEG, PNG, WebP).");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 10 MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
    e.target.value = "";
  };

  // ─── Drag & Drop ──────────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) validateAndSetFile(f);
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  // ─── Camera ───────────────────────────────────────────────────────────────
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
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
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
      validateAndSetFile(f);
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  const resetFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    stopCamera();
  };

  // ─── Analysis ─────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setProgress(0);
    setError("");
    setResult(null);

    // Progress animation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) { clearInterval(interval); return 85; }
        return prev + Math.floor(Math.random() * 8) + 3;
      });
    }, 250);

    try {
      const formData = new FormData();
      formData.append("image", file);
      if (user?.id) formData.append("user_id", String(user.id));

      const res = await api.post("/ai/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setResult(res.data);
        setIsAnalyzing(false);
        toast.success("Analisis selesai! 🎉");
      }, 400);
    } catch (err: any) {
      clearInterval(interval);
      const msg = err?.response?.data?.error || "Gagal menganalisis gambar. Coba lagi.";
      setError(msg);
      setIsAnalyzing(false);
      toast.error(msg);
    }
  };

  // ─── History ──────────────────────────────────────────────────────────────
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get("/ai/history");
      setHistory(res.data.records || []);
    } catch {
      toast.error("Gagal memuat riwayat.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus riwayat analisis ini?")) return;
    try {
      await api.delete(`/ai/${id}`);
      toast.success("Riwayat dihapus.");
      setHistory(prev => prev.filter(r => r.id !== id));
      if (result?.id === id) setResult(null);
    } catch {
      toast.error("Gagal menghapus.");
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen pt-24 pb-16 animate-in fade-in" style={{ background: theme.bg }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${PURPLE})` }}>
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: theme.textMain }}>AI Deteksi Gizi</h1>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Upload foto makananmu dan AI kami akan menganalisis kandungan gizi secara instan.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border mb-6 flex-shrink-0" style={{ borderColor: theme.borderColor }}>
          {[
            { key: "analyze", label: "Analisis Baru", icon: Zap },
            { key: "history", label: "Riwayat", icon: History },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors"
              style={{
                background: activeTab === tab.key ? BLUE : "transparent",
                color: activeTab === tab.key ? "#fff" : theme.textMuted,
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TAB ANALISIS ────────────────────────────────────────────────── */}
        {activeTab === "analyze" && (
          <div className="space-y-4">
            {/* Camera view */}
            {cameraActive && (
              <div className="rounded-2xl overflow-hidden border relative shadow-2xl" style={{ borderColor: theme.borderColor, height: '60vh', maxHeight: '600px', minHeight: '400px' }}>
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes scan-ai-page {
                    0% { top: 16px; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: calc(100% - 16px); opacity: 0; }
                  }
                  @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 0.4; }
                    100% { transform: scale(0.8); opacity: 0.8; }
                  }
                `}} />

                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover bg-black" />

                {/* Pulsing Scanning Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md transition-opacity duration-300 shadow-lg border border-white/10 z-20">
                  <span className={`w-3 h-3 rounded-full ${isScanning ? "bg-green-400 animate-ping" : "bg-blue-400"}`}></span>
                  {isScanning ? "✦ AI Sedang Memindai Objek..." : "Live Camera (Auto-Scan)"}
                </div>

                {/* Model loading indicator */}
                {!model && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md border border-white/10 z-20">
                    <Loader2 size={12} className="animate-spin" /> Memuat AI...
                  </div>
                )}

                {/* Real-time TFJS Bounding Boxes */}
                {isScanning && (
                  <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                    {predictions.map((pred, i) => {
                      const [x, y, w, h] = pred.bbox;
                      const vWidth = videoRef.current?.videoWidth || 640;
                      const vHeight = videoRef.current?.videoHeight || 480;

                      const left = (x / vWidth) * 100;
                      const top = (y / vHeight) * 100;
                      const width = (w / vWidth) * 100;
                      const height = (h / vHeight) * 100;

                      const score = pred.fromBackend ? pred.sipmbgScore : Math.round(pred.score * 100);

                      return (
                        <motion.div
                          key={`${pred.class}-${i}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.15 }}
                          className="absolute pointer-events-none"
                          style={{
                            left: `${left}%`, top: `${top}%`,
                            width: `${width}%`, height: `${height}%`,
                            borderRadius: '14px',
                            border: pred.fromBackend
                              ? `3px solid ${pred.sipmbgColor}`
                              : `2px dashed ${pred.sipmbgColor}`,
                            boxShadow: pred.fromBackend ? `0 0 16px ${pred.sipmbgColor}55` : 'none',
                          }}
                        >
                          {/* Label badge */}
                          <span
                            className="absolute -top-3.5 left-3 px-2.5 py-0.5 rounded-md text-xs font-extrabold text-white shadow-lg whitespace-nowrap flex items-center gap-1"
                            style={{ background: pred.sipmbgColor }}
                          >
                            {pred.fromBackend && <span>⭐</span>}
                            {pred.sipmbgLabel} {score}%
                          </span>

                          {/* Corner brackets for backend-detected objects */}
                          {pred.fromBackend && (
                            <>
                              <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-md" style={{ borderColor: pred.sipmbgColor }} />
                              <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-md" style={{ borderColor: pred.sipmbgColor }} />
                              <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-md" style={{ borderColor: pred.sipmbgColor }} />
                              <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-md" style={{ borderColor: pred.sipmbgColor }} />
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-10">
                  <button
                    onClick={capturePhoto}
                    className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    style={{ background: BLUE }}
                    title="Ambil foto (Freeze)"
                  >
                    <Camera size={22} className="text-white" />
                  </button>
                  <button
                    onClick={stopCamera}
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-md self-end mb-2"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                    title="Batalkan"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              </div>
            )}

            {cameraError && (
              <div className="p-3 rounded-xl text-sm text-red-500 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                {cameraError}
              </div>
            )}

            {/* Upload zone atau preview */}
            {!cameraActive && !preview && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className="rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                style={{
                  borderColor: isDragging ? BLUE : theme.borderColor,
                  background: isDragging ? `${BLUE}08` : theme.cardBg,
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform"
                  style={{ background: isDragging ? `${BLUE}20` : theme.dark ? "#0F172A" : "#F1F5F9" }}>
                  <Upload size={28} style={{ color: isDragging ? BLUE : theme.textMuted }} />
                </div>
                <p className="font-bold mb-1" style={{ color: theme.textMain }}>
                  {isDragging ? "Lepaskan gambar di sini" : "Seret & Letakkan Gambar"}
                </p>
                <p className="text-sm mb-4" style={{ color: theme.textMuted }}>atau klik untuk memilih dari galeri</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>JPEG, PNG, WebP · Maks. 10 MB</p>
              </div>
            )}

            {/* Preview gambar */}
            {!cameraActive && preview && !result && (
              <div className="rounded-2xl border overflow-hidden relative" style={{ borderColor: theme.borderColor }}>
                <img src={preview} alt="Preview" className="w-full max-h-72 object-cover" />
                <button
                  onClick={resetFile}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                  style={{ background: "rgba(0,0,0,0.65)" }}
                >
                  <X size={15} className="text-white" />
                </button>
                <div className="p-3 flex items-center gap-2" style={{ background: theme.cardBg }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: theme.textMain }}>{file?.name}</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>{file ? (file.size / 1024).toFixed(1) + " KB" : ""}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons: Galeri + Kamera */}
            {!cameraActive && !result && (
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-colors hover:opacity-80"
                  style={{ borderColor: theme.borderColor, color: theme.textMain, background: theme.cardBg }}
                >
                  <Upload size={16} /> Pilih dari Galeri
                </button>
                <button
                  onClick={startCamera}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-colors hover:opacity-80"
                  style={{ borderColor: theme.borderColor, color: theme.textMain, background: theme.cardBg }}
                >
                  <Camera size={16} /> Buka Kamera
                </button>
              </div>
            )}

            {/* Progress bar */}
            {isAnalyzing && <ProgressBar progress={progress} theme={theme} />}

            {/* Skeleton */}
            {isAnalyzing && progress > 85 && <SkeletonCard theme={theme} />}

            {/* Error state */}
            {error && !isAnalyzing && (
              <div className="p-4 rounded-2xl border text-center" style={{ background: `${RED}08`, borderColor: `${RED}30` }}>
                <XCircle size={32} style={{ color: RED }} className="mx-auto mb-2" />
                <p className="font-bold text-sm mb-1" style={{ color: RED }}>Analisis Gagal</p>
                <p className="text-xs mb-3" style={{ color: theme.textMuted }}>{error}</p>
                <button onClick={handleAnalyze} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: RED }}>
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Hasil */}
            {result && !isAnalyzing && (
              <ResultCard result={result} theme={theme} onReset={resetFile} />
            )}

            {/* Tombol Analisis */}
            {preview && !result && !isAnalyzing && (
              <button
                onClick={handleAnalyze}
                className="w-full py-4 rounded-xl font-black text-white text-base shadow-lg hover:shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-3"
                style={{ background: `linear-gradient(135deg, ${BLUE}, ${PURPLE})` }}
              >
                <Zap size={20} /> Analisis Sekarang
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* ─── TAB RIWAYAT ─────────────────────────────────────────────────── */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: theme.textMuted }}>
                {history.length} analisis tersimpan
              </p>
              <button
                onClick={fetchHistory}
                className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-70 transition-opacity"
                style={{ color: BLUE }}
              >
                <RotateCcw size={13} /> Muat Ulang
              </button>
            </div>

            {historyLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="rounded-2xl border animate-pulse overflow-hidden" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
                    <div className="h-36" style={{ background: theme.dark ? "#334155" : "#E2E8F0" }} />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-3/4 rounded" style={{ background: theme.dark ? "#1E293B" : "#F1F5F9" }} />
                      <div className="h-3 w-1/2 rounded" style={{ background: theme.dark ? "#1E293B" : "#F1F5F9" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
                <FlaskConical size={48} style={{ color: theme.textMuted }} className="mx-auto mb-3 opacity-40" />
                <p className="font-bold text-lg mb-1" style={{ color: theme.textMain }}>Belum Ada Riwayat</p>
                <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Mulai analisis gambar makanan untuk melihat riwayatnya di sini.</p>
                <button
                  onClick={() => setActiveTab("analyze")}
                  className="px-6 py-2.5 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
                  style={{ background: BLUE }}
                >
                  Analisis Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {history.map(record => (
                  <HistoryCard
                    key={record.id}
                    record={record}
                    theme={theme}
                    onDelete={handleDelete}
                    onDetail={setDetailRecord}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailRecord && (
        <DetailModal
          record={detailRecord}
          theme={theme}
          onClose={() => setDetailRecord(null)}
          onDelete={(id) => { handleDelete(id); fetchHistory(); }}
        />
      )}
    </main>
  );
}
