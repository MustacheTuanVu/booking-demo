'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { getMediaUrl } from '@/utils/mediaUrl'
import { FiCalendar, FiClock, FiMapPin, FiChevronRight, FiInfo } from 'react-icons/fi'
import { endOfWeek, format, isWithinInterval, startOfWeek } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Animate, AnimateGroup } from "@/components/ui/animate";

export default function UpcomingEventsSection({ eventType, eventList, onDateSelected }: any) {
  // Memoize date range calculation
  const dateRange = useMemo(() => {
    // Get current UTC date
    const nowUTC = new Date();

    // Get current day of week in UTC (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeekUTC = nowUTC.getUTCDay();

    // Calculate days to subtract to get to current week's Monday
    const daysToCurrentMonday = dayOfWeekUTC === 0 ? 6 : dayOfWeekUTC - 1;

    // Calculate the date for next week's Monday (current Monday + 7 days)
    const nextMondayUTC = new Date(Date.UTC(
      nowUTC.getUTCFullYear(),
      nowUTC.getUTCMonth(),
      nowUTC.getUTCDate() - daysToCurrentMonday + 7, // Current Monday + 7 days
      0, 0, 0, 0 // Set to 00:00:00.000
    ));

    // Calculate next week's Sunday (next Monday + 6 days)
    const nextSundayUTC = new Date(Date.UTC(
      nextMondayUTC.getUTCFullYear(),
      nextMondayUTC.getUTCMonth(),
      nextMondayUTC.getUTCDate() + 6,
      23, 59, 59, 999 // Set to 23:59:59.999
    ));

    return {
      startOfNextWeek: nextMondayUTC,
      endOfNextWeek: nextSundayUTC
    };
  }, []);

  // Memoize filtered events to prevent recalculation on each render
  const { filteredEvents, featuredEvent, regularEvents } = useMemo(() => {
    // Early return if no events
    if (!eventList || eventList.length === 0) {
      return { filteredEvents: [], featuredEvent: null, regularEvents: [] };
    }

    const filtered = eventList.filter((event: { InfoShowTimes: { time_start: string | number | Date }[] }) => {
      if (!event.InfoShowTimes || !event.InfoShowTimes[0]) return false;

      const eventDate = new Date(event.InfoShowTimes[0].time_start);
      return isWithinInterval(eventDate, {
        start: dateRange.startOfNextWeek,
        end: dateRange.endOfNextWeek
      });
    });

    return {
      filteredEvents: filtered,
      featuredEvent: filtered.length > 0 ? filtered[0] : null,
      regularEvents: filtered.length > 1 ? filtered.slice(1, 6) : []
    };
  }, [eventList, dateRange]);

  // Initialize state based on regularEvents length
  const [showDesc, setShowDesc] = useState<Array<boolean>>(() =>
    new Array(regularEvents.length).fill(false)
  );

  const [isLongDesc, setIsLongDesc] = useState<Array<boolean>>(() =>
    new Array(regularEvents.length).fill(false)
  );

  const descriptionRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const prevLongDescRef = useRef<boolean[]>([]);

  // Update description ref array when regularEvents change
  useEffect(() => {
    descriptionRefs.current = descriptionRefs.current.slice(0, regularEvents.length);
  }, [regularEvents.length]);

  // Optimize the description length check with requestAnimationFrame
  useEffect(() => {
    if (!descriptionRefs.current.length) return;

    // Use requestAnimationFrame for better performance
    const checkDescriptionLengths = () => {
      const newIsLongDesc = descriptionRefs.current.map((descElement) => {
        if (!descElement) return false;
        const lineHeight = parseInt(window.getComputedStyle(descElement).lineHeight);
        const maxHeight = 2 * lineHeight;
        return descElement.scrollHeight > maxHeight;
      });

      // Only update state if values changed (avoid unnecessary rerenders)
      if (JSON.stringify(newIsLongDesc) !== JSON.stringify(prevLongDescRef.current)) {
        setIsLongDesc(newIsLongDesc);
        prevLongDescRef.current = newIsLongDesc;
      }
    };

    // Use RAF to ensure DOM measurements are accurate
    requestAnimationFrame(checkDescriptionLengths);
  }, [regularEvents]);

  // Handle toggle description with optimized update
  const handleToggleDesc = (index: number) => {
    setShowDesc(prevState => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  // Memoize handler functions - placed before any conditional returns
  const handleDateChange = useCallback((dateString: string) => {
    onDateSelected(dateString);
  }, [onDateSelected]);

  const handleScroll = useCallback((section: string) => {
    const sectionElement = document.getElementById(section);
    if (sectionElement) {
      sectionElement.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, []);

  // Combined handler for event action
  const handleEventAction = useCallback((eventDate: Date) => {
    const formattedDate = format(
      new Date(eventDate).getTime(),
      'yyyy-MM-dd',
      { locale: vi }
    );
    handleDateChange(formattedDate);
    handleScroll("Lịch biểu diễn");
  }, [handleDateChange, handleScroll]);

  // Nếu không có sự kiện thì trả về ngay (tránh lỗi khi lọc)
  if (!eventList || eventList.length === 0) {
    return null;
  }

  // Check if there are any upcoming events for next week
  const hasUpcomingEvents = filteredEvents && filteredEvents.length > 0;

  return (
    <section className="py-12 md:py-16 px-4 md:px-8 container mx-auto">
      <Animate variant="slide-up" delay={0.1}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 relative inline-block">
              {eventType}
              <span className="absolute -bottom-1 left-0 w-1/3 h-1 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full"></span>
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              {'Tất cả sự kiện tại Queen Acoustic'}
            </p>
          </div>

          <a
            href="#"
            className="inline-flex items-center mt-4 md:mt-0 text-gold-600 font-medium hover:text-gold-700 transition-colors group"
          >
            <span>{'Xem tất cả'}</span>
            <FiChevronRight className="ml-1 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </Animate>

      {/* No upcoming events message */}
      {!hasUpcomingEvents && (
        <Animate variant="fade" delay={0.2} duration={0.5}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10 text-center">
            <div className="flex flex-col items-center justify-center max-w-md mx-auto">
              <div className="rounded-full bg-gold-100 p-4 mb-6">
                <FiInfo className="h-8 w-8 text-gold-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                Không có sự kiện tuần tới
              </h3>
              <p className="text-gray-600 mb-6">
                Hiện tại chưa có sự kiện nào được lên lịch cho tuần tới. Vui lòng kiểm tra lại sau hoặc xem các sự kiện trong tuần này.
              </p>
              <button
                onClick={() => handleScroll("Lịch biểu diễn")}
                className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Xem lịch tuần này
              </button>
            </div>
          </div>
        </Animate>
      )}

      {/* Revised grid layout with better mobile/tablet breakpoints */}
      {hasUpcomingEvents && (
        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {/* Featured event */}
          {featuredEvent && (
            <Animate variant="fade" delay={0.2} duration={0.7}>
              <div className="mb-6 md:mb-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-1">
                  <div className="flex flex-col md:flex-row">
                    {/* Image takes full width on mobile, 50% on tablets and medium screens */}
                    <div className="relative w-full md:w-1/2 aspect-[16/10] md:aspect-auto md:min-h-[350px] overflow-hidden">
                      <Image
                        src={getMediaUrl(featuredEvent.banner)}
                        alt={featuredEvent.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white px-3 py-1 rounded-md text-sm font-medium shadow-md">
                        Sự kiện gần nhất
                      </div>
                    </div>

                    {/* Content area */}
                    <div className="p-5 md:p-6 lg:p-8 md:w-1/2 flex flex-col">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-gold-600 transition-colors">
                        {featuredEvent.title}
                      </h3>

                      <p className="text-gray-600 mb-4 md:mb-6">{featuredEvent.desc.replace(/<[^>]*>?/gm, '')}</p>

                      <div className="flex flex-col text-sm text-gray-500 gap-y-2 mb-6">
                        <div className="flex items-center">
                          <FiCalendar className="mr-2 h-4 w-4 text-gold-500" />
                          <span> {format(
                            new Date(featuredEvent?.InfoShowTimes[0].time_start).getTime(),
                            'EEE, dd MMMM, yyyy',
                            { locale: vi }
                          )}</span>
                        </div>
                        <div className="flex items-center">
                          <FiClock className="mr-2 h-4 w-4 text-gold-500" />
                          <span>{format(new Date(featuredEvent?.InfoShowTimes[0].time_start).getTime(), 'HH:mm')}</span>
                        </div>
                        <div className="flex items-center">
                          <FiMapPin className="mr-2 h-4 w-4 text-gold-500" />
                          <span>{featuredEvent.venue}</span>
                        </div>
                      </div>

                      <div className="mt-auto flex justify-between items-center">
                        <button
                          className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-4 md:px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                          onClick={() => handleEventAction(new Date(featuredEvent?.InfoShowTimes[0].time_start))}
                        >
                          {'Đặt chỗ ngay'}
                        </button>

                        <div
                          className="text-gold-600 font-medium hover:text-gold-700 cursor-pointer group inline-flex items-center"
                          onClick={() => handleEventAction(new Date(featuredEvent?.InfoShowTimes[0].time_start))}
                        >
                          <span>{'Xem thêm'}</span>
                          <FiChevronRight className="ml-1 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Animate>
          )}

          {/* Regular events - grid that works better on all screen sizes */}
          {regularEvents.length > 0 && (
            <AnimateGroup
              staggerDelay={0.1}
              childVariant="slide-up"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            >
              {regularEvents.map((event: any, index: number) => (
                <div
                  key={event._id || `event-${index}`}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-500 group h-full transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={getMediaUrl(event.banner)}
                      alt={event.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading={index < 2 ? "eager" : "lazy"}
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  <div className="p-4 md:p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gold-600 transition-colors">
                      {event.title}
                    </h3>

                    <div className="flex flex-col text-xs text-gray-500 gap-y-1 mb-3">
                      <div className="flex items-center">
                        <FiCalendar className="mr-2 h-3 w-3 text-gold-500" />
                        <span> {format(
                          new Date(event?.InfoShowTimes[0].time_start).getTime(),
                          'EEE, dd MMMM, yyyy',
                          { locale: vi }
                        )}</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="mr-2 h-3 w-3 text-gold-500" />
                        <span>{format(new Date(event?.InfoShowTimes[0].time_start).getTime(), 'HH:mm')}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p
                        ref={(el: HTMLParagraphElement | null) => {
                          descriptionRefs.current[index] = el;
                        }}
                        className={`text-sm text-gray-600 mb-2 transition-all duration-300 ease-out ${!showDesc[index] && isLongDesc[index] ? 'line-clamp-2' : ''}`
                        }
                      >
                        {event.desc.replace(/<[^>]*>?/gm, '')}
                      </p>

                      {/* Show the "Xem thêm" button if description is long and not expanded */}
                      {isLongDesc[index] && !showDesc[index] && (
                        <button
                          onClick={() => handleToggleDesc(index)}
                          className="text-sm font-medium text-gold-600 focus:outline-none transition-colors hover:text-gold-800"
                        >
                          {"Xem thêm " + ">>"}
                        </button>
                      )}

                      {/* Show the "Ẩn mô tả" button if description is expanded */}
                      {showDesc[index] && (
                        <button
                          onClick={() => handleToggleDesc(index)}
                          className="text-sm font-medium text-gold-600 focus:outline-none transition-colors hover:text-gold-800"
                        >
                          {"<< " + "Ẩn mô tả"}
                        </button>
                      )}
                    </div>

                    <div className="mt-auto pt-2 flex justify-between items-center">
                      <button
                        className="text-sm bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-3 py-1 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-sm"
                        onClick={() => handleEventAction(new Date(event?.InfoShowTimes[0].time_start))}
                      >
                        {'Đặt chỗ ngay'}
                      </button>

                      <div
                        className="text-sm text-gold-600 font-medium flex items-center hover:text-gold-700 cursor-pointer group"
                        onClick={() => handleEventAction(new Date(event?.InfoShowTimes[0].time_start))}
                      >
                        <span className="hidden sm:inline">{'Chi tiết'}</span>
                        <FiChevronRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </AnimateGroup>
          )}
        </div>
      )}
    </section >
  )
}
