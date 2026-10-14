"use client";
import React, { useState, useEffect } from "react";
import Calendar from "../components/Calendar";
import Tags from "../components/Tags";
import SearchTags from "../components/SearchTags";
import { apiFetch } from "../session";
import { useSession } from "../useSession";

interface Props {
  searchTags: string[];
  setSearchTags: (tags: string[]) => void;
  handleTagSearch: () => void;
  day: Date;
}

const Entry = ({ searchTags, setSearchTags, handleTagSearch, day }: Props) => {
  const { username } = useSession();
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [diaryTags, setDiaryTags] = useState<string[]>([]);

  useEffect(() => {
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
        const res = await apiFetch(
          `/diary/${encodeURIComponent(formattedDate)}`
        );
        const data = await res.json();
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
  }, [date, username]);

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
      if (!username) return;
      if (entry != "" || title != "") {
        await localStorage.setItem("entry", entry);
        await localStorage.setItem("title", title);
        const res = await apiFetch("/diary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            entry,
            date: formattedDate,
            diaryTags,
          }),
        });
        if (res.ok) {
          setSaving("Saved!");
        }
      } else if (formattedDate == formattedDay) {
        const res = await apiFetch("/diary", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ date: formattedDay }),
        });
        if (res.ok) {
          setSaving("Saved!");
        }
      }
    }, 1000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, title, diaryTags, username]);

  const disabled = !username || message.length > 0;

  return (
    <div className="page-container max-w-4xl">
      <header className="mb-6 animate-slide-up">
        <h1 className="page-title">Dear diary…</h1>
      </header>

      <div className="relative z-20 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="card-surface relative z-30 px-4 py-3">
          <Calendar day={day} setDate={setDate} />
        </div>
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
          username={username}
        />
      </div>

      <div className="relative z-0 card-surface overflow-hidden animate-slide-up">
        <div className="border-b border-border-subtle px-4 py-3 md:px-6">
          <input
            type="text"
            placeholder="Title for this entry"
            className="w-full bg-transparent text-xl font-medium placeholder:text-violet-400/40 focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={disabled}
          />
        </div>
        <textarea
          placeholder="What's on your mind?"
          className="min-h-[16rem] w-full resize-y bg-transparent px-4 py-4 text-violet-50/95 placeholder:text-violet-400/35 focus:outline-none md:min-h-[20rem] md:px-6 md:py-5 md:text-lg leading-relaxed"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          disabled={disabled}
        />
        <div className="border-t border-border-subtle bg-surface-muted px-4 py-4 md:px-6">
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
        </div>
      </div>

      <div className="mt-4 flex min-h-[1.5rem] justify-center gap-4 text-sm font-medium">
        {saving && !message && (
          <span className="text-emerald-300/90">{saving}</span>
        )}
        {message && <span className="text-red-300/90">{message}</span>}
      </div>

      {!username && (
        <p className="mt-8 text-center text-violet-300/70">
          Sign in to write and sync your diary.
        </p>
      )}
    </div>
  );
};

export default Entry;
