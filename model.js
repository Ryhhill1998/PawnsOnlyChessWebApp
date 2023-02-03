class Model {

    #spaceSelected;
    #possibleMoves = [];
    #turn;
    #gameOver;
    #piecesTaken = {
        white: 0,
        black: 0
    }

    #lastMove = {
        startSpace: null,
        endSpace: null,
        firstMove: false,
        take: false
    };

    #secondLastMove = {
        startSpace: null,
        endSpace: null
    };

    constructor() {
    }

    get lastMove() {
        return this.#lastMove;
    }

    get secondLastMove() {
        return this.#secondLastMove;
    }

    set spaceSelected(space) {
        this.#spaceSelected = space;
    }

    get spaceSelected() {
        return this.#spaceSelected;
    }

    updateLastMove(startSpace, endSpace, firstMove, take) {
        this.#secondLastMove.startSpace = lastMove.startSpace;
        this.#secondLastMove.endSpace = lastMove.endSpace;

        this.#lastMove.startSpace = startSpace;
        this.#lastMove.endSpace = endSpace;
        this.#lastMove.firstMove = firstMove;
        this.#lastMove.take = take;
    }

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

    generatePossibleMoves(colour, hasMoved, x, y) {
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

    set possibleMoves(possibleMoves) {
        this.#possibleMoves = possibleMoves;
    }

    get possibleMoves() {
        return this.#possibleMoves;
    }

    moveIsValid(x, y) {

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

    whiteHasWon(y) {
        const hasWon = y === 0;

        if (hasWon) {
            this.#gameOver = true;
        }

        return hasWon;
    }

    blackHasWon(y) {
        const hasWon = y === 7;

        if (hasWon) {
            this.#gameOver = true;
        }

        return hasWon;
    }

    get gameIsOver() {
        return this.#gameOver;
    }
}

export default Model;