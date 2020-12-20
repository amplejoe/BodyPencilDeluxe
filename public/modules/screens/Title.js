import {RTCPeer} from "../RTCPeer.js";

export class Title {
    constructor(webSocketHandler) {

        this.state = "title-init";

        // connection should already be established
        this.webSocketHandler = webSocketHandler;
        this.webSocketHandler.getAllJoinableSessions(
            (data) => {
                console.log(data);
                this.populateSessionsList(data);
            }
        );

        // nickname
        document.querySelector("#nicknameInput").value = localStorage.getItem('nickName');

        console.log("Title initialized.");

        // controller.websocketHandler.getAllJoinableSessions((sessions) => {
        //     // TODO fill dropdown list
        // });
    }

    enableInputs(value) {
        // enable inputs
        document.querySelector("#nicknameInput").disabled = !value;
        let currentNick = document.querySelector("#nicknameInput").value;
        let selectedSession = document.querySelector("#session-list").value;
        if (!currentNick) {
            document.querySelector("#create-button").disabled = true;
            // TODO: this depends on sessions being available
            document.querySelector("#join-button").disabled = true;
        } else {
            document.querySelector("#create-button").disabled = !value;
            // TODO: this depends on sessions being available
            if (selectedSession) {
                document.querySelector("#join-button").disabled = !value;
            } else {
                document.querySelector("#join-button").disabled = true;
            }
        }
        document.querySelector("#session-list").disabled = !value;

    }

    setNickName() {
        let currentNick = document.querySelector("#nicknameInput").value;
        localStorage.setItem('nickName', currentNick);
        // console.log(localStorage.getItem('nickName'));
        this.enableInputs(true);
    }

    populateSessionsList(sessions) {
        let select = document.getElementById("session-list");
        let options = sessions;

        $(select).empty();
        for (let i = 0; i < options.length; i++) {
            let opt = options[i];
            let el = document.createElement("option");
            el.textContent = `${opt.sessionName} (${opt.players.length})`;
            el.value = opt.sessionName;
            select.appendChild(el);
        }
    }

    changeState(state) {
        this.state = state;
        let allStates = document.querySelectorAll("#title > div");

        for (let s of allStates) {
            if (s.id === state) {
                s.className = "flex-centered-col";
            } else {
                s.className = "hidden";
            }
        }
    }

    showPlayerCams() {
        document.querySelector("#player-cams-wrapper").className = "flex-centered-evenly";
    }

    createGameSession() {
        this.webSocketHandler.createGameSession(
            (data) => {
                console.log("created session " + data.sessionName);
                // TODO display sessionName
                this.changeState("title-lobby");
                this.showPlayerCams();
            }
        );
    }

    joinGameSession() {
        let selectedSession = document.querySelector("#session-list").value;
        console.log(selectedSession)
        this.webSocketHandler.joinGameSession(
            selectedSession,
            (result) => {
                // webRTC negotiation: every time a client joins,
                //  it gets a list of all previous clients and sends an webrtc offer to each
                if (result.err) {
                    console.log(result.err);
                    toastr.error(result.err);
                } else {
                    // send one offer per player; server forwards each offer to the corresponding co-player
                    for (const otherPlayer of result.currentPlayerList) {
                        if (otherPlayer.uuid !== controller.player.uuid) {
                            controller.rtcPeers[otherPlayer.uuid] = new RTCPeer(true, otherPlayer);
                        }
                    }
                    this.changeState("title-lobby");
                    this.showPlayerCams();
                }
            }
        );
    }

}
