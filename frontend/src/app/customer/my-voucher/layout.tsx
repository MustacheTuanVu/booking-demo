import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voucher Đã Mua | Queen Acoustic',
  description: 'Quản lý voucher và mã giảm giá của bạn tại Queen Acoustic.',
};

export default function MyVoucherLayout({ children }: { children: ReactNode }) {
  return children;
} 