export class Title {
    constructor() {

        console.log("Title initialized.");

        controller.websocketHandler.getAllJoinableSessions((sessions) => {
            // TODO fill dropdown list
        });

    }
}
