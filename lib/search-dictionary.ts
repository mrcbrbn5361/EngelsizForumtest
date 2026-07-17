/**
 * EngelsizForum - Gelişmiş Türkçe Arama Sözlüğü ve Sorgu Genişletme Kütüphanesi
 * 
 * Bu dosya, sitede yapılan aramaları ve filtrelemeleri çok daha kapsayıcı kılmak için tasarlanmıştır.
 * Türkçe dilindeki "engelli" kelimesinin tüm eş anlamlı, eş sesli, eşdeş ve yakın anlamlı karşılıklarını
 * barındırmanın yanı sıra, projenin diğer temel terimleri (erişilebilirlik, yapay zeka, ekran okuyucu vb.) 
 * için de geniş bir kelime eşleme matrisi sunar.
 */

// Türkçe karakterleri standartlaştırma ve küçük harfe çevirme fonksiyonu (Arama toleransını artırmak için)
export function normalizeTurkish(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u")
    .trim();
}

export interface TermDefinition {
  primary: string;           // Ana Terim (Örn: "engelli")
  synonyms: string[];        // Eş Anlamlılar (Örn: "özürlü", "sakat")
  equivalent: string[];      // Eşdeş / Yakın Anlamlılar / Kapsayıcı Modern Terimler (Örn: "özel gereksinimli")
  homonyms?: {               // Eş Sesli Durumlar ve Açıklamaları
    word: string;
    meanings: string[];
  };
  related: string[];         // İlişkili Alt Başlıklar / Kavramlar (Örn: "tekerlekli sandalye", "braille")
}

// 1. Türkçe Engelsiz Topluluk Terimler Matrisi
export const SEARCH_DICTIONARY: TermDefinition[] = [
  {
    primary: "engelli",
    synonyms: [
      "engelli", 
      "engelliler", 
      "engellilere", 
      "engellilerle", 
      "engellilerden", 
      "engelliligin", 
      "engellilik",
      "engelliyim",
      "engelliyiz",
      "sakat", 
      "sakatlar", 
      "sakatlik", 
      "sakati", 
      "sakatlara",
      "ozurlu", 
      "ozurluler", 
      "ozurlulere", 
      "ozurluluk",
      "ozurluyuz",
      "malul", 
      "malulen", 
      "maluliyet", 
      "kisitli", 
      "kisitlilik",
      "ampute", 
      "protezli", 
      "felcli", 
      "gazi", 
      "muhtac", 
      "yetersizligi olan",
      "dezavantajli", 
      "dezavantajlilar"
    ],
    equivalent: [
      "ozel gereksinimli", 
      "ozel gereksinimliler", 
      "ozel gereksinimli birey", 
      "ozel gereksinimli cocuk",
      "engelsiz", 
      "engelsizler", 
      "engelsiz yasam", 
      "engelsiz forum", 
      "bariyersiz", 
      "engelsiz topluluk",
      "bireysel kisitlilik", 
      "norocesitli", 
      "norocesitlilik", 
      "ozel durum", 
      "ozel durumu olan",
      "dezavantajli gruplar", 
      "dezavantajli bireyler",
      "engelliyiz biz",
      "engelsizim",
      "engelsizmir"
    ],
    homonyms: {
      word: "engelli",
      meanings: [
        "Fiziksel, zihinsel, ruhsal, duyusal ve sosyal yetilerindeki kısıtlılıklar nedeniyle toplumsal hayata katılımda engellerle karşılaşan birey (Sosyal/Tıbbi anlam)",
        "Önünde yapay veya doğal engeller bulunan, aşılması gereken bariyerli durum veya koşu parkuru (Mekanik/Spor terimi, örn: engelli koşu, engelli atlama, engelli geçişi)"
      ]
    },
    related: [
      "tekerlekli sandalye",
      "yuruyemeyen",
      "gormeyen",
      "duymayan",
      "konusamayan",
      "protez",
      "ortopedik",
      "down sendromu",
      "otizm",
      "disleksi"
    ]
  },
  {
    primary: "sosyal",
    synonyms: [
      "sosyal", 
      "sosyallik", 
      "toplumsal", 
      "kamusal", 
      "halkla acik", 
      "kollektif", 
      "ortaklasa"
    ],
    equivalent: [
      "birlikte yasam", 
      "sosyal uyum", 
      "sosyal katilim", 
      "sosyal cevre", 
      "sosyal ag", 
      "sosyal medya", 
      "sosyal hayata katilim"
    ],
    homonyms: {
      word: "sosyal",
      meanings: [
        "Toplumla ilgili, toplumsal (Sosyolojik terim, örn: sosyal devlet, sosyal haklar)",
        "Arkadaş canlısı, çevre edinmeye ve iletişim kurmaya yatkın (Bireysel mizaç terimi)"
      ]
    },
    related: [
      "aktivite", 
      "etkinlik", 
      "kamp", 
      "gezi", 
      "tiyatro", 
      "sinema", 
      "tatil", 
      "yardimlasma", 
      "dayanisma", 
      "topluluk"
    ]
  },
  {
    primary: "forum",
    synonyms: [
      "forum", 
      "forumlar", 
      "forumu", 
      "forumda", 
      "forumlarimiz",
      "topluluk", 
      "topluluklar", 
      "toplulugu", 
      "platform", 
      "platformu", 
      "platformlar",
      "grup", 
      "gruplar", 
      "gruplari", 
      "dernek", 
      "dernekler", 
      "dernegi",
      "vakif", 
      "vakiflar", 
      "vakfi", 
      "stk", 
      "stklar", 
      "sivil toplum kurulusu"
    ],
    equivalent: [
      "engelsiz platform", 
      "engelsiz forum", 
      "sosyal ag", 
      "tartisma hatti", 
      "paylasim sitesi", 
      "web sitesi", 
      "com", 
      "net", 
      "xyz"
    ],
    homonyms: {
      word: "forum",
      meanings: [
        "İnternet üzerinde kullanıcıların belirli konularda fikir alışverişinde bulunduğu tartışma portalı (Dijital terim)",
        "Antik Roma'da yurttaşların kamu işlerini konuşmak için toplandıkları alan/meydan (Tarihsel terim)",
        "Toplu tartışma toplantısı, panel (Sosyal terim)"
      ]
    },
    related: [
      "konu", 
      "baslik", 
      "gonderi", 
      "yorum", 
      "cevap", 
      "tartisma", 
      "mesaj", 
      "uyelik", 
      "profil", 
      "kategori"
    ]
  },
  {
    primary: "yardım",
    synonyms: [
      "yardim", 
      "yardimi", 
      "yardimlar", 
      "yardimlaru", 
      "yardimindan", 
      "yardimina",
      "destek", 
      "destegi", 
      "destekler", 
      "destekleri", 
      "destekleme",
      "fayda", 
      "faydalar", 
      "imkan", 
      "imkanlar", 
      "olanak", 
      "olanaklar",
      "burs", 
      "burslar", 
      "bursu", 
      "para", 
      "maddi", 
      "odenek", 
      "maas", 
      "engelli maasi"
    ],
    equivalent: [
      "sosyal yardim", 
      "devlet yardimi", 
      "tek seferlik yardim", 
      "aile destegi", 
      "sosyal destek programi", 
      "kamu yardimi", 
      "belediye yardimi"
    ],
    homonyms: {
      word: "yardım",
      meanings: [
        "Kendi gücünü veya imkanlarını başkasının iyiliği için kullanma, muavenet (Genel anlam)",
        "Bir davanın veya işin tamamlanması için sağlanan ek hibe, ödenek veya hibe (Ekonomik/Hukuki anlam)"
      ]
    },
    related: [
      "kirtasiye", 
      "gida", 
      "nakdi", 
      "ayni", 
      "ogrenci bursu", 
      "engelli maasi", 
      "ev yardimi", 
      "vakif yardimi"
    ]
  },
  {
    primary: "hizmet",
    synonyms: [
      "hizmet", 
      "hizmeti", 
      "hizmetler", 
      "hizmetleri", 
      "hizmetinde",
      "uygulama", 
      "uygulamalar", 
      "uygulamasi", 
      "faaliyet", 
      "faaliyetler",
      "calisma", 
      "calismalar", 
      "calismalari"
    ],
    equivalent: [
      "belediye hizmetleri", 
      "kamu hizmeti", 
      "sosyal hizmet", 
      "engellilerle sosyal hizmet", 
      "sosyal hizmet uygulamalari"
    ],
    homonyms: {
      word: "hizmet",
      meanings: [
        "Birinin işini görme veya bir görevi yerine getirme (Genel anlam)",
        "Devletin yurttaşlara sunduğu altyapı, sağlık, eğitim vb. yararlar (Kamu yönetimi anlamı, örn: sosyal hizmet)"
      ]
    },
    related: [
      "belediye", 
      "kurum", 
      "kurulus", 
      "kamu", 
      "bakanlik", 
      "aile ve sosyal hizmetler", 
      "valilik", 
      "kaymakamlik", 
      "bakirkoy", 
      "bornova", 
      "istanbul"
    ]
  },
  {
    primary: "eğitim",
    synonyms: [
      "egitim", 
      "egitimi", 
      "egitimler", 
      "okul", 
      "okulu", 
      "okullar", 
      "lise", 
      "lisesi", 
      "lisans",
      "universite", 
      "universitesi", 
      "universiteler", 
      "ogrenim", 
      "ogretim"
    ],
    equivalent: [
      "acik lise", 
      "acikogretim", 
      "aof", 
      "auzef", 
      "akademik", 
      "akademi", 
      "ogreticilik", 
      "golge ogreticilik", 
      "ozel egitim"
    ],
    homonyms: {
      word: "eğitim",
      meanings: [
        "Çocukların ve gençlerin toplum yaşayışında yerlerini almaları için gerekli bilgi ve becerileri edinmeleri süreci (Genel anlam)",
        "Belli bir bilim dalında veya meslekte yetiştirme, terbiye (Kurumsal anlam)"
      ]
    },
    related: [
      "kpss", 
      "ekpss", 
      "vize sorulari", 
      "final sorulari", 
      "cikmis sorular", 
      "ders notlari", 
      "burs", 
      "ogrenci"
    ]
  },
  {
    primary: "haklar",
    synonyms: [
      "hak", 
      "haklar", 
      "haklari", 
      "haklarim", 
      "yasa", 
      "yasalar", 
      "kanun", 
      "kanunlar", 
      "mevzuat", 
      "yonetmelik", 
      "hukuk", 
      "adalet"
    ],
    equivalent: [
      "engelli haklari", 
      "yasal haklar", 
      "calisma haklari", 
      "anayasal haklar", 
      "istihdam haklari"
    ],
    homonyms: {
      word: "hak",
      meanings: [
        "Hukukun koruduğu ve kişiye tanıdığı yetki veya menfaat (Hukuki terim, örn: yaşama hakkı, çalışma hakkı)",
        "Doğruluk, adalet (Felsefi/Ahlaki terim, örn: hak yerini buldu)",
        "Pay, hisse (Genel terim, örn: hakkımı aldım)"
      ]
    },
    related: [
      "kpss", 
      "ekpss", 
      "istihdam", 
      "sosyal yardim", 
      "rapor", 
      "emeklilik", 
      "engelli maasi", 
      "otv muafiyeti"
    ]
  },
  {
    primary: "rehber",
    synonyms: [
      "rehber", 
      "rehberi", 
      "rehberler", 
      "kilavuz", 
      "kilavuzu", 
      "bilgilendirme", 
      "tanitim", 
      "kitapcik", 
      "bilgi", 
      "sss", 
      "yardim sayfasi"
    ],
    equivalent: [
      "bilgilendirme rehberi", 
      "engelli haklari rehberi", 
      "sss rehberi", 
      "ulasim rehberi", 
      "kamu rehberi"
    ],
    homonyms: {
      word: "rehber",
      meanings: [
        "Yol gösteren, kılavuz kişi veya kitap (Genel anlam, örn: turist rehberi, haklar rehberi)",
        "İletişim numaralarını, adresleri veya isimleri barındıran katalog (Dizin terimi)"
      ]
    },
    related: [
      "yasa", 
      "kanun", 
      "mevzuat", 
      "rapor", 
      "saglik raporu", 
      "otv muafiyeti", 
      "emeklilik", 
      "is haklari", 
      "calisma haklari"
    ]
  },
  {
    primary: "etkinlik",
    synonyms: [
      "etkinlik", 
      "etkinlikler", 
      "aktivite", 
      "aktiviteler", 
      "aksiyon", 
      "kamp", 
      "kamplar", 
      "gezi", 
      "geziler", 
      "bulusma", 
      "sosyallesme"
    ],
    equivalent: [
      "engelli kampi", 
      "sosyal aktiviteler", 
      "sosyal etkinlikler", 
      "rehabilitasyon etkinlikleri", 
      "birlikte yasam aktiviteleri"
    ],
    homonyms: {
      word: "etkinlik",
      meanings: [
        "Belli bir amaç doğrultusunda gerçekleştirilen organize hareket, eylem (Sosyal terim)",
        "Etkin olma durumu, tesirlilik, verimlilik (Fizik/Kimya/Genel terim)"
      ]
    },
    related: [
      "farkindalik", 
      "etkinlik", 
      "aktivite", 
      "kamp", 
      "kampanya", 
      "sosyal deney", 
      "gorsel"
    ]
  },
  {
    primary: "belediye",
    synonyms: [
      "belediye", 
      "belediyeler", 
      "belediyesi", 
      "belediyeleri", 
      "yerel yonetim", 
      "meclis", 
      "baskanlik", 
      "valilik", 
      "kaymakamlik"
    ],
    equivalent: [
      "belediye hizmetleri", 
      "engelli koordinasyon merkezi", 
      "yerel engelli hizmetleri"
    ],
    related: [
      "bakirkoy", 
      "bornova", 
      "istanbul", 
      "izmir", 
      "ankara", 
      "kadikoy", 
      "cankaya"
    ]
  },
  {
    primary: "kpss",
    synonyms: [
      "kpss", 
      "ekpss", 
      "kamu personeli", 
      "sinav", 
      "kadro", 
      "atama", 
      "yerlestirme", 
      "devlet memurlugu", 
      "istihdam"
    ],
    equivalent: [
      "engelli kpss", 
      "engelli kamu personeli secme sinavi", 
      "kamu istihdami"
    ],
    related: [
      "ders",
      "test",
      "cikmis sorular",
      "calisma",
      "kadro"
    ]
  },
  {
    primary: "ötv",
    synonyms: [
      "otv", 
      "vergi", 
      "muafiyet", 
      "indirim", 
      "araba", 
      "otomobil", 
      "tasit", 
      "muafiyeti", 
      "indirimi", 
      "tasit alimi"
    ],
    equivalent: [
      "otv muafiyeti", 
      "engelli otv indirimi", 
      "vergi muafiyeti"
    ],
    related: [
      "rapor",
      "hastane",
      "indirim",
      "araba",
      "ehliyet"
    ]
  },
  {
    primary: "rapor",
    synonyms: [
      "rapor", 
      "raporu", 
      "saglik raporu", 
      "heyet raporu", 
      "engelli raporu", 
      "durum bildirir", 
      "tanilama", 
      "kurul raporu"
    ],
    equivalent: [
      "engelli saglik kurulu raporu", 
      "saglik kurulu raporu", 
      "durum raporu"
    ],
    homonyms: {
      word: "rapor",
      meanings: [
        "Bir kişinin sağlık durumunu, engellilik oranını belgeleyen resmi heyet evrakı (Tıbbi/Hukuki terim)",
        "Herhangi bir konunun araştırılması sonucu hazırlanan sunum veya inceleme yazısı (Genel/İş dünyası terimi)"
      ]
    },
    related: [
      "saglik",
      "hekim",
      "heyet",
      "engellilik",
      "yasa"
    ]
  },
  {
    primary: "sorumluluk",
    synonyms: [
      "sorumluluk", 
      "sorumlulugu", 
      "yukumluluk", 
      "odev", 
      "gorev", 
      "duyarlilik", 
      "farkindalik"
    ],
    equivalent: [
      "sosyal sorumluluk", 
      "sosyal sorumluluk projesi", 
      "sosyal sorumluluk projeleri", 
      "farkindalik projesi", 
      "farkindalik calismasi"
    ],
    related: [
      "etkinlik",
      "proje",
      "kamu",
      "farkindalik",
      "iyilik"
    ]
  },
  {
    primary: "dışlanma",
    synonyms: [
      "dislanma", 
      "dislama", 
      "ayrimcilik", 
      "onyargi", 
      "tecrit", 
      "yalnizlik", 
      "zorbalik", 
      "psikolojik", 
      "akran zorbaligi"
    ],
    equivalent: [
      "toplumsal dislanma", 
      "engelli ayrimciligi", 
      "sosyal tecrit"
    ],
    related: [
      "toplum",
      "hissiyat",
      "haklar",
      "esitlik",
      "psikoloji"
    ]
  },
  {
    primary: "erişilebilirlik",
    synonyms: [
      "erisfilebilirlik", 
      "ulasilabilirlik", 
      "engelsizlik", 
      "kapsayicilik"
    ],
    equivalent: [
      "evrensel tasarim", 
      "semantik web", 
      "esit erisim", 
      "bariyersiz erisim", 
      "engelsiz bilisim"
    ],
    related: [
      "wcag", 
      "aria", 
      "ekran okuyucu", 
      "biyonik okuma", 
      "yuksek kontrast", 
      "disleksi dostu font", 
      "klavye navigasyonu"
    ]
  },
  {
    primary: "görme engelli",
    synonyms: [
      "gorme engelli", 
      "gormeyen", 
      "kor", 
      "ama", 
      "gorme kisitli", 
      "gorme yetersizligi"
    ],
    equivalent: [
      "braille kullanicisi", 
      "ekran okuyucu kullanicisi", 
      "sesli betimleme takipcisi"
    ],
    related: [
      "braille", 
      "kabartma yazi", 
      "ekran okuyucu", 
      "nvda", 
      "jaws", 
      "talkback", 
      "voiceover", 
      "sesli kitap", 
      "beyaz baston", 
      "sesli betimleme"
    ]
  },
  {
    primary: "işitme engelli",
    synonyms: [
      "isitme engelli", 
      "duymayan", 
      "sagir", 
      "isitme kisitli", 
      "isitme yetersizligi"
    ],
    equivalent: [
      "isaret dili kullanicisi", 
      "koklear implant kullanicisi"
    ],
    related: [
      "isaret dili", 
      "tid", 
      "isitme cihazi", 
      "altyazi", 
      "gorsel asistan", 
      "dudak okuma", 
      "titresimli uyari"
    ]
  },
  {
    primary: "bedensel engelli",
    synonyms: [
      "bedensel engelli", 
      "ortopedik engelli", 
      "fiziksel engelli", 
      "ortopedik kisitli"
    ],
    equivalent: [
      "tekerlekli sandalye kullanicisi", 
      "hareket kisitliligi olan birey"
    ],
    related: [
      "tekerlekli sandalye", 
      "akulu araba", 
      "rampa", 
      "asansor", 
      "ampute", 
      "felc", 
      "kas hastasi", 
      "omurilik felclisi", 
      "protez", 
      "yurume yardimcisi", 
      "kanedyen"
    ]
  },
  {
    primary: "bilişsel engelli",
    synonyms: [
      "bilissel engelli", 
      "zihinsel engelli", 
      "bilissel kisitli", 
      "zihinsel kisitli"
    ],
    equivalent: [
      "norocesitli birey", 
      "ogrenme guclugu olan birey", 
      "ozel gereksinimli ogrenci"
    ],
    related: [
      "disleksi", 
      "otizm", 
      "dehb", 
      "down sendromu", 
      "dikkat eksikligi", 
      "zihin sarayi", 
      "sade dil", 
      "kolay okuma"
    ]
  },
  {
    primary: "yapay zeka",
    synonyms: [
      "yapay zeka", 
      "ai", 
      "dil modeli", 
      "llm", 
      "yapay zeka modeli"
    ],
    equivalent: [
      "gemini", 
      "yeterly ai", 
      "gpt", 
      "uretken yapay zeka", 
      "akilli asistan"
    ],
    related: [
      "otomatik ozet", 
      "seslendirme", 
      "gorsel betimleme", 
      "alt metin", 
      "tts", 
      "text to speech", 
      "makine ogrenmesi"
    ]
  },
  {
    primary: "seslendirme",
    synonyms: [
      "seslendirme", 
      "tts", 
      "text to speech", 
      "metin okuma", 
      "sesli okuma"
    ],
    equivalent: [
      "ses sentezleyici", 
      "sesli asistan", 
      "ekran seslendirici"
    ],
    related: [
      "ekran okuyucu", 
      "hoparlor", 
      "sesli kitap", 
      "konusma sentezi", 
      "dogal ses"
    ]
  },
  {
    primary: "disleksi",
    synonyms: [
      "disleksi", 
      "disleksili", 
      "okuma guclugu"
    ],
    equivalent: [
      "bilissel norocesitlilik"
    ],
    related: [
      "disleksi dostu font", 
      "opendyslexic", 
      "biyonik okuma", 
      "bionic reading", 
      "satir araligi", 
      "harf araligi"
    ]
  },
  {
    primary: "topluluk",
    synonyms: [
      "topluluk", 
      "forum", 
      "grup", 
      "yardimlasma", 
      "dayanisma"
    ],
    equivalent: [
      "engelsiz platform", 
      "sosyal ag", 
      "birliktelik"
    ],
    related: [
      "tartisma", 
      "mesaj", 
      "konu", 
      "yorum", 
      "uyelik", 
      "profil", 
      "kategori"
    ]
  },
  {
    primary: "tartışma",
    synonyms: [
      "tartisma", 
      "konu", 
      "baslik", 
      "gonderi"
    ],
    equivalent: [
      "post", 
      "topic", 
      "forum basligi"
    ],
    related: [
      "yorum", 
      "cevap", 
      "cozum", 
      "kilitli", 
      "sabitlenen"
    ]
  },
  {
    primary: "özel gereksinimli",
    synonyms: [
      "ozel gereksinimli",
      "ozel gereksinimliler",
      "ozel gereksinimli birey",
      "ozel gereksinimli cocuk",
      "ozel gereksinimli ogrenci",
      "ozel gereksinimli bireyler"
    ],
    equivalent: [
      "engelli",
      "engelliler",
      "engellilik",
      "norocesitli",
      "norocesitlilik",
      "disleksili",
      "otizmli",
      "sakat",
      "ozurlu"
    ],
    related: [
      "giyim becerisi",
      "dil gelisimi",
      "hareket egitimi",
      "tasarimlar",
      "teknolojik aletler",
      "siniflandirma",
      "yasama kolayligi"
    ]
  },
  {
    primary: "bağcılar",
    synonyms: [
      "bagcilar",
      "bagcilar belediyesi",
      "bagcilar engelliler sarayi",
      "feyzullah kiyiklik engelliler sarayi",
      "engelliler sarayi"
    ],
    equivalent: [
      "engelliler sarayi",
      "engelli merkezi",
      "rehabilitasyon merkezi",
      "sosyal tesis"
    ],
    related: [
      "havuz",
      "hamam",
      "diyetisyen",
      "kurslar",
      "spor salonu",
      "kirazli"
    ]
  },
  {
    primary: "engelliyiz",
    synonyms: [
      "engelliyiz",
      "engelliyiz biz",
      "engelliyizbiz",
      "engelliyiz forum",
      "engelliyiz net",
      "engelliyiz.com"
    ],
    equivalent: [
      "engelsiz forum",
      "engelliler toplulugu",
      "sosyal platform"
    ],
    related: [
      "vergi indirimi",
      "mevzuat",
      "emeklilik",
      "otv muafiyeti"
    ]
  },
  {
    primary: "engelsizim",
    synonyms: [
      "engelsizim",
      "engelsizim com",
      "engelsizim net",
      "engelsizim e devlet",
      "engelsizim kariyer"
    ],
    equivalent: [
      "engelsiz platform",
      "engelliler platformu",
      "sosyal asistan"
    ],
    related: [
      "fatura",
      "internet",
      "uyelik",
      "kampanya"
    ]
  },
  {
    primary: "haber",
    synonyms: [
      "haber",
      "haberleri",
      "a haber",
      "trt",
      "fox",
      "now",
      "star",
      "kanal d",
      "show tv",
      "medya",
      "gazete",
      "karadeniz engelsiz hayat",
      "pozitif engelliler gazetesi"
    ],
    equivalent: [
      "engelsiz medya",
      "gundem",
      "son dakika",
      "engelsiz tv"
    ],
    related: [
      "belgesel",
      "program",
      "yayin",
      "bulten"
    ]
  },
  {
    primary: "uygulama",
    synonyms: [
      "uygulama",
      "uygulamasi",
      "apk",
      "indir",
      "oyun",
      "oyna",
      "v5",
      "v6",
      "android 16",
      "aa engelsiz",
      "jabulani",
      "hot wheels",
      "labubu"
    ],
    equivalent: [
      "mobil uygulama",
      "engelsiz oyun",
      "meb engelsiz"
    ],
    related: [
      "talkback",
      "voiceover",
      "nvda",
      "jaws"
    ]
  },
  {
    primary: "hastane",
    synonyms: [
      "hastane",
      "hastaneler",
      "ozel hastane",
      "ozel hastaneler",
      "randevu",
      "adana",
      "afyon",
      "afiyet",
      "aksu",
      "aktif international",
      "avcilar",
      "avrasya",
      "balat",
      "basari",
      "bilge",
      "can",
      "central hospital",
      "cihan",
      "delta",
      "duygu",
      "emsey",
      "ensar",
      "erdem",
      "esencan",
      "fatih",
      "flora",
      "florya",
      "fransiz lape",
      "fsm",
      "gaziosmanpasa",
      "goztepe",
      "gungoren",
      "hayat",
      "ilgi",
      "istanbul",
      "jimer",
      "kartal",
      "kizilay",
      "levent",
      "lotus",
      "maltepe",
      "marmara",
      "medigold",
      "medivia",
      "meltem",
      "mercan",
      "meva",
      "moodist",
      "okmeydani",
      "osmanoglu",
      "pendik",
      "rami",
      "rumeli",
      "saygi",
      "silivri",
      "tanfer",
      "tepe",
      "tusa",
      "tip",
      "validebag",
      "vera",
      "vital",
      "yasar",
      "yuzyil",
      "zeytinburnu",
      "zilan",
      "camlica",
      "camlik",
      "cevre",
      "oz istanbul",
      "hastanesi"
    ],
    equivalent: [
      "saglik kurulusu",
      "tip merkezi",
      "poliklinik",
      "klinik"
    ],
    related: [
      "cildiye",
      "doktor",
      "muayene",
      "rapor"
    ]
  },
  {
    primary: "akademi",
    synonyms: [
      "akademi",
      "universite",
      "okul",
      "adu",
      "ahmet yesevi",
      "lokman hekim",
      "asik veysel okulu",
      "galatasaray",
      "hacettepe",
      "halic",
      "gazi",
      "meram",
      "nku",
      "omu",
      "uludag",
      "yeditepe",
      "yildiz teknik",
      "uskudar",
      "acik lise",
      "acikogretim",
      "aof",
      "auzef",
      "lgs",
      "burs",
      "burslar",
      "ders notlari",
      "vize sorulari",
      "final sorulari",
      "cikmis sorular",
      "kirtasiye",
      "ozel ders"
    ],
    equivalent: [
      "ozel egitim ogretmenligi",
      "ozel ogrencilik",
      "engelsiz universite"
    ],
    related: [
      "sinav",
      "ogretim",
      "ogrenim",
      "ders"
    ]
  },
  {
    primary: "yerel",
    synonyms: [
      "yerel",
      "belediye",
      "ozgem",
      "saray",
      "bagcilar engelliler sarayi",
      "basaksehir ozgem",
      "beylikduzu",
      "beyoglu",
      "buyukcekmece",
      "esenyurt",
      "fatih",
      "kagithane",
      "pendik",
      "sancaktepe",
      "sultanbeyli",
      "sultangazi",
      "tuzla",
      "cekmekoy",
      "kadikoy",
      "umraniye",
      "esenler",
      "sile kampi",
      "florya kampi",
      "gonca engelsiz yasam",
      "bornova",
      "isparta",
      "elazig"
    ],
    equivalent: [
      "engelli koordinasyon",
      "kisa mola",
      "engelsiz yasam merkezi"
    ],
    related: [
      "havuz",
      "hamam",
      "diyetisyen",
      "spor salonu"
    ]
  },
  {
    primary: "icat",
    synonyms: [
      "icat",
      "icatlar",
      "tasarim",
      "proje",
      "teknoloji tasarim",
      "basit icatlar",
      "akilli baston",
      "akilli gozluk",
      "konusan saat",
      "teknofest",
      "7 sinif teknoloji tasarim",
      "proje fikirleri",
      "materyaller",
      "slogan ornekleri"
    ],
    equivalent: [
      "engelsiz yasam teknolojileri",
      "engelsiz hayat teknolojileri"
    ],
    related: [
      "gelistirmeler",
      "cizimler",
      "urunler",
      "tasarim özellikleri"
    ]
  },
  {
    primary: "iletisim",
    synonyms: [
      "iletisim",
      "internet",
      "telefon",
      "turkcell",
      "vodafone",
      "turknet",
      "millenicom",
      "ptt",
      "fatura",
      "fatura indirimi",
      "ev interneti"
    ],
    equivalent: [
      "engelsiz tarife",
      "engelsiz bankacilik",
      "cagri merkezi"
    ],
    related: [
      "cep telefonu indirimi",
      "engelsiz magaza",
      "ozel numara"
    ]
  },
  {
    primary: "muafiyet",
    synonyms: [
      "muafiyet",
      "muafiyeti",
      "indirim",
      "otv muafiyeti",
      "emlak vergisi",
      "cevre temizlik vergisi",
      "vergi indirimi",
      "ruhsatli silah",
      "yesil pasaport",
      "otv indirimi",
      "araba alimi",
      "refakatci karti",
      "ucretsiz seyahat karti",
      "muzikart"
    ],
    equivalent: [
      "yasal kolayliklar",
      "engelsiz destekler",
      "vergi muafiyeti"
    ],
    related: [
      "araba",
      "ehliyet",
      "tasit",
      "rapor"
    ]
  }
];

/**
 * Verilen arama kelimesini veya sorguyu analiz ederek, sözlükteki tüm eş anlamlı,
 * eşdeş, yakın anlamlı ve ilişkili kelimelerle genişletir.
 * 
 * @param query Kullanıcının arama kutusuna yazdığı ham sorgu
 * @returns Genişletilmiş ve normalleştirilmiş kelimelerin benzersiz listesi
 */
export function expandSearchQuery(query: string): string[] {
  if (!query) return [];
  
  const normalizedQuery = normalizeTurkish(query);
  const words = normalizedQuery.split(/\s+/).filter(w => w.length > 1);
  const expandedSet = new Set<string>();

  // Orijinal arama terimlerini ekle
  words.forEach(w => expandedSet.add(w));
  if (normalizedQuery && normalizedQuery.length > 1) {
    expandedSet.add(normalizedQuery);
  }

  // Her kelimeyi sözlükte eşleştirip genişlet
  words.forEach(word => {
    SEARCH_DICTIONARY.forEach(def => {
      // Kelime ana terim, eş anlamlılar, eşdeşler veya ilişkili kelimelerle eşleşiyor mu?
      const isPrimaryMatch = normalizeTurkish(def.primary).includes(word) || word.includes(normalizeTurkish(def.primary));
      
      const isSynonymMatch = def.synonyms.some(s => 
        normalizeTurkish(s).includes(word) || word.includes(normalizeTurkish(s))
      );
      
      const isEquivalentMatch = def.equivalent.some(e => 
        normalizeTurkish(e).includes(word) || word.includes(normalizeTurkish(e))
      );

      if (isPrimaryMatch || isSynonymMatch || isEquivalentMatch) {
        // Eşleşme bulunduysa, bu tanımdaki TÜM ana terim, eş anlamlılar ve eşdeş kelimeleri ekle
        expandedSet.add(normalizeTurkish(def.primary));
        def.synonyms.forEach(s => expandedSet.add(normalizeTurkish(s)));
        def.equivalent.forEach(e => expandedSet.add(normalizeTurkish(e)));
        
        // Çok aşırı genişletmeyi önlemek için ilişkili olanlardan sadece ilk 3 tanesini ekle
        def.related.slice(0, 4).forEach(r => expandedSet.add(normalizeTurkish(r)));
      }
    });
  });

  return Array.from(expandedSet);
}

/**
 * Bir metnin (konu başlığı veya içeriği), genişletilmiş sorgu kelimelerinden 
 * herhangi birini içerip içermediğini kontrol eden client-side yardımcı fonksiyon.
 */
export function matchQueryWithText(text: string, expandedTerms: string[]): boolean {
  if (!text || expandedTerms.length === 0) return false;
  const normalizedText = normalizeTurkish(text);
  
  return expandedTerms.some(term => {
    // Kelime kelime veya tümce olarak içerme kontrolü
    return normalizedText.includes(term);
  });
}
