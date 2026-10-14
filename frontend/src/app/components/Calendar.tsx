"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Calendar = ({ day, setDate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const handleDateChange = (date) => {
    const formattedDate = new Date(date);
    setSelectedDate(date);
    setDate(formattedDate);
  };

  useEffect(() => {
    setSelectedDate(day);
  }, [day]);

  return (
    <div className="relative z-30">
      <p className="mb-2 text-sm text-violet-400/70">Date</p>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        className="input-field w-full max-w-[11rem] text-center text-purple-100"
        maxDate={new Date()}
        popperClassName="datepicker-popper"
        popperPlacement="bottom-start"
      />
    </div>
  );
};

export default Calendar;
