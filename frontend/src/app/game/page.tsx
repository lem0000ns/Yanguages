"use client";
import React, { useEffect, useState } from "react";
import { GameControls, HighScores } from "../components/Configs";
import GameWords from "../components/GameWords";
import AddDict from "../components/GameAddDict";
import { API_URL } from "../config";
import { useSession } from "../useSession";
import { usePathname } from "next/navigation";
import { Tooltip } from "react-tooltip";
import { Trophy } from "lucide-react";

function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex != 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

const diffStyles: Record<string, string> = {
  easy: "text-emerald-300 bg-emerald-950/40 border-emerald-500/30",
  med: "text-orange-200 bg-orange-950/40 border-orange-500/30",
  hard: "text-red-300 bg-red-950/40 border-red-500/30",
};

const langLabels: Record<string, string> = {
  sp: "Spanish",
  kr: "Korean",
  zh: "Chinese",
};

const Game = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wordInfo, setWordInfo] = useState<any[]>();
  const [word, setWord] = useState("");
  const [answered, setAnswered] = useState("");
  const [newWords, setNewWords] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diff, setDiff] = useState("easy");
  const [streak, setStreak] = useState(0);
  const [lang, setLang] = useState("sp");
  const [settingsOpen, setSettingsOpen] = useState(true);
  const pathname = usePathname();
  const { username } = useSession();

  useEffect(() => {
    if (pathname === "/game") {
      setSettingsOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    setLoading(true);
    setAnswered("");
    fetch(`${API_URL}/api/word/${diff}`)
      .then((response) => response.json())
      .then((data) => {
        setWordInfo(data);
        if (lang == "sp") setWord(data[0].spanish);
        else if (lang == "kr") setWord(data[0].korean);
        else if (lang == "zh") setWord(data[0].chinese);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newWords, diff, lang]);

  useEffect(() => {
    if (wordInfo) {
      fetch(`${API_URL}/api/options/${diff}`)
        .then((response) => response.json())
        .then((data) => {
          data.push({ english: wordInfo[0].english });
          shuffle(data);
          setOptions(data);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordInfo]);

  const handleAnswered = (msg: string) => {
    setAnswered(msg);
    setSettingsOpen(false);
  };

  const isCorrect = answered === "Correct!";

  return (
    <div className="page-container mx-auto w-full max-w-3xl">
      <header className="mb-6 animate-slide-up">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="page-title">Translation game</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-lg border px-3 py-1 text-sm font-medium capitalize ${diffStyles[diff] || diffStyles.easy}`}
            >
              {diff === "med" ? "medium" : diff}
            </span>
            <span className="rounded-lg border border-border-subtle bg-surface-muted px-3 py-1 text-sm text-violet-200">
              {langLabels[lang] ?? lang}
            </span>
            {streak > 0 && (
              <span className="flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-950/50 px-3 py-1 text-sm text-violet-200">
                <Trophy className="h-4 w-4 text-amber-400/90" />
                {streak} streak
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mb-6 space-y-6">
        <GameControls
          setDiff={setDiff}
          setLang={setLang}
          diff={diff}
          lang={lang}
          open={settingsOpen}
          onToggle={() => setSettingsOpen(!settingsOpen)}
        />

        <div className="card-surface px-5 py-8 sm:px-8 sm:py-10 animate-slide-up">
          {loading ? (
            <p className="py-12 text-center text-violet-300/60">Loading question…</p>
          ) : answered ? (
            <div className="mx-auto max-w-md space-y-4">
              {wordInfo?.map((w, index) => (
                <div key={index} className="space-y-3 text-center">
                  {Object.entries(w).map(([key, value]) =>
                    key != "freq" && key != "diff" && key != "pinyin" ? (
                      <div key={key}>
                        <span className="text-xs uppercase tracking-wider text-violet-400/70">
                          {key}
                        </span>
                        <p className="text-lg">
                          <span className={`${key == "chinese" ? "zh-section" : ""}`}>
                            {value as React.ReactNode}
                          </span>
                        </p>
                        <Tooltip anchorSelect=".zh-section" place="top">
                          {w.pinyin}
                        </Tooltip>
                      </div>
                    ) : null
                  )}
                </div>
              ))}
            </div>
          ) : (
            <GameWords
              options={options}
              wordInfo={wordInfo}
              streak={streak}
              word={word}
              setAnswered={handleAnswered}
              setStreak={setStreak}
              lang={lang}
              diff={diff}
            />
          )}
        </div>

        {answered && (
          <p
            className={`text-center text-lg font-medium animate-fade-in ${
              isCorrect ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {answered}
          </p>
        )}

        {answered.length > 0 && (
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setNewWords(!newWords)}
              className="btn-primary"
            >
              {answered[0] == "T" ? "Play again" : "Next question"}
            </button>
            {wordInfo?.[0] && (
              <AddDict
                term={word}
                define={wordInfo[0].english}
                lang={lang}
              />
            )}
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-border-subtle pt-8">
        <HighScores />
      </div>
    </div>
  );
};

export default Game;
