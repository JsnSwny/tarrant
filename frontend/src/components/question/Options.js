import React, { useEffect, useState } from "react";

const Options = ({ currentQuestion }) => {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    setOptions([
      ...currentQuestion.incorrect_answers,
      currentQuestion.correct_answer,
    ]);
  }, [currentQuestion]);

  return (
    <ul className="options">
      {options.map((option) => (
        <li className="options__option shadow">{option}</li>
      ))}
    </ul>
  );
};

export default Options;
