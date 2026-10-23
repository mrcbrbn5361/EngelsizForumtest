# Özel İzin Banner'ı ve Google Consent Mode v2 Uygulama Planı

Bu plan, Google Analytics izin modu panelinde yer alan **"Özel bir izin banner'ı kullanıyorum"** seçeneğini eksiksiz karşılamak üzere, EngelsizForum'a özel, tam erişilebilir (WCAG AAA) ve KVKK/GDPR uyumlu bir çerez ve veri izni yönetim banner'ı entegre edilmesini kapsamaktadır.

---

## 1. Google Consent Mode v2 Kod Entegrasyonu
- **Dosya:** `app/layout.tsx`
- **İşlem:** Google etiketi (`gtag.js`) yüklenmeden hemen önce varsayılan izin durumunu (`consent default`) tanımlamak:
  - `analytics_storage`: 'denied' (Kullanıcı onay verene kadar varsayılan kapalı)
  - `ad_storage`: 'denied'
  - `ad_user_data`: 'denied'
  - `ad_personalization`: 'denied'
  - `wait_for_update`: 500ms
- Kullanıcı önceden onay vermişse `localStorage`'dan bu tercihler anında okunup güncellenir.

## 2. Özel İzin Banner'ı Bileşeni (`CookieConsentBanner`)
- **Dosya:** `components/layout/cookie-consent-banner.tsx`
- **Özellikler:**
  - **Erişilebilirlik (WCAG 2.1 AAA):** Ekran okuyucu uyumlu (`role="dialog"`, `aria-label`, `aria-describedby`), klavye ile `Tab` ile erişilebilir ve `Esc` ile kapatılabilir.
  - **Tasarım:** Sitenin mevcut karanlık/yüksek kontrast tasarımına tam uyumlu, mobilde ve masaüstünde ekranı engellemeyen kompakt alt şerit.
  - **Aksiyonlar:**
    1. **Tümünü Kabul Et:** Tüm analitik ve reklam izinlerini `'granted'` yapar ve tercihi kaydeder.
    2. **Tümünü Reddet:** Yalnızca zorunlu çerezleri aktif bırakıp Google izinlerini `'denied'` olarak tutar.
    3. **Özelleştir (Modal/Açılır Bölüm):** Kullanıcının zorunlu, analitik ve pazarlama çerezlerini bağımsız olarak açıp kapatabilmesini sağlar.
  - **Kalıcılık:** Tercih `localStorage` (`engelsizforum_cookie_consent`) içinde saklanır ve banner tekrar gereksiz yere gösterilmez.

## 3. Yeniden Tercih Düzenleme (Footer Entegrasyonu)
- **Dosya:** `components/layout/footer.tsx`
- **İşlem:** Footer bölümüne "Çerez Tercihlerini Güncelle" butonu eklenerek kullanıcının istediği an izinlerini değiştirebilmesi sağlanır.

## 4. Google Analytics Panelindeki Sonraki Adım
- Google Analytics arayüzünde **"Özel bir izin banner'ı kullanıyorum"** seçeneği işaretlenip sonraki adıma geçildiğinde sistem otomatik olarak hazır ve uyumlu olacaktır.

---

## Doğrulama ve Test
- Sayfa ilk açıldığında banner'ın düzgün belirmesi.
- Kabul et / Reddet butonlarına basıldığında `gtag('consent', 'update', ...)` fonksiyonunun doğru tetiklenmesi.
- Sayfa yenilendiğinde tercihin hatırlanması.
- Mobil ve masaüstü arayüzlerde layout shift veya taşma olmaması.
