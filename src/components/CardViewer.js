import React, { useState } from "react";

const CardViewer = ({
  card: {
    front,
    back,
    notes: [...notes],
  },
}) => {
  const [flipped, setFlipped] = useState(false);

  const flipCard = (e) => {
    e.preventDefault();
    setFlipped(!flipped);
  };

  return (
    <div onClick={flipCard}>
      <h3> {flipped ? `${back}` : `${front}`}</h3>

      <div>
        <p>Notes:</p>
        <ul>
          {notes.map((note) => {
            return <li>{note}</li>;
          })}{" "}
        </ul>
      </div>
    </div>
  );
};

export default CardViewer;
