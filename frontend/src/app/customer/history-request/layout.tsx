import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lịch sử yêu cầu | Queen Acoustic',
  description: 'Trang quản lý lịch sử yêu cầu tại Queen Acoustic.',
};

export default function HistoryRequestLayout({ children }: { children: ReactNode }) {
  return children;
} 