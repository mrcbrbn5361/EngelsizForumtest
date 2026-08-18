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

### Güncel Hata Durumu (Faz 3 Recovery Sonu):
* **Blokaj Oluşturan Hata:** Yok (0 Hata).
* **Tip Denetimi & Derleme:** TypeScript ve Next.js build 0 hata ile geçiyor (`compile_applet: PASS`, `lint_applet: PASS`).
* **Faz 3 Öncesi Kalan Blocker:** Yok.
