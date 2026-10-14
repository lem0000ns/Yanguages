"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { apiFetch } from "../session";
import { useSession } from "../useSession";

const languages = ["Spanish", "Korean", "Chinese"];

const diffOptions = [
  {
    id: "easy",
    label: "Easy",
    active: "border-emerald-500/50 bg-emerald-950/40 text-emerald-200",
  },
  {
    id: "med",
    label: "Medium",
    active: "border-orange-500/50 bg-orange-950/40 text-orange-200",
  },
  {
    id: "hard",
    label: "Hard",
    active: "border-red-500/50 bg-red-950/40 text-red-200",
  },
];

const langOptions = [
  { code: "sp", label: "Spanish" },
  { code: "kr", label: "Korean" },
  { code: "zh", label: "Chinese" },
];

export function GameControls({
  setDiff,
  setLang,
  diff,
  lang,
  open,
  onToggle,
}: {
  setDiff: (d: string) => void;
  setLang: (l: string) => void;
  diff: string;
  lang: string;
  open: boolean;
  onToggle: () => void;
}) {
  const langLabel =
    langOptions.find((l) => l.code === lang)?.label ?? lang;
  const diffLabel =
    diffOptions.find((d) => d.id === diff)?.label ??
    (diff === "med" ? "Medium" : diff);

  return (
    <div className="card-surface overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-violet-950/30 md:px-5"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-violet-100">Settings</span>
        <span className="flex items-center gap-2 text-xs text-violet-400/80">
          {!open && (
            <>
              <span>{langLabel}</span>
              <span aria-hidden>·</span>
              <span>{diffLabel}</span>
            </>
          )}
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div
            className={`space-y-4 border-t border-border-subtle p-4 transition-opacity duration-300 md:p-5 ${open ? "opacity-100" : "opacity-0"}`}
          >
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-violet-400/70">
                Difficulty
              </p>
              <div className="flex flex-wrap gap-2">
                {diffOptions.map(({ id, label, active }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDiff(id)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      diff === id
                        ? active
                        : "border-border-subtle text-violet-300/70 hover:border-border-strong hover:bg-violet-950/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-violet-400/70">
                Language
              </p>
              <div className="flex flex-wrap gap-2">
                {langOptions.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      lang === code
                        ? "border-violet-500/50 bg-violet-950/50 text-white shadow-glow-sm"
                        : "border-border-subtle text-violet-300/70 hover:border-border-strong"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HighScores() {
  const { username } = useSession();
  const [scores, setScores] = useState([]);
  const [langScores, setLangScores] = useState([[]]);

  useEffect(() => {
    (async () => {
      if (username && username != "") {
        const res = await apiFetch("/highscore");
        const data = await res.json();
        setScores(data[0]);
      }
    })();
  }, [username]);

  useEffect(() => {
    const groupScores = [];
    let curScores = [];
    const temp = Object.keys(scores);
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

  if (langScores.length > 0 && langScores[0]?.length > 0) {
    return (
      <div className="card-surface px-6 py-6">
        <h2 className="font-display text-xl font-semibold text-sky-100/95">
          High scores
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {langScores.map((lang, i) => (
            <div key={i}>
              <p className="mb-2 text-sm font-semibold text-violet-200">
                {languages[i]}
              </p>
              <ul className="space-y-1 text-sm text-violet-300/80">
                {lang.map((entry, j) => (
                  <li key={j}>
                    {entry.substring(entry.length - 4) == "null"
                      ? entry.substring(0, entry.length - 4) + "0"
                      : entry}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <p className="text-center text-sm text-violet-400/60">
      Sign in to track high scores across languages.
    </p>
  );
}

/** @deprecated Use GameControls + HighScores on the game page */
const Configs = ({ setDiff, setLang }) => {
  const [diff, setDiffLocal] = useState("easy");
  const [lang, setLangLocal] = useState("sp");
  const [open, setOpen] = useState(true);

  return (
    <GameControls
      setDiff={(d) => {
        setDiffLocal(d);
        setDiff(d);
      }}
      setLang={(l) => {
        setLangLocal(l);
        setLang(l);
      }}
      diff={diff}
      lang={lang}
      open={open}
      onToggle={() => setOpen(!open)}
    />
  );
};

export default Configs;
