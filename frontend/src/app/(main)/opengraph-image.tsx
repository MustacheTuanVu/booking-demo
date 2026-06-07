import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Queen Acoustic - Nơi âm nhạc là ngôn ngữ kết nối';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom, #f5f0e6, #e9d9bc)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Roboto Condensed, sans-serif',
          color: '#333',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          {/* Using placeholder instead of logo image to avoid errors */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: '#8a6d3b',
              marginRight: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 48,
              fontWeight: 'bold',
            }}
          >
            QA
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h1
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                margin: 0,
              }}
            >
              QUEEN ACOUSTIC
            </h1>
            <p
              style={{
                fontSize: 28,
                opacity: 0.8,
                margin: 0,
              }}
            >
              Nơi âm nhạc là ngôn ngữ kết nối
            </p>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 40,
            background: 'rgba(138, 109, 59, 0.1)',
            padding: '12px 30px',
            borderRadius: 8,
          }}
        >
          <p
            style={{
              fontSize: 36,
              fontWeight: 'normal',
            }}
          >
            Đặt chỗ trực tuyến cho các sự kiện âm nhạc
          </p>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            fontSize: 24,
            opacity: 0.7,
          }}
        >
          booking.queenacoustic.vn
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
} 