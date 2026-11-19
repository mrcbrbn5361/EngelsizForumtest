# EngelsizForum Yol Haritası — 12 Kasım 2026 Notları

Kaynak: `Not_12_Kas_2026.pdf` (el yazısı, 4 sayfa). Canlı site: https://engelsizforum.com/

Maddeler, birbirine bağımlılıklarına ve risklerine göre **fazlara** ayrıldı.
Her fazı bitirmeden bir sonrakine geçmiyoruz. Parantez içindeki numara, nottaki orijinal numaradır.

Durum: ⬜ yapılmadı · 🟨 devam ediyor · ✅ bitti · ❓ netleştirilmeli

---

## Faz 0 — Hata düzeltme ve temizlik (önce bunlar)
Yeni özellik eklemeden önce mevcut sitenin doğru çalışması gerekiyor.

| # | Madde | Not | Durum |
|---|-------|-----|-------|
| 0.1 | Sahte verileri silmek (S1-2) | Kod tarafı temizlendi (kategori auto-seed, demo sayfası, yedek navbar). DB tarafı: `supabase/maintenance/01_sahte_veri_tespit.sql` sonucu bekleniyor | 🟨 |
| 0.2 | Hangileri mock data bilinmiyor (S3-24) | 0.1 ile birlikte: tüm sahte veri kaynaklarının listesi çıkarılacak | ⬜ |
| 0.3 | Yokken mesaj var gibi görünüyor (S2-14) | Okunmamış mesaj sayacı / boş durum hatası | ⬜ |
| 0.4 | Başlıklarda silinmiş ama gösterenler var (S3-25) | Silinen başlıklar listelerde filtrelenmeli | ⬜ |
| 0.5 | Visitors problemi + 404 hatası (S1-5, S1-6) | Kod düzeltildi (token uyumsuzluğu, yutulan hatalar, sahte 12450/42). DB: `supabase/maintenance/02_visitors_tablosu.sql` çalıştırılmalı. 404'ün hangi adreste çıktığı netleştirilmeli | 🟨 |
| 0.6 | Arama'ya tıklayınca sayfa düzeni bozuluyor (S2-17) | Header arama alanı / mobil düzen | ⬜ |
| 0.7 | Kodu optimize etmek (S1-1) | Kullanılmayan kod, bundle boyutu, PageSpeed | ⬜ |

## Faz 1 — Erişilebilirlik ve görünüm
| # | Madde | Not | Durum |
|---|-------|-----|-------|
| 1.1 | Gece / gündüz / göz yormama modu — seçilebilir (S2-6) | `next-themes` zaten kurulu | ⬜ |
| 1.2 | Yüksek kontrast modunu düzenleme (S2-13) | `accessibility-provider.tsx` → `high-contrast` sınıfı | ⬜ |
| 1.3 | Tema ve yazı fontları farklı (S3-19) | Tutarsız fontların tek sisteme bağlanması | ⬜ |
| 1.4 | Yazı tipi eklentisi — erişilebilirlik (S3-20) | Ör. disleksi dostu font seçeneği | ⬜ |
| 1.5 | Görme ve işitme desteği, görme engelliler için kütüphaneler (S1-3) | Ekran okuyucu uyumu, altyazı, işaret dili | ⬜ |

## Faz 2 — Hesap, güvenlik ve gizlilik
| # | Madde | Not | Durum |
|---|-------|-----|-------|
| 2.1 | Şifre değiştirme / şifremi unuttum (S3-22) | `app/auth/forgot-password`, `reset-password` mevcut — test + profil içinden değiştirme | ⬜ |
| 2.2 | Oturum açık kalsın mı? (S3-21) | "Beni hatırla" seçeneği; kapalıysa oturum tarayıcı kapanınca biter | ⬜ |
| 2.3 | Telefon doğrulama, e-posta doğrulama (S3-23) | Supabase Auth (telefon için SMS sağlayıcı gerekir) | ⬜ |
| 2.4 | Profil resmi ve avatar ekleme (S2-12) | Supabase Storage | ⬜ |
| 2.5 | Anonim kullanıcı ekleme (S2-8) | Anonim paylaşım / Supabase anonymous sign-in | ⬜ |
| 2.6 | KVKK — admin kullanıcılar için (S2-11) | Aydınlatma metni, veri silme/indirme talebi, admin paneli | ⬜ |

## Faz 3 — Mesajlaşma ve bildirimler
| # | Madde | Not | Durum |
|---|-------|-----|-------|
| 3.1 | Mesaj kısmı: sesli mesaj özelliği (S1-4) | Kayıt + Supabase Storage | ⬜ |
| 3.2 | Sesli mesajı dinleme ve yazıya dönüştürme (S1-7) | İşitme engelliler için kritik | ⬜ |
| 3.3 | Mesaj bildirimi normal bildirim panelinden farklı olsun (S3-18) | `notification-center.tsx` ayrıştırma | ⬜ |
| 3.4 | Bildirim sistemi: "Bunu da merak edebilirsiniz?" (S1-Ek5) | İlgili başlık önerileri | ⬜ |
| 3.5 | Aynı site içinde aynı konuyu alıntılama ve cevap verme (S3-26) | Alıntı + yanıt zinciri | ⬜ |

## Faz 4 — Topluluk ve içerik
| # | Madde | Not | Durum |
|---|-------|-----|-------|
| 4.1 | Kullanıcıların topluluk oluşturması (S2-15) | `app/communities` mevcut — kullanıcıya açılacak | ⬜ |
| 4.2 | Tercihler (S2-16) | ❓ Ne kastedildiği netleştirilmeli | ❓ |
| 4.3 | Haberi siteye aktarma ve kaynağa yönlendirme — resmi web siteleri için (S1-Ek4) | Özet + "Kaynağa git" bağlantısı | ⬜ |
| 4.4 | Akran mentor eşleştirmesi; e-Devlet belki eklenebilir (S2-10) | e-Devlet entegrasyonu resmi başvuru gerektirir | ⬜ |
| 4.5 | Randevuyu götür — PDF oluşturma (S2-7) | ❓ Hangi randevu? Hastane/rapor için yanında götürülecek özet belge mi? | ❓ |

## Faz 5 — Yapay zeka
| # | Madde | Not | Durum |
|---|-------|-----|-------|
| 5.1 | AI Studio key (S2-9) | ❓ Anahtar `.env` içinde; kod içine yazılmayacak | ❓ |
| 5.2 | Yazar özellik: "Yapay zekaya sorun" (S1-Ek1) | Başlık içinden AI'ya soru | ⬜ |
| 5.3 | RAG bot — filtreleme modu, spesifik şeyler + hesap (S1-Ek2) | Sadece site içeriği/mevzuattan cevap | ⬜ |
| 5.4 | Kumanda özelliği (S1-Ek3) | ❓ Sesli komutla site yönetimi mi? | ❓ |

## Faz 6 — Altyapı (Sayfa 4, hepsi soru işaretli)
Database · App Service · Container Apps · Authentication · Azure Functions · MySQL

❓ Site şu an **Supabase (PostgreSQL + Auth + Storage)** üzerinde çalışıyor. Azure'a taşımak
büyük bir iş ve yukarıdaki fazların hiçbiri bunu gerektirmiyor. Öneri: bu sayfa bir araştırma/öğrenme
listesi olarak kalsın; taşıma kararı Faz 0–5 bittikten sonra ayrıca verilsin.

---

## Netleştirilmesi gerekenler
1. **Tercihler (S2-16)** — Kullanıcı ayarları mı, ilgi alanı seçimi mi?
2. **Randevuyu götür PDF (S2-7)** — Ne tür randevu, PDF'te ne olacak?
3. **Kumanda özelliği (S1-Ek3)** — Sesli komut mu, uzaktan kumanda/klavye kısayolları mı?
4. **AI Studio key (S2-9)** — Yeni anahtar mı alınacak, yoksa mevcut anahtar mı değişecek?
5. **Azure (Sayfa 4)** — Taşıma planı mı, yoksa öğrenilecek konular mı?
