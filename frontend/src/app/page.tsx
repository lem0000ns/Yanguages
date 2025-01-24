"use client";
import Navbar from "./ui/Navbar";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [wordInfo, setWordInfo] = useState([""]);
  const [newWord, setNewWord] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem("dateToday");
    if (today != storedDate) {
      localStorage.removeItem("entry");
      localStorage.removeItem("title");
      fetch(`http://localhost:8080/api/word`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Not able to connect to backend");
          }
          return response.json();
        })
        .then((data) => {
          setWordInfo(data);
          localStorage.setItem("wordInfo", JSON.stringify(data));
          localStorage.setItem("dateToday", today);
        })
        .catch((error) => {
          console.error("There was an error retrieving data: ", error);
        });
    }
  }, [newWord]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem("dateToday");
    if (storedDate === today) {
      const storedWord = localStorage.getItem("wordInfo");
      setWordInfo(JSON.parse(storedWord));
    } else {
      setNewWord(!newWord);
    }
    const temp = localStorage.getItem("username");
    setUsername(temp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <Navbar username={username} />
      <div className="flex flex-col items-center justify-center mx-auto mt-8 space-y-8">
        <div className="lg:text-4xl text-3xl w-3/4 flex justify-center mx-auto mt-16">
          The word of the day is...
        </div>
        <div className="flex text-center lg:w-1/5 w-2/3">
          {wordInfo.map((word, index) => (
            <div className="text-left flex flex-col space-y-4" key={index}>
              {Object.entries(word).map(([key, value]) => (
                <div
                  className="text-xl hover:bg-violet-800/60 rounded-2xl p-1 transition duration-300 ease-in-out"
                  key={key}
                >
                  <strong>{key}: </strong>
                  {value}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
