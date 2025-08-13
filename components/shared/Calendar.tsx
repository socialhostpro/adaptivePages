/**
 * Calendar and DatePicker Components - Range selection for analytics
 * Part of the AdaptivePages Shared Component System
 */

import React, { useState, useCallback, useEffect } from 'react';

// Types
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface CalendarProps {
  // Value
  value?: Date | DateRange;
  onChange?: (date: Date | DateRange) => void;
  
  // Mode
  mode?: 'single' | 'range';
  
  // Constraints
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  
  // Display
  showToday?: boolean;
  showWeekNumbers?: boolean;
  firstDayOfWeek?: 0 | 1; // 0 = Sunday, 1 = Monday
  
  // Styling
  size?: 'small' | 'medium' | 'large';
  className?: string;
  
  // Events
  onMonthChange?: (month: number, year: number) => void;
  onYearChange?: (year: number) => void;
}

export interface DatePickerProps extends CalendarProps {
  // Input specific
  placeholder?: string;
  format?: string;
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
  
  // Dropdown
  placement?: 'bottom' | 'top';
  
  // Presets for range selection
  presets?: Array<{
    label: string;
    value: DateRange;
  }>;
}

// Utility functions
const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const isDateInRange = (date: Date, range: DateRange): boolean => {
  if (!range.start || !range.end) return false;
  return date >= range.start && date <= range.end;
};

const isDateDisabled = (date: Date, minDate?: Date, maxDate?: Date, disabledDates?: Date[]): boolean => {
  if (minDate && date < minDate) return true;
  if (maxDate && date > maxDate) return true;
  if (disabledDates?.some(disabled => isSameDay(date, disabled))) return true;
  return false;
};

const getMonthDays = (year: number, month: number, firstDayOfWeek: number = 0): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Calculate how many days from previous month to show
  const firstDayWeekday = firstDay.getDay();
  const daysFromPrevMonth = (firstDayWeekday - firstDayOfWeek + 7) % 7;
  
  // Calculate how many days from next month to show (to fill 6 weeks)
  const totalCells = 42; // 6 weeks × 7 days
  const daysFromNextMonth = totalCells - daysFromPrevMonth - daysInMonth;
  
  const days: Date[] = [];
  
  // Previous month days
  for (let i = daysFromPrevMonth; i > 0; i--) {
    days.push(new Date(year, month, -i + 1));
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  
  // Next month days
  for (let i = 1; i <= daysFromNextMonth; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};

export function Calendar({
  value,
  onChange,
  mode = 'single',
  minDate,
  maxDate,
  disabledDates = [],
  showToday = true,
  showWeekNumbers = false,
  firstDayOfWeek = 0,
  size = 'medium',
  className = '',
  onMonthChange,
  onYearChange
}: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const cellSizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-10 w-10',
    large: 'h-12 w-12'
  };

  const monthDays = getMonthDays(currentYear, currentMonth, firstDayOfWeek);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  if (firstDayOfWeek === 1) {
    weekDays.push(weekDays.shift()!);
  }

  const handleDateClick = useCallback((date: Date) => {
    if (isDateDisabled(date, minDate, maxDate, disabledDates)) return;

    if (mode === 'single') {
      onChange?.(date);
    } else if (mode === 'range') {
      const currentRange = value as DateRange || { start: null, end: null };
      
      if (!currentRange.start || (currentRange.start && currentRange.end)) {
        // Start new range
        onChange?.({ start: date, end: null });
      } else if (currentRange.start && !currentRange.end) {
        // Complete range
        if (date < currentRange.start) {
          onChange?.({ start: date, end: currentRange.start });
        } else {
          onChange?.({ start: currentRange.start, end: date });
        }
      }
    }
  }, [mode, value, onChange, minDate, maxDate, disabledDates]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    let newMonth = currentMonth;
    let newYear = currentYear;
    
    if (direction === 'prev') {
      newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    } else {
      newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    onMonthChange?.(newMonth, newYear);
  }, [currentMonth, currentYear, onMonthChange]);

  const getDateClasses = (date: Date) => {
    const isCurrentMonth = date.getMonth() === currentMonth;
    const isToday = showToday && isSameDay(date, today);
    const isDisabled = isDateDisabled(date, minDate, maxDate, disabledDates);
    
    let isSelected = false;
    let isInRange = false;
    let isRangeStart = false;
    let isRangeEnd = false;
    
    if (mode === 'single' && value instanceof Date) {
      isSelected = isSameDay(date, value);
    } else if (mode === 'range' && value) {
      const range = value as DateRange;
      if (range.start && range.end) {
        isSelected = isSameDay(date, range.start) || isSameDay(date, range.end);
        isInRange = isDateInRange(date, range);
        isRangeStart = range.start && isSameDay(date, range.start);
        isRangeEnd = range.end && isSameDay(date, range.end);
      } else if (range.start) {
        isSelected = isSameDay(date, range.start);
      }
    }

    return [
      'flex items-center justify-center transition-colors duration-150 cursor-pointer',
      cellSizeClasses[size],
      isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600',
      isToday && !isSelected ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' : '',
      isSelected ? 'bg-blue-600 text-white font-semibold' : '',
      isInRange && !isSelected ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : '',
      isRangeStart ? 'rounded-l-full' : '',
      isRangeEnd ? 'rounded-r-full' : '',
      !isInRange && !isSelected ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : '',
      isDisabled ? 'cursor-not-allowed opacity-50' : '',
      !isSelected && !isToday && !isInRange ? 'rounded-full' : ''
    ].filter(Boolean).join(' ');
  };

  return (
    <div className={`calendar ${sizeClasses[size]} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Previous month"
        >
          ←
        </button>
        
        <h2 className="font-semibold text-gray-900 dark:text-white">
          {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50 dark:bg-gray-800">
        {showWeekNumbers && <div className="text-xs text-gray-500 text-center py-2">W</div>}
        {weekDays.map((day) => (
          <div key={day} className="text-xs text-gray-500 dark:text-gray-400 text-center py-2 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="p-2">
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {showWeekNumbers && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                {/* Week number calculation would go here */}
              </div>
            )}
            {monthDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => (
              <button
                key={`${weekIndex}-${dayIndex}`}
                onClick={() => handleDateClick(date)}
                disabled={isDateDisabled(date, minDate, maxDate, disabledDates)}
                className={getDateClasses(date)}
                aria-label={formatDate(date, 'YYYY-MM-DD')}
              >
                {date.getDate()}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DatePicker({
  value,
  onChange,
  mode = 'single',
  placeholder = 'Select date',
  format = 'YYYY-MM-DD',
  clearable = true,
  disabled = false,
  error,
  placement = 'bottom',
  presets = [],
  className = '',
  ...calendarProps
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Update input value when value changes
  useEffect(() => {
    if (mode === 'single' && value instanceof Date) {
      setInputValue(formatDate(value, format));
    } else if (mode === 'range' && value) {
      const range = value as DateRange;
      if (range.start && range.end) {
        setInputValue(`${formatDate(range.start, format)} - ${formatDate(range.end, format)}`);
      } else if (range.start) {
        setInputValue(formatDate(range.start, format));
      } else {
        setInputValue('');
      }
    } else {
      setInputValue('');
    }
  }, [value, mode, format]);

  const handleInputClick = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [disabled, isOpen]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(mode === 'range' ? { start: null, end: null } : null as any);
    setInputValue('');
  }, [onChange, mode]);

  const handleCalendarChange = useCallback((date: Date | DateRange) => {
    onChange?.(date);
    if (mode === 'single' || (mode === 'range' && (date as DateRange).end)) {
      setIsOpen(false);
    }
  }, [onChange, mode]);

  const handlePresetClick = useCallback((preset: DateRange) => {
    onChange?.(preset);
    setIsOpen(false);
  }, [onChange]);

  // Default presets for range mode
  const defaultPresets = [
    {
      label: 'Today',
      value: { start: new Date(), end: new Date() }
    },
    {
      label: 'Yesterday',
      value: (() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: yesterday };
      })()
    },
    {
      label: 'Last 7 days',
      value: {
        start: (() => {
          const date = new Date();
          date.setDate(date.getDate() - 6);
          return date;
        })(),
        end: new Date()
      }
    },
    {
      label: 'Last 30 days',
      value: {
        start: (() => {
          const date = new Date();
          date.setDate(date.getDate() - 29);
          return date;
        })(),
        end: new Date()
      }
    },
    {
      label: 'This month',
      value: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date()
      }
    }
  ];

  const availablePresets = presets.length > 0 ? presets : (mode === 'range' ? defaultPresets : []);

  return (
    <div className={`date-picker relative ${className}`}>
      {/* Input */}
      <div
        onClick={handleInputClick}
        className={`flex items-center px-3 py-2 border rounded-md bg-white dark:bg-gray-800 cursor-pointer transition-colors ${
          error
            ? 'border-red-300 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500'}`}
      >
        <span className="text-gray-400 dark:text-gray-500 mr-2">📅</span>
        <input
          type="text"
          value={inputValue}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 cursor-pointer"
        />
        {clearable && inputValue && !disabled && (
          <button
            onClick={handleClear}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
            aria-label="Clear date"
          >
            ✕
          </button>
        )}
        <span className="text-gray-400 dark:text-gray-500 ml-2">
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${
          placement === 'top' ? 'bottom-full mb-1' : 'top-full'
        }`}>
          <div className="flex">
            {/* Presets */}
            {availablePresets.length > 0 && (
              <div className="border-r border-gray-200 dark:border-gray-700 p-2 w-48">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Quick Select</h3>
                <div className="space-y-1">
                  {availablePresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetClick(preset.value)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar */}
            <Calendar
              {...calendarProps}
              value={value}
              onChange={handleCalendarChange}
              mode={mode}
            />
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
