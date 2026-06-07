"use client";

import React, { ReactNode } from 'react';
import CustomerSidebar from '@/components/Dashboard/CustomerSidebar';

interface CustomerPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  isLoading?: boolean;
}

export default function CustomerPageLayout({ 
  children, 
  title, 
  subtitle, 
  description = 'Quản lý tài khoản tại Queen Acoustic.',
  isLoading = false
}: CustomerPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Removed Head, title and meta tags as they're now handled at the page level */}
      
      {/* Header Section */}
      <header className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 z-0"></div>
        <div className="absolute inset-0 bg-[url('/images/background.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay z-0"></div>
        <div className="absolute left-0 right-0 bottom-0 h-16 bg-gradient-to-t from-gray-50 to-transparent z-0"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{title}</h1>
            {subtitle && (
              <p className="text-sm md:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto whitespace-normal md:whitespace-nowrap text-ellipsis overflow-hidden">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <CustomerSidebar />
          </div>

          {/* Content Area */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="w-full h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--clr-bg-1)]"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 