# EngelsizForum — Karşılaştırmalı Özellik ve Topluluk Matrisi (Feature Matrix)

**Tarih:** 2026-08-18  

---

| Kaynak / Platform | İncelenen Özellik | Çözülen Kullanıcı Problemi | EngelsizForum Durumu | Backend İhtiyacı | Öncelik |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Discourse / Stack Overflow** | Soru-Cevap & Çözülen Yanıt (`is_solved`) | Doğru ve teyitli bilgiye hızlı erişim | Aktif (`is_solved`, `solved_comment_id`) | `topics` & `comments` RLS & trigger | P0 (Core) |
| **Technopat / DonanımHaber** | Kategori/Alt Forum Hiyerarşisi | Konuların dağılmadan organize olması | Aktif (`categories.parent_id`) | Supabase recursive query / nested select | P0 (Core) |
| **Scope UK / 7 Cups** | Erişilebilir Dayanışma & Tanı Grupları | Benzer tecrübedeki bireylerle güvenli iletişim | Aktif (`communities` & `community_members`) | `communities` RLS & scoped moderation | P0 (Core) |
| **GitHub Discussions** | Markdown, Kod ve Alıntı Yanıt | Net ve biçimli bilgi paylaşımı | Aktif (`tiptap` / markdown renderer) | XSS sanitizer & safe content render | P1 (High) |
| **Flarum** | Akıcı Tartışma ve Canlı Filtreleme | Hızlı konu takibi, etiketleme | Aktif (`forum-index-client.tsx`) | FTS & category filters | P1 (High) |
| **R10 / XenForo** | İtibar, Rozet ve Seviye Sistemi | Topluluğa güvenilir katkı yapanları öne çıkarma | Aktif (`profiles.xp`, `profiles.level`, `badges`) | Supabase RPC itibar hesaplama | P2 (Medium) |
| **EngelsizForum Özel** | Hak & Emeklilik Hesaplayıcıları | Karmaşık mevzuatı engelli bireyler için basitleştirme | Aktif (`/hesaplama`) | İstemci & sunucu hesaplama motoru | P1 (High) |
| **EngelsizForum Özel** | Çok Modlu Erişilebilirlik Paneli | Görme, motor veya disleksi zorluğu çekenler için tam uyum | Aktif (`accessibility-provider.tsx`) | Local preferences + `profiles.accessibility_settings` | P0 (Core) |
