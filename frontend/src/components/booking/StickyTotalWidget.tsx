'use client'

import React, { useEffect, useRef, useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { FiCheckCircle, FiCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { AppContext } from '@/context/AppContext'

interface StickyTotalWidgetProps {
  totalAmount: number
  formatCurrency: (amount: number) => string
  onChooseSeats: () => void
  openDialog: boolean
  setOpenDialog: (open: boolean) => void
  dialogMessage: string
  isSMUp: boolean
  isShowTotal: any
  hasAnySelectedEventEnded?: boolean
  eventSelected?: any // Add event info
  hasSelectedCombos?: boolean // Add combo selection status
  onScrollToCombo?: () => void // Callback to scroll to combo list
}

export default function StickyTotalWidget({
  isSMUp,
  openDialog,
  setOpenDialog,
  dialogMessage,
  totalAmount,
  formatCurrency,
  onChooseSeats,
  isShowTotal,
  hasAnySelectedEventEnded = false,
  eventSelected,
  hasSelectedCombos = false,
  onScrollToCombo
}: StickyTotalWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { userInfo } = useContext(AppContext)
  
  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openDialog) {
        setOpenDialog(false)
      }
    }
    
    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [openDialog, setOpenDialog])
  
  // Handle clicking outside to close
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setOpenDialog(false)
      }
    }
    
    if (openDialog) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [openDialog, setOpenDialog])

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (openDialog) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [openDialog])
  
  // Custom Dialog Component
  const CustomDialog = () => {
    if (typeof window === 'undefined') return null

    // Check if this is a confirmation dialog
    const isConfirmationDialog = dialogMessage.includes('Bạn chỉ có thể đặt combo từ một sự kiện');
    const handleConfirm = (window as any).handleConfirmChangeEvent;
    const handleCancel = (window as any).handleCancelChangeEvent;
    
    return createPortal(
      <AnimatePresence>
        {openDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                ref={dialogRef}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto overflow-hidden"
              >
                {/* Dialog Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-center text-gray-800">Thông báo</h3>
                </div>
                
                {/* Dialog Content */}
                <div className="px-6 py-6">
                  <p className="text-center text-gray-700 text-base leading-relaxed">
                    {dialogMessage}
                  </p>
                </div>
                
                {/* Dialog Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-center gap-3">
                  {isConfirmationDialog ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleConfirm}
                        className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-medium rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2"
                      >
                        Tiếp tục
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setOpenDialog(false)}
                      className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-medium rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2"
                    >
                      Đóng
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )
  }
  
  // Determine current step
  const currentStep = eventSelected && !hasSelectedCombos ? 1 : eventSelected && hasSelectedCombos ? 2 : 0;

  return (
    <React.Fragment>
      <CustomDialog />
      
      {/* Collapsed State - Floating Button */}
      <AnimatePresence>
        {eventSelected && isCollapsed && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            onClick={() => setIsCollapsed(false)}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 md:bottom-6 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-full shadow-lg hover:shadow-xl z-[9999] transition-all duration-200"
            style={{ width: '60px', height: '60px' }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-xs font-bold mb-0.5">Bước {currentStep}/3</span>
              <FiChevronUp className="h-5 w-5" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded State - Full Widget */}
      <AnimatePresence>
        {eventSelected && !isCollapsed && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-0 md:bottom-4 left-0 right-0 mx-auto bg-white border border-gray-200 z-[9998] shadow-xl rounded-lg w-[95%] sm:w-[85%] md:w-[75%] lg:w-[65%] max-w-4xl overflow-hidden"
            style={{ transform: 'translateX(0)' }}
          >
            {/* Progress Steps Indicator */}
            <div className="bg-gradient-to-r from-gold-50 to-gold-100/50 px-4 py-2 border-b border-gold-200 relative">
              {/* Collapse Button */}
              <button
                onClick={() => setIsCollapsed(true)}
                className="absolute top-2 right-2 px-3 py-1.5 bg-gold-100 hover:bg-gold-200 rounded-full transition-all shadow-sm hover:shadow-md z-10 border border-gold-300 flex items-center gap-1.5"
                aria-label="Thu gọn"
              >
                <FiChevronDown className="h-4 w-4 text-gold-700" />
                <span className="text-xs font-medium text-gold-700 whitespace-nowrap">Thu gọn</span>
              </button>
              <div className="flex items-center justify-between max-w-xl mx-auto pr-24">
              {/* Step 1 */}
              <div className="flex items-center gap-2 flex-1">
                {currentStep >= 1 ? (
                  <FiCheckCircle className="h-5 w-5 text-gold-600 flex-shrink-0" />
                ) : (
                  <FiCircle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                )}
                <span className={`text-xs md:text-sm font-medium ${currentStep >= 1 ? 'text-gold-700' : 'text-gray-400'}`}>
                  Chọn Event
                </span>
              </div>
              
              {/* Divider */}
              <div className={`h-0.5 w-8 md:w-16 mx-2 ${currentStep >= 2 ? 'bg-gold-500' : 'bg-gray-300'}`}></div>
              
              {/* Step 2 */}
              <div className="flex items-center gap-2 flex-1">
                {currentStep >= 2 ? (
                  <FiCheckCircle className="h-5 w-5 text-gold-600 flex-shrink-0" />
                ) : (
                  <FiCircle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                )}
                <span className={`text-xs md:text-sm font-medium ${currentStep >= 2 ? 'text-gold-700' : 'text-gray-400'}`}>
                  Chọn Combo
                </span>
              </div>
              
              {/* Divider */}
              <div className="h-0.5 w-8 md:w-16 mx-2 bg-gray-300"></div>
              
              {/* Step 3 */}
              <div className="flex items-center gap-2 flex-1">
                <FiCircle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium text-gray-400">
                  Chọn Ghế
                </span>
              </div>
              </div>
            </div>

            {/* Content Area */}
          <div className="px-4 md:px-6 py-3 md:py-4">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-center justify-between gap-3"
              >
                <div className="text-center md:text-left flex-1">
                  <div className="mb-1">
                    <span className="inline-block bg-gold-100 text-gold-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                      Bước 1/3
                    </span>
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-1">
                    Bạn đang chọn: <span className="text-gold-600">{eventSelected.title}</span>
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Mời bạn chọn combo để tiếp tục
                  </p>
                </div>
                
                {onScrollToCombo && (
                  <motion.button
                    onClick={() => {
                      // Check if user is logged in
                      if (!userInfo) {
                        router.push('/login')
                        return
                      }
                      onScrollToCombo()
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-6 py-3 text-sm md:text-base rounded-full font-semibold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                  >
                    Chọn Combo →
                  </motion.button>
                )}
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-center justify-between gap-3"
              >
                <div className="text-center md:text-left flex-1">
                  <div className="mb-1">
                    <span className="inline-block bg-gold-100 text-gold-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                      Bước 2/3
                    </span>
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-1">
                    Bạn đã chọn combo
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-2">
                    Tổng: <span className="font-bold text-gold-600">{formatCurrency(totalAmount)}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Sau khi chọn xong, hãy chọn ghế nhé!
                  </p>
                </div>
                
                <motion.button
                  onClick={() => {
                    // Check if user is logged in
                    if (!userInfo) {
                      router.push('/login')
                      return
                    }
                    onChooseSeats()
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-6 py-3 text-sm md:text-base rounded-full font-semibold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                >
                  Chọn Ghế →
                </motion.button>
              </motion.div>
            )}
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </React.Fragment>
  )
}
