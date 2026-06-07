import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Snackbar Test | Queen Acoustic',
  description: 'Test page for snackbar positioning in different scenarios.',
};

export default function SnackbarTestLayout({ children }: { children: ReactNode }) {
  return children;
}
