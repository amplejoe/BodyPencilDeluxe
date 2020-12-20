import {RTCPeer} from "../RTCPeer.js";

export class Title {
    constructor(webSocketHandler) {

        this.state = "title-init";

        // connection should already be established
        this.webSocketHandler = webSocketHandler;
        this.webSocketHandler.getAllJoinableSessions(
            (data) => {
                this.populateSessionsList(data);
            }
        );
        // TODO: remove TMP, dummy population
        const sessions = [
            {sessionName: "session 1", players: [1,2]},
            {sessionName: "session 2", players: [1]},
            {sessionName: "session 3", players: [1,3]}
        ]
        this.populateSessionsList(sessions);

        // nickname
        document.querySelector("#nicknameInput").value = localStorage.getItem('nickName');

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

    enableInputs(value) {
        // enable inputs
        document.querySelector("#nicknameInput").disabled = !value;
        let currentNick = document.querySelector("#nicknameInput").value;
        let selectedSession = document.querySelector("#session-list").value;
        if (!currentNick) {
            document.querySelector("#create-button").disabled = true;
            // TODO: this depends on sessions being available
            document.querySelector("#join-button").disabled = true;
        }
        else {
            document.querySelector("#create-button").disabled = !value;
            // TODO: this depends on sessions being available
            if (selectedSession) {
                document.querySelector("#join-button").disabled = !value;
            }
            else {
                document.querySelector("#join-button").disabled = true;
            }
        }
        document.querySelector("#session-list").disabled = !value;

    }

    setNickName() {
        let currentNick = document.querySelector("#nicknameInput").value;
        localStorage.setItem('nickName', currentNick);
        console.log(localStorage.getItem('nickName'));
        this.enableInputs(true);
    }

    populateSessionsList(sessions) {
        let select = document.getElementById("session-list");
        let options = sessions;

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
        document.querySelector("#player-cams-wrapper").className = "flex-centered";
    }

    createSession() {
        this.webSocketHandler.createSession(
            (data) => {
                this.changeState("title-lobby");
                this.showPlayerCams();
            }
            );
        // TODO: remove
        this.changeState("title-lobby");
        this.showPlayerCams();
    }

    joinSession() {
        let selectedSession = document.querySelector("#session-list").value;
        console.log(selectedSession)
        this.webSocketHandler.joinGameSession(
            selectedSession,
            (data) => {
                this.changeState("title-lobby");
                this.showPlayerCams();

            }
        );
        // TODO: remove
        this.changeState("title-lobby");
        this.showPlayerCams();

    }

}
