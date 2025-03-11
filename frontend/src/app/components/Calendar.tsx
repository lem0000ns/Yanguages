"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  day: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}

const Calendar = ({ day, setDate }: Props) => {
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
