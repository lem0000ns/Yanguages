import React, { useState, useEffect } from "react";
import ReactCardFlip from "react-card-flip";
import { MdOutlineEdit } from "react-icons/md";

const FlipCard = ({ word }) => {
  const [flipped, setFlipped] = useState(false);
  const [username, setUsername] = useState("");
  const [modal, setModal] = useState(false);
  const [term, setTerm] = useState("");
  const [define, setDefine] = useState("");
  const [sentence, setSentence] = useState("");
  const [lang, setLang] = useState("");

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  const toggleModal = () => {
    setModal(!modal);
    console.log(modal);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:8080/dictionary", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, term, define, sentence, lang }),
    });
    location.reload();
  };

  const EditModal = ({ term, define, sentence, lang }) => {
    return (
      <>
        <button className="btn-modal" onClick={toggleModal}>
          <MdOutlineEdit className="absolute right-[-1vh] top-[-1vh]" />
        </button>
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
                <label>Edit language</label>
                <input
                  type="text"
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                />
                <button type="submit">Add</button>
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
      </>
    );
  };

  const handleFlip = () => {
    setFlipped(!flipped);
    if (!flipped) {
      setModal(false);
    }
  };

  return (
    <div className="relative">
      <ReactCardFlip isFlipped={flipped} flipDirection="vertical">
        <div className="flex flex-col">
          <p
            className="border border-sm rounded-md p-2 hover:cursor-grab"
            onClick={handleFlip}
          >
            {word.term}
          </p>
        </div>

        <div className="flex flex-col justify-center items-center mx-auto rounded-md border border-white-100 p-2">
          {Object.entries(word).map(([key, value]) =>
            key == "id" || (key == "sentence" && value == "") ? null : (
              <div key={key}>
                <strong className="hover:cursor-grab" onClick={handleFlip}>
                  {key}:{" "}
                </strong>
                <span className="hover:cursor-grab" onClick={handleFlip}>
                  {value}
                </span>
                <EditModal
                  term={word.term}
                  define={word.define}
                  sentence={word.sentence}
                  lang={word.lang}
                />
              </div>
            )
          )}
        </div>
      </ReactCardFlip>
    </div>
  );
};

const RemoveCard = ({ deleteIds, setDeleteIds, word }) => {
  const [selected, setSelected] = useState(false);
  return (
    <div className="flex flex-col">
      <p
        className={`border border-sm rounded-md p-2 hover:cursor-grab ${
          selected ? "border-red-700" : "border-red-300"
        }`}
        onClick={() => {
          if (!selected) {
            setDeleteIds((prevIds) => [...prevIds, word.id]);
            console.log(deleteIds);
          } else {
            setDeleteIds(deleteIds.filter((id) => id !== word.id));
            const index = deleteIds.indexOf(word.id);
            deleteIds.splice(index, 1);
          }
          setSelected(!selected);
        }}
      >
        {word.term}
      </p>
    </div>
  );
};

const DictItem = ({ deleteIds, setDeleteIds, remove, word }) => {
  return (
    <>
      {remove == 0 ? (
        <FlipCard word={word} />
      ) : (
        <RemoveCard
          deleteIds={deleteIds}
          setDeleteIds={setDeleteIds}
          word={word}
        />
      )}
    </>
  );
};

export default DictItem;
