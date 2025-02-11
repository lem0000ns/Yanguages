import React from "react";

interface Props {
  options: string[];
  setOption: (e) => void;
  setToggle?: (e) => void;
}

const Dropdown = ({ options, setOption, setToggle }: Props) => {
  const handleClick = (option) => {
    setOption(option);
    setToggle(false);
  };
  return (
    <div className="bg-violet-950/10">
      {options.map((option, index) => {
        return (
          <div
            className="hover:bg-violet-950/20 hover:cursor-pointer"
            key={index}
            onClick={() => handleClick(option)}
          >
            <p className="ml-2">{option}</p>
          </div>
        );
      })}
    </div>
  );
};

export default Dropdown;
