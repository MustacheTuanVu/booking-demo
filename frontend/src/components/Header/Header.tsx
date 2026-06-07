'use client';
import React, { useState, useContext, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faUserCircle,
  faTicket,
  faCaretDown,
  faBars,
  faLandmark,
  faCheckDouble,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import NotificationItem from './NotificationItem';
import EmptyNotification from './EmptyNotification';
import UserMenu from './UserMenu';
import Categories from './Categories';
import { AppContext } from '@/context/AppContext';
import { useSectionRefs } from '@/context/SectionContext';
import api from '@/utils/api';

const bellAnimation = `
@keyframes bellShake {
  0% { transform: rotate(0); }
  15% { transform: rotate(5deg); }
  30% { transform: rotate(-5deg); }
  45% { transform: rotate(4deg); }
  60% { transform: rotate(-4deg); }
  75% { transform: rotate(2deg); }
  85% { transform: rotate(-2deg); }
  92% { transform: rotate(1deg); }
  100% { transform: rotate(0); }
}

.bell-animation {
  animation: bellShake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  transform-origin: top center;
}
`;

export default function Headers() {
  // const pathname = usePathname(); // Not currently used but kept for future reference
  const router = useRouter();
  const { userInfo, saveUserInfo, isLogin, saveIsLogin, notifications, setNotifications } =
    useContext(AppContext);
  const sectionRefs: any = useSectionRefs();

  useEffect(() => {
    if (!isLogin) {
      const checkUserInfo = async () => {
        try {
          const res = await api.get('auth/getUserByJWT');
          saveUserInfo(res.data);
          saveIsLogin(true);
        } catch (error: any) {
          // Only log non-authentication errors (400/401 are expected when not logged in)
          if (error?.response?.status !== 400 && error?.response?.status !== 401) {
            console.error('Lỗi kiểm tra đăng nhập:', error);
          }
          // For 400/401 errors, we silently handle them as they're expected when not logged in
        }
      };
      checkUserInfo();
    }
  }, [isLogin, saveUserInfo, saveIsLogin]);

  const [showNotificationBox, setShowNotificationBox] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<number[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside handler for user menu
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const handleClickOutsideNotification = (event: MouseEvent) => {
      if (
        notificationRef.current && !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationBox(false);
      }
    };

    if (showNotificationBox) {
      document.addEventListener('mousedown', handleClickOutsideNotification);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideNotification);
    };
  }, [showNotificationBox]);

  // Load read notifications from localStorage
  useEffect(() => {
    try {
      const storedReadNotifications = localStorage.getItem('readNotifications');
      if (storedReadNotifications) {
        setReadNotifications(JSON.parse(storedReadNotifications));
      }
    } catch (error) {
      console.error('Error loading read notifications:', error);
    }
  }, []);

  const handleNotificationToggle = () => {
    setShowNotificationBox((prev) => !prev);
  };

  const handleRemoveNotification = (id: number) => {
    const updated = notifications.filter((notif: any) => notif.id !== id);
    setNotifications(updated);
    localStorage.setItem('paidInvoiceMsg', JSON.stringify(updated));
  };

  const handleNotificationClick = (orderId: string) => {
    router.replace('/ve/' + orderId);
    setShowNotificationBox(false);
  };

  const markAsRead = (id: number) => {
    if (!readNotifications.includes(id)) {
      const updatedReadNotifications = [...readNotifications, id];
      setReadNotifications(updatedReadNotifications);
      localStorage.setItem('readNotifications', JSON.stringify(updatedReadNotifications));
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((notif: any) => notif.id);
    setReadNotifications(allIds);
    localStorage.setItem('readNotifications', JSON.stringify(allIds));
  };

  const getUnreadCount = () => {
    return notifications.filter((notif: any) => !readNotifications.includes(notif.id)).length;
  };

  const handleUserMenuToggle = (e: React.MouseEvent) => {
    if (userInfo) {
      e.stopPropagation();
      setIsUserMenuOpen(prev => !prev);
    } else {
      router.replace('/login');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // Generate initials from name
  const getInitials = () => {
    if (!userInfo?.name) return "QA";

    const names = userInfo.name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();

    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <>
      {/* Header Fixed Top */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <nav className="transition-all duration-300 bg-white/70 shadow-lg backdrop-blur-lg rounded-xl max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8 z-10 opacity-100">
            <div className="flex h-16 items-center justify-between lg:justify-between">
              {/* Logo & Tên */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="https://www.queenacoustic.vn/" className="flex items-center group">
                  <div className="relative overflow-visible h-12 flex items-center transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src="/images/logo_queen.png"
                      alt="Logo"
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  </div>
                </Link>
                <Link
                  href="/"
                  className="px-4 text-base font-medium text-gray-800 hover:text-gold-600 transition-colors"
                >
                  Queen Acoustic
                </Link>
              </div>

              {/* Desktop Menu */}
              {/* {pathname === "/" && ( */}
              <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center">
                <Categories sectionRefs={sectionRefs} />
              </div>
              {/* )} */}

              {/* Các nút bên phải */}
              <div className="flex items-center space-x-4">
                {/* Admin icon for mobile only */}
                {userInfo && (userInfo.role === 'ADMIN' || userInfo.role === 'BOSS') && (
                  <Link href="/dashboard/event-list" className="md:hidden flex items-center">
                    <FontAwesomeIcon icon={faLandmark} className="text-gray-800 hover:text-gold-600 transition-colors" style={{ fontSize: '1.5rem' }} />
                  </Link>
                )}
                {userInfo && userInfo.role === 'USER' && (
                  <Link href="/customer/my-tickets" className="hidden lg:flex">
                    <div className="flex items-center px-4 py-2 text-gray-800 hover:text-gold-600 transition-colors">
                      <FontAwesomeIcon
                        icon={faTicket}
                        className="mr-2"
                        style={{ fontSize: '1.5rem' }}
                      />
                      <span className="text-base">Chỗ đã đặt</span>
                    </div>
                  </Link>
                )}
                {/* Notification Bell */}
                {userInfo && (userInfo.role === 'ADMIN' || userInfo.role === 'BOSS') ?
                  <div className="relative">
                    <button
                      onClick={handleNotificationToggle}
                      className="text-gray-600 hover:text-gold-600 transition-colors focus:outline-none relative"
                      aria-label="Thông báo"
                      aria-expanded={showNotificationBox}
                      aria-haspopup="true"
                    >
                      <style jsx>{bellAnimation}</style>
                      <div className={getUnreadCount() > 0 ? "bell-animation" : ""}>
                        <FontAwesomeIcon icon={faBell} style={{ fontSize: '1.5rem' }} />
                      </div>
                      {getUnreadCount() > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                          {getUnreadCount()}
                        </div>
                      )}
                    </button>
                    {showNotificationBox && (
                      <div
                        ref={notificationRef}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white shadow-xl rounded-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                        style={{ maxHeight: '80vh', maxWidth: 'calc(100vw - 2rem)' }}
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="notification-menu"
                      >
                        {/* Notification Header */}
                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                          <h3 className="text-sm font-semibold text-gray-700">Thông báo</h3>
                          {notifications.length > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1 transition-colors"
                              aria-label="Đánh dấu tất cả là đã đọc"
                            >
                              <FontAwesomeIcon icon={faCheckDouble} className="mr-1" />
                              Đánh dấu đã đọc
                            </button>
                          )}
                        </div>

                        {/* Notification Content */}
                        <div className="overflow-y-auto p-2" style={{ maxHeight: 'calc(80vh - 50px)' }}>
                          {notifications.length > 0 ? (
                            notifications.map((notif: any) => (
                              <NotificationItem
                                key={notif.id}
                                id={notif.id}
                                content={notif.content}
                                isRead={readNotifications.includes(notif.id)}
                                onRemove={handleRemoveNotification}
                                onClick={(orderId) => {
                                  markAsRead(notif.id);
                                  handleNotificationClick(orderId);
                                }}
                              />
                            ))
                          ) : (
                            <EmptyNotification message="Bạn không có thông báo nào" />
                          )}
                        </div>

                        {/* Notification Footer */}
                        {notifications.length > 0 && (
                          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                            <Link
                              href="/dashboard/notification"
                              className="text-xs text-center block w-full text-gold-600 hover:text-gold-700 transition-colors"
                              onClick={() => setShowNotificationBox(false)}
                            >
                              Xem tất cả thông báo
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  : <></>}

                {/* User Icon & Menu */}
                <div className="relative group" ref={userMenuRef}>
                  <button
                    onClick={handleUserMenuToggle}
                    className="flex items-center text-gray-800 hover:text-gold-600 transition-colors focus:outline-none py-2 px-1 rounded-md"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="flex items-center space-x-2">
                      {userInfo ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-gold-500 to-gold-600 text-white shadow-md">
                          <span className="text-lg font-bold">{getInitials()}</span>
                        </div>
                      ) : (
                        <FontAwesomeIcon icon={faUserCircle} className="text-3xl text-gray-700" />
                      )}
                      <div className="hidden md:flex flex-col items-start">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium max-w-[130px] truncate">
                            {userInfo ? userInfo.name : 'Đăng nhập'}
                          </span>
                          {userInfo && userInfo.role === 'BOSS' && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                              BOSS
                            </span>
                          )}
                          {userInfo && userInfo.role === 'ADMIN' && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              ADMIN
                            </span>
                          )}
                        </div>
                        {userInfo && (
                          <span className="text-xs text-gray-500">{userInfo.email?.split('@')[0]}</span>
                        )}
                      </div>
                      {userInfo && (
                        <FontAwesomeIcon
                          icon={faCaretDown}
                          className="hidden md:block text-xs ml-1 transition-transform duration-200"
                          style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                        />
                      )}
                    </div>
                  </button>
                  {userInfo && isUserMenuOpen && (
                    <UserMenu onNavigate={() => setIsUserMenuOpen(false)} />
                  )}
                </div>

                {/* Mobile Menu Toggle Button */}
                {/* {pathname === "/" && ( */}
                < div className="flex lg:hidden">
                  <button
                    onClick={toggleMobileMenu}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gold-600 hover:bg-gold-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold-300"
                    aria-label="Open main menu"
                  >
                    <FontAwesomeIcon icon={faBars} style={{ fontSize: '1.5rem' }} />
                  </button>
                </div>
                {/* )} */}
              </div>
            </div>
          </div>
        </nav >
      </div >

      {/* Mobile Menu - cố định bên dưới header, padding-top 50px */}

      {isMobileMenuOpen && (
        <div
          className="fixed top-16 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 lg:hidden"
          style={{ maxHeight: "calc(100vh - 4rem)", overflowY: "auto" }}
        >
          <div className="px-4 pb-3 pt-[50px]">
            <Categories sectionRefs={sectionRefs} onItemClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
