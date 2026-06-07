'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/chinh-sach#giao-nhan');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-gray-500">Đang chuyển hướng...</p>
    </div>
  );
}