"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../ui/Navbar";
import DictItem from "../components/DictItem";
import DictModal from "../components/AddDictModal";
import { Roboto } from "next/font/google";

const roboto = Roboto({ subsets: ["latin"], weight: ["400"] });

const Dict = () => {
  const [dictWords, setDictWords] = useState([]);
  const [username, setUsername] = useState("");
  const [remove, setRemove] = useState(0);
  const [deleteIds, setDeleteIds] = useState([]);
  const [selectedLang, setSelectedLang] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  useEffect(() => {
    (async () => {
      if (selectedLang == "" && username && username != "") {
        const res = await fetch(
          `https://yanguages-production.up.railway.app/dictionary/${username}`
        );
        const data = await res.json();
        setDictWords(data[0]);
        setLoading(false);
      }
    })();
  }, [username, selectedLang]);

  const handleLangFilter = async () => {
    if (selectedLang != "") {
      if (username && username != "") {
        const res = await fetch(
          `https://yanguages-production.up.railway.app/dictionary/${selectedLang}/${username}`
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
          const res = await fetch(
            "https://yanguages-production.up.railway.app/dictionary",
            {
              method: "delete",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ deleteIds }),
            }
          );
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
    <div>
      <Navbar username={username} />
      {username ? (
        <div
          className={`flex flex-col items-center justify-center mx-auto mt-8 ${roboto.className}`}
        >
          <div className="mb-4 text-xl text-center">
            <p>
              <b>My personal dictionary: </b>
              {dictWords && dictWords.length > 0
                ? `${dictWords.length} items`
                : username && loading
                ? "Loading..."
                : "0 items"}
            </p>
            <div className="w-1/3 space-x-8 flex justify-center mx-auto mt-3">
              <DictModal />
              <p
                className={`border border-sm rounded-md p-2 ${
                  remove <= 1 && deleteIds.length == 0
                    ? "text-red-400 border-red-200"
                    : "text-red-600 border-red-400"
                } hover:cursor-pointer`}
                onClick={handleRemove}
              >
                Remove
              </p>
              <input
                className="border border-sm rounded-md bg-black p-1 text-blue-400 border-blue-200 text-center"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                placeholder="Specify lang"
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    handleLangFilter();
                  }
                }}
              />
            </div>
          </div>
          <div className="w-full grid sm:grid-cols-4 grid-cols-3 gap-y-16">
            {dictWords &&
              dictWords.map((word, index) => (
                <div
                  className="w-4/5 flex flex-col justify-center items-center mx-auto mt-12 relative"
                  key={index}
                >
                  <DictItem
                    deleteIds={deleteIds}
                    setDeleteIds={setDeleteIds}
                    word={word}
                    remove={remove}
                  />
                </div>
              ))}
          </div>
          {remove > 0 && (
            <div className="relative w-full flex justify-center mx-auto mt-32 text-purple-200">
              <p className="absolute">Press esc to exit remove mode</p>
            </div>
          )}
        </div>
      ) : (
        <p
          className={`flex text-xl text-sky-100 justify-center mx-auto mt-32 ${roboto.className}`}
        >
          Log in to manage personal dictionary!
        </p>
      )}
    </div>
  );
};

export default Dict;
