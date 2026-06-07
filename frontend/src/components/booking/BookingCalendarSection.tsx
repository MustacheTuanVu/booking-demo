'use client'

import React, { useContext, useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { addDays, format, parse, subDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import CalendarSection from './CalendarSection'
import StickyTotalWidget from './StickyTotalWidget'
import EventCard from './EventCard'
import ComboCard from './ComboCard'
import { FiInfo, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { AppContext } from '@/context/AppContext'
import { useMediaQuery, useTheme } from '@mui/material'
import api from '@/utils/api'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimateGroup } from '@/components/ui/animate'
import { getMediaUrl } from '@/utils/mediaUrl'

// Helper function to check if an event has ended - memoized version
const isEventEnded = (timeEnd: string): boolean => {
  if (!timeEnd) return false;

  // The timeEnd is already adjusted in the convertAPIDataToClientData function
  const endDate = new Date(timeEnd);
  const now = new Date();

  return endDate < now;
};

// Memoized conversion function - used for event data transformation
const convertAPIDataToClientData = (eventData: any, comboList: any, shouldShowFreeCombos: boolean) => {
  if (!eventData || !Array.isArray(eventData) || eventData.length === 0) {
    return { formattedEvents: {}, formattedArtists: [] };
  }

  const formattedEvents: any = {};
  const artistMap: any = {};
  let idCounter = 1;

  // Calculate yesterday's date at 00:00:00 for filtering
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  eventData.forEach((event: any) => {
    if (!event.InfoShowTimes || !Array.isArray(event.InfoShowTimes)) return;

    event.InfoShowTimes.forEach((show: any) => {
      if (!show || !show.time_start) return;

      // Check if show time is from yesterday onwards
      const showDate = new Date(show.time_start);
      if (showDate < yesterday) return; // Skip shows before yesterday

      const date = show.time_start.split('T')[0];
      const timeObj = new Date(show.time_start);
      const adjustedTime = new Date(timeObj.getTime());
      const time = adjustedTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      // Also adjust time_end to be consistent with time_start
      let timeEnd = show.time_end;
      if (timeEnd) {
        const timeEndObj = new Date(timeEnd);
        timeEnd = new Date(timeEndObj.getTime()).toISOString();
      }

      if (!event.InfoContents || !Array.isArray(event.InfoContents)) return;

      // Check if event wants to hide artists
      const shouldShowArtists = event.show_artists !== false;
      
      // Determine performer text based on show_artists flag
      let performerText = '';
      
      if (shouldShowArtists) {
        // Thu thập TẤT CẢ nghệ sĩ từ TẤT CẢ InfoContents
        const allArtistsFromAllContents: any[] = [];
        
        event.InfoContents.forEach((content: any) => {
          if (content.InfoArtist && Array.isArray(content.InfoArtist) && content.InfoArtist.length > 0) {
            // Thêm tất cả nghệ sĩ từ content này vào mảng tổng
            content.InfoArtist.forEach((artist: any) => {
              if (artist && artist.name) {
                allArtistsFromAllContents.push(artist);
              }
            });
          }
        });

        // Nếu không có nghệ sĩ nào, bỏ qua event này
        if (allArtistsFromAllContents.length === 0) {
          console.log('⚠️ Event bị skip vì không có nghệ sĩ:', event.title, 'InfoContents:', event.InfoContents);
          return;
        }

        // Nối tên tất cả nghệ sĩ bằng dấu phẩy
        performerText = allArtistsFromAllContents.map((artist: any) => artist.name).join(', ');

        // Thêm tất cả nghệ sĩ vào artistMap (CHỈ khi show_artists = true)
        allArtistsFromAllContents.forEach((artist: any) => {
          if (!artistMap[artist._id]) {
            artistMap[artist._id] = {
              id: Object.keys(artistMap).length + 1,
              name: artist.name,
              image: artist.image,
              performances: []
            };
          }

          if (!artistMap[artist._id].performances.includes(date)) {
            artistMap[artist._id].performances.push(date);
          }
        });
      } else {
        // Event ẩn ca sĩ → dùng custom text
        performerText = event.custom_artists_text || 'N/A';
      }

      // Tạo mảng date nếu chưa tồn tại
      if (!formattedEvents[date]) {
        formattedEvents[date] = [];
      }

      const filteredCombos = comboList ? formatCombos(comboList, shouldShowFreeCombos) : [];

      // Chỉ tạo 1 event object duy nhất cho event + showtime này
      formattedEvents[date].push({
        id: idCounter++,
        time: time,
        time_end: timeEnd,
        title: event.title,
        performer: performerText, // Tên ca sĩ hoặc custom text tùy theo show_artists flag
        show_artists: shouldShowArtists, // Thêm flag để component biết có hiện label "Nghệ sĩ" không
        status: 'available',
        genre: 'Music',
        banner: event.banner,
        slug: event.slug,
        desc: event.desc,
        combos: filteredCombos || [],
      });
    });
  });

  const formattedArtists = Object.values(artistMap);

  return { formattedEvents, formattedArtists };
};

// Memoized function to validate guest status
const isValidGuest = (userInfo: any) => {
  if (!userInfo || !userInfo.guest || !userInfo.guest.is_guest) {
    return false;
  }

  // Check if expiry date is valid and in the future
  if (userInfo.guest.expiry && userInfo.guest.expiry) {
    const expiryDate = new Date(userInfo.guest.expiry);
    const currentDate = new Date();
    return expiryDate > currentDate;
  }

  return false;
};

// Function to format combo data from the new backend structure
const formatCombos = (combos: any[], shouldShowFreeCombos: boolean) => {
  if (!combos || !Array.isArray(combos)) return [];

  return combos
    .filter(combo => shouldShowFreeCombos || combo.price !== 0)
    .map(combo => {
      // Get first drink and food items if they exist
      const firstDrink = combo.MenuOrder?.DRINK?.[0];
      const firstFood = combo.MenuOrder?.FOOD?.[0];

      // Create description from food and drink items
      let description = 'Bao gồm: ';
      if (firstDrink) {
        description += `${combo.size_drink} ${firstDrink.name}`;
      }
      if (firstFood) {
        description += firstDrink ? ` + ${combo.size_food} ${firstFood.name}` : `${combo.size_food} ${firstFood.name}`;
      }

      return {
        _id: combo._id,
        type: combo.name.split(' ')[1] || 'A', // Extract type from name (e.g., "Combo A" -> "A")
        name: combo.name,
        description: description,
        price: combo.price,
        price_origin: combo.price_origin,
        menu_id: combo.menu_id,
        is_show_upsell: combo.is_show_upsell ? true : false,
        // Additional new fields
        size_seat: combo.size_seat,
        size_food: combo.size_food,
        size_drink: combo.size_drink,
        MenuOrder: combo.MenuOrder,
      };
    });
};

export default function BookingCalendarSection({ eventList, comboList, refCode, selectedDate, setSelectedDate }: any) {
  const { userInfo, saveEventSelected, eventSelected } = useContext(AppContext);
  const router = useRouter();
  const theme = useTheme();
  const isSMUp = useMediaQuery(theme.breakpoints.up("xs"));

  // All states grouped together at the top
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [isShowTotal, setIsShowTotal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // const [selectedDate, setSelectedDate] = useState(() =>
  //   selectedDateBaner ? format(new Date(selectedDateBaner), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  // );
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [manuallyCollapsed, setManuallyCollapsed] = useState<Set<number>>(new Set());
  const [highlightSection, setHighlightSection] = useState<boolean>(false);
  const [bannerClickTimestamp, setBannerClickTimestamp] = useState<number | null>(null);

  // Refs
  const eventsRef = useRef<HTMLDivElement>(null);
  const calendarSectionRef = useRef<HTMLDivElement>(null);
  const demoEventsRef = useRef<any>({});

  // Memoize expensive calculations
  const shouldShowFreeCombos = useMemo(() => isValidGuest(userInfo), [userInfo]);

  // Memoize processed event list to prevent recalculation on each render
  const processedEventList = useMemo(() => {
    if (!eventList || !Array.isArray(eventList)) return [];

    return eventList.map((event: any) => {
      if (event.combos) {
        return {
          ...event,
          combos: formatCombos(event.combos, shouldShowFreeCombos)
        };
      }
      return event;
    });
  }, [eventList, shouldShowFreeCombos]);

  // Memoize the entire data conversion which is an expensive operation
  const { DEMO_EVENTS, FEATURED_ARTISTS } = useMemo(() => {
    const converted = convertAPIDataToClientData(processedEventList, comboList, shouldShowFreeCombos);
    // Update the ref with the latest events data for use in effects
    demoEventsRef.current = converted.formattedEvents;
    return {
      DEMO_EVENTS: converted.formattedEvents,
      FEATURED_ARTISTS: converted.formattedArtists
    };
  }, [processedEventList, comboList, shouldShowFreeCombos]);

  // API call wrapped in useCallback to prevent recreation on each render
  const getEventDetails = useCallback(async () => {
    try {
      if (!eventSelected || !eventSelected.slug) return null;

      const eventResponse = await api.get('/events/getDetailEventBySlug' + '?slug=' + eventSelected.slug);
      return eventResponse.data || null;
    } catch (error) {
      console.error('Failed to fetch event details:', error);
      return null;
    }
  }, [eventSelected]);

  // Effect to fetch event details when selected event changes
  useEffect(() => {
    if (!eventSelected) {
      setEventDetails(null);
      return;
    }

    const fetchEventDetails = async () => {
      const details = await getEventDetails();
      setEventDetails(details);
    };

    fetchEventDetails();
  }, [eventSelected, getEventDetails]);

  // Month navigation callbacks
  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  }, []);

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  }, []);

  // Generate calendar days - memoized to prevent recalculation
  const monthDays = useMemo(() => {
    const generateMonthDays = (selectedMonth = new Date()) => {
      const today = new Date();
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      const days = [];

      const firstDayOfWeek = start.getDay();

      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const prevDay = subDays(start, i + 1);
        const isPastDate = prevDay < today;
        days.push({
          date: prevDay,
          dateString: format(prevDay, 'yyyy-MM-dd'),
          day: format(prevDay, 'd'),
          weekday: format(prevDay, 'EEE', { locale: vi }),
          isToday: false,
          isOtherMonth: true,
          isHidden: true,
          isPastDate: isPastDate,
        });
      }

      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        const isPastDate = currentDate < today && format(currentDate, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd');
        days.push({
          date: new Date(currentDate),
          dateString: format(currentDate, 'yyyy-MM-dd'),
          day: format(currentDate, 'd'),
          weekday: format(currentDate, 'EEE', { locale: vi }),
          isToday: format(currentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
          hasEvents: Boolean(DEMO_EVENTS[format(currentDate, 'yyyy-MM-dd')]),
          isOtherMonth: false,
          isHidden: false,
          isPastDate: isPastDate,
        });
      }

      while (days.length % 7 !== 0) {
        const nextDay: Date = addDays(end, days.length - (end.getDate() - 1));
        const isPastDate = nextDay < today;
        days.push({
          date: nextDay,
          dateString: format(nextDay, 'yyyy-MM-dd'),
          day: format(nextDay, 'd'),
          weekday: format(nextDay, 'EEE', { locale: vi }),
          isToday: false,
          isOtherMonth: true,
          isHidden: true,
          isPastDate: isPastDate,
        });
      }

      return days;
    };

    return generateMonthDays(currentMonth);
  }, [currentMonth, DEMO_EVENTS]);

  // Track window size for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get events based on selected date and artist filter - memoized function
  const getSelectedEvents = useCallback(() => {
    if (selectedArtist) {
      const artistEvents: any[] = [];
      Object.keys(DEMO_EVENTS).forEach((date) => {
        DEMO_EVENTS[date]?.forEach((event: any) => {
          // Tách chuỗi performer và kiểm tra xem có chứa nghệ sĩ được chọn không
          const performers = event.performer ? event.performer.split(',').map((p: string) => p.trim()) : [];
          if (performers.includes(selectedArtist)) {
            artistEvents.push({ ...event, date });
          }
        });
      });
      // Sort events by time
      return artistEvents.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
    } else {
      // When date is selected: only show the first event of that day
      const events = DEMO_EVENTS[selectedDate] || [];
      if (events.length > 0) {
        return [{ ...events[0], date: selectedDate }];
      }
      return [];
    }
  }, [selectedDate, selectedArtist, DEMO_EVENTS]);

  // Memoize selected events to prevent recalculation on each render
  const selectedEvents = useMemo(() => getSelectedEvents(), [getSelectedEvents]);

  // Replace with the following code that only handles event selection, not expansion
  useEffect(() => {
    // Only update the selected event if there's a single event and it's different from the current one
    if (selectedEvents.length === 1 && (!eventSelected || eventSelected.id !== selectedEvents[0].id)) {
      saveEventSelected(selectedEvents[0]);
    }
  }, [selectedEvents, eventSelected, saveEventSelected]);

  // Listen for banner click events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkSessionStorage = () => {
      const selectedEventInfo = sessionStorage.getItem('selectedEventInfo');
      if (selectedEventInfo) {
        try {
          const eventInfo = JSON.parse(selectedEventInfo);
          if (eventInfo.timestamp) {
            setBannerClickTimestamp(eventInfo.timestamp);
          }
        } catch (error) {
          console.error('Error parsing selectedEventInfo:', error);
        }
      }
    };

    // Check immediately
    checkSessionStorage();

    // Check periodically (for same-page clicks)
    const intervalId = setInterval(checkSessionStorage, 300);

    return () => clearInterval(intervalId);
  }, []);

  // Handle auto-expand when coming from banner "Đặt chỗ ngay" button
  useEffect(() => {
    if (typeof window === 'undefined' || !bannerClickTimestamp) return;

    const selectedEventInfo = sessionStorage.getItem('selectedEventInfo');
    if (!selectedEventInfo) return;

    try {
      const eventInfo = JSON.parse(selectedEventInfo);
      
      // Find the event that matches the stored info
      const matchingEvent = selectedEvents.find(event => 
        event.date === eventInfo.date && 
        (event.slug === eventInfo.slug || event.title === eventInfo.title)
      );

      if (matchingEvent) {
        // ALWAYS expand the event (even if previously collapsed)
        setExpandedEventId(matchingEvent.id);
        
        // Remove from manuallyCollapsed if it was there
        setManuallyCollapsed(prev => {
          const newSet = new Set(prev);
          newSet.delete(matchingEvent.id);
          return newSet;
        });

        // Select the event
        if (!eventSelected || eventSelected.id !== matchingEvent.id) {
          saveEventSelected(matchingEvent);
        }

        // Scroll to the combo section with retry logic and better targeting
        const scrollToCombo = (attempt = 0) => {
          const maxAttempts = 8; // Increase max attempts
          
          // Priority order: combos section > event card
          const combosElement = document.getElementById(`combos-${matchingEvent.id}`);
          const expandedElement = document.getElementById(`event-${matchingEvent.id}`);
          
          // If combos section exists, scroll to it, otherwise scroll to event card
          const targetElement = combosElement || expandedElement;
          
          if (targetElement) {
            // Different offset for combo vs event
            const isMobileView = window.innerWidth <= 768;
            const isComboSection = targetElement === combosElement;
            
            // Use smaller offset for combo section to ensure it's visible
            let yOffset;
            if (isComboSection) {
              yOffset = isMobileView ? -100 : -150; // More offset for combo section
            } else {
              yOffset = isMobileView ? -80 : -120; // Less offset for event card
            }
            
            const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
            
            window.scrollTo({
              top: y,
              behavior: 'smooth',
            });
            
            // Clear sessionStorage and reset timestamp ONLY after successful scroll to combo section
            if (isComboSection) {
              sessionStorage.removeItem('selectedEventInfo');
              setBannerClickTimestamp(null);
            } else if (attempt >= maxAttempts - 1) {
              // Also clear if we've exhausted retries
              sessionStorage.removeItem('selectedEventInfo');
              setBannerClickTimestamp(null);
            }
          } else if (attempt < maxAttempts) {
            // Retry with exponential backoff
            const delay = 200 + (attempt * 100); // 200ms, 300ms, 400ms, etc.
            setTimeout(() => scrollToCombo(attempt + 1), delay);
          } else {
            // Clear after max attempts even if not found
            sessionStorage.removeItem('selectedEventInfo');
            setBannerClickTimestamp(null);
          }
        };

        // Wait longer before starting scroll to ensure expansion completes
        setTimeout(() => scrollToCombo(), 500);
      }
    } catch (error) {
      console.error('Error parsing selectedEventInfo:', error);
      sessionStorage.removeItem('selectedEventInfo');
      setBannerClickTimestamp(null);
    }
  }, [selectedEvents, eventSelected, saveEventSelected, bannerClickTimestamp]);

  // Compute the total amount - memoized to prevent recalculation
  const totalAmount = useMemo(() => {
    return selectedEvents.reduce((sum: number, event: any) => {
      return (
        sum +
        (event.combos || []).reduce((sub: number, combo: any) => {
          const key = `${event.id}-${combo._id || combo.id}`;
          const qty = quantities[key] || 0;
          return sub + qty * combo.price;
        }, 0)
      );
    }, 0);
  }, [selectedEvents, quantities]);

  // Check if any selected event is ended - memoized
  const hasAnySelectedEventEnded = useMemo(() =>
    selectedEvents.some(event => isEventEnded(event.time_end)),
    [selectedEvents]);

  // Handler callbacks for better performance
  const handleQuantityChange = useCallback((eventId: number, comboId: string, price: number, change: number) => {
    // Find the event by ID
    const event = selectedEvents.find(evt => evt.id === eventId);

    // If the event has ended, don't allow changing quantities
    if (event && isEventEnded(event.time_end)) {
      return;
    }

    // Check if user is trying to add a combo from a different event than existing selections
    const existingSelections = Object.keys(quantities).filter(key => quantities[key] > 0);
    const hasSelections = existingSelections.length > 0;

    if (hasSelections) {
      // Extract eventId from the first selected item
      const firstEventId = parseInt(existingSelections[0].split('-')[0]);

      // If selecting from a different event and increasing quantity, clear existing selections
      if (firstEventId !== eventId && change > 0) {
        // Show confirmation dialog
        setDialogMessage("Bạn chỉ có thể đặt combo từ một sự kiện tại một thời điểm. Thêm combo này sẽ xóa các lựa chọn trước đó của bạn. Tiếp tục?");

        // Store the pending change to apply after confirmation
        const pendingChange = {
          eventId,
          comboId,
          price,
          change
        };

        // We'll handle the actual change in a separate function when user confirms
        const handleConfirm = () => {
          // Clear all existing quantities
          setQuantities({
            [`${pendingChange.eventId}-${pendingChange.comboId}`]: 1
          });
          setIsShowTotal(true);
          setOpenDialog(false);
        };

        // Store the confirm handler
        (window as any).handleConfirmChangeEvent = handleConfirm;

        // Create a cancel handler
        const handleCancel = () => {
          setOpenDialog(false);
        };

        // Store the cancel handler
        (window as any).handleCancelChangeEvent = handleCancel;

        setOpenDialog(true);
        return;
      }
    }

    setIsShowTotal(true);
    const key = `${eventId}-${comboId}`;
    const currentQty = quantities[key] || 0;

    // Check how many combos with price === 0 are currently selected
    const totalPriceZeroCombos = Object.keys(quantities).filter(
      (key) => quantities[key] > 0 && key.split('-')[1] !== comboId && price === 0
    ).length;

    // If price === 0, limit the total number of selected combos to 1
    const maxQty = price === 0 ? (totalPriceZeroCombos < 1 ? 1 : 0) : Infinity;

    const newQty = Math.max(0, Math.min(maxQty, currentQty + change));

    setQuantities(prev => ({
      ...prev,
      [key]: newQty,
    }));
  }, [quantities, selectedEvents]);

  // Handler for formatting currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }, []);

  // More handlers for user interactions
  const handleArtistClick = useCallback((artist: any) => {
    if (selectedArtist === artist.name) {
      setSelectedArtist(null);
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
      setExpandedEventId(null);
      // Reset manually collapsed events when changing artist
      setManuallyCollapsed(new Set());
      saveEventSelected(null);
    } else {
      setSelectedArtist(artist.name);
      setExpandedEventId(null);
      // Reset manually collapsed events when changing artist
      setManuallyCollapsed(new Set());

      const artistEvents = Object.keys(DEMO_EVENTS).flatMap((date) =>
        DEMO_EVENTS[date]!.filter((e: any) => {
          // Tách chuỗi performer và kiểm tra xem có chứa nghệ sĩ được chọn không
          const performers = e.performer ? e.performer.split(',').map((p: string) => p.trim()) : [];
          return performers.includes(artist.name);
        }).map((e: any) => ({
          ...e,
          date,
        })),
      );
      if (artistEvents.length === 1) {
        if (!eventSelected || eventSelected.id !== artistEvents[0].id) {
          saveEventSelected({ ...artistEvents[0] });
        }
      } else {
        saveEventSelected(null);
      }

      // Scroll to events section if needed
      if (eventsRef.current) {
        const rect = eventsRef.current.getBoundingClientRect();
        const isInView =
          rect.top >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
        if (!isInView) {
          requestAnimationFrame(() => {
            const yOffset = -80;
            const y = eventsRef.current!.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({
              top: y,
              behavior: 'smooth',
            });
          });
        }
      }
    }
  }, [selectedArtist, DEMO_EVENTS, eventSelected, saveEventSelected, setSelectedDate]);

  const handleDateClick = useCallback((dateString: string) => {
    // If we're already on this date, don't do anything
    if (selectedDate === dateString) return;

    setSelectedDate(dateString);
    setSelectedArtist(null);
    // Reset expanded state when changing date
    setExpandedEventId(null);
    // Reset manually collapsed events when changing date
    setManuallyCollapsed(new Set());

    const dateEvents = DEMO_EVENTS[dateString] || [];
    if (dateEvents.length === 1) {
      saveEventSelected(dateEvents[0]);
    } else {
      saveEventSelected(null);
    }

    // Scroll to events section if needed
    if (eventsRef.current) {
      const rect = eventsRef.current.getBoundingClientRect();
      const isInView =
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
      if (!isInView) {
        requestAnimationFrame(() => {
          const yOffset = -80;
          const y = eventsRef.current!.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({
            top: y,
            behavior: 'smooth',
          });
        });
      }
    }
  }, [selectedDate, DEMO_EVENTS, saveEventSelected, setSelectedDate]);

  const weekdayNamesVI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const onChooseSeats = () => {
    // Check if user is logged in
    if (!userInfo) {
      router.push('/login');
      return;
    }
    
    const now = new Date();
    // Check if event has ended - using consistent helper function
    if (isEventEnded(eventSelected.time_end)) {
      setDialogMessage("Sự kiện đã kết thúc. Vui lòng chọn ngày khác!");
      setOpenDialog(true);
      return;
    }

    // Kiểm tra nếu thời gian đặt chỗ chưa tới
    if (eventDetails?.InfoSeatSections?.find(
      (section: { type: string }) => section.type === "K"
    )?.k_booking_start && new Date(eventDetails.InfoSeatSections.find(
      (section: { type: string }) => section.type === "K"
    )?.k_booking_start) > now) {
      setDialogMessage(`Sự kiện sẽ được mở đặt chỗ vào ngày ${new Date(eventDetails.InfoSeatSections.find(
        (section: { type: string }) => section.type === "K"
      )?.k_booking_start).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`);
      setOpenDialog(true);
      return;
    }
    saveEventSelected({ ...eventSelected, quantities });
    router.push(`/su-kien/${eventSelected.slug}/${refCode}/bookings/select-ticket/`);
  };

  const toggleEventExpansion = useCallback((eventId: number) => {
    // Use functional update pattern which is more stable
    setExpandedEventId(prevId => {
      const isExpanding = prevId !== eventId;
      const isCollapsing = prevId === eventId;

      // If collapsing, add to manually collapsed set
      if (isCollapsing && selectedEvents.length === 1) {
        setManuallyCollapsed(prev => {
          const newSet = new Set(prev);
          newSet.add(eventId);
          return newSet;
        });
      }

      if (isExpanding) {
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          const expandedElement = document.getElementById(`event-${eventId}`);
          if (expandedElement) {
            const isMobileView = window.innerWidth <= 768;
            const yOffset = isMobileView ? -120 : -350;
            const y = expandedElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({
              top: y,
              behavior: 'smooth',
            });
          }
        });
      }

      return prevId === eventId ? null : eventId;
    });
  }, [selectedEvents.length]);

  // Memoized helper to check if an event has any selected combos
  const hasSelectedCombos = useCallback((eventId: number): boolean => {
    return Object.keys(quantities).some(key => {
      const [keyEventId, _] = key.split('-');
      return parseInt(keyEventId) === eventId && quantities[key] > 0;
    });
  }, [quantities]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  return (
    <motion.section
      id="calendar-section"
      ref={calendarSectionRef}
      className={`py-10 sm:py-16 md:py-20 px-4 md:px-8 mx-auto w-full transition-all duration-500 ${highlightSection ? 'bg-gold-50/30 rounded-xl shadow-md' : ''
        }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* SECTION 1: Featured Artists & Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Featured Artists */}
        <div>
          <div className="flex justify-center md:justify-between items-center mb-4">
            <h3 className="md:text-2xl text-xl text-center font-bold text-black">{'Các Nghệ Sĩ Tháng Này'}</h3>
            {selectedArtist && (
              <button
                onClick={() => setSelectedArtist(null)}
                className="text-sm bg-gold-50 text-gold-600 hover:text-gold-700 flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors hover:bg-gold-100"
              >
                <span className="hidden sm:inline">Tắt bộ lọc:</span>
                <span className="font-medium">{selectedArtist}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Enhanced Mobile artist row with animations */}
          <div className="relative w-full">
            {/* Scrollable artist list with improved animations and thin scrollbar */}
            <div
              className="flex overflow-x-auto md:hidden gap-4 pb-4 pt-2 scroll-smooth custom-scrollbar"
              ref={scrollContainerRef}
              style={{
                scrollBehavior: 'smooth',
              }}
            >
              {/* Custom scrollbar styling */}
              <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                  height: 3px;
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(217, 179, 89, 0.5);
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: rgba(217, 179, 89, 0.8);
                }
              `}</style>
              {FEATURED_ARTISTS.map((artist: any, index) => (
                <motion.div
                  key={artist.id}
                  className="flex-shrink-0 cursor-pointer text-center group"
                  onClick={() => handleArtistClick(artist)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.05 } }}
                  whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                >
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-200/30 to-gold-400/20 blur-md transform scale-90 opacity-0 group-hover:opacity-100 transition-opacity duration-100"></div>
                    <motion.div
                      className="relative w-full h-full overflow-hidden rounded-full"
                      whileHover={{ scale: 1.08, transition: { duration: 0.05 } }}
                    >
                      <Image
                        src={getMediaUrl(artist.image)}
                        alt={artist.name}
                        fill
                        sizes="96px"
                        quality={85}
                        className={`object-cover rounded-full transition-all duration-300 ${selectedArtist === artist.name
                          ? 'border-4 border-gold-500 shadow-lg scale-105'
                          : 'border-2 border-transparent hover:border-gold-300'
                          }`}
                      />
                    </motion.div>
                    {selectedArtist === artist.name && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gold-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15, mass: 0.6 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                  <div className="mt-1">
                    <motion.p
                      className={`text-sm ${selectedArtist === artist.name ? 'font-medium text-gold-600' : 'text-black'}`}
                      animate={selectedArtist === artist.name ? { scale: 1.05 } : { scale: 1 }}
                      transition={{ duration: 0.05 }}
                    >
                      {artist.name}
                    </motion.p>
                    {artist.performances?.length > 0 && (
                      <p
                        className="text-[10px] text-gray-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-all duration-100"
                      >
                        {artist.performances.length} buổi diễn
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* No more arrow buttons - using scrollbar instead */}
          </div>
          {/* Enhanced Desktop artist grid layout with staggered animations */}
          <AnimateGroup
            staggerDelay={0.05}
            childVariant="slide-up"
            className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-5 lg:gap-x-5 lg:gap-y-6 pb-4 rounded-lg"
            style={{
              maxHeight: FEATURED_ARTISTS.length > 15 ? '460px' : 'auto',
              overflowY: FEATURED_ARTISTS.length > 15 ? 'auto' : 'visible',
              alignItems: 'start'
            }}
          >
            {FEATURED_ARTISTS.map((artist: any) => (
              <motion.div
                key={artist.id}
                className="cursor-pointer text-center group transition-all duration-300 px-1 lg:px-2"
                onClick={() => handleArtistClick(artist)}
                whileHover={{ y: -8, transition: { duration: 0.05 } }}
                whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
              >
                <div className="relative mx-auto w-[80px] h-[80px]">
                  {/* Enhanced hover effect with gradient glow */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-200 to-gold-400 opacity-0 group-hover:opacity-20 blur-md z-0 transition-all duration-50"
                    initial={{ scale: 0.8 }}
                    whileHover={{ scale: 1.3, opacity: 0.25, transition: { duration: 0.05 } }}
                  />
                  <div className="relative w-full h-full">
                    {artist.performances?.length > 0 && (
                      <motion.div
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gold-500 text-[10px] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-md z-10 transition-all duration-50"
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1.2, opacity: 1, transition: { duration: 0.05 } }}
                      >
                        {artist.performances?.length || 0}
                      </motion.div>
                    )}
                    <motion.div
                      className="w-full h-full rounded-full overflow-hidden"
                      whileHover={{ scale: 1.08, transition: { duration: 0.05 } }}
                    >
                      <Image
                        src={getMediaUrl(artist?.image)}
                        alt={artist.name}
                        fill
                        sizes="80px"
                        quality={85}
                        className={`object-cover rounded-full transition-all duration-300 ${selectedArtist === artist.name
                          ? 'border-3 border-gold-500 shadow-lg scale-105'
                          : 'border-2 border-transparent group-hover:border-gold-300'
                          }`}
                      />
                    </motion.div>
                    {selectedArtist === artist.name && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gold-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center shadow-sm"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15, mass: 0.6 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-2.5 w-2.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </div>
                <motion.div
                  className="min-h-[2.5rem] mt-1"
                  animate={selectedArtist === artist.name ? { y: 0 } : { y: 0 }}
                >
                  <motion.p
                    className={`leading-tight ${selectedArtist === artist.name ? 'font-medium text-gold-600' : 'text-black'}`}
                    style={{
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                      fontSize: '0.8rem',
                      lineHeight: '1.2'
                    }}
                    animate={selectedArtist === artist.name ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ duration: 0.05 }}
                  >
                    {artist.name}
                  </motion.p>
                  {artist.performances?.length > 0 && (
                    <div className="mt-0.5">
                      <p className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-100">
                        {artist.performances.length} buổi diễn
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </AnimateGroup>
        </div>

        {/* Calendar Section */}
        <div className="md:border-l md:pl-8">
          <h3 className="md:text-2xl text-xl text-center md:text-left font-bold text-black mb-4">{'Lịch Biểu Diễn'}</h3>

          <motion.div
            className="flex justify-between items-center mb-4"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Enhanced month navigation buttons */}
            <motion.button
              onClick={goToPreviousMonth}
              className="p-2.5 rounded-full bg-white border border-gold-200 hover:bg-gold-50 hover:border-gold-300 transition-all shadow-sm text-gold-600"
              aria-label="Tháng trước"
              whileHover={{ scale: 1.05, x: -2, transition: { duration: 0.05 } }}
              whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
            >
              <FiChevronLeft className="h-5 w-5" />
            </motion.button>
            <motion.div
              className="flex items-center gap-2 bg-gold-50/50 px-4 py-2 rounded-full border border-gold-100"
              whileHover={{ backgroundColor: 'rgba(251, 242, 215, 0.6)', transition: { duration: 0.05 } }}
            >
              <FiCalendar className="h-5 w-5 text-gold-500" />
              <h4 className="text-xl font-semibold text-gray-800 capitalize">
                {format(currentMonth, 'LLLL yyyy', { locale: vi })
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </h4>
            </motion.div>
            {/* Enhanced next month button */}
            <motion.button
              onClick={goToNextMonth}
              className="p-2.5 bg-white rounded-full border border-gold-200 hover:bg-gold-50 hover:border-gold-300 transition-all shadow-sm text-gold-600"
              aria-label="Tháng sau"
              whileHover={{ scale: 1.05, x: 2, transition: { duration: 0.05 } }}
              whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
            >
              <FiChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMonth.toString()}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CalendarSection
                monthDays={monthDays}
                selectedDate={selectedDate}
                handleDateClick={handleDateClick}
                weekdayNames={weekdayNamesVI}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* SECTION 3: Events for Selected Date */}
      <div
        ref={eventsRef}
        className={`bg-white rounded-2xl shadow-md border overflow-hidden transition-all duration-500 ${highlightSection
          ? 'border-gold-300 shadow-lg ring-2 ring-gold-200/50'
          : 'border-gray-100'
          }`}
        id="events-section"
      >
        <div className={`p-4 md:p-6 border-b ${highlightSection ? 'border-gold-200 bg-gold-50/30' : 'border-gray-100'
          }`}>
          <h3 className="font-bold text-xl text-black">
            {selectedArtist
              ? `Các đêm diễn có ${selectedArtist}`
              : format(parse(selectedDate, 'yyyy-MM-dd', new Date()), 'EEEE, d MMMM', {
                locale: vi,
              })}
            {selectedEvents.length > 0 && (
              <span className="ml-2 text-gold-500">({selectedEvents.length} sự kiện)</span>
            )}
          </h3>
        </div>

        {selectedEvents.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {selectedEvents.map((event: any, index: any) => (
              !selectedArtist && index === 0 ?
                <div
                  key={event.id}
                  className={`transition-all duration-300 ${selectedEvents.length === 1 ? 'bg-gold-50/20' : ''}`}
                >
                  <EventCard
                    event={event}
                    expanded={expandedEventId === event.id}
                    toggleExpansion={toggleEventExpansion}
                    hasSelectedCombos={hasSelectedCombos(event.id)}
                  />
                  {expandedEventId === event.id && (
                    <div className="pt-2">
                      {isEventEnded(event.time_end) ? (
                        <div className="px-6 py-4 my-2 text-center">
                          <div className="inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-800 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>Sự kiện này đã kết thúc, không thể đặt vé</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4" id={`combos-${event.id}`}>

                          {/* Grid Layout for Combo Cards - replacing carousel */}
                          <div
                            className={cn(
                              'grid gap-4',
                              (event.combos || []).length >= 4
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                : (event.combos || []).length === 3
                                  ? 'grid-cols-1 sm:grid-cols-3'
                                  : 'grid-cols-1 sm:grid-cols-2',
                            )}
                          >
                            {(event.combos || []).map((combo: any, index: number) => {
                              const comboId = combo._id || combo.id;
                              const quantity = quantities[`${event.id}-${comboId}`] || 0;

                              return (
                                <ComboCard
                                  key={`${event.id}-${comboId}`}
                                  eventId={event.id}
                                  combo={combo}
                                  quantity={quantity}
                                  isRestrictedCombo={false}
                                  availableDate={null}
                                  handleQuantityChange={(eventId, _, change) =>
                                    handleQuantityChange(eventId, comboId, combo.price, change)
                                  }
                                  formatCurrency={formatCurrency}
                                  isEventEnded={isEventEnded(event.time_end)}
                                  comboIndex={index}
                                  totalCombos={(event.combos || []).length}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                :
                <div
                  key={event.id}
                  className={`transition-all duration-300 ${selectedEvents.length === 1 ? 'bg-gold-50/20' : ''}`}
                >
                  <EventCard
                    event={event}
                    expanded={expandedEventId === event.id}
                    toggleExpansion={toggleEventExpansion}
                    hasSelectedCombos={hasSelectedCombos(event.id)}
                  />
                  {expandedEventId === event.id && (
                    <div className="pt-2">
                      {isEventEnded(event.time_end) ? (
                        <div className="px-6 py-4 my-2 text-center">
                          <div className="inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-800 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>Sự kiện này đã kết thúc, không thể đặt vé</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          id={`combos-${event.id}`}
                          className={cn(
                            'mt-4 px-4 pb-4',
                            (event.combos || []).length >= 4
                              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                              : (event.combos || []).length === 3
                                ? 'grid-cols-1 sm:grid-cols-3'
                                : 'grid-cols-1 sm:grid-cols-2',
                          )}
                        >
                          {/* Section header with seat and drink inclusion information */}
                          <div className="mb-4 flex items-center justify-center">
                            <div className="bg-gold-50 text-gold-700 border border-gold-200 px-3 py-2 rounded-md flex items-center gap-2 shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium">Tất cả đã bao gồm 1 phần nước tự chọn</span>
                            </div>
                          </div>

                          {/* Grid of combo cards */}
                          <div
                            className={cn(
                              'grid gap-4',
                              (event.combos || []).length >= 4
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                : (event.combos || []).length === 3
                                  ? 'grid-cols-1 sm:grid-cols-3'
                                  : 'grid-cols-1 sm:grid-cols-2',
                            )}
                          >
                            {(event.combos || []).map((combo: any, index: number) => {
                              const comboId = combo._id || combo.id;
                              const quantity = quantities[`${event.id}-${comboId}`] || 0;

                              return (
                                <ComboCard
                                  key={`${event.id}-${comboId}`}
                                  eventId={event.id}
                                  combo={combo}
                                  quantity={quantity}
                                  isRestrictedCombo={false}
                                  availableDate={null}
                                  handleQuantityChange={(eventId, _, change) =>
                                    handleQuantityChange(eventId, comboId, combo.price, change)
                                  }
                                  formatCurrency={formatCurrency}
                                  isEventEnded={isEventEnded(event.time_end)}
                                  comboIndex={index}
                                  totalCombos={(event.combos || []).length}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-black">
              {selectedArtist
                ? `Không tìm thấy sự kiện nào có ${selectedArtist}`
                : 'Không có sự kiện nào vào ngày này'}
            </p>
          </div>
        )}
      </div>

      <StickyTotalWidget
        isSMUp={isSMUp}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        dialogMessage={dialogMessage}
        totalAmount={totalAmount}
        formatCurrency={formatCurrency}
        onChooseSeats={onChooseSeats}
        isShowTotal={isShowTotal && !hasAnySelectedEventEnded}
        hasAnySelectedEventEnded={hasAnySelectedEventEnded}
        eventSelected={eventSelected}
        hasSelectedCombos={totalAmount > 0}
        onScrollToCombo={() => {
          if (eventSelected) {
            // EXACT same logic as banner's "Đặt chỗ ngay" button
            // Step 1: Change date first (like handleDateChange in banner)
            const eventDate = eventSelected.date || selectedDate;
            setSelectedDate(eventDate);
            
            // Step 2: Set sessionStorage with event info
            const eventToSelect = {
              date: eventDate,
              title: eventSelected.title,
              slug: eventSelected.slug,
              timestamp: Date.now()
            };
            
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('selectedEventInfo', JSON.stringify(eventToSelect));
            }
            
            // Step 3: Scroll to events section (like handleScroll in banner)
            if (eventsRef.current) {
              requestAnimationFrame(() => {
                const yOffset = -80;
                const y = eventsRef.current!.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({
                  top: y,
                  behavior: 'smooth',
                });
                
                // Trigger the useEffect by setting timestamp after scroll starts
                setTimeout(() => {
                  setBannerClickTimestamp(Date.now());
                }, 200);
              });
            }
          }
        }}
      />

      {/* Demo Drinks Menu Modal */}
      {/* {showDrinksMenu && <DrinksMenu onClose={() => setShowDrinksMenu(false)} />} */}
    </motion.section>
  );
}
