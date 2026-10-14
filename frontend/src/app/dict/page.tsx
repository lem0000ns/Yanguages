"use client";
import React, { useEffect, useState } from "react";
import DictItem from "../components/DictItem";
import DictModal from "../components/AddDictModal";
import { apiFetch } from "../session";
import { useSession } from "../useSession";
import { Library } from "lucide-react";

const Dict = () => {
  const [dictWords, setDictWords] = useState([]);
  const { username } = useSession();
  const [remove, setRemove] = useState(0);
  const [deleteIds, setDeleteIds] = useState([]);
  const [selectedLang, setSelectedLang] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (selectedLang == "" && username && username != "") {
        const res = await apiFetch("/dictionary");
        const data = await res.json();
        setDictWords(data[0]);
        setLoading(false);
      }
    })();
  }, [username, selectedLang]);

  const handleLangFilter = async () => {
    if (selectedLang != "") {
      if (username && username != "") {
        const res = await apiFetch(
          `/dictionary/${encodeURIComponent(selectedLang)}`
        );
        const data = await res.json();
        setDictWords(data[0]);
      }
    }
  };

  useEffect(() => {
    (async () => {
      if (remove == 2) {
        if (deleteIds.length == 0) {
          setRemove(0);
        } else {
          const res = await apiFetch("/dictionary", {
            method: "delete",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ deleteIds }),
          });
          const data = await res.json();
          if (res.ok) {
            console.log(data.message);
            location.reload();
            setRemove(0);
            setDeleteIds([]);
          } else {
            console.log(data.message);
          }
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remove]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setRemove(0);
        setDeleteIds([]);
      }
    };
    if (remove > 0) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        window.removeEventListener("keydown", handleEscape);
      };
    }
  });

  const handleRemove = async (e) => {
    e.preventDefault();
    setRemove(remove + 1);
  };

  return (
    <div className="page-container">
      <header className="mb-8 animate-slide-up">
        <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-violet-400/80">
          <Library className="h-3.5 w-3.5" />
          Personal library
        </p>
        <h1 className="page-title">My dictionary</h1>
        {username ? (
          <p className="page-subtitle">
            {dictWords && dictWords.length > 0
              ? `${dictWords.length} saved ${dictWords.length === 1 ? "word" : "words"}`
              : loading
              ? "Loading your collection…"
              : "Start adding words from the game or manually."}
          </p>
        ) : (
          <p className="page-subtitle">Sign in to build and manage your word list.</p>
        )}
      </header>

      {username ? (
        <>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <DictModal />
            <button
              type="button"
              className={
                remove <= 1 && deleteIds.length == 0 ? "btn-danger" : "btn-danger ring-2 ring-red-400/40"
              }
              onClick={handleRemove}
            >
              {remove > 0 ? `Confirm remove (${deleteIds.length})` : "Remove words"}
            </button>
            <div className="flex flex-1 gap-2 sm:max-w-xs">
              <input
                className="input-field"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                placeholder="Filter by language"
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    handleLangFilter();
                  }
                }}
              />
              <button type="button" className="btn-secondary shrink-0" onClick={handleLangFilter}>
                Go
              </button>
            </div>
          </div>

          {remove > 0 && (
            <p className="mb-6 text-center text-sm text-violet-300/70">
              Tap cards to select · Press Esc to cancel
            </p>
          )}

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dictWords &&
              dictWords.map((word, index) => (
                <li key={index} className="min-h-[8rem]">
                  <DictItem
                    deleteIds={deleteIds}
                    setDeleteIds={setDeleteIds}
                    word={word}
                    remove={remove}
                  />
                </li>
              ))}
          </ul>
        </>
      ) : (
        <div className="card-surface mx-auto max-w-md px-8 py-12 text-center text-violet-300/80">
          Log in to manage your personal dictionary.
        </div>
      )}
    </div>
  );
};

export default Dict;
