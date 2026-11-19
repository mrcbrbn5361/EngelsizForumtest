# Supabase E-posta Şablonları

Bu şablonları **Supabase Dashboard -> Authentication -> Email Templates** kısmından ilgili sekmelere kopyalayarak düzenleyebilirsiniz.

> **ÖNEMLİ (Kasım 2026):** Butonlardaki bağlantılar `{{ .ConfirmationURL }}` yerine sitenin
> `/auth/confirm` adresine `{{ .TokenHash }}` ile gidiyor. Böylece bağlantı **başka bir cihazda
> açıldığında da çalışır** (eski bağlantı yalnızca isteğin yapıldığı tarayıcıda çalışıyordu).
> Şablonları güncelledikten sonra **Authentication → URL Configuration → Site URL** değerinin
> `https://engelsizforum.com` olduğundan emin olun.
>
> Ayrıca **Authentication → Providers → Email → Minimum password length** değerini **8** yapın;
> site yeni şifrelerde en az 8 karakter + bir rakam veya özel karakter istiyor.

> **Logo:** Aşağıdaki HTML kodlarında yer alan `https://i.imgur.com/GJBHign.png` kısmını, Imgur'da resme sağ tıklayıp "Resim adresini kopyala" diyerek aldığınız **doğrudan link (Direct Link)** ile değiştirmeyi unutmayın. Linkin sonu mutlaka .png veya .jpg ile bitmelidir.

## 1. E-posta Doğrulama (Confirm Email)

```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://i.imgur.com/GJBHign.png" alt="Engelsiz Forum Logo" style="width: 150px;">
  </div>
  <h2 style="color: #333;">E-posta Adresini Doğrula</h2>
  <p>Merhaba,</p>
  <p>Engelsiz Forum'a hoş geldin! Kaydını tamamlamak için aşağıdaki butona tıkla.</p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/discussions" style="display: block; width: 200px; margin: 20px auto; padding: 12px; background-color: #007bff; color: white; text-align: center; text-decoration: none; border-radius: 5px;">Hesabı Doğrula</a>
  <p>Eğer bu hesabı sen oluşturmadıysan, bu e-postayı görmezden gelebilirsin.</p>
</div>
```

## 2. Şifre Sıfırlama (Reset Password)

```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://i.imgur.com/GJBHign.png" alt="Engelsiz Forum Logo" style="width: 150px;">
  </div>
  <h2 style="color: #333;">Şifreni Sıfırla</h2>
  <p>Merhaba,</p>
  <p>Hesabın için yeni bir şifre oluşturma isteğinde bulundun. Değilsen bu e-postayı yok say.</p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/reset-password" style="display: block; width: 200px; margin: 20px auto; padding: 12px; background-color: #dc3545; color: white; text-align: center; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
  <p>Bu bağlantı kısa bir süre geçerli kalacaktır.</p>
</div>
```

## 3. E-posta Adresi Değişikliği (Change Email Address)

```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://i.imgur.com/GJBHign.png" alt="Engelsiz Forum Logo" style="width: 150px;">
  </div>
  <h2 style="color: #333;">Yeni E-posta Adresini Onayla</h2>
  <p>Merhaba,</p>
  <p>Hesabının e-posta adresini <strong>{{ .NewEmail }}</strong> olarak değiştirme isteğinde bulundun. Onaylamak için aşağıdaki butona tıkla.</p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next=/profile" style="display: block; width: 200px; margin: 20px auto; padding: 12px; background-color: #007bff; color: white; text-align: center; text-decoration: none; border-radius: 5px;">E-postamı Onayla</a>
  <p>Bu isteği sen yapmadıysan şifreni hemen değiştir.</p>
</div>
```
