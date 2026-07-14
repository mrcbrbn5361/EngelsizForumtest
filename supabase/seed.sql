-- SEED DATA FOR ENGELSİZFORUM
-- Initial Categories

INSERT INTO public.categories (name, slug, description, icon, color)
VALUES 
  ('SGK', 'sgk', 'Sosyal Güvenlik Kurumu ile ilgili tüm konular, emeklilik ve haklar.', 'HeartPulse', '#3b82f6'),
  ('EKPSS', 'ekpss', 'Engelli Kamu Personeli Seçme Sınavı hazırlık, duyuru ve sonuçlar.', 'GraduationCap', '#10b981'),
  ('ÖTV', 'otv', 'Özel Tüketim Vergisi muafiyeti, araç alımı ve mevzuat.', 'Car', '#f59e0b'),
  ('Sağlık', 'saglik', 'Sağlık raporları, tedavi süreçleri ve medikal destek.', 'Stethoscope', '#ef4444'),
  ('Eğitim', 'egitim', 'Özel eğitim, kapsayıcı eğitim ve akademik fırsatlar.', 'BookOpen', '#8b5cf6'),
  ('İstihdam', 'istihdam', 'İş ilanları, engelli istihdamı ve kariyer danışmanlığı.', 'Briefcase', '#06b6d4'),
  ('Teknoloji', 'teknoloji', 'Erişilebilir teknolojiler, donanım ve yazılım haberleri.', 'Cpu', '#6366f1'),
  ('Yazılım', 'yazilim', 'Programlama, erişilebilir kodlama ve geliştirme.', 'Code', '#4f46e5'),
  ('Yapay Zeka', 'yapay-zeka', 'Yapay zeka araçları ve engelliler için sağladığı kolaylıklar.', 'Sparkles', '#a855f7'),
  ('Günlük Yaşam', 'gunluk-yasam', 'Yaşamdan kesitler, hobi ve sosyal aktiviteler.', 'Smile', '#ec4899'),
  ('Sosyal Haklar', 'sosyal-haklar', 'Tüm yasal haklar, ödenekler ve sosyal yardımlar.', 'Scale', '#f97316'),
  ('Engelli Hakları', 'engelli-haklari', 'Engelli hakları savunuculuğu ve hukuki süreçler.', 'Shield', '#14b8a6'),
  ('Araçlar', 'araclar', 'Engelli araçları, yardımcı ekipmanlar ve rehabilitasyon.', 'Settings', '#64748b'),
  ('Kamu Duyuruları', 'kamu-duyurulari', 'Resmi gazete ilanları ve bakanlık duyuruları.', 'Megaphone', '#d946ef')
ON CONFLICT (slug) DO NOTHING;
