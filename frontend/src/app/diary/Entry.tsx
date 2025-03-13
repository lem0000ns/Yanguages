"use client";
import React, { useState, useEffect } from "react";
import Calendar from "../components/Calendar";
import Tags from "../components/Tags";
import SearchTags from "../components/SearchTags";

interface Props {
  searchTags: string[];
  setSearchTags: (tags: string[]) => void;
  handleTagSearch: () => void;
  day: Date;
}

const Entry = ({ searchTags, setSearchTags, handleTagSearch, day }: Props) => {
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [diaryTags, setDiaryTags] = useState<string[]>([]);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
    setEntry(localStorage.getItem("entry") || "");
    setTitle(localStorage.getItem("title") || "");
    setMessage("");
    setSaving("");
    setDate(day);
  }, [day]);

  useEffect(() => {
    const fetchDiary = async () => {
      if (username != "") {
        const formattedDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        const res = await fetch(
          `https://yanguages-production.up.railway.app/diary/${username}/${encodeURIComponent(
            formattedDate
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        console.log(data);
        if (res.ok) {
          if (data[0].entry != "undefined") setEntry(data[0].entry);
          else setEntry("");
          if (data[0].title != "undefined") setTitle(data[0].title);
          else setTitle("");
          setDiaryTags(data.diaryTags || []);
          setMessage("");
        } else {
          setEntry("");
          setTitle("");
          setMessage(date != day ? "No diary found on this date" : "");
          setDiaryTags([]);
        }
      }
    };
    fetchDiary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    setSaving(". . .");
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const formattedDay = day.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const intervalId = setInterval(async () => {
      if (username && (entry != "" || title != "")) {
        await localStorage.setItem("entry", entry);
        await localStorage.setItem("title", title);
        console.log("title", title);
        console.log(localStorage.getItem("title"));
        // update formatted date
        const res = await fetch(
          `https://yanguages-production.up.railway.app/diary`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              title,
              entry,
              date: formattedDate,
              diaryTags,
            }),
          }
        );
        if (res.ok) {
          console.log(res);
          setSaving("Saved!");
        }
      } else if (formattedDate == formattedDay) {
        const res = await fetch(
          "https://yanguages-production.up.railway.app/diary",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, date: formattedDay }),
          }
        );
        if (res.ok) {
          setSaving("Saved!");
        }
      }
    }, 1000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, title, diaryTags]);
  return (
    <div>
      <div className="flex flex-col items-left mx-auto sm:w-2/3 w-5/6 mt-16 space-y-4">
        <h1 className="text-2xl ml-4">Dear diary...</h1>
        <div className="flex flex-row items-center justify-between w-full">
          <Calendar day={day} setDate={setDate} />
          <SearchTags
            tags={searchTags}
            addTags={(event: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTags([...searchTags, event.target.value])
            }
            removeTags={(indexToRemove) =>
              setSearchTags(
                searchTags.filter((_, index) => index !== indexToRemove)
              )
            }
            handleTagSearch={handleTagSearch}
          />
        </div>
      </div>
      <div className="flex flex-col mx-auto items-left mx-auto sm:w-2/3 w-5/6 mt-4">
        <input
          type="text"
          placeholder="title?"
          className="text-white text-left bg-indigo-950 rounded-xl md:w-3/5 w-2/3 p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!username || message.length > 0 ? true : false}
        ></input>
        <textarea
          placeholder="write here!"
          className="mt-2 rounded-3xl text-white bg-indigo-950 h-64 p-3"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          disabled={!username || message.length > 0 ? true : false}
        ></textarea>
        <Tags
          tags={diaryTags}
          addTags={(event: React.ChangeEvent<HTMLInputElement>) =>
            setDiaryTags([...diaryTags, event.target.value])
          }
          removeTags={(indexToRemove) =>
            setDiaryTags(
              diaryTags.filter((_, index) => index !== indexToRemove)
            )
          }
          entry={entry}
          title={title}
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
        <div className="flex text-xl justify-center mx-auto text-sky-100 mt-12">
          Log in to write diaries!
        </div>
      )}
    </div>
  );
};

export default Entry;
