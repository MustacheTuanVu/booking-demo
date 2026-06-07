'use client'

import React, { useState, useEffect, useRef } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { FiCalendar, FiClock, FiMusic, FiUsers } from 'react-icons/fi'
import Image from 'next/image'
import { getMediaUrl } from '@/utils/mediaUrl'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Event {
  id: number
  time: string
  title: string
  performer: string
  status: string
  genre: string
  banner: string
  date?: string // Add date property to event
}

interface EventsData {
  [date: string]: Event[]
}

// Demo events data - would come from API in real implementation
const DEMO_EVENTS: EventsData = {
  '2025-03-10': [
    {
      id: 1,
      time: '19:00',
      title: 'Jazz Ensemble',
      performer: 'Đen Vâu', // updated performer
      status: 'available',
      genre: 'Jazz',
      banner: './public/uploads/demo/events/this-week.jpg',
    },
    {
      id: 2,
      time: '21:00',
      title: 'Late Night Blues',
      performer: 'Hoàng Yến Chibi', // updated performer
      status: 'limited',
      genre: 'Blues',
      banner: './public/uploads/demo/events/this-week.jpg',
    },
  ],
  '2025-03-11': [
    {
      id: 3,
      time: '18:30',
      title: 'Acoustic Sessions',
      performer: 'Sơn Tùng MT-P', // updated performer
      status: 'available',
      genre: 'Acoustic',
      banner: './public/uploads/demo/events/this-week.jpg',
    },
  ],
  '2025-03-12': [
    {
      id: 4,
      time: '19:00',
      title: 'Vocal Performance',
      performer: 'HIEUTHUHAI', // updated performer
      status: 'full',
      genre: 'Vocal',
      banner: './public/uploads/demo/events/this-week.jpg',
    },
  ],
  '2025-03-13': [
    {
      id: 5,
      time: '20:00',
      title: 'Piano Night',
      performer: 'Đen Vâu', // rotated back
      status: 'available',
      genre: 'Classical',
      banner: './public/uploads/demo/events/this-week.jpg',
    },
  ],
  '2025-03-14': [
    {
      id: 6,
      time: '19:30',
      title: 'Friday Band',
      performer: 'Hoàng Yến Chibi', // updated performer
      status: 'limited',
      genre: 'Rock',
      banner: './public/uploads/demo/events/this-week.jpg',
    },
    {
      id: 7,
      time: '22:00',
      title: 'Late Session',
      performer: 'Sơn Tùng MT-P', // updated performer
      status: 'available',
      genre: 'Jazz',
      banner: './public/uploads/demo/events/this-week.jpg',
    },
  ],
  '2025-03-15': [
    {
      id: 8,
      time: '18:00',
      title: 'World Music',
      performer: 'HIEUTHUHAI', // updated performer
      status: 'available',
      genre: 'World',
      banner: './public/uploads/demo/events/this-week.jpg',
    },
    {
      id: 9,
      time: '21:00',
      title: 'Saturday Special',
      performer: 'Đen Vâu', // updated performer
      status: 'limited',
      genre: 'Pop',
      banner: './public/uploads/demo/events/this-week.jpg',
    },
  ],
}



// Featured artists data (placeholder images and performance dates)
const FEATURED_ARTISTS = [
  {
    id: 1,
    name: 'Đen Vâu',
    image: './public/uploads/demo/events/this-week.jpg',
    performances: ['2025-03-10'],
  },
  {
    id: 2,
    name: 'Hoàng Yến Chibi',
    image: './public/uploads/demo/events/this-week.jpg',
    performances: ['2025-03-10'],
  },
  {
    id: 3,
    name: 'Sơn Tùng MT-P',
    image: './public/uploads/demo/events/this-week.jpg',
    performances: ['2025-03-11'],
  },
  {
    id: 4,
    name: 'HIEUTHUHAI',
    image: './public/uploads/demo/events/this-week.jpg',
    performances: ['2025-03-12'],
  },
]

const convertAPIDataToClientData = (eventData: any) => {

  const formattedEvents: any = {};
  const artistMap: any = {};

  let idCounter = 1;

  eventData.forEach((event: any) => {
    event.InfoShowTimes.forEach((show: any) => {
      const date = show.time_start.split('T')[0];
      const time = new Date(show.time_start).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      event.InfoContents.forEach((content: any) => {
        const artist = content.InfoArtist[0];

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

        if (!formattedEvents[date]) {
          formattedEvents[date] = [];
        }

        formattedEvents[date].push({
          id: idCounter++,
          time: time,
          title: event.title,
          performer: artist.name,
          status: 'available',
          genre: 'Music',
          banner: event.banner,
          slug: event.slug
        });
      });
    });
  });

  const formattedArtists = Object.values(artistMap);

  return { formattedEvents, formattedArtists };

}

export default function BookingCalendarSection({ eventList }: any) {

  const router = useRouter();

  const DEMO_EVENTS = convertAPIDataToClientData(eventList).formattedEvents;

  const FEATURED_ARTISTS = convertAPIDataToClientData(eventList).formattedArtists;

  // New function to generate days for the current month (full month calendar)
  const generateMonthDays = () => {
    const today = new Date()
    const start = startOfMonth(today)
    const end = endOfMonth(today)
    return eachDayOfInterval({ start, end }).map((date) => ({
      date,
      dateString: format(date, 'yyyy-MM-dd'),
      day: format(date, 'd'),
      weekday: format(date, 'EEE'),
      isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
      hasEvents: Object.keys(DEMO_EVENTS).includes(format(date, 'yyyy-MM-dd')),
    }))
  }

  const monthDays = generateMonthDays()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const eventsRef = useRef<HTMLDivElement>(null)
  // Get events based on selected date and artist filter
  const getSelectedEvents = () => {
    if (selectedArtist) {
      // If artist is selected, show all their events for the month
      const artistEvents: Event[] = []
      Object.keys(DEMO_EVENTS).forEach((date) => {
        DEMO_EVENTS[date]?.forEach((event: any) => {
          if (event.performer === selectedArtist) {
            // Add date info to each event
            artistEvents.push({
              ...event,
              date: date,
            })
          }
        })
      })
      return artistEvents
    } else {
      // If no artist filter, show events for the selected date
      return (DEMO_EVENTS[selectedDate] || []).map((event: any) => ({
        ...event,
        date: selectedDate,
      }))
    }
  }

  const selectedEvents = getSelectedEvents()

  // Handle artist selection with updated scrolling for both mobile and desktop
  const handleArtistClick = (artist: any) => {
    if (selectedArtist === artist.name) {
      // If clicking the same artist, clear filter
      setSelectedArtist(null)
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'))
    } else {
      // Set filter to this artist
      setSelectedArtist(artist.name)

      // Check if events section is in view (for both mobile and desktop)
      if (eventsRef.current) {
        const rect = eventsRef.current.getBoundingClientRect()
        const isInView =
          rect.top >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)

        // If not in view, scroll to it with a larger offset
        if (!isInView) {
          setTimeout(() => {
            const yOffset = -80 // Increased offset to show more content above
            const y = eventsRef.current!.getBoundingClientRect().top + window.pageYOffset + yOffset
            window.scrollTo({
              top: y,
              behavior: 'smooth',
            })
          }, 100)
        }
      }
    }
  }

  // Update date selection to also scroll for both mobile and desktop
  const handleDateClick = (dateString: string) => {
    setSelectedDate(dateString)
    setSelectedArtist(null)

    // Check if events section is in view (for both mobile and desktop)
    if (eventsRef.current) {
      const rect = eventsRef.current.getBoundingClientRect()
      const isInView =
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)

      // If not in view, scroll to it with a larger offset
      if (!isInView) {
        setTimeout(() => {
          const yOffset = -80 // Increased offset to show more content above
          const y = eventsRef.current!.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({
            top: y,
            behavior: 'smooth',
          })
        }, 100)
      }
    }
  }

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768)
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section className="py-20 px-4 md:px-8 container mx-auto">
      {/* Removed the h2 title completely */}

      {/* Combined Featured Artists and Calendar Section */}
      <div className="md:flex md:gap-8 mb-12">
        {/* SECTION 1: Featured Artists with filter button moved here */}
        <div className="md:w-1/2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-black">{'Các Nghệ Sĩ Tháng Này'}</h3>
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
          <div className="flex overflow-x-auto gap-4">
            {FEATURED_ARTISTS.map((artist: any) => (
              <div
                key={artist.id}
                className="flex-shrink-0 cursor-pointer text-center"
                onClick={() => handleArtistClick(artist)}
              >
                <div className="relative inline-block">
                  <img
                    src={getMediaUrl(artist.image)}
                    alt={artist.name}
                    className={`w-24 h-24 object-cover rounded-full mx-auto transition-all duration-300 ${selectedArtist === artist.name
                      ? 'border-4 border-gold-500 shadow-lg'
                      : 'border-2 border-transparent hover:border-gold-300'
                      }`}
                  />
                  {selectedArtist === artist.name && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gold-500 text-white text-xs px-2 py-1 rounded-full">
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
                    </div>
                  )}
                </div>
                <p
                  className={`mt-2 text-sm ${selectedArtist === artist.name ? 'font-medium text-gold-600' : 'text-black'}`}
                >
                  {artist.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Separator and Calendar - Removed the filter button from here */}
        <div className="md:w-1/2 border-l md:pl-8 mt-8 md:mt-0">
          <h3 className="text-2xl font-bold text-black mb-4">{'Lịch Hoạt Động'}</h3>

          {/* Calendar Header - Weekday Labels */}
          <div className="grid grid-cols-7 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-xs font-medium text-center text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="grid grid-cols-7 gap-px bg-gray-100">
              {monthDays.map((day) => (
                <button
                  key={day.dateString}
                  onClick={() => handleDateClick(day.dateString)}
                  className={cn(
                    'flex flex-col items-center justify-center py-3 transition-all bg-white relative hover:z-10',
                    selectedDate === day.dateString && !selectedArtist
                      ? 'bg-gold-50'
                      : 'hover:bg-gold-50/30',
                    day.isToday && 'font-semibold',
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 flex items-center justify-center rounded-full mb-1 text-sm',
                      selectedDate === day.dateString && !selectedArtist
                        ? 'bg-gold-500 text-white shadow-sm'
                        : day.isToday
                          ? 'bg-gold-100 text-gold-800'
                          : 'text-gray-900',
                    )}
                  >
                    {day.day}
                  </div>

                  {day.hasEvents && (
                    <div className="flex gap-0.5 mt-1">
                      {/* Show dots for each event on this day, max 3 dots */}
                      {Array.from({
                        length: Math.min(DEMO_EVENTS[day.dateString]?.length || 0, 3),
                      }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full ${selectedDate === day.dateString && !selectedArtist
                            ? 'bg-gold-300'
                            : 'bg-gold-400'
                            }`}
                        />
                      ))}

                      {/* If more than 3 events, show a plus indicator */}
                      {(DEMO_EVENTS[day.dateString]?.length || 0) > 3 && (
                        <span className="text-xs text-gold-500 font-medium">+</span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the code remains the same */}
      {/* SECTION 3: Events for Selected Date */}
      <div
        ref={eventsRef}
        className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
      >
        <div className="p-4 md:p-6 border-b border-gray-100">
          <h3 className="font-bold text-xl text-black">
            {selectedArtist
              ? `Các đêm diễn có ${selectedArtist}`
              : format(new Date(selectedDate), 'EEEE, MMMM d')}
            {selectedEvents.length > 0 && (
              <span className="ml-2 text-gold-500">({selectedEvents.length} sự kiện)</span>
            )}
          </h3>
        </div>

        {/* Small guide for mobile users */}
        {isMobile && selectedEvents.length > 0 && (
          <div className="bg-gold-50/50 px-4 py-2 text-sm text-gold-700 border-b border-gold-100">
            <p className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
              {selectedArtist
                ? 'Hiển thị tất cả sự kiện của nghệ sĩ này'
                : 'Nhấn vào nút Đặt Chỗ để đặt chỗ'}
            </p>
          </div>
        )}

        {selectedEvents.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {selectedEvents.map((event: any) => (
              <div key={event.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Banner on the left */}
                  <div className="flex-shrink-0">
                    <img
                      src={getMediaUrl(event.banner)}
                      alt={event.title}
                      className="w-36 md:w-40 h-auto rounded shadow-sm"
                    />
                  </div>

                  {/* Event information in the middle */}
                  <div className="flex-grow">
                    <h4 className="font-semibold text-lg text-black mb-1">{event.title}</h4>
                    {/* Date info */}
                    <div className="flex items-center gap-2 text-sm text-black mb-1">
                      <FiCalendar className="h-4 w-4 text-gold-500" />
                      <span>{format(new Date(event.date!), 'EEE, MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-black mb-1">
                      <FiClock className="h-4 w-4 text-gold-500" />
                      <span>{event.time}</span>
                      <span className="mx-2">•</span>
                      <FiMusic className="h-4 w-4 text-gold-500" />
                      <span>{event.genre}</span>
                    </div>
                    <p className="text-black flex items-center gap-2 mt-1">
                      <FiUsers className="h-4 w-4 text-gold-500" />
                      <span>{event.performer}</span>
                    </p>
                  </div>

                  {/* Status and booking button on the right */}
                  <div className="flex-shrink-0 flex flex-col md:items-end gap-3 mt-3 md:mt-0">
                    <span
                      className={cn(
                        'text-sm font-medium px-3 py-1 rounded-full w-fit',
                        event.status === 'available' && 'bg-green-100 text-green-800',
                        event.status === 'limited' && 'bg-amber-100 text-amber-800',
                        event.status === 'full' && 'bg-red-100 text-red-800',
                      )}
                    >
                      {event.status}
                    </span>
                    <Button
                      className="bg-gold-500 hover:bg-gold-600 text-white md:w-32"
                      disabled={event.status === 'full'}
                      onClick={() => router.push(`/su-kien/${event.slug}/666`)}
                    >
                      {'Đặt chỗ ngay'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-black">
              {selectedArtist
                ? `Ca sĩ ${selectedArtist} không có lịch diễn`
                : 'Không có sự kiện nào vào hôm nay'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function Button({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-all',
        props.disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
