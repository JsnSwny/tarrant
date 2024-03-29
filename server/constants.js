const dotenv = require("dotenv");

dotenv.config();

module.exports.DEBUG_MODE = Boolean(Number(process.env.DEBUG_MODE)) || false;
module.exports.DEBUG_NLU = Boolean(Number(process.env.DEBUG_NLU)) || false;

module.exports.EMULATE_DIALOGUE =
	Boolean(Number(process.env.EMULATE_DIALOGUE)) || false;
module.exports.ON_UNIX = Boolean(Number(process.env.ON_UNIX)) || false;
module.exports.TIME_SCALE_FACTOR = Number(process.env.TIME_SCALE_FACTOR) || 1;

module.exports.CONTRACTION_SUBSTITUTIONS = [
	["can't", "can not"],
	["couldn't", "could not"],
	["isn't", "is not"],
	["it's", "it is"],
	["won't", "will not"],
	["wouldn't", "would not"],
];

module.exports.COLOUR_RED = "\033[0;31m";
module.exports.COLOUR_GREEN = "\033[0;32m";
module.exports.COLOUR_YELLOW = "\033[2;33m";
module.exports.COLOUR_BLUE = "\033[0;34m";
module.exports.COLOUR_PURPLE = "\033[0;35m";
module.exports.COLOUR_CYAN = "\033[1;36m";
module.exports.COLOUR_WHITE_BOLD = "\033[1;37m";
module.exports.COLOUR_WHITE_LIGHT = "\033[2;37m";
module.exports.COLOUR_NONE = "\033[0m";

module.exports.FORMATTED_CATEGORIES = {
	"Mythology": "mythology",
	"Entertainment: Film": "entertainment-film",
	"Entertainment: Cartoon & Animations": "entertainment-cartoon-and-animations",
	"Entertainment: Music": "entertainment-music",
	"Science & Nature": "science-and-nature",
	"History": "history",
	"Entertainment: Books": "entertainment-books",
	"Geography": "geography",
	"Science: Computers": "science-computers",
	"General Knowledge": "general-knowledge",
	"Science: Gadgets": "science-gadgets",
	"Sports": "sports",
	"Entertainment: Video Games": "entertainment-video-games",
	"Entertainment: Television": "entertainment-television",
	"Celebrities": "celebrities",
	"Science: Mathematics": "science-mathematics",
	"Vehicles": "vehicles",
	"Entertainment: Board Games": "entertainment-board-games",
	"Entertainment: Japanese Anime & Manga": "entertainment-japanese-anime-and-manga",
	"Animals": "animals",
	"Art": "art",
	"Entertainment: Comics": "entertainment-comics",
	"Politics": "politics",
	"Entertainment: Musicals & Theatres": "entertainment-musicals-and-theatres"
};
