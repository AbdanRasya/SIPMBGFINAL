import { useState, useEffect } from "react";
import { Loader2, CheckCircle, MessageCircle, Star, Trash2, X } from "lucide-react";
import { BLUE, GREEN, AMBER, RED, ThemeProps } from "@/app/data/constants";
import api from "@/lib/api";
import { toast } from "sonner";

export function AdminFeedbackPage({ theme }: { theme: ThemeProps }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState<{ id: number; text: string } | null>(null);
  const [isReplying, setIsReplying] = useState(false);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try { const r = await api.get('/feedbacks'); setFeedbacks(r.data); }
    catch { toast.error("Gagal memuat pengaduan"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const handleReply = async () => {
    if (!replyModal || !replyModal.text.trim()) return;
    setIsReplying(true);
    try {
      await api.patch(`/feedbacks/${replyModal.id}/reply`, { reply: replyModal.text });
      toast.success("Balasan dikirim!");
      setReplyModal(null);
      fetchFeedbacks();
    } catch { toast.error("Gagal mengirim balasan"); }
    finally { setIsReplying(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus pengaduan ini?")) return;
    try { await api.delete(`/feedbacks/${id}`); toast.success("Pengaduan dihapus"); fetchFeedbacks(); }
    catch { toast.error("Gagal menghapus pengaduan"); }
  };

  const typeColors: Record<string, string> = {
    "Pujian": GREEN, "Saran": BLUE, "Keluhan": RED, "Pertanyaan": AMBER
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold" style={{ color: theme.textMain }}>Kelola Pengaduan</h2>
        <p className="text-sm" style={{ color: theme.textMuted }}>Total {feedbacks.length} pengaduan masuk.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin" style={{ color: BLUE }} size={28} /></div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border" style={{ borderColor: theme.borderColor, color: theme.textMuted }}>Belum ada pengaduan.</div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map(fb => (
            <div key={fb.id} className="rounded-2xl border p-5" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${BLUE}, #7C3AED)` }}>
                    {(fb.user_name || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: theme.textMain }}>{fb.user_name || "Anonim"}</div>
                    <div className="text-xs" style={{ color: theme.textMuted }}>{new Date(fb.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: `${typeColors[fb.type] || BLUE}18`, color: typeColors[fb.type] || BLUE }}>
                    {fb.type}
                  </span>
                  <div className="flex">
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= fb.rating ? AMBER : "none"} stroke={s <= fb.rating ? AMBER : theme.textMuted} />)}
                  </div>
                </div>
              </div>

              <p className="text-sm mb-3 leading-relaxed" style={{ color: theme.textMain }}>{fb.message}</p>

              {fb.image && (
                <img src={`http://localhost:3000${fb.image}`} alt="Lampiran" className="rounded-xl max-h-40 object-cover mb-3" />
              )}

              {fb.reply ? (
                <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: `${GREEN}10`, borderLeft: `3px solid ${GREEN}` }}>
                  <CheckCircle size={14} style={{ color: GREEN }} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold mb-0.5" style={{ color: GREEN }}>Balasan Admin</div>
                    <div className="text-xs" style={{ color: theme.textMain }}>{fb.reply}</div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplyModal({ id: fb.id, text: "" })}
                  className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: BLUE }}
                >
                  <MessageCircle size={15} /> Balas Pengaduan
                </button>
              )}
              <div className="flex justify-end mt-2">
                <button onClick={() => handleDelete(fb.id)} className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:opacity-80 transition-opacity">
                  <Trash2 size={13} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="rounded-2xl shadow-2xl w-full max-w-md border" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.borderColor }}>
              <h3 className="font-bold" style={{ color: theme.textMain }}>Balas Pengaduan</h3>
              <button onClick={() => setReplyModal(null)}><X size={16} style={{ color: theme.textMuted }} /></button>
            </div>
            <div className="p-5 space-y-4">
              <textarea
                rows={4}
                value={replyModal.text}
                onChange={e => setReplyModal({ ...replyModal, text: e.target.value })}
                placeholder="Tulis balasan resmi Anda..."
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textMain }}
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setReplyModal(null)} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ color: theme.textMain, background: theme.inputBg }}>Batal</button>
                <button onClick={handleReply} disabled={isReplying || !replyModal.text.trim()} className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-70 flex items-center gap-2" style={{ background: BLUE }}>
                  {isReplying && <Loader2 size={14} className="animate-spin" />} Kirim Balasan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
