const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName = "";

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");

  li.innerText = message;
  ul.appendChild(li);
};

const handleMessageSubmit = (event) => {
  event.preventDefault();
  const input = room.querySelector("input");
  const value = input.value;

  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });

  input.value = "";
};

const handleRoomSubmit = (event) => {
  event.preventDefault();
  const roomInput = form.querySelectorAll("input")[0];
  const nameInput = form.querySelectorAll("input")[1];

  socket.emit("enter_room", roomInput.value, nameInput.value, showRoom);

  roomName = roomInput.value;
  roomInput.value = "";
  nameInput.value = "";
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  room.querySelector("h3").innerText = `Room ${roomName}`;

  const form = room.querySelector("form");
  form.addEventListener("submit", handleMessageSubmit);
};

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, count) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${count})`;
  addMessage(`${user} joined! 😉`);
});

socket.on("bye", (user, count) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${count})`;
  addMessage(`${user} left 😥`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  console.log(rooms);

  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";

  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
