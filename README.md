<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7b41c80b-4505-41d8-b8e8-7f742d493a99

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in [.env.local](.env.local) (see `.env.example`)
3. Run the app:
   `npm run dev`

## Kimliksiz erişilebilen rotalar

Bu liste, oturum açmadan istek alan HTTP yollarını gösterir. Sunucu tarafında servis anahtarı kullanılmaz; bütün okumalar herkese açık anahtarla yapılır.

API rotaları (`app/api`):

- `GET /api/discussions` yalnız okuma; açık kolon listesiyle.
- `GET /api/og`, `GET /api/brand/logo`, `GET /api/brand/button` görsel üretir.
- `POST /api/v1/calculate/balthazard` yalnız hesaplama yapar, veritabanına dokunmaz.

Sayfalar: ana sayfa, `/discussions`, `/discussions/[id]`, `/category/[slug]`, `/communities`, `/communities/[id]`, `/profile/[id]`, `/search`, `/hesaplama/**`, `/tools`, bilgi ve yasal sayfalar, `/login`, `/auth/**`. Konu açma, cevap, mesaj, profil düzenleme, kayıt, topluluk oluşturma ve topluluğa katılma kapalıdır; ilgili sayfalar açıklama gösterir.

Oturum gerektiren sayfalar (`lib/supabase/middleware.ts`): `/profile`, `/messages`, `/discussions/new`, `/admin/**`.
