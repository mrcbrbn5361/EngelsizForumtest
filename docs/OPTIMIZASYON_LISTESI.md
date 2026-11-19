# Faz 0 · Madde 0.7 — Kod Optimizasyonu Listesi

Ölçüm tarihi: 19 Kasım 2026 · `next build` başarılı · TypeScript hatasız.
Durum: ⬜ karar bekliyor · ✅ yapıldı · ⏸ ileride kullanılacak, şimdilik dokunulmuyor

## A. Güvenlik (öncelikli)

| # | Bulgu | Öneri | Durum |
|---|-------|-------|-------|
| A1 | `/api/check-profiles` herkese açık; servis anahtarıyla (RLS'yi atlayarak) 10 üyenin profil kaydının tamamını döndürüyor | Sil | ✅ |
| A2 | `/api/check-schema` herkese açık; `visitors` tablosundan kayıt döndürüyor | Sil | ✅ |
| A3 | `/api/migrate` hiçbir şey yapmıyor ("raw SQL çalıştırılamaz" mesajı döndürüyor) | Sil | ✅ |
| A4 | `/api/mcp-sync` hiç yetki kontrolü yapmıyor; herkes `mcp_servers` tablosuna yazma tetikleyebilir. `CRON_SECRET` yoksa koda gömülü yedek şifre kullanılıyor | `CRON_SECRET` zorunlu, `Authorization` kontrolü eklensin | ✅ |
| A5 | `/api/visitor-update` koda gömülü token kullanıyor, kodda hiçbir yerden çağrılmıyor | Harici bir cihaz kullanmıyorsa silinsin | ✅ |

## B. Hiçbir yerden kullanılmayan dosyalar (25 dosya, ~3.100 satır)

**Silinebilir:**

| Dosya | Satır | Not |
|-------|------:|-----|
| `components/layout/navbar.tsx` | 540 | Eski üst menü; yerini `classic-navbar.tsx` aldı |
| `components/layout/user-nav.tsx` | 143 | Eski menüye ait |
| `components/layout/notification-bell.tsx` | 11 | Eski menüye ait |
| `components/layout/dashboard-layout.tsx` | 11 | |
| `components/auth/register-form.tsx` | 255 | Kayıt sayfası başka bileşen kullanıyor |
| `components/auth/login-form.tsx` | 162 | Giriş sayfası başka bileşen kullanıyor |
| `components/forum/classic-post-bit.tsx` | 220 | |
| `components/forum/modern-node-card.tsx` | 144 | |
| `components/forum/topic-card.tsx` | 124 | |
| `components/forum/classic-category-block.tsx` | 101 | |
| `components/forum/teknofest-notice.tsx` | 131 | Teknofest dönemi |
| `components/forum/teknofest-banner.tsx` | 123 | Teknofest dönemi |
| `components/ui/brand-logo.tsx` | 123 | `engelsizforum-brand.tsx` kullanılıyor |
| `components/ui/card.tsx`, `input.tsx`, `skeleton.tsx` | 94 | |
| `components/accessibility/bionic-preview-wrapper.tsx` | 12 | |
| `hooks/use-mobile.ts` | 27 | |
| `lib/supabase/client.ts` | 36 | Aynı işi `lib/supabase.ts` yapıyor |

**Şimdilik saklanmalı (notlardaki ileriki maddelerde işe yarar):**

| Dosya | Satır | Hangi madde |
|-------|------:|-------------|
| `components/ui/text-to-speech-controls.tsx` | 241 | 1.5 görme desteği |
| `hooks/use-speech-to-text.ts` | 70 | 3.2 sesli mesajı yazıya dönüştürme |
| `components/forum/post-composer.tsx` | 236 | 3.5 alıntılama ve cevap verme |
| `components/forum/reaction-button.tsx` | 76 | 3.5 |
| `components/forum/report-button.tsx` | 181 | 2.6 KVKK / moderasyon |
| `hooks/use-realtime-topic.ts` | 77 | 3.4 bildirimler |

## C. Kullanılmayan paketler (`package.json`)

Silmeden önce her biri `next build` ile doğrulanacak.

| Paket | Not |
|-------|-----|
| `@hookform/resolvers` | Hiçbir yerde import edilmiyor |
| `@radix-ui/react-label`, `react-popover`, `react-switch`, `react-tabs` | Hiçbir yerde import edilmiyor |
| `focus-trap-react` | Hiçbir yerde import edilmiyor |
| `qrcode.react` | Hiçbir yerde import edilmiyor |
| `react-speech-recognition`, `@types/react-speech-recognition`, `regenerator-runtime` | Hiçbir yerde import edilmiyor; konuşma tanıma `use-speech-to-text.ts` ile yapılıyor |
| `next-themes` | ⏸ Kullanılmıyor ama 1.1 gece/gündüz modu için gerekecek |

Kullanılıyor görünmeyen ama gerekli olanlar: `react-dom` (Next.js ister), `postcss` ve `autoprefixer` (`postcss.config.mjs`), `react-markdown` (`bionic-markdown.tsx`).

## D. Repoda olmaması gereken dosyalar

| Dosya | Boyut | Öneri |
|-------|------:|-------|
| `performance_result.json`, `performance_score.json` | 774 KB | Eski PageSpeed çıktısı; silinsin |
| `tsconfig.tsbuildinfo` | 246 KB | Her derlemede değişen önbellek; git'ten çıkarılıp `.gitignore`'a eklensin |
| `bun.lock` + `package-lock.json` | — | İki ayrı paket yöneticisi kilidi var; Vercel hangisini kullanıyorsa o kalsın |
| `components/layout/navbar.tsx.bak_demo_text` | — | ✅ Silindi |
| Kök dizindeki eski prompt/plan metinleri (`*_PROMPT.txt`, `forum_logic.txt`, `project_*.txt`) | 30 KB | `docs/arsiv/` altına taşınsın |

## E. Performans

| Bulgu | Not |
|-------|-----|
| Her sayfada 298 KB ortak JavaScript | Büyük kısmı Next.js + React çerçevesi; küçültülemez |
| En ağır sayfalar: `/messages` 455 KB, `/discussions/[id]` 454 KB, `/communities/[id]` 448 KB, `/discussions/new` 447 KB, `/auth` 435 KB | Ağır parçaların (editör, ses kaydı, animasyon) gerektiğinde yüklenmesi incelenebilir |
| 4 adet `<img>` etiketi | `next/image` ile otomatik boyutlandırma/sıkıştırma |
| `console.log` | Gerçek kodda yok (3 tanesi sayfadaki örnek kod metni) ✅ |

## F. Tekrarlanan / karışık kod

| Bulgu | Öneri |
|-------|-------|
| 4 ayrı Supabase istemci dosyası (`lib/supabase.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase-server.ts`) | Tarayıcı + sunucu olarak 2 dosyaya indirilsin |
| Kodun her yerinde `threads` ↔ `topics`, `posts` ↔ `comments` yedekli sorgular | Madde 0.4'ün veritabanı düzeltmesinden sonra tek tabloya indirilsin |
| Admin e-postası koda gömülü (`classic-navbar.tsx`, `supabase_setup_schema.sql`) | Yalnızca `profiles.role` kullanılsın |
