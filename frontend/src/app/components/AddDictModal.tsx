import React, { useState } from "react";
import Dropdown from "../ui/Dropdown";
import UpArrow from "../ui/UpArrow";
import DownArrow from "../ui/DownArrow";
import { apiFetch } from "../session";
import { Plus } from "lucide-react";

const DictModal = () => {
  const [modal, setModal] = useState(false);
  const [term, setTerm] = useState("");
  const [define, setDefine] = useState("");
  const [sentence, setSentence] = useState("");
  const [lang, setLang] = useState("");
  const [message, setMessage] = useState("");
  const [dropdownToggle, setDropdownToggle] = useState(false);

  const toggleModal = () => {
    setModal(!modal);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (term.length > 30) {
      setMessage("Term must be at most 30 characters long");
    } else if (define.length > 30) {
      setMessage("Definition must be at most 30 characters long");
    } else if (sentence.length > 100) {
      setMessage("Sentence must be at most 100 characters long");
    } else {
      const res = await apiFetch("/dictionary", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term, define, sentence, lang }),
      });
      if (res.ok) {
        setModal(false);
        location.reload();
      } else {
        setMessage("There was an error adding this word...");
      }
    }
  };

  return (
    <div>
      <button type="button" onClick={toggleModal} className="btn-success gap-2">
        <Plus className="h-4 w-4" />
        Add word
      </button>

      {modal && (
        <div className="modal">
          <div onClick={toggleModal} className="overlay" role="presentation" />
          <div className="modal-content flex flex-col">
            <h2 className="font-display text-xl font-semibold">New word</h2>
            <form className="mt-4 flex flex-col space-y-3" onSubmit={handleAdd}>
              <div>
                <label>Term</label>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  required
                />
                {term && (
                  <p className="mt-1 text-xs text-violet-400/70">
                    {term.length} / 30 characters
                  </p>
                )}
              </div>
              <div>
                <label>Definition</label>
                <input
                  type="text"
                  value={define}
                  onChange={(e) => setDefine(e.target.value)}
                  required
                />
                {define && (
                  <p className="mt-1 text-xs text-violet-400/70">
                    {define.length} / 30 characters
                  </p>
                )}
              </div>
              <div>
                <label>Example sentence (optional)</label>
                <input
                  type="text"
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value)}
                />
                {sentence && (
                  <p className="mt-1 text-xs text-violet-400/70">
                    {sentence.length} / 100 characters
                  </p>
                )}
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
              {message && (
                <p className="text-sm text-red-400">{message}</p>
              )}
              <button type="submit">Add to dictionary</button>
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
    </div>
  );
};

export default DictModal;
