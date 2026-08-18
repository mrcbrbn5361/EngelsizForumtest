# Faz 0 — EngelsizForum Audit ve Kararlar

## 1. Proje Envanteri
- **Framework:** Next.js 15.4.9 (App Router), React 19.2.1
- **Styling & UI:** Tailwind CSS v4, Radix UI primitives, Lucide React (ikonlar), shadcn/ui bileşenleri.
- **Dependencies:** `@supabase/ssr`, `@supabase/supabase-js`, `motion`, `react-markdown`, `sharp`.
- **API & Middleware:** Çok sayıda Mastodon-compatible endpoint (`/api/v1/*`), MCP entegrasyon endpointleri (`/api/mcp*`), yapay zeka endpointleri (`/api/yeterly*`). 
- **Layouts:** `DashboardLayout` (geniş alanlarda finans/dashboard hissi veriyor), `SiteLayout`.

## 2. Mevcut Ürün Özellikleri & Eksikler

| Alan | Mevcut durum | Gerçek backend bağlantısı | Eksik/kırık nokta | Koruma/refactor kararı |
| --- | --- | --- | --- | --- |
| Auth | Var (Login/Register/OAuth) | Supabase Auth (Client/Server) | Auth callback ve hata senaryoları tam test edilmemiş. | Korunacak, Supabase SSR güncellenecek. |
| Profil | Var | Kısmi (profiles tablosu) | Avatar upload, detaylı gizlilik kontrolleri eksik. | Refactor, RLS politikaları sıkılaştırılacak. |
| Kategori | Var (`/categories`) | Zayıf | Admin paneli vs tam bağlı değil. | Sağlamlaştırılacak. |
| Topic | Var (`/discussions`) | Kısmi | Status (solved vs), tam RLS ve view counter mock olabilir. | Canonical `topics` tablosuna bağlanacak. |
| Comment | Var | Kısmi | Nested reply limiti ve editor özellikleri eksik. | Canonical `comments` ile sağlamlaştırılacak. |
| Search | Var (`/search`) | Mock/Zayıf | Full-text search pg_trgm veya tsvector yok. | DB tabanlı PostgreSQL tsvector aranacak. |
| Notification | Kısmi | Yok/Mock | Gerçek zamanlı bildirim ve okunma durumu. | `notifications` tablosuna eklenecek. |
| Message/chat | Kısmi (`/messages`) | Kısmi | Uçtan uca testleri ve block/mute sistemi. | Realtime ve RLS ile yeniden tasarlanacak. |
| Community | Var (`/communities`) | Kısmi | Public/Private izinleri, üyelik rolleri eksik. | RBAC / RLS ile desteklenecek. |
| Report | Zayıf | Yok | Güvenli anonim raporlama ve moderasyon queue. | Eklenip tam modül yapılacak. |
| SEO/OG | Kısmi | Dynamic `/api/og` | Binary format kontrolü eksik, canonical URL yok. | SEO audit sonrası düzeltilecek. |

## 3. Supabase Denetimi ve Canonical Schema Kararı
- Eski migrationlarda çok fazla "threads/posts" ve "topics/comments" çakışması veya dağınıklığı olduğu görülüyor (arşivlenen SQL dosyalarında tespit edildi).
- **Karar:**
  - Ana forum başlıkları: `topics`
  - Yanıtlar: `comments` (iç içe `parent_id` ile desteklenecek)
  - Kategoriler: `categories`
  - Topluluklar: `communities` (Scoped yetkiler için)
  - Tüm roller `profiles` tablosunda `role` ile tutulacak, ek yetkiler (community moderator vb.) ilişki tablolarıyla belirlenecek.
  - Sadece RLS tabanlı güvenlik (Token bazlı IoT scriptleri kaldırılacak).

## 4. Marka, Görsel Kimlik ve Vipcoin/Dashboard Hissiyatı
- **Bulgular:** 
  - Uygulamadaki `DashboardLayout` ve `dashboard` URL/bileşen isimlendirmeleri finans/crypto ürün hissi veriyor.
  - IoT cihazlarıyla "Visitor Tracking" (Ziyaretçi takip tokenleri) gibi forum dışı/baskın öğeler var.
  - Çok fazla Mastodon/Federation API kodları var, bu durum ana forum özelliklerini gölgeliyor.
- **Eylem Planı:**
  - `DashboardLayout` kaldırılacak, yerine `SiteLayout` veya `ForumLayout` (daha havadar, içerik odaklı, klasik forum layout'u) getirilecek.
  - Kripto, finans metrikleri, gereksiz ziyaretçi cihaz entegrasyonları silinecek.
  - Sadece erişilebilirlik, topluluk, bilgi paylaşımı ve dayanışma hissi veren **Sıcak Nötr (Warm Neutral)** bir tema oluşturulacak.

## 5. Uygulama Fazları Kararı
Faz 0 tamamlanmıştır. Arşivdeki SQL'ler temizlenmiş ve ilerleme dosyaları `.ai` altına eklenmiştir.
Sonraki adım **Faz 1 — Marka ve temel tasarım sistemi** olup `DashboardLayout` vb. bileşenlerin temizlenmesi ve gerçek forum arayüzüne geçilmesidir.
