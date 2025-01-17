"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Calendar = ({ setDate }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const handleDateChange = (date) => {
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    setSelectedDate(date);
    setDate(formattedDate);
  };

  useEffect(() => {
    setSelectedDate(new Date().toLocaleDateString());
  }, []);

  return (
    <div>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="MM/DD/YYYY"
        className="text-center text-purple-100 bg-violet-950/75 p-1 rounded rounded-2xl"
      />
    </div>
  );
};

export default Calendar;
