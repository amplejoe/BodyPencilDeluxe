
import { Title } from './screens/Title.js';
import { Game } from './screens/Game.js';
import { GameOver } from './screens/GameOver.js';
import { globals } from './globals.js'
import {BodyParts, PoseDetector} from "./PoseDetector.js";

export class Controller {
    constructor() {

        this.activeScreen = new Title();
        this.poseDetector = null;
        this.isPosDetectorInitialized = false;

        // tmp global cfg
        console.log(`test cfg -- globals.testvar: ${globals.testvar}`)

        this.init();
    }

    init() {
        this.initPosenet();

        console.log("Controller initialized.")
    }

    initPosenet() {
        this.poseDetector = new PoseDetector(this, $("#webcamVideo")[0], 0.3, 11);
        
        this.poseDetector.init(globals.useResNet).then(() => {
            this.isPosDetectorInitialized = true;
            document.querySelector("#startButton").disabled = false;
            document.querySelector("#posenet-loading").innerHTML = `
            <i class="fas fa-thumbs-up"></i>
            `;
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