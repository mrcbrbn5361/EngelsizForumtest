import ClassicPostBit from '@/components/forum/classic-post-bit';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function DemoThread() {
  const posts = [
    {
      id: "1",
      author: {
        name: "Bora",
        role: "MODERATÖR" as const,
        joinedDate: "15 Haz 2021",
        messageCount: "1,245",
        likeScore: "850",
        isOnline: true
      },
      date: "Bugün 14:30",
      postNumber: "1",
      content: "Selamlar herkese, 2026 yılı ÖTV muafiyetli araç alım limitleri hakkında resmi gazete duyurusu henüz yayınlanmadı ancak beklenen artış oranı %44 civarında. Bu durumda limitin yaklaşık 2.3 milyon TL bandına çıkmasını öngörüyoruz. Rapor alım sürecinde olan arkadaşlarımızın heyet randevularını şimdiden planlamalarını öneririm.",
      signature: "Engelsiz erişim, herkesin hakkıdır."
    },
    {
      id: "2",
      author: {
        name: "HukukDanismani",
        role: "UZMAN" as const,
        joinedDate: "20 Oca 2022",
        messageCount: "542",
        likeScore: "1,120",
        isOnline: false
      },
      date: "Bugün 14:45",
      postNumber: "2",
      content: "Bora Bey'in belirttiği gibi, yeniden değerleme oranı bu yıl oldukça yüksek. Ancak raporların 'süresiz' olması avantaj sağlasa da, bazı bayilerin ek ücret (aksesuar adı altında) talep etmesi hala bir sorun. Bu tür durumlarla karşılaşan üyelerimizin fatura detaylarını mutlaka kontrol etmesi gerekiyor.",
      signature: "Yasal haklarınızı bilmek, en büyük gücünüzdür."
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Thread Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-[#212529] mb-1">
          <span className="bg-red-600 text-white text-[11px] px-2 py-0.5 rounded-sm align-middle mr-2 uppercase">Önemli</span>
          2026 ÖTV Muafiyet Limitleri ve Araç Alım Süreci
        </h1>
        <div className="flex items-center gap-2 text-[12px] text-slate-500">
          <span>Konuyu başlatan: <span className="text-[#18587a] font-semibold">Bora</span></span>
          <span>•</span>
          <span>Başlangıç tarihi: 15 Haz 2021</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Thread Posts */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            {posts.map((post) => (
              <ClassicPostBit key={post.id} {...post} />
            ))}
          </div>

          {/* Quick Reply Placeholder */}
          <div className="xf-block mt-4">
            <div className="xf-block-header">Hızlı Cevap</div>
            <div className="p-4">
              <textarea 
                className="w-full border border-[#d8dee4] p-3 min-h-[150px] text-sm focus:outline-none focus:border-[#18587a] mb-3"
                placeholder="Mesajınızı buraya yazın..."
              ></textarea>
              <div className="flex justify-end">
                <button className="bg-[#204060] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#18587a] transition-colors">
                  Mesajı Gönder
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <ClassicSidebar />
      </div>
    </div>
  );
}
