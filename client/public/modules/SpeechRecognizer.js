import {globals} from "./globals.js";

export class SpeechRecognizer {

    static colors = ["black", "red", "blue", "green", "yellow", "orange", "brown"];
    static commands = ["stop", "start", "plus", "minus"];

    constructor(poseDetector) {
        this.poseDetector = poseDetector; // we need the poseDetector to call the pause() function

        let SpeechRecognition_ = window.SpeechRecognition || webkitSpeechRecognition;
        let SpeechGrammarList_ = window.SpeechGrammarList || webkitSpeechGrammarList;

        // TODO how exactly does this work?
        // TODO consider the non-color commands in the grammar?
        let grammar = '#JSGF V1.0; grammar colors; public <color> = ' + SpeechRecognizer.colors.join(' | ') + ' ;'

        let speechRecognitionList = new SpeechGrammarList_();
        speechRecognitionList.addFromString(grammar, 1);

        this.recognition = new SpeechRecognition_();
        this.recognition.grammars = speechRecognitionList;
        this.recognition.continuous = true;
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;

        this.initHandlers();
    }

    initHandlers() {
        this.recognition.onresult = (event) => {
            // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
            // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
            // It has a getter so it can be accessed like an array
            // The first [0] returns the SpeechRecognitionResult at the last position.
            // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
            // These also have getters so they can be accessed like arrays.
            // The second [0] returns the SpeechRecognitionAlternative at position 0.
            // We then return the transcript property of the SpeechRecognitionAlternative object

            /* TODO
                    - consider every result (also non-final results)
                    - consider all alternatives
                    - consider list of frequent
                    - if something is recognized -> remember this array position and don't consider again

             */

            console.log(event.results);

            let result = event.results[event.results.length - 1][0].transcript;
            // console.log('Result received: ' + result);
            // console.log('Confidence: ' + event.results[event.results.length - 1][0].confidence);

            result = result.trim().toLowerCase();
            if (result === "stop") {
                this.poseDetector.pauseDetectionLoop();
            } else if (result === "start") {
                this.poseDetector.resumeDetectionLoop();
                // TODO commands for stroke thickness
            } else if (SpeechRecognizer.colors.includes(result)) {
                // TODO red is often misunderstood (brad, brett, rat, rate, rhett) -> simply accept those as red ("tolerance list")
                globals.selectedColor = result;
                this.poseDetector.resumeDetectionLoop();
            }
        }

        // only means that for some time, no speech has been detected
        this.recognition.onspeechend = () => {
            // console.log("speech ended");
        }

        this.recognition.onnomatch = (event) => {
            console.log("I didn't recognise that command");
        }

        this.recognition.onerror = (event) => {
            // no-speech is not really an error, it just means that for some time, nothing was received
            // but we still need to continue listening
            if (event.error != "no-speech") {
                console.log('Error occurred in recognition: ' + event.error);
            }
        }

        this.recognition.onend = () => {
            // restart... (this happens when the "no-speech" error is thrown)
            this.recognition.start();
        }
    }

    startRecognition() {
        this.recognition.start();
        console.log('speech recognition started');
    }

    stopRecognition() {
        this.recognition.stop();
        console.log("speech recognition stopped");
    }
}
