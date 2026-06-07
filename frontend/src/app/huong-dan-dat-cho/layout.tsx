'use client';
import React from 'react';
import { Box } from '@mui/material';
import Footer from '@/components/Footer/Footer';

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <Box sx={{ flex: '1 0 auto' }}>
        {children}
      </Box>
    </Box>
  );
} 