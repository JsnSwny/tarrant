const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const speech = require("@google-cloud/speech");

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

const { Server } = require("socket.io");

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
        console.log(audioData.audio);
        recognizeStream.write(audioData.audio);
      } catch (err) {
        console.log("AHHH Error calling google api " + err);
      }
    } else {
      console.log("RecognizeStream is null");
    }
  });

  function startRecognitionStream(client) {
    console.log("* StartRecognitionStream\n");
    console.log(request);
    try {
      recognizeStream = speechClient
        .streamingRecognize(request)
        .on("error", (err) => console.log(err))
        .on("data", (data) => {
          console.log(data);
          //   console.log("TEST");
          //   const result = data.results[0];
          //   const isFinal = result.isFinal;
          //   const transcription = data.results
          //     .map((result) => result.alternatives[0].transcript)
          //     .join("\n");
          //   console.log(`Transcription: `, transcription);
          //   client.emit("receive_audio_text", {
          //     text: transcription,
          //     isFinal: isFinal,
          //   });
          //   // if end of utterance, let's restart stream
          //   // this is a small hack. After 65 seconds of silence, the stream will still throw an error for speech length limit
          //   if (data.results[0] && data.results[0].isFinal) {
          //     stopRecognitionStream();
          //     startRecognitionStream(client);
          //     console.log("restarted stream serverside");
          //   }
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

// =========================== GOOGLE CLOUD SETTINGS ================================ //

// The encoding of the audio file, e.g. 'LINEAR16'
// The sample rate of the audio file in hertz, e.g. 16000
// The BCP-47 language code to use, e.g. 'en-US'
// const encoding = "LINEAR16";
// const sampleRateHertz = 16000;
// const languageCode = "ko-KR"; //en-US
// const alternativeLanguageCodes = ["en-US", "ko-KR"];

// const request = {
//   config: {
//     encoding: encoding,
//     sampleRateHertz: sampleRateHertz,
//     languageCode: "en-US",
//     //alternativeLanguageCodes: alternativeLanguageCodes,
//     enableWordTimeOffsets: true,
//     enableAutomaticPunctuation: true,
//     enableWordConfidence: true,
//     enableSpeakerDiarization: true,
//     //diarizationSpeakerCount: 2,
//     //model: "video",
//     model: "command_and_search",
//     //model: "default",
//     useEnhanced: true,
//   },
//   interimResults: true,
// };

const encoding = "LINEAR16";
const sampleRateHertz = 16000;
const languageCode = "en-US";

const request = {
  config: {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  },
  interimResults: false, // If you want interim results, set this to true
};
