import {Canvas} from '../components/Canvas.js';
import {globals} from '../globals.js'
import {BodyParts, PoseDetector} from "../PoseDetector.js";
import {SpeechRecognizer} from "../SpeechRecognizer.js";

export class Game {
    constructor() {
        this.poseDetector = new PoseDetector(this, $("#webcamVideo")[0], 0.3, 11);
        this.speechRecognizer = new SpeechRecognizer(this.poseDetector);
        this.canvas = new Canvas();

        this.lastPosition = null; // TODO is this the right place for this variable?

        const bodyPart = BodyParts.rightWrist; // TODO make selectable / randomly assinged

        this.poseDetector.init(globals.useResNet).then(() => {
            // TODO start the loop based on game logic (and start command)
            this.poseDetector.startDetectionLoop(bodyPart, (position) => {
                // console.log(position);
                if (this.lastPosition) {
                    this.canvas.draw(this.lastPosition, position, 3, globals.selectedColor)
                }
                this.lastPosition = position;
            });
            // TODO remove!  (just for testing)
            setTimeout(this.poseDetector.stopDetectionLoop.bind(this.poseDetector), 60000);
        });
        console.log("Game initialized.");
    }
}
