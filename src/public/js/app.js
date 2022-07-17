const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
/** @type {RTCPeerConnection} */
let myPeerConnection;

const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];

    if (cameras.length === 0) {
      const option = document.createElement("option");
      
      option.innerText = "No Camera";
      camerasSelect.appendChild(option);
      return;
    }

    cameras.forEach(camera => {
      const option = document.createElement("option");

      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) 
        option.selected = true;

        camerasSelect.appendChild(option);
    });

  } catch (e) { console.log(e); }
}

const getMedia = async deviceId => {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstrains = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstrains : initialConstrains);
    myFace.srcObject = myStream;
    if (!deviceId) getCameras();
  } catch (e) { console.log(e); }
}

const handleMuteClick = () => {
  myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);

  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}
const handleCameraClick = () => {
  myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);

  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On"
    cameraOff = true;
  }
}
const handleCameraChange = () => {
  getMedia(camerasSelect.value);

  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0]; 
    const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video");

    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);


// Welcome Form (join a room)
const welcome = document.getElementById("welcome");
const call = document.getElementById("call");

call.hidden = true;
welcomeForm = welcome.querySelector("form");

const initCall = async () => {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
};

const handleWelcomeSubmit = async event => {
  event.preventDefault();

  const input = welcomeForm.querySelector("input");

  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
};

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code
// 방의 주인에게만 실행되는 코드 (for Peer A)
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();

  myPeerConnection.setLocalDescription(offer);
  console.log("➡ send the offer");
  socket.emit("offer", offer, roomName);
});


// 방에 참가한 사람에게만 실행되는 코드 (for Peer B)
socket.on("offer", async offer => {
  console.log("⬅ received the offer");
  myPeerConnection.setRemoteDescription(offer);

  const answer = await myPeerConnection.createAnswer();
  
  myPeerConnection.setLocalDescription(answer);
  console.log("➡ send the answer");
  socket.emit("answer", answer, roomName);
});

// 방의 주인에게 실행되는 코드 (for Peer A)
socket.on("answer", answer => {
  console.log("⬅ received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", ice => {
  console.log("⬅ received ice candidate")
  myPeerConnection.addIceCandidate(ice);
});

// RTC Code
// Create Peer-to-peer Connection
const makeConnection = () => {
  myPeerConnection = new RTCPeerConnection();
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);

  try {
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
  } catch (e) { console.log(e); }
}

const handleIce = (data) => {
  socket.emit("ice", data.candidate, roomName);
  console.log("➡ send ice candidate");
}

const handleAddStream = data => {
  console.log("Peer's Stream", data.stream);
  console.log("My Stream", myStream);

  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
}