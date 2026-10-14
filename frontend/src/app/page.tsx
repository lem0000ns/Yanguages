"use client";
import { API_URL } from "./config";
import React, { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import DifficultyLabel from "./ui/DifficultyLabel";

type WordEntry = {
  english?: string;
  spanish?: string;
  korean?: string;
  chinese?: string;
  pinyin?: string;
  def?: string;
  diff?: string;
  freq?: string;
  pronunciation?: string;
};

export default function Home() {
  const [wordInfo, setWordInfo] = useState<WordEntry[]>();
  const [newWord, setNewWord] = useState(true);
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem("dateToday");
    if (today != storedDate) {
      localStorage.removeItem("entry");
      localStorage.removeItem("title");
      fetch(`${API_URL}/api/word`)
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
      if (storedWord) setWordInfo(JSON.parse(storedWord));
    } else {
      setNewWord(!newWord);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const word = wordInfo?.[0];

  type Row = { label: string; value: string; zh?: boolean };

  const translationRows: Row[] = word
    ? [
        word.spanish ? { label: "Spanish", value: word.spanish } : null,
        word.korean ? { label: "Korean", value: word.korean } : null,
        word.chinese
          ? { label: "Chinese", value: word.chinese, zh: true }
          : null,
        word.pronunciation
          ? { label: "IPA", value: word.pronunciation }
          : null,
      ].filter(Boolean) as Row[]
    : [];

  return (
    <div className="page-container flex min-h-[calc(100dvh-var(--nav-mobile-header)-var(--nav-mobile-tabs)-env(safe-area-inset-bottom))] flex-col md:min-h-[calc(100dvh-2rem)]">
      <header className="mb-8 text-center animate-slide-up md:mb-10">
        <h1 className="page-title">Word of the day</h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center pb-8">
        {!word ? (
          <div className="card-surface flex w-full max-w-md flex-col items-center gap-4 px-8 py-16 text-violet-300/70">
            <div className="h-10 w-10 animate-pulse-soft rounded-full bg-violet-600/30" />
            <p>Loading…</p>
          </div>
        ) : (
          <article className="relative w-full max-w-2xl overflow-hidden animate-slide-up">
            <div className="card-surface overflow-hidden">
              <div className="border-b border-border-subtle bg-gradient-to-r from-violet-950/80 to-indigo-950/40 px-6 py-8 md:px-10 md:py-10">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="font-display text-4xl font-semibold leading-tight text-white md:text-5xl">
                    {word.english}
                  </h2>
                  <DifficultyLabel diff={word.diff} />
                </div>
                {word.def && (
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-violet-200/75 md:text-lg">
                    {word.def}
                  </p>
                )}
              </div>

              {translationRows.length > 0 && (
                <ul className="divide-y divide-border-subtle">
                  {translationRows.map((t) => (
                    <li
                      key={t.label}
                      className="grid gap-1 px-6 py-4 md:grid-cols-[6rem_1fr] md:gap-4 md:px-10"
                    >
                      <span className="text-xs font-medium uppercase tracking-wider text-violet-400/70">
                        {t.label}
                      </span>
                      <span
                        className={`text-lg text-violet-50 ${t.zh ? "zh-section w-fit cursor-default underline decoration-violet-500/30 decoration-dotted underline-offset-4" : ""}`}
                      >
                        {t.value}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {word.pinyin && (
                <Tooltip anchorSelect=".zh-section" place="top">
                  {word.pinyin}
                </Tooltip>
              )}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
