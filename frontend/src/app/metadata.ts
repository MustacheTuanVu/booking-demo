import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://booking.queenacoustic.vn'),
  title: 'Booking | Queen Acoustic - Nơi âm nhạc là ngôn ngữ kết nối',
  description: 'Đặt chỗ trực tuyến và khám phá các sự kiện âm nhạc acoustic tại Queen Acoustic. Tận hưởng những buổi biểu diễn trực tiếp cùng các nghệ sĩ hàng đầu Việt Nam trong không gian âm nhạc đẳng cấp tại Đắk Lắk.',
  keywords: 'đặt vé âm nhạc, booking concert, Queen Acoustic, vé show nhạc, sự kiện âm nhạc, live music Vietnam, âm nhạc Đắk Lắk, quán nhạc Buôn Ma Thuột, acoustic venue, đặt chỗ xem nhạc sống, concert nghệ sĩ Việt, biểu diễn trực tiếp, không gian âm nhạc, cafe nhạc sống, minishow acoustic, sự kiện cuối tuần, giải trí Tây Nguyên, live acoustic show, đặt bàn quán nhạc, show âm nhạc indie, vé concert acoustic, nghệ sĩ underground, ca sĩ trẻ Việt Nam, entertainment Đắk Lắk, âm nhạc chất lượng cao, trải nghiệm âm nhạc',
  openGraph: {
    title: 'Booking | Queen Acoustic - Nơi âm nhạc là ngôn ngữ kết nối',
    description: 'Đặt chỗ trực tuyến cho các sự kiện âm nhạc tại Queen Acoustic - không gian âm nhạc đẳng cấp với các buổi biểu diễn trực tiếp từ những nghệ sĩ hàng đầu Việt Nam.',
    images: [
      {
        url: '/images/og-home.png',
        width: 1200,
        height: 630,
        alt: 'Queen Acoustic - Nơi âm nhạc là ngôn ngữ kết nối',
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
    canonical: 'https://booking.queenacoustic.vn/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Booking | Queen Acoustic',
    description: 'Đặt chỗ trực tuyến cho các sự kiện âm nhạc acoustic tại Queen Acoustic. Tận hưởng không gian âm nhạc đẳng cấp với các nghệ sĩ hàng đầu.',
    images: ['/images/og-home.png'],
  },
  category: 'Giải trí',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f0e6' },
    { media: '(prefers-color-scheme: dark)', color: '#8a6d3b' },
  ],
};

export default metadata; 