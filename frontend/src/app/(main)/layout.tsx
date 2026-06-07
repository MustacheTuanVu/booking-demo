import { metadata as baseMetadata } from '../metadata';

// This exports the metadata for the home page and other main routes
export const metadata = baseMetadata;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 