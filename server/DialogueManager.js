const childProcess = require("child_process");
const axios = require("axios");

class DialogueManager {
  constructor() {}

  // TODO: Use Cale's PyTorch model from this function.
  decideAction(userAndIntent, next) {
    axios
      .post("http://localhost:8000/api/get_action/", {
        input: userAndIntent,
      })
      .then((res) => {
        console.log(res);
        next({ value: res.data.action });
      })
      .catch((err) => console.log(err));
  }
}

module.exports = DialogueManager;
