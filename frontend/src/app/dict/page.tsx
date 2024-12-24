"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../ui/Navbar";

const Dict = () => {
  const [dictWords, setDictWords] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  useEffect(() => {
    const storedWords = JSON.parse(localStorage.getItem("storedWords"));
    setDictWords(storedWords);
  }, []);

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
  );
};

export default Dict;
