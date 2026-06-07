'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { getMediaUrl } from '@/utils/mediaUrl'
import { FiMinus, FiPlus, FiInfo, FiList, FiEye } from 'react-icons/fi'
import { Combo } from '@/data/eventsData'
import { cn } from '@/lib/utils'
import DrinksMenu from './DrinksMenu'
import { motion, Variants } from 'framer-motion'
import { createPortal } from 'react-dom'

interface ComboCardProps {
  eventId: number
  combo: any
  quantity: number
  isRestrictedCombo: boolean
  availableDate?: string | null
  handleQuantityChange: (eventId: number, comboType: string, change: number) => void
  formatCurrency: (amount: number) => string
  isEventEnded?: boolean
  comboIndex?: number
  totalCombos?: number
}

export default function ComboCard({
  eventId,
  combo,
  quantity,
  isRestrictedCombo,
  availableDate,
  handleQuantityChange,
  formatCurrency,
  isEventEnded = false,
  comboIndex = 0,
  totalCombos = 0,
}: ComboCardProps) {
  // State to control menu popup visibility
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Function to extract the included items description
  const extractIncludedItems = (description: string) => {
    if (!description) return { mainDescription: '', includedItems: '' };
    
    // Remove the standard inclusion text from description if it exists
    const standardText = "Tất cả combo đều bao gồm 1 chỗ ngồi + 1 thức uống tùy chọn";
    let cleanDescription = description;
    
    if (description.includes(standardText)) {
      cleanDescription = description.replace(standardText, "").trim();
    }
    
    // Keep only the main description, without the standard text
    return { mainDescription: cleanDescription, includedItems: '' };
  };
  
  // Extract description parts
  const { mainDescription } = extractIncludedItems(combo.MenuOrder?.description || '');
  
  // Handle menu popup
  const handleOpenMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(true);
  };
  
  const handleCloseMenu = () => {
    setShowMenu(false);
  };
  
  const handleConfirmMenu = (quantities: {[itemId: string]: number}) => {
    setShowMenu(false);
  };

  // Determine if combo is featured based on price discount or other attributes
  const isFeatured = combo.price_origin && combo.price_origin > combo.price;
  
  // Determine if this is the middle combo - for odd numbers, it's the actual middle.
  // For even numbers, we'll mark the second item in the first half (index 1 for 4 items)
  const isMiddleCombo = totalCombos > 0 && (
    (totalCombos % 2 === 1 && comboIndex === Math.floor(totalCombos / 2)) || 
    (totalCombos % 2 === 0 && comboIndex === 1)
  );
  
  // Mark a combo as popular if it's the middle one or explicitly marked as popular
  const isPopular = combo.is_popular || 
                   (isMiddleCombo && !combo.is_popular) || 
                   (combo.MenuOrder?.DRINK?.length > 1 && combo.MenuOrder?.FOOD?.length > 1);
  
  // Framer Motion animation variants with fallbacks for environments without animation support
  const cardVariants: Variants = {
    initial: { 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)', 
    },
    hover: { 
      y: -8,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { type: 'spring', stiffness: 400, damping: 17 }
    },
    tap: { 
      y: -4,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      transition: { type: 'spring', stiffness: 400, damping: 10 }
    }
  };

  const bestSellerVariants: Variants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 400,
        damping: 10,
        delay: 0.1 
      }
    }
  };

  const quantityChangeAnimation = (newQuantity: number, prevQuantity: number) => {
    // No animation if quantities are the same
    if (newQuantity === prevQuantity) return {};
    
    // Increase animation
    if (newQuantity > prevQuantity) {
      return { 
        scale: [1, 1.25, 1],
        color: ['#b7791f', '#9f580a', '#b7791f'],
        transition: { duration: 0.4, ease: "easeOut" as const}
      };
    }
    
    // Decrease animation
    return { 
      scale: [1, 0.85, 1],
      transition: { duration: 0.3 }
    };
  };

  const buttonVariants: Variants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const featureBadgeVariants: Variants = {
    initial: { opacity: 0, x: 10 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { delay: 0.1, duration: 0.2 }
    }
  };

  const includesSectionVariants: Variants = {
    initial: { y: 10, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { delay: 0.15, duration: 0.25 }
    }
  };

  return (
    <motion.div
      className={cn(
        'border-2 rounded-xl overflow-hidden w-full relative hover:shadow-xl transition-shadow',
        isEventEnded
          ? 'border-red-200 bg-red-50/30'
          : isRestrictedCombo
            ? 'border-gold-300 bg-gray-50'
            : isPopular
              ? 'border-gold-500 bg-white ring-2 ring-gold-200'
              : 'border-gold-300 bg-white ring-2 ring-gray-100',
      )}
      initial="initial"
      whileHover={!isEventEnded && !isRestrictedCombo ? "hover" : "initial"}
      whileTap={!isEventEnded && !isRestrictedCombo ? "tap" : "initial"}
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ 
        default: { duration: 0.3 },
        backgroundColor: { duration: 0.2 }
      }}
    >
      {/* Best Seller Badge - Modern, premium design */}
      {!isEventEnded && isPopular && (
        <motion.div 
          className="absolute top-2 left-2 z-20"
          variants={bestSellerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gold-500 rounded-full blur-[2px] opacity-30 scale-110"></div>
            <div className="relative bg-gradient-to-br from-gold-400 to-gold-600 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 border border-gold-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold tracking-wide whitespace-nowrap text-xs">Best Seller</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="p-2 sm:p-4">
        <div className="flex flex-col items-center gap-3">
          {/* Image with layered effect - Add additional top padding on mobile */}
          <motion.div 
            className="relative aspect-[4/3] w-full md:aspect-square h-[200px] cursor-pointer overflow-hidden rounded-lg shadow-md transform -mx-1 mt-1 sm:-mt-2"
            style={{ transformStyle: 'preserve-3d' } as React.CSSProperties}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", bounce: 0.4 }}
            onClick={handleOpenMenu}
          >
           
            <Image
              src={getMediaUrl(combo.MenuOrder?.image)}
              alt={`${combo.name} Image`}
              fill
              className={cn(
                "w-full h-full rounded-md object-cover",
                isEventEnded && "opacity-60",
                isPopular && !isEventEnded && "ring-2 ring-gold-400"
              )}
            />
            
            {/* "Xem menu" indicator with animation */}
            <motion.div 
              className="absolute bottom-2 right-2 bg-gold-500/90 text-white text-xs px-3 py-2 rounded-full flex items-center gap-1.5 shadow-sm"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(197, 155, 63, 0.95)' }}
              animate={isHovered ? { y: [0, -2, 0], transition: { repeat: 1, duration: 1 } } : {}}
            >
              <FiEye className="h-4 w-4" />
              <span>Xem trước menu</span>
            </motion.div>
          </motion.div>

          {/* Combo details with layered effect */}
          <div className="flex-grow text-center w-full">
            {/* Enhanced combo name container with subtle background */}
            <div className={cn(
              "py-2.5 rounded-lg mb-2.5 relative overflow-hidden",
              isPopular && !isEventEnded 
                ? "bg-gradient-to-r from-gold-50/80 via-gold-100/50 to-gold-50/80 animate-shimmer" 
                : "bg-gray-50/30"
            )}>
              {/* Minimalistic premium decorative accents for popular combos */}
              {isPopular && !isEventEnded && (
                <>
                  {/* Elegant top border accent */}
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold-400/80 to-transparent"></div>
                  
                  {/* Subtle side accents */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-2/5 bg-gradient-to-b from-gold-300/30 to-transparent"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-2/5 bg-gradient-to-b from-gold-300/30 to-transparent"></div>
                  
                  {/* Bottom border accent */}
                  <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold-400/80 to-transparent"></div>
                  
                  {/* Refined minimal premium indicator */}
                  <div className="absolute top-1 right-1 h-3.5 w-3.5 opacity-80">
                    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                        fill="url(#goldGradient)" 
                        stroke="white" 
                        strokeWidth="0.3">
                      </path>
                      <defs>
                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#D4AF37" />
                          <stop offset="100%" stopColor="#C5A028" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </>
              )}
              
              <div className="flex items-center justify-center">
                <h6 className={cn(
                  "font-bold text-xl md:text-2xl leading-tight tracking-tight px-2.5 py-1 relative",
                  isEventEnded 
                    ? "text-gray-500" 
                    : "text-gold-600"
                )}>
                  {/* Premium visual container for popular combos */}
                  {isPopular && !isEventEnded && (
                    <div className="absolute inset-0 bg-gradient-to-b from-gold-100/20 to-gold-50/5 rounded-sm"></div>
                  )}
                  <span className={cn(
                    "relative z-10",
                    isPopular && !isEventEnded && "text-gold-700"
                  )}>
                    {combo.name}
                  </span>
                </h6>
              </div>
            </div>
            
            {/* Visual divider - simplified for cleaner look */}
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-gold-200 to-transparent mx-auto mb-3 opacity-60"></div>

            
            {/* Included items displayed with elevated styling */}
            <motion.div 
              className={cn(
                "text-sm mb-3 px-3 py-3 bg-white/80 rounded-md w-full text-left relative",
                isEventEnded ? "text-gray-500" : "text-gray-700"
              )}
              style={{ transformStyle: 'preserve-3d' } as React.CSSProperties}
              variants={includesSectionVariants}
              initial="initial"
              animate="animate"
            >
              
              {/* Main description with premium quote design */}
              {mainDescription && !isEventEnded && (
                <div className="relative mb-4 pl-4 pr-2.5 pt-3 pb-2.5 bg-white/60 rounded-r-md rounded-bl-md shadow-sm">
                  {/* Stylized left accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-gold-500 via-gold-400 to-gold-300 rounded-l-md"></div>
                  
                  {/* Subtle background accent */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gold-50/30 rounded-r-md rounded-bl-md"></div>
                  
                  {/* Opening quote mark */}
                  <svg className="absolute top-1.5 left-3 w-4 h-4 text-gold-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  
                  {/* Enhanced description text */}
                  <p className="relative text-gray-700 font-medium italic text-base leading-relaxed pl-4 pr-4 z-10">
                    {mainDescription}
                  </p>
                  
                  {/* Closing quote mark */}
                  <svg className="absolute bottom-1.5 right-2 w-4 h-4 text-gold-500 transform rotate-180" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
              )}
            </motion.div>
            
          </div>

          {/* Standard inclusions subtitle */}
          <div className="w-full mb-2 px-1">
            <div className="flex items-center justify-center">
              <p className="text-xs text-gray-500 italic px-3 py-1 bg-gray-50/80 rounded-full border border-gray-100/80 inline-flex items-center gap-1">
                <span className="text-gold-600 font-medium text-xs">✓</span> Đã bao gồm 1 phần nước tự chọn
              </p>
            </div>
          </div>

          {/* Pricing and quantity selector with animation */}
          <div className="w-full mt-2 px-1">
            {/* Visually connected price and quantity area */}
            <div className="flex items-center justify-between py-2 px-1 bg-gold-50/30 rounded-lg border border-gold-100/50">
              {/* Price section */}
              <div className="flex flex-col justify-center">
                {combo.price_origin && combo.price_origin > combo.price ? (
                  <div>
                    <span className={cn(
                      "block text-lg font-bold",
                      isEventEnded ? "text-gray-500" : "text-gold-600"
                    )}>
                      {formatCurrency(combo.price)}
                    </span>
                    <span className="block text-xs text-gray-500 line-through">
                      {formatCurrency(combo.price_origin)}
                    </span>
                  </div>
                ) : (
                  <span className={cn(
                    "text-lg font-bold",
                    isEventEnded ? "text-gray-500" : "text-gold-600"
                  )}>
                    {formatCurrency(combo.price)}
                  </span>
                )}
              </div>
              
              {/* Enhanced quantity selector with animations */}
              <div className={cn(
                "flex items-center rounded-full py-1 px-1.5 shadow-sm transition-all duration-200",
                isEventEnded || isRestrictedCombo
                  ? "bg-gray-100"
                  : "bg-white border border-gold-200 hover:shadow"
              )}>
                <motion.button
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150',
                    isEventEnded || isRestrictedCombo
                      ? 'text-gray-400 cursor-not-allowed'
                      : quantity === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gold-200/80 active:bg-gold-100',
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isEventEnded && !isRestrictedCombo && quantity > 0)
                      handleQuantityChange(eventId, combo.type, -1)
                  }}
                  disabled={isEventEnded || isRestrictedCombo || quantity === 0}
                  aria-label="Giảm số lượng"
                  variants={buttonVariants}
                  whileHover={!isEventEnded && !isRestrictedCombo && quantity > 0 ? "hover" : ""}
                  whileTap={!isEventEnded && !isRestrictedCombo && quantity > 0 ? "tap" : ""}
                >
                  <FiMinus className="h-4 w-4" />
                </motion.button>
                <motion.span
                  className={cn(
                    'w-8 h-8 flex items-center justify-center font-medium text-base',
                    isEventEnded ? 'text-gray-400' : isRestrictedCombo ? 'text-gray-400' : 'text-gold-700',
                  )}
                  key={quantity}
                  animate={quantityChangeAnimation(quantity, quantity > 0 ? quantity - 1 : 0)}
                >
                  {quantity}
                </motion.span>
                <motion.button
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150',
                    isEventEnded || isRestrictedCombo
                      ? 'text-gray-400 cursor-not-allowed'
                      : quantity >= 10
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gold-200/80 active:bg-gold-100',
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isEventEnded && !isRestrictedCombo && quantity < 10)
                      handleQuantityChange(eventId, combo.type, 1)
                  }}
                  disabled={isEventEnded || isRestrictedCombo || quantity >= 10}
                  aria-label="Tăng số lượng"
                  variants={buttonVariants}
                  whileHover={!isEventEnded && !isRestrictedCombo && quantity < 10 ? "hover" : ""}
                  whileTap={!isEventEnded && !isRestrictedCombo && quantity < 10 ? "tap" : ""}
                >
                  <FiPlus className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Restricted combo availability message */}
        {isRestrictedCombo && !isEventEnded && (
          <motion.div 
            className="mt-3 py-1.5 px-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="flex items-center gap-1">
              <FiInfo className="text-amber-500 h-4 w-4 flex-shrink-0" />
              <span>
                Combo {combo.name?.split(' ').pop() || ''} hiện chỉ dành cho thành viên hạng cao.{' '}
                <span className="font-medium">Mở bán từ {availableDate}, 12:00.</span>
              </span>
            </p>
          </motion.div>
        )}

        {/* Event ended message */}
        {isEventEnded && (
          <motion.div 
            className="mt-3 py-1.5 px-3 bg-red-50 border border-red-200 rounded text-sm text-red-700"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="flex items-center gap-1">
              <FiInfo className="text-red-500 h-4 w-4 flex-shrink-0" />
              <span>Sự kiện đã kết thúc, không thể đặt combo này.</span>
            </p>
          </motion.div>
        )}
      </div>
      
      {/* Menu Popup - Rendered with Portal to ensure it's outside the DOM hierarchy */}
      {showMenu && typeof window === 'object' && createPortal(
        <DrinksMenu
          onOpen={showMenu}
          onClose={handleCloseMenu}
          onConfirm={handleConfirmMenu}
          title={`Menu của ${combo.name || 'Combo'}`}
          isCombo={true}
          comboMenuOrder={combo.MenuOrder || { DRINK: [], FOOD: [] }}
          menuItems={[]}
          stepChoiceItem="DRINK"
          setStepChoiceItem={(item: string) => {
            console.log(`Selected item type: ${item}`);
          }}
          freeDrinkLimit={combo.size_drink || 0}
          freeFoodLimit={combo.size_food || 0}
          isPreviewMode={true}
        />,
        document.body
      )}
    </motion.div>
  )
}
