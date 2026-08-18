# EngelsizForum — Hata Teşhis ve Çözüm Günlüğü (Errors Log)

**Tarih:** 2026-08-18  

---

### Hata Kaydı: OG Image Invalid/Undefined File Type (ÇÖZÜLDÜ)
* **Kök Neden:** Next.js build sırasında statik asset dizininde OG görselinin HTML veya eksik binary ile derlenmesi ya da geçersiz mime-type döndürmesi.
* **Uygulanan Çözüm:** Sharp derleyicisi ile doğrudan gerçek JPEG (`FF D8 FF`) ve PNG (`89 50 4E 47`) binary dosyaları `public/og-image-v2.jpg` ve `public/og-image-v2.png` olarak üretildi. `scripts/verify-og-image.mjs` test komutu eklendi.
* **Doğrulama Sonucu:** `npm run verify:og` ve `npm run build` hatasız tamamlandı.

---

### Hata Kaydı: Phase 3 Type Mismatch in PrivacySettings & Profile Role (ÇÖZÜLDÜ)
* **Kök Neden:** 
  1. `lib/permissions.ts` ve `types/database.ts` içindeki `PrivacySettings` arayüzünde `profile_visibility` ve `allow_direct_messages` yalnızca `boolean` olarak tanımlanmıştı; ancak UI (`app/profile/page.tsx`) 3 seçenekli string union (`'public' | 'members' | 'private'`) kullanıyordu.
  2. `hooks/use-role.ts` içerisindeki `role === 'founder'` ve `role === 'owner'` karşılaştırmaları, `Profile.role` tipinde bu roller bulunmadığı için TS2367 hatasına yol açıyordu.
* **Uygulanan Çözüm:** 
  1. `types/database.ts` ve `lib/permissions.ts` içindeki `PrivacySettings` ve `Profile` modelleri hem string union hem de boolean destekleyecek şekilde güncellendi.
  2. `Profile.role` tanımına `founder`, `owner`, `expert`, `verified`, `support`, `member` rolleri dahil edildi.
* **Doğrulama Sonucu:** `npx tsc --noEmit: PASS`, `compile_applet: PASS`, `lint_applet: PASS`.

---

### Hata Kaydı: Phase 4 Duplicate Export & Accidental URL-Encoded Path (ÇÖZÜLDÜ)
* **Kök Neden:** 
  1. `app/actions.ts` dosyasında `deleteCommentAction` eyleminin iki farklı yerde (satır 544 ve 1571) declare edilmesi nedeniyle Webpack build hatası.
  2. Dosya sisteminde `app/discussions/%5Bid%5D` adında URL-encoded kalıntı bir dizin oluşması nedeniyle TypeScript validator'ın modül çözümleme hatası vermesi.
* **Uygulanan Çözüm:** 
  1. `app/actions.ts` dosyasındaki eski kopya kaldırıldı, `deleteCommentAction(commentId: string, topicId?: string)` tek ve yetki denetimli fonksiyon olarak korundu.
  2. URL-encoded `app/discussions/%5Bid%5D` dizini silindi, `.next` önbelleği temizlendi.
* **Doğrulama Sonucu:** `npx tsc --noEmit: PASS`, `npm run lint: PASS`, `compile_applet: PASS` (0 Hata).

---

### Güncel Hata Durumu (Faz 4 Recovery 2 Tamamlandı):
* **Çözülen Hatalar:** 
  1. `sharp` bağımlılığı ve `scripts/generate_og_image.js` güvenli hale getirildi.
  2. Yanlışlıkla oluşan boş `app/discussions/%5Bid%5D` kalıntı dizini kaldırıldı, `.next` temizlendi.
* **Tip Denetimi & Derleme:** TypeScript (`npx tsc --noEmit: PASS`), ESLint (`npm run lint: PASS`) ve Next.js build (`compile_applet: PASS`).
* **Blokaj Oluşturan Hata:** Yok (0 Hata).
* **Kalan Blocker:** Yok.
