# EngelsizForum — QA & Kabul Kriterleri Kontrol Listesi (QA Checklist)

**Tarih:** 2026-08-18  

---

## 1. Marka ve Tasarım Bütünlüğü (Faz 1)
- [x] Kripto, coin, finans, dashboard veya Vipcoin tasarım kalıntısı sıfırlandı.
- [x] Renk hiyerarşisi `#090a0f` / `#0b0f19` ve `sky-400` tonlarıyla erişilebilir kılındı.
- [x] Başlık ve kategori yapıları klasik/modern forum düzeninde dengelendi.
- [x] Canlı sayaçlar ve tartışma listesi gerçek Supabase verilerine bağlandı.

## 2. SEO & Varlık Doğrulaması
- [x] `public/og-image-v2.jpg` (1200x630 JPEG, magic byte `FF D8 FF`) üretildi ve doğrulandı.
- [x] `public/og-image-v2.png` (1200x630 PNG, magic byte `89 50 4E 47`) üretildi ve doğrulandı.
- [x] `public/favicon.ico` geçerli Windows ICO container formatında hazırlandı.
- [x] Metadata `app/layout.tsx` içinde 1200x630 mutlak URL ile yapılandırıldı.

## 3. Erişilebilirlik (WCAG 2.1 AAA / 2.2 AA)
- [x] Skip link (`#main-content` atlama) mevcut.
- [x] ARIA APG dialog, dropdown ve tab listeleri doğru `role` ve `aria-*` özniteliklerine sahip.
- [x] Yüksek kontrast, OpenDyslexic ve Bionic Reading filtreleri anında tetikleniyor.
- [x] Klavye odak çerçeveleri (`focus-visible:ring-2 focus-visible:ring-sky-500`) tüm etkileşimli öğelerde net görünür.

## 4. Güvenlik ve Veritabanı (RLS) (Faz 2)
- [x] Canonical model bütünlüğü (`topics`, `comments`, `reactions`, `bookmarks`, `reports`, `notifications`, `profiles`) sağlandı.
- [x] `topics`, `comments`, `profiles`, `categories`, `reactions`, `bookmarks`, `reports` tablolarında RLS aktif ve doğrulanmış.
- [x] Anonim kullanıcıların yetkisiz yazma/silme eylemleri RLS ile engelli.
- [x] `is_staff()` kontrolü ile moderatör/yönetici yetki izolasyonu sağlandı.
- [x] Test topic ID'leri veritabanından temizlendi (TEST_FIXTURES: CLEANED).
- [x] Topic listesi gerçek Supabase verilerini dönüyor.
- [x] `20260818000000_phase2_core_hardening.sql` migrasyonu hazırlandı ve uygulandı.
- [x] `toggle_topic_solution`, `toggle_topic_bookmark`, `increment_views` RPC'leri güvenli biçimde tanımlandı.

## 5. Auth, Profil, Gizlilik ve İzinler (Faz 3)
- [x] `lib/permissions.ts` ile rol ve hesap durumu (`isAccountActive`, `isStaff`, `isAdmin`) denetimleri merkezileştirildi (KOD: PASS).
- [x] `sanitizeProfileUpdatePayload` ile istemci tarafından rol yükseltme (privilege escalation) engellendi (KOD: PASS).
- [x] `sanitizeAccessibilityPrefs` ile erişilebilirlik ayarları güvenli sınırlar içinde tutuldu (KOD: PASS).
- [x] `app/profile/page.tsx` üzerinde profil bilgileri, gizlilik seviyesi, çevrimiçi durum ve bildirim tercihleri entegrasyonu tamamlandı (KOD: PASS).
- [x] Korumalı rotalar (`/settings`, `/admin`, `/moderation`, `/discussions/new`, `/messages`, `/notifications`) middleware ile güvenceye alındı (KOD: PASS).
- [x] Open Redirect saldırılarına karşı `sanitizeRedirectUrl` eklendi (KOD: PASS).
- [x] Genişletilmiş rozet sistemi (`Kurucu`, `Sahip`, `Yönetici`, `Moderatör`, `Uzman`, `Onaylı`, `Destek`, `Üye`) erişilebilir ARIA etiketleriyle oluşturuldu (KOD: PASS).
- [x] `20260818000001_phase3_auth_profile_privacy_permissions.sql` migrasyon dosyası oluşturuldu ve Supabase'te uygulandı (MIGRATION: APPLIED).
- [x] TypeScript derlemesi (`npx tsc --noEmit: PASS`) ve Next.js build (`compile_applet: PASS`) 0 hata ile doğrulandı.
- [x] Faz 3 Supabase SQL migrasyonu harici veritabanında çalıştırıldı (`MIGRATION_STATUS: APPLIED`).
- [x] Database RLS/Yetki testleri ve trigger'lar (`trg_prevent_profile_role_escalation`, `is_account_active`, `has_category_permission`) Supabase SQL editöründe doğrulandı (`RLS_TESTS: PASS`).

