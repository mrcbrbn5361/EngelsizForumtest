import Link from 'next/link';

export const WRITE_LOCK_MESSAGE = 'Forumu yeniliyoruz. Bu sürede yeni konu ve cevap yazılamıyor. Bilgi sayfaları ve hesaplayıcılar açık.';

/**
 * Explains that writing is closed while the forum is being renewed and points to the pages that stay open.
 * Pages whose only content is this notice pass headingLevel 1 so the page still has a level-one heading.
 */
export default function WriteLockNotice({ title = 'Bu özellik şimdilik kapalı', headingLevel = 2 }: { title?: string; headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <section className="border border-[#1E293B] bg-[#111B2E] rounded-md p-5 text-slate-200" aria-labelledby="write-lock-title">
      <Heading id="write-lock-title" className="text-sm font-bold text-white mb-2">{title}</Heading>
      <p className="text-xs sm:text-sm leading-relaxed text-slate-300 mb-4">{WRITE_LOCK_MESSAGE}</p>
      <div className="flex flex-wrap gap-3 text-xs font-semibold">
        <Link href="/discussions" className="text-indigo-300 underline hover:text-white">Konuları oku</Link>
        <Link href="/hesaplama" className="text-indigo-300 underline hover:text-white">Hesaplayıcılar</Link>
      </div>
    </section>
  );
}
