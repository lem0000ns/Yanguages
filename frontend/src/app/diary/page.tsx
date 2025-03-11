/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../ui/Navbar";
import Entry from "./Entry";
import { Roboto } from "next/font/google";

const roboto = Roboto({ subsets: ["latin"], weight: ["400"] });

const BackArrow = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-arrow-big-left-dash"
    >
      <path d="M19 15V9" />
      <path d="M15 15h-3v4l-7-7 7-7v4h3v6z" />
    </svg>
  );
};

const Diary = () => {
  const [username, setUsername] = useState("");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchEntries, setSearchEntries] = useState<>([]); // stores each diary entry as json object
  const [curDay, setCurDay] = useState(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  );

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  useEffect(() => {
    console.log(searchEntries);
    console.log(searchEntries.length);
  }, [searchEntries]);

  const handleView = (date, title, entry) => {
    localStorage.setItem("entry", entry);
    localStorage.setItem("title", title);
    setCurDay(
      new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    );
    setSearchEntries([]);
    setSearchTags([]);
  };

  const SearchEntriesDisplay = () => {
    return (
      <div className="mt-16 sm:w-2/3 w-5/6 mx-auto">
        <div
          className="mb-8 flex flex-row hover:cursor-pointer items-center text-3xl"
          onClick={() => setSearchEntries([])}
        >
          <BackArrow />
          Go back?
        </div>
        {searchEntries.map(function (data) {
          return (
            <div
              className="flex flex-row border p-2 border-white space-x-4 hover:bg-violet-950"
              key={data.id}
            >
              <p className="w-[12.5%] overflow-x-auto whitespace-nowrap">
                {data.date}
              </p>
              <p className="w-[13%] overflow-x-auto whitespace-nowrap">
                {data.title}
              </p>
              <p className="w-[64.5%] overflow-x-auto whitespace-nowrap">
                {data.entry}
              </p>
              <p
                className="w-[10%] overflow-x-auto whitespace-nowrap hover:cursor-pointer"
                onClick={() => handleView(data.date, data.title, data.entry)}
              >
                View?
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const handleTagSearch = async () => {
    console.log("magnifying glass clicked!");
    if (searchTags.length > 0) {
      try {
        const queryParams = new URLSearchParams({
          username: username,
          searchTags: searchTags.join(","),
        });
        const res = await fetch(
          `https://yanguages-production.up.railway.app/tags/?${queryParams}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setSearchEntries(data[0] || []);
        }
      } catch (e) {
        console.error("Error fetching entries with given tags", e);
      }
    }
  };

  return (
    <div>
      <Navbar username={username} />
      <div className={roboto.className}>
        {searchEntries.length == 0 && (
          <Entry
            searchTags={searchTags}
            setSearchTags={setSearchTags}
            handleTagSearch={handleTagSearch}
            day={curDay}
          />
        )}
        {searchEntries.length > 0 && <SearchEntriesDisplay />}
      </div>
    </div>
  );
};

export default Diary;
