-- =====================================================================
-- ENGELSIZFORUM OAUTH 2.0 IDENTITY PROVIDER (IdP) DATABASE SCHEMA
-- "EngelsizForum ile Giriş Yap" - RFC 6749 Authorization Code Flow
-- =====================================================================

-- 1. HARİCİ UYGULAMALAR (OAUTH CLIENTS)
-- client_secret düz metin yerine salted HMAC-SHA256 (s256:salt:hash) olarak saklanır.
CREATE TABLE IF NOT EXISTS public.oauth_clients (
    client_id TEXT PRIMARY KEY,
    client_secret TEXT NOT NULL,
    client_name TEXT NOT NULL,
    redirect_uris TEXT[] NOT NULL,
    description TEXT,
    logo_url TEXT,
    is_trusted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. GEÇİCİ YETKİLENDİRME KODLARI (OAUTH CODES)
-- Tek kullanımlık ve 5 dakika geçerli kodlar. 
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

-- Var olan eski tablolarda eksik kolon varsa güvenle ekle (Migration / Idempotent)
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS used BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'read';
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS redirect_uri TEXT;
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- İndeksler: Token takası ve süre kontrolü için yüksek hızlı arama
CREATE INDEX IF NOT EXISTS idx_oauth_codes_lookup ON public.oauth_codes(code, client_id, used, expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_codes_user_id ON public.oauth_codes(user_id);

-- 3. ERİŞİM JETONLARI (OAUTH TOKENS)
-- JWT access_token'larının denetim, takip ve iptal edilebilirlik için kaydı.
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

-- İndeksler: Jeton doğrulama ve kullanıcı oturumu temizleme
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_token ON public.oauth_tokens(access_token);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user ON public.oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_client ON public.oauth_tokens(client_id);

-- 4. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- Güvenlik Kuralı: OAuth tablolarına istemci (anon) doğrudan erişemez.
-- Yalnızca Next.js backend'indeki `service_role` anahtarı tam yetkilidir.
ALTER TABLE public.oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full on oauth_clients" ON public.oauth_clients;
CREATE POLICY "Allow service_role full on oauth_clients" ON public.oauth_clients
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service_role full on oauth_codes" ON public.oauth_codes;
CREATE POLICY "Allow service_role full on oauth_codes" ON public.oauth_codes
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service_role full on oauth_tokens" ON public.oauth_tokens;
CREATE POLICY "Allow service_role full on oauth_tokens" ON public.oauth_tokens
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. SÜRESİ DOLMUŞ KODLARI TEMİZLEME FONKSİYONU (OPSİYONEL CRON)
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_data()
RETURNS void AS $$
BEGIN
    -- 1 saatten eski veya kullanılmış kodları temizle
    DELETE FROM public.oauth_codes WHERE used = true OR expires_at < NOW() - INTERVAL '1 hour';
    -- Süresi geçmiş ve iptal edilmiş tokenleri temizle (örneğin 30 gün)
    DELETE FROM public.oauth_tokens WHERE expires_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
