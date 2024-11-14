"use client";
import React, { useEffect, useState } from "react";
import Diff from "../components/Configs";
import Result from "../components/Result";
import Navbar from "../ui/Navbar";

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

  useEffect(() => {
    fetch(`http://localhost:8080/api/word/${diff}`)
      .then((response) => response.json())
      .then((data) => {
        setWordInfo(data);
        if (lang == "sp") setWord(data[0].spanish);
        else if (lang == "kr") setWord(data[0].korean);
        setLoading(false);
        setAnswered("");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newWords, diff, lang]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/answers/${diff}`)
      .then((response) => response.json())
      .then((data) => {
        data.push({ english: wordInfo[0].english });
        shuffle(data);
        setOptions(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordInfo]);

  return (
    <div className="flex flex-col space-y-8 mx-auto items-center w-full">
      <Navbar />
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
        <Result
          options={options}
          wordInfo={wordInfo}
          streak={streak}
          word={word}
          setAnswered={setAnswered}
          setStreak={setStreak}
        ></Result>
      )}
      {answered && answered == "Correct!" ? (
        <p className="text-green-400">{answered}</p>
      ) : (
        <p className="text-red-400">{answered}</p>
      )}
      <div
        onClick={() => setNewWords(!newWords)}
        className="hover:cursor-pointer"
      >
        {answered.length > 0 && answered[0] == "T" ? (
          <p>Restart</p>
        ) : answered.length > 0 ? (
          <p>Next Question</p>
        ) : null}
      </div>
      {streak == 0 && <Diff setDiff={setDiff} setLang={setLang} />}
    </div>
  );
};

export default Game;
