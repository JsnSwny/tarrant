# tarrant.io

## Installation

First, install the dependencies from inside the project folder.

`npm install`

Next, you must get (or train) the most recent NLU model from [the NLU repository](https://github.com/Zein2002/F20CA). Move it to `data/models/nlu-model.tar.gz`.

Two servers must be run alongside the core server: the Rasa-powered NLU server and the Django server.

`npm run start-nlu`

`npm run start-django`

The core server can now be started.

`npm start`

## Environment file

To configure system behaviour, create a file named `.env` in the project root. A boilerplate `.env` file can be found inside `res/example-env.txt`.

### Environment variables

> DEBUG\_MODE: Set to 1 to display runtime information.

> DEBUG\_NLU: Set to 1 to display NLU server responses.

> EMULATE\_DIALOGUE: Set to 1 to send dialogue to the chatbot for testing.

> ON\_UNIX: Set to 1 if on Unix-based machine.
