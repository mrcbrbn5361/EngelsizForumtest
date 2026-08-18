# EngelsizForum — Yetki ve Güvenlik Matrisi (Permission Matrix)

**Tarih:** 2026-08-18  

---

| Yetki / Eylem | Anonim Ziyaretçi | Normal Üye (`user`) | Güvenilir Üye (`trusted`) | Moderatör (`moderator`) | Yönetici (`admin`) | Güvenlik / RLS Kuralı |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Konu / Tartışma Okuma** | Evet (Public) | Evet | Evet | Evet | Evet | `status = 'published'` şartı |
| **Konu Başlatma** | Hayır (Giriş zorunlu) | Evet | Evet | Evet | Evet | `auth.uid() IS NOT NULL` |
| **Kendi Konusunu Düzenleme** | Hayır | Evet (`author_id = auth.uid()`) | Evet | Evet | Evet | RLS `author_id = auth.uid()` |
| **Başkasına Ait Konuyu Düzenleme/Silme**| Hayır | Hayır (Reddedilir) | Hayır | Evet (Denetim) | Evet | `is_staff()` kontrolü |
| **Konuyu Sabitleme / Kilitleme** | Hayır | Hayır | Hayır | Evet | Evet | `is_staff()` yetkisi gereklidir |
| **Çözüm İşaretleme** | Hayır | Yalnızca kendi konusunda | Yalnızca kendi konusunda | Evet | Evet | Konu sahibi veya yetkili |
| **Yanıt / Yorum Yazma** | Hayır | Evet | Evet | Evet | Evet | Kilitli olmayan konular |
| **Kötüye Kullanım Raporlama** | Hayır | Evet | Evet | Evet | Evet | `reports` tablosuna INSERT |
| **Rapor Kuyruğunu İnceleme** | Hayır | Hayır (RLS red) | Hayır | Evet | Evet | Sadece `is_staff()` |
| **Kullanıcı Rolü Yükseltme** | Hayır | Hayır | Hayır | Hayır | Evet (Admin RPC) | Doğrudan client UPDATE engelli |
