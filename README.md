# Video Call

peer-to-peer video call using WebRTC

https://developer.mozilla.org/ko/docs/Web/API/WebRTC_API

#

![initial](src/peer_to_peer.png)

#### 1. Peer A 가 채팅방 생성 -> myPeerConnection 생성

#### 2. Peer B 가 채팅방 접속

#### 3. Peer A 에서 welcome 이벤트 발생:

    - createOffer()
    - setLocalDescription()
    - Signaling Server 로 offer 이벤트 전송

#### 4. Peer B 에서 offer 이벤트 발생

    - offer 리시브
    - setRemoteDescription()
    - createAnswer()
    - setLocalDescription()
    - Signaling Server 로 answer 이벤트 전송

#### 5. Peer A 에서 answer 이벤트 발생

    - answer 리시브
    - setRemoteDescription()

#### 6. IceCandidate event 발생

    - (Internet Connectivity Establishment, 인터넷 연결 생성):
        WebRTC 에 필요한 프로토콜.
    - myPeerConnection 을 생성하면 IceCandidate event 를 실행
    - 반대쪽 Peer 에서 IceCandidate 리시브
    - addIceCandidate()

#### 7. AddStream event 발생

    - addStream event 발생시 상대방의 카메라가 보여질 video 태그의 srcObject 값 부여
    - peer-to-peer 화상채팅 가능!

#

https 프로토콜이 아니면 WebRTC API 의 getUserMedia() 에서 오류가 발생하기 때문에  
[ngrok](https://ngrok.com/) 을 이용함 (https 무작위 도메인 생성해줌)

1. ngrok 설치
2. 환경 변수 설정
3. `ngrok http 8000`

#

서로 다른 네트워크에서 peer-to-peer 연결을 위해 STUN Server 를 등록해야 함  
STUN Server: 컴퓨터가 공용 IP 주소를 찾게해줌  
이 프로젝트에서는 Google STUN Server 를 사용함

```js
myPeerConnection = new RTCPeerConnection({
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
      ],
    },
  ],
});
```

[STUN Server 가이드 글](https://help.singlecomm.com/hc/en-us/articles/115007993947-STUN-servers-A-Quick-Start-Guide)

❗ 현재 구글 스턴서버가 동작하지 않는것으로 보임 ❗
