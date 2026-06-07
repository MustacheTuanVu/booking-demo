"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/context/AppContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket, faUserCircle, faMedal, faLink, faBank, faTags, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import api from '@/utils/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MobileMenu from '@/components/Header/MobileMenu';

type MenuItem = {
  id: string;
  label: string;
  path: string;
  icon: IconDefinition;
}

export default function CustomerSidebar() {
  const { saveUserInfo, isLogin, saveIsLogin, userInfo } = useContext(AppContext);
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const menuItems: MenuItem[] = userInfo && userInfo.role == 'USER' ? [
    { id: "chodadat", label: "Chỗ đã đặt", path: "/customer/my-tickets", icon: faTicket },
    { id: "thongtincanhan", label: "Thông tin cá nhân", path: "/customer/my-info", icon: faUserCircle },
    { id: "hangthe", label: "Hạng thẻ", path: "/customer/my-type", icon: faMedal },
    { id: 'affiliate', label: "Tiếp thị liên kết", path: "/customer/affiliate", icon: faLink },
    { id: "thongtintknganhang", label: "Thông tin TK ngân hàng", path: "/customer/my-bank", icon: faBank },
    { id: 'my-voucher', label: "Voucher đã mua", path: "/customer/my-voucher", icon: faTags },
    { id: 'history-request', label: "Lịch sử yêu cầu", path: "/customer/history-request", icon: faClockRotateLeft },
  ] : [
    { id: "thongtincanhan", label: "Thông tin cá nhân", path: "/customer/my-info", icon: faUserCircle },
    { id: "hangthe", label: "Hạng thẻ", path: "/customer/my-type", icon: faMedal },
    { id: 'affiliate', label: "Tiếp thị liên kết", path: "/customer/affiliate", icon: faLink },
    { id: "thongtintknganhang", label: "Thông tin TK ngân hàng", path: "/customer/my-bank", icon: faBank },
    { id: 'my-voucher', label: "Voucher đã mua", path: "/customer/my-voucher", icon: faTags },
    { id: 'history-request', label: "Lịch sử yêu cầu", path: "/customer/history-request", icon: faClockRotateLeft },
  ];

  useEffect(() => {
    if (!isLogin) {
      const checkUserInfo = async () => {
        try {
          const res = await api.get('auth/getUserByJWT');
          saveUserInfo(res.data);
          saveIsLogin(true);
        } catch (error: any) {
          console.error('Lỗi kiểm tra đăng nhập:', error);
          router.replace("/login");
        }
      };
      checkUserInfo();
    }
  }, [isLogin, saveIsLogin, saveUserInfo, router]);

  const isLinkActive = (itemPath: string) => {
    return pathname.startsWith(itemPath);
  };

  const NavItem = ({ item }: { item: MenuItem }) => {
    const isActive = isLinkActive(item.path);
    
    return (
      <motion.div
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 } 
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Link 
          href={item.path}
          className={`
            flex items-center px-4 py-3 mb-2 rounded-lg transition-all duration-300 ease-in-out
            group hover:bg-[var(--clr-bg-1)] hover:shadow-md
            ${isActive 
              ? 'bg-[var(--clr-bg-7)] text-[var(--clr-txt-1)] shadow-md' 
              : 'bg-white text-gray-700 hover:text-white'
            }
            focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:ring-opacity-50
          `}
          aria-current={isActive ? 'page' : undefined}
          tabIndex={0}
        >
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-full
            ${isActive 
              ? 'bg-white/20 text-[var(--clr-txt-1)]' 
              : 'bg-gray-100 text-gray-600 group-hover:bg-white/20 group-hover:text-white'
            }
            transition-all duration-300
          `}>
            <FontAwesomeIcon icon={item.icon} className="text-lg" />
          </div>
          <span className="ml-3 font-medium">{item.label}</span>
        </Link>
      </motion.div>
    );
  };

  return (
    <>
      {/* Menu Button - Mobile Only */}
      <div className="lg:hidden fixed top-28 left-1/2 -translate-x-1/2 w-[80%] max-w-md z-40">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-full px-6 py-3 bg-[var(--clr-bg-1)] text-white rounded-lg shadow-lg hover:bg-[var(--clr-bg-7)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:ring-offset-2 font-semibold text-sm"
          aria-label="Mở menu"
        >
          MENU
        </button>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        menuItems={menuItems}
        title="Quản lý tài khoản"
      />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-full lg:max-w-[280px] transition-all duration-300">
        <div className="w-full p-3 space-y-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 sticky top-4">
          <div className="px-3 py-2 mb-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Quản lý tài khoản</h3>
          </div>
          <nav className="space-y-1" aria-label="Customer navigation">
            {menuItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
