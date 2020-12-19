
import { Title } from './screens/Title.js';
import { Game } from './screens/Game.js';
import { GameOver } from './screens/GameOver.js';
import { globals } from './globals.js'

export class Controller {
    constructor() {

        this.activeScreen = new Title();

        // tmp global cfg
        console.log(`test cfg -- globals.testvar: ${globals.testvar}`)

        this.init();
    }

    init() {
        console.log("Controller initialized.")
    }

    createScreenControl(screenID) {
        if (screenID === "title") {
            return new Title();
        } else if (screenID === "game") {
            return new Game();
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