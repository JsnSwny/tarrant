const childProcess = require("child_process");

class DialogueManager {

    constructor() {

    }

    // TODO: Use Cale's PyTorch model from this function.
    decideAction(userAndIntent, next) {

        let args = `localhost:8000/api/get_action/ -d '{"input":"${userAndIntent}"}'`;
        console.log(args);

        childProcess.exec("curl " + args, (err, stdout) => {
            if (err) {
                console.log("Shit there's an error");
                next({ "value": "server-side error: DialogueManager.decideAction: failed to perform curl" });
                throw(err);
            }
            const object = JSON.parse(stdout);
            console.log(object);
            next({ "value": object.action });
        });
    }

}

module.exports = DialogueManager;
