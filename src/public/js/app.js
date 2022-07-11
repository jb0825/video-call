const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nicknameForm = document.querySelector("#nickname");

const makeMessage = (type, payload) => {
  return JSON.stringify({ type, payload });
};

// socket = Connection to Server
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
  console.log("Connected to Server ✔");
});

socket.addEventListener("message", (message) => {
  console.log(message);

  const li = document.createElement("li");
  li.innerText = message.data;

  messageList.append(li);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server ❌");
});

const handleSubmit = (event) => {
  event.preventDefault();

  const input = messageForm.querySelector("input");

  socket.send(makeMessage("new_message", input.value));
  input.value = "";
};
const handleNicknameSubmit = (event) => {
  event.preventDefault();

  const input = nicknameForm.querySelector("input");

  socket.send(makeMessage("nickname", input.value));
  alert("nickname saved!");
};

messageForm.addEventListener("submit", handleSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit);
