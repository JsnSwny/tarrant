import React, { useState, useEffect } from "react";
import Leaderboard from "../components/question/Leaderboard";
import Options from "../components/question/Options";
import QuestionTitle from "../components/question/QuestionTitle";
import Speech from "../components/question/Speech";
import "../style.scss";
import axios from "axios";
import AudioToText from "./AudioRecorder";
import * as io from "socket.io-client";
import { defaultsDeep } from "lodash";

const QuestionView = () => {
  const [listening, setListening] = useState();
  const [questionHistory, setQuestionHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [connection, setConnection] = useState(null);
  const [message, setMessage] = useState("");
  const [dialogue, setDialogue] = useState([]);
  const [user, setUser] = useState(0);

  const connect = () => {
    connection?.disconnect();
    const socket = io.connect("http://localhost:5000");
    socket.on("connect", () => {
      console.log("connected", socket.id);
      setConnection(socket);
    });

    socket.on("receive_message", (data) => {
      console.log(data);
      setDialogue((dialogue) => [...dialogue, data]);
    });

    socket.on("set_speaker", (data) => {
      setUser(data);
    });

    socket.on("disconnect", () => {
      console.log("disconnected", socket.id);
    });
  };

  useEffect(() => {
    console.log(dialogue);
  }, [dialogue]);
  useEffect(() => {
    axios
      .get("https://opentdb.com/api.php?amount=1")
      .then((res) => {
        setCurrentQuestion(res.data.results[0]);
      })
      .catch((err) => console.log(err));

    connect();
  }, []);

  useEffect(() => {
    if (connection) {
      // connection.emit("join_room");
    }
  }, [connection]);

  const sendMessage = () => {
    connection.emit("send_message", { message, user });
  };

  return (
    <section className="question-page">
      <div className="question-container container">
        <div className="question-banner">
          {Object.entries(currentQuestion).length > 0 && (
            <>
              <QuestionTitle currentQuestion={currentQuestion} />
              <Options currentQuestion={currentQuestion} />
            </>
          )}
        </div>
        <input
          type="text"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <button onClick={() => sendMessage()}>Submit</button>
        <AudioToText messages={dialogue} socket={connection} />
      </div>
      <Leaderboard />
    </section>
  );
};

export default QuestionView;
