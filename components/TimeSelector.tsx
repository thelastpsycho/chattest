'use client';

import { useState } from 'react';

interface TimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Generate time slots from 9:00 AM to 9:00 PM with 30-minute intervals
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 9; hour <= 21; hour++) {
    for (const minute of [0, 30]) {
      // Stop at 9:00 PM (21:00), don't go beyond
      if (hour === 21 && minute > 0) break;
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      slots.push(`${hourStr}:${minuteStr}`);
    }
  }
  return slots;
}

// Convert 24h time to display format (e.g., "09:00" -> "9:00 AM")
function formatTimeDisplay(time24: string): string {
  const [hourStr, minuteStr] = time24.split(':');
  const hour = parseInt(hourStr);
  const minute = minuteStr;

  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute} ${ampm}`;
}

export function TimeSelector({ value, onChange, disabled }: TimeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeSlots = generateTimeSlots();

  const displayValue = value ? formatTimeDisplay(value) : 'Select time';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-anvaya-teal ${
          disabled
            ? 'bg-gray-100 cursor-not-allowed'
            : 'bg-white border-anvaya-light-gray hover:border-anvaya-teal cursor-pointer'
        }`}
      >
        {displayValue}
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-anvaya-light-gray rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {timeSlots.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => {
                onChange(time);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left hover:bg-[#f0fdfa] transition-colors ${
                value === time ? 'bg-[#f0fdfa] font-medium text-anvaya-teal' : ''
              }`}
            >
              {formatTimeDisplay(time)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
