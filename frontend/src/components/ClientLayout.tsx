'use client';

import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "@/context/AppContext";
import useSocket from "@/hook/useSocket";
import { Socket } from "socket.io-client";
import { Dialog, DialogContent, ThemeProvider } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import theme from "@/utils/theme";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { browserName } from 'react-device-detect';
import { motion } from 'framer-motion';
import { FaFacebook } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { BsChatDots, BsTelephone } from 'react-icons/bs';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [token, setToken] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { setNotifications, userInfo } = useContext(AppContext);
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/dashboard");
  const isToChucPage = pathname.startsWith("/to-chuc");
  const isLoginPage = pathname === "/login";
  const isHomePage = pathname === "/";
  const [showWebKitDialog, setShowWebKitDialog] = useState(false);

  useEffect(() => {
    if (userInfo) {
      if (userInfo.email && (!userInfo.phone || userInfo.isDelete === "NOT_VERIFY")) {
        router.push('verify-account')
      }
    }
  }, [userInfo]);
  
  useEffect(() => {
    const storedToken = localStorage.getItem('token') || 'your_jwt_token_here';
    setToken(storedToken);
    if (browserName == 'WebKit') {
      if (true) {
        const currentUrl = window.location.href;
        
        // For iOS devices
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
          try {
            setTimeout(() => {
              setShowWebKitDialog(true);
            }, 500);
          } catch (error) {
            // alert(error)
          }
        } 
      }
    }
  }, []);

  // Load notifications từ localStorage khi component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("paidInvoiceMsg");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        } else {
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error parsing notifications from storage", error);
      setNotifications([]);
    }
  }, [setNotifications]);

  const socket: Socket | null = useSocket(token);

  const handleCloseDialog = () => {
    setShowWebKitDialog(false);
  };

  useEffect(() => {
    if (!socket) return;
    socket.on('connect', () => {
      console.log('Connected with socket id:', socket.id);
    });
    socket.on('onMessenger', (data: any) => {
      console.log('Received data:', data);
      if (data && data.msg && data.msg === "PAID_INVOICE" && data.content) {
        let storedNotifications: any[] = [];
        try {
          const stored = localStorage.getItem("paidInvoiceMsg");
          storedNotifications = stored ? JSON.parse(stored) : [];
          if (!Array.isArray(storedNotifications)) {
            storedNotifications = [];
          }
        } catch (error) {
          console.error("Error parsing stored notifications:", error);
          storedNotifications = [];
        }
        const newNotification = { id: Date.now(), content: data.content };

        let flagAdd = true;
        for (let i = 0; i < storedNotifications.length; i++) {
          const noti: any = storedNotifications[i];
          if (noti.content.orderId === newNotification.content.orderId) {
            flagAdd = false;
            break;
          }
          
        }

        if (flagAdd) {
          storedNotifications.push(newNotification);
          localStorage.setItem("paidInvoiceMsg", JSON.stringify(storedNotifications));
          setNotifications(storedNotifications);
        }
      }
    });
    return () => {
      socket.off('connect');
      socket.off('onMessenger');
    };
  }, [socket, setNotifications]);

  const contactButtons = [
    {
      id: 'facebook',
      icon: <FaFacebook className="w-5 h-5" />,
      label: 'Facebook',
      href: 'https://www.facebook.com/queenacousticbmt',
      bgColor: 'bg-[#1877F2]',
      hoverBg: 'hover:bg-[#0d6efd]',
    },
    {
      id: 'phone',
      icon: <BsTelephone className="w-5 h-5" />,
      label: '1900 5225',
      href: 'tel:19005225',
      bgColor: 'bg-green-500',
      hoverBg: 'hover:bg-green-600',
    },
    {
      id: 'zalo',
      icon: <SiZalo className="w-5 h-5" />,
      label: 'Zalo',
      href: 'https://zalo.me/0903150574/',
      bgColor: 'bg-[#0068FF]',
      hoverBg: 'hover:bg-[#0054cc]',
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      {!isLoginPage && <Header />} 
      <div style={{
        paddingTop: isLoginPage ? "0px" : isHomePage ? "64px" : "100px",
        backgroundColor: 'var(--clr-bg)'
      }}>
        {children}
      </div>
      
      {/* Modern Floating Actions */}
      {!isAdminPage && !isToChucPage && !isLoginPage && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-4">
          {/* Expandable Contact Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isExpanded ? 1 : 0,
              scale: isExpanded ? 1 : 0.8,
              y: isExpanded ? 0 : 10,
            }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2 items-end"
            style={{ pointerEvents: isExpanded ? 'auto' : 'none' }}
          >
            {contactButtons.map((button) => (
              <motion.a
                key={button.id}
                href={button.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-full shadow-lg
                  ${button.bgColor} ${button.hoverBg} md:min-w-[140px]`}
              >
                {button.icon}
                <span className="hidden md:inline text-sm font-medium">{button.label}</span>
              </motion.a>
            ))}
          </motion.div>

          {/* Contact Toggle Button */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full shadow-lg transition-colors bg-gold-500 hover:bg-gold-600"
          >
            <motion.div 
              animate={{ rotate: isExpanded ? 45 : 0 }} 
              transition={{ duration: 0.2 }}
            >
              <BsChatDots className="w-5 h-5 text-white" />
            </motion.div>
          </motion.button>
        </div>
      )}
      
      {!isLoginPage && !isToChucPage && !isAdminPage && <Footer />}

      {/* WebKit Dialog with Image */}
      <Dialog 
        open={showWebKitDialog} 
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', padding: '20px' }}>
          <div>
            <h2>Lỗi: Google không cho phép đăng nhập trên trình duyệt Zalo IOS</h2>
            <p>Hãy chọn <b>Mở bằng Safari</b> theo hướng dẫn dưới</p>
            <div style={{ marginTop: '20px' }}>
              {/* <button 
              onClick={handleCloseDialog}
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--clr-bg-1)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Đóng
            </button> */}
            </div>
            <video
              src="/videos/zalo-guide.mp4"
              autoPlay
              muted
              controls
              style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};

export default ClientLayout; 