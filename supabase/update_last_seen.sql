-- profiles tablosuna son görülme zamanı sütununu ekler
-- Bu script'i Supabase SQL Editor panelinde çalıştırarak veritabanınızı güncelleyebilirsiniz.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT now();

-- Bu işlem sonrasında anasayfada aktif olan kullanıcıların son aktiflik zamanları
-- ve kullanıcıların detaylı profilleri sorunsuz bir şekilde yüklenecektir.
