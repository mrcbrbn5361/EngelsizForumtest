import Link from 'next/link';

export const WRITE_LOCK_MESSAGE = 'Forumu yeniliyoruz. Bu sürede yeni konu ve cevap yazılamıyor. Bilgi sayfaları ve hesaplayıcılar açık.';

/**
 * Explains that writing is closed while the forum is being renewed and points to the pages that stay open.
 */
export default function WriteLockNotice({ title = 'Bu özellik şimdilik kapalı' }: { title?: string }) {
  return (
    <section className="border border-[#1E293B] bg-[#111B2E] rounded-md p-5 text-slate-200" aria-labelledby="write-lock-title">
      <h2 id="write-lock-title" className="text-sm font-bold text-white mb-2">{title}</h2>
      <p className="text-xs sm:text-sm leading-relaxed text-slate-300 mb-4">{WRITE_LOCK_MESSAGE}</p>
      <div className="flex flex-wrap gap-3 text-xs font-semibold">
        <Link href="/discussions" className="text-indigo-300 underline hover:text-white">Konuları oku</Link>
        <Link href="/hesaplama" className="text-indigo-300 underline hover:text-white">Hesaplayıcılar</Link>
      </div>
    </section>
  );
}
