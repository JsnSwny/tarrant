const dotenv = require("dotenv");

dotenv.config();

module.exports.DEBUG_MODE = Boolean(Number(process.env.DEBUG_MODE)) | false;
module.exports.DEBUG_NLU = Boolean(Number(process.env.DEBUG_NLU)) | false;

module.exports.EMULATE_DIALOGUE = Boolean(Number(process.env.EMULATE_DIALOGUE)) | false;
module.exports.ON_UNIX = Boolean(Number(process.env.ON_UNIX)) | false;
