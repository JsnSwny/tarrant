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
import letsPlay from "../sounds/letsPlay.mp3";
import correctAnswer from "../sounds/correctAnswer.mp3";
import wrongAnswer from "../sounds/wrongAnswer.mp3";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faForward } from "@fortawesome/free-solid-svg-icons";

const QuestionView = () => {
	const [listening, setListening] = useState();
	const [questionHistory, setQuestionHistory] = useState([]);
	const [currentQuestion, setCurrentQuestion] = useState(null);
	const [connection, setConnection] = useState(null);
	const [questionNumber, setQuestionNumber] = useState(0);
	const [endOfQuestion, setEndOfQuestion] = useState(null);

	const [dialogue, setDialogue] = useState([]);
	const [user, setUser] = useState(0);

	let letsPlayAudio = new Audio(letsPlay);
	let correctAnswerAudio = new Audio(correctAnswer);
	let wrongAnswerAudio = new Audio(wrongAnswer);
	// let audio = new Audio("/christmas.mp3")
	// let audio = new Audio("/christmas.mp3")
	// let audio = new Audio("/christmas.mp3")

	const connect = () => {
		connection?.disconnect();
		const socket = io.connect(`137.195.118.51:5000`);
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

		socket.on("start_game", () => {
			console.log("Starting Game");
			letsPlayAudio.play();
		});

		socket.on("next_question", (data) => {
			setCurrentQuestion(data.question);
			setQuestionNumber(data.questionNumber);
			setEndOfQuestion(null);
		});

		socket.on("question_result", (data) => {
			console.log(data);
			if (data.isCorrect) {
				correctAnswerAudio.play();
			} else {
				wrongAnswerAudio.play();
			}
			setEndOfQuestion(data);
		});

		socket.on("disconnect", () => {
			console.log("disconnected", socket.id);
		});
	};

	useEffect(() => {
		connect();
	}, []);

	useEffect(() => {
		if (connection) {
			// connection.emit("join_room");
		}
	}, [connection]);

	return (
		<section className="question-page">
			<div className="question-container container">
				<div className="question-banner">
					{currentQuestion && Object.entries(currentQuestion).length > 0 && (
						<>
							<QuestionTitle
								questionNumber={questionNumber}
								currentQuestion={currentQuestion}
							/>
							<Options
								options={currentQuestion.options}
								endOfQuestion={endOfQuestion}
							/>
						</>
					)}
				</div>

				<AudioToText
					messages={dialogue}
					connection={connection}
					letsPlayAudio={letsPlayAudio}
				/>
				<button
					className="skip-button"
					onClick={() => connection.emit("skip_question")}
				>
					Skip Question <FontAwesomeIcon icon={faForward} />
				</button>
			</div>
			<Leaderboard />
		</section>
	);
};

export default QuestionView;
