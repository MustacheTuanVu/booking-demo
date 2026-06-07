import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Queen Acoustic - Chính sách & Điều khoản';
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
          fontSize: 48,
          background: 'linear-gradient(to bottom, #f5f0e6, #ffffff)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          padding: 40,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#8a6d3b',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 40,
              fontWeight: 'bold',
            }}
          >
            QA
          </div>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#8a6d3b',
            marginBottom: 20,
          }}
        >
          Chính sách & Điều khoản
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#666666',
            maxWidth: 800,
          }}
        >
          Tìm hiểu chi tiết về các quy định đặt chỗ và thanh toán tại Queen Acoustic
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
} 