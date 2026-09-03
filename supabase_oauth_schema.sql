-- =====================================================================
-- ENGELSIZFORUM OAUTH 2.0 IDENTITY PROVIDER (IdP) & DEVELOPER PORTAL
-- Güncel ve Kapsamlı Supabase Veritabanı Şeması (RFC 6749)
-- Hata Çözümü: {"error":"database_error","message":"Uygulamalar listelenirken bir hata oluştu."}
-- =====================================================================

-- 0. GEREKLİ EKLENTİLER (EXTENSIONS)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. OAUTH UYGULAMALARI (OAUTH CLIENTS)
-- Geliştiricilerin oluşturduğu harici uygulamalar
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.oauth_clients (
    client_id TEXT PRIMARY KEY,
    client_secret TEXT NOT NULL,
    client_name TEXT NOT NULL,
    redirect_uris TEXT[] NOT NULL DEFAULT '{}',
    description TEXT,
    logo_url TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_trusted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tablo zaten varsa eksik sütunları güvenle ekle (Migration / Idempotent)
ALTER TABLE public.oauth_clients ADD COLUMN IF NOT EXISTS client_name TEXT NOT NULL DEFAULT 'Uygulama';
ALTER TABLE public.oauth_clients ADD COLUMN IF NOT EXISTS client_secret TEXT NOT NULL DEFAULT '';
ALTER TABLE public.oauth_clients ADD COLUMN IF NOT EXISTS redirect_uris TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.oauth_clients ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.oauth_clients ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.oauth_clients ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.oauth_clients ADD COLUMN IF NOT EXISTS is_trusted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.oauth_clients ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.oauth_clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Eğer eski veritabanında redirect_uris sütunu TEXT[] yerine düz TEXT ise TEXT[] dizisine çevir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'oauth_clients' 
      AND column_name = 'redirect_uris' 
      AND data_type = 'text'
  ) THEN
    ALTER TABLE public.oauth_clients ALTER COLUMN redirect_uris TYPE TEXT[] USING string_to_array(redirect_uris, ',');
  END IF;
END $$;

-- Hızlı sorgulama için indeksler
CREATE INDEX IF NOT EXISTS idx_oauth_clients_owner_id ON public.oauth_clients(owner_id);
CREATE INDEX IF NOT EXISTS idx_oauth_clients_created_at ON public.oauth_clients(created_at DESC);

-- =====================================================================
-- 2. GEÇİCİ YETKİLENDİRME KODLARI (OAUTH CODES)
-- 5 dakika süreli, tek kullanımlık kodlar
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.oauth_codes (
    code TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    redirect_uri TEXT NOT NULL,
    scope TEXT DEFAULT 'read',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eksik sütunları tamamla
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS client_id TEXT REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE;
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS redirect_uri TEXT;
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'read';
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS used BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_oauth_codes_lookup ON public.oauth_codes(code, client_id, used, expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_codes_user_id ON public.oauth_codes(user_id);

-- =====================================================================
-- 3. ERİŞİM JETONLARI (OAUTH TOKENS)
-- Verilen access_token'ların takibi, denetimi ve iptali
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    access_token TEXT UNIQUE NOT NULL,
    client_id TEXT NOT NULL REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scope TEXT DEFAULT 'read',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eksik sütunları tamamla
ALTER TABLE public.oauth_tokens ADD COLUMN IF NOT EXISTS client_id TEXT REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE;
ALTER TABLE public.oauth_tokens ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.oauth_tokens ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'read';
ALTER TABLE public.oauth_tokens ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.oauth_tokens ADD COLUMN IF NOT EXISTS revoked BOOLEAN DEFAULT FALSE;
ALTER TABLE public.oauth_tokens ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_token ON public.oauth_tokens(access_token);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user ON public.oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_client ON public.oauth_tokens(client_id);

-- =====================================================================
-- 4. KULLANICI ONAYLARI (OAUTH CONSENTS)
-- Kullanıcının bir uygulamaya daha önce verdiği izinlerin kaydı
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.oauth_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE,
    scope TEXT DEFAULT 'read',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_client_consent UNIQUE (user_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_oauth_consents_lookup ON public.oauth_consents(user_id, client_id);

-- =====================================================================
-- 5. TABLO ERİŞİM YETKİLERİ (GRANTS - ÇOK KRİTİK)
-- Supabase rollerinin tablolara erişebilmesi için gerekli yetkiler
-- =====================================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON TABLE public.oauth_clients TO postgres, service_role, authenticated;
GRANT ALL ON TABLE public.oauth_codes TO postgres, service_role, authenticated;
GRANT ALL ON TABLE public.oauth_tokens TO postgres, service_role, authenticated;
GRANT ALL ON TABLE public.oauth_consents TO postgres, service_role, authenticated;

-- Anonim istemcilerin genel uygulama bilgilerini (isim, logo) sorgulayabilmesi için
GRANT SELECT ON TABLE public.oauth_clients TO anon;

-- =====================================================================
-- 6. SATIR BAZLI GÜVENLİK (ROW LEVEL SECURITY - RLS)
-- İzolasyon Kuralı: Geliştiriciler yalnızca kendi uygulamalarını görebilir/yönetebilir
-- =====================================================================
ALTER TABLE public.oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_consents ENABLE ROW LEVEL SECURITY;

-- 6.1 SERVICE ROLE POLİTİKALARI (Next.js Server API için Tam Yetki)
DROP POLICY IF EXISTS "service_role_full_oauth_clients" ON public.oauth_clients;
CREATE POLICY "service_role_full_oauth_clients" ON public.oauth_clients
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_full_oauth_codes" ON public.oauth_codes;
CREATE POLICY "service_role_full_oauth_codes" ON public.oauth_codes
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_full_oauth_tokens" ON public.oauth_tokens;
CREATE POLICY "service_role_full_oauth_tokens" ON public.oauth_tokens
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_full_oauth_consents" ON public.oauth_consents;
CREATE POLICY "service_role_full_oauth_consents" ON public.oauth_consents
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6.2 GELİŞTİRİCİLER (AUTHENTICATED USERS) POLİTİKALARI
-- Geliştirici sadece sahip olduğu (owner_id = auth.uid()) uygulamaları listeleyebilir
DROP POLICY IF EXISTS "developers_select_own_apps" ON public.oauth_clients;
CREATE POLICY "developers_select_own_apps" ON public.oauth_clients
    FOR SELECT TO authenticated
    USING (auth.uid() = owner_id);

-- Geliştirici sadece kendi adına uygulama ekleyebilir
DROP POLICY IF EXISTS "developers_insert_own_apps" ON public.oauth_clients;
CREATE POLICY "developers_insert_own_apps" ON public.oauth_clients
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = owner_id);

-- Geliştirici sadece kendi uygulamasını güncelleyebilir
DROP POLICY IF EXISTS "developers_update_own_apps" ON public.oauth_clients;
CREATE POLICY "developers_update_own_apps" ON public.oauth_clients
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Geliştirici sadece kendi uygulamasını silebilir
DROP POLICY IF EXISTS "developers_delete_own_apps" ON public.oauth_clients;
CREATE POLICY "developers_delete_own_apps" ON public.oauth_clients
    FOR DELETE TO authenticated
    USING (auth.uid() = owner_id);

-- Kullanıcılar kendi onaylarını ve jetonlarını görebilir
DROP POLICY IF EXISTS "users_manage_own_consents" ON public.oauth_consents;
CREATE POLICY "users_manage_own_consents" ON public.oauth_consents
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_select_own_tokens" ON public.oauth_tokens;
CREATE POLICY "users_select_own_tokens" ON public.oauth_tokens
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- =====================================================================
-- 7. OTOMATİK GÜNCELLEME VE TEMİZLİK FONKSİYONLARI
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_oauth_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_oauth_clients_updated_at ON public.oauth_clients;
CREATE TRIGGER tr_oauth_clients_updated_at
    BEFORE UPDATE ON public.oauth_clients
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_oauth_updated_at();

-- Süresi geçmiş yetki kodlarını ve jetonları temizleme
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_data()
RETURNS void AS $$
BEGIN
    DELETE FROM public.oauth_codes 
    WHERE used = true OR expires_at < NOW() - INTERVAL '1 hour';

    DELETE FROM public.oauth_tokens 
    WHERE expires_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 8. SUPABASE POSTGREST ÖNBELLEĞİNİ YENİLE (SCHEMA CACHE RELOAD)
-- API'nin yeni tabloları ve kolonları anında tanıması için
-- =====================================================================
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
