export class RTCPeer {

    static count = 0;

    constructor(initiator, otherPlayer) {
        this.otherPlayerId = otherPlayer.uuid;
        this.connected = false;

        if (RTCPeer.count++ === 0) {
            this.canvasSide = "left";
        } else {
            this.canvasSide = "right";
        }

        this.peer = new SimplePeer({
            initiator: initiator,
            trickle: true,  // much faster with trickling
        });
        this.initEvents();

        const constraints = {
            video: true,
            audio: false // TODO re-enable audio for demo
        };
        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            this.peer.addStream(stream);
        });

    }

    // sendPosition(position) {
    //     if (this.connected) {
    //         this.peer.send(JSON.stringify(position));
    //     }
    // }

    sendImage(base64Image) {
        if (this.connected) {
            this.peer.send(base64Image);
        }
    }

    initEvents() {
        this.peer.on('error', err => console.log('error', err));

        this.peer.on('signal', data => {
            // console.log('SIGNAL', JSON.stringify(data));
            // send this data to the other peer (via websocket with other player id)
            controller.websocketHandler.sendRtcSignal(data, this.otherPlayerId);
        })

        this.peer.on('connect', () => {
            console.log('webrtc connected!');
            this.connected = true;
        })

        this.peer.on('data', base64image => {
            // const position = JSON.parse(data);
            // console.log(position);

            if (controller.player.currentRole === "viewer") {
                if (this.canvasSide === "left") {
                    controller.activeScreen.canvasLeft.fromBase64(base64image);
                } else {
                    controller.activeScreen.canvasRight.fromBase64(base64image);
                }
            }
        })

        this.peer.on('stream', stream => {

            console.log("stream received!");

            // take the next available video element
            for (let videoElement of $(".player-display video")) {
                if (!videoElement.srcObject) {
                    videoElement.srcObject = stream;
                    videoElement.play();
                    $(videoElement).parent().playerId = this.otherPlayerId; // very nice workaround (not!)
                    break;
                }
            }

        })
    }

    signal(signalData) {
        this.peer.signal(signalData);
    }
}
