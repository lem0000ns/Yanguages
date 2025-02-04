import React, { useState, useEffect } from "react";

const DictModal = () => {
  const [modal, setModal] = useState(false);
  const [term, setTerm] = useState("");
  const [define, setDefine] = useState("");
  const [sentence, setSentence] = useState("");
  const [lang, setLang] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  const toggleModal = () => {
    setModal(!modal);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (term.length > 30) {
      setMessage("Term must be at most 30 characters long");
    } else if (define.length > 30) {
      setMessage("Definition must be at most 50 characters long");
    } else if (sentence.length > 50) {
      setMessage("Sentence must be at most 50 characters long");
    } else if (lang.length > 20) {
      setMessage("Lang must be at most 20 characters long");
    } else {
      const res = await fetch("http://localhost:8080/dictionary", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, term, define, sentence, lang }),
      });
      const data = await res.json();
      console.log(data.message);
      if (res.ok) {
        setModal(false);
        location.reload();
      } else {
        setMessage("There was an error adding this word...");
      }
    }
  };

  const CloseModal = () => {
    return (
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
    );
  };

  return (
    <div>
      <button
        onClick={toggleModal}
        className="btn-modal border border-sm rounded-md p-2 text-green-400 border-green-200 hover:cursor-pointer"
      >
        Add Item
      </button>

      {modal && (
        <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content flex flex-col mx-auto justify-center items-center">
            <h2>
              <b>New Word</b>
            </h2>
            <form className="flex flex-col space-y-2" onSubmit={handleAdd}>
              <label>Enter term</label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                required
              />
              {term && (
                <p className="text-sm text-purple-800">
                  Current chararacter count: {term.length}
                </p>
              )}
              <label>Enter definition</label>
              <input
                type="text"
                value={define}
                onChange={(e) => setDefine(e.target.value)}
                required
              />
              {define && (
                <p className="text-sm text-purple-800">
                  Current chararacter count: {define.length}
                </p>
              )}
              <label>Enter example sentence (optional)</label>
              <input
                type="text"
                className="text-black block w-[400px] p-2 border border-purple-300 rounded-lg text-base"
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
              />
              {sentence && (
                <p className="text-sm text-purple-800">
                  Current chararacter count: {sentence.length}
                </p>
              )}
              <label>Specify language (optional)</label>
              <input
                type="text"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              />
              {lang && (
                <p className="text-sm text-purple-800">
                  Current chararacter count: {lang.length}
                </p>
              )}
              {message && (
                <p className="text-red-600 flex text-center">{message}</p>
              )}
              <button type="submit">Add</button>
            </form>
            <CloseModal />
          </div>
        </div>
      )}
    </div>
  );
};

export default DictModal;
