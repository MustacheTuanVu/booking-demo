"use client";

import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

interface DateTimePickerProps {
  /**
   * The current value of the date picker
   */
  value: Date | string | null;
  
  /**
   * Callback fired when the value changes
   */
  onChange: (date: Date | null) => void;
  
  /**
   * Label for the date picker
   */
  label?: string;
  
  /**
   * Whether the date picker is required
   */
  required?: boolean;
  
  /**
   * Whether to disable past dates
   */
  disablePast?: boolean;
  
  /**
   * Whether to disable future dates
   */
  disableFuture?: boolean;
  
  /**
   * Format for the date display
   */
  format?: string;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Additional class name
   */
  className?: string;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Helper text
   */
  helperText?: string;
  
  /**
   * Whether the date picker is disabled
   */
  disabled?: boolean;
  
  /**
   * Locale for the date picker
   */
  locale?: string;
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

const DateTimePickerComponent: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  required = false,
  disablePast = false,
  disableFuture = false,
  format = "DD/MM/YYYY HH:mm",
  placeholder,
  className = "",
  error,
  helperText,
  disabled = false,
  locale = "vi",
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const dayjsValue = value ? dayjs(value) : null;

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

  const handleDateChange = (newValue: any) => {
    onChange(newValue ? newValue.toDate() : null);
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
        <div className={className}>
          {label && (
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              {required && <span className="text-red-500 mr-1">*</span>}
              {label}
            </label>
          )}
          <MuiDateTimePicker
            value={dayjsValue}
            onChange={handleDateChange}
            format={format}
            ampm={false}
            open={isPickerOpen}
            onOpen={() => setIsPickerOpen(true)}
            onClose={() => setIsPickerOpen(false)}
            slotProps={{
              textField: {
                required: required,
                fullWidth: true,
                size: "small",
                error: !!error,
                helperText: error || helperText,
                placeholder: placeholder,
                disabled: disabled,
                InputProps: {
                  onClick: () => !disabled && setIsPickerOpen(true),
                  sx: {
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: error ? 'rgb(239, 68, 68)' : 'rgb(229, 231, 235)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: error ? 'rgb(239, 68, 68)' : '#c6a848',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: error ? 'rgb(239, 68, 68)' : '#c6a848',
                      borderWidth: '2px',
                    },
                  },
                },
                className: "rounded-md",
              },
              actionBar: {
                actions: ['clear', 'today', 'accept'],
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
            disablePast={disablePast}
            disableFuture={disableFuture}
            sx={{
              '& .MuiInputBase-root': {
                height: { xs: '45px', md: '50px' },
                borderRadius: '0.375rem',
              },
            }}
          />
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default DateTimePickerComponent;
