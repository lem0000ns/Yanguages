"use client";

import React, { useState, useEffect } from "react";

const AddDict = ({ term, define, lang }) => {
  const [username, setUsername] = useState("");
  const [sentence, setSentence] = useState("");
  const [message, setMessage] = useState("");
  const [add, setAdd] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  const handleSubmit = async (e) => {
    if (sentence.length > 100) {
      setError("Sentence must be at most 100 characters");
    } else {
      e.preventDefault();
      console.log("Term entered: ", term);
      console.log("Definition: ", define);
      console.log("Example sentence", sentence);
      console.log("Language: ", lang);
      const res = await fetch("http://localhost:8080/dictionary", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, term, define, sentence, lang }),
      });
      const data = await res.json();
      setMessage(data.message);
    }
  };

  return (
    <div>
      {!add && message.length == 0 && (
        <button className="mt-16" onClick={() => setAdd(true)}>
          Add to personal dictionary?
        </button>
      )}
      {!message && add && (
        <div className="flex flex-col justify-center items-center mx-auto space-y-4 mt-8">
          <label htmlFor="addItem">Example sentence? (optional)</label>
          <input
            id="addItem"
            type="text"
            className="text-white block w-[400px] p-2 border border-purple-300 rounded-lg text-base bg-black"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
          />
          {error && <p className="text-red-400 flex text-center">{error}</p>}
          <button className="border rounded-md p-2" onClick={handleSubmit}>
            <b>Add</b>
          </button>
        </div>
      )}
      {message && (
        <p className="text-green-100 flex items-center justify-center mx-auto mt-8">
          {message}
        </p>
      )}
    </div>
  );
};

export default AddDict;
