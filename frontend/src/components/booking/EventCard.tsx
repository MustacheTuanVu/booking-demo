'use client'

import React, { useContext, useEffect, useRef } from 'react'
import Image from 'next/image'
import { FiCalendar, FiClock, FiMusic, FiUsers, FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { AppContext } from '@/context/AppContext'
import { getMediaUrl } from '@/utils/mediaUrl'

// Ideally, replace "any" with a proper Event type. TODO for backend.
interface EventCardProps {
  event: any
  expanded: boolean
  toggleExpansion: (eventId: number) => void
  hasSelectedCombos?: boolean
}

// Helper to check if an event has ended, accounting for timezone
const hasEventEnded = (timeEnd: string): boolean => {
  if (!timeEnd) return false;
  
  // The time_end is already adjusted in BookingCalendarSection
  const endDate = new Date(timeEnd);
  const now = new Date();
  
  return endDate < now;
};

export default function EventCard({ event, expanded, toggleExpansion, hasSelectedCombos = false }: EventCardProps) {
  const { saveEventSelected } = useContext(AppContext);
  const cardRef = useRef<HTMLDivElement>(null);
  const expandedContentRef = useRef<HTMLDivElement>(null);

  // Parse performers - handle both string and array, split by comma if needed
  const performers = React.useMemo(() => {
    if (!event.performer) return [];
    if (Array.isArray(event.performer)) return event.performer;
    return event.performer.split(',').map((p: string) => p.trim()).filter(Boolean);
  }, [event.performer]);

  // Status text based on event status and end time
  const statusText = hasEventEnded(event.time_end)
    ? 'Đã kết thúc'
    : event.status === 'available'
      ? 'Còn chỗ'
      : event.status === 'limited'
        ? 'Sắp hết'
        : 'Hết chỗ';

  // Status classes based on event status and end time - larger on desktop
  const statusClasses = cn(
    'md:hidden absolute top-3 right-3 z-20 text-xs font-medium px-2 py-1 rounded-full shadow-md backdrop-blur-sm',
    hasEventEnded(event.time_end)
      ? 'bg-red-100/90 text-red-800 border border-red-200' 
      : event.status === 'available'
        ? 'bg-green-100/90 text-green-800 border border-green-200'
        : event.status === 'limited'
          ? 'bg-amber-100/90 text-amber-800 border border-amber-200'
          : 'bg-red-100/90 text-red-800 border border-red-200',
  );

  // Status classes for desktop - inline with title
  const statusClassesDesktop = cn(
    'hidden md:inline-flex ml-2 items-center text-sm font-medium px-3 py-0.5 rounded-full shadow-sm backdrop-blur-sm self-start mt-0.5',
    hasEventEnded(event.time_end)
      ? 'bg-red-100/90 text-red-800 border border-red-200' 
      : event.status === 'available'
        ? 'bg-green-100/90 text-green-800 border border-green-200'
        : event.status === 'limited'
          ? 'bg-amber-100/90 text-amber-800 border border-amber-200'
          : 'bg-red-100/90 text-red-800 border border-red-200',
  );

  // Selected badge classes - also larger on desktop
  const selectedBadgeClasses = "absolute top-3 md:top-4 left-3 md:left-4 z-20 inline-flex items-center px-2 py-1 md:px-3 md:py-2 bg-gold-100/90 text-gold-800 text-xs md:text-sm font-medium rounded-full shadow-md backdrop-blur-sm border border-gold-200";
  
  // Format the description for better presentation
  const formattedDescription = event.desc?.replace(/<[^>]*>?/gm, '') || '';
  
  // Format date for mobile/desktop
  const formattedDateShort = format(new Date(event.date!), 'dd/MM/yyyy', { locale: vi });
  const formattedDateFull = format(new Date(event.date!), 'EEEE, dd MMMM, yyyy', { locale: vi });
  
  // Handle card expansion with improved scrolling
  const handleToggleExpansion = () => {
    if (!expanded) { // Currently closed, will be opened
      saveEventSelected(event);
      toggleExpansion(event.id);
      
      // Set a small timeout to allow the DOM to update
      setTimeout(() => {
        if (expandedContentRef.current) {
          // Calculate scroll position to better show the combo cards
          const yOffset = window.innerWidth <= 768 ? -100 : -120;
          const scrollTarget = expandedContentRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          
          window.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else { // Currently open, will be closed
      saveEventSelected(null);
      toggleExpansion(event.id);
    }
  };

  // Handle scroll to calendar
  const handleScrollToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card toggle
    
    // Try multiple possible calendar section identifiers
    const calendarSection = document.querySelector('[class*="py-10"]') || 
                           document.querySelector('section') ||
                           document.getElementById('calendar-section');
    
    if (calendarSection) {
      const isMobileView = window.innerWidth <= 768;
      const yOffset = isMobileView ? -80 : -100;
      const y = calendarSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    } else {
      // Fallback: scroll to top of page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <div className="transition-all duration-300 overflow-hidden rounded-xl shadow-md hover:shadow-lg" ref={cardRef}>
      <div
        onClick={handleToggleExpansion}
        className={cn(
          'transition-colors cursor-pointer relative aspect-[16/9]', 
          expanded && 'bg-gray-50/10',
          hasSelectedCombos && !expanded && 'ring-2 ring-gold-400',
        )}
      >
        {/* Full-sized Image */}
        <div className="absolute inset-0 w-full h-full">
          {/* Banner Image with priority loading */}
          <Image
            src={getMediaUrl(event.banner)}
            alt={event.title}
            width={1000}
            height={562}
            className="w-full h-full object-contain bg-black"
            priority
            unoptimized
          />
          
          {/* Gradient overlay - stronger on mobile for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10 md:from-black/80 md:via-black/30 md:to-transparent pointer-events-none"></div>
        </div>
        
        {/* Content overlaid on the image */}
        <div className="relative h-full flex flex-col justify-between z-10">
          {/* Top badge area */}
          <div className="flex justify-end">
            {/* Status Badge */}
            {event.status && (
              <span className={statusClasses}>
                {statusText}
              </span>
            )}

            {/* Selected Badge */}
            {hasSelectedCombos && (
              <span className={selectedBadgeClasses}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Đã chọn
              </span>
            )}
          </div>
          
          {/* Bottom content area - mobile vs desktop differences */}
          <div className="p-3 md:p-4 mt-auto w-full">
            {!expanded && (
              <>
                {/* Event title */}
                <div className="flex items-center mb-1 md:mb-2">
                  <h3 className="font-semibold text-lg md:text-xl text-white drop-shadow-md">{event.title}</h3>
                  {/* Status Badge - Desktop version (next to title) */}
                  {event.status && (
                    <span className={statusClassesDesktop}>
                      {statusText}
                    </span>
                  )}
                </div>
                
                {/* Event details - Mobile version (compact badge-style layout) */}
                <div className="flex md:hidden flex-wrap gap-2 mb-3">
                  <div className="inline-flex items-center px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white/90">
                    <FiCalendar className="h-3 w-3 text-gold-300 mr-1 flex-shrink-0" />
                    <span className="text-xs">{formattedDateShort}</span>
                  </div>
                  <div className="inline-flex items-center px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white/90">
                    <FiClock className="h-3 w-3 text-gold-300 mr-1 flex-shrink-0" />
                    <span className="text-xs">{event.time}</span>
                  </div>
                  {event.show_artists !== false ? (
                    performers.map((performer: string, index: number) => (
                      <div key={index} className="inline-flex items-center px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white/90">
                        <FiUsers className="h-3 w-3 text-gold-300 mr-1 flex-shrink-0" />
                        <span className="text-xs">{performer}</span>
                      </div>
                    ))
                  ) : (
                    // Khi ẩn ca sĩ: vẫn có badge nhưng KHÔNG có icon
                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white/90">
                      <span className="text-xs">{performers[0] || 'N/A'}</span>
                    </div>
                  )}
                </div>
                
                {/* Event details - Desktop version (horizontal layout) */}
                <div className="hidden md:flex flex-wrap gap-x-4 gap-y-1 mb-3 text-white/90">
                  <div className="flex items-center gap-1">
                    <FiCalendar className="h-4 w-4 text-gold-300 flex-shrink-0" />
                    <span className="text-sm">{formattedDateShort}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock className="h-4 w-4 text-gold-300 flex-shrink-0" />
                    <span className="text-sm">{event.time}</span>
                  </div>
                  {event.show_artists !== false ? (
                    performers.map((performer: string, index: number) => (
                      <div key={index} className="flex items-center gap-1">
                        <FiUsers className="h-4 w-4 text-gold-300 flex-shrink-0" />
                        <span className="text-sm">{performer}</span>
                      </div>
                    ))
                  ) : (
                    // Khi ẩn ca sĩ: vẫn có cùng style nhưng KHÔNG có icon
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{performers[0] || 'N/A'}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <FiMusic className="h-4 w-4 text-gold-300 flex-shrink-0" />
                    <span className="text-sm">{event.genre}</span>
                  </div>
                </div>
                
                {/* Short description - only on desktop, mobile is too cramped */}
                {formattedDescription && (
                  <div className="hidden md:block mb-4 line-clamp-2 text-sm text-white/80 max-w-[90%]">
                    <div className="inline-flex items-center">
                      <FiInfo className="h-4 w-4 text-gold-300 mr-1 flex-shrink-0" />
                      <span>{formattedDescription}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Centered Button Container - Vertical Layout */}
            <div className="flex flex-col items-center w-full gap-2">
              {/* Show more events button - always visible, positioned on top */}
              <button 
                onClick={handleScrollToCalendar}
                className="flex items-center gap-2 text-gold-800 font-medium text-xs md:text-sm bg-gold-100/90 hover:bg-gold-200/90 transition-colors rounded-full px-3 py-1.5 md:px-4 md:py-2 focus:outline-none focus:ring-2 focus:ring-gold-300 shadow-md backdrop-blur-sm"
                aria-label="Scroll to calendar"
              >
                <FiCalendar className="h-4 w-4 md:h-5 md:w-5" />
                <span>Xem thêm show diễn</span>
              </button>
              
              {/* Toggle expand/collapse button */}
              <button 
                className="flex items-center gap-2 text-gold-800 font-medium text-xs md:text-sm bg-gold-100/90 hover:bg-gold-200/90 transition-colors rounded-full px-3 py-1.5 md:px-4 md:py-2 focus:outline-none focus:ring-2 focus:ring-gold-300 shadow-md backdrop-blur-sm"
                aria-expanded={expanded}
                aria-controls={`event-${event.id}`}
              >
                <span>{expanded ? 'Thu gọn' : 'Xem chi tiết các gói combo'}</span>
                {expanded ? <FiChevronUp className="h-4 w-4 md:h-5 md:w-5" /> : <FiChevronDown className="h-4 w-4 md:h-5 md:w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded content section */}
      {expanded && (
        <div
          id={`event-${event.id}`}
          className="bg-white border-t border-gray-200"
          ref={expandedContentRef}
        >
          {/* Detailed event information */}
          <div className="p-4">
            {/* Event Title in expanded view */}
            <div className="flex items-center mb-3">
              <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
              {/* Status Badge - For expanded view */}
              {event.status && (
                <span className={statusClassesDesktop}>
                  {statusText}
                </span>
              )}
            </div>
            
            {/* Expanded Details View with labeled sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
              <div className="flex items-start gap-2">
                <FiCalendar className="h-4 w-4 text-gold-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-700">Ngày</div>
                  <div>{formattedDateFull}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FiClock className="h-4 w-4 text-gold-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-700">Thời gian</div>
                  <div>{event.time}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FiMusic className="h-4 w-4 text-gold-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-700">Thể loại</div>
                  <div>{event.genre}</div>
                </div>
              </div>
              {/* Performer section - chỉ hiện label và icon khi show_artists = true */}
              {event.show_artists !== false ? (
                <div className="flex items-start gap-2">
                  <FiUsers className="h-4 w-4 text-gold-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-700">Nghệ sĩ</div>
                    <div className="flex flex-wrap gap-2">
                      {performers.map((performer: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-1 bg-gold-50 text-gold-800 text-sm rounded-full border border-gold-200">
                          {performer}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Khi ẩn ca sĩ: vẫn có badge nhưng KHÔNG có label "Nghệ sĩ" và icon
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 bg-gold-50 text-gold-800 text-sm rounded-full border border-gold-200">
                    {performers[0] || 'N/A'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Full Description */}
            {formattedDescription && (
              <div className="flex items-start gap-2 text-sm text-gray-700 border-t border-gray-100 pt-3">
                <FiInfo className="h-4 w-4 text-gold-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-700 mb-1">Chi tiết chương trình</div>
                  <p>{formattedDescription}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
