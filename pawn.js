class Pawn {

    #colour;
    #imageSrc;
    #xPosition;
    #yPosition;
    #directionMultiplier;
    #hasMoved;

    constructor(colour, xPosition, yPosition, directionMultiplier) {
        this.#colour = colour;
        this.initialiseImageSrc();
        this.#xPosition = xPosition;
        this.#yPosition = yPosition;
        this.#directionMultiplier = directionMultiplier;
        this.#hasMoved = false;
    }

    initialiseImageSrc() {
        if (this.#colour === "white") {
            this.#imageSrc = "pieces/white/pawn.svg";
        } else if (this.#colour === "black") {
            this.#imageSrc = "pieces/black/pawn.svg";
        }
    }

    get colour() {
        return this.#colour;
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

        if (board.spaceIsFree(this.#xPosition, this.#yPosition + this.#directionMultiplier)) {
            coordinates[0] = this.#xPosition;
            coordinates[1] = this.#yPosition + this.#directionMultiplier;
            possibleMoves.push(coordinates);

            coordinates = [];

            if (!this.#hasMoved
                && board.spaceIsFree(this.#xPosition, this.#yPosition + (2 * this.#directionMultiplier))) {
                coordinates[0] = this.#xPosition;
                coordinates[1] = this.#yPosition + (2 * this.#directionMultiplier);
                possibleMoves.push(coordinates);
            }
        }

        coordinates = [];

        // right take
        let x = this.#xPosition - this.#directionMultiplier;
        let y = this.#yPosition + this.#directionMultiplier;

        if (this.#takeIsPossible(board, x, y)) {
            coordinates[0] = x;
            coordinates[1] = y;
            possibleMoves.add(coordinates);
        }

        // left take
        x = this.#xPosition + this.#directionMultiplier;
        y = y = this.#yPosition + this.#directionMultiplier;

        coordinates = [];

        if (this.#takeIsPossible(board, x, y)) {
            coordinates[0] = x;
            coordinates[1] = y;
            possibleMoves.add(coordinates);
        }

        return possibleMoves;
    }

    #takeIsPossible(board, x, y) {
        let isPossible = false;

        const pawnAtPosition = board.getPawnAtPosition(x, y);

        if (pawnAtPosition != null && !pawnAtPosition.colour === this.#colour) {
            isPossible = true;
        }

        return isPossible;
    }
}