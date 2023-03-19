import { default as React, useEffect, useState, useRef } from "react";
import * as io from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMicrophone,
    faMicrophoneSlash,
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

const AudioToText = ({ messages }) => {
    const [connection, setConnection] = useState();
    const [currentRecognition, setCurrentRecognition] = useState();
    const [recognitionHistory, setRecognitionHistory] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recorder, setRecorder] = useState();
    const processorRef = useRef();
    const audioContextRef = useRef();
    const audioInputRef = useRef();
    const [dialogue, setDialogue] = useState([]);
    const [currentDialogue, setCurrentDialogue] = useState([]);

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

    const connect = () => {
        connection?.disconnect();
        const socket = io.connect("http://localhost:5000");
        socket.on("connect", () => {
            console.log("connected", socket.id);
            setConnection(socket);
        });

        socket.emit("startGoogleCloudStream");

        // socket.on("receive_message", (data) => {
        //   console.log("received message", data);
        // });

        socket.on("send_transcript", (transcript) => {
            console.log(`Transcript: ${JSON.stringify(transcript)}`);
            let result = [];
            let currentGroup = [];

            console.log(transcript);

            for (let i = 0; i < transcript.length; i++) {
                if (
                    i === 0 ||
                    transcript[i].speaker === transcript[i - 1].speaker
                ) {
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

        socket.on("receive_audio_text", (data) => {
            speechRecognized(data);
            console.log("received audio text", data);
        });

        socket.on("disconnect", () => {
            console.log("disconnected", socket.id);
        });
    };

    const disconnect = () => {
        if (!connection) return;
        connection?.emit("endGoogleCloudStream");
        connection?.disconnect();
        processorRef.current?.disconnect();
        audioInputRef.current?.disconnect();
        audioContextRef.current?.close();
        setConnection(undefined);
        setRecorder(undefined);
        setIsRecording(false);
    };

    useEffect(() => {
        (async () => {
            console.log("Trying to connect");
            if (connection) {
                console.log(connection);
                if (isRecording) {
                    return;
                }

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

                processorRef.current.connect(
                    audioContextRef.current.destination
                );
                audioContextRef.current.resume();

                audioInputRef.current.connect(processorRef.current);

                processorRef.current.port.onmessage = (event) => {
                    const audioData = event.data;
                    connection.emit("send_audio_data", { audio: audioData });
                };
                setIsRecording(true);
            } else {
                console.error("No connection");
            }
        })();
        return () => {
            if (isRecording) {
                console.log("Closed");
                processorRef.current?.disconnect();
                audioInputRef.current?.disconnect();
                if (audioContextRef.current?.state !== "closed") {
                    audioContextRef.current?.close();
                }
            }
        };
    }, [connection, isRecording, recorder]);

    return (
        <div className="speech-footer">
            <div className="speech-footer__bubble">
                {[...dialogue].reverse().map((item) => (
                    <p className="speech-footer__text">
                        <strong>User {item.speaker}:</strong> {item.text}
                    </p>
                ))}
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
