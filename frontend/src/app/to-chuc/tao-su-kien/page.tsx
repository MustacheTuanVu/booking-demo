"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToCreateEvent() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/create-event');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Đang chuyển hướng...</h1>
        <p className="text-gray-600 mb-6">Bạn đang được chuyển hướng đến trang tạo sự kiện mới.</p>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-500 mx-auto"></div>
      </div>
    </div>
  );
}