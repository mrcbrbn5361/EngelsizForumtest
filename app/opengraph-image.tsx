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
          backgroundColor: '#090a0f',
          backgroundImage: 'radial-gradient(circle at 50% 0%, #0b1528 0%, #090a0f 75%)',
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
              width: '88px',
              height: '88px',
              backgroundColor: '#0b0f19',
              borderRadius: '24px',
              border: '2px solid rgba(56, 189, 248, 0.6)',
              boxShadow: '0 20px 30px -5px rgba(56, 189, 248, 0.3)',
              padding: '10px',
            }}
          >
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: '100%' }}
            >
              <circle cx="50" cy="22" r="9" fill="#38BDF8" />
              <path
                d="M 20 40 C 32 30, 68 30, 80 40 C 83 42.5, 80 46.5, 75 45.5 C 62 40, 38 40, 25 45.5 C 20 46.5, 17 42.5, 20 40 Z"
                fill="#38BDF8"
              />
              <path
                d="M 30 53 L 62 53 C 65 53, 65 58, 62 58 L 30 58 C 27 58, 27 53, 30 53 Z"
                fill="#0284C7"
              />
              <circle cx="68" cy="55.5" r="4" fill="#10B981" />
              <path
                d="M 23 36 L 23 72 C 23 78, 29 81, 38 80 L 76 76 C 80 75.5, 80 70.5, 75 71 L 33 75 C 29.5 75, 28.5 73, 28.5 69 L 28.5 36 C 28.5 33, 23 33, 23 36 Z"
                fill="#0284C7"
              />
            </svg>
          </div>
          <div style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', textTransform: 'uppercase' }}>
            ENGELSİZ<span style={{ color: '#38bdf8' }}>FORUM</span>
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
