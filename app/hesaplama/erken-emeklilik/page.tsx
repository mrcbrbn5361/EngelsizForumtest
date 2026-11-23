import Link from 'next/link';
import { AlertTriangle, ExternalLink } from 'lucide-react';

export default function ErkenEmeklilikPage() {
  return (
    <div className="space-y-6">
      <div className="bg-[#111B2E] rounded-xl border border-[#1E293B] p-6 shadow-md space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400" aria-hidden="true" />
          <h1 className="text-xl font-black text-white">Erken Emeklilik Hesaplayıcısı Geçici Olarak Kapalı</h1>
        </div>
        <p className="text-sm text-[#CBD5E1] leading-relaxed">
          Bu hesaplayıcının kullandığı prim günü ve süre aralıkları mevzuatla karşılaştırılarak doğrulanıyor. Doğrulama bitene kadar sonuç gösterilmiyor.
        </p>
        <p className="text-sm text-[#CBD5E1] leading-relaxed">
          Kendi durumunuz için güncel şartları Sosyal Güvenlik Kurumu&apos;ndan ve mevzuattan öğrenebilirsiniz.
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="https://www.sgk.gov.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-indigo-300 font-bold hover:underline"
            >
              Sosyal Güvenlik Kurumu
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </li>
          <li>
            <a
              href="https://www.mevzuat.gov.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-indigo-300 font-bold hover:underline"
            >
              Mevzuat Bilgi Sistemi
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </li>
        </ul>
        <Link href="/hesaplama" className="inline-block text-sm font-bold text-white hover:underline">
          Diğer hesaplayıcılara dön
        </Link>
      </div>
    </div>
  );
}
