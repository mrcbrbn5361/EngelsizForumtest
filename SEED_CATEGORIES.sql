-- Temel Kategorileri Ekleyen SQL Dosyası
-- Engelsiz Forum için başlangıç kategorileri

INSERT INTO public.categories (name, slug, description, icon)
VALUES 
  ('Erişilebilirlik Teknoloji', 'erisilebilirlik-teknoloji', 'Erişilebilirlik alanındaki yeni teknolojiler ve cihazlar.', 'Laptop'),
  ('Engelli Hakları', 'engelli-haklari', 'Engelli hakları, yasal düzenlemeler ve başvurular.', 'Scale'),
  ('Gündelik Yaşam', 'gundelik-yasam', 'Gündelik hayatta karşılaşılan engeller, çözümler ve deneyimler.', 'Sun'),
  ('Eğitim ve İstihdam', 'egitim-istihdam', 'Eğitim hayatı, iş bulma süreçleri ve kariyer.', 'Briefcase'),
  ('Sosyal Destek ve Psikoloji', 'sosyal-destek', 'Psikolojik destek, motivasyon ve toplumsal ilişkiler.', 'Heart'),
  ('Seyahat ve Ulaşım', 'seyahat-ulasim', 'Engelsiz seyahat rotaları, toplu taşıma ve ulaşım araçları.', 'Map')
ON CONFLICT (slug) DO NOTHING;
