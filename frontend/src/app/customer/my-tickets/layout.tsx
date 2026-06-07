import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chỗ Đặt Trước | Queen Acoustic',
  description: 'Trang quản lý chỗ đặt trước tại Queen Acoustic.',
};

export default function MyTicketsLayout({ children }: { children: ReactNode }) {
  return children;
} 