# EngelsizForum Kapsamlı Modernizasyon & Sıfır Sahte Veri Planı

Platformun giriş, kayıt ol, WebMCP ve geliştirici portalları dahil tüm sayfalarını tutarlı Slate & Indigo koyu temasına kavuşturmak, sahte (mock) verileri tamamen temizleyip canlı Supabase mimarisine bağlamak, mobil dokunmatik ergonomiyi mükemmelleştirmek ve üretim derleme hatalarını kalıcı olarak çözmek için hazırlanan kapsamlı uygulama planı.

### User Review & Critical Decisions

> [!IMPORTANT]
> Kullanıcı ile 1. Aşama soru-cevap sürecinde teyit edilen temel kararlar ve teknik tercihler:

- **Confirmed Decision 1 (Veri Doğruluğu)**: Kullanıcı mesajları, tartışma sayıları ve bildirimlerdeki tüm yapay ve sahte (mock) veriler kaldırılacak; yalnızca gerçek Supabase verileri kullanılacak ve boş durumlarda şık, yönlendirici boş durum (empty-state) ekranları gösterilecek.
- **Confirmed Decision 2 (Görsel Dil & Tema)**: Giriş (`/login`), Kayıt (`/register`), WebMCP (`/webmcp`) ve Geliştirici Portalı (`/developers`) sayfalarındaki açık/mavi karmaşa temizlenecek; platformun ana teması olan Slate & Indigo (`#0B1220`, `#111B2E`, `#18243A`, `#6366f1`) ve WCAG 2.2 AA kontrast standartlarına tam uyarlanacak.
- **Confirmed Decision 3 (Mobil Deneyim)**: Tüm sayfalarda tek elle kullanım, en az 44px dokunmatik hedef alanı (touch target), taşma koruması (overflow-hidden / truncate) ve responsive esneklik sağlanacak.
- **Confirmed Decision 4 (Otomasyon & Dağıtım)**: NSosyal otomasyonu ve bağımlılıkları tamamen temizlenecek; üretim derlemesi (`npm run build`) için tüm TypeScript tipleri ve paket bağımlılıkları eksiksiz doğrulanacak.

---

### 1. Overview & Core Concept

- **What It Does**: EngelsizForum'un tüm temasını tek bir profesyonel, modern, erişilebilir tasarım sisteminde birleştirir. Giriş/Kayıt formları, WebMCP laboratuvarı ve geliştirici araçları modern kart mimarisine geçirilir. Mesajlaşma ve bildirimlerdeki sahte veriler ayıklanıp doğrudan Supabase yetkili oturumuna bağlanır.
- **Target Audience / Persona**: Türkiye'deki engelli bireyler, refakatçiler, hak savunucuları, erişilebilirlik geliştiricileri ve kamu mevzuatı takipçileri.
- **Key Value**: Gerçek zamanlı, güvenilir, sıfır yapay dolgu içeren, ekran okuyucular ve mobil cihazlarla %100 uyumlu bağımsız bir topluluk deneyimi.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Oturum Açma & Kayıt Akışı**: Kullanıcı `/login` veya `/register` sayfasına girdiğinde göz yormayan Slate & Indigo arkaplanı, net odak halkaları (`focus-visible:ring-indigo-500`), net etiketler ve erişilebilir form doğrulaması ile karşılaşır. Sosyal giriş butonu modern minimalist tarzda sunulur.
2. **Özel Mesajlaşma Akışı**: Kullanıcı `/messages` ekranını açtığında, gerçekte var olmayan sahte sohbetler yerine kendi gerçek Supabase mesaj geçmişini görür. Sohbet yoksa bilgilendirici "İlk Mesajı Başlat" butonu ve üye arama penceresi sunulur.
3. **WebMCP & Geliştirici Portalı Akışı**: AI ajanları için entegrasyon konsolu ve 0 TL erişilebilirlik widget test alanı tek bir profesyonel dashboard görünümünde sunulur. Karışık butonlar ve eski mavi stiller yerini temiz sekmelere bırakır.
4. **Mobil Gezinme**: 375px–430px ekranlarda menü, form elemanları ve tablolar yatay taşma yapmaz, alt gezinme çubukları ve butonlar tek başparmakla kolayca tetiklenir.

#### Visual Identity & Theme
- **Aesthetic Direction**: Fonksiyonel, sakin, yüksek okunabilirlikli ve kurumsal "Slate & Indigo" koyu tema.
- **Color Palette & Mood**:
  - Tuval (Canvas): `#0B1220` (Derin Gece Mavisi / Slate 950)
  - Yüzey 1 (Container / Card): `#111B2E`
  - Yüzey 2 (Elevated / Hover): `#18243A`
  - Kenarlıklar (Borders): `#1E293B`
  - Vurgu & Aksiyon (Accent): `#6366F1` (Indigo 500) ve `#818CF8`
  - Metin Standartları: Ana metin `#F8FAFC`, ikincil `#94A3B8`, sessiz `#64748B`
- **Typography & Hierarchy**: Başlıklarda `Plus Jakarta Sans`, gövdede `DM Sans` / sistem sans, mevzuat ve sayısal tablolarda `font-mono tabular-nums`. Sıfır hap (zero-pill) disiplini ile gereksiz rozetler kaldırılıp temiz tipografik ayrıştırma uygulanır.
- **Interactive Feedback**: 150ms geçişler, klavye kısayolları (Alt+M, Alt+A), net durum uyarıları (Sonner toast).

---

### 3. Key Product Decisions & Trade-Offs

#### Decision 1: Sahte (Mock) Verilerin Kaldırılması & Canlı Veri Mimarisi
- **Seçilen Yaklaşım**: Mesajlar, forum konuları ve bildirimlerdeki tüm sahte sabit diziler kaldırılır. Supabase istemcisi boş dizi döndürdüğünde net bir boş durum mesajı ve yönlendirici CTA gösterilir.
- **Gerekçe**: Kullanıcıların platforma güven duyması ve kendi gönderdikleri mesajların kaybolmadan gerçek veritabanında saklanması.
- **Alternatifler**: Rastgele sahte mesaj üretimi değerlendirildi ancak kullanıcı güvenini zedelediği için reddedildi.

#### Decision 2: Giriş, Kayıt ve WebMCP Sayfalarında Tasarım Bütünlüğü
- **Seçilen Yaklaşım**: Eski açık gri/mavi (`bg-white`, `border-slate-200`, `text-sky-600`, `rounded-2xl`) bileşenler bütünüyle temizlenip projenin global Slate & Indigo renk paletine dönüştürülür.
- **Gerekçe**: Sayfalar arası geçişlerde yaşanan ani kontrast patlamalarını önlemek ve WCAG 2.2 AA erişilebilirlik uyumunu eksiksiz sağlamak.

#### Decision 3: Mobil Ergonomi & Dokunmatik Hedefler
- **Seçilen Yaklaşım**: Tüm butonlar `min-h-[44px]` touch target boyutuna çekilir, form girdileri mobilde yakınlaştırma yapmayacak şekilde 16px yazı boyutuyla desteklenir, geniş tablolar mobilde kart listesine dönüştürülür.

#### Decision 4: NSosyal Kaldırılması & Üretim Derleme Sağlamlaştırma
- **Seçilen Yaklaşım**: `scripts/auto-social-poster.js`, silinen iş akışları ve NSosyal script kalıntıları tamamen arındırılır; `package.json` build komutları ve TypeScript tip tanımları `npm run build` ile %100 doğrulanır.

---

### 4. Technical Architecture & Data Strategy (Technical Reference)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ENGELSIZFORUM FRONTEND                          │
│                                                                        │
│   ┌────────────────────┐   ┌───────────────────┐   ┌─────────────────┐ │
│   │   Auth & Giriş     │   │     Mesajlar      │   │  WebMCP & Dev   │ │
│   │  /login & /register│   │     /messages     │   │   /developers   │ │
│   │  (Slate & Indigo)  │   │   (Canlı Sohbet)  │   │  /webmcp        │ │
│   └─────────┬──────────┘   └─────────┬─────────┘   └────────┬────────┘ │
│             │                        │                      │          │
│             ▼                        ▼                      ▼          │
│   ┌──────────────────────────────────────────────────────────────────┐ │
│   │           Unified Accessibility & Design Engine (WCAG 2.2)       │ │
│   │   • High Contrast Mode   • Screen Reader Live Regions            │ │
│   │   • Dyslexia Font        • 44px Touch Targets & Responsive Grid  │ │
│   └──────────────────────────────────┬───────────────────────────────┘ │
└──────────────────────────────────────┼─────────────────────────────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   SUPABASE DATA & SERVER ACTIONS                       │
│                                                                        │
│   ┌───────────────────────┐   ┌────────────────────────────────────┐   │
│   │  auth.users & Profile │   │  conversations & messages (Real)   │   │
│   └───────────────────────┘   └────────────────────────────────────┘   │
│   ┌───────────────────────┐   ┌────────────────────────────────────┐   │
│   │  topics & categories  │   │  notifications & user_preferences  │   │
│   └───────────────────────┘   └────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Bileşen ve Değişiklik Haritası
1. **`/app/login/page.tsx` & `/app/register/page.tsx`**:
   - Slate & Indigo koyu yüzeyler (`bg-[#111B2E]`, `border-[#1E293B]`, `text-white`).
   - Yüksek kontrastlı form girdileri, net hata mesajları ve Google OAuth butonu.
2. **`/app/messages/page.tsx` & `/components/messages/`**:
   - Sahte kullanıcı mesajlarının kaldırılması.
   - Gerçek Supabase oturumuyla entegre konuşma listesi ve boş durum (empty-state) ekranı.
3. **`/app/developers/page.tsx` & `/app/webmcp/page.tsx`**:
   - Eski açık/mavi butonların ve legacy stillerin Slate & Indigo paletine dönüştürülmesi.
   - Kod blokları, JSON kopyalama alanları ve widget test butonlarının modernize edilmesi.
4. **`/components/layout/classic-navbar.tsx` & Mobil Menü**:
   - Mobilde taşma yapmayan kompakt gezinme çubuğu, başparmak dostu butonlar.
5. **Derleme & Temizlik**:
   - NSosyal kalıntılarının temizliği, TypeScript tip denetimi ve `compile_applet` ile sıfır hata garantisi.
