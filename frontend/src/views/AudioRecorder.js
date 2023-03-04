import React, { useState, useEffect } from "react";
// import { w3cwebsocket as WebSocket } from "websocket";
import { SpeechClient } from "@google-cloud/speech";

const AudioRecorder = () => {
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [streamingRecognize, setStreamingRecognize] = useState(null);

  useEffect(() => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = "./speech-to-text-key.json";
    const initSpeechClient = async () => {
      const client = new SpeechClient();
      const streamingRecognize = client.streamingRecognize({
        config: {
          encoding: "LINEAR16",
          sampleRateHertz: 16000,
          languageCode: "en-US",
        },
        interimResults: true,
      });

      setStreamingRecognize(streamingRecognize);
    };

    initSpeechClient();
  }, []);

  useEffect(() => {
    if (navigator.mediaDevices) {
      console.log("getUserMedia supported.");

      const constraints = { audio: true };
      let chunks = [];

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);

          mediaRecorder.start(1000);
          console.log(mediaRecorder.state);
          console.log("recorder started");

          mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
            console.log(chunks);
          };
        })
        .catch((err) => {
          console.error(`The following error occurred: ${err}`);
        });
    }
  }, []);

  return (
    <div>
      {/* <button onClick={startRecording}>Start Recording</button> */}
      {/* <button onClick={stopRecording}>Stop Recording</button> */}
      <p>{transcript}</p>
    </div>
  );
};

export default AudioRecorder;
