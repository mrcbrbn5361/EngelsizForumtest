# Google Gelişmiş İzin Modu (Advanced Consent Mode) ve Ek Gizlilik Ayarları Uygulama Planı

Bu plan, Google Tag Platform resmi geliştirici kılavuzu doğrultusunda sitemizdeki izin altyapısını **Gelişmiş İzin Modu (Advanced Consent Mode)** seviyesine yükseltmeyi ve ek veri gizliliği mekanizmalarını entegre etmeyi kapsamaktadır.

---

## 1. Gelişmiş İzin Modu ve Ek Güvenlik Parametreleri (`app/layout.tsx`)
Google dokümantasyonundaki resmi kurallara uygun olarak:
- **`ads_data_redaction: true`**: Kullanıcı reklam çerezlerini reddettiğinde (`ad_storage: 'denied'`), Google etiketlerinin ağ isteklerindeki reklam tıklama tanımlayıcılarını sansürleyerek tam veri gizliliği sağlaması.
- **`url_passthrough: true`**: Çerez kullanımına izin verilmeyen durumlarda bile dönüşüm ve ziyaret kayıplarını önlemek için URL üzerinden güvenli parametre geçişinin aktifleştirilmesi.
- **Hiyerarşik Sıralama:** `gtag('consent', 'default', ...)` ve `gtag('set', ...)` komutlarının `gtag('config', 'G-XBFZ4BS7GJ')` çalışmadan önce ilk sırada çalıştırılması.

## 2. İzin Güncelleme ve Çerez Banner'ı Senkronizasyonu (`cookie-consent-banner.tsx`)
- Banner üzerinden "Tümünü Kabul Et", "Reddet" veya "Özelleştir" seçildiğinde:
  - `analytics_storage`
  - `ad_storage`
  - `ad_user_data`
  - `ad_personalization`
  parametrelerinin anında `gtag('consent', 'update', { ... })` ile canlı güncellenmesi.
- `dataLayer` geçmişine onay kaydının doğru sırada yazılması.

## 3. Doğrulama ve Test Adımları
- **Tag Assistant & GCS/GCD Parametreleri:**
  - Onay öncesi: Ağ isteklerinde `gcs=G100` (hiçbir izne onay verilmemiş durum).
  - Onay sonrası: Ağ isteklerinde `gcs=G111` (analitik ve reklam onaylı durum).
- **Google Analytics Panelinde:** İzin modu durumu otomatik olarak "Gelişmiş İzin Modu Aktif" olarak yeşile dönecektir.
