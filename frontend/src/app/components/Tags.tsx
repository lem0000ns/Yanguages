"use client";
import React, { useState } from "react";

interface Props {
  tags: string[];
  addTags: (e: unknown) => void;
  removeTags: (e: unknown) => void;
}

const Tags = ({ tags, addTags, removeTags }: Props) => {
  const [curTag, setCurTag] = useState("");
  const [message, setMessage] = useState("");

  const handleEnter = (e) => {
    if (
      e.key == "Enter" &&
      e.target.value.length > 0 &&
      e.target.value.length < 11
    ) {
      addTags(e);
      setCurTag("");
      setMessage("");
    } else if (e.key == "Enter" && e.target.value.length > 10) {
      setMessage("Tags must be at most 10 characters long!");
    }
  };

  return (
    <div className="mt-2 space-y-2">
      <ul className="flex flex-wrap space-x-4 w-3/4 mx-auto">
        {tags.map((value, index) => (
          <li className="list-none" key={index}>
            <span className="text-violet-400">{value[0]}</span>
            <span>{value.substring(1)}</span>
            <div onClick={() => removeTags(index)} />
          </li>
        ))}
      </ul>
      <input
        className="flex justify-center rounded-3xl text-white bg-indigo-950 mx-auto h-8 p-3"
        placeholder="add tag?"
        value={curTag}
        onChange={(e) => setCurTag(e.target.value)}
        onKeyDown={handleEnter}
      />
      {message && <div className="text-red-200">{message}</div>}
    </div>
  );
};

export default Tags;
