import { structuredData } from './structured-data';
import { generateMusicVenueWithEvents } from '@/utils/generateEventStructuredData';

interface JsonLdProps {
  events?: any[];
  customStructuredData?: any;
}

export default function JsonLd({ events, customStructuredData }: JsonLdProps) {
  let dataToRender;

  if (customStructuredData) {
    // Use custom structured data if provided
    dataToRender = customStructuredData;
  } else if (events && events.length > 0) {
    // Generate dynamic structured data with events
    dataToRender = generateMusicVenueWithEvents(events);
  } else {
    // Fallback to base structured data
    dataToRender = structuredData;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dataToRender) }}
    />
  );
} 