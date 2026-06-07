import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://booking.queenacoustic.vn'),
  title: 'Chính sách & Điều khoản | Queen Acoustic',
  description: 'Tìm hiểu chi tiết về chính sách đặt chỗ, thanh toán, hủy, bảo lưu và các quy định khác của Queen Acoustic. Thông tin đầy đủ để đảm bảo trải nghiệm tuyệt vời cho khách hàng.',
  keywords: 'chính sách, điều khoản, đặt chỗ, thanh toán, hủy vé, bảo lưu, bảo mật, Queen Acoustic, đặt vé acoustic, âm nhạc',
  openGraph: {
    title: 'Chính sách & Điều khoản | Queen Acoustic',
    description: 'Thông tin chi tiết về các chính sách và quy định của Queen Acoustic giúp bạn có trải nghiệm tốt nhất khi đặt chỗ và tham dự sự kiện.',
    images: [
      {
        url: '/images/og-policy.jpg',
        width: 1200,
        height: 630,
        alt: 'Queen Acoustic - Chính sách & Điều khoản',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  authors: [
    {
      name: 'Queen Acoustic',
      url: 'https://booking.queenacoustic.vn',
    },
  ],
  alternates: {
    canonical: 'https://booking.queenacoustic.vn/chinh-sach',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chính sách & Điều khoản | Queen Acoustic',
    description: 'Tìm hiểu chi tiết về chính sách đặt chỗ, thanh toán, hủy, bảo lưu và các quy định khác của Queen Acoustic.',
    images: ['/images/og-policy.jpg'],
  },
  category: 'Quy định',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f0e6' },
    { media: '(prefers-color-scheme: dark)', color: '#8a6d3b' },
  ],
};

export default metadata; 