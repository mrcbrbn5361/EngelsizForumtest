-- =====================================================================
-- 05 · TERCİH SÜTUNLARI  (Yol haritası: Faz 4 · Madde 4.2 "Tercihler")
-- /tercihler sayfasının kullandığı sütunları, YOKSA ekler. Var olanlara dokunmaz,
-- veri silmez; tekrar tekrar çalıştırılabilir.
--   notification_prefs : hangi bildirim türleri gelsin   ({"types": {"like": false, ...}})
--   privacy_prefs      : profil görünürlüğü              ({"profileVisibility": "members"})
--   accessibility_prefs: tema, yazı tipi vb. (çoğu projede zaten var)
--   updated_at         : profil kaydı sırasında yazılıyor; yoksa kayıt hata verir
-- Supabase Dashboard → SQL Editor'de tamamını çalıştırın.
-- =====================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_prefs  JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_prefs       JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accessibility_prefs JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMPTZ DEFAULT NOW();

-- Kontrol: dört sütun da listelenmeli
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
  AND column_name IN ('notification_prefs', 'privacy_prefs', 'accessibility_prefs', 'updated_at')
ORDER BY column_name;
