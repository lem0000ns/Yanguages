/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../ui/Navbar";
import Entry from "./Entry";

const Diary = () => {
  const [username, setUsername] = useState("");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchEntries, setSearchEntries] = useState<int>([]); // only stores ID's for now

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const queryParams = new URLSearchParams({
          username: username,
          searchTags: searchTags.join(","),
        });
        const res = await fetch(`http://localhost:8080/diary/${queryParams}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = res.json();
        if (res.ok) {
          setSearchEntries(data.searchEntries || []);
        }
      } catch (e) {
        console.error("Error fetching entries with given tags", e);
      }
    };
    fetchEntries();
  }, [searchTags]);

  return (
    <div>
      <Navbar username={username} />
      <Entry searchTags={searchTags} setSearchTags={setSearchTags} />
    </div>
  );
};

export default Diary;
