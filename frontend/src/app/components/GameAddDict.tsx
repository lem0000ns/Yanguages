"use client";

import React, { useState } from "react";
import { apiFetch } from "../session";
import { useSession } from "../useSession";

const AddDict = ({ term, define, lang }) => {
  const { username } = useSession();
  const [sentence, setSentence] = useState("");
  const [message, setMessage] = useState("");
  const [add, setAdd] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      setError("Log in to add words");
      return;
    }
    if (sentence.length > 100) {
      setError("Sentence must be at most 100 characters");
    } else {
      const res = await apiFetch("/dictionary", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term, define, sentence, lang }),
      });
      const data = await res.json();
      setMessage(data.message);
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      {!add && message.length == 0 && (
        <button
          type="button"
          className="btn-ghost text-sm"
          onClick={() => setAdd(true)}
        >
          Save to personal dictionary
        </button>
      )}
      {!message && add && (
        <div className="card-surface mt-4 w-full max-w-md space-y-4 p-5">
          <label htmlFor="addItem" className="label-text">
            Example sentence (optional)
          </label>
          <input
            id="addItem"
            type="text"
            className="input-field"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="button" className="btn-primary w-full" onClick={handleSubmit}>
            Add word
          </button>
        </div>
      )}
      {message && (
        <p className="mt-4 text-center text-sm text-emerald-300/90">{message}</p>
      )}
    </div>
  );
};

export default AddDict;
