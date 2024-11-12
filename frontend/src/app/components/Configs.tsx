import React from "react";

const Configs = ({ setDiff, setLang }) => {
  return (
    <div className="flex flex-col space-y-4 mx-auto">
      <div className="flex flex-row space-x-4 mx-auto items-center justify-content">
        <p
          className="hover:cursor-pointer text-green-100 hover:text-green-200"
          onClick={() => setDiff("easy")}
        >
          Easy
        </p>
        <p
          className="hover:cursor-pointer text-orange-100 hover:text-orange-200"
          onClick={() => setDiff("med")}
        >
          Medium
        </p>
        <p
          className="hover:cursor-pointer text-red-200 hover:text-red-300"
          onClick={() => setDiff("hard")}
        >
          Hard
        </p>
      </div>
      <div className="flex flex-row space-x-4 mx-auto items-center justify-content">
        <p className="hover:cursor-pointer" onClick={() => setLang("sp")}>
          Spanish
        </p>
        <p className="hover:cursor-pointer" onClick={() => setLang("kr")}>
          Korean
        </p>
      </div>
    </div>
  );
};

export default Configs;
