# EngelsizForum — Faz 3 Öncesi Kapsamlı Auth, Profil, Gizlilik ve Yetkilendirme Denetimi (.ai/enforum-phase3-audit.md)

**Tarih:** 2026-08-18  
**Denetlenen Alan:** Faz 3 (Auth, Profil, Privacy, Accessibility Preferences ve Scoped Permissions)  
**Denetçi:** Google AI Studio — EngelsizForum Mimari ve Güvenlik Denetim Birimi  

---

## 1. Yönetici Özeti ve Mevcut Durum Sınıflandırması

Faz 2 kapsamında veritabanı şeması sertleştirilmiş, canonical modeller (`profiles`, `topics`, `comments`, `reactions`, `bookmarks`, `reports`, `notifications`) RLS ve `is_staff()` fonksiyonu ile korunmuş, test verileri temizlenmiştir.

Faz 3 uygulamasına geçmeden önce kullanıcı kimlik doğrulama, profil yönetimi, gizlilik sınırları, erişilebilirlik tercihlerinin bulut senkronizasyonu ve yetkilendirme katmanı denetlenmiş ve aşağıdaki gibi sınıflandırılmıştır:

| Özellik / Katman | Durum | Açıklama |
|---|---|---|
| **E-posta & Şifre ile Kayıt** | `EXISTS_AND_VERIFIED` | `/app/register/page.tsx` adım adım onboarding sihirbazı (Erişilebilirlik -> Profil -> Hesap) ile Supabase Auth'a bağlıdır. WCAG 2.2 AA erişilebilirlik form standartlarına uygundur. |
| **E-posta & Şifre ile Giriş** | `EXISTS_AND_VERIFIED` | `/app/login/page.tsx` ve `/components/auth/login-form.tsx` Supabase `signInWithPassword` kullanır. Remember Me desteği ve ARIA hata duyuruları mevcuttur. |
| **Oturum Kapatma (SignOut)** | `EXISTS_AND_VERIFIED` | `AuthProvider` context'i üzerinden hem Supabase oturumu sonlandırılır hem de React durumları anında sıfırlanır. |
| **Şifre Sıfırlama Akışı** | `EXISTS_AND_VERIFIED` | `/app/auth/forgot-password` ve `/app/auth/reset-password` sayfaları mevcuttur. `PASSWORD_RECOVERY` olayı sırasında yetkisiz oturum açılmasını önleyen güvenlik kontrolleri eklenmiştir. |
| **Auth Callback & PKCE** | `EXISTS_AND_VERIFIED` | `/app/auth/callback/page.tsx` gelen hash/query parametrelerini ayrıştırır, PKCE code exchange yapar ve güvenli yönlendirme (`sanitizeRedirectUrl`) sağlar. |
| **Middleware & Korumalı Rotalar** | `EXISTS_AND_VERIFIED` | `/middleware.ts` ve `/lib/supabase/middleware.ts` oturum yenileme (`getUser()`), korumalı rota (`/messages`, `/profile/edit`, `/new-topic`, `/notifications`) ve auth sayfası yönlendirmelerini yönetir. |
| **Profil Görüntüleme (Public Profile)** | `EXISTS_AND_VERIFIED` | `/app/profile/[id]/page.tsx` hem UUID hem de username slug ile profilleri getirebilir; açtığı konular, yanıtlar, takipçi/takip edilen listelerini gösterir. |
| **Profil Güncelleme (Self Profile Management)** | `EXISTS_AND_VERIFIED` | `/app/profile/page.tsx` ve `/app/actions.ts` (`updateProfileServerAction`) ile yalnızca giriş yapmış kullanıcının kendi profilini (username, full_name, bio, notification_prefs) güncellemesi sunucu doğrulamasıyla garanti edilmiştir. |
| **Takip / Takipten Çıkma (Follow System)** | `EXISTS_AND_VERIFIED` | `toggleFollowAction` sunucu eylemi `follows` tablosunu günceller; kullanıcının kendisini takip etmesi engellenmiştir. |
| **Erişilebilirlik Tercihleri Senkronizasyonu** | `EXISTS_AND_VERIFIED` | `/components/providers/accessibility-provider.tsx` anonim ziyaretçiler için `localStorage`, oturum açmış kullanıcılar için `profiles.accessibility_prefs` kolonunu çift yönlü ve debounce korumalı olarak senkronize eder. |
| **Rol & Yetkilendirme (RBAC / Scoped Permissions)** | `EXISTS_AND_VERIFIED` | İstemcide `useRole` hook'u UI durumunu belirler; veritabanında `is_staff()` ve RLS politikaları, sunucu eylemlerinde ise `profiles.role` doğrulaması uygulanır. |
| **Hassas Sağlık Verisi İzolasyonu** | `EXISTS_AND_VERIFIED` | `/app/hesaplama` ve `/app/security` sayfalarında açıklandığı üzere, sağlık kurulu raporu ve engel oranı hesaplamaları sunucuda saklanmaz, tamamen istemci belleğinde çalışır. |

---

## 2. Güvenlik ve RLS Uyum Matrisi

Faz 2'de devreye alınan `20260818000000_phase2_core_hardening.sql` migrasyonu ile profiller ve yetkiler şu güvenlik kurallarına tabidir:

1. **`profiles` Tablosu:**
   - `SELECT`: Herkes tarafından okunabilir (public profiles).
   - `INSERT`: Yalnızca `auth.uid() = id` veya veritabanı trigger'ı tarafından yapılabilir.
   - `UPDATE`: Yalnızca `auth.uid() = id` olan kullanıcı kendi profilini güncelleyebilir. Role veya XP manipülasyonu istemciden yapılamaz (`is_staff()` korumalı sunucu RPC'leri veya trigger'lar gereklidir).
   - `DELETE`: Reddedilir.

2. **Korumalı Sunucu Eylemleri (`app/actions.ts`):**
   - `updateProfileServerAction`: `supabase.auth.getUser()` ile kimlik denetimi yapar, kullanıcı adını sanitize eder (`[^a-z0-9_]`), yalnızca çağıran kullanıcının `id` değerini günceller.
   - `toggleSolutionAction` / `deleteCommentAction`: Konu sahibi veya `isStaff` rolü olmayan kullanıcıların isteklerini sunucu tarafında reddeder.

3. **Erişilebilirlik Tercihleri:**
   - Giriş yapılmadığında: `localStorage` kullanılır, hiçbir ağ isteği yapılmaz.
   - Giriş yapıldığında: `profiles.accessibility_prefs` JSONB alanına kaydedilir, oturum açılan tüm cihazlara otomatik aktarılır.

---

## 3. Bloklayıcı ve Eksik Unsurlar Kontrolü

- **Bloklayıcı Hata (Blocker):** YOK.
- **Şema Uyumsuzluğu (Schema Drift):** YOK (Tüm tablolar canonical isimleriyle eşleşmektedir).
- **Yıkıcı Değişiklik İhtiyacı (Destructive Migration):** YOK.

---

## 4. Faz 3 Uygulama Yol Haritası

1. **Adım 3.1:** Auth ve profil sayfalarındaki (`/app/login`, `/app/register`, `/app/profile`, `/app/accessibility-settings`) tüm etkileşimlerin, yükleme durumlarının (loading skeletons), hata mesajlarının ve ARIA erişilebilirlik standartlarının son kontrolleri.
2. **Adım 3.2:** Kullanıcı şifre değiştirme ve güvenlik ayarlarının profil ekranına tam entegrasyonu.
3. **Adım 3.3:** TypeScript typecheck (`tsc --noEmit`), lint ve build doğrulamasının yapılması.
4. **Adım 3.4:** `.ai/enforum-progress.md` ve `.ai/enforum-qa-checklist.md` güncellemelerinin kaydedilmesi.
