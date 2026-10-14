"use client";
import React, { useState } from "react";
import { Search } from "lucide-react";

interface Props {
  tags: string[];
  addTags: (e: unknown) => void;
  removeTags: (e: unknown) => void;
  handleTagSearch: (e: unknown) => void;
  username: string;
}

const SearchTags = ({
  tags,
  addTags,
  removeTags,
  handleTagSearch,
  username,
}: Props) => {
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
    <div className="w-full sm:max-w-sm">
      <p className="mb-2 text-sm text-violet-400/70">Tags</p>
      {tags.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {tags.map((value, index) => (
            <li
              className="tag-chip flex-shrink-0"
              onClick={() => handleRemove(index)}
              key={index}
            >
              {value}
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          className="input-field flex-1"
          placeholder="Tag name"
          value={curTag}
          onChange={(e) => setCurTag(e.target.value)}
          onKeyDown={handleEnter}
          disabled={!username}
        />
        <button
          type="button"
          className="btn-secondary shrink-0 px-3"
          onClick={handleTagSearch}
          disabled={!username}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
      {message && (
        <button
          type="button"
          className="mt-2 text-left text-sm text-red-300/90"
          onClick={() => setMessage("")}
        >
          {message}
        </button>
      )}
    </div>
  );
};

export default SearchTags;
