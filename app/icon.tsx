import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0f19',
          borderRadius: '8px',
          border: '1px solid rgba(56, 189, 248, 0.5)',
          overflow: 'hidden',
          padding: '2px',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Head / Beacon */}
          <circle cx="50" cy="22" r="9" fill="#38BDF8" />
          
          {/* Upper Wings / Arms */}
          <path
            d="M 20 40 C 32 30, 68 30, 80 40 C 83 42.5, 80 46.5, 75 45.5 C 62 40, 38 40, 25 45.5 C 20 46.5, 17 42.5, 20 40 Z"
            fill="#38BDF8"
          />

          {/* Middle Bar */}
          <path
            d="M 30 53 L 62 53 C 65 53, 65 58, 62 58 L 30 58 C 27 58, 27 53, 30 53 Z"
            fill="#0284C7"
          />
          <circle cx="68" cy="55.5" r="4" fill="#10B981" />

          {/* Bottom Bar / Spine */}
          <path
            d="M 23 36 L 23 72 C 23 78, 29 81, 38 80 L 76 76 C 80 75.5, 80 70.5, 75 71 L 33 75 C 29.5 75, 28.5 73, 28.5 69 L 28.5 36 C 28.5 33, 23 33, 23 36 Z"
            fill="#0284C7"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
