import api from './api';

export interface EventAPIResponse {
  events: any[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export const eventApi = {
  // Fetch events with conditions for structured data
  async getEventsForSEO(limit: number = 50): Promise<any[]> {
    try {
      const response = await api.get(`/events/getEventByCondition?page=1&limit=${limit}`);
      return response.data.events || [];
    } catch (error) {
      console.error('Failed to fetch events for SEO:', error);
      return [];
    }
  },

  // Fetch event details by slug
  async getEventBySlug(slug: string): Promise<any | null> {
    try {
      const response = await api.get(`/events/getDetailEventBySlug?slug=${slug}`);
      return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Failed to fetch event by slug:', error);
      return null;
    }
  },

  // Fetch upcoming events for structured data
  async getUpcomingEvents(days: number = 30): Promise<any[]> {
    try {
      const fromDate = new Date();
      const toDate = new Date();
      toDate.setDate(toDate.getDate() + days);

      const response = await api.get(
        `/events/getEventByCondition?page=1&limit=100&status=ACTIVE&time_from=${fromDate.toISOString()}&time_to=${toDate.toISOString()}`
      );
      return response.data.events || [];
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
      return [];
    }
  }
};

// Server-side fetch function for static generation
export async function fetchEventsForStaticGeneration(): Promise<any[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/events/getEventByCondition?page=1&limit=100&status=ACTIVE`,
      { 
        next: { revalidate: 3600 } // Revalidate every hour
      }
    );
    
    if (!response.ok) {
      console.error('Failed to fetch events for static generation');
      return [];
    }
    
    const data: EventAPIResponse = await response.json();
    return data.events.filter(event => event.status === 'ACTIVE');
  } catch (error) {
    console.error('Error fetching events for static generation:', error);
    return [];
  }
} 