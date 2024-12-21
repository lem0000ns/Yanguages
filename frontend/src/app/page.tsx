"use client";
import Navbar from "./ui/Navbar";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [wordInfo, setWordInfo] = useState([""]);
  const [newWord, setNewWord] = useState(true);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = sessionStorage.getItem("dateToday");
    if (today != storedDate) {
      fetch(`http://localhost:8080/api/word`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Not able to connect to backend");
          }
          return response.json();
        })
        .then((data) => {
          setWordInfo(data);
          sessionStorage.setItem("wordInfo", JSON.stringify(data));
          sessionStorage.setItem("dateToday", new Date().toDateString());
        })
        .catch((error) => {
          console.error("There was an error retrieving data: ", error);
        });
    }
  }, [newWord]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = sessionStorage.getItem("dateToday");
    if (storedDate === today) {
      const storedWord = sessionStorage.getItem("wordInfo");
      setWordInfo(JSON.parse(storedWord));
    } else {
      setNewWord(!newWord);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <Navbar username={sessionStorage.getItem("username")} />
      <div className="flex flex-col items-center justify-center mx-auto mt-8 space-y-8">
        <div>The word of the day is...</div>
        <div className="flex text-center justify-center mx-auto w-1/5">
          {wordInfo.map((word, index) => (
            <div key={index}>
              {Object.entries(word).map(([key, value]) => (
                <div key={key}>
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
