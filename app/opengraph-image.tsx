import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'EngelsizForum - Tam Erişilebilir Topluluk Platformu';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'radial-gradient(circle at 50% 0%, #1e3a8a 0%, #0f172a 70%)',
          color: '#ffffff',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            padding: '8px 20px',
            borderRadius: '9999px',
            color: '#60a5fa',
            fontSize: '18px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            marginBottom: '32px',
            textTransform: 'uppercase',
          }}
        >
          ♿ TAM ERİŞİLEBİLİR BİLGİ & TOPLULUK PLATFORMU
        </div>

        {/* Logo Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '48px',
              fontWeight: 900,
              borderRadius: '24px',
              boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.4)',
            }}
          >
            E
          </div>
          <div style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', textTransform: 'uppercase' }}>
            ENGELSİZ<span style={{ color: '#3b82f6' }}>FORUM</span>
          </div>
        </div>

        {/* Subtitle Description */}
        <div
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.5,
            marginBottom: '40px',
          }}
        >
          Engelli bireyler için %100 erişilebilir, yapay zeka destekli topluluk ve mevzuat danışma platformu. Balthazard, ÖTV 2026 ve Erken Emeklilik Robotu ile bariyersiz bilgi paylaşımı.
        </div>

        {/* Badges Bar */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              padding: '10px 20px',
              borderRadius: '12px',
              color: '#38bdf8',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            ✓ Balthazard & ÖTV Araçları
          </div>
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              padding: '10px 20px',
              borderRadius: '12px',
              color: '#38bdf8',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            ✓ Yeterly AI Sesli Dinleme & Özet
          </div>
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              padding: '10px 20px',
              borderRadius: '12px',
              color: '#38bdf8',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            ✓ WCAG 2.1 AAA Uyumlu
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
