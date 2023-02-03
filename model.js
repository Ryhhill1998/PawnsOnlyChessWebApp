class Model {

    constructor() {
        // board
        const board = this.getElement("#board");

        // player info sections
        const blackPlayerInfo = this.getElement("#black-player-info");
        const whitePlayerInfo = this.getElement("#white-player-info");

        // buttons in header
        const undoButton = this.getElement("#undo-button");
        const infoButton = this.getElement("#info-button");
    }

    getElement(selector) {
        const identifier = selector[0];
        return identifier === "#"
            ? document.getElementById(selector.slice(1))
            : document.querySelector(selector);
    }
}

export default Model;