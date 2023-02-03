class Model {

    #turn;
    #gameOver;
    #piecesTaken = {
        white: 0,
        black: 0
    }

    constructor() {
    }

    // moveIsValid(x, y) {
    //     let isValid = false;
    //
    //     for (let i = 0; i < this.#possibleMoves.length; i++) {
    //         const [xCoordinate, yCoordinate] = this.#possibleMoves[i].coordinates;
    //
    //         if (xCoordinate === x && yCoordinate === y) {
    //             isValid = true;
    //             break;
    //         }
    //     }
    //
    //     return isValid;
    // }

    getWhitePiecesTaken() {
        return this.#piecesTaken.white;
    }

    getBlackPiecesTaken() {
        return this.#piecesTaken.black;
    }

    incrementWhitePiecesTaken() {
        this.#piecesTaken.white++;
    }

    incrementBlackPiecesTaken() {
        this.#piecesTaken.black++;
    }

    getPossibleMoves(colour, hasMoved, x, y) {
        const movement = colour === "white" ? -1 : 1;
        const possibleMoves = [];

        this.#addMove(possibleMoves, x, y + movement, "standard");

        if (!hasMoved) {
            this.#addMove(possibleMoves, x, y + 2 * movement, "standard");
        }

        this.#addRightTakeMoves(possibleMoves, colour, movement, x, y);
        this.#addLeftTakeMoves(possibleMoves, colour, movement, x, y);

        return possibleMoves;
    }

    #addRightTakeMoves(possibleMoves, colour, movement, x, y) {
        if (this.pieceIsAtRightBoundary(colour, x)) return;

        this.#addTakeMoves(possibleMoves, "right", movement, x, y);
    }

    #addLeftTakeMoves(possibleMoves, colour, movement, x, y) {
        if (this.pieceIsAtLeftBoundary(colour, x)) return;

        this.#addTakeMoves(possibleMoves, "left", movement, x, y);
    }

    #addTakeMoves(possibleMoves, takeDirection, movement, x, y) {
        const newX = takeDirection === "right" ? x - movement : x + movement;
        const newY = y + movement;

        this.#addMove(possibleMoves, newX, newY, "take");
    }

    #addMove(possibleMoves, x, y, type) {
        const move = {
            coordinates: [x, y],
            type
        };

        possibleMoves.push(move);
    }

    pieceIsAtRightBoundary(colour, x) {
        return colour === "white" && x === 7 || colour === "black" && x === 0;
    }

    pieceIsAtLeftBoundary(colour, x) {
        return colour === "white" && x === 0 || colour === "black" && x === 7;
    }

    get turn() {
        return this.#turn;
    }

    changeTurn() {
        this.#turn = this.#turn === "white" ? "black" : "white";
    }
}

export default Model;