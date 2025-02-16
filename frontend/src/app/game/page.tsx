"use client";
import React, { useEffect, useState } from "react";
import Diff from "../components/Configs";
import GameWords from "../components/GameWords";
import AddDict from "../components/GameAddDict";
import Navbar from "../ui/Navbar";
import { Roboto } from "next/font/google";

const roboto = Roboto({ subsets: ["latin"], weight: ["400"] });

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

const Game = () => {
  const [wordInfo, setWordInfo] = useState(["Loading"]);
  const [word, setWord] = useState("");
  const [answered, setAnswered] = useState("");
  const [newWords, setNewWords] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diff, setDiff] = useState("easy");
  const [streak, setStreak] = useState(0);
  const [lang, setLang] = useState("sp");
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  useEffect(() => {
    fetch(`http://localhost:8080/api/word/${diff}`)
      .then((response) => response.json())
      .then((data) => {
        setWordInfo(data);
        if (lang == "sp") setWord(data[0].spanish);
        else if (lang == "kr") setWord(data[0].korean);
        else if (lang == "zh") setWord(data[0].chinese);
        setLoading(false);
        setAnswered("");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newWords, diff, lang]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/options/${diff}`)
      .then((response) => response.json())
      .then((data) => {
        data.push({ english: wordInfo[0].english });
        shuffle(data);
        setOptions(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordInfo]);

  return (
    <div
      className={`flex flex-col space-y-8 mx-auto items-center w-full mb-16 text-xl ${roboto.className}`}
    >
      <Navbar username={username} />
      <div className="mt-4">
        Current difficulty:{" "}
        {diff === "easy" && <span className="text-green-100">{diff}</span>}
        {diff === "med" && <span className="text-orange-100">{diff}</span>}
        {diff === "hard" && <span className="text-red-200">{diff}</span>}
      </div>
      {loading ? (
        <p className="flex justify-center mx-auto mt-8">Loading...</p>
      ) : answered ? (
        <div className="flex flex-row mx-auto space-x-16 justify-center text-center mt-8 sm:w-1/3 w-2/3">
          {wordInfo.map((word, index) => (
            <div key={index}>
              {Object.entries(word).map(([key, value]) =>
                key != "freq" && key != "diff" ? (
                  <div key={key}>
                    <strong>{key}: </strong>
                    {value}
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
          setAnswered={setAnswered}
          setStreak={setStreak}
          lang={lang}
          diff={diff}
        ></GameWords>
      )}
      {answered && answered == "Correct!" ? (
        <p className="text-green-400">{answered}</p>
      ) : (
        <p className="text-red-400">{answered}</p>
      )}
      <div>
        {answered.length > 0 && answered[0] == "T" ? (
          <p
            onClick={() => setNewWords(!newWords)}
            className="flex justify-center items-center mx-auto hover:cursor-pointer"
          >
            Restart
          </p>
        ) : answered.length > 0 ? (
          <p
            onClick={() => setNewWords(!newWords)}
            className="flex justify-center items-center mx-auto hover:cursor-pointer"
          >
            Next Question
          </p>
        ) : null}
        {answered.length > 0 && (
          <AddDict
            term={word}
            define={wordInfo[0].english}
            lang={lang}
          ></AddDict>
        )}
      </div>
      {streak == 0 && <Diff setDiff={setDiff} setLang={setLang} />}
    </div>
  );
};

export default Game;
