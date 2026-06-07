import { MetadataRoute } from 'next'

// Interfaces for type safety
interface Event {
  _id: string;
  slug: string;
  updatedAt: string;
  status: string;
}

interface Artist {
  _id: string;
  slug?: string;
  name: string;
  updatedAt?: string;
}

interface EventsResponse {
  events: Event[];
  total: number;
}

interface ArtistsResponse {
  artists: Artist[];
  total: number;
}

// Helper function to create slug from name if slug doesn't exist
const createSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Function to fetch all events
async function fetchAllEvents(): Promise<Event[]> {
  try {
    // Fetch with a large limit to get all events
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/events/getEventByCondition?page=1&limit=999999`,
      { 
        next: { revalidate: 3600 } // Revalidate every hour
      }
    );
    
    if (!response.ok) {
      console.error('Failed to fetch events for sitemap');
      return [];
    }
    
    const data: EventsResponse = await response.json();
    
    // Filter out inactive events
    return data.events.filter(event => event.status === 'ACTIVE' && event.slug);
  } catch (error) {
    console.error('Error fetching events for sitemap:', error);
    return [];
  }
}

// Function to fetch all artists
async function fetchAllArtists(): Promise<Artist[]> {
  try {
    // Fetch with a large limit to get all artists
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/artists/GetMany?page=1&limit=999999`,
      { 
        next: { revalidate: 3600 } // Revalidate every hour
      }
    );
    
    if (!response.ok) {
      console.error('Failed to fetch artists for sitemap');
      return [];
    }
    
    const data: ArtistsResponse = await response.json();
    return data.artists;
  } catch (error) {
    console.error('Error fetching artists for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://booking.queenacoustic.vn'
  
  // Static routes that should be indexed
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/chinh-sach`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/huong-dan-dat-cho`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/my-profile`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/artist-list`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ca-sy`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/customer/my-tickets`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/customer/affiliate`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  // Fetch dynamic data
  const [events, artists] = await Promise.all([
    fetchAllEvents(),
    fetchAllArtists()
  ]);

  // Generate dynamic event routes
  const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${baseUrl}/su-kien/${event._id}`,
    lastModified: new Date(event.updatedAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Generate dynamic artist routes
  const artistRoutes: MetadataRoute.Sitemap = artists.map((artist) => {
    // Use existing slug or create one from name
    const slug = artist.slug || createSlugFromName(artist.name);
    
    return {
      url: `${baseUrl}/ca-sy/${slug}`,
      lastModified: new Date(artist.updatedAt || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    };
  });

  // Combine all routes
  return [...staticRoutes, ...eventRoutes, ...artistRoutes];
} 