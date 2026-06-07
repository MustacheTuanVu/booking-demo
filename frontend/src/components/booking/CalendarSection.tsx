'use client'

import { cn } from '@/lib/utils'
import React from 'react'
import { motion } from 'framer-motion'

interface CalendarDay {
  isOtherMonth: boolean
  date: Date
  dateString: string
  day: string
  weekday: string
  isToday: boolean
  hasEvents?: boolean
  isPastDate?: boolean
}

interface CalendarSectionProps {
  monthDays: CalendarDay[]
  selectedDate: string
  handleDateClick: (dateString: string) => void
  weekdayNames: string[]
}

export default function CalendarSection({
  monthDays,
  selectedDate,
  handleDateClick,
  weekdayNames,
}: CalendarSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Calendar Header - Weekday Labels */}
      <div className="grid grid-cols-7 mb-2 px-1">
        {weekdayNames.map((day) => (
          <div key={day} className="text-xs font-medium text-center text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <motion.div
        className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
        whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', transition: { duration: 0.08 } }}
      >
        <div className="grid grid-cols-7 gap-px bg-gray-100">
          {monthDays.map((day) => (
            <motion.button
              key={day.dateString}
              onClick={() => handleDateClick(day.dateString)}
              className={cn(
                'flex flex-col items-center justify-center py-3 transition-all bg-white relative hover:z-10',
                selectedDate === day.dateString ? 'bg-gold-50' : 'hover:bg-gold-50/30',
                day.isToday && 'font-semibold',
                day.isOtherMonth && 'invisible' // Ẩn ngày tháng trước/sau nhưng giữ chỗ
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.05 }}
              whileHover={!day.isOtherMonth ? { y: -2, backgroundColor: 'rgba(251, 242, 215, 0.2)', transition: { duration: 0.05 } } : {}}
              whileTap={!day.isOtherMonth ? { y: 0, scale: 0.95, transition: { duration: 0.05 } } : {}}
            >
              <motion.div
                className={cn(
                  'w-9 h-9 flex items-center justify-center rounded-full mb-1 text-sm',
                  selectedDate === day.dateString
                    ? 'bg-gold-500 text-white shadow-md'
                    : day.isToday
                      ? 'bg-gold-100 text-gold-800'
                      : day.isPastDate
                        ? 'text-gray-400'
                        : 'text-gray-900',
                )}
                whileHover={!day.isOtherMonth && selectedDate !== day.dateString ? { scale: 1.1, transition: { duration: 0.05 } } : {}}
                whileTap={!day.isOtherMonth ? { scale: 0.9, transition: { duration: 0.05 } } : {}}
              >
                {day.day}
              </motion.div>
              {day.hasEvents && (
                <motion.div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    day.isPastDate ? "bg-gray-400" : "bg-gold-500"
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.05 }}
                  whileHover={{ scale: 1.5, transition: { duration: 0.05 } }}
                ></motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
