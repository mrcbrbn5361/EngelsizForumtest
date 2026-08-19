# EngelsizForum QA & Acceptance Checklist

## [x] Faz 0 - Audit & Sistem İncelemesi
- [x] Proje envanteri, Supabase şeması ve canlı site denetimi yapıldı
- [x] Schema drift riskleri tespit edildi ve canonical model (threads/topics, messages, profiles) belirlendi
- [x] `.ai/` durum takip dosyaları oluşturuldu

## [x] Faz 1 - Marka ve Tasarım Sistemi (Vipcoin & Crypto Tasfiyesi)
- [x] Vipcoin, coin, fintech ve crypto görsel unsurları tamamen tasfiye edildi
- [x] EngelsizForum özgün forum tasarım sistemi ve tipografi hiyerarşisi uygulandı
- [x] Light / Dark / High Contrast renk tokenları ve semantic styling entegre edildi
- [x] Responsive layout (Mobil, Tablet, Masaüstü) doğrulandı

## [x] Faz 2 - Çekirdek Veri, DM Sesli Mesaj, Avatar ve Çevrimiçi Varlık
- [x] DM sesli mesaj gönderme ve oynatma (`AudioMessagePlayer`, `sendMessageAction`, `media_url`/`audio_url` senkronizasyonu)
- [x] Profil ve üye listesi avatarları için `size="2xl"` ve `fit="cover" | "contain"` iyileştirmesi
- [x] Çevrimiçi üye sayısının (`onlineCount`, 5 dakikalık presence eşiği) Supabase'den gerçek zamanlı sorgulanması
- [x] `conversation-list` ve forum satırlarındaki sabit `isOnline` değerlerinin kaldırılıp `lib/presence.ts` ile bağlanması

## [ ] Faz 3 & 4 - Klasik Forum Çekirdeği & Yetkilendirme Sağlamlaştırma
- [x] Konu oluşturma, düzenleme, sabitleme (pin) ve kilitleme (lock) akışları
- [x] Cevap yazma, alıntılama (quote), çözüm olarak işaretleme (mark solution)
- [x] Reaksiyonlar (beğeni, teşekkür, faydalı, destekleyici) ve yer imleri (bookmarks)
- [x] Arama, filtreleme ve etiket keşfi URL senkronizasyonu
- [ ] Topluluk ve kategori moderatör scope testleri

## [ ] Faz 5 - Discovery & İletişim Modülleri
- [x] Global Full-Text Search
- [x] Bildirim merkezi ve okunmamış takibi
- [x] Birebir DM (Direct Messages) ve sesli mesaj iletişimi

## [ ] Faz 6 - Bilgi ve Kaynak Modülleri
- [x] Rehberler, makaleler ve kaynak dizini
- [x] Etkinlikler ve takvim akışı
- [x] Soru-Cevap (Q&A) ve çözüm akışları

## [ ] Faz 7 - Moderasyon ve Güvenlik
- [x] İçerik raporlama (Report dialog ve backend mutation)
- [x] Moderasyon kuyruğu ve işlem yetkileri
- [x] Güvenli RLS ve kullanıcı verisi gizliliği

## [x] Faz 8 - Erişilebilirlik (WCAG 2.2 AA)
- [x] Semantik HTML landmark'ları (`header`, `main`, `nav`, `aside`, `footer`)
- [x] Tam klavye navigasyonu ve odak göstergeleri (visible focus rings)
- [x] Ekran okuyucu duyuruları, aria etiketleri ve live regions
- [x] `prefers-reduced-motion` ve kontrast uyumluluğu

## [x] Faz 9 - SEO, Metadata ve Paylaşım
- [x] Dinamik başlık ve açıklamalar
- [x] Canonical URL'ler ve OpenGraph / Twitter metadata
- [x] Structured Data (JSON-LD: DiscussionForumPosting, BreadcrumbList)

## [x] Faz 10 - Kalite Kapısı & Nihai Testler
- [x] TypeScript tip denetimi (`tsc --noEmit`): 0 hata
- [x] ESLint denetimi (`npm run lint`): 0 hata
- [x] Production build (`npm run build`): Başarılı

