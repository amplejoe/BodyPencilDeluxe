export class RTCPeer {

    constructor(initiator, otherPlayer) {
        this.otherPlayer = otherPlayer;
        this.peer = new SimplePeer({
            initiator: initiator,
            trickle: true  // much faster with trickling
        });

        this.initEvents();
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
    }

    // TODO call this when we get signal data from the ws server
    signal(signalData) {
        this.peer.signal(signalData);
    }
}
