/* eslint-disable */
import pptxgen from 'pptxgenjs';
import path from 'path';
import fs from 'fs';

async function generatePresentation() {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'EngelsizForum Platform Sunumu';
  pptx.author = 'EngelsizForum';

  // Colors
  const COLOR_PRIMARY = '10B981';     // Emerald
  const COLOR_PRIMARY_DARK = '059669';// Dark Emerald
  const COLOR_DARK_BG = '0F172A';     // Obsidian Slate
  const COLOR_DARK_CARD = '1E293B';   // Slate Card
  const COLOR_LIGHT_BG = 'F8FAFC';    // Soft Light Gray
  const COLOR_LIGHT_CARD = 'FFFFFF';  // White Card
  const COLOR_TEXT_DARK = '0F172A';   // Dark text for light bg
  const COLOR_TEXT_MUTED = '64748B';  // Muted text
  const COLOR_TEXT_LIGHT = 'F8FAFC';  // Light text for dark bg
  const COLOR_TEXT_MUTED_DARK = '94A3B8'; // Muted text dark theme
  const COLOR_BORDER_LIGHT = 'E2E8F0';

  // Helper for Slide Header
  function addSlideHeader(slide, titleText, subtitleText, isDark = false) {
    // Top Emerald Accent Bar
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0, y: 0, w: '100%', h: 0.1,
      fill: { color: COLOR_PRIMARY }
    });

    slide.addText(titleText, {
      x: 0.8, y: 0.5, w: 11.5, h: 0.6,
      fontSize: 24, bold: true,
      color: isDark ? COLOR_TEXT_LIGHT : COLOR_TEXT_DARK,
      fontFace: 'Arial'
    });

    if (subtitleText) {
      slide.addText(subtitleText, {
        x: 0.8, y: 1.05, w: 11.5, h: 0.4,
        fontSize: 13,
        color: isDark ? COLOR_TEXT_MUTED_DARK : COLOR_TEXT_MUTED,
        fontFace: 'Arial'
      });
    }
  }

  // ==========================================
  // SLIDE 1: Title Slide (Dark Theme)
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLOR_DARK_BG };

    // Emerald Gradient-like Accent Box
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.8, y: 1.2, w: 2.2, h: 0.35,
      fill: { color: COLOR_PRIMARY_DARK },
      line: { color: COLOR_PRIMARY, width: 1 }
    });
    slide.addText('KAPSAYICI TOPLULUK PLATFORMU', {
      x: 0.8, y: 1.2, w: 2.2, h: 0.35,
      fontSize: 8.5, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial'
    });

    slide.addText('EngelsizForum', {
      x: 0.8, y: 1.8, w: 11.5, h: 1.2,
      fontSize: 48, bold: true, color: COLOR_PRIMARY, fontFace: 'Arial'
    });

    slide.addText('Türkiye\'nin İlk Tam Erişilebilir ve Akıllı Dijital Topluluk Platformu', {
      x: 0.8, y: 3.0, w: 10.5, h: 0.8,
      fontSize: 20, color: COLOR_TEXT_LIGHT, fontFace: 'Arial'
    });

    // Feature highlights container
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.8, y: 4.2, w: 11.7, h: 1.8,
      fill: { color: COLOR_DARK_CARD },
      line: { color: '334155', width: 1 }
    });

    const highlights = [
      '✓ WCAG 2.1 AA Standartları',
      '✓ Bionic Reading & Disleksi Modu',
      '✓ %100 Ekran Okuyucu Uyumlu',
      '✓ Canlı Topluluk & Gamification'
    ];

    highlights.forEach((hl, idx) => {
      const posX = 1.1 + (idx * 2.85);
      slide.addText(hl, {
        x: posX, y: 4.7, w: 2.7, h: 0.8,
        fontSize: 12, bold: true, color: COLOR_PRIMARY, align: 'center', fontFace: 'Arial'
      });
    });

    slide.addText('www.engelsizforum.com', {
      x: 0.8, y: 6.5, w: 11.5, h: 0.4,
      fontSize: 12, color: COLOR_TEXT_MUTED_DARK, fontFace: 'Arial'
    });
  }

  // ==========================================
  // SLIDE 2: Problem & Digital Barriers (Light Theme)
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLOR_LIGHT_BG };
    addSlideHeader(slide, 'PROBLEM VE DİJİTAL ENGELLER', 'İnternetteki Sosyal İzolasyon ve Erişilebilirlik Sorunu');

    const problems = [
      {
        num: '01',
        title: 'Ekran Okuyucu Yetersizliği',
        desc: 'Geleneksel forum siteleri semantik HTML ve ARIA etiketlerinden yoksun olduğu için görme engelli bireyler ekran okuyucular ile içerikleri rahatça takip edemez.'
      },
      {
        num: '02',
        title: 'Karmaşık Arayüzler & Okuma Güçlüğü',
        desc: 'Disleksi veya görme hassasiyeti olan bireyler için standart yazı tipleri ve yoğun zeminler okumayı imkansız hale getirir.'
      },
      {
        num: '03',
        title: 'Bilgiye ve Haklara Erişim Zorluğu',
        desc: 'Engelli bireylerin medikal, yasal mevzuat ve yardımcı teknolojilere ilişkin deneyimlerini paylaşabilecekleri erişilebilir merkezi bir platform yokluğu.'
      }
    ];

    problems.forEach((p, idx) => {
      const posX = 0.8 + (idx * 3.95);
      // Card
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX, y: 1.8, w: 3.7, h: 4.8,
        fill: { color: COLOR_LIGHT_CARD },
        line: { color: COLOR_BORDER_LIGHT, width: 1.5 }
      });
      // Number Box
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX + 0.3, y: 2.2, w: 0.8, h: 0.6,
        fill: { color: COLOR_PRIMARY },
      });
      slide.addText(p.num, {
        x: posX + 0.3, y: 2.2, w: 0.8, h: 0.6,
        fontSize: 16, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial'
      });

      slide.addText(p.title, {
        x: posX + 0.3, y: 3.1, w: 3.1, h: 0.8,
        fontSize: 16, bold: true, color: COLOR_TEXT_DARK, fontFace: 'Arial'
      });

      slide.addText(p.desc, {
        x: posX + 0.3, y: 3.9, w: 3.1, h: 2.3,
        fontSize: 12, color: COLOR_TEXT_MUTED, fontFace: 'Arial'
      });
    });
  }

  // ==========================================
  // SLIDE 3: Solution – EngelsizForum
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLOR_LIGHT_BG };
    addSlideHeader(slide, 'ÇÖZÜM: ENGELSİZFORUM', 'Herkes İçin Eşit, Kapsayıcı ve Akıllı Dijital Topluluk');

    const solutions = [
      {
        title: 'WCAG 2.1 AA Standartları',
        desc: 'Uluslararası web erişilebilirlik standartlarına %100 tam uyumlu arayüz ve kontrast dengesi.'
      },
      {
        title: 'Tek Tıkla Özelleştirme',
        desc: 'Kullanıcının görsel ve okuma ihtiyaçlarına anında adapte olan dahili erişilebilirlik paneli.'
      },
      {
        title: 'Kapsayıcı Sosyal Topluluk',
        desc: 'Engelli bireyleri, ailelerini, uzmanları ve destekçileri bir araya getiren güvenli etkileşim alanı.'
      },
      {
        title: 'Açık ve Tamamen Ücretsiz',
        desc: 'Bilgiye erişim hakkını savunan, reklam ve karmaşadan uzak kullanıcı dostu yapı.'
      }
    ];

    solutions.forEach((s, idx) => {
      const row = Math.floor(idx / 2);
      const col = idx % 2;
      const posX = 0.8 + (col * 5.9);
      const posY = 1.8 + (row * 2.5);

      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX, y: posY, w: 5.6, h: 2.2,
        fill: { color: COLOR_LIGHT_CARD },
        line: { color: COLOR_PRIMARY, width: 1.5 }
      });

      slide.addText(s.title, {
        x: posX + 0.4, y: posY + 0.3, w: 4.8, h: 0.5,
        fontSize: 16, bold: true, color: COLOR_PRIMARY_DARK, fontFace: 'Arial'
      });

      slide.addText(s.desc, {
        x: posX + 0.4, y: posY + 0.85, w: 4.8, h: 1.1,
        fontSize: 12, color: COLOR_TEXT_MUTED, fontFace: 'Arial'
      });
    });
  }

  // ==========================================
  // SLIDE 4: Smart Accessibility Tools (4 Card Grid)
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLOR_LIGHT_BG };
    addSlideHeader(slide, 'AKILLI EREŞİLEBİLİRLİK ARAÇLARI', 'Gelişmiş Okuma ve Etkileşim Teknolojileri');

    const tools = [
      {
        title: 'Bionic Reading',
        tag: 'Hızlı Okuma',
        desc: 'Kelimerin ilk harflerini kalınlaştırarak odaklanmayı ve okuma hızını maksimuma çıkarır.'
      },
      {
        title: 'Disleksi Dostu Font',
        tag: 'Tipografi',
        desc: 'OpenDyslexic ve özel harf aralıkları ile disleksi bireyler için okuma zorluğunu sıfırlar.'
      },
      {
        title: 'Sesli Konu Özetleri',
        tag: 'Metin-Ses',
        desc: 'Konuları ve yanıtları anında seslendirerek görme engelli kullanıcılara sesli rehberlik sunar.'
      },
      {
        title: 'Yüksek Kontrast Modları',
        tag: 'Görsel Uyum',
        desc: 'Gözü yormayan temalar, gece modu ve renk körleri için optimize renk paletleri.'
      }
    ];

    tools.forEach((t, idx) => {
      const posX = 0.8 + (idx * 2.95);
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX, y: 1.8, w: 2.75, h: 4.8,
        fill: { color: COLOR_LIGHT_CARD },
        line: { color: COLOR_BORDER_LIGHT, width: 1.5 }
      });

      // Tag
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX + 0.25, y: 2.1, w: 2.25, h: 0.35,
        fill: { color: 'E1F5FE' },
        line: { color: COLOR_PRIMARY, width: 1 }
      });
      slide.addText(t.tag, {
        x: posX + 0.25, y: 2.1, w: 2.25, h: 0.35,
        fontSize: 9, bold: true, color: COLOR_PRIMARY_DARK, align: 'center', fontFace: 'Arial'
      });

      slide.addText(t.title, {
        x: posX + 0.25, y: 2.7, w: 2.25, h: 0.8,
        fontSize: 16, bold: true, color: COLOR_TEXT_DARK, fontFace: 'Arial'
      });

      slide.addText(t.desc, {
        x: posX + 0.25, y: 3.6, w: 2.25, h: 2.7,
        fontSize: 11.5, color: COLOR_TEXT_MUTED, fontFace: 'Arial'
      });
    });
  }

  // ==========================================
  // SLIDE 5: Forum Categories
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLOR_LIGHT_BG };
    addSlideHeader(slide, 'FORUM KATEGORİLERİ VE ALANLARI', 'Zengin Bilgi Paylaşımı ve Topluluk Dayanışması');

    const cats = [
      {
        icon: '🛠️',
        title: 'Yardımcı Teknolojiler',
        desc: 'Ekran okuyucular, tekerlekli sandalye yazılımları, donanım incelemeleri ve teknolojik çözümler.'
      },
      {
        icon: '🎓',
        title: 'Eğitim, Burs & Kariyer',
        desc: 'Engelli bireylere özel burs ilanları, uzaktan eğitim imkanları ve istihdam fırsatları.'
      },
      {
        icon: '⚖️',
        title: 'Yasal Haklar & Mevzuat',
        desc: 'Devlet destekleri, engelli hakları, vergi muafiyetleri ve resmi süreç rehberleri.'
      },
      {
        icon: '💬',
        title: 'Sağlık & Yaşam',
        desc: 'Medikal tavsiyeler, günlük yaşam deneyimleri, rehabilitasyon ve serbest kürsü.'
      }
    ];

    cats.forEach((c, idx) => {
      const row = Math.floor(idx / 2);
      const col = idx % 2;
      const posX = 0.8 + (col * 5.9);
      const posY = 1.8 + (row * 2.5);

      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX, y: posY, w: 5.6, h: 2.2,
        fill: { color: COLOR_LIGHT_CARD },
        line: { color: COLOR_BORDER_LIGHT, width: 1.5 }
      });

      slide.addText(`${c.icon}  ${c.title}`, {
        x: posX + 0.4, y: posY + 0.3, w: 4.8, h: 0.5,
        fontSize: 16, bold: true, color: COLOR_TEXT_DARK, fontFace: 'Arial'
      });

      slide.addText(c.desc, {
        x: posX + 0.4, y: posY + 0.9, w: 4.8, h: 1.0,
        fontSize: 12, color: COLOR_TEXT_MUTED, fontFace: 'Arial'
      });
    });
  }

  // ==========================================
  // SLIDE 6: Community & Gamification
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLOR_LIGHT_BG };
    addSlideHeader(slide, 'TOPLULUK VE OYUNLAŞTIRMA', 'Aktif Katılımı Ve Dayanışmayı Teşvik Eden Yapı');

    const features = [
      {
        title: 'Seviye ve Rozet Sistemi',
        desc: 'Topluluğa katkı sağlayan, yanıt veren ve içerik üreten üyelere tecrübe puanı (XP) ve seviye unvanları.'
      },
      {
        title: 'Doğrulanmış Çözüm İşaretleme',
        desc: 'Sorulan sorulara en doğru yanıtı veren cevapların öne çıkarılması ve hızlı bilgiye erişim.'
      },
      {
        title: 'Takip & Sosyal İstatistikler',
        desc: 'Beğeniler, üye takip mekanizması, rozet vitrinleri ve detaylı bireysel etkileşim profilleri.'
      }
    ];

    features.forEach((f, idx) => {
      const posY = 1.8 + (idx * 1.6);
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0.8, y: posY, w: 11.7, h: 1.35,
        fill: { color: COLOR_LIGHT_CARD },
        line: { color: COLOR_PRIMARY, width: 1.5 }
      });

      slide.addText(f.title, {
        x: 1.2, y: posY + 0.2, w: 10.9, h: 0.4,
        fontSize: 16, bold: true, color: COLOR_PRIMARY_DARK, fontFace: 'Arial'
      });

      slide.addText(f.desc, {
        x: 1.2, y: posY + 0.65, w: 10.9, h: 0.55,
        fontSize: 12, color: COLOR_TEXT_MUTED, fontFace: 'Arial'
      });
    });
  }

  // ==========================================
  // SLIDE 7: UX & Mobile Responsiveness
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLOR_LIGHT_BG };
    addSlideHeader(slide, 'KULLANICI DENEYİMİ (UX) VE MOBİL UYUM', 'Her Cihazda Kesintisiz ve Hızlı Performans');

    const points = [
      {
        title: '%100 ARIA Etiket Desteği',
        desc: 'NVDA, JAWS ve VoiceOver gibi ekran okuyucular için kusursuz DOM hiyerarşisi ve etiketleme.'
      },
      {
        title: 'Duyarlı (Responsive) Mobil Arayüz',
        desc: 'Masaüstü, tablet ve akıllı telefonlarda kırılmayan, parmak dokunuşlarına tam uyumlu ergonomi.'
      },
      {
        title: 'Gelişmiş Arama ve Filtreleme',
        desc: 'Konuları, kategorileri ve çözümleri saniyeler içinde bulmayı sağlayan akıllı arama altyapısı.'
      }
    ];

    points.forEach((p, idx) => {
      const posX = 0.8 + (idx * 3.95);
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX, y: 1.8, w: 3.7, h: 4.8,
        fill: { color: COLOR_LIGHT_CARD },
        line: { color: COLOR_BORDER_LIGHT, width: 1.5 }
      });

      slide.addText(p.title, {
        x: posX + 0.3, y: 2.3, w: 3.1, h: 0.9,
        fontSize: 16, bold: true, color: COLOR_TEXT_DARK, fontFace: 'Arial'
      });

      slide.addText(p.desc, {
        x: posX + 0.3, y: 3.4, w: 3.1, h: 2.8,
        fontSize: 12, color: COLOR_TEXT_MUTED, fontFace: 'Arial'
      });
    });
  }

  // ==========================================
  // SLIDE 8: Safe & Moderated Environment
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLOR_LIGHT_BG };
    addSlideHeader(slide, 'GÜVENLİ VE DENETLENEN ORTAM', 'Saygılı, Kapsayıcı ve Huzurlu Topluluk Deneyimi');

    const items = [
      {
        title: 'Yetkili Yönetim Paneli',
        desc: 'Topluluk kurallarını ihlal eden içeriklerin hızlıca incelenmesi ve moderasyon kontrolleri.'
      },
      {
        title: 'Spam ve Zararlı İçerik Filtresi',
        desc: 'Kullanıcı huzurunu koruyan otomatik filtreler ve anlık topluluk şikayet sistemi.'
      },
      {
        title: 'Kullanıcı Gizliliği',
        desc: 'Kişisel verilerin korunması kanununa uygun, güvenli üyelik ve profil yönetimi.'
      }
    ];

    items.forEach((item, idx) => {
      const posY = 1.8 + (idx * 1.6);
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0.8, y: posY, w: 11.7, h: 1.35,
        fill: { color: COLOR_LIGHT_CARD },
        line: { color: COLOR_BORDER_LIGHT, width: 1.5 }
      });

      slide.addText(`🛡️  ${item.title}`, {
        x: 1.2, y: posY + 0.2, w: 10.9, h: 0.4,
        fontSize: 16, bold: true, color: COLOR_TEXT_DARK, fontFace: 'Arial'
      });

      slide.addText(item.desc, {
        x: 1.2, y: posY + 0.65, w: 10.9, h: 0.55,
        fontSize: 12, color: COLOR_TEXT_MUTED, fontFace: 'Arial'
      });
    });
  }

  // ==========================================
  // SLIDE 9: Vision & Future Goals
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLOR_LIGHT_BG };
    addSlideHeader(slide, 'PLATFORM VİZYONU VE GELECEK HEDEFLERİ', 'Sürdürülebilir ve Sürekli Gelişen Dijital Ekosistem');

    const goals = [
      {
        title: 'Yapay Zeka Asistanı',
        desc: 'Konuları otomatik özetleyen ve soru soran üyelere anında rehberlik eden erişilebilir AI modülleri.'
      },
      {
        title: 'İşaret Dili & Çoklu Dil',
        desc: 'Görüntülü işaret dili modülleri ve uluslararası erişilebilirlik standartlarında çoklu dil desteği.'
      },
      {
        title: 'STK ve Akademi İş Birlikleri',
        desc: 'Sivil toplum kuruluşları ve üniversiteler ile farkındalık projeleri ve toplumsal etki ortaklıkları.'
      }
    ];

    goals.forEach((g, idx) => {
      const posX = 0.8 + (idx * 3.95);
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: posX, y: 1.8, w: 3.7, h: 4.8,
        fill: { color: COLOR_LIGHT_CARD },
        line: { color: COLOR_PRIMARY, width: 1.5 }
      });

      slide.addText(g.title, {
        x: posX + 0.3, y: 2.3, w: 3.1, h: 0.9,
        fontSize: 16, bold: true, color: COLOR_PRIMARY_DARK, fontFace: 'Arial'
      });

      slide.addText(g.desc, {
        x: posX + 0.3, y: 3.4, w: 3.1, h: 2.8,
        fontSize: 12, color: COLOR_TEXT_MUTED, fontFace: 'Arial'
      });
    });
  }

  // ==========================================
  // SLIDE 10: Closing Slide with Interactive Clickable Link (Dark Theme)
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLOR_DARK_BG };

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0, y: 0, w: '100%', h: 0.1,
      fill: { color: COLOR_PRIMARY }
    });

    slide.addText('ENGELSİZFORUM\'A HOŞ GELDİNİZ', {
      x: 0.8, y: 1.2, w: 11.5, h: 0.5,
      fontSize: 16, bold: true, color: COLOR_PRIMARY, align: 'center', fontFace: 'Arial'
    });

    slide.addText('Engelleri Paylaşarak Kaldıralım', {
      x: 0.8, y: 1.8, w: 11.5, h: 1.0,
      fontSize: 40, bold: true, color: COLOR_TEXT_LIGHT, align: 'center', fontFace: 'Arial'
    });

    slide.addText('"Erişilebilir bilgi ve güçlü topluluk herkesin hakkıdır."', {
      x: 0.8, y: 2.9, w: 11.5, h: 0.6,
      fontSize: 18, italic: true, color: COLOR_TEXT_MUTED_DARK, align: 'center', fontFace: 'Arial'
    });

    // INTERACTIVE CLICKABLE BUTTON
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 3.2, y: 4.2, w: 6.9, h: 1.2,
      fill: { color: COLOR_PRIMARY },
      line: { color: COLOR_PRIMARY_DARK, width: 2 },
      hyperlink: { url: 'https://www.engelsizforum.com', tooltip: 'EngelsizForum Sitesini Aç' }
    });

    slide.addText('👉 EngelsizForum\'u Şimdi Ziyaret Et 👈\nwww.engelsizforum.com', {
      x: 3.2, y: 4.2, w: 6.9, h: 1.2,
      fontSize: 18, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial',
      hyperlink: { url: 'https://www.engelsizforum.com', tooltip: 'EngelsizForum Sitesini Aç' }
    });

    slide.addText('Butona veya linke tıklayarak doğrudan web sitesine ulaşabilirsiniz.', {
      x: 0.8, y: 5.8, w: 11.5, h: 0.5,
      fontSize: 12, color: COLOR_TEXT_MUTED_DARK, align: 'center', fontFace: 'Arial'
    });
  }

  // Save Presentation to public directory
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, 'EngelsizForum_Sunumu.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log('PPTX FILE CREATED SUCCESSFULLY AT:', outputPath);
}

generatePresentation().catch(err => {
  console.error('Error generating pptx:', err);
  process.exit(1);
});
