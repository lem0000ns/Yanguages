import React, { useState } from "react";
import { MdOutlineEdit } from "react-icons/md";
import Dropdown from "../ui/Dropdown";
import UpArrow from "../ui/UpArrow";
import DownArrow from "../ui/DownArrow";
import { apiFetch } from "../session";

const DictItem = ({ deleteIds, setDeleteIds, word, remove }) => {
  const [modal, setModal] = useState(false);
  const [id, setId] = useState(0);
  const [term, setTerm] = useState("");
  const [define, setDefine] = useState("");
  const [sentence, setSentence] = useState("");
  const [lang, setLang] = useState("");
  const [selected, setSelected] = useState(false);
  const [dropdownToggle, setDropdownToggle] = useState(false);

  const handleEdit = async (e) => {
    e.preventDefault();
    await apiFetch("/dictionary", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, term, define, sentence, lang }),
    });
    location.reload();
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  const openEdit = () => {
    setModal(true);
    setTerm(word.term);
    setDefine(word.define);
    setSentence(word.sentence);
    setLang(word.lang);
    setId(word.id);
  };

  const selectedRemove =
    selected && remove > 0
      ? "border-red-500/70 ring-2 ring-red-500/30"
      : remove > 0
      ? "border-red-400/40 hover:border-red-400/70 cursor-pointer"
      : "border-border-subtle";

  return (
    <>
      <article
        className={`card-surface relative flex h-full flex-col p-4 transition-all duration-200 ${selectedRemove}`}
        onClick={() => {
          if (remove > 0) {
            if (!selected) {
              setDeleteIds((prevIds) => [...prevIds, word.id]);
            } else {
              setDeleteIds(deleteIds.filter((id) => id !== word.id));
              const index = deleteIds.indexOf(word.id);
              deleteIds.splice(index, 1);
            }
            setSelected(!selected);
          }
        }}
      >
        {remove === 0 && (
          <button
            type="button"
            className="absolute right-3 top-3 rounded-lg p-1.5 text-sky-400/90 transition-colors hover:bg-violet-950/60 hover:text-sky-300"
            onClick={(e) => {
              e.stopPropagation();
              openEdit();
            }}
            aria-label="Edit word"
          >
            <MdOutlineEdit className="h-4 w-4" />
          </button>
        )}

        <p className="pr-8 font-display text-xl font-semibold leading-snug">
          {word.term}
        </p>
        <p className="mt-2 text-sm font-medium text-purple-400">{word.define}</p>
        {word.sentence ? (
          <p className="mt-3 flex-1 text-sm italic leading-relaxed text-purple-200/70 line-clamp-3">
            {word.sentence}
          </p>
        ) : (
          <div className="flex-1" />
        )}
        {word.lang && (
          <span className="mt-3 inline-flex w-fit rounded-md bg-violet-950/60 px-2 py-0.5 text-xs text-violet-300/90">
            {word.lang}
          </span>
        )}
      </article>

      {modal && (
        <div className="modal">
          <div onClick={toggleModal} className="overlay" role="presentation" />
          <div className="modal-content flex flex-col">
            <h2 className="font-display text-xl font-semibold">Edit word</h2>
            <form className="mt-4 flex flex-col space-y-3" onSubmit={handleEdit}>
              <div>
                <label>Edit term</label>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Edit definition</label>
                <input
                  type="text"
                  value={define}
                  onChange={(e) => setDefine(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Edit example sentence</label>
                <input
                  type="text"
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value)}
                />
              </div>
              <div
                className="flex flex-row items-center gap-2 hover:cursor-pointer"
                onClick={() => setDropdownToggle(!dropdownToggle)}
              >
                <label className="mb-0">Language</label>
                {dropdownToggle ? <UpArrow /> : <DownArrow />}
              </div>
              {dropdownToggle && (
                <Dropdown
                  options={["None", "Spanish", "Korean", "Chinese"]}
                  setOption={setLang}
                  setToggle={setDropdownToggle}
                />
              )}
              {!dropdownToggle && lang != "None" && lang != "" && (
                <p className="text-sm text-violet-300/80">{`Language: ${lang}`}</p>
              )}
              <button type="submit">Save changes</button>
            </form>
            <button className="close-modal" type="button" onClick={toggleModal} aria-label="Close">
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
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DictItem;
