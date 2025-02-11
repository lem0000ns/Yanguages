"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../ui/Navbar";
import DictItem from "../components/DictItem";
import DictModal from "../components/AddDictModal";

const Dict = () => {
  const [dictWords, setDictWords] = useState([]);
  const [username, setUsername] = useState("");
  const [remove, setRemove] = useState(0);
  const [deleteIds, setDeleteIds] = useState([]);

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

  useEffect(() => {
    (async () => {
      if (remove == 2) {
        if (deleteIds.length == 0) {
          setRemove(0);
        } else {
          const res = await fetch("http://localhost:8080/dictionary", {
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
    <div>
      <Navbar username={username} />
      <div className="flex flex-col items-center justify-center mx-auto mt-8">
        <div className="mb-4">
          <p>
            <b>My personal dictionary: </b>
            {dictWords ? dictWords.length : "0"} items
          </p>
          <div className="w-3/4 flex justify-between mx-auto mt-3">
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
          <div className="relative mt-4 text-purple-200">
            <p className="absolute">Press esc to exit remove mode</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dict;
