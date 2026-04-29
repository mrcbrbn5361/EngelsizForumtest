# OpenCode Agent Setup (Vibe Coder Kit)

Bu dosya proje kurallarını ve iş akışını tanımlar.

---

## Zorunlu İlk Adım
Her yeni oturumda projenin durumunu ve aktif görevleri gözden geçir.

---

## Kritik Kurallar

### Güvenlik
- Kritik işlemler (Database silme vb.) öncesi mutlaka onay al.
- Hassas verileri asla koda yazma, `.env` kullan.

### Kod Kalitesi & Temizliği
- Yorumlar sadece metot seviyesinde (JSDoc style).
- Satır içi yorumlardan kaçın.
- Debug loglarını (`console.log`) commit öncesi temizle.
- DRY: 3+ tekrar eden kodları extract et.

---

## İş Akışı
1. **Beyin Fırtınası:** Fikirler netleştirilir ve `SCOPE-engelsizforum.md` oluşturulur.
2. **Planlama:** `implementation_plan.md` yazılır.
3. **Geliştirme:** Test odaklı ve temiz kod prensipleriyle uygulama.
4. **Gözden Geçirme:** Kod kalitesi ve erişilebilirlik (WCAG 2.1) kontrolü.

---

## Agent Personaları
- **Aria:** UI/UX ve Erişilebilirlik Uzmanı.
- **Felix:** Frontend ve Supabase Entegrasyonu.
- **Bora:** Backend ve Güvenlik.
