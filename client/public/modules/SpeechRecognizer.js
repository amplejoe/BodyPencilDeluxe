import {globals} from "./globals.js";

export class SpeechRecognizer {

    constructor(poseDetector) {
        // TODO do we need these two lines? (they produce an error)
        // let SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
        // let SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
        let SpeechRecognition = webkitSpeechRecognition;
        let SpeechGrammarList = webkitSpeechGrammarList;

        let colors = ["black", "red", "blue", "green", "yellow", "orange", "brown", "stop", "start"];
        let grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'

        let recognition = new SpeechRecognition();
        let speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
        recognition.continuous = true;  // TODO set to false and restart?
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        // document.body.onclick = () => {
        recognition.start();
        console.log('Ready to receive a color command.');
        // }

        recognition.onresult = (event) => {
            // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
            // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
            // It has a getter so it can be accessed like an array
            // The first [0] returns the SpeechRecognitionResult at the last position.
            // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
            // These also have getters so they can be accessed like arrays.
            // The second [0] returns the SpeechRecognitionAlternative at position 0.
            // We then return the transcript property of the SpeechRecognitionAlternative object
            let result = event.results[event.results.length - 1][0].transcript;
            console.log('Result received: ' + result);
            console.log('Confidence: ' + event.results[event.results.length - 1][0].confidence);

            result = result.trim().toLowerCase();
            if (result === "stop") {
                poseDetector.pauseDetectionLoop();
            } else if (result === "start") {
                poseDetector.resumeDetectionLoop();
            } else if (colors.includes(result)) {
                globals.selectedColor = result;
                poseDetector.resumeDetectionLoop();
            }
        }

        recognition.onspeechend = function () {
            console.log("stopping recognition");
            recognition.stop();
        }

        recognition.onnomatch = function (event) {
            console.log("I didn't recognise that color.");
        }

        recognition.onerror = function (event) {
            console.log('Error occurred in recognition: ' + event.error);
        }
    }
}
