'use client'

import React, { useState, useEffect, useRef, useCallback, TouchEvent, KeyboardEvent, useMemo, useContext } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi'
import { useSectionRefs } from '@/context/SectionContext'
import { vi } from 'date-fns/locale'
import { endOfWeek, format, isWithinInterval, startOfWeek } from 'date-fns'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Animate } from '@/components/ui/animate'
import { AppContext } from '@/context/AppContext'
import { getMediaUrl } from '@/utils/mediaUrl'

// Simplified animation variants for better performance
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0.8,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'tween', duration: 0.3, ease: 'easeOut' },
      opacity: { duration: 0.2 }
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0.8,
    transition: {
      x: { type: 'tween', duration: 0.3, ease: 'easeOut' },
      opacity: { duration: 0.2 }
    },
  }),
};

// Simplified content variants
const contentVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.4,
      staggerChildren: 0.1,
      delayChildren: 0.2
    } 
  }
};

const childVariants: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

// Simplified image loading variants
const imageVariants: Variants = {
  initial: { opacity: 0 },
  loaded: { 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

export default function BookingHeroCarousel({ events, onDateSelect }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const { userInfo } = useContext(AppContext);

  // All state hooks
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHoveringControls, setIsHoveringControls] = useState<boolean>(false);
  const [slideDirection, setSlideDirection] = useState<number>(0);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imagesPreloaded, setImagesPreloaded] = useState<Set<string>>(new Set());
  
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchMoveX = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionRefs: any = useSectionRefs();

  // Constants
  const minSwipeDistance = 30;
  const autoplayInterval = 6000;

  // Memoize date calculations
  const dateRanges = useMemo(() => {
    const nowUTC = new Date();
    const dayOfWeekUTC = nowUTC.getUTCDay();
    const daysToSubtract = dayOfWeekUTC === 0 ? 6 : dayOfWeekUTC - 1;

    const startOfThisWeek = new Date(Date.UTC(
      nowUTC.getUTCFullYear(),
      nowUTC.getUTCMonth(),
      nowUTC.getUTCDate() - daysToSubtract,
      0, 0, 0, 0
    ));

    const endOfThisWeek = new Date(Date.UTC(
      nowUTC.getUTCFullYear(),
      nowUTC.getUTCMonth(),
      nowUTC.getUTCDate() + (6 - daysToSubtract),
      23, 59, 59, 999
    ));

    return { startOfThisWeek, endOfThisWeek };
  }, []);

  // Memoize filtered events calculation
  const reversedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    const filteredEvents = events.filter((event: { InfoShowTimes: { time_start: string | number | Date }[] }) => {
      if (!event.InfoShowTimes || !event.InfoShowTimes[0]) return false;
      const eventDate = new Date(event.InfoShowTimes[0].time_start);
      return isWithinInterval(eventDate, {
        start: dateRanges.startOfThisWeek,
        end: dateRanges.endOfThisWeek
      });
    });

    return [...filteredEvents].reverse();
  }, [events, dateRanges]);

  // Current active event
  const activeEvent = useMemo(() =>
    reversedEvents.length > 0 ? reversedEvents[activeSlide] : null,
  [reversedEvents, activeSlide]);

  // Optimized image preloading - only preload first image with priority
  useEffect(() => {
    if (reversedEvents.length === 0) {
      setIsLoading(false);
      return;
    }

    // Only preload the first image immediately
    const firstEvent = reversedEvents[0];
    if (firstEvent) {
      const img = new globalThis.Image();
      const imageSrc = getMediaUrl(firstEvent.banner);
      img.src = imageSrc;
      img.onload = () => {
        setImagesPreloaded(prev => new Set(prev).add(imageSrc));
        setIsLoading(false);
      };
      img.onerror = () => setIsLoading(false);

      // Lazy preload other images after a delay
      setTimeout(() => {
        reversedEvents.slice(1, 3).forEach(event => {
          const img = new globalThis.Image();
          const src = getMediaUrl(event.banner);
          img.src = src;
          img.onload = () => {
            setImagesPreloaded(prev => new Set(prev).add(src));
          };
        });
      }, 1000);
    } else {
      setIsLoading(false);
    }
  }, [reversedEvents]);

  // Reset image loaded state when slide changes
  useEffect(() => {
    setImageLoaded(false);
  }, [activeSlide]);

  // This function handles direct slide changes
  const goToSlide = useCallback(
    (newIndex: number) => {
      if (reversedEvents.length === 0) return;
      const direction = newIndex > activeSlide ? 1 : -1;
      if (activeSlide === reversedEvents.length - 1 && newIndex === 0) {
        setSlideDirection(1);
      } else if (activeSlide === 0 && newIndex === reversedEvents.length - 1) {
        setSlideDirection(-1);
      } else {
        setSlideDirection(direction);
      }
      setActiveSlide(newIndex);
    },
    [reversedEvents.length, activeSlide],
  );

  // Auto-rotate carousel - simplified
  useEffect(() => {
    if (reversedEvents.length === 0 || isHoveringControls || isLoading) return;

    const interval = setInterval(() => {
      if (reversedEvents.length > 0) {
        setSlideDirection(1);
        setActiveSlide(prev => (prev + 1) % reversedEvents.length);
      }
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [activeSlide, reversedEvents.length, isHoveringControls, isLoading]);

  // Navigation functions
  const nextSlide = useCallback(() => {
    if (reversedEvents.length === 0) return;
    setSlideDirection(1);
    setActiveSlide(prev => (prev + 1) % reversedEvents.length);
  }, [reversedEvents.length]);

  const prevSlide = useCallback(() => {
    if (reversedEvents.length === 0) return;
    setSlideDirection(-1);
    setActiveSlide(prev => (prev - 1 + reversedEvents.length) % reversedEvents.length);
  }, [reversedEvents.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (document.activeElement === carouselRef.current ||
          carouselRef.current?.contains(document.activeElement)) {
        if (e.key === 'ArrowLeft') {
          prevSlide();
        } else if (e.key === 'ArrowRight') {
          nextSlide();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch event handlers
  const onTouchStart = useCallback((e: TouchEvent) => {
    const touches = e.touches;
    if (touches && touches.length > 0) {
      touchStartX.current = touches[0]!.clientX;
      touchMoveX.current = touches[0]!.clientX;
      touchEndX.current = touches[0]!.clientX;
      isDragging.current = true;
      setIsHoveringControls(true);
    }
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    const touches = e.touches;
    if (touches && touches.length > 0 && isDragging.current && touchStartX.current !== null) {
      const currentX = touches[0]!.clientX;
      const diffX = Math.abs(currentX - touchStartX.current);

      if (diffX > 10) {
        e.preventDefault();
      }

      touchMoveX.current = currentX;
      touchEndX.current = currentX;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!isDragging.current || touchStartX.current === null || touchEndX.current === null) {
      isDragging.current = false;
      setIsHoveringControls(false);
      return;
    }

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
    touchMoveX.current = null;
    isDragging.current = false;

    setTimeout(() => {
      setIsHoveringControls(false);
    }, 1000);
  }, [nextSlide, prevSlide, minSwipeDistance]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  }, [prevSlide, nextSlide]);

  // Define handleScroll function
  const handleScroll = useCallback((section: string) => {
    const isHomePage = pathname === '/';

    if (!isHomePage) {
      router.push(`/#${section}`);
      return;
    }

    const sectionElement = document.getElementById(section);
    const sectionRefElement = sectionRefs[section]?.current;
    const eventsSection = document.getElementById("events-section");
    const targetElement = sectionElement || sectionRefElement;

    if (targetElement) {
      setTimeout(() => {
        const isMobile = window.innerWidth < 640;
        const yOffset = isMobile ? -50 : -80;
        const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
          top: y,
          behavior: "smooth"
        });

        if (isMobile) {
          targetElement.classList.add('scroll-highlight');
          setTimeout(() => {
            targetElement.classList.remove('scroll-highlight');
          }, 2000);
        }
      }, 200);
    } else if (eventsSection) {
      setTimeout(() => {
        const isMobile = window.innerWidth < 640;
        const yOffset = isMobile ? -30 : -60;
        const y = eventsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
          top: y,
          behavior: "smooth"
        });

        eventsSection.classList.add('scroll-highlight');
        setTimeout(() => {
          eventsSection.classList.remove('scroll-highlight');
        }, 2000);
      }, 200);
    }
  }, [pathname, router, sectionRefs]);

  const handleDateChange = useCallback((dateString: string) => {
    onDateSelect(dateString);
  }, [onDateSelect]);

  const handleBookCurrentEvent = useCallback(() => {
    // Check if user is logged in
    if (!userInfo) {
      router.push('/login');
      return;
    }

    if (!reversedEvents[activeSlide]?.InfoShowTimes?.[0]?.time_start) return;

    const eventDate = new Date(reversedEvents[activeSlide].InfoShowTimes[0].time_start);
    const adjustedDate = new Date(eventDate.getTime());
    const formattedDate = format(adjustedDate, 'yyyy-MM-dd', { locale: vi });

    handleDateChange(formattedDate);

    const eventToSelect = {
      date: formattedDate,
      title: activeEvent?.title,
      slug: activeEvent?.slug,
      timestamp: Date.now() // Add timestamp to trigger re-processing
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedEventInfo', JSON.stringify(eventToSelect));
    }

    handleScroll("Lịch biểu diễn");
  }, [reversedEvents, activeSlide, handleDateChange, activeEvent, handleScroll, userInfo, router]);

  // Early returns
  if (!events || events.length === 0) {
    return null;
  }

  if (reversedEvents.length === 0) {
    return null;
  }

  // Get current image source
  const currentImageSrc = getMediaUrl(activeEvent?.banner);

  return (
    <div
      ref={carouselRef}
      className="relative h-[70vh] sm:h-[75vh] md:h-[80vh] w-[95vw] sm:w-[90vw] lg:w-[80vw] mx-auto overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl top-8 focus:outline-none focus-visible:ring focus-visible:ring-gold-400"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Event carousel"
      role="region"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsHoveringControls(true)}
      onMouseLeave={() => setIsHoveringControls(false)}
      style={{ 
        aspectRatio: '16/9',
        minHeight: '400px' // Prevent layout shift
      }}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md z-50">
          <div className="w-14 h-14 rounded-full border-4 border-gold-200 border-t-gold-500 animate-spin mb-4"></div>
          <p className="text-white font-medium text-sm">Loading...</p>
        </div>
      )}

      {/* Progress indicator */}
      {!isHoveringControls && !isLoading && (
        <div
          className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-gold-400 to-gold-600 origin-left z-40 rounded-full mx-4"
          style={{
            width: `calc(100% - 2rem)`,
            animation: `progressBar ${autoplayInterval}ms linear infinite`
          }}
        />
      )}

      {/* Carousel content */}
      <div className="absolute inset-0">
        <AnimatePresence
          initial={false}
          custom={slideDirection}
          mode="wait"
        >
          <motion.div
            key={activeEvent?._id}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <div className="relative w-full h-full overflow-hidden">
              <motion.div
                className="w-full h-full"
                initial="initial"
                animate={imageLoaded ? "loaded" : "initial"}
                variants={imageVariants}
              >
                <Image
                  src={currentImageSrc}
                  alt={activeEvent?.title || 'Event image'}
                  fill
                  priority={activeSlide === 0} // Only first image gets priority
                  className="object-cover"
                  loading={activeSlide === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 95vw, (max-width: 1024px) 90vw, 80vw"
                  quality={activeSlide === 0 ? 85 : 75} // Lower quality for non-active slides
                  onLoad={() => setImageLoaded(true)}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </motion.div>
            </div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-70"></div>
            <div className="absolute bottom-0 left-0 right-0 h-[40%] sm:h-[35%] bg-gradient-to-t from-black/70 to-transparent z-10"></div>

            {/* Content */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-10 z-20"
              variants={contentVariants}
              initial="initial"
              animate="animate"
            >
              <div className="p-4 rounded-md text-center sm:text-left">
                <motion.div
                  className="inline-block bg-gold-500 text-white px-2 py-2 sm:px-3 rounded-md text-[10px] sm:text-sm font-medium md:mb-4 mb-2"
                  variants={childVariants}
                >
                  {activeEvent?.InfoShowTimes?.[0]?.time_start &&
                    format(
                      new Date(activeEvent.InfoShowTimes[0].time_start).getTime(),
                      "HH:mm, EEE 'ngày' dd MMMM, yyyy",
                      { locale: vi }
                    )
                  }
                </motion.div>

                <motion.h2
                  className="text-sm sm:text-3xl lg:text-5xl font-bold my-2 text-white tracking-tight"
                  variants={childVariants}
                >
                  {activeEvent?.title}
                </motion.h2>

                <motion.p
                  className="text-[12px] sm:text-sm lg:text-lg sm:mb-3 mb-1 text-gray-100 line-clamp-3 max-w-3xl"
                  variants={childVariants}
                >
                  {activeEvent?.desc?.replace(/<[^>]*>?/gm, '')}
                </motion.p>

                <motion.p
                  className="text-[12px] sm:text-sm md:text-lg sm:mb-5 mb-1 text-gold-200 font-medium"
                  variants={childVariants}
                >
                  {activeEvent?.show_artists === false ? (
                    // Ẩn ca sĩ: chỉ hiển thị custom text không có label
                    activeEvent?.custom_artists_text || 'N/A'
                  ) : (
                    // Hiện ca sĩ: có label "Ca sĩ:"
                    <>
                      <span className="font-bold">Ca sĩ:</span>{' '}
                      {activeEvent?.InfoContents?.flatMap((content: any) => content.InfoArtist || []).map((artist: any) => artist.name).join(', ')}
                    </>
                  )}
                </motion.p>

                {/* Mobile CTA */}
                <motion.div
                  className="sm:hidden"
                  variants={childVariants}
                >
                  <Button
                    className="bg-gold-500 hover:bg-gold-600 text-white text-base font-medium py-3 px-6 rounded-md w-[80%]"
                    onClick={handleBookCurrentEvent}
                    aria-label={`Đặt chỗ ngay cho sự kiện: ${activeEvent?.title}`}
                  >
                    <FiCalendar className="h-5 w-5 inline-block mr-2.5" />
                    <span>{'Đặt chỗ ngay'}</span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls */}
      <div className="absolute inset-y-0 left-0 flex items-center z-30">
        <Button
          onClick={prevSlide}
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-black/40 border-gold-500/10 hover:bg-gold-500/90 text-white ml-2 sm:ml-4"
          aria-label="Previous slide"
        >
          <FiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </Button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center z-30">
        <Button
          onClick={nextSlide}
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-black/40 border-gold-500/10 hover:bg-gold-500/90 text-white mr-2 sm:mr-4"
          aria-label="Next slide"
        >
          <FiChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </Button>
      </div>

      {/* Desktop CTA */}
      <div className="hidden sm:flex absolute bottom-4 sm:bottom-5 md:bottom-6 right-4 sm:right-5 md:right-6 z-30">
        <Button
          className="bg-gold-500 hover:bg-gold-600 text-white text-xs sm:text-sm md:text-base py-0.5 sm:py-1.5 px-3 sm:px-4 md:px-6 h-8 sm:h-10 md:h-12 flex items-center gap-1.5 md:gap-2.5 rounded-md"
          onClick={handleBookCurrentEvent}
          aria-label={`Đặt chỗ ngay cho sự kiện: ${activeEvent?.title}`}
        >
          <FiCalendar className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 md:h-5.5 md:w-5.5" />
          <span>{'Đặt chỗ ngay'}</span>
        </Button>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-20 left-0 right-0 z-30 hidden sm:block">
        <div className="flex justify-center gap-1.5 sm:gap-2.5">
          {reversedEvents.map((_: any, index: any) => (
            <button
              key={`indicator-${index}`}
              onClick={() => {
                if (index !== activeSlide) {
                  goToSlide(index);
                }
              }}
              className={`rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                activeSlide === index
                  ? 'h-2 md:h-3 w-8 md:w-10 bg-gradient-to-r from-gold-400 to-gold-600'
                  : 'h-2 md:h-3 w-2 md:w-3 bg-white/60 hover:bg-gold-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={activeSlide === index ? 'true' : 'false'}
            ></button>
          ))}
        </div>
      </div>
    </div>
  )
}
