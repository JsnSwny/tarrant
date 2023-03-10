const { postMethodFetch } = require("./functions");
const childProcess = require("child_process");

class IntentRecogniser {
  constructor() {}

  // passes user speech to nlu server and receives recognised intent
  recogniseIntent(userSpeech, next) {
    axios
      .post("http://localhost:5005/model/parse", {
        text: userSpeech,
      })
      .then((res) => {
        let data = res.data;
        let args = data.entities.map((entity) => entity.value);
        if (args.length > 0) {
          next({ value: `${data.intent.name}(${args.join(", ")})` });
        } else {
          next({ value: `${data.intent.name}` });
        }
      })
      .catch((err) => console.log(err));
  }
}

module.exports = IntentRecogniser;
