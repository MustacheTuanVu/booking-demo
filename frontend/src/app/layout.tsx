// 'use client';
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { SectionProvider } from "@/context/SectionContext";
import { Roboto_Condensed } from 'next/font/google';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import ClientLayout from '../components/ClientLayout';


// Load Roboto Condensed with all needed weights
const robotoCondensed = Roboto_Condensed({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '700'],
  variable: '--font-roboto-condensed',
  display: 'swap',
});

export { metadata } from './metadata';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${robotoCondensed.variable} ${robotoCondensed.className}`}>
      <body style={{ backgroundColor: 'var(--clr-bg)' }}>
        <AppProvider>
          <SectionProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </SectionProvider>
        </AppProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
