const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

// instantiate server object
const app = express();
const server = http.createServer(app);

// specify public directory
app.use(express.static(path.join(__dirname, "public")));

// middleware for parsing post bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// specify API
app.use("/", require("./routes/api"));

// start server
const PORT = 5000;
console.log(`Listening on port ${PORT}.`);
server.listen(PORT);
