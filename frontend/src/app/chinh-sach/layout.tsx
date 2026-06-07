import { metadata, viewport } from './metadata';
import { structuredData } from './structured-data';
import { Metadata, Viewport } from 'next';

// Export both metadata and viewport
export { metadata, viewport };

export default function ChinhSachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
} 