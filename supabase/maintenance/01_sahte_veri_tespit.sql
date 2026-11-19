-- =====================================================================
-- 01 · SAHTE / DEMO VERİ TESPİTİ  (SADECE OKUMA — hiçbir şeyi değiştirmez)
-- Yol haritası: Faz 0 · Madde 0.1 + 0.2
-- Supabase Dashboard → SQL Editor'de tamamını çalıştırın.
-- Tek bir sonuç tablosu döner: kaynak | id | etiket | neden | tarih
-- =====================================================================

WITH demo_kelimeleri AS (
  SELECT '(demo|test|deneme|örnek|ornek|sample|mock|fake|sahte|dummy|lorem|placeholder|asdf|qwerty)' AS rx
),

profil_bulgulari AS (
  SELECT 'profiles'::text AS kaynak, p.id::text AS id, p.username AS etiket,
         'auth.users içinde karşılığı yok (giriş yapamayan hayalet profil)' AS neden, p.created_at AS tarih
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  WHERE u.id IS NULL
  UNION ALL
  SELECT 'profiles', p.id::text, p.username,
         'kullanıcı adı / isim demo kelimesi içeriyor', p.created_at
  FROM public.profiles p, demo_kelimeleri d
  WHERE p.username ~* d.rx OR coalesce(p.full_name, '') ~* d.rx OR coalesce(to_jsonb(p)->>'display_name', '') ~* d.rx
  UNION ALL
  SELECT 'profiles', p.id::text, p.username,
         'e-posta test/örnek alan adında: ' || u.email, p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE u.email ~* '@(example\.(com|org|net)|test\.(com|local)|mailinator\.com|localhost)'
  UNION ALL
  SELECT 'profiles', p.id::text, p.username,
         'avatar yerel/mock adres: ' || p.avatar_url, p.created_at
  FROM public.profiles p
  WHERE p.avatar_url LIKE '/avatars/%' OR p.avatar_url LIKE '%localhost%'
),

konu_bulgulari AS (
  SELECT 'topics'::text AS kaynak, t.id::text AS id, left(t.title, 80) AS etiket,
         'yazarı yok veya yazar profili silinmiş' AS neden, t.created_at AS tarih
  FROM public.topics t
  LEFT JOIN public.profiles p ON p.id = t.author_id
  WHERE p.id IS NULL
  UNION ALL
  SELECT 'topics', t.id::text, left(t.title, 80),
         'başlık/içerik demo kelimesi içeriyor', t.created_at
  FROM public.topics t, demo_kelimeleri d
  WHERE t.title ~* d.rx OR left(t.content, 500) ~* d.rx
  UNION ALL
  SELECT 'topics', t.id::text, left(t.title, 80),
         'aynı saniyede toplu oluşturulmuş (' || count(*) OVER (PARTITION BY date_trunc('second', t.created_at)) || ' konu)', t.created_at
  FROM public.topics t
  WHERE (SELECT count(*) FROM public.topics t2
         WHERE date_trunc('second', t2.created_at) = date_trunc('second', t.created_at)) >= 3
  UNION ALL
  SELECT 'topics', t.id::text, left(t.title, 80),
         'görüntülenme sayısı yorum sayısına göre şişkin (' || t.views_count || ' görüntülenme, 0 yorum)', t.created_at
  FROM public.topics t
  WHERE t.views_count >= 500
    AND NOT EXISTS (SELECT 1 FROM public.comments c WHERE c.topic_id = t.id)
),

yorum_bulgulari AS (
  SELECT 'comments'::text AS kaynak, c.id::text AS id, left(c.content, 80) AS etiket,
         'bağlı olduğu konu yok (yetim yorum)' AS neden, c.created_at AS tarih
  FROM public.comments c
  LEFT JOIN public.topics t ON t.id = c.topic_id
  WHERE t.id IS NULL
  UNION ALL
  SELECT 'comments', c.id::text, left(c.content, 80),
         'yazarı yok veya yazar profili silinmiş', c.created_at
  FROM public.comments c
  LEFT JOIN public.profiles p ON p.id = c.author_id
  WHERE p.id IS NULL
  UNION ALL
  SELECT 'comments', c.id::text, left(c.content, 80),
         'içerik demo kelimesi içeriyor', c.created_at
  FROM public.comments c, demo_kelimeleri d
  WHERE left(c.content, 500) ~* d.rx
),

kategori_bulgulari AS (
  SELECT 'categories'::text AS kaynak, c.id::text AS id, c.name AS etiket,
         'otomatik seed UUID''si (1111…/2222… kalıbı) — konu sayısı: ' ||
         (SELECT count(*) FROM public.topics t WHERE t.category_id = c.id) AS neden, c.created_at AS tarih
  FROM public.categories c
  WHERE c.id::text ~ '^([0-9])\1{7}-\1{4}-\1{4}-\1{4}-\1{12}$'
),

mesaj_bulgulari AS (
  SELECT 'notifications'::text AS kaynak, n.id::text AS id, n.type AS etiket,
         'alıcı kullanıcı yok' AS neden, n.created_at AS tarih
  FROM public.notifications n
  LEFT JOIN public.profiles p ON p.id = n.user_id
  WHERE p.id IS NULL
  UNION ALL
  SELECT 'conversations', cv.id::text, '',
         'üyesi olmayan veya tek üyeli sohbet ("mesaj yokken var görünüyor" nedeni olabilir)', cv.created_at
  FROM public.conversations cv
  WHERE (SELECT count(*) FROM public.conversation_members m WHERE m.conversation_id = cv.id) < 2
  UNION ALL
  SELECT 'conversations', cv.id::text, '',
         'hiç mesajı olmayan sohbet', cv.created_at
  FROM public.conversations cv
  WHERE NOT EXISTS (SELECT 1 FROM public.messages m WHERE m.conversation_id = cv.id)
)

SELECT * FROM profil_bulgulari
UNION ALL SELECT * FROM konu_bulgulari
UNION ALL SELECT * FROM yorum_bulgulari
UNION ALL SELECT * FROM kategori_bulgulari
UNION ALL SELECT * FROM mesaj_bulgulari
ORDER BY kaynak, neden, tarih;
