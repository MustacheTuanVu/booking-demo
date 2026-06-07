"use client"
import BookingCalendarSection from "@/components/booking/BookingCalendarSection";
import BookingHeroCarousel from "@/components/BookingHeroCarousel";
import UpcomingEventsSection from "@/components/UpcomingEventsSection";
import { useSectionRefs } from "@/context/SectionContext";
import api from "@/utils/api";
import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Animate, AnimateGroup } from "@/components/ui/animate";
import JsonLd from "../JsonLd";
import { addDays, format, parse, subDays } from 'date-fns'
import "@/styles/animated-bg.css"

// Skeleton loading component for carousel
const CarouselSkeleton = () => (
  <div className="relative h-[70vh] sm:h-[75vh] md:h-[80vh] w-[95vw] sm:w-[90vw] lg:w-[80vw] mx-auto overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl top-8 bg-gray-200 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-t from-gray-300 to-gray-200"></div>
    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-10 z-20">
      <div className="p-4 rounded-md text-center sm:text-left">
        <div className="inline-block bg-gray-300 h-6 w-32 rounded-md mb-4 animate-pulse"></div>
        <div className="bg-gray-300 h-8 sm:h-12 w-3/4 rounded-md mb-2 animate-pulse"></div>
        <div className="bg-gray-300 h-4 w-full rounded-md mb-1 animate-pulse"></div>
        <div className="bg-gray-300 h-4 w-2/3 rounded-md mb-4 animate-pulse"></div>
        <div className="bg-gray-300 h-10 w-32 rounded-md animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Performance optimization: Separate component to handle ref code updates
const RefCodeHandler = ({ onRefCodeChange }: { onRefCodeChange: (refCode: string) => void }) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refValue = searchParams.get('ref');
    if (refValue) {
      onRefCodeChange(refValue);
    }
  }, [searchParams, onRefCodeChange]);

  return null;
};

// Optimized component for main content
const HomeContent = () => {
  const [eventList, setEventList] = useState([]);
  const [comboList, setComboList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [refCode, setRefCode] = useState('666');
  const [isLoading, setIsLoading] = useState(true);
  const [carouselLoaded, setCarouselLoaded] = useState(false);
  const searchParams = useSearchParams();
  const sectionRefs = useSectionRefs();

  // Memoized ref code handler to prevent unnecessary re-renders
  const handleRefCodeChange = useCallback((code: string) => {
    setRefCode(code);
  }, []);

  useEffect(() => {
    const refValue: any = searchParams.get('ref');
    if (refValue) {
      setRefCode(refValue);
    }
  }, [searchParams]);

  // Memoized date selector callback
  const handleDateSelect = useCallback((date: any) => {
    setSelectedDate(date);
  }, []);

  const getEventList = async () => {
    try {
      setIsLoading(true);
      // Optimize by making concurrent API calls
      const [eventResponse, comboResponse] = await Promise.all([
        api.get('/events/getEventByCondition?page=1&limit=999999'),
        api.get('/combo_event/GetByCondition?page=1&limit=999999&status=ACTIVE')
      ]);

      console.log('debug 111', eventResponse.data.events);

      setEventList(eventResponse.data.events);
      setComboList(comboResponse.data.combo);
      
      // Add small delay to ensure smooth loading transition
      setTimeout(() => {
        setIsLoading(false);
        setCarouselLoaded(true);
      }, 100);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getEventList();
  }, []);

  // Memoize the check for combo list to prevent unnecessary re-renders
  const hasComboList = useMemo(() => {
    const result = comboList && comboList.length > 0;
    return result;
  }, [comboList]);

  return (
    <section style={{ backgroundColor: 'var(--clr-bg)' }} className="relative">
      <h1 className="sr-only">Booking at Queen Acoustic</h1>
      
      {/* Carousel with skeleton loading */}
      {isLoading || !carouselLoaded ? (
        <CarouselSkeleton />
      ) : (
        <Animate variant="fade" delay={0.1} duration={0.6}>
          <BookingHeroCarousel events={eventList} onDateSelect={handleDateSelect} />
        </Animate>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          id="Lịch biểu diễn"
          ref={sectionRefs["Lịch biểu diễn"]}
          className="scroll-target pt-5 sm:pt-8 mb-10"
          style={{ minHeight: '200px' }} // Prevent layout shift
        >
          {hasComboList && carouselLoaded && (
            <Animate variant="slide-up" delay={0.2} threshold={0.05}>
              <BookingCalendarSection
                eventList={eventList}
                comboList={comboList}
                refCode={refCode}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </Animate>
          )}
        </div>
        <div
          id="Sự kiện tuần tới"
          ref={sectionRefs["Sự kiện tuần tới"]}
          className="scroll-target pt-5 sm:pt-8"
          style={{ minHeight: '300px' }} // Prevent layout shift
        >
          {carouselLoaded && (
            <Animate variant="slide-up" delay={0.3} threshold={0.05}>
              <UpcomingEventsSection
                eventType="Sự kiện tuần tới"
                eventList={eventList}
                onDateSelected={handleDateSelect}
              />
            </Animate>
          )}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const [eventList, setEventList] = useState<any[]>([]);

  // Fetch events for structured data
  useEffect(() => {
    const fetchEventsForSEO = async () => {
      try {
        const { eventApi } = await import('@/utils/eventApi');
        const events = await eventApi.getEventsForSEO(50);
        setEventList(events);
      } catch (error) {
        console.error("Failed to fetch events for SEO:", error);
      }
    };

    fetchEventsForSEO();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 animated-bg">
      <JsonLd events={eventList} />
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-10 h-10 border-4 border-gold-200 border-t-gold-500 rounded-full animate-spin"></div>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </main>
  );
}