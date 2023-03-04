import React, { useState, useEffect, useRef } from "react";
// import { w3cwebsocket as WebSocket } from "websocket";
import io from "socket.io-client";

const AudioRecorder = () => {
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [streamingRecognize, setStreamingRecognize] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connection, setConnection] = useState(undefined);
  const mediaRecorderRef = useRef();
  const connectionRef = useRef(false);
  const audioRef = useRef();
  // const [mediaRecorder, setMediaRecord] = useState(undefined);

  const startRecording = () => {
    // connectionRef.current.disconnect();
    const socket = io("http://localhost:5000");
    setRecording(true);

    socket.on("connect", () => {
      console.log("connected", socket.id);
      connectionRef.current = socket;
    });
    socket.emit("startGoogleCloudStream");

    socket.on("receive_message", (data) => {
      console.log("received message", data);
    });
    socket.on("disconnect", () => {
      connectionRef.current = false;
      console.log("Disconnected");
    });
  };

  useEffect(() => {
    (async () => {
      if (recording) {
        if (navigator.mediaDevices) {
          console.log("getUserMedia supported.");

          const constraints = { audio: true };
          let chunks = [];

          navigator.mediaDevices
            .getUserMedia(constraints)
            .then((stream) => {
              mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: "audio/webm",
                audioBitsPerSecond: 16000,
              });

              console.log(mediaRecorderRef.current.state);
              console.log("recorder started");

              mediaRecorderRef.current.start(100);

              mediaRecorderRef.current.ondataavailable = (e) => {
                chunks.push(e.data);
                console.log(chunks);
                connectionRef.current.emit("send_audio_data", {
                  audio: e.data,
                });
              };

              mediaRecorderRef.current.onstop = (e) => {
                console.log(
                  "data available after MediaRecorder.stop() called."
                );

                audioRef.controls = true;
                const blob = new Blob(chunks, {
                  type: "audio/ogg; codecs=opus",
                });
                const audioURL = window.URL.createObjectURL(blob);
                console.log(audioURL);
                audioRef.src = audioURL;
                console.log("recorder stopped");
              };
            })
            .catch((err) => {
              console.error(`The following error occurred: ${err}`);
            });
        }
      }
    })();
  }, [recording]);

  const stopRecording = () => {
    connectionRef.current = false;
    setRecording(false);
    mediaRecorderRef.current.stop();
  };

  return (
    <div>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <p>{transcript}</p>
      <audio ref={audioRef}></audio>
    </div>
  );
};

export default AudioRecorder;
