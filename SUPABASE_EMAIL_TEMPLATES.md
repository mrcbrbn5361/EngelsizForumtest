# Supabase E-posta Şablonları

Bu şablonları **Supabase Dashboard -> Authentication -> Email Templates** kısmından ilgili sekmelere kopyalayarak düzenleyebilirsiniz.

> **ÖNEMLİ:** Aşağıdaki HTML kodlarında yer alan `https://<YOUR_APP_URL>/logo.png` kısmını **kendi uygulama URL'niz** ile değiştirmeyi unutmayın (Örn: `https://engelsizforumtest.vercel.app/logo.png`).

## 1. E-posta Doğrulama (Confirm Email)

```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://<YOUR_APP_URL>/logo.png" alt="Engelsiz Forum Logo" style="width: 150px;">
  </div>
  <h2 style="color: #333;">E-posta Adresini Doğrula</h2>
  <p>Merhaba,</p>
  <p>Engelsiz Forum'a hoş geldin! Kaydını tamamlamak için aşağıdaki butona tıkla.</p>
  <a href="{{ .ConfirmationURL }}" style="display: block; width: 200px; margin: 20px auto; padding: 12px; background-color: #007bff; color: white; text-align: center; text-decoration: none; border-radius: 5px;">Hesabı Doğrula</a>
  <p>Eğer bu hesabı sen oluşturmadıysan, bu e-postayı görmezden gelebilirsin.</p>
</div>
```

## 2. Şifre Sıfırlama (Reset Password)

```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://<YOUR_APP_URL>/logo.png" alt="Engelsiz Forum Logo" style="width: 150px;">
  </div>
  <h2 style="color: #333;">Şifreni Sıfırla</h2>
  <p>Merhaba,</p>
  <p>Hesabın için yeni bir şifre oluşturma isteğinde bulundun. Değilsen bu e-postayı yok say.</p>
  <a href="{{ .ConfirmationURL }}" style="display: block; width: 200px; margin: 20px auto; padding: 12px; background-color: #dc3545; color: white; text-align: center; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
  <p>Bu bağlantı kısa bir süre geçerli kalacaktır.</p>
</div>
```
