const dotenv = require("dotenv");

dotenv.config();

module.exports.EMULATE_DIALOGUE = Boolean(Number(process.env.EMULATE_DIALOGUE)) | false;
module.exports.ON_UNIX = Boolean(Number(process.env.ON_UNIX)) | false;
