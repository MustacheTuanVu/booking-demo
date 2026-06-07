"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TextField } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';
import {
  faCalendarAlt,
  faChair,
  faClock,
  faMicrophone,
  faPen,
  faPlus,
  faTrash,
  faXmark,
  faChevronDown,
  faMagic
} from '@fortawesome/free-solid-svg-icons';
import { formatDateTime, formatDateTime2, formatDateTime3 } from '@/utils/date';
import { cn } from '@/lib/utils';

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// Customize the Vietnamese locale for proper weekday abbreviations
const viLocale = {
  name: 'vi',
  weekdays: 'Chủ Nhật_Thứ Hai_Thứ Ba_Thứ Tư_Thứ Năm_Thứ Sáu_Thứ Bảy'.split('_'),
  weekdaysShort: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
  weekdaysMin: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
  months: 'Tháng 1_Tháng 2_Tháng 3_Tháng 4_Tháng 5_Tháng 6_Tháng 7_Tháng 8_Tháng 9_Tháng 10_Tháng 11_Tháng 12'.split('_'),
  monthsShort: 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
  ordinal: (n: number) => `${n}.`,
  formats: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD/MM/YYYY',
    LL: 'D MMMM [năm] YYYY',
    LLL: 'D MMMM [năm] YYYY HH:mm',
    LLLL: 'dddd, D MMMM [năm] YYYY HH:mm',
    l: 'DD/MM/YYYY',
    ll: 'D MMM YYYY',
    lll: 'D MMM YYYY HH:mm',
    llll: 'ddd, D MMM YYYY HH:mm'
  },
  relativeTime: {
    future: '%s tới',
    past: '%s trước',
    s: 'vài giây',
    m: 'một phút',
    mm: '%d phút',
    h: 'một giờ',
    hh: '%d giờ',
    d: 'một ngày',
    dd: '%d ngày',
    M: 'một tháng',
    MM: '%d tháng',
    y: 'một năm',
    yy: '%d năm'
  }
};

// Update the Vietnamese locale
dayjs.locale(viLocale);

interface CreateTypeTicketProps {
  onClose: () => void;
  eventData: any;
  setEventData: (data: any) => void;
  ticketTypeSelected: any;
  ticketTypeInfor: any[];
  setTickerTypeInfor: (data: any[]) => void;
  artistList: any[];
  handleSaveArtis: (artistId: any, desc: any, time: any) => void;
  contentEventData: any[];
  handleDeleteArtis: (id: any) => void;
  handleOpenDialog: (type: any) => void;
}

// Create a custom theme to match the gold color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#c6a848', // Gold color to match your theme
      light: '#e2d8b3',
      dark: '#9d8845',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f8f4e5', // Light gold background
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    action: {
      active: '#c6a848',
      hover: '#f3e8c8',
    },
  },
  typography: {
    fontFamily: 'inherit',
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#c6a848',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#c6a848',
            borderWidth: 2,
          },
          borderRadius: '0.375rem', // Match your Tailwind rounded-md
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: '#9d8845',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#9d8845',
          '&:hover': {
            backgroundColor: 'rgba(198, 168, 72, 0.08)',
          },
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderRadius: '0.5rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          '&.MuiPickersPopper-paper': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: '0.5rem',
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: '#9d8845',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '.MuiInputBase-input': {
            '&::placeholder': {
              color: 'rgba(0, 0, 0, 0.4)',
            },
          },
        },
      },
    },
  },
});

export default function CreateTypeTicket({
  onClose,
  eventData,
  setEventData,
  ticketTypeSelected,
  ticketTypeInfor,
  setTickerTypeInfor,
  artistList,
  handleSaveArtis,
  contentEventData,
  handleDeleteArtis,
  handleOpenDialog
}: CreateTypeTicketProps) {
  const [openChooseTypeArtis, setOpenChooseTypeArtis] = useState(false);
  const [isEventPickerOpen, setIsEventPickerOpen] = useState(false); // State for event time picker
  const [isTicketPickerOpen, setIsTicketPickerOpen] = useState(false); // State for ticket type picker

  const [isArtistDropdownOpen, setIsArtistDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  const [ticketData, setTicketData] = useState({
    JBookingStart: "",
    QBookingStart: "",
    KBookingStart: "",
  });

  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });
  const [presetApplied, setPresetApplied] = useState(false);

  // Add custom styles for DatePicker
  useEffect(() => {
    // Add custom styles for the datepicker to match gold theme
    const style = document.createElement('style');
    style.innerHTML = `
      /* Calendar Styling */
      .MuiPickersDay-root.Mui-selected {
        background-color: #c6a848 !important;
        color: #ffffff !important;
      }

      .MuiPickersDay-root.Mui-selected:hover {
        background-color: #9d8845 !important;
      }

      .MuiPickersDay-root:hover {
        background-color: #f3e8c8 !important;
      }

      .MuiPickersDay-root.MuiPickersDay-today {
        border-color: #c6a848 !important;
        color: #c6a848 !important;
      }

      /* Clock Styling */
      .MuiClock-pin,
      .MuiClockPointer-root {
        background-color: #c6a848 !important;
      }

      .MuiClockPointer-thumb {
        background-color: #c6a848 !important;
        border-color: #c6a848 !important;
      }

      .MuiClock-clock {
        background-color: #f8f4e5 !important;
      }

      .MuiClockNumber-root.Mui-selected {
        background-color: #c6a848 !important;
        color: #ffffff !important;
      }

      /* Year and Month Selection */
      .MuiPickersYear-yearButton.Mui-selected,
      .MuiPickersMonth-monthButton.Mui-selected {
        background-color: #c6a848 !important;
        color: #ffffff !important;
      }

      /* General Picker UI */
      .MuiDateTimePickerToolbar-timeDigitsContainer {
        color: #9d8845 !important;
      }

      /* Toolbar */
      .MuiPickersToolbar-root {
        background-color: #f8f4e5 !important;
        color: #9d8845 !important;
      }

      .MuiPickersToolbar-penIconButton {
        color: #9d8845 !important;
      }

      /* Paper */
      .MuiPickersPopper-paper,
      .MuiPaper-root.MuiDialog-paper {
        border-radius: 0.5rem !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
      }

      /* Header */
      .MuiPickersCalendarHeader-root {
        color: #333333;
      }

      .MuiPickersArrowSwitcher-button {
        color: #9d8845 !important;
      }

      .MuiPickersCalendarHeader-switchViewButton {
        color: #9d8845 !important;
      }

      /* Selected date display */
      .MuiTypography-overline {
        color: #9d8845 !important;
      }

      /* Make sure the day names are visible */
      .MuiDayCalendar-weekDayLabel {
        color: #666666 !important;
      }

      /* Selected text in toolbar */
      .MuiTypography-root.Mui-selected {
        color: #c6a848 !important;
      }

      /* Responsive improvements */
      @media (max-width: 640px) {
        .MuiPickersDay-root {
          width: 36px !important;
          height: 36px !important;
          font-size: 0.875rem !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleTicketChange = (field: string) => (date: Date | null) => {
    if (date) {
      // Use dayjs for consistent timezone handling
      const dayjsDate = dayjs(date);
      setTicketData({ ...ticketData, [field]: dayjsDate.toISOString() });
    }
  };

  // Function to apply preset booking times (7 days before event start for booking start, event start for booking end)
  const applyPresetBookingTimes = () => {
    if (!eventData.showsTimeData || eventData.showsTimeData.length === 0) {
      return; // No event time set yet
    }

    // Get the event date using dayjs for proper timezone handling
    const eventDate = dayjs(eventData.showsTimeData[0].time_start);

    // Create a booking start date 7 days before the event
    // Always set the time to 8:30 PM (20:30) for consistency
    const bookingStartDate = eventDate
      .subtract(7, 'day')
      .hour(20)
      .minute(30)
      .second(0)
      .millisecond(0);

    // Convert to ISO string for storage
    const bookingStartISO = bookingStartDate.toISOString();

    // Set booking times based on ticket type
    if (ticketTypeSelected) {
      switch (ticketTypeSelected.type) {
        case 'J':
          setTicketData({ ...ticketData, JBookingStart: bookingStartISO });
          break;
        case 'Q':
          setTicketData({ ...ticketData, QBookingStart: bookingStartISO });
          break;
        case 'K':
          setTicketData({ ...ticketData, KBookingStart: bookingStartISO });
          break;
      }

      // Show feedback that preset was applied
      setPresetApplied(true);

      // Reset feedback after 3 seconds
      setTimeout(() => {
        setPresetApplied(false);
      }, 3000);
    }
  };

  const handleSaveTicket = () => {
    const newTicketTypeInfor = [...ticketTypeInfor];
    const item = newTicketTypeInfor.find((item: any) => item.type === ticketTypeSelected.type);

    if (!eventData.showsTimeData || eventData.showsTimeData.length === 0) {
      alert('Vui lòng chọn thời gian sự kiện trước');
      return;
    }

    // Lấy ngày kết thúc sự kiện
    const eventEndDate = new Date(eventData.showsTimeData[0].time_end);

    if (item) {
      // GIỮ NGUYÊN seatSectionId nếu đã có
      // KHÔNG ghi đè data_seat nếu đã có seatSectionId
      if (!item.seatSectionId) {
        // Chỉ tạo danh sách ghế khi là bản ghi mới
        switch (ticketTypeSelected.type) {
          case 'J':
            item.data_seat = Array.from({ length: 114 }, (_, i) => ({
              name: `J.${i + 1}`,
              id: `J.${i + 1}`,
              cukcuk_id: `J.${i + 1}`,
            }));
            break;
          case 'Q':
            item.data_seat = Array.from({ length: 40 }, (_, i) => ({
              name: `Q.${i + 1}`,
              id: `Q.${i + 1}`,
              cukcuk_id: `Q.${i + 1}`,
            }));
            break;
          case 'K':
            item.data_seat = Array.from({ length: 30 }, (_, i) => ({
              name: `K.${i + 1}`,
              id: `K.${i + 1}`,
              cukcuk_id: `K.${i + 1}`,
            }));
            break;
          default:
            break;
        }
      }

      // Lưu thời gian booking với DatePicker
      // Kiểm tra nếu có dữ liệu thời gian từ DatePicker
      switch (item.type) {
        case 'J':
          if (ticketData.JBookingStart) {
            item.j_booking_start = new Date(ticketData.JBookingStart).toISOString();
          }
          break;
        case 'Q':
          if (ticketData.QBookingStart) {
            item.q_booking_start = new Date(ticketData.QBookingStart).toISOString();
          }
          break;
        case 'K':
          if (ticketData.KBookingStart) {
            item.k_booking_start = new Date(ticketData.KBookingStart).toISOString();
          }
          break;
      }

      // Thời gian kết thúc bán chỗ trùng với ngày kết thúc sự kiện
      item.time_end = eventEndDate.toISOString();

      setTickerTypeInfor(newTicketTypeInfor);
    }

    // Đóng dialog và reset
    setOpenChooseTypeArtis(false);
    onClose();
    setTicketData({
      JBookingStart: "",
      QBookingStart: "",
      KBookingStart: "",
    });
  };

  // Set default time to 8:30 PM when date picker is opened
  const handleEventPickerOpen = () => {
    setIsEventPickerOpen(true);

    // Only set default time if no time is already selected
    if (!eventData.showsTimeData || eventData.showsTimeData.length === 0) {
      // Create a dayjs object for today at 8:30 PM
      // Use local timezone to ensure it's displayed correctly
      const defaultTime = dayjs().hour(20).minute(30).second(0).millisecond(0);

      // Set the default time
      handleTimeChange(defaultTime.toDate());
    }
  };

  const handleTimeChange = (date: Date | null) => {
    if (!date) return;

    // Create a dayjs object from the date
    const dayjsDate = dayjs(date);

    // Convert to ISO string (this will be in UTC)
    const startTime = dayjsDate.toISOString();

    // Create a dayjs object for the end time (same day, 23:00 local time)
    const endTimeDayjs = dayjsDate
      .hour(23)
      .minute(0)
      .second(0)
      .millisecond(0);

    // Convert to ISO string
    const endTime = endTimeDayjs.toISOString();

    console.log('startTime', dayjs(startTime).format('YYYY-MM-DD HH:mm:ss'))
    // Removed debugging console.log for production

    // Giữ lại showtimeId từ dữ liệu hiện có
    const existingShowtimeId = eventData.showsTimeData &&
      eventData.showsTimeData.length > 0 &&
      eventData.showsTimeData[0].showtimeId;

    setEventData({
      ...eventData,
      showsTimeData: [{
        showtimeId: existingShowtimeId, // Giữ lại ID nếu có
        time_start: startTime,
        time_end: endTime,
      }],
    });
  };

  const handleSelectArtist = (artistId: string) => {
    // Validation: Check if event time is set
    if (!eventData.showsTimeData || eventData.showsTimeData.length === 0) {
      console.warn('Event time must be set before adding artists.');
      setIsArtistDropdownOpen(false); // Close dropdown
      return;
    }

    // Validation: Check if artist already exists
    const artistExists = contentEventData.some(content => content.artist_id === artistId);
    if (artistExists) {
      console.warn('Artist already added to the program.');
      setIsArtistDropdownOpen(false); // Close dropdown
      return;
    }

    // Use event end time for performance time
    const eventEndTime = new Date(eventData.showsTimeData[0].time_end);

    // Call the parent save function
    handleSaveArtis(artistId, "thông tin ca sĩ", eventEndTime.toISOString());

    // Close the dropdown
    setIsArtistDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isArtistDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target as Node)
      ) {
        setIsArtistDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isArtistDropdownOpen]);

  const initiateDeleteArtist = (id: string) => {
    setConfirmDelete({ show: true, id });
  };

  const confirmDeleteArtist = () => {
    if (confirmDelete.id) {
      handleDeleteArtis(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
    }
  };

  useEffect(() => {
    if (eventData.showsTimeData && eventData.showsTimeData.length > 0) {
      if (eventData.showsTimeData[0].time_start) {
        console.log('u effect', dayjs(eventData.showsTimeData[0].time_start).utc())
      }
    }
  }, [eventData]);

  const returnTimeRight = (time: string) => {
    console.log('check time', time)
    // Always parse the time as UTC but display in local time
    return dayjs(time)
  }

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="en" // Use English locale for better weekday labels
      >
        <div className="space-y-6 md:space-y-8">
          {/* Event Time Section */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100">
            <h3 className="text-gray-800 text-base md:text-lg font-bold mb-3 md:mb-4 flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gold-500" />
              Lịch sự kiện
            </h3>
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <div>
                <label className=" text-gray-700 font-medium mb-2 flex items-center text-sm md:text-base">
                  <span className="text-red-500 mr-1">*</span>
                  <FontAwesomeIcon icon={faClock} className="mr-2" />
                  Ngày & giờ bắt đầu
                </label>
                <DateTimePicker
                  value={eventData.showsTimeData && eventData.showsTimeData.length > 0
                    ? returnTimeRight(eventData.showsTimeData[0].time_start)
                    : null}
                  onChange={(value) => handleTimeChange(value ? value.toDate() : null)}
                  format="DD/MM/YYYY HH:mm" // Date format with 24-hour time
                  ampm={false}
                  open={isEventPickerOpen} // Control open state
                  onOpen={handleEventPickerOpen} // Use the new handler that sets default time
                  onClose={() => setIsEventPickerOpen(false)} // Handle close
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                      size: "small",
                      InputProps: {
                        onClick: handleEventPickerOpen, // Use the new handler that sets default time
                        sx: {
                          fontSize: { xs: '0.875rem', md: '1rem' },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgb(229, 231, 235)', // Match Tailwind border-gray-300
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#c6a848',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#c6a848',
                            borderWidth: '2px',
                          },
                        },
                      },
                      className: "rounded-md",
                    },
                    actionBar: {
                      actions: ['clear', 'accept'],
                    },
                    layout: {
                      sx: {
                        '.MuiPickersLayout-contentWrapper': {
                          backgroundColor: '#ffffff',
                        },
                        '.MuiPickersLayout-actionBar': {
                          backgroundColor: '#ffffff',
                        },
                      },
                    },
                  }}
                  closeOnSelect={false}
                  // disablePast
                  sx={{
                    '& .MuiInputBase-root': {
                      height: { xs: '45px', md: '50px' },
                      borderRadius: '0.375rem',
                    },
                  }}
                />
                <p className="mt-2 text-xs md:text-sm text-gray-500">
                  Giờ kết thúc sẽ tự động được thiết lập là 23:00 cùng ngày.
                </p>
              </div>
            </div>

            {/* Program List Section */}
            <div className="mt-6 md:mt-8 bg-white rounded-lg border border-gray-200 p-4 md:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                <h3 className="text-gray-800 text-base md:text-lg font-bold flex items-center">
                  <FontAwesomeIcon icon={faMicrophone} className="mr-2 text-gold-500" />
                  Danh sách chương trình
                </h3>
                <div className="relative inline-block text-left">
                  <button
                    ref={dropdownButtonRef}
                    onClick={() => setIsArtistDropdownOpen(!isArtistDropdownOpen)}
                    className={cn(
                      "flex items-center justify-center px-4 py-2 bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors text-sm md:text-base",
                      (!eventData.showsTimeData || eventData.showsTimeData.length === 0) && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!eventData.showsTimeData || eventData.showsTimeData.length === 0}
                    aria-haspopup="true"
                    aria-expanded={isArtistDropdownOpen}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Thêm nghệ sĩ
                    <FontAwesomeIcon icon={faChevronDown} className="ml-2 h-4 w-4" />
                  </button>

                  {isArtistDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 max-h-60 overflow-y-auto"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="artist-options-menu"
                    >
                      <div className="py-1" role="none">
                        {artistList && artistList.length > 0 ? (
                          artistList.map((artist) => {
                            const isAdded = contentEventData.some(content => content.artist_id === artist._id);
                            return (
                              <button
                                key={artist._id}
                                onClick={() => !isAdded && handleSelectArtist(artist._id)}
                                className={cn(
                                  "w-full text-left block px-4 py-2 text-sm",
                                  isAdded
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                )}
                                role="menuitem"
                                disabled={isAdded}
                                title={isAdded ? "Nghệ sĩ đã được thêm" : `Thêm ${artist.name}`}
                              >
                                {artist.name} {isAdded && <span className="text-xs text-gray-400 ml-1">(Đã thêm)</span>}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">Không có nghệ sĩ nào</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {contentEventData.length > 0 ? (
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <div className="inline-block min-w-full align-middle md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nghệ sĩ</th>
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {contentEventData.map((content, index) => {
                          const artist = artistList.find((item) => item._id === content.artist_id);
                          return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 md:px-4 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm text-gray-500">{index + 1}</td>
                              <td className="px-3 md:px-4 py-2 md:py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-xs md:text-sm font-medium text-gray-800">
                                    {artist ? artist.name : "Nghệ sĩ không xác định"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 w-12 md:px-4 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm">
                                <button
                                  onClick={() => initiateDeleteArtist(content.artist_id)}
                                  className="px-2 md:px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                  <span className="hidden sm:inline-block">Xóa</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 md:py-8 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <FontAwesomeIcon icon={faMicrophone} className="text-2xl md:text-3xl text-gray-300 mb-2" />
                  <p className="text-gray-500 text-xs md:text-sm px-4">Chưa có nghệ sĩ nào được thêm. Nhấn nút Thêm nghệ sĩ để thêm người biểu diễn.</p>
                </div>
              )}
            </div>

            {/* Seat Types Section */}
            <div className="mt-6 md:mt-8 bg-white rounded-lg border border-gray-200 p-4 md:p-5">
              <h3 className="text-gray-800 text-base md:text-lg font-bold mb-4 md:mb-6 flex items-center">
                <FontAwesomeIcon icon={faChair} className="mr-2 text-gold-500" />
                Loại ghế
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {ticketTypeInfor.map((ticket, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                    <div className="bg-gray-50 p-2 md:p-3 border-b border-gray-200">
                      <h4 className="text-base md:text-lg font-bold text-gold-600">
                        Loại {ticket.type}
                      </h4>
                    </div>
                    <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                      <div className="flex justify-between items-center text-xs md:text-sm">
                        <span className="text-gray-600">Bắt đầu đặt chỗ:</span>
                        <span className="font-medium text-gray-800">
                          {ticket.j_booking_start || ticket.q_booking_start || ticket.k_booking_start
                            ? formatDateTime(ticket.j_booking_start || ticket.q_booking_start || ticket.k_booking_start)
                            : 'Chưa thiết lập'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs md:text-sm">
                        <span className="text-gray-600">Kết thúc đặt chỗ:</span>
                        <span className="font-medium text-gray-800">
                          {ticket.time_end
                            ? formatDateTime3(ticket.time_end)
                            : 'Chưa thiết lập'}
                        </span>
                      </div>
                      <div className="pt-2 md:pt-3 mt-2 md:mt-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setOpenChooseTypeArtis(true);
                            handleOpenDialog(ticket.type);
                          }}
                          className="w-full px-3 md:px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex items-center justify-center text-xs md:text-sm"
                        >
                          <FontAwesomeIcon icon={faPen} className="mr-2" />
                          Chỉnh sửa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edit Seat Type Modal - Improved for mobile */}
          {openChooseTypeArtis && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
                <div className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-50" aria-hidden="true" onClick={() => setOpenChooseTypeArtis(false)}></div>

                {/* Modal content */}
                <div className="z-50 w-full max-w-md p-4 md:p-6 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-medium leading-6 text-gray-900">
                      Chỉnh sửa loại ghế {ticketTypeSelected?.type}
                    </h3>
                    <button
                      onClick={() => setOpenChooseTypeArtis(false)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Validation check */}
                  {!eventData.showsTimeData || eventData.showsTimeData.length === 0 ? (
                    <div className="p-3 md:p-4 mb-4 text-xs md:text-sm text-yellow-700 bg-yellow-100 rounded-lg">
                      Vui lòng thiết lập thời gian sự kiện trước khi cấu hình loại ghế.
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs md:text-sm font-medium text-gray-700">
                            <span className="text-red-500">*</span> Ngày bắt đầu đặt chỗ cho loại {ticketTypeSelected?.type}
                          </label>
                          {/* Preset button */}
                          <button
                            type="button"
                            onClick={applyPresetBookingTimes}
                            className={cn(
                              "flex items-center text-xs px-2 py-1 rounded-md transition-all duration-200",
                              "bg-gold-50 text-gold-700 hover:bg-gold-100 border border-gold-200",
                              (!eventData.showsTimeData || eventData.showsTimeData.length === 0) && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={!eventData.showsTimeData || eventData.showsTimeData.length === 0}
                            title="Thiết lập thời gian đặt chỗ: bắt đầu 7 ngày trước sự kiện (20:30), kết thúc vào thời điểm kết thúc sự kiện"
                          >
                            <FontAwesomeIcon icon={faMagic} className="mr-1" />
                            Áp dụng mặc định
                          </button>
                        </div>

                        <div className="relative">
                          <DateTimePicker
                            value={
                              ticketTypeSelected?.type === 'J' && ticketData.JBookingStart ? dayjs(ticketData.JBookingStart) :
                              ticketTypeSelected?.type === 'Q' && ticketData.QBookingStart ? dayjs(ticketData.QBookingStart) :
                              ticketTypeSelected?.type === 'K' && ticketData.KBookingStart ? dayjs(ticketData.KBookingStart) :
                              null
                            }
                            onChange={(value) => {
                              const field = ticketTypeSelected?.type === 'J' ? 'JBookingStart' :
                                ticketTypeSelected?.type === 'Q' ? 'QBookingStart' : 'KBookingStart';
                              handleTicketChange(field)(value ? value.toDate() : null);
                            }}
                            format="DD/MM/YYYY HH:mm" // Date format with 24-hour time
                            ampm={false}
                            open={isTicketPickerOpen} // Control open state
                            onOpen={() => setIsTicketPickerOpen(true)} // Handle open
                            onClose={() => setIsTicketPickerOpen(false)} // Handle close
                            slotProps={{
                              textField: {
                                required: true,
                                fullWidth: true,
                                size: "small",
                                onClick: () => setIsTicketPickerOpen(true), // Open picker on input click
                                InputProps: {
                                  sx: {
                                    fontSize: { xs: '0.875rem', md: '1rem' },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'rgb(229, 231, 235)', // Match Tailwind border-gray-300
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#c6a848',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#c6a848',
                                      borderWidth: '2px',
                                    },
                                  },
                                },
                                className: "rounded-md",
                              },
                              actionBar: {
                                actions: ['clear', 'accept'],
                              },
                            }}
                            closeOnSelect={false}
                            // disablePast
                            sx={{
                              '& .MuiInputBase-root': {
                                height: { xs: '45px', md: '50px' },
                                borderRadius: '0.375rem',
                              },
                            }}
                          />

                          {/* Feedback message when preset is applied */}
                          <AnimatePresence>
                            {presetApplied && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute right-0 -bottom-8 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md border border-green-100"
                              >
                                Đã áp dụng: Bắt đầu 7 ngày trước sự kiện, kết thúc vào thời điểm kết thúc sự kiện
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <p className="mt-4 text-xs md:text-sm text-gray-500">
                          Lưu ý: Thời gian kết thúc đặt chỗ sẽ tự động được thiết lập là ngày kết thúc sự kiện.
                        </p>
                      </div>

                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={handleSaveTicket}
                          className="w-full px-4 py-2 md:py-3 text-sm md:text-base font-medium text-white bg-gold-600 border border-transparent rounded-md hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
                        >
                          Lưu thay đổi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal for Artist Deletion - Improved for mobile */}
          {confirmDelete.show && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
                <div className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-50" aria-hidden="true" onClick={() => setConfirmDelete({ show: false, id: null })}></div>

                {/* Modal content */}
                <div className="z-50 w-full max-w-sm p-4 md:p-6 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-medium leading-6 text-gray-900">Xác nhận xóa</h3>
                    <button
                      onClick={() => setConfirmDelete({ show: false, id: null })}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs md:text-sm text-gray-500">
                      Bạn có chắc chắn muốn xóa nghệ sĩ này khỏi chương trình? Hành động này không thể hoàn tác.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete({ show: false, id: null })}
                      className="flex-1 px-4 py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={confirmDeleteArtist}
                      className="flex-1 px-4 py-2 text-xs md:text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
}