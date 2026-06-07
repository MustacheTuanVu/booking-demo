import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thông Tin Ngân Hàng | Queen Acoustic',
  description: 'Quản lý thông tin ngân hàng tại Queen Acoustic.',
};

export default function MyBankLayout({ children }: { children: ReactNode }) {
  return children;
} 