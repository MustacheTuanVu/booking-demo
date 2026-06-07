const siteUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'

export const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'MusicVenue',
  name: 'Queen Acoustic',
  description: 'Queen Acoustic - Không gian âm nhạc acoustic trực tiếp với các nghệ sĩ hàng đầu tại Đắk Lắk. Nơi âm nhạc là ngôn ngữ kết nối.',
  url: 'https://booking.queenacoustic.vn',
  telephone: '19005225',
  email: 'queen.acoustic47@gmail.com',
  logo: `${siteUrl}/images/logo_queen.png`,
  image: `${siteUrl}/images/logo_queen.png`,
  sameAs: [
    'https://www.facebook.com/queenacousticbmt',
    'https://zalo.me/0903150574/'
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Tầng 1, 15 Lê Đại Cang',
    addressLocality: 'Thành Công, Buôn Ma Thuột',
    addressRegion: 'Đắk Lắk',
    addressCountry: 'VN'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '12.6667',
    longitude: '108.0500'
  },
  priceRange: '$$',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      opens: '18:00',
      closes: '23:00'
    }
  ],

  potentialAction: {
    '@type': 'ReserveAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://booking.queenacoustic.vn/#Lịch%20biểu%20diễn',
      inLanguage: 'vi',
      actionPlatform: 'https://schema.org/WebSite'
    },
    result: {
      '@type': 'Reservation',
      name: 'Đặt chỗ trực tuyến'
    }
  },
  additionalProperty: {
    '@type': 'PropertyValue',
    name: 'Mã số kinh doanh',
    value: '0306615730-002'
  }
};

export default structuredData; 
