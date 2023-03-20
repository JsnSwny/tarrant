import { default as React, useEffect, useState, useRef } from "react";
import * as io from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faMicrophone,
	faMicrophoneSlash,
	faEnvelope,
	faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";

const sampleRate = 16000;

const getMediaStream = () =>
	navigator.mediaDevices.getUserMedia({
		audio: {
			deviceId: "default",
			sampleRate: sampleRate,
			sampleSize: 16,
			channelCount: 1,
		},
		video: false,
	});

const AudioToText = ({ messages, connection, letsPlayAudio }) => {
	const [currentRecognition, setCurrentRecognition] = useState();
	const [recognitionHistory, setRecognitionHistory] = useState([]);
	const [isRecording, setIsRecording] = useState(false);
	const [recorder, setRecorder] = useState();
	const processorRef = useRef();
	const audioContextRef = useRef();
	const audioInputRef = useRef();
	const [dialogue, setDialogue] = useState([]);
	const [currentDialogue, setCurrentDialogue] = useState([]);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (messages) {
			setDialogue(messages);
		}
	}, [messages]);

	const speechRecognized = (data) => {
		if (data.final) {
			setCurrentRecognition("...");
			setRecognitionHistory((old) => [data.text, ...old]);
		} else setCurrentRecognition(data.text + "...");
	};

	const sendMessage = () => {
		setMessage("");
		connection.emit("send_message", { message });
	};

	const connect = () => {
		console.log("COnnecting");
		connection.emit("startGoogleCloudStream");
		console.log("Start Google Stream");
		startRecording();
		connection.on("send_transcript", (transcript) => {
			console.log(`Transcript: ${JSON.stringify(transcript)}`);
			let result = [];
			let currentGroup = [];
			for (let i = 0; i < transcript.length; i++) {
				if (i === 0 || transcript[i].speaker === transcript[i - 1].speaker) {
					currentGroup.push(transcript[i]);
				} else {
					const textList = currentGroup.map((obj) => obj.word);
					const textResult = textList.join(" ");
					currentGroup = {
						text: textResult,
						speaker: currentGroup[0].speaker,
					};
					result.push(currentGroup);
					currentGroup = [transcript[i]];
				}
			}

			const textList = currentGroup.map((obj) => obj.word);
			const textResult = textList.join(" ");
			currentGroup = {
				text: textResult,
				speaker: currentGroup[0].speaker,
			};
			result.push(currentGroup);

			setDialogue(result);
		});

		connection.on("receive_audio_text", (data) => {
			speechRecognized(data);
			console.log("received audio text", data);
		});

		connection.on("disconnect", () => {
			console.log("disconnected", connection.id);
		});
	};

	const disconnect = () => {
		connection?.emit("endGoogleCloudStream");
		processorRef.current?.disconnect();
		audioInputRef.current?.disconnect();
		audioContextRef.current?.close();
		setRecorder(undefined);
		setIsRecording(false);
	};

	const startRecording = async () => {
		const stream = await getMediaStream();

		audioContextRef.current = new window.AudioContext();

		await audioContextRef.current.audioWorklet.addModule(
			"/src/worklets/recorderWorkletProcessor.js"
		);

		audioContextRef.current.resume();

		audioInputRef.current =
			audioContextRef.current.createMediaStreamSource(stream);

		processorRef.current = new AudioWorkletNode(
			audioContextRef.current,
			"recorder.worklet"
		);

		processorRef.current.connect(audioContextRef.current.destination);
		audioContextRef.current.resume();

		audioInputRef.current.connect(processorRef.current);

		processorRef.current.port.onmessage = (event) => {
			const audioData = event.data;
			connection.emit("send_audio_data", { audio: audioData });
		};

		setIsRecording(true);
	};

	// useEffect(() => {
	// 	(async () => {
	// 		if (!isRecording) {
	// 			setIsRecording(true);
	// 		} else {
	// 			console.error("No connection");
	// 		}
	// 	})();
	// 	return () => {
	// 		if (isRecording) {
	// 			console.log("Closed");
	// 			processorRef.current?.disconnect();
	// 			audioInputRef.current?.disconnect();
	// 			if (audioContextRef.current?.state !== "closed") {
	// 				audioContextRef.current?.close();
	// 			}
	// 		}
	// 	};
	// }, [isRecording, recorder]);

	return (
		<div className="speech-footer">
			<div className="speech-footer__bubble">
				{[...dialogue].reverse().map((item) => (
					<p className="speech-footer__text">
						<strong>
							{item.speaker != "HOST" && "User"} {item.speaker}:
						</strong>{" "}
						{item.text}
					</p>
				))}
			</div>
			<div className="speech-footer__input-wrapper">
				<input
					className="speech-footer__input"
					type="text"
					onChange={(e) => setMessage(e.target.value)}
					value={message}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							sendMessage();
						}
					}}
				/>
				<FontAwesomeIcon
					style={{ cursor: "pointer" }}
					onClick={() => sendMessage()}
					icon={faPaperPlane}
				/>
			</div>

			<button
				className={`speech-footer__button speech-footer__button--${
					isRecording ? "stop" : "start"
				}`}
				onClick={() => (isRecording ? disconnect() : connect())}
			>
				<FontAwesomeIcon
					icon={isRecording ? faMicrophoneSlash : faMicrophone}
				/>
				{isRecording ? "Stop" : "Start"} Listening
			</button>
			<button
				onClick={() => {
					getMediaStream();
				}}
			>
				Get Audio
			</button>
		</div>
	);
};

export default AudioToText;
