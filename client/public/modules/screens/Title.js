import {RTCPeer} from "../RTCPeer.js";

export class Title {
    constructor(webSocketHandler) {
        this.webSocketHandler = webSocketHandler;

        console.log("Title initialized.");

        // controller.websocketHandler.getAllJoinableSessions((sessions) => {
        //     // TODO fill dropdown list
        // });
    }

    // TODO preliminary function for testing, not sure if this is the right place
    joinGameSession(sessionName) {
        // webRTC negotiation: every time a client joins,
        //  it gets a list of all previous clients and sends an webrtc offer to each
        controller.websocketHandler.joinGameSession(sessionName, (result) => {
            if (result.err) {
                console.log(result.err);
            } else {
                // send one offer per player; server forwards each offer to the corresponding co-player
                for (const otherPlayer of result.currentPlayerList) {
                    controller.rtcPeers[otherPlayer.uuid] = new RTCPeer(true, otherPlayer);
                }
            }
        })
    }
}
