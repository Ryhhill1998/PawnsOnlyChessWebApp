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

    #addClassToElement(element, className) {
        element.classList.add(className);
    }

    #removeClassFromElement(element, className) {
        element.classList.remove(className);
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

    getSpaceFromCoordinates(x, y) {
        const row = this.#getElement("#row-" + y);
        return this.#getElement(row,".space-" + x);
    }

    getCoordinatesFromSpace(space) {
        const x = Number.parseInt(space.classList.value.at(-1));
        const y = Number.parseInt(space.closest(".row").id.at(-1));
        return [x, y];
    }

    showPossibleMoves(possibleMoves) {
        possibleMoves.forEach(move => {
            const [x, y] = move.coordinates;
            const space = this.getSpaceFromCoordinates(x, y);

            move.type === "take"
                ? addValidTakeOverlay(space)
                : addValidMoveOverlay(space);
        });
    }

    hidePossibleMoves(possibleMoves) {
        possibleMoves.forEach(move => {
            const space = this.getSpaceFromCoordinates(move);

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

    getPiece(space) {
        return space.querySelector("img");
    }

    getPieceColour(piece) {
        if (!piece) return;

        const imageSrc = piece.getAttribute("src");

        return imageSrc.includes("white") ? "white" : "black";
    }

    pieceHasMoved(piece) {
        return piece.getAttribute("src").includes("moved");
    }

    spaceIsFree(x, y) {
        const space = this.getSpaceFromCoordinates(x, y);
        return getImage(space) === null;
    }

    displayWinner(winner) {
        const winnerInfo = winner === "white" ? this.#whitePlayerInfo : this.#blackPlayerInfo;

        this.#addClassToElement(winnerInfo, "winner");
    }

    displayActivePlayer(player) {
        const playerInfo = player === "white" ? this.#whitePlayerInfo : this.#blackPlayerInfo;

        this.#addClassToElement(playerInfo, "active");
    }

    hideActivePlayer(player) {
        const playerInfo = player === "white" ? this.#whitePlayerInfo : this.#blackPlayerInfo;

        this.#removeClassFromElement(playerInfo, "active");
    }
}

export default View;