class Pawn {

    #colour;
    #symbol;
    #xPosition;
    #yPosition;
    #directionMultiplier;
    #hasMoved;

    constructor(colour, symbol, xPosition, yPosition, directionMultiplier) {
        this.#colour = colour;
        this.#symbol = symbol;
        this.#xPosition = xPosition;
        this.#yPosition = yPosition;
        this.#directionMultiplier = directionMultiplier;
        this.#hasMoved = false;
    }

    get colour() {
        return this.#colour;
    }

    get symbol() {
        return this.#symbol;
    }

    get xPosition() {
        return this.#xPosition;
    }

    get yPosition() {
        return this.#yPosition;
    }

    move(board, x, y) {
        const possibleMoves = this.#getPossibleMoves(board);
    }

    #getPossibleMoves(board) {
        const possibleMoves = [];

        let coordinates = [];

        return possibleMoves;
    }
}