'use client'; // Đánh dấu là Client Component

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from "@/utils/api";
import Image from 'next/image';

const LoginSuccess = () => {
  const router = useRouter();
  
  useEffect(() => {
    const checkUser = async () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
          // Save token to localStorage
          localStorage.setItem('token', token);
          
          try {
            const res = await api.get('auth/getUserByJWT');
            if (res.data && res.data.phone && res.data.phone.length > 0 && res.data.isDelete === "ACTIVE" ) {
              router.replace('/');
            } else {
              router.replace('/verify-account');
            }
          } catch (error) {
            console.error('Lỗi lấy thông tin người dùng:', error);
            // Redirect to login page after 3 seconds if there's an error
            setTimeout(() => {
              window.location.href = '/login';
            }, 3000);
          }
        } else {
          // Redirect to login page after 3 seconds if no token
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        }
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-white to-gray-100 p-4 overflow-hidden">
      <title>Đang đăng nhập | Queen Acoustic</title>
      <meta name="description" content="Đang tiến hành đăng nhập tại Queen Acoustic." />
      
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23000000" fill-opacity="0.2" fill-rule="evenodd"/%3E%3C/svg%3E")',
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 overflow-hidden transform transition-all duration-500 hover:shadow-2xl">
          {/* Card Content */}
          <div className="flex flex-col items-center">
            {/* Logo */}
            <div className="w-24 h-24 relative mb-6 animate-pulse">
              <Image
                src="/images/logo_queen.png"
                alt="Queen Acoustic Logo"
                fill
                priority
                sizes="96px"
                className="object-contain"
              />
            </div>
            
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập thành công</h1>
            
            {/* Message */}
            <p className="text-gray-600 text-center mb-8">
              Chúng tôi đang chuyển hướng bạn đến trang chủ...
            </p>
            
            {/* Loader */}
            <div className="relative h-1 w-full max-w-xs bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-gold-500 rounded-full animate-loading-bar"></div>
            </div>
            
            {/* Optional info text */}
            <p className="text-sm text-gray-500 mt-6">
              Nếu bạn không được chuyển hướng tự động,&nbsp;
              <button 
                onClick={() => window.location.href = '/'}
                className="text-gold-600 hover:text-gold-700 font-medium focus:outline-none transition-colors"
              >
                bấm vào đây
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Add the loading bar animation keyframe */}
      <style jsx global>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          20% { width: 20%; }
          40% { width: 40%; }
          60% { width: 60%; }
          80% { width: 80%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default LoginSuccess;
