# EngelsizForum - Sayfa Bazlı Geliştirme ve Parlatma Planı

Bu plan, EngelsizForum platformundaki her bir sayfayı sırayla ele alarak "premium", "üretim kalitesinde" ve "mükemmel erişilebilir" hale getirmeyi amaçlar. Her bir adım tamamlandığında çalışma durdurulacak, kullanıcının onayı istenecek ve ancak "Devam" onayından sonra bir sonraki adıma geçilecektir.

---

## 🛠️ Sayfa Bazlı Sıralı Yol Haritası

### [x] ADIM 0: Altyapı Hazırlığı ve Veritabanı Kurulumu (Tamamlandı)
- Veritabanı şemalarının, Supabase bağlantısının ve kimlik doğrulama süreçlerinin tamamlanması.

---

### [x] ADIM 1: Ana Sayfa (Homepage) - `/app/page.tsx` & `/components/forum/forum-index-client.tsx` (Tamamlandı)
- **Tasarım & Görsellik:** Kahraman (Hero) bölümünün modern, yüksek kontrastlı ve büyüleyici bir görsel hiyerarşiye kavuşturulması. Akıcı Framer Motion mikro-animasyonları.
- **İçerik & Derinlik:** WCAG 2.1 AA uyumlu düzen, zengin GEO içeriği, istatistik kartlarının parlatılması.
- **Gerçek Yapay Zeka Copilot Entegrasyonu:** AI Copilot sohbet kutusunun sadece simülasyon değil, sunucu tarafındaki `/api/copilot` rotası üzerinden gerçek bir **Gemini (gemini-2.5-flash)** API entegrasyonu ile canlandırılması.
- **Erişilebilirlik:** Ekran okuyucu testleri, semantik etiketlerin (main, section, h1-h6) doğruluğu, odak yönetimi (focus rings).

---

### [x] ADIM 2: Tartışmalar Akış Sayfası (Discussions Feed) - `/app/discussions/page.tsx` (Tamamlandı)
- **Tasarım & Düzen:** Forum başlıklarının listelendiği akış sayfasının sıradan bir liste yerine, premium kart tasarımları, filtreleme seçenekleri (Çözülmüş, Popüler, Sabitlenenler) ve etiket yapısıyla modern bir sosyal ağ akışına dönüştürülmesi.
- **Erişilebilirlik:** Her tartışma kartı için klavye odağı, duyulabilir (screen-reader) etiketler ve klavyeyle kolay etkileşim.
- **AI Destekleyici Özellikler:** Konu özetlerinin liste görünümünde hızlıca gösterilebilmesi.

---

### [x] ADIM 3: Tartışma Detay Sayfası (Discussion Detail) - `/app/discussions/[id]/page.tsx` (Tamamlandı)
- **Tasarım & Hiyerarşi:** Yazar bilgileri, konunun ana metni (zengin Markdown ve Biyonik Okuma desteğiyle) ve cevapların (comments) mükemmel şekilde hizalanmış, okumayı kolaylaştıran bir tipografiyle sunulması.
- **Yapay Zeka Özetleme (TL;DR):** Çok uzun tartışmaları tek tuşla özetleyen (Birincil olarak Yeterly AI, ikincil/yedek olarak Gemini 3.5 Flash entegrasyonu ve akıllı yerel yedekleme mekanizmalı) lüks bir özet bileşeni.
- **Seslendirme Desteği (Text-to-Speech):** Gönderilerin ve yanıtların sesli okunabilmesi, hız ve ses tonu ayarı, anlık seslendirilen kelimeyi dinamik vurgulama (word marking).
- **Yorum Sistemi:** Kullanıcıların kolayca, hiyerarşik (nested replies) şekilde yanıt yazabileceği form alanı, en iyi çözüm işaretleme, beğeniler.

---

### [x] ADIM 4: Yeni Tartışma Oluşturma Sayfası (New Discussion) - `/app/discussions/new/page.tsx` (Tamamlandı)
- **Tasarım & Formlar:** Form alanlarının (başlık, kategori seçimi, içerik) kullanıcıyı yormayan, net hata bildirimleri sunan modern bir arayüze kavuşturulması.
- **Erişilebilir Editör:** Görme ve motor engelli kullanıcılar için tamamen klavye uyumlu, zengin Markdown veya düz metin editör alanı.
- **Yapay Zeka Alt Metin Önerisi (Alt-Text Generator):** Görsel yüklemelerinde yapay zekanın (Gemini Vision) otomatik olarak yüksek kaliteli betimleyici alt metin önermesi.
- **Sürükle-Bırak Görsel Desteği:** Editöre doğrudan sürüklenen görsellerin, otomatik olarak AI tarafından betimlenip erişilebilirlik alt-metni ile birlikte konuya yüklenmesi.

---

### [x] ADIM 5: Topluluklar Listesi Sayfası (Communities List) - `/app/communities/page.tsx` (Tamamlandı)
- **Tasarım & Bento Grid:** Farklı ilgi alanlarına (Görme, İşitme, Ortopedik, Bilişsel) hitap eden toplulukların (kategorilerin) bento grid tarzında, özel renk paletleri ve modern ikonlarla sergilenmesi.
- **İçerik:** Her topluluğun amacını ve kurallarını açıklayan zengin, derinlikli içerikler.
- **Kapsayıcılık:** Kullanıcıların ilgi alanlarına göre topluluklara katılma (join) butonları ve etkileşimleri.
- **Filtreler & Kurallar:** İlgi alanlarına göre dinamik bento gruplama ve her topluluk için erişilebilir modal tabanlı kural/rehber penceresi.

---

### [x] ADIM 6: Topluluk Detay Sayfası (Community Detail) - `/app/communities/[id]/page.tsx` (Tamamlandı)
- **Tasarım & Kimlik:** O topluluğa özel bir afiş (banner), istatistikler (üye sayısı, aktiflik derecesi) ve o topluluğa özel açılmış başlıkların akışı.
- **Filtreleme & Arama:** Topluluk içindeki konuları hızlıca filtreleme aracı.

---

### [x] ADIM 7: Kullanıcı Profili Sayfası (User Profile) - `/app/profile/page.tsx` (Tamamlandı)
- **Tasarım & Kartlar:** Kullanıcının seviyesi (Level), kazandığı rozetler (Erişilebilirlik Şampiyonu, Uzman Yazar vb.), zeka puanları (XP) ve geçmiş aktivitelerinin lüks, bento-grid yapılı bir profil sayfasında sunulması.
- **Erişilebilirlik Tercihleri:** Kullanıcının yüksek kontrast, disleksi dostu font, biyonik okuma gibi ayarlarının veritabanına kalıcı olarak kaydedilip her cihazda otomatik yüklenmesini sağlayan ayar paneli.

---

### [x] ADIM 8: Giriş Yap Sayfası (Login) - `/app/login/page.tsx` (Tamamlandı)
- **Tasarım:** Gözü yormayan, minimal, simetrik ve güven veren modern bir giriş ekranı.
- **Erişilebilirlik:** Ekran okuyucu dostu form etiketleri, anlaşılır klavye hata uyarıları ve "Beni Hatırla" gibi standart dışı erişilebilir eklentiler.

---

### [x] ADIM 9: Kayıt Ol Sayfası (Register) - `/app/register/page.tsx` (Tamamlandı)
- **Tasarım:** Adım adım (step-by-step) ilerleyen veya tek ekranda son derece organize edilmiş, kolay anlaşılır kayıt formu.
- **Erişilebilirlik Tercihleri İlk Kurulumu:** Kayıt olurken kullanıcının engel durumuna/ihtiyaçlarına göre arayüzü otomatik optimize eden hızlı erişilebilirlik sihirbazı.

---

### [x] ADIM 10: Hakkımızda Sayfası (About Us) - `/app/about/page.tsx` (Tamamlandı)
- **Tasarım & Hikaye Anlatımı:** Platformun misyonunu, vizyonunu ve "Bariyersiz bir gelecek" hikayesini anlatan, geniş boşluklar ve zarif tipografi ile süslenmiş editoryal (Editorial/Serif) bir sayfa düzeni.
- **Etkileşim:** Ekip üyeleri ve katkıda bulunanlar kartları, WCAG uyumluluk beyanı ve açık kaynak katkı rehberi.

---

### [x] ADIM 11: Veritabanı Şeması Uygulaması (Database Migration)
- **Supabase Entegrasyonu:** Kullanıcı profilleri, erişilebilirlik tercihleri, forum tartışmaları ve rozet sistemini kapsayan veritabanı tablolarının SQL ile Supabase üzerinde oluşturulması. (Tamamlandı)

### [x] ADIM 12: Kapsamlı SQL Analizi ve Üretimi
- **Analiz & Dokümantasyon:** Tüm adımlarda tasarlanan özelliklerin veri gereksinimlerinin analiz edilmesi.
- **Kapsamlı SQL:** Platformun tüm ihtiyaçlarını karşılayan (tablolar, ilişkiler, fonksiyonlar, tetikleyiciler) bütüncül bir SQL scriptinin hazırlanması. (Tamamlandı)

---

### [x] ADIM 13: Arama Sayfası (Search Page) - `/app/search/page.tsx`
- **Tasarım & Sonuç Hiyerarşisi:** Arama sonuçlarının başlıklar, topluluklar ve kullanıcılar şeklinde kategorize edilmiş, net okunabilir ve hızlı filtrelenebilir lüks bir arama sonuçları sayfası.
- **Yapay Zeka Destekli Akıllı Arama:** Kullanıcının doğal dildeki sorularını anlayıp (örn: "ÖTV muafiyetli araç raporu nasıl alınır?") en alakalı tartışmaları bulan akıllı yapay zeka arama asistanı.

### [x] ADIM 14: Veritabanı Tohumlama (Database Seeding)
- **Gerçek Veri Entegrasyonu:** Forum kategorileri, başlangıç başlıkları ve kullanıcı yapısının SQL ile `/supabase/seed.sql` dosyasına aktarılması. Mock verilerden kurtularak gerçek veritabanı yapısına geçiş.

---

### [x] ADIM 15: Hata Giderme ve Stabilizasyon (Bug Fixing)
- **İlişki Hataları:** Supabase üzerinde 'topics' ve 'profiles' tabloları arasındaki ilişki belirsizliklerini `!topics_author_id_fkey` gibi açık anahtar referansları ile giderildi.
- **Veritabanı Kısıtlamaları:** Eksik olan Foreign Key (Yabancı Anahtar) kısıtlamalarını ekleyen `fix_discussions.sql` betiği hazırlandı.
- **Derleme Hataları:** Eksik ikon importları ve tip hataları düzeltildi.

---

## 🚦 Çalışma Kuralları
1. **Her adımda yalnızca tek bir sayfa üzerinde çalışılacaktır.**
2. **Asla adımlar atlanmayacak veya otomatik devam edilmeyecektir.**
3. **Her adım bittiğinde çalışma duracak ve kullanıcıdan onay beklenecektir.**
4. **Kullanıcı "Devam" dediğinde bir sonraki adıma geçilecektir.**
