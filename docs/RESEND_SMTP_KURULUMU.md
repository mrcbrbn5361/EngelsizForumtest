# Resend ile E-posta Gönderimi (Supabase SMTP Kurulumu)

**Neden gerekli?** Supabase'in kendi e-posta göndericisi yalnızca proje ekibindeki adreslere ve saatte
en fazla 2 e-posta gönderir. Özel SMTP bağlanmadan kayıt doğrulama ve şifre sıfırlama e-postaları
gerçek kullanıcılara ulaşmaz; yeni ücretsiz projelerde e-posta şablonları da düzenlenemez.

**Maliyet:** Resend ücretsiz planı — günde 100, ayda 3.000 e-posta, kredi kartı gerekmez
(limitleri https://resend.com/pricing adresinden kontrol edin).

Süre: ~20 dakika + DNS kayıtlarının yayılması (birkaç dakika – birkaç saat).

---

## 1. Resend hesabı ve alan adı

1. https://resend.com adresinden ücretsiz hesap açın.
2. **Domains → Add Domain** → `engelsizforum.com` yazın, bölge olarak **EU (Frankfurt)** seçin
   (Türkiye'ye en yakın; KVKK açısından da AB tercih edilir).
3. Resend size 3–4 DNS kaydı gösterir (SPF için `TXT`, DKIM için `resend._domainkey` `TXT`,
   geri dönen e-postalar için `send` alt alan adına `MX`).
4. Bu kayıtları **alan adını aldığınız firmanın DNS paneline** (GoDaddy, Natro, Cloudflare vb.)
   birebir ekleyin. Cloudflare kullanıyorsanız kayıtların "proxy" (turuncu bulut) **kapalı** olmalı.
5. Resend'de **Verify DNS Records**'a basın; durum **Verified** olana kadar bekleyin.

## 2. API anahtarı

1. Resend → **API Keys → Create API Key**
2. Ad: `supabase-smtp`, Permission: **Sending access**, Domain: `engelsizforum.com`
3. Anahtarı kopyalayın (`re_...` ile başlar). **Bir daha gösterilmez**; kimseyle paylaşmayın,
   koda veya sohbetlere yapıştırmayın.

## 3. Supabase'e bağlama

Supabase Dashboard → proje → **Authentication → Emails → SMTP Settings → Enable Custom SMTP**

| Alan | Değer |
|------|-------|
| Sender email | `noreply@engelsizforum.com` |
| Sender name | `Engelsiz Forum` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | 2. adımdaki API anahtarı (`re_...`) |

**Save** deyin. (Dashboard'dan kaydetmek saatlik limiti otomatik olarak 2'den 30'a çıkarır;
**Authentication → Rate Limits** bölümünden kontrol edin.)

## 4. E-posta doğrulamasını açık tutun

**Authentication → Sign In / Providers → Email**:
- **Confirm email**: açık
- **Minimum password length**: `8`

## 5. Şablonları güncelleyin

**Authentication → Emails → Templates**: `SUPABASE_EMAIL_TEMPLATES.md` dosyasındaki
"Confirm signup", "Reset password" ve "Change email address" şablonlarını yapıştırın.
(Yeni bağlantılar her cihazda çalışır.)

**URL Configuration → Site URL**: `https://engelsizforum.com`

## 6. Deneme

1. Sitede kendi e-postanızdan farklı bir adresle kayıt olun → doğrulama e-postası gelmeli
   (spam klasörüne de bakın).
2. E-postadaki bağlantıyı **telefonda** açın → giriş yapılmış olarak Tartışmalar sayfası açılmalı.
3. "Şifremi unuttum" ile sıfırlama isteyin → bağlantı telefonda da çalışmalı.
4. Resend → **Emails** sayfasında gönderilen e-postaları ve teslim durumlarını görebilirsiniz.
