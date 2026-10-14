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
    removeTags(index);
    setCountTags(countTags - 1);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-violet-400/70">
        Tags
      </p>
      <ul className="flex flex-wrap gap-2">
        {tags.map((value, index) => (
          <li
            className="tag-chip"
            onClick={() => {
              handleRemove(index);
            }}
            key={index}
          >
            {value}
          </li>
        ))}
      </ul>
      <input
        className="input-field max-w-md"
        placeholder="Add a tag and press Enter"
        value={curTag}
        onChange={(e) => setCurTag(e.target.value)}
        onKeyDown={handleEnter}
      />
      {message && (
        <div className="text-sm text-red-300/90">{message}</div>
      )}
    </div>
  );
};

export default Tags;
