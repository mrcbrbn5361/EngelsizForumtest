-- =====================================================================
-- 04 · PROFİL RESİMLERİ DEPOSU  (Yol haritası: Faz 2 · Madde 2.4)
-- Supabase Storage'da herkese açık okunabilen "avatars" deposunu kurar.
-- Tekrar tekrar çalıştırılabilir; mevcut dosyaları SİLMEZ.
--   * Dosya en fazla 1 MB (site 256x256 WebP yükler, ~20 KB), yalnızca resim türleri.
--   * Herkes okuyabilir (profil resimleri herkese görünür).
--   * Her kullanıcı yalnızca kendi klasörüne (<kullanıcı id>/...) yazabilir, değiştirebilir, silebilir.
-- Supabase Dashboard → SQL Editor'de tamamını çalıştırın.
-- =====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 1048576, ARRAY['image/webp', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "avatars: herkes okuyabilir" ON storage.objects;
CREATE POLICY "avatars: herkes okuyabilir"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars: kendi klasörüne yükle" ON storage.objects;
CREATE POLICY "avatars: kendi klasörüne yükle"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars: kendi dosyasını güncelle" ON storage.objects;
CREATE POLICY "avatars: kendi dosyasını güncelle"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars: kendi dosyasını sil" ON storage.objects;
CREATE POLICY "avatars: kendi dosyasını sil"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Kontrol
SELECT id, public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id = 'avatars';
