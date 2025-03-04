import React, { useState, useEffect } from "react";
import { MdOutlineEdit } from "react-icons/md";
import Dropdown from "../ui/Dropdown";
import UpArrow from "../ui/UpArrow";
import DownArrow from "../ui/DownArrow";

const DictItem = ({ deleteIds, setDeleteIds, word, remove }) => {
  const [username, setUsername] = useState("");
  const [modal, setModal] = useState(false);
  const [id, setId] = useState(0);
  const [term, setTerm] = useState("");
  const [define, setDefine] = useState("");
  const [sentence, setSentence] = useState("");
  const [lang, setLang] = useState("");
  const [selected, setSelected] = useState(false);
  const [dropdownToggle, setDropdownToggle] = useState(false);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  const handleEdit = async (e) => {
    e.preventDefault();
    await fetch("http://54.153.103.184/dictionary", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, username, term, define, sentence, lang }),
    });
    location.reload();
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  const EditModal = ({ id, term, define, sentence, lang }) => {
    const toggleModal = () => {
      setModal(!modal);
      setTerm(term);
      setDefine(define);
      setSentence(sentence);
      setLang(lang);
      setId(id);
    };

    return (
      <>
        <button className="text-sky-300 btn-modal" onClick={toggleModal}>
          <MdOutlineEdit className="absolute right-[-1vh] top-[-1vh]" />
        </button>
      </>
    );
  };

  return (
    <div className="absolute w-full">
      <div
        className={`flex flex-col text-center mx-auto rounded-md border p-2 border border-sm rounded-md p-2 ${
          selected && remove > 0
            ? "border-red-700 hover:cursor-grab"
            : remove > 0
            ? "border-red-300 hover:cursor-grab"
            : "border-white-100"
        }`}
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
        {Object.entries(word).map(([key, value]) =>
          key == "id" ||
          key == "lang" ||
          (key == "sentence" && value == "") ? null : (
            <div
              key={key}
              className={`${
                key == "define"
                  ? "text-purple-400 whitespace-nowrap overflow-x-auto"
                  : key == "sentence"
                  ? "w-full text-purple-100 italic whitespace-nowrap overflow-x-auto"
                  : "whitespace-nowrap overflow-x-auto"
              }`}
            >
              {value}
              <EditModal
                id={word.id}
                term={word.term}
                define={word.define}
                sentence={word.sentence}
                lang={word.lang}
              />
            </div>
          )
        )}
      </div>
      {modal && (
        <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content flex flex-col mx-auto justify-center items-center">
            <h2>
              <b>Edit Word</b>
            </h2>
            <form className="flex flex-col space-y-2" onSubmit={handleEdit}>
              <label>Edit term</label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                required
              />
              <label>Edit definition</label>
              <input
                type="text"
                value={define}
                onChange={(e) => setDefine(e.target.value)}
                required
              />
              <label>Edit example sentence</label>
              <input
                type="text"
                className="text-black block w-[400px] p-2 border border-purple-300 rounded-lg text-base"
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
              />
              <div
                className="flex flex-row items-center hover:cursor-pointer"
                onClick={() => setDropdownToggle(!dropdownToggle)}
              >
                <label>Select language</label>
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
                <p className="text-violet-800">{`Language: ${lang}`}</p>
              )}
              <button type="submit">Edit</button>
            </form>
            <button className="close-modal" onClick={toggleModal}>
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
                className="lucide lucide-x"
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

export default DictItem;
