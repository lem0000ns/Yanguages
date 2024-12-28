"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../ui/Navbar";
import ReactCardFlip from "react-card-flip";

const Dict = () => {
  const [dictWords, setDictWords] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  useEffect(() => {
    (async () => {
      if (username && username != "") {
        const res = await fetch(`http://localhost:8080/dictionary/${username}`);
        const data = await res.json();
        setDictWords(data[0]);
      }
    })();
  }, [username]);

  return (
    <div>
      <Navbar username={username} />
      <div className="flex flex-col items-center justify-center mx-auto mt-8 space-y-8">
        <span>
          <b>My personal dictionary: </b>
          {dictWords ? dictWords.length : "0"} items
        </span>
        {dictWords &&
          dictWords.map((word, index) => (
            <div
              className="w-1/3 flex flex-col justify-center items-center mx-auto"
              key={index}
            >
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
  );
};

export default Dict;
