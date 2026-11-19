-- =====================================================================
-- 02 · ZİYARETÇİ SAYACI TABLOSU  (Yol haritası: Faz 0 · Madde 0.5)
-- /api/visitor-stats, public.visitors tablosuna device_id + last_seen yazar.
-- Bu betik tekrar tekrar çalıştırılabilir; mevcut kayıtları SİLMEZ.
--   * Tablo yoksa oluşturur.
--   * Tablo varsa eksik sütunları ve device_id benzersizlik kısıtını ekler.
--   * RLS'yi açar: tabloya yalnızca sunucu (service role) erişir.
-- Supabase Dashboard → SQL Editor'de tamamını çalıştırın.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.visitors (
    device_id  TEXT PRIMARY KEY,
    last_seen  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS device_id  TEXT;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS last_seen  TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS visitors_device_id_key ON public.visitors (device_id);
CREATE INDEX IF NOT EXISTS visitors_last_seen_idx ON public.visitors (last_seen);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Kontrol: tablonun son hali ve kayıt sayıları
SELECT
  (SELECT count(*) FROM public.visitors)                                                AS toplam_cihaz,
  (SELECT count(*) FROM public.visitors WHERE last_seen > NOW() - INTERVAL '5 minutes') AS son_5_dakika,
  (SELECT count(*) FROM public.visitors WHERE device_id IS NULL)                        AS device_id_bos_kayit;
