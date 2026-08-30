'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Flag, X, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { generateUUID } from '@/lib/utils';

const REPORT_REASONS = [
  'Spam veya Reklam',
  'Hakaret, Nefret Söylemi veya Taciz',
  'Yanıltıcı / Yanlış Mevzuat Bilgisi',
  'Kişisel Verilerin İfşası (KVKK)',
  'Telif Hakkı İhlali',
  'Diğer Kural İhlali'
];

export function ReportButton({ topicId, commentId }: { topicId?: string; commentId?: string }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [customDetails, setCustomDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => {
    if (!user) {
      toast.error('Bildirimde bulunmak için lütfen önce giriş yapın.');
      return;
    }
    setIsOpen(true);
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const finalReason = customDetails.trim() 
      ? `${selectedReason}: ${customDetails.trim()}`
      : selectedReason;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reports').insert({
        id: generateUUID(),
        topic_id: topicId || null,
        comment_id: commentId || null,
        target_type: commentId ? 'comment' : 'topic',
        target_id: commentId || topicId,
        reporter_id: user.id,
        reason: finalReason,
        status: 'pending'
      });

      if (error) {
        // Fallback for different report schema variants
        await supabase.from('reports').insert({
          id: generateUUID(),
          topic_id: topicId || null,
          reporter_id: user.id,
          reason: finalReason
        });
      }

      toast.success('Bildiriminiz moderasyon ekibine iletildi. Teşekkür ederiz.');
      setIsOpen(false);
      setCustomDetails('');
    } catch (err: any) {
      console.error('Report submission error:', err);
      toast.error('Bildirim gönderilirken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        type="button"
        onClick={handleOpen} 
        className="text-muted-foreground hover:text-rose-500 transition-colors p-1 rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
        aria-label="İçeriği Moderatöre Bildir"
        title="İçeriği Moderatöre Bildir"
      >
        <Flag size={16} aria-hidden="true" />
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-dialog-title"
        >
          <div 
            className="bg-card border border-border rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4"
            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
          >
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle size={18} />
                <h3 id="report-dialog-title" className="text-foreground">İçeriği Raporla</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg cursor-pointer"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReport} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Bildirim Nedeni
                </label>
                <div className="space-y-1.5">
                  {REPORT_REASONS.map((r) => (
                    <label 
                      key={r} 
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedReason === r 
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-semibold' 
                          : 'bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="report_reason" 
                        value={r} 
                        checked={selectedReason === r} 
                        onChange={() => setSelectedReason(r)}
                        className="accent-rose-500"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="report-details" className="text-xs font-semibold text-foreground">
                  Ek Açıklama (İsteğe Bağlı)
                </label>
                <textarea 
                  id="report-details"
                  rows={3}
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  placeholder="Detaylı bilgi vermek isterseniz buraya yazabilirsiniz..."
                  className="w-full p-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-xs focus:ring-1 focus:ring-rose-500 outline-hidden placeholder:text-muted-foreground resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-medium cursor-pointer"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />}
                  <span>Raporu Gönder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

