import React, { useState, useEffect } from "react";
import Leaderboard from "../components/question/Leaderboard";
import Options from "../components/question/Options";
import QuestionTitle from "../components/question/QuestionTitle";
import Speech from "../components/question/Speech";
import "../style.scss";
import axios from "axios";

const QuestionView = () => {
  const [listening, setListening] = useState(false);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({});

  useEffect(() => {
    console.log("GETTING QUESTIONS");
    axios
      .get("https://opentdb.com/api.php?amount=1")
      .then((res) => {
        setCurrentQuestion(res.data.results[0]);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    // Start recording
    if (listening) {
      // Stop recording
    } else {
    }
  }, [listening]);

  return (
    <section className="question-page">
      <div className="question-container container">
        <div className="question-banner">
          <span>Question slider</span>
          {Object.entries(currentQuestion).length > 0 && (
            <>
              <QuestionTitle currentQuestion={currentQuestion} />
              <Options currentQuestion={currentQuestion} />
            </>
          )}
        </div>
        <Speech listening={listening} setListening={setListening} />
      </div>
      <Leaderboard />
    </section>
  );
};

export default QuestionView;
