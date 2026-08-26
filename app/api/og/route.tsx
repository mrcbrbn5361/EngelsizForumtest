import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: '#090a0f',
          width: '100%',
          height: '100%',
          padding: '80px',
          backgroundImage: 'linear-gradient(to bottom right, #090a0f, #0f172a, #1e1b4b)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '55px',
              border: '8px solid #38bdf8',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: '36px',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '76px', fontWeight: '800', color: '#ffffff', letterSpacing: '-2px' }}>
            EngelsizForum
          </div>
        </div>
        <div style={{ fontSize: '36px', fontWeight: '600', color: '#38bdf8', marginBottom: '16px' }}>
          Tam Erişilebilir Topluluk ve Haklar Platformu
        </div>
        <div style={{ fontSize: '22px', fontWeight: '400', color: '#94a3b8', maxWidth: '900px', lineHeight: 1.4 }}>
          Balthazard, ÖTV 2026, Emeklilik Hesaplama ve Yapay Zeka Destekli Asistanlar
        </div>
        <div
          style={{
            marginTop: '48px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#1e293b',
            border: '2px solid #334155',
            padding: '12px 28px',
            borderRadius: '24px',
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#38bdf8' }}>www.engelsizforum.com</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
