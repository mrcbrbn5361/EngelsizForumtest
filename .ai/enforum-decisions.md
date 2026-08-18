# EngelsizForum — Mimari ve Tasarım Kararları (Decisions Log)

**Tarih:** 2026-08-18  
**Durum:** ONAYLANDI (ACTIVE)  

---

## 1. Veri Modeli ve Canonical Tablo Kararları

### 1.1 Canonical Tablo: `topics` ve `comments`
* **Karar:** Veritabanındaki tek ve gerçek canonical tablolar `public.topics` ve `public.comments` olacaktır.
* **Gerekçe:** Kod tabanı genelinde `topics` ve `comments` üzerine yazılmış RLS politikaları, trigger'lar (`update_topic_counts_and_activity`) ve Full-Text Search tsvector kolonları mevcuttur.
* **Uyumluluk:** Geçmiş migration'lardan kalan `threads` ve `posts` yapıları yalnızca geriye dönük okuma amaçlı PostgreSQL VIEW olarak korunur; yeni kodlar doğrudan `topics` ve `comments` ile çalışır.

### 1.2 Auth ve Profil Senkronizasyonu
* **Karar:** `public.profiles` tablosu `auth.users` ile `id` üzerinden 1:1 bağlıdır. `handle_new_user` trigger'ı ile yeni kayıtlar otomatik profilleşir.
* **Güvenlik:** Kullanıcılar kendi rollerini (`role`) istemci taraflı değiştiremez. Yetki kontrolü `is_staff()` ve sunucu taraflı RPC ile yönetilir.

---

## 2. Marka, Görsel Kimlik ve Tasarım Sistemi Kararları

### 2.1 Renk Paleti ve Tematik Varlıklar
* **Karar:** EngelsizForum renk paleti sakin, göz yormayan, güven veren ve yüksek kontrastlı tonlardan oluşur:
  * Arka Plan (Slate Dark): `#090a0f` / `#0b0f19`
  * Yüzey/Kartlar: `#111726` (Sınır: `border-white/[0.08]`)
  * Vurgu Rengi (Sky Blue): `sky-400` / `sky-500` (Erişilebilirlik ve bilgi paylaşımını simgeler)
  * Durum Renkleri: `emerald-400` (Çözüldü / Çevrimiçi), `amber-400` (Beklemede), `rose-400` (Acil / Beğeni)
* **Kaldırılan Kalıntılar:** Tüm kripto, coin, token, borsa, yatırım, rastgele neon dashboard öğeleri tamamen engellenmiştir.

### 2.2 Tipografi
* **Karar:** Varsayılan font modern, net okunaklı sistem font ailesi + Plus Jakarta Sans olup, erişilebilirlik paneli üzerinden tek tıkla **OpenDyslexic** veya **Bionic Reading** moduna geçirilebilir.

---

## 3. SEO ve Medya Varlıkları Kararları

### 3.1 OG Image ve Favicon Standartları
* **Karar:** Sosyal medya paylaşımlarında ve Google aramalarında kesin geçerlilik için OG görselleri dinamik/statik Sharp derleyicisi ile doğrudan gerçek JPEG (`image/jpeg`) ve PNG (`image/png`) binary dosyaları olarak `public/og-image-v2.jpg` ve `public/og-image-v2.png` konumlarında üretilir.
* **Boyut:** `1200x630` piksel, tam sosyal medya kart uyumluluğu.
* **Canonical URL:** `https://www.engelsizforum.com` mutlak URL'si kullanılır.
