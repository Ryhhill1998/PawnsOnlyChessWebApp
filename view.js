// constants
const pieceSelectedHTML = `<div class="space-overlay space-overlay-selected"></div>`;
const validMoveIndicatorHTML = `<div class="space-overlay space-overlay-possible-move"></div>`;
const validTakeIndicatorHTML = `<div class="space-overlay space-overlay-possible-take"></div>`;

class View {
    #board;

    #blackPlayerInfo;
    #whitePlayerInfo;
    #undoButton;
    #infoButton;

    constructor() {
        // board
        this.#board = this.#getElement("#board");

        // player info sections
        this.#blackPlayerInfo = this.#getElement("#black-player-info");
        this.#whitePlayerInfo = this.#getElement("#white-player-info");

        // buttons in header
        this.#undoButton = this.#getElement("#undo-button");
        this.#infoButton = this.#getElement("#info-button");
    }

    #getElement(parentElement = document, selector) {
        const identifier = selector[0];

        return identifier === "#"
            ? parentElement.getElementById(selector.slice(1))
            : parentElement.querySelector(selector);
    }

    #addOverlay(space, html) {
        space.insertAdjacentHTML("beforeend", html);
    }

    addPieceSelectedOverlay(space) {
        if (!space) return;

        this.#addOverlay(space, pieceSelectedHTML);
    }

    addValidMoveOverlay(space) {
        if (!space) return;

        this.#addOverlay(space, validMoveIndicatorHTML);
    }

    addValidTakeOverlay(space) {
        if (!space) return;

        this.#addOverlay(space, validTakeIndicatorHTML);
    }

    #removeOverlay(space, selector) {
        const overlay = this.#getElement(space, selector);

        if (!overlay) return;

        space.removeChild(overlay);
    }

    removeSelectedOverlay(space) {
        if (!space) return;

        this.#removeOverlay(space, ".space-overlay-selected");
    }

    removeValidMoveOverlay(space) {
        if (!space) return;

        this.#removeOverlay(space, ".space-overlay-possible-move");
    }

    removeValidTakeOverlay(space) {
        if (!space) return;

        this.#removeOverlay(space, ".space-overlay-possible-take");
    }

    removePossiblePositionsOverlay(space) {
        removeValidMoveOverlay(space);
        removeValidTakeOverlay(space);
    }

    #getSpaceFromMove(move) {
        const coordinates = move.coordinates;
        const row = this.#getElement("#row-" + coordinates[1]);
        return this.#getElement(row,".space-" + coordinates[0]);
    }

    showPossibleMoves(possibleMoves) {
        possibleMoves.forEach(move => {
            const space = this.#getSpaceFromMove(move);

            move.type === "take"
                ? addValidTakeOverlay(space)
                : addValidMoveOverlay(space);
        });
    }

    hidePossibleMoves(possibleMoves) {
        possibleMoves.forEach(move => {
            const space = this.#getSpaceFromMove(move);

            removePossiblePositionsOverlay(space);
        });
    }

    showPreviousMove(lastMove) {
        addPieceSelectedOverlay(lastMove.startSpace);
        addPieceSelectedOverlay(lastMove.endSpace);
    }

    hidePreviousMove(lastMove) {
        removeSelectedOverlay(lastMove.startSpace);
        removeSelectedOverlay(lastMove.endSpace);
    }

    getPieceColour(image) {
        if (!image) return;

        const imageSrc = image.getAttribute("src");

        return imageSrc.includes("white") ? "white" : "black";
    }

    getImage(space) {
        return space.querySelector("img");
    }

}

export default View;