"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../ui/Navbar";

const Diary = () => {
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
    setEntry(localStorage.getItem("entry") || "");
    setTitle(localStorage.getItem("title") || "");
    setMessage("");
    const date = new Date();
    const formattedDate = date.toLocaleDateString();
    setDate(formattedDate);
  }, []);

  useEffect(() => {
    localStorage.setItem("entry", entry);
    localStorage.setItem("title", title);
  }, [entry, title]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`http://localhost:8080/diary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, title, entry, date }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
      }
    })();
  }, [entry, username, title, date]);

  return (
    <div>
      <Navbar username={username} />
      <div className="flex justify-center mx-auto mt-8">
        <h1 className="text-2xl">Dear diary...</h1>
      </div>
      <div className="flex flex-col mx-auto justify-center mt-4">
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
        {message && (
          <div className="flex justify-center mx-auto text-emerald-400 mt-3">
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
