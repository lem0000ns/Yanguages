"use client";
import React, { useState } from "react";

const MagnifyingGlass = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-search"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
};

interface Props {
  tags: string[];
  addTags: (e: unknown) => void;
  removeTags: (e: unknown) => void;
  handleTagSearch: (e: unknown) => void;
}

const Tags = ({ tags, addTags, removeTags, handleTagSearch }: Props) => {
  const [curTag, setCurTag] = useState("");
  const [message, setMessage] = useState("");
  const [countTags, setCountTags] = useState(0);

  const handleEnter = (e) => {
    if (e.key == "Enter") {
      if (countTags == 5) {
        setMessage("5 tag search limit!");
      } else if (tags.includes(curTag)) {
        setMessage("No duplicate tags!");
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
    removeTags(index);
    setCountTags(countTags - 1);
  };

  return (
    <div className="flex items-center md:w-1/3 w-1/2 relative">
      <ul className="m-0 flex flex-row gap-x-2 w-full rounded-3xl bg-indigo-950 overflow-x-auto flex-nowrap absolute mb-2 bottom-full">
        {tags.map((value, index) => (
          <li
            className="list-none p-1 px-3 m-1 rounded-2xl bg-sky-200/95 text-black hover:border-red-500 hover:ring-2 hover:ring-red-500 hover:shadow-lg hover:shadow-red-500/50 hover:cursor-pointer flex-shrink-0"
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
        className="flex w-full rounded-3xl text-white bg-indigo-950 mx-auto h-8 p-3"
        placeholder="search by tag?"
        value={curTag}
        onChange={(e) => setCurTag(e.target.value)}
        onKeyDown={handleEnter}
      />
      <div className="ml-2 hover:cursor-pointer" onClick={handleTagSearch}>
        <MagnifyingGlass />
      </div>
      {message && (
        <div className="flex absolute items-center justify-center mx-auto text-red-200 top-full">
          {message}
        </div>
      )}
    </div>
  );
};

export default Tags;
