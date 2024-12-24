import React, { useState, useEffect } from "react";

const Result = ({
  options,
  wordInfo,
  streak,
  word,
  setAnswered,
  setStreak,
  lang,
  diff,
}) => {
  const [username, setUsername] = useState(() =>
    localStorage.getItem("username")
  );

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  return (
    <div>
      <b className="flex justify-center mx-auto">{word}</b>
      <div className="flex flex-row mx-auto space-x-4 justify-center mt-4">
        {options.map((item, index) => (
          <div key={index}>
            <p
              onClick={(e: React.MouseEvent<HTMLParagraphElement>) => {
                const text = (e.target as HTMLParagraphElement).innerText;
                if (text == wordInfo[0].english) {
                  setAnswered("Correct!");
                  setStreak(streak + 1);
                } else {
                  setAnswered(
                    `The correct answer was ${wordInfo[0].english}.\nYou answered ${streak} in a row correctly`
                  );
                  if (username) {
                    fetch("http://localhost:8080/highscore", {
                      method: "post",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ lang, diff, streak, username }),
                    });
                  }
                  setStreak(0);
                }
              }}
              className="hover:cursor-pointer"
            >
              {item.english}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Result;
