export class RTCPeer {

    constructor(initiator, otherPlayer) {
        this.otherPlayer = otherPlayer;

        // if (initiator) {
        //     const constraints = {
        //         video: true,
        //         audio: false, // TODO set to true
        //     };
        //
        //     navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        this.peer = new SimplePeer({
            initiator: initiator,
            trickle: true,  // much faster with trickling
            // stream: stream
        });
        //         this.initEvents();
        //     });
        // } else {
        //     this.peer = new SimplePeer({
        //         initiator: initiator,
        //         trickle: true  // much faster with trickling
        //     });
        //     this.initEvents();
        // }


    }

    initEvents() {
        this.peer.on('error', err => console.log('error', err));

        this.peer.on('signal', data => {
            console.log('SIGNAL', JSON.stringify(data));
            // send this data to the other peer (via websocket with other player id)
            controller.websocketHandler.sendRtcSignal(data, this.otherPlayer);
        })

        this.peer.on('connect', () => {
            console.log('CONNECT');
            // TODO start streaming...
        })

        this.peer.on('data', data => {
            console.log('data: ' + data)
            // TODO handle the received data (drawing positions, canvas, whatever)
        })

        // this.peer.on('stream', stream => {
        //
        //     console.log("stream received!");
        //
        //     // got remote video stream, now let's show it in a video tag
        //     var video = $("#dummyVideo")[0];
        //
        //     if ('srcObject' in video) {
        //         video.srcObject = stream
        //     } else {
        //         video.src = window.URL.createObjectURL(stream) // for older browsers
        //     }
        //
        //     video.play()
        // })
    }

    // TODO call this when we get signal data from the ws server
    signal(signalData) {
        this.peer.signal(signalData);
    }
}
