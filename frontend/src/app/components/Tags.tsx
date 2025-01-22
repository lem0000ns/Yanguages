"use client";
import React, { useState } from "react";

interface Props {
  tags: string[];
  addTags: (e: unknown) => void;
  removeTags: (e: unknown) => void;
  entry: string;
  title: string;
}

const Tags = ({ tags, addTags, removeTags, entry, title }: Props) => {
  const [curTag, setCurTag] = useState("");
  const [message, setMessage] = useState("");
  const [countTags, setCountTags] = useState(0);

  const handleEnter = (e) => {
    if (e.key == "Enter") {
      if (countTags == 5) {
        setMessage("At most 5 tags can be attached!");
      } else if (tags.includes(curTag)) {
        setMessage("No duplicate tags!");
      } else if (entry == "" && title == "") {
        setMessage("Write to diary to add tags!");
      } else if (curTag.length > 10) {
        setMessage("Tags must be at most 10 characters long!");
      } else {
        addTags(e);
        setCountTags(countTags + 1);
        setCurTag("");
        setMessage("");
      }
    }
  };

  const handleRemove = (index) => {
    console.log("index");
    removeTags(index);
    setCountTags(countTags - 1);
  };

  return (
    <div className="mt-2 space-y-2">
      <ul className="flex flex-wrap justify-center space-x-4 mx-auto">
        {tags.map((value, index) => (
          <li
            className="flex flex-row list-none p-1 px-3 m-1 rounded-2xl bg-sky-200/95 text-black hover:border-red-500 hover:ring-2 hover:ring-red-500 hover:shadow-lg hover:shadow-red-500/50 hover:cursor-pointer"
            onClick={() => {
              handleRemove(index);
            }}
            key={index}
          >
            <span>{value}</span>
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
      {message && (
        <div className="flex justify-center mx-auto text-red-200">
          {message}
        </div>
      )}
    </div>
  );
};

export default Tags;
