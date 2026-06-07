'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: IconDefinition;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  title?: string;
}

export default function MobileMenu({ isOpen, onClose, menuItems, title = "Menu" }: MobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isLinkActive = (itemPath: string) => {
    return pathname.startsWith(itemPath);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
            onClick={onClose}
          />

          {/* Slide-in Menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[80%] max-w-md bg-white z-[70] shadow-2xl lg:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[var(--clr-bg-1)] to-[var(--clr-bg-7)] text-white px-6 py-4 flex items-center justify-between shadow-md z-10">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Đóng menu"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-4 space-y-2" aria-label="Mobile navigation">
              {menuItems.map((item) => {
                const isActive = isLinkActive(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300
                      ${isActive
                        ? 'bg-[var(--clr-bg-7)] text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-[var(--clr-bg-1)] hover:text-white'
                      }
                      focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-1)] focus:ring-opacity-50
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full
                        ${isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white text-gray-600'
                        }
                        transition-all duration-300
                      `}
                    >
                      <FontAwesomeIcon icon={item.icon} className="text-lg" />
                    </div>
                    <span className="ml-3 font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
