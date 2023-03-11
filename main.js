const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const speech = require("@google-cloud/speech");
const _ = require("lodash");
const axios = require("axios");
const DialogueInputEmulator = require("./server/DialogueInputEmulator")
const { Server } = require("socket.io");
const { EMULATE_DIALOGUE } = require("./server/constants");
const { chatbot } = require("./server/objects");

// instantiate server object
const app = express();
const server = http.createServer(app);

// specify public directory
app.use(express.static(path.join(__dirname, "public")));

// middleware for parsing post bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// specify API
app.use("/", require("./routes/api"));

// start server
const PORT = 5000;
console.log(`Listening on port ${PORT}.`);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

process.env.GOOGLE_APPLICATION_CREDENTIALS = "./speech-to-text-key.json";

const speechClient = new speech.SpeechClient();

io.on("connection", (socket) => {
  let recognizeStream = null;
  console.log("** a user connected - " + socket.id + " **\n");

  socket.on("disconnect", () => {
    console.log("** user disconnected ** \n");
  });

  socket.on("send_message", (message) => {
    console.log("message: " + message);
    setTimeout(() => {
      io.emit("receive_message", "got this message" + message);
    }, 1000);
  });

  socket.on("startGoogleCloudStream", function (data) {
    startRecognitionStream(this, data);
  });

  socket.on("endGoogleCloudStream", function () {
    console.log("** ending google cloud stream **\n");
    stopRecognitionStream();
  });

  socket.on("send_audio_data", async (audioData) => {
    io.emit("receive_message", "Got audio data");
    if (recognizeStream !== null) {
      try {
        // console.log(audioData.audio);
        recognizeStream.write(audioData.audio);
      } catch (err) {
        console.log("AHHH Error calling google api " + err);
      }
    } else {
      // console.log("RecognizeStream is null");
    }
  });

const getAction = (transcript) => {
    axios
      .post("http://localhost:8000/api/get_action/", {
        input: transcript,
      })
      .then((res) => {
        console.log(res.data.action);
        return res.data.action;
      })
      .catch((err) => console.log(err));
  };

  function startRecognitionStream(client) {
    console.log("* StartRecognitionStream\n");
    console.log(request);
    try {
      recognizeStream = speechClient
        .streamingRecognize(request)
        .on("error", (err) => console.log(err))
        .on("data", (data) => {
          const transcription = data.results
            .map((result) => result.alternatives[0].transcript)
            .join("\n");

          console.log(data.results);
          console.log(data.results[data.results.length - 1].alternatives);
          result = data.results[0];

          words_info = result.alternatives[0].words;
          // console.log(data);
          const grouped = _.groupBy(words_info, (word) => word.speakerTag);
          if (result.isFinal) {
            console.log(transcription);
            const action = getAction(`U1 ${transcription}`);
            console.log(
              words_info.map((item) => ({
                word: item.word,
                speaker: item.speakerTag,
              }))
            );
            io.emit(
              "send_transcript",
              words_info.map((item) => ({
                word: item.word,
                speaker: item.speakerTag,
              }))
            );
          }

          //   console.log(transcription);
          //   console.log(speakers);
          //   console.log(`Transcription: ${transcription}`);
        });
    } catch (err) {
      console.error("OHHH Error streaming google api " + err);
    }
  }

  function stopRecognitionStream() {
    if (recognizeStream) {
      console.log("* StopRecognitionStream \n");
      recognizeStream.end();
    }
    recognizeStream = null;
  }
});

server.listen(PORT);

const dialogueInputEmulator = new DialogueInputEmulator(chatbot);

if (EMULATE_DIALOGUE) {
    setInterval(() => {
        dialogueInputEmulator.tick();
    }, 1000);
}

// =========================== GOOGLE CLOUD SETTINGS ================================ //

// The encoding of the audio file, e.g. 'LINEAR16'
// The sample rate of the audio file in hertz, e.g. 16000
// The BCP-47 language code to use, e.g. 'en-US'
const encoding = "LINEAR16";
const sampleRateHertz = 16000;
const languageCode = "ko-KR"; //en-US
const alternativeLanguageCodes = ["en-US", "ko-KR"];

const request = {
  config: {
    encoding: "LINEAR16",
    sampleRateHertz: 24000,
    languageCode: "en-US",
    diarizationConfig: {
      enableSpeakerDiarization: true,
      minSpeakerCount: 2,
      maxSpeakerCount: 2,
    },
    enbleWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
    model: "phone_call",
  },
  interimResults: true,
};
