import { Title } from './screens/Title.js';
import { Game } from './screens/Game.js';
import { GameOver } from './screens/GameOver.js';
import { globals } from './globals.js'
import {BodyParts, PoseDetector} from "./PoseDetector.js";
import {WebSocketHandler} from "./WebSocketHandler.js";

export class Controller {
    constructor() {

        this.activeScreen = null;

        this.isWebsocketInitialized = false;

        this.poseDetector = null;
        this.isPosDetectorInitialized = false;

        this.gameSession = null;
        this.player = null;

        this.rtcPeers = {}; // map player uuid -> RTCPeer instance

        // tmp global cfg
        console.log(`test cfg -- globals.testvar: ${globals.testvar}`)

        this.init();
    }

    async initWebsocketHandler() {
        return new Promise( (res, rej) => {
            this.websocketHandler = new WebSocketHandler(this, globals.websocketURL, res);
        });
    }

    tryInitUserInput() {
        if (this.isWebsocketInitialized && this.isPosDetectorInitialized) {
            this.activeScreen.enableInputs(true);
            // toastr["success"]("Initialization complete!");
        }
    }

    init() {

        // websocket
        this.initWebsocketHandler().then(
            () => {
                this.isWebsocketInitialized = true;
                this.activeScreen = new Title(this.websocketHandler);
                document.querySelector("#websock-info").style.backgroundColor = "green";
                document.querySelector("#websock-loading").innerHTML =
                `
                    <i class="fas fa-thumbs-up"></i>
                `;
                this.tryInitUserInput();
            }
        );

        // posenet
        this.setNetUrlParam() // choose between ["resnet", "mobilenet"]
        this.initPosenet().then(
            () => {
                this.isPosDetectorInitialized = true;
                
                document.querySelector("#posenet-info").style.backgroundColor = "green";

                document.querySelector("#posenet-loading").innerHTML =
                `
                    <i class="fas fa-thumbs-up"></i>
                `;
                this.tryInitUserInput();
            }
        );

        // TODO: remove/hide body part selection list
        this.populateBodyPartList();

        console.log("Controller initialized.")
    }

    setNetUrlParam() {

        // set url parameter to desired pose net
        let useResNet = globals.useResNet; // take default if not already defined
        let currentNetParam = globals.findGetParameter("net");
        if (currentNetParam) {
            useResNet = currentNetParam === "resnet" ? true : false;
        }
        let newURL = globals.updateURLParameter(window.location.href, 'net', useResNet ? "resnet" : "mobilenet");
        window.history.replaceState('', '', newURL);

        document.querySelector("#posenet-text").innerHTML =
        `
            ${globals.findGetParameter("net")}:&nbsp;
        `;

    }

    populateBodyPartList() {
        let select = document.getElementById("bodyPartSelect");
        let options = Object.keys(BodyParts);

        for (let i = 0; i < options.length; i++) {
            let opt = options[i];
            let el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            select.appendChild(el);
        }
    }


    async initPosenet() {
        return new Promise ( (res, rej) => {
            let useResNet = globals.findGetParameter("net") === "resnet" ? true : false;

            console.log("Using Resnet: " + useResNet);

            this.poseDetector = new PoseDetector($("#webcamVideo")[0], 0.3, 11);

            this.poseDetector.init(useResNet).then(
                () => { res(); });
        });
    }

    createScreenControl(screenID) {
        if (screenID === "title") {
            return new Title();
        } else if (screenID === "game") {
            return new Game(this.poseDetector);
        } else if (screenID === "gameover") {
            return new GameOver();
        }
    }

    switchScreen(screenID) {
        let screenElements = document.querySelectorAll("#content > div");

        for (screen of screenElements) {
            if (screen.id === screenID) {
                // screen.className = "active";
                screen.className = "flex-centered";
                // screen.classList.add("flex-centered");
                this.activeScreen = this.createScreenControl(screenID);
            } else {
                screen.className = "hidden";
            }

        }
        // console.log(screenElements);
    }

}
