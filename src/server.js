import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);

// SocketIO admin-ui 사용을 위한 설정
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});
instrument(wsServer, {
  auth: false,
});

const publicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];

  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) publicRooms.push(key);
  });

  return publicRooms;
};

const countUser = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
};

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";

  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on("enter_room", (roomName, nickname, done) => {
    socket.join(roomName);
    console.log(socket.rooms);
    done();
    socket["nickname"] = nickname;
    socket.to(roomName).emit("welcome", socket.nickname, countUser(roomName));

    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countUser(room) - 1));
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
});

/*
const wss = new WebSocket.Server({ server }); // Create WebSocket Server
const sockets = [];

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
*/

httpServer.listen(3000, handleListen);
