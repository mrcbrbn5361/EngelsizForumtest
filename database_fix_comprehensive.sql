-- Engelsiz Forum - Kapsamlı Veritabanı Onarımı ve Beğeni Sistemi (v3.0)
-- Bu script, 'updated_at' hatasını giderir ve beğeni sistemini aktif eder.

-- 1. EKSİK KOLONLARI TAMAMLA
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- 2. UPDATED_AT YÖNETİM FONKSİYONU (Daha güvenli versiyon)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Kolon varlığını kontrol etmeye gerek yok çünkü yukarıda ekledik,
  -- ama hata almamak için NEW içinde olup olmadığını kontrol edebiliriz (Opsiyonel)
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TETİKLEYİCİLERİ (TRIGGERS) BAĞLA
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_topics_updated_at ON public.topics;
CREATE TRIGGER handle_topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_comments_updated_at ON public.comments;
CREATE TRIGGER handle_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_categories_updated_at ON public.categories;
CREATE TRIGGER handle_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_reactions_updated_at ON public.reactions;
CREATE TRIGGER handle_reactions_updated_at BEFORE UPDATE ON public.reactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. REAKTIONS (BEĞENİLER) TABLOSUNU DÜZENLE VE RLS AYARLA
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON public.reactions;
CREATE POLICY "Reactions are viewable by everyone" ON public.reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own reactions" ON public.reactions;
CREATE POLICY "Users can manage their own reactions" ON public.reactions FOR ALL USING (auth.uid() = user_id);

-- 5. BEĞENİ SAYISINI SENKRONİZE ETMEK İÇİN TETİKLEYİCİ
CREATE OR REPLACE FUNCTION public.sync_topic_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.topics SET likes_count = likes_count + 1 WHERE id = NEW.topic_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.topics SET likes_count = likes_count - 1 WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_reaction_change ON public.reactions;
CREATE TRIGGER on_reaction_change
  AFTER INSERT OR DELETE ON public.reactions
  FOR EACH ROW EXECUTE FUNCTION public.sync_topic_likes();

-- Mevcut beğenileri sayarak toplu güncelleme (Backfill)
UPDATE public.topics t
SET likes_count = (SELECT count(*) FROM public.reactions r WHERE r.topic_id = t.id);

-- 6. YETKİ ATAMALARI
-- yigitfirat3405@gmail.com moderator yapılıyor
UPDATE public.profiles 
SET role = 'moderator' 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'yigitfirat3405@gmail.com');

-- 7. KATEGORİLER İÇİN RLS DÜZENLEMESİ (Moderator'lere izin ver)
DROP POLICY IF EXISTS "Yetkililer kategori yönetebilir" ON public.categories;
CREATE POLICY "Yetkililer kategori yönetebilir" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);
