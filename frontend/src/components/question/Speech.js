import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";

const Speech = ({ listening, setListening }) => {
  return (
    <div className="speech-footer">
      <div className="speech-footer__bubble">
        <p className="speech-footer__text">
          <strong>User 1:</strong> This ones easy, it’s Raiden
        </p>
        <p className="speech-footer__text">
          <strong>User 2:</strong> I trust, you, let’s go with Raiden
        </p>
        <p className="speech-footer__text">
          <strong>System:</strong> Final answer?
        </p>
      </div>
      <button
        className={`speech-footer__button speech-footer__button--${
          listening ? "start" : "stop"
        }`}
        onClick={() => setListening(!listening)}
      >
        <FontAwesomeIcon icon={listening ? faMicrophoneSlash : faMicrophone} />
        {listening ? "Start" : "Stop"} Listening
      </button>
    </div>
  );
};

export default Speech;
