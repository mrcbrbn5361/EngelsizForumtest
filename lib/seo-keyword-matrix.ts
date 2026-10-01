/**
 * EngelsizForum Kapsamlı SEO, Mevzuat ve Akıllı Arama Anahtar Kelime Matrisi
 * Türkiye'nin 81 ili, tüm kurumlar, engelli hakları ve her terimin en az 5 alternatifi + harf hatası (typo) toleransları.
 */

export interface KeywordEntry {
  id: string;
  category: 'mevzuat' | 'otv' | 'emeklilik' | 'sosyal_yardim' | 'istihdam' | 'saglik_cihaz' | 'kurum' | 'il';
  primaryTerm: string;
  definition: string;
  alternatives: string[]; // En az 5 alternatif
  typos: string[];        // Harf hatası, yazım yanlışı, fonetik varyasyonlar
  targetUrl: string;
  relatedInstitutions?: string[];
  cityCode?: string;
}

export const SEO_KEYWORD_MATRIX: KeywordEntry[] = [
  // 1. BALTHAZARD & SAĞLIK KURULU RAPORU
  {
    id: 'balthazard',
    category: 'mevzuat',
    primaryTerm: 'Balthazard Formülü',
    definition: 'Birden fazla hastalığı bulunan bireylerin engel oranlarının kalan sağlıklı vücut oranı üzerinden kademeli toplanmasını sağlayan resmi formül (20 Şubat 2019 / 30692 R.G. Ek-2).',
    alternatives: [
      'Balthazard hesaplama',
      'Özür oranı birleştirme formülü',
      'Sağlık kurulu heyet raporu oranı',
      'Engelli yüzde birleştirme cetveli',
      'Birden çok hastalık oran toplama',
      'Balthazar özür tablosu',
      'Vücut fonksiyon kaybı oranı'
    ],
    typos: [
      'baltazar',
      'baltazard',
      'baltazart',
      'balthazar',
      'baltazar formulü',
      'baltazar hesapla',
      'baltazar cetveli',
      'balthazar hesaplama',
      'baltazat'
    ],
    targetUrl: '/hesaplama/balthazard',
    relatedInstitutions: ['Sağlık Bakanlığı', 'İl Sağlık Müdürlükleri', 'Hakem Hastaneler']
  },
  {
    id: 'eskr-raporu',
    category: 'mevzuat',
    primaryTerm: 'Erişkinler İçin Engellilik Sağlık Kurulu Raporu (ESKR)',
    definition: '18 yaş üzeri bireylerin engel durumlarını belgeleyen tam teşekküllü devlet, şehir ve üniversite hastanelerince düzenlenen resmi sağlık raporu.',
    alternatives: [
      'Engelli sağlık kurulu raporu',
      'Heyet raporu engelli',
      'Sürekli engelli raporu',
      'Süreli sağlık kurulu raporu',
      'Hakem hastane raporu',
      'Yetişkin engellilik değerlendirmesi',
      'Engelli kimlik kartı raporu'
    ],
    typos: [
      'eskr',
      'eskr raporu',
      'heyet rapor',
      'engeli raporu',
      'engelli heyet',
      'engelli saglik raporu',
      'saglik kurulu rapor'
    ],
    targetUrl: '/hesaplama/balthazard',
    relatedInstitutions: ['Sağlık Bakanlığı', 'Eğitim ve Araştırma Hastaneleri', 'Şehir Hastaneleri']
  },
  {
    id: 'cozger',
    category: 'mevzuat',
    primaryTerm: 'Çocuklar İçin Özel Gereksinim Raporu (ÇÖZGER)',
    definition: '18 yaşını doldurmamış özel gereksinimli çocuklar için yüzde yerine kategorik gereksinim basamaklarını (ÖKGV, ÇÖGV, BÖGV vb.) belirleyen rapor.',
    alternatives: [
      'Çocuk özel gereksinim raporu',
      'Özel Koşul Gereksinimi Vardır (ÖKGV)',
      'Çok İleri Düzeyde Özel Gereksinim (ÇÖGV)',
      'Belirgin Düzeyde Özel Gereksinim (BÖGV)',
      '18 yaş altı engelli raporu',
      'ÇÖZGER evde bakım ve ÖTV hakkı'
    ],
    typos: [
      'cozger',
      'çozger',
      'cozger raporu',
      'çözer raporu',
      'cozger heyet',
      'cozkur'
    ],
    targetUrl: '/hesaplama/balthazard',
    relatedInstitutions: ['Çocuk İzlem Merkezleri', 'Sağlık Bakanlığı', 'RAM']
  },

  // 2. 2026 ÖTV & MTV ARAÇ MUAFİYETİ
  {
    id: 'otv-muafiyeti',
    category: 'otv',
    primaryTerm: '2026 ÖTV Muafiyetli Araç Alımı',
    definition: 'Yeniden değerleme oranına göre belirlenen 2.290.200 TL üst tavan dahilinde %90 üzeri engelliler ile ortopedik özel tertibatlı engellilere tanınan sıfır araç Özel Tüketim Vergisi istisnası.',
    alternatives: [
      'Engelli araç alımı 2026',
      'ÖTV istisnası otomobil limiti',
      '2.290.200 TL ÖTV üst limiti',
      'ÖTVsiz sıfır araba indirimi',
      'Engelli araba muafiyet hesaplama',
      'Özel tertibatlı araç alım şartları',
      'Yüzde 90 engelli oto alımı'
    ],
    typos: [
      'otv',
      'ötv',
      'ö.t.v',
      'otv muafiyeti',
      'otv indirimi',
      'otvli arac',
      'otvsiz araba',
      'ötv siz araç',
      'ötv tavan 2026',
      'otvli oto'
    ],
    targetUrl: '/hesaplama/otv',
    relatedInstitutions: ['Gelir İdaresi Başkanlığı', 'Vergi Daireleri', 'Yetkili Otomotiv Bayileri']
  },
  {
    id: 'mtv-muafiyeti',
    category: 'otv',
    primaryTerm: 'Motorlu Taşıtlar Vergisi (MTV) Engelli Muafiyeti',
    definition: 'ÖTV muafiyetiyle alınan veya sonradan engeline uygun tertibat taktırılan tescilli taşıtların her yıl Ocak ve Temmuz aylarında ödenen MTV vergisinden %100 muaf tutulması.',
    alternatives: [
      'Engelli MTV muafiyeti dilekçesi',
      'Bandrol vergisi engelli istisnası',
      'Yıllık taşıt vergisi muafiyeti',
      'İnteraktif Vergi Dairesi MTV engelli başvurusu',
      'Engelli araç vergi muafiyet formu'
    ],
    typos: [
      'mtv',
      'm.t.v',
      'mtv muafiyet',
      'mtv indirimi',
      'engelli mtv',
      'bandrol muafiyeti'
    ],
    targetUrl: '/hesaplama/otv',
    relatedInstitutions: ['Gelir İdaresi Başkanlığı', 'İnteraktif Vergi Dairesi']
  },
  {
    id: 'ortopedik-tertibat-kodlari',
    category: 'otv',
    primaryTerm: 'Ortopedik Engelli Sürücü Tertibat Kodları',
    definition: 'Yeni tip engelli sürücü belgelerinde yer alan; el freni, direksiyon topuzu, sol ayak gaz pedalı, otomatik vites eşdeğerliği gibi özel aksam kodları (10.02, 20.01, 35.03 vb.).',
    alternatives: [
      'Engelli ehliyet kodları tablosu',
      'Özel tertibatlı araç kodları',
      'Sol bacak otomatik vites ÖTV muafiyeti',
      'İl Sağlık Müdürlüğü Komisyonu ehliyet kararı',
      'Otomatik vites tertibat sayılması'
    ],
    typos: [
      'ehliyet kodlari',
      'tertibat kodu',
      'engeli ehliyet',
      'sol ayak otv',
      'otomatik vites otv'
    ],
    targetUrl: '/hesaplama/otv',
    relatedInstitutions: ['Nüfus ve Vatandaşlık İşleri', 'İl Sağlık Müdürlükleri']
  },

  // 3. EMEKLİLİK & SGK HAKLARI
  {
    id: 'engelli-erken-emeklilik',
    category: 'emeklilik',
    primaryTerm: 'Engelli Erken Emeklilik (5510 & 506 K.)',
    definition: 'Yaş şartı aranmaksızın yalnızca sigortalılık süresi ve prim gün sayısı ile kademeli olarak emekli olma hakkı.',
    alternatives: [
      'Kademeli engelli emeklilik tablosu',
      'Yaş şartsız engelli emekliliği',
      '4A SSK engelli emeklilik şartları',
      '4B Bağ-Kur engelli emeklilik',
      '4C Memur engelli emekliliği',
      'Vergi indirimiyle erken emeklilik',
      'SGK engelli prim gün sayısı sorgulama'
    ],
    typos: [
      'engelli emeklilik',
      'erken emeklilik',
      'engeli emekli',
      'engelli emekli tablosu',
      'emeklilik gunu',
      'sgk engelli emeklilik'
    ],
    targetUrl: '/hesaplama/erken-emeklilik',
    relatedInstitutions: ['Sosyal Güvenlik Kurumu (SGK)', 'SGK İl Müdürlükleri / SGM']
  },
  {
    id: 'malulen-emeklilik',
    category: 'emeklilik',
    primaryTerm: 'Malulen Emeklilik Kriterleri',
    definition: 'Çalışma gücünün en az %60\'ını sonradan kaybeden sigortalıların 10 yıl sigortalılık ve 1800 prim günüyle emekliye ayrılması.',
    alternatives: [
      'SGK malullük aylığı',
      'Yüzde 60 maluliyet raporu',
      '1800 günle emeklilik',
      'Sürekli bakıma muhtaç malulen emeklilik',
      'SGK Yüksek Sağlık Kurulu maluliyet itirazı'
    ],
    typos: [
      'malulen',
      'malülen',
      'malulen emekli',
      'maluliyet',
      'malüllük',
      'malulen emeklilik sartlari'
    ],
    targetUrl: '/hesaplama/erken-emeklilik',
    relatedInstitutions: ['SGK Maluliyet ve Sağlık Kurulları Daire Başkanlığı']
  },

  // 4. SOSYAL YARDIMLAR & MAAŞLAR
  {
    id: 'evde-bakim-maasi',
    category: 'sosyal_yardim',
    primaryTerm: 'Evde Bakım Maaşı (2828 Sayılı Kanun)',
    definition: 'Sağlık raporunda "Tam Bağımlı" ibaresi bulunan ve hane içi kişi başı geliri net asgari ücretin 2/3\'ünden az olan bakıma muhtaç bireylerin refakatçilerine ödenen aylık destek.',
    alternatives: [
      'Evde bakım yardımı 2026',
      'Bakıcı maaşı şartları',
      'Tam bağımlı engelli bakım ücreti',
      'Evde bakım gelir testi kriteri',
      'Aile Bakanlığı bakım desteği'
    ],
    typos: [
      'evde bakim',
      'evde bakım parası',
      'bakici maasi',
      'evde bakim ucreti',
      'bakim ayligi',
      'evde bakim sartlari'
    ],
    targetUrl: '/hesaplama/evde-bakim',
    relatedInstitutions: ['Aile ve Sosyal Hizmetler Bakanlığı', 'Sosyal Hizmet Merkezleri (SHM)']
  },
  {
    id: 'engelli-ayligi-2022',
    category: 'sosyal_yardim',
    primaryTerm: '2022 Sayılı Kanun Engelli Aylığı',
    definition: 'Sosyal güvencesi olmayan, hane içi kişi başı geliri net asgari ücretin 1/3\'ünden az olan muhtaç engelli bireylere SYDV kanalıyla bağlanan aylık.',
    alternatives: [
      '2022 engelli maaşı tutarları',
      'Yüzde 40-69 engelli aylığı',
      'Yüzde 70 üzeri engelli aylığı',
      'Kaymakamlık engelli maaşı başvurusu',
      'SYDV muhtaçlık aylığı'
    ],
    typos: [
      '2022 maasi',
      '2022 engelli maasi',
      'engelli ayligi',
      'engeli maasi',
      'vakif engelli maasi'
    ],
    targetUrl: '/hesaplama/engelli-ayligi',
    relatedInstitutions: ['Sosyal Yardımlaşma ve Dayanışma Vakfı (SYDV)', 'Kaymakamlıklar']
  },

  // 5. İSTİHDAM & E-KPSS & VERGİ İNDİRİMİ
  {
    id: 'ekpss',
    category: 'istihdam',
    primaryTerm: 'Engelli Kamu Personeli Seçme Sınavı (E-KPSS)',
    definition: 'ÖSYM tarafından iki yılda bir düzenlenen ve engelli bireylerin kamuda memur kadrolarına yerleşmesini sağlayan merkezi sınav ve kura sistemi.',
    alternatives: [
      'EKPSS tercih kılavuzu',
      'Engelli memur alımı kura',
      'Kamuda engelli istihdamı',
      'EKPSS lisans ve önlisans puanları',
      'ÖSYM engelli sınavı başvuru'
    ],
    typos: [
      'ekpss',
      'e kpss',
      'ekps',
      'e-kps',
      'engelli kpss',
      'ekpss sonuclari'
    ],
    targetUrl: '/hesaplama/vergi-indirimi',
    relatedInstitutions: ['ÖSYM', 'Devlet Personel Başkanlığı', 'Çalışma ve Sosyal Güvenlik Bakanlığı']
  },
  {
    id: 'vergi-indirimi-gvk31',
    category: 'istihdam',
    primaryTerm: 'Gelir Vergisi Kanunu 31. Madde Sakatlık İndirimi',
    definition: '1., 2. ve 3. derece engelli ücretli çalışanların vergi matrahından derece tutarı indirilerek her ay net maaşlarına doğrudan yansıtılan nakit vergi kazancı.',
    alternatives: [
      'Engelli vergi indirimi belgesi',
      'Maaş sakatlık indirimi bordro',
      'GİB vergi indirimi sorgulama',
      '1. derece engelli vergi kazancı',
      'Özel sektör engelli maaş artışı'
    ],
    typos: [
      'vergi indirimi',
      'engelli vergi indirimi',
      'gvk 31',
      'sakatlik indirimi',
      'vergi matrahi indirim'
    ],
    targetUrl: '/hesaplama/vergi-indirimi',
    relatedInstitutions: ['Gelir İdaresi Başkanlığı (GİB)', 'Vergi Dairesi Başkanlıkları']
  },
  {
    id: 'engelli-istihdam-kotasi',
    category: 'istihdam',
    primaryTerm: 'İş Kanunu 30. Madde Engelli Kotası',
    definition: '50 veya daha fazla işçi çalıştıran özel sektörde en az %3, kamu kurumlarında ise en az %4 oranında engelli işçi istihdam etme yasal mecburiyeti.',
    alternatives: [
      'Yüzde 3 engelli işçi kotası',
      'İŞKUR engelli personel ilanı',
      'Engelli kontenjan cezası fonu',
      'Özel sektör engelli istihdam zorunluluğu',
      'Engelli iş ilanı başvuru'
    ],
    typos: [
      'engelli kotasi',
      'engelli kota',
      'iskur engelli',
      'engelli is ilani',
      'is kanunu 30'
    ],
    targetUrl: '/hesaplama/vergi-indirimi',
    relatedInstitutions: ['İŞKUR', 'Çalışma ve Sosyal Güvenlik Bakanlığı']
  },
  {
    id: 'kidem-ihbar-hakli-fesih',
    category: 'istihdam',
    primaryTerm: 'İş Kanunu 24/I-a Sağlık Nedeniyle Haklı Fesih',
    definition: 'Yapılan işin niteliğinden ötürü sağlığı tehlikeye giren engelli işçinin ihbar süresi beklemeksizin sözleşmesini feshedip kıdem tazminatını tam alma hakkı.',
    alternatives: [
      'Engelli haklı fesih kıdem tazminatı',
      'Sağlık raporuyla işten ayrılma',
      'İhbar süresiz istifa kıdem hakkı',
      '2026 kıdem tazminatı tavan hesabı',
      'Engelli işçi tazminat koruması'
    ],
    typos: [
      'hakli fesih',
      'kidem tazminati',
      'engelli istifa kidem',
      '24 1 a fesih',
      'saglik sebebiyle istifa'
    ],
    targetUrl: '/hesaplama/kidem-ihbar',
    relatedInstitutions: ['Arabuluculuk Merkezleri', 'İş Mahkemeleri']
  },

  // 6. TÜM ENGEL TÜRLERİ & MEDİKAL EKİPMANLAR
  {
    id: 'ortopedik-engelliler',
    category: 'saglik_cihaz',
    primaryTerm: 'Ortopedik ve Bedensel Engellilik Hakları',
    definition: 'Felç, hemipleji, parapleji, tetrapleji, ampütasyon, kas distrofisi, omurilik felci gibi hareket sistemi kısıtlılıklarında ÖTV, akülü sandalye ve erişilebilirlik hakları.',
    alternatives: [
      'Bedensel engelli hakları',
      'Omurilik felçlileri araç muafiyeti',
      'Akülü tekerlekli sandalye SGK ödemesi',
      'Manuel sandalye SUT geri ödeme',
      'Biyonik protez SGK desteği'
    ],
    typos: [
      'ortopedik',
      'ortopedi engelli',
      'bedensel engelli',
      'tekerlekli sandalye',
      'akulu sandalye',
      'parapleji'
    ],
    targetUrl: '/hesaplama/otv',
    relatedInstitutions: ['SGK Genel Sağlık Sigortası', 'Medikal Firmalar']
  },
  {
    id: 'gorme-engelliler',
    category: 'saglik_cihaz',
    primaryTerm: 'Görme Engelliler ve Az Gören Birey Hakları',
    definition: 'Total görme kaybı, az görenlik, retinitis pigmentosa (tavukkarası) ve sarı nokta hastalarına sağlanan beyaz baston, ekran okuyucu yazılım ve refakatçi kartı hakları.',
    alternatives: [
      'Görme engelli beyaz baston desteği',
      'Braille alfabe materyalleri',
      'NVDA ve JAWS ekran okuyucu erişilebilirliği',
      'Ücretsiz sesli kütüphane hakları',
      'Görme engelli refakatçi seyahat kartı'
    ],
    typos: [
      'gorme engelli',
      'görme engeli',
      'korler vakfi',
      'az goren',
      'beyaz baston'
    ],
    targetUrl: '/hesaplama/balthazard',
    relatedInstitutions: ['Altı Nokta Körler Derneği', 'Milli Kütüphane Konuşan Kitaplık']
  },
  {
    id: 'isitme-engelliler',
    category: 'saglik_cihaz',
    primaryTerm: 'İşitme Engelliler ve Koklear İmplant Hakları',
    definition: 'Sensorinöral işitme kaybı, iletim tipi kayıp, koklear implant ameliyatı ve işitme cihazı pil/cihaz SGK SUT geri ödeme hakları.',
    alternatives: [
      'İşitme cihazı SGK katkı payı',
      'Koklear implant SGK karşılama',
      'Türk İşaret Dili (TİD) tercüman desteği',
      'İşitme kaybı desibel rapor cetveli',
      'İşitme engelli ehliyet kuralları'
    ],
    typos: [
      'isitme engelli',
      'isiteme cihazi',
      'koklear implant',
      'isaret dili',
      'isitme kaybi'
    ],
    targetUrl: '/hesaplama/balthazard',
    relatedInstitutions: ['SGK Tıbbi Malzeme Şubeleri', 'İşitme Merkezleri']
  },
  {
    id: 'otizm-down-zihinsel',
    category: 'saglik_cihaz',
    primaryTerm: 'Otizm, Down Sendromu ve Zihinsel Özel Gereksinimler',
    definition: 'Otizm spektrum bozukluğu, Down sendromu, Fragile X ve gelişimsel gecikmelerde RAM özel eğitim seansları, rehabilitasyon desteği ve vasi işlemleri.',
    alternatives: [
      'Otizm spektrum ÇÖZGER raporu',
      'Down sendromlu birey hakları',
      'RAM raporu haftalık ders seansları',
      'Özel eğitim ve rehabilitasyon merkezi bursu',
      'Zihinsel engelli vasi tayini ek kararı'
    ],
    typos: [
      'otizm',
      'otizim',
      'down sendromu',
      'zihinsel engelli',
      'ram raporu',
      'ozel egitim'
    ],
    targetUrl: '/hesaplama/evde-bakim',
    relatedInstitutions: ['Rehberlik ve Araştırma Merkezleri (RAM)', 'MEB']
  },
  {
    id: 'kronik-hastaliklar',
    category: 'saglik_cihaz',
    primaryTerm: 'Kronik ve Süregelen Hastalıklar Rapor Hakları',
    definition: 'Diyabet, hipertansiyon, KOAH, astım, kronik böbrek yetmezliği, diyaliz, kanser/onkoloji, kalp yetmezliği, çölyak ve MS hastalıklarında Balthazard oran birleştirme.',
    alternatives: [
      'Diyabet engelli raporu oranı',
      'Diyaliz hastaları engelli hakları',
      'Onkoloji kanser hastası malullük',
      'Kalp yetmezliği EF oranı Balthazard',
      'KOAH solunum fonksiyon testi özür oranı'
    ],
    typos: [
      'kronik hastalik',
      'diyabet raporu',
      'seker hastaligi rapor',
      'diyaliz maasi',
      'kanser malulen emeklilik',
      'koah engelli orani'
    ],
    targetUrl: '/hesaplama/balthazard',
    relatedInstitutions: ['Sosyal Güvenlik Kurumu', 'Sağlık Bakanlığı']
  },

  // 7. TÜRKİYE 81 İL ÖZEL KURUM REHBERİ
  {
    id: 'istanbul-engelli-hizmetleri',
    category: 'il',
    primaryTerm: 'İstanbul Engelli Hizmetleri & Hakem Hastaneler',
    definition: 'İstanbul ilinde ikamet eden engelli vatandaşlar için İBB İSEM, 39 ilçe kaymakamlığı SYDV, Çam ve Sakura Şehir Hastanesi, Prof. Dr. Cemil Taşcıoğlu Şehir Hastanesi ve yetkili hakem hastane süreçleri.',
    alternatives: [
      'İstanbul engelli raporu veren hastaneler',
      'İBB İSEM engelli merkezleri',
      'İstanbul hakem hastaneler listesi',
      'İstanbul ÖTV vergi daireleri',
      'Bağcılar Kadıköy Üsküdar engelli merkezleri'
    ],
    typos: [
      'istanbul engelli',
      'istanbul hakem hastane',
      'isem',
      'istanbul ozur raporu',
      'istanbul otv'
    ],
    targetUrl: '/hesaplama',
    relatedInstitutions: ['İstanbul İl Sağlık Müdürlüğü', 'İBB İSEM', 'İstanbul SGK İl Müdürlüğü'],
    cityCode: '34'
  },
  {
    id: 'ankara-engelli-hizmetleri',
    category: 'il',
    primaryTerm: 'Ankara Engelli Hizmetleri & Hakem Hastaneler',
    definition: 'Ankara Şehir Hastanesi (Bilkent), Etlik Şehir Hastanesi, Ankara Büyükşehir Belediyesi Engelliler Hizmet Merkezi, Çankaya, Keçiören, Mamak, Yenimahalle SYDV birimleri.',
    alternatives: [
      'Ankara heyet raporu veren hastaneler',
      'Ankara hakem hastanesi listesi',
      'Bilkent Şehir Hastanesi engelli kurulu',
      'Ankara Büyükşehir engelli yardımları',
      'Ankara SGK İl Müdürlüğü engelli servisi'
    ],
    typos: [
      'ankara engelli',
      'ankara heyet raporu',
      'ankara hakem hastane',
      'ankara otv',
      'ankara sehir hastanesi'
    ],
    targetUrl: '/hesaplama',
    relatedInstitutions: ['Ankara İl Sağlık Müdürlüğü', 'ABB Engelliler Merkezi', 'Ankara SGK'],
    cityCode: '06'
  },
  {
    id: 'izmir-engelli-hizmetleri',
    category: 'il',
    primaryTerm: 'İzmir Engelli Hizmetleri & Hakem Hastaneler',
    definition: 'İzmir Şehir Hastanesi (Bayraklı), Tepecik Eğitim ve Araştırma Hastanesi, İzmir Büyükşehir Belediyesi Engelli Hizmetleri Şube Müdürlüğü, Konak, Karşıyaka, Bornova, Buca SYDV birimleri.',
    alternatives: [
      'İzmir engelli sağlık raporu hastaneleri',
      'İzmir hakem hastane itiraz',
      'İzmir Şehir Hastanesi sağlık kurulu',
      'İzmir Büyükşehir Belediyesi engelli kartı',
      'İzmir SGK engelli emeklilik şubesi'
    ],
    typos: [
      'izmir engelli',
      'izmir heyet raporu',
      'izmir hakem hastane',
      'izmir otv',
      'tepecik heyet'
    ],
    targetUrl: '/hesaplama',
    relatedInstitutions: ['İzmir İl Sağlık Müdürlüğü', 'İzmir Büyükşehir Belediyesi', 'İzmir SGK'],
    cityCode: '35'
  },
  {
    id: 'bursa-engelli-hizmetleri',
    category: 'il',
    primaryTerm: 'Bursa Engelli Hizmetleri & Hakem Hastaneler',
    definition: 'Bursa Şehir Hastanesi, Yüksek İhtisas Eğitim ve Araştırma Hastanesi, Bursa Büyükşehir Belediyesi Engelliler Şube Müdürlüğü, Osmangazi, Nilüfer, Yıldırım SYDV.',
    alternatives: [
      'Bursa engelli raporu veren hastaneler',
      'Bursa hakem hastanesi',
      'Bursa Şehir Hastanesi sağlık kurulu',
      'Bursa Büyükşehir engelli yardımı',
      'Bursa SGK İl Müdürlüğü'
    ],
    typos: [
      'bursa engelli',
      'bursa heyet raporu',
      'bursa hakem hastane',
      'bursa otv'
    ],
    targetUrl: '/hesaplama',
    relatedInstitutions: ['Bursa İl Sağlık Müdürlüğü', 'Bursa Büyükşehir Belediyesi'],
    cityCode: '16'
  },
  {
    id: 'antalya-engelli-hizmetleri',
    category: 'il',
    primaryTerm: 'Antalya Engelli Hizmetleri & Hakem Hastaneler',
    definition: 'Antalya Şehir Hastanesi, Antalya Eğitim ve Araştırma Hastanesi, Antalya Büyükşehir Belediyesi Engelli Hizmet Merkezleri, Muratpaşa, Kepez, Konyaaltı SYDV.',
    alternatives: [
      'Antalya engelli heyet raporu hastaneleri',
      'Antalya hakem hastane sevk',
      'Antalya Şehir Hastanesi sağlık heyeti',
      'Antalya Büyükşehir engelli ulaşım kartı',
      'Antalya SGK engelli servisi'
    ],
    typos: [
      'antalya engelli',
      'antalya heyet',
      'antalya hakem hastane',
      'antalya otv'
    ],
    targetUrl: '/hesaplama',
    relatedInstitutions: ['Antalya İl Sağlık Müdürlüğü', 'Antalya Büyükşehir Belediyesi'],
    cityCode: '07'
  }
];

/**
 * 81 İl Listesi (Tam Türkiye Kapsamı)
 */
export const TURKEY_PROVINCES = [
  { code: '01', name: 'Adana', slug: 'adana' },
  { code: '02', name: 'Adıyaman', slug: 'adiyaman' },
  { code: '03', name: 'Afyonkarahisar', slug: 'afyonkarahisar' },
  { code: '04', name: 'Ağrı', slug: 'agri' },
  { code: '05', name: 'Amasya', slug: 'amasya' },
  { code: '06', name: 'Ankara', slug: 'ankara' },
  { code: '07', name: 'Antalya', slug: 'antalya' },
  { code: '08', name: 'Artvin', slug: 'artvin' },
  { code: '09', name: 'Aydın', slug: 'aydin' },
  { code: '10', name: 'Balıkesir', slug: 'balikesir' },
  { code: '11', name: 'Bilecik', slug: 'bilecik' },
  { code: '12', name: 'Bingöl', slug: 'bingol' },
  { code: '13', name: 'Bitlis', slug: 'bitlis' },
  { code: '14', name: 'Bolu', slug: 'bolu' },
  { code: '15', name: 'Burdur', slug: 'burdur' },
  { code: '16', name: 'Bursa', slug: 'bursa' },
  { code: '17', name: 'Çanakkale', slug: 'canakkale' },
  { code: '18', name: 'Çankırı', slug: 'cankiri' },
  { code: '19', name: 'Çorum', slug: 'corum' },
  { code: '20', name: 'Denizli', slug: 'denizli' },
  { code: '21', name: 'Diyarbakır', slug: 'diyarbakir' },
  { code: '22', name: 'Edirne', slug: 'edirne' },
  { code: '23', name: 'Elazığ', slug: 'elazig' },
  { code: '24', name: 'Erzincan', slug: 'erzincan' },
  { code: '25', name: 'Erzurum', slug: 'erzurum' },
  { code: '26', name: 'Eskişehir', slug: 'eskisehir' },
  { code: '27', name: 'Gaziantep', slug: 'gaziantep' },
  { code: '28', name: 'Giresun', slug: 'giresun' },
  { code: '29', name: 'Gümüşhane', slug: 'gumushane' },
  { code: '30', name: 'Hakkari', slug: 'hakkari' },
  { code: '31', name: 'Hatay', slug: 'hatay' },
  { code: '32', name: 'Isparta', slug: 'isparta' },
  { code: '33', name: 'Mersin', slug: 'mersin' },
  { code: '34', name: 'İstanbul', slug: 'istanbul' },
  { code: '35', name: 'İzmir', slug: 'izmir' },
  { code: '36', name: 'Kars', slug: 'kars' },
  { code: '37', name: 'Kastamonu', slug: 'kastamonu' },
  { code: '38', name: 'Kayseri', slug: 'kayseri' },
  { code: '39', name: 'Kırklareli', slug: 'kirklareli' },
  { code: '40', name: 'Kırşehir', slug: 'kirsehir' },
  { code: '41', name: 'Kocaeli', slug: 'kocaeli' },
  { code: '42', name: 'Konya', slug: 'konya' },
  { code: '43', name: 'Kütahya', slug: 'kutahya' },
  { code: '44', name: 'Malatya', slug: 'malatya' },
  { code: '45', name: 'Manisa', slug: 'manisa' },
  { code: '46', name: 'Kahramanmaraş', slug: 'kahramanmaras' },
  { code: '47', name: 'Mardin', slug: 'mardin' },
  { code: '48', name: 'Muğla', slug: 'mugla' },
  { code: '49', name: 'Muş', slug: 'mus' },
  { code: '50', name: 'Nevşehir', slug: 'nevsehir' },
  { code: '51', name: 'Niğde', slug: 'nigde' },
  { code: '52', name: 'Ordu', slug: 'ordu' },
  { code: '53', name: 'Rize', slug: 'rize' },
  { code: '54', name: 'Sakarya', slug: 'sakarya' },
  { code: '55', name: 'Samsun', slug: 'samsun' },
  { code: '56', name: 'Siirt', slug: 'siirt' },
  { code: '57', name: 'Sinop', slug: 'sinop' },
  { code: '58', name: 'Sivas', slug: 'sivas' },
  { code: '59', name: 'Tekirdağ', slug: 'tekirdag' },
  { code: '60', name: 'Tokat', slug: 'tokat' },
  { code: '61', name: 'Trabzon', slug: 'trabzon' },
  { code: '62', name: 'Tunceli', slug: 'tunceli' },
  { code: '63', name: 'Şanlıurfa', slug: 'sanliurfa' },
  { code: '64', name: 'Uşak', slug: 'usak' },
  { code: '65', name: 'Van', slug: 'van' },
  { code: '66', name: 'Yozgat', slug: 'yozgat' },
  { code: '67', name: 'Zonguldak', slug: 'zonguldak' },
  { code: '68', name: 'Aksaray', slug: 'aksaray' },
  { code: '69', name: 'Bayburt', slug: 'bayburt' },
  { code: '70', name: 'Karaman', slug: 'karaman' },
  { code: '71', name: 'Kırıkkale', slug: 'kirikkale' },
  { code: '72', name: 'Batman', slug: 'batman' },
  { code: '73', name: 'Şırnak', slug: 'sirnak' },
  { code: '74', name: 'Bartın', slug: 'bartin' },
  { code: '75', name: 'Ardahan', slug: 'ardahan' },
  { code: '76', name: 'Iğdır', slug: 'igdir' },
  { code: '77', name: 'Yalova', slug: 'yalova' },
  { code: '78', name: 'Karabük', slug: 'karabuk' },
  { code: '79', name: 'Kilis', slug: 'kilis' },
  { code: '80', name: 'Osmaniye', slug: 'osmaniye' },
  { code: '81', name: 'Düzce', slug: 'duzce' }
];

/**
 * Harf ve Yazım Yanlışı Toleranslı Arama Fonksiyonu (Fuzzy Matcher)
 */
export function searchWithTypoTolerance(query: string): KeywordEntry[] {
  if (!query || query.trim().length === 0) return [];

  const normalizedQuery = normalizeText(query);

  return SEO_KEYWORD_MATRIX.filter((item) => {
    // 1. Doğrudan terim eşleşmesi
    if (normalizeText(item.primaryTerm).includes(normalizedQuery)) return true;

    // 2. Alternatif terimler (en az 5 alternatif)
    if (item.alternatives.some((alt) => normalizeText(alt).includes(normalizedQuery))) return true;

    // 3. Yazım hataları ve harf yanlışları (typo toleransı)
    if (item.typos.some((typo) => normalizeText(typo).includes(normalizedQuery) || normalizedQuery.includes(normalizeText(typo)))) return true;

    // 4. İlgili kurumlar
    if (item.relatedInstitutions?.some((inst) => normalizeText(inst).includes(normalizedQuery))) return true;

    // 5. Tanım içi arama
    if (normalizeText(item.definition).includes(normalizedQuery)) return true;

    return false;
  });
}

/**
 * Türkçe karakterleri ve aksanları normalize eden yardımcı fonksiyon
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}
