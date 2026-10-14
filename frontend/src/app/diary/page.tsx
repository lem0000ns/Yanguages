/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import Entry from "./Entry";
import { apiFetch } from "../session";
import { useSession } from "../useSession";
import { ArrowLeft } from "lucide-react";

const Diary = () => {
  const { username } = useSession();
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchEntries, setSearchEntries] = useState([]);
  const [curDay, setCurDay] = useState<Date>(new Date());

  const handleView = (date, title, entry) => {
    localStorage.setItem("entry", entry);
    localStorage.setItem("title", title);
    setCurDay(new Date(date));
    setSearchEntries([]);
    setSearchTags([]);
  };

  const SearchEntriesDisplay = () => {
    return (
      <div className="page-container animate-fade-in">
        <button
          type="button"
          className="btn-ghost mb-8 gap-2 pl-0 text-lg"
          onClick={() => setSearchEntries([])}
        >
          <ArrowLeft className="h-5 w-5" />
          Back to editor
        </button>
        <h2 className="page-title mb-6">Search results</h2>
        <ul className="flex flex-col gap-3">
          {searchEntries.map(function (data) {
            return (
              <li
                className="card-surface-interactive grid gap-3 p-4 sm:grid-cols-[minmax(0,7rem)_minmax(0,10rem)_1fr_auto] sm:items-center sm:gap-4"
                key={data.id}
              >
                <p className="text-sm text-violet-400/80">{data.date}</p>
                <p className="truncate font-medium">{data.title}</p>
                <p className="truncate text-sm text-violet-200/70">{data.entry}</p>
                <button
                  type="button"
                  className="btn-secondary shrink-0 text-xs sm:text-sm"
                  onClick={() => handleView(data.date, data.title, data.entry)}
                >
                  Open
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const handleTagSearch = async () => {
    if (searchTags.length > 0) {
      try {
        const queryParams = new URLSearchParams({
          searchTags: searchTags.join(","),
        });
        const res = await apiFetch(`/tags/?${queryParams}`);
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
      {searchEntries.length == 0 && (
        <Entry
          searchTags={searchTags}
          setSearchTags={setSearchTags}
          handleTagSearch={handleTagSearch}
          day={curDay}
        />
      )}
      {searchEntries.length > 0 && <SearchEntriesDisplay />}
      {!username && searchEntries.length === 0 && (
        <p className="pb-24 text-center text-violet-300/60 md:pb-8" />
      )}
    </div>
  );
};

export default Diary;
