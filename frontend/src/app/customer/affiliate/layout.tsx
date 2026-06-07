import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tiếp thị liên kết | Queen Acoustic',
  description: 'Trang quản lý tiếp thị liên kết tại Queen Acoustic.',
};

export default function AffiliateLayout({ children }: { children: ReactNode }) {
  return children;
} 