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
  }, []);

  return (
    <div>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        className="text-center text-purple-100 bg-violet-950/75 p-1 rounded rounded-2xl"
        maxDate={new Date()}
      />
    </div>
  );
};

export default Calendar;
