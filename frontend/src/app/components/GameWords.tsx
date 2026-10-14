import React from "react";
import { apiFetch } from "../session";
import { useSession } from "../useSession";

const GameWords = ({
  options,
  wordInfo,
  streak,
  word,
  setAnswered,
  setStreak,
  lang,
  diff,
}) => {
  const { username } = useSession();

  return (
    <div className="mx-auto w-full max-w-lg">
      <p className="mb-8 text-center font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
        {word}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {options.map((item, index) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => {
                const text = item.english;
                if (text == wordInfo[0].english) {
                  setAnswered("Correct!");
                  setStreak(streak + 1);
                } else {
                  setAnswered(
                    `The correct answer was ${wordInfo[0].english}.\nYou answered ${streak} in a row correctly`
                  );
                  if (username) {
                    apiFetch("/highscore", {
                      method: "post",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ lang, diff, streak }),
                    });
                  }
                  setStreak(0);
                }
              }}
              className="card-surface-interactive w-full px-4 py-4 text-left text-base font-medium text-violet-100 hover:text-white active:scale-[0.99]"
            >
              {item.english}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameWords;
