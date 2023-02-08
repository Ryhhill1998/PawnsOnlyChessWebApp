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
    #instructions;
    #closeInstructionsButton;
    #overlay;
    #whitePieces;
    #blackPieces;

    constructor() {
        // board
        this.#board = this.#getElement("#board");

        // player info sections
        this.#blackPlayerInfo = this.#getElement("#black-player-info");
        this.#whitePlayerInfo = this.#getElement("#white-player-info");

        // buttons in header
        this.#undoButton = this.#getElement("#undo-button");
        this.#infoButton = this.#getElement("#info-button");

        // instructions and overlay
        this.#instructions = this.#getElement("#instructions");
        this.#closeInstructionsButton = this.#getElement("#close-instructions-button");
        this.#overlay = this.#getElement("#overlay");

        // white and black pieces arrays
        this.#whitePieces = [...this.#getAllElements(".white-piece")];
        this.#blackPieces = [...this.#getAllElements(".black-piece")];
    }

    #getElement(selector, parentElement = document) {
        const identifier = selector[0];

        return identifier === "#"
            ? parentElement.getElementById(selector.slice(1))
            : parentElement.querySelector(selector);
    }

    #getAllElements(selector) {
        return document.querySelectorAll(selector);
    }

    getRandomPiece(colour) {
        const piecesArray = colour === "white" ? this.#whitePieces : this.#blackPieces;
        const randomIndex = Math.floor(Math.random() * piecesArray.length);
        return piecesArray[randomIndex];
    }

    getSpaceClicked(elementClicked) {
        return elementClicked.closest(".space");
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
        const overlay = this.#getElement(selector, space);

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
        this.removeValidMoveOverlay(space);
        this.removeValidTakeOverlay(space);
    }

    getSpaceFromCoordinates(x, y) {
        const row = this.#getElement("#row-" + y);
        return this.#getElement(".space-" + x, row);
    }

    getCoordinatesFromSpace(space) {
        const x = Number.parseInt(space.classList.value.at(-1));
        const y = Number.parseInt(space.closest(".row").id.at(-1));
        return [x, y];
    }

    getSpaceFromPiece(piece) {
        return piece.closest(".space");
    }

    showPossibleMoves(possibleMoves) {
        possibleMoves.forEach(move => {
            const [x, y] = move.coordinates;
            const space = this.getSpaceFromCoordinates(x, y);

            move.type === "take"
                ? this.addValidTakeOverlay(space)
                : this.addValidMoveOverlay(space);
        });
    }

    hidePossibleMoves(possibleMoves) {
        possibleMoves.forEach(move => {
            const [x, y] = move.coordinates;
            const space = this.getSpaceFromCoordinates(x, y);

            this.removePossiblePositionsOverlay(space);
        });
    }

    showPreviousMove(lastMove) {
        this.addPieceSelectedOverlay(lastMove.startSpace);
        this.addPieceSelectedOverlay(lastMove.endSpace);
    }

    hidePreviousMove(lastMove) {
        this.removeSelectedOverlay(lastMove.startSpace);
        this.removeSelectedOverlay(lastMove.endSpace);
    }

    getPiece(space) {
        if (!space) return;

        return this.#getElement("img", space);
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
        return this.getPiece(space) === null;
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

    addPieceTaken(playerInfoColour, piece, additionalPieces) {
        const playerInfoElement = playerInfoColour === "white" ? this.#whitePlayerInfo : this.#blackPlayerInfo;
        const piecesTakenElement = this.#getElement(".pieces-taken", playerInfoElement);
        const piecesArray = playerInfoColour === "white" ? this.#blackPieces : this.#whitePieces;

        if (additionalPieces <= 0) {
            const piecesElement = this.#getElement(".pieces", piecesTakenElement);
            piecesElement.appendChild(piece);
        } else {
            const additionalPiecesElement = this.#getElement(".additional-pieces", piecesTakenElement);
            additionalPiecesElement.innerHTML = "+" + additionalPieces;
        }

        const updatedPieces = piecesArray.filter(p => p !== piece);

        playerInfoColour === "white" ? this.#blackPieces = updatedPieces : this.#whitePieces = updatedPieces;
    }

    replacePieceTaken(playerInfoColour, additionalPieces, spaceTakenFrom) {
        const playerInfoElement = playerInfoColour === "white" ? this.#whitePlayerInfo : this.#blackPlayerInfo;
        const piecesTakenElement = this.#getElement(".pieces-taken", playerInfoElement);
        const piecesArray = playerInfoColour === "white" ? this.#blackPieces : this.#whitePieces;

        const lastPieceTaken = piecesTakenElement.querySelector(".pieces img:last-child");
        spaceTakenFrom.appendChild(lastPieceTaken);

        if (additionalPieces >= 0) {
            const additionalPiecesElement = this.#getElement(".additional-pieces", piecesTakenElement);
            additionalPiecesElement.innerHTML = additionalPieces === 0 ? "" : "+" + additionalPieces;
            const pieceCopy = lastPieceTaken.cloneNode();
            const piecesElement = this.#getElement(".pieces", piecesTakenElement);
            piecesElement.appendChild(pieceCopy);
        }

        piecesArray.push(lastPieceTaken);
    }

    movePiece(piece, spaceFrom, spaceTo) {
        spaceFrom.removeChild(piece);
        spaceTo.appendChild(piece);

        if (!this.pieceHasMoved(piece)) {
            this.makeFirstMove(piece);
        }
    }

    makeFirstMove(piece) {
        const pieceImageSrc = piece.getAttribute("src").split(".")[0] + "-moved.svg";
        piece.setAttribute("src", pieceImageSrc);
    }

    undoFirstMove(piece) {
        const pieceImageSrc = piece.getAttribute("src").split("-")[0] + ".svg";
        piece.setAttribute("src", pieceImageSrc);
    }

    getPiecesArray(colour) {
        return colour === "white" ? this.#whitePieces : this.#blackPieces;
    }

    showInstructions() {
        this.#instructions.classList.remove("no-display");
    }

    showOverlay() {
        this.#overlay.classList.remove('no-display');
    }

    hideInstructions() {
        this.#instructions.classList.add("no-display");
    }

    hideOverlay() {
        this.#overlay.classList.add('no-display');
    }

    addSpaceClickedEventListener(handler) {
        this.#board.addEventListener("click", handler);
    }

    addUndoClickedEventListener(handler) {
        this.#undoButton.addEventListener("click", handler);
    }

    addInfoClickedEventListener(handler) {
        this.#infoButton.addEventListener("click", handler);
    }

    addOverlayClickedEventListener(handler) {
        this.#overlay.addEventListener("click", handler);
    }

    addCloseInstructionsButtonClickedEventListener(handler) {
        this.#closeInstructionsButton.addEventListener("click", handler);
    }
}

export default View;