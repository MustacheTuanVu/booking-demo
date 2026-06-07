'use client';
import React, { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicket, faUser, faMedal, faRightFromBracket, faLink } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '@/context/AppContext';

interface UserMenuProps {
  onNavigate?: () => void;
}

export default function UserMenu({ onNavigate }: UserMenuProps) {
  const { userInfo, saveUserInfo, saveIsLogin, saveEventSelected } = useContext(AppContext);
  const router = useRouter();

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate();
    }
    router.push(path);
  };

  const logout = () => {
    saveUserInfo(null);
    saveIsLogin(false);
    localStorage.removeItem('token');
    saveEventSelected(null);
    localStorage.removeItem('eventSelected');
    if (onNavigate) {
      onNavigate();
    }
    router.replace("/");
  };

  const menuItemClasses = "px-4 py-3 text-sm text-gray-700 hover:bg-gold-50 hover:text-gold-600 focus:bg-gold-50 focus:text-gold-600 focus:outline-none transition-colors flex items-center group w-full";

  return (
    <div className="absolute z-50 top-full right-0 mt-2 w-64 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black/5 transition-all duration-200 transform border border-gray-100 animate-fadeIn">
      {userInfo && (
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="text-sm font-medium text-gray-900 truncate">{userInfo.name}</p>
          <p className="text-xs text-gray-500 truncate mt-1">{userInfo.email}</p>
        </div>
      )}
      <div className="py-1">
        {userInfo && userInfo.role === 'USER' && (
          <button
            onClick={() => handleNavigation('/customer/my-tickets')}
            className={menuItemClasses}
            tabIndex={0}
          >
            <FontAwesomeIcon icon={faTicket} className="w-5 mr-3 text-gray-400 group-hover:text-gold-500" /> Chỗ đã đặt
          </button>
        )}
        <button
          onClick={() => handleNavigation('/customer/my-info')}
          className={menuItemClasses}
          tabIndex={0}
        >
          <FontAwesomeIcon icon={faUser} className="w-5 mr-3 text-gray-400 group-hover:text-gold-500" /> Thông tin cá nhân
        </button>
        <button
          onClick={() => handleNavigation('/customer/my-type')}
          className={menuItemClasses}
          tabIndex={0}
        >
          <FontAwesomeIcon icon={faMedal} className="w-5 mr-3 text-gray-400 group-hover:text-gold-500" /> Hạng thẻ
        </button>
        <button
          onClick={() => handleNavigation('/customer/affiliate')}
          className={menuItemClasses}
          tabIndex={0}
        >
          <FontAwesomeIcon icon={faLink} className="w-5 mr-3 text-gray-400 group-hover:text-gold-500" /> Tiếp thị liên kết
        </button>
        <button
          onClick={logout}
          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none transition-colors flex items-center group"
          tabIndex={0}
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-5 mr-3 text-red-400 group-hover:text-red-500" /> Đăng Xuất
        </button>
      </div>
    </div>
  );
}
