"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../ui/Navbar";
import DictItem from "../components/FlipCard";

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
        } else {
          console.log(data.message);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remove]);

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
            <p className="border border-sm rounded-md p-2 text-green-400 border-green-200 hover:cursor-pointer">
              Insert
            </p>
            <p
              className="border border-sm rounded-md p-2 text-red-400 border-red-200 hover:cursor-pointer"
              onClick={handleRemove}
            >
              Remove
            </p>
          </div>
        </div>
        {dictWords &&
          dictWords.map((word, index) => (
            <div
              className="w-1/3 flex flex-col justify-center items-center mx-auto mt-4"
              key={index}
            >
              <DictItem
                deleteIds={deleteIds}
                setDeleteIds={setDeleteIds}
                remove={remove}
                word={word}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default Dict;
