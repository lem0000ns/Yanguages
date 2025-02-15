"use client";

import React, { useState, useEffect } from "react";

const Configs = ({ setDiff, setLang }) => {
  const [username, setUsername] = useState("");
  const [scores, setScores] = useState([]);
  const [langScores, setLangScores] = useState([[]]);
  const languages = ["Spanish", "Korean", "Chinese"];

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  useEffect(() => {
    (async () => {
      if (username && username != "") {
        const res = await fetch(`http://localhost:8080/highscore/${username}`);
        const data = await res.json();
        setScores(data[0]);
      }
    })();
  }, [username]);

  useEffect(() => {
    const groupScores = [];
    let curScores = [];
    const temp = Object.keys(scores);
    // separating scores into groups of 3 (for each language)
    for (let i = 0; i < temp.length; i++) {
      const key = temp[i];
      const value = scores[key];
      curScores.push(`${key.substring(3)}: ${value}`);
      if ((i + 1) % 3 == 0) {
        groupScores.push(curScores);
        curScores = [];
      }
    }
    setLangScores(groupScores);
  }, [scores]);

  return (
    <div className="flex flex-col mx-auto">
      <div className="flex flex-row space-x-4 mx-auto items-center justify-content">
        <p
          className="hover:cursor-pointer text-green-100 hover:text-green-200"
          onClick={() => setDiff("easy")}
        >
          Easy
        </p>
        <p
          className="hover:cursor-pointer text-orange-100 hover:text-orange-200"
          onClick={() => setDiff("med")}
        >
          Medium
        </p>
        <p
          className="hover:cursor-pointer text-red-200 hover:text-red-300"
          onClick={() => setDiff("hard")}
        >
          Hard
        </p>
      </div>
      <div className="flex flex-row space-x-4 mx-auto items-center justify-center mt-4">
        <p className="hover:cursor-pointer" onClick={() => setLang("sp")}>
          Spanish
        </p>
        <p className="hover:cursor-pointer" onClick={() => setLang("kr")}>
          Korean
        </p>
        <p className="hover:cursor-pointer" onClick={() => setLang("zh")}>
          Chinese
        </p>
      </div>
      {langScores.length > 0 ? (
        <div className="flex flex-col mx-auto items-center justify-center mt-16 space-y-4">
          <b className="text-4xl text-sky-100 mb-4 border-t border-b p-2 md:w-[500px] w-[300px] flex justify-center">
            High Scores
          </b>
          {langScores.map((lang, i) => (
            <div key={i}>
              <b className="flex justify-center mx-auto text-1xl">
                {languages[i]}
              </b>
              <p className="flex flex-row space-x-4">
                {lang.map((diff, j) => (
                  <span key={j}>{diff}</span>
                ))}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sky-100 mt-12">
          Log in to keep track of high scores!
        </div>
      )}
    </div>
  );
};

export default Configs;
