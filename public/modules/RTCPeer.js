export class RTCPeer {

    constructor(initiator, otherPlayer) {
        this.otherPlayerId = otherPlayer.uuid;

        this.peer = new SimplePeer({
            initiator: initiator,
            trickle: true,  // much faster with trickling
        });
        this.initEvents();

        const constraints = {
            video: true,
            audio: true
        };
        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            this.peer.addStream(stream);
        });
    }

    initEvents() {
        this.peer.on('error', err => console.log('error', err));

        this.peer.on('signal', data => {
            // console.log('SIGNAL', JSON.stringify(data));
            // send this data to the other peer (via websocket with other player id)
            controller.websocketHandler.sendRtcSignal(data, this.otherPlayerId);
        })

        this.peer.on('connect', () => {
            console.log('CONNECT');
            // TODO start streaming...
        })

        this.peer.on('data', data => {
            console.log('data: ' + data)
            // TODO handle the received data (drawing positions, canvas, whatever)
        })

        this.peer.on('stream', stream => {

            console.log("stream received!");

            // take the next available video element
            // TODO somehow keep track of which player is on which position...
            for (let videoElement of $(".player-display video")) {
                if (!videoElement.srcObject) {
                    videoElement.srcObject = stream;
                    videoElement.play();
                    $(videoElement).parent().playerId = this.otherPlayerId; // very nice workaround
                    break;
                }
            }

        })
    }

    // TODO call this when we get signal data from the ws server
    signal(signalData) {
        this.peer.signal(signalData);
    }
}
