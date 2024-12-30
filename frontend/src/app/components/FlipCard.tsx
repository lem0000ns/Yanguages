import React, { useState } from "react";
import ReactCardFlip from "react-card-flip";

const FlipCard = ({ word }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <ReactCardFlip isFlipped={flipped} flipDirection="vertical">
      <div className="flex flex-col">
        <p
          className="border border-sm rounded-md p-2 hover:cursor-grab"
          onClick={() => setFlipped(!flipped)}
        >
          {word.term}
        </p>
      </div>

      <div className="flex flex-col justify-center items-center mx-auto hover:cursor-grab border rounded-md border-white-100 p-2">
        {Object.entries(word).map(([key, value]) =>
          key == "id" || (key == "sentence" && value == "") ? null : (
            <div key={key} onClick={() => setFlipped(!flipped)}>
              <strong>{key}: </strong>
              {value}
            </div>
          )
        )}
      </div>
    </ReactCardFlip>
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
