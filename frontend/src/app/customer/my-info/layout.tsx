import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thông tin cá nhân | Queen Acoustic',
  description: 'Trang thông tin cá nhân tại Queen Acoustic.',
};

export default function MyInfoLayout({ children }: { children: ReactNode }) {
  return children;
} 