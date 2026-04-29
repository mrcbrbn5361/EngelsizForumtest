# SCOPE: EngelsizForum

## 🎯 Proje Hedefi
Engelli bireylerin hiçbir bariyerle karşılaşmadan bilgi paylaşabildiği, tartıştığı ve topluluk oluşturduğu, tam erişilebilir bir forum platformu.

## 👥 Hedef Kitle (Persona bazlı erişilebilirlik)
- **Görme Engelli Kullanıcılar:** Ekran okuyucu uyumu, semantik HTML, sesli bildirimler.
- **İşitme Engelli Kullanıcılar:** Video içeriklerinde otomatik altyazı (GLM AI desteğiyle), görsel uyarılar.
- **Motor Engelli Kullanıcılar:** Sesli kontrol, geniş tıklama alanları, klavye navigasyonu.
- **Nöro-Çeşitli Kullanıcılar:** Basitleştirilmiş arayüz, AI özetleme (TL;DR), dikkat dağıtmayan mod.

## 🛠️ Teknik Altyapı
- **Frontend:** Next.js (App Router), Tailwind CSS, Framer Motion.
- **Backend/Database:** Supabase (Auth, Realtime, Storage).
- **AI Entegrasyonu:** ZhiPu AI GLM-4.5 API (Erişilebilirlik asistanı ve içerik özetleme için).

## 🚀 MVP (Aşama 1) Özellikleri
1. **Erişilebilir Üyelik:** Supabase Auth ile kolay giriş.
2. **Kategorik Tartışmalar:** Temel forum mimarisi.
3. **Smart Accessibility Toolbar:** Kullanıcının engel türüne göre arayüzü anında maskeleyen bir araç çubuğu.
4. **AI Destekli İçerik:** Uzun yazıları tek tıkla özetleyen asistan.

---

## ❓ Tartışılması Gereken Sorular
1. Supabase'de veritabanı şemasını oluştururken "Erişilebilirlik Tercihleri"ni kullanıcı profilinde saklamalı mıyız? (Otomatik arayüz yüklemesi için)
2. Forum moderasyonunda AI'yı nasıl konumlandıralım?
