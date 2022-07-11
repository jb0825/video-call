import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

//app.listen(3000, handleListen);

const server = http.createServer(app); // Create Http Server
const wss = new WebSocket.Server({ server }); // Create WebSocket Server

const sockets = [];

// socket = Connection to browser
wss.on("connection", (socket) => {
  console.log("Connected to Browser ✔");
  sockets.push(socket);
  socket["nickname"] = "Anonymous";

  socket.on("close", () => console.log("Disconnected from Browser ❌"));
  socket.on("message", (message) => {
    const parsed = JSON.parse(message.toString());
    console.log(parsed);

    switch (parsed.type) {
      case "new_message":
        sockets.forEach((s) => s.send(`${socket.nickname}: ${parsed.payload}`));
        break;
      case "nickname":
        socket["nickname"] = parsed.payload;
        break;
    }
  });
});

server.listen(3000, handleListen);
