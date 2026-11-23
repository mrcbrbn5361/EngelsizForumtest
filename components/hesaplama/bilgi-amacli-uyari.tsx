import React from 'react';
import { Info } from 'lucide-react';

/**
 * Hesaplayıcı sonuçlarının altında gösterilen ortak uyarı cümlesi; rakamlarDogrulaniyor ile mevzuat rakamlarının doğrulandığı notu eklenir.
 */
export default function BilgiAmacliUyari({ rakamlarDogrulaniyor = false }: { rakamlarDogrulaniyor?: boolean }) {
  return (
    <p
      role="note"
      className="flex items-start gap-2 text-xs text-[#CBD5E1] leading-relaxed border border-[#1E293B] bg-[#0B1220] rounded-md px-3 py-2"
    >
      <Info size={14} className="mt-0.5 shrink-0 text-indigo-400" aria-hidden="true" />
      <span>
        Bu sonuç bilgi amaçlıdır; kesin kararı ilgili kurum verir.
        {rakamlarDogrulaniyor && ' Kullanılan mevzuat rakamları resmî kaynaktan doğrulanıyor.'}
      </span>
    </p>
  );
}
