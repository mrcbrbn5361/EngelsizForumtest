-- EngelsizForum - Tartışma Bulunamadı Sorunu Çözüm SQL Betiği
-- Bu scripti Supabase SQL Editor üzerinden çalıştırarak veritabanı sorunlarını düzeltebilirsiniz.

-- 1. Slug sütununu kontrol et ve yoksa ekle
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'topics' AND column_name = 'slug') THEN
        ALTER TABLE public.topics ADD COLUMN slug TEXT;
    END IF;
END $$;

-- 2. Eksik slug'ları başlığa göre otomatik doldur
UPDATE public.topics 
SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) 
WHERE slug IS NULL;

-- 3. Slug için benzersiz (unique) indeks oluştur
DROP INDEX IF EXISTS topics_slug_idx;
CREATE UNIQUE INDEX topics_slug_idx ON public.topics (slug);

-- 4. RLS (Satır Bazlı Güvenlik) Politikalarını Güncelle
-- Herkesin konuları görebildiğinden emin olalım
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Topics are viewable by everyone" ON public.topics;
CREATE POLICY "Topics are viewable by everyone" ON topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create topics" ON public.topics;
CREATE POLICY "Users can create topics" ON public.topics FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their topics" ON public.topics;
CREATE POLICY "Authors can update their topics" ON public.topics FOR UPDATE USING (auth.uid() = author_id);

-- 5. Kullanıcının isteği üzerine mevcut "bozuk" konuları temizle
-- Not: Bu işlem TÜM konuları silecektir. Eğer silmek istemiyorsanız bu satırı yorum satırı yapın.
TRUNCATE public.topics CASCADE;

-- 6. Görüntülenme sayacı fonksiyonunu kontrol et
CREATE OR REPLACE FUNCTION increment_views(topic_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.topics
  SET views_count = coalesce(views_count, 0) + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
