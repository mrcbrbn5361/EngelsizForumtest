-- =====================================================================
-- 03 · "SİLİNDİ AMA GÖRÜNÜYOR" TESPİTİ  (SADECE OKUMA — hiçbir şeyi değiştirmez)
-- Yol haritası: Faz 0 · Madde 0.4
-- Ana sayfa konuları önce public.threads'ten okur, silme ise public.topics'ten yapılır.
-- threads ayrı bir TABLO ise silinen konuların kopyası threads'te kalır ve görünmeye devam eder.
-- Supabase Dashboard → SQL Editor'de tamamını çalıştırın. Tek tablo döner.
-- =====================================================================

SELECT 'threads nesne tipi' AS kontrol,
       coalesce((SELECT CASE c.relkind WHEN 'r' THEN 'TABLO (sorunlu: ayrı kopya tutuyor)'
                                       WHEN 'v' THEN 'VIEW (doğru: topics''i yansıtıyor)'
                                       ELSE c.relkind::text END
                 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                 WHERE n.nspname = 'public' AND c.relname = 'threads'), 'YOK') AS sonuc,
       NULL::text AS ornek_basliklar
UNION ALL
SELECT 'topics kayıt sayısı', (SELECT count(*) FROM public.topics)::text, NULL
UNION ALL
SELECT 'threads kayıt sayısı', (SELECT count(*) FROM public.threads)::text, NULL
UNION ALL
SELECT 'threads''te olup topics''te OLMAYAN (silinmiş ama görünen)',
       (SELECT count(*) FROM public.threads th WHERE NOT EXISTS (SELECT 1 FROM public.topics t WHERE t.id = th.id))::text,
       (SELECT string_agg(left(th.title, 60), ' | ' ORDER BY th.created_at DESC)
        FROM (SELECT * FROM public.threads th
              WHERE NOT EXISTS (SELECT 1 FROM public.topics t WHERE t.id = th.id)
              ORDER BY th.created_at DESC LIMIT 10) th)
UNION ALL
SELECT 'topics''te olup threads''te OLMAYAN (ana sayfada görünmeyen)',
       (SELECT count(*) FROM public.topics t WHERE NOT EXISTS (SELECT 1 FROM public.threads th WHERE th.id = t.id))::text,
       (SELECT string_agg(left(t.title, 60), ' | ' ORDER BY t.created_at DESC)
        FROM (SELECT * FROM public.topics t
              WHERE NOT EXISTS (SELECT 1 FROM public.threads th WHERE th.id = t.id)
              ORDER BY t.created_at DESC LIMIT 10) t);
