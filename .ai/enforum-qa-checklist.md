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

## 4. Güvenlik ve Veritabanı (RLS)
- [x] `topics`, `comments`, `profiles`, `categories` tablolarında RLS aktif.
- [x] Anonim kullanıcıların yetkisiz yazma eylemleri engelli.
- [x] `is_staff()` kontrolü ile moderatör yetki izolasyonu sağlandı.
