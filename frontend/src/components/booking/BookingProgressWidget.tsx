'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheckCircle, FiCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi'

interface BookingProgressWidgetProps {
  currentStep: number
  eventTitle?: string
  totalAmount?: number
  formatCurrency?: (amount: number) => string
  onContinue?: () => void
  continueButtonText?: string
  showContinueButton?: boolean
  additionalInfo?: string
  onOpenItemSelection?: () => void // Callback to open item selection popup
}

export default function BookingProgressWidget({
  currentStep,
  eventTitle,
  totalAmount = 0,
  formatCurrency = (amount) => `${amount.toLocaleString('vi-VN')}đ`,
  onContinue,
  continueButtonText = 'Tiếp tục',
  showContinueButton = false,
  additionalInfo,
  onOpenItemSelection
}: BookingProgressWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const getStepContent = () => {
    switch (currentStep) {
      case 3:
        return {
          badge: 'Bước 3/5',
          title: 'Bạn đã chọn combo',
          description: 'Vui lòng chọn ghế',
          showTotal: true
        }
      case 4:
        return {
          badge: 'Bước 4/5',
          title: 'Bạn đã chọn ghế xong',
          description: 'Vui lòng chọn món ăn đồ uống',
          showTotal: true
        }
      case 5:
        return {
          badge: 'Bước 5/5',
          title: 'Bạn đã chọn món xong',
          description: 'Hãy xác nhận thông tin để hoàn thành việc đặt combo',
          showTotal: true
        }
      default:
        return null
    }
  }

  const content = getStepContent()
  
  if (!content || currentStep < 3) return null

  return (
    <React.Fragment>
      <AnimatePresence>
        {isCollapsed && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            onClick={() => setIsCollapsed(false)}
            className="fixed bottom-20 right-4 md:bottom-24 md:right-6 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-full shadow-lg hover:shadow-xl z-[100] transition-all duration-200"
            style={{ width: '60px', height: '60px' }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-xs font-bold mb-0.5">Bước {currentStep}/5</span>
              <FiChevronUp className="h-5 w-5" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-0 md:bottom-4 left-0 right-0 mx-auto bg-white border border-gray-200 z-[100] shadow-xl rounded-lg w-[95%] sm:w-[85%] md:w-[75%] lg:w-[65%] max-w-4xl overflow-hidden"
            style={{ transform: 'translateX(0)' }}
          >
            <div className="bg-gradient-to-r from-gold-50 to-gold-100/50 px-4 py-2 border-b border-gold-200 relative">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-2 right-2 px-3 py-1.5 bg-gold-100 hover:bg-gold-200 rounded-full transition-all shadow-sm hover:shadow-md z-10 border border-gold-300 flex items-center gap-1.5"
                aria-label="Thu gọn"
              >
                <FiChevronDown className="h-4 w-4 text-gold-700" />
                <span className="text-xs font-medium text-gold-700 whitespace-nowrap">Thu gọn</span>
              </button>
              
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                <div className="flex items-center justify-between w-full pr-24">
                  <div className="flex items-center gap-1 md:gap-2 flex-1">
                    <FiCheckCircle className="h-4 w-4 md:h-5 md:w-5 text-gold-600 flex-shrink-0" />
                    <span className="text-[10px] md:text-sm font-medium text-gold-700">
                      Event
                    </span>
                  </div>
                  
                  <div className="h-0.5 w-4 md:w-12 mx-1 md:mx-2 bg-gold-500"></div>
                  
                  <div className="flex items-center gap-1 md:gap-2 flex-1">
                    <FiCheckCircle className="h-4 w-4 md:h-5 md:w-5 text-gold-600 flex-shrink-0" />
                    <span className="text-[10px] md:text-sm font-medium text-gold-700">
                      Combo
                    </span>
                  </div>
                  
                  <div className={`h-0.5 w-4 md:w-12 mx-1 md:mx-2 ${currentStep >= 3 ? 'bg-gold-500' : 'bg-gray-300'}`}></div>
                  
                  <div className="flex items-center gap-1 md:gap-2 flex-1">
                    {currentStep >= 3 ? (
                      <FiCheckCircle className="h-4 w-4 md:h-5 md:w-5 text-gold-600 flex-shrink-0" />
                    ) : (
                      <FiCircle className="h-4 w-4 md:h-5 md:w-5 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-[10px] md:text-sm font-medium ${currentStep >= 3 ? 'text-gold-700' : 'text-gray-400'}`}>
                      Ghế
                    </span>
                  </div>
                  
                  <div className={`h-0.5 w-4 md:w-12 mx-1 md:mx-2 ${currentStep >= 4 ? 'bg-gold-500' : 'bg-gray-300'}`}></div>
                  
                  <div className="flex items-center gap-1 md:gap-2 flex-1">
                    {currentStep >= 4 ? (
                      <FiCheckCircle className="h-4 w-4 md:h-5 md:w-5 text-gold-600 flex-shrink-0" />
                    ) : (
                      <FiCircle className="h-4 w-4 md:h-5 md:w-5 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-[10px] md:text-sm font-medium ${currentStep >= 4 ? 'text-gold-700' : 'text-gray-400'}`}>
                      Món
                    </span>
                  </div>
                  
                  <div className={`h-0.5 w-4 md:w-12 mx-1 md:mx-2 ${currentStep >= 5 ? 'bg-gold-500' : 'bg-gray-300'}`}></div>
                  
                  <div className="flex items-center gap-1 md:gap-2 flex-1">
                    {currentStep >= 5 ? (
                      <FiCheckCircle className="h-4 w-4 md:h-5 md:w-5 text-gold-600 flex-shrink-0" />
                    ) : (
                      <FiCircle className="h-4 w-4 md:h-5 md:w-5 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-[10px] md:text-sm font-medium ${currentStep >= 5 ? 'text-gold-700' : 'text-gray-400'}`}>
                      Xác nhận
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 md:px-6 py-3 md:py-4">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-center justify-between gap-3"
              >
                <div className="text-center md:text-left flex-1">
                  <div className="mb-1">
                    <span className="inline-block bg-gold-100 text-gold-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                      {content.badge}
                    </span>
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-1">
                    {content.title}
                  </h3>
                  {eventTitle && (
                    <p className="text-xs md:text-sm text-gray-600 mb-1">
                      <span className="text-gold-600 font-medium">{eventTitle}</span>
                    </p>
                  )}
                  {content.showTotal && totalAmount > 0 && (
                    <p className="text-xs md:text-sm text-gray-600 mb-2">
                      Tổng: <span className="font-bold text-gold-600">{formatCurrency(totalAmount)}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {content.description}
                  </p>
                  {additionalInfo && (
                    <p className="text-xs text-gray-500 mt-1">
                      {additionalInfo}
                    </p>
                  )}
                </div>
                
                {/* Show "Chọn món" button for step 4 */}
                {currentStep === 4 && onOpenItemSelection && (
                  <motion.button
                    onClick={onOpenItemSelection}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-6 py-3 text-sm md:text-base rounded-full font-semibold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                  >
                    Chọn món →
                  </motion.button>
                )}

                {/* Show custom continue button for other steps */}
                {showContinueButton && onContinue && currentStep !== 4 && (
                  <motion.button
                    onClick={onContinue}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-6 py-3 text-sm md:text-base rounded-full font-semibold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                  >
                    {continueButtonText} →
                  </motion.button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </React.Fragment>
  )
}
