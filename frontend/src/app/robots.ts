import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/api/',
        '/thanh-toan-that-bai/',
        '/thanh-toan-thanh-cong/',
        '/login-success/',
        '/verify-account/',
      ],
    },
    sitemap: 'https://booking.queenacoustic.vn/sitemap.xml',
  }
} 