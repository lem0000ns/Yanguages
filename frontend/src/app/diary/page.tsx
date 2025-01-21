/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../ui/Navbar";
import Calendar from "../components/Calendar";
import Tags from "../components/Tags";

const Diary = () => {
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [diaryTags, setDiaryTags] = useState<string[]>([]);
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
    setEntry(localStorage.getItem("entry") || "");
    setTitle(localStorage.getItem("title") || "");
    setMessage("");
    setSaving("");
    setDate(today);
  }, []);

  useEffect(() => {
    const fetchDiary = async () => {
      if (username != "") {
        const res = await fetch(
          `http://localhost:8080/diary/${username}/${encodeURIComponent(date)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          console.log("Found something!");
          if (data[0].entry != "undefined") setEntry(data[0].entry);
          else setEntry("");
          if (data[0].title != "undefined") setTitle(data[0].title);
          else setTitle("");
          setMessage("");
        } else {
          setEntry("");
          setTitle("");
          setMessage(date != today ? "No diary found on this date" : "");
        }
      }
    };
    fetchDiary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    setSaving("...");
    const intervalId = setInterval(async () => {
      if (entry != "" || title != "") {
        await localStorage.setItem("entry", entry);
        await localStorage.setItem("title", title);
        const res = await fetch(`http://localhost:8080/diary`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, title, entry, date }),
        });
        if (res.ok) {
          setSaving("Saved!");
        }
      } else {
        if (date == today) {
          const res = await fetch("http://localhost:8080/diary", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, date }),
          });
          if (res.ok) {
            setSaving("Saved!");
          }
        }
      }
    }, 3000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, title]);

  return (
    <div>
      <Navbar username={username} />
      <div className="flex flex-col items-center justify-center mx-auto mt-8 space-y-2">
        <h1 className="text-2xl">Dear diary...</h1>
        <Calendar setDate={setDate} />
      </div>
      <div className="flex flex-col mx-auto justify-center items-center mt-4">
        <input
          type="text"
          placeholder="title?"
          className="text-white bg-indigo-950 rounded-xl p-2 text-center w-1/3 mx-auto"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        ></input>
        <textarea
          placeholder="write here!"
          className="mt-2 rounded-3xl text-white bg-indigo-950 w-2/3 mx-auto h-64 p-3"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
        ></textarea>
        <Tags
          tags={diaryTags}
          addTags={(event) => setDiaryTags([...diaryTags, event.target.value])}
          removeTags={(indexToRemove) =>
            setDiaryTags(
              diaryTags.filter((_, index) => index !== indexToRemove)
            )
          }
        />
        {saving && !message && (
          <div className="flex justify-center mx-auto text-emerald-200 mt-3 font-bold">
            {saving}
          </div>
        )}
        {message && (
          <div className="flex justify-center mx-auto text-red-300 mt-3 font-bold">
            {message}
          </div>
        )}
      </div>
      {!username && (
        <div className="flex justify-center mx-auto text-sky-100 mt-12">
          Log in to write diaries!
        </div>
      )}
    </div>
  );
};

export default Diary;
