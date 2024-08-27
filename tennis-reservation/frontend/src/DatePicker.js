// src/DatePicker.js
import React from 'react';
import { addDays, format } from 'date-fns';

const DatePicker = ({ selectedDate, onDateChange }) => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) =>
    addDays(today, i)
  );

  return (
    <div className="date-picker">
      <select
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
      >
        <option value="" disabled>Select a date</option>
        {days.map(day => (
          <option key={format(day, 'yyyy-MM-dd')} value={format(day, 'yyyy-MM-dd')}>
            {format(day, 'dd MMM yyyy')}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DatePicker;
