import { getMediaUrl } from '@/utils/mediaUrl';

interface APIEvent {
  _id: string;
  title: string;
  desc: string;
  slug: string;
  status: string;
  avatar?: string;
  banner?: string;
  venue: string;
  InfoShowTimes: Array<{
    _id: string;
    time_start: string;
    time_end: string;
    status: string;
  }>;
  InfoContents: Array<{
    InfoArtist: Array<{
      _id: string;
      name: string;
      image?: string;
    }>;
  }>;
  InfoSeatSections?: Array<{
    type: string;
    price: number;
  }>;
}

interface EventStructuredData {
  '@type': 'Event';
  '@id': string;
  name: string;
  description: string;
  url: string;
  startDate: string;
  endDate: string;
  eventStatus: string;
  eventAttendanceMode: string;
  location: {
    '@type': 'MusicVenue';
    name: string;
    address: {
      '@type': 'PostalAddress';
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      addressCountry: string;
    };
  };
  performer: Array<{
    '@type': 'MusicGroup' | 'Person';
    name: string;
    image?: string;
  }>;
  offers: {
    '@type': 'Offer';
    availability: string;
    priceCurrency: string;
    price?: number;
    lowPrice?: number;
    highPrice?: number;
    validFrom: string;
    url: string;
  };
  image?: string;
}

export const generateEventStructuredData = (events: APIEvent[]): EventStructuredData[] => {
  const baseUrl = 'https://booking.queenacoustic.vn';
  
  return events
    .filter(event => event.status === 'ACTIVE' && event.InfoShowTimes?.length > 0)
    .flatMap(event => {
      return event.InfoShowTimes
        .filter(showTime => showTime.status === 'ACTIVE')
        .map(showTime => {
          // Extract performers
          const performers = event.InfoContents
            ?.flatMap(content => content.InfoArtist || [])
            .map(artist => ({
              '@type': 'Person' as const,
              name: artist.name,
              ...(artist.image && { image: getMediaUrl(artist.image) })
            })) || [];

          // Calculate pricing
          const prices = event.InfoSeatSections?.map(section => section.price).filter(price => price > 0) || [];
          const minPrice = prices.length > 0 ? Math.min(...prices) : undefined;
          const maxPrice = prices.length > 0 ? Math.max(...prices) : undefined;

          // Generate event URL
          const eventUrl = `${baseUrl}/su-kien/${event._id}/${event.slug}`;

          const eventData: EventStructuredData = {
            '@type': 'Event',
            '@id': `${baseUrl}/event/${event._id}/${showTime._id}`,
            name: event.title,
            description: event.desc || `Buổi biểu diễn ${event.title} tại Queen Acoustic`,
            url: eventUrl,
            startDate: new Date(showTime.time_start).toISOString(),
            endDate: new Date(showTime.time_end).toISOString(),
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            location: {
              '@type': 'MusicVenue',
              name: 'Queen Acoustic',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Tầng 1, 15 Lê Đại Cang',
                addressLocality: 'Thành Công, Buôn Ma Thuột',
                addressRegion: 'Đắk Lắk',
                addressCountry: 'VN'
              }
            },
            performer: performers,
            offers: {
              '@type': 'Offer',
              availability: 'https://schema.org/InStock',
              priceCurrency: 'VND',
              validFrom: new Date().toISOString(),
              url: eventUrl,
              ...(minPrice && maxPrice && minPrice === maxPrice && { price: minPrice }),
              ...(minPrice && maxPrice && minPrice !== maxPrice && { 
                lowPrice: minPrice, 
                highPrice: maxPrice 
              })
            },
            ...(event.banner && { image: event.banner })
          };

          return eventData;
        });
    });
};

export const generateMusicVenueWithEvents = (events: APIEvent[]) => {
  const eventStructuredData = generateEventStructuredData(events);
  const siteUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3001';
  
  return {
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
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
          'Friday', 'Saturday', 'Sunday'
        ],
        opens: '18:00',
        closes: '23:00'
      }
    ],
    event: eventStructuredData,
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
}; 
