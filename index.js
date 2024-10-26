const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const app = express();

const server = http.createServer(app);
const io = socket(server);

// Initialize the chess game and player management
const chess = new Chess();
let players = {};
let currentPlayer = "W";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Define routes
app.get("/", (req, res) => {
  res.render("index", { title: "Chess game" });
});

io.on("connection", function (uniquesocket) {
  console.log("Connected");

  // Assign player roles
  if (!players.white) {
    players.white = uniquesocket.id;
    uniquesocket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniquesocket.id;
    uniquesocket.emit("playerRole", "b");
  } else {
    uniquesocket.emit("spectatorRole");
  }

  // Handle player disconnection
  uniquesocket.on("disconnect", function () {
    if (uniquesocket.id === players.white) {
      delete players.white;
    } else if (uniquesocket.id === players.black) {
      delete players.black;
    }
  });

  // Handle valid chess moves
  uniquesocket.on("move", (move) => {
    try {
      if (chess) {
        if (chess.turn() === "w" && uniquesocket.id !== players.white) return;
        if (chess.turn() === "b  " && uniquesocket.id !== players.black) return;
        const result=chess.move(move)
        if(result){
          currentPlayer=chess.turn()

          io.emit("move",move)
          io.emit("boardState",chess.fen())
        }else{
          console.log("some error ",move)
          uniquesocket.emit("invalidmove",move)
        }
      }
      // Logic for validating and processing the move goes here
    } catch (err) {
      console.log("some error ",move)
      uniquesocket.emit("invalidmove",move)
    }
  });
});

server.listen(3000, function () {
  console.log("Listening on port 3000");
});
