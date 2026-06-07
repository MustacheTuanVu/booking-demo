"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomerSnackbarProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
  isSuccess?: boolean;
}

export default function CustomerSnackbar({
  message,
  isOpen,
  onClose,
  duration = 5000,
  isSuccess = true
}: CustomerSnackbarProps) {
  // Auto-close timer
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <div className="fixed inset-0 pointer-events-none flex justify-center items-end z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              duration: 0.3
            }}
            className="pointer-events-auto bg-gray-800 text-white px-5 py-3 rounded-lg shadow-xl
                       flex items-center justify-between mb-6 w-[90%] sm:w-[400px] max-w-[90%] sm:max-w-[400px]"
          >
            <div className="flex items-center flex-grow overflow-hidden">
              {isSuccess ? (
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              )}
              <span className="text-sm md:text-base truncate">{message}</span>
            </div>
            <button
              onClick={onClose}
              className="ml-3 text-sm hover:text-gray-300 transition-colors flex-shrink-0 p-1"
              aria-label="Close notification"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}