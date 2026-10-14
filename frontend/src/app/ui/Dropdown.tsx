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
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-muted">
      {options.map((option, index) => {
        return (
          <button
            type="button"
            className="block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-violet-950/50 hover:text-white"
            key={index}
            onClick={() => handleClick(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

export default Dropdown;
