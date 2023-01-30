const BOARD_SIZE = 8;

class Board {

    #gameBoard;

    constructor() {
        this.#initialiseGameBoard();
    }

    #initialiseGameBoard() {
        this.#gameBoard = [];

        for (let i = 0; i < BOARD_SIZE; i++) {
            const row = [];

            for (let j = 0; j < BOARD_SIZE; j++) {
                row.push(null);
            }

            this.#gameBoard.push(row);
        }
    }

    addPawn(pawnToAdd) {
        let pieceAdded = false;

        const x = pawnToAdd.xPosition;
        const y = pawnToAdd.yPosition;

        if (this.spaceIsFree(x, y)) {
            this.#gameBoard[y][x] = pawnToAdd;
            pieceAdded = true;
        }

        return pieceAdded;
    }

    spaceIsFree(x, y) {
        return this.#gameBoard[y][x] === null;
    }

    getPawnAtPosition(x, y) {
        return this.#gameBoard[y][x];
    }

    movePawn(x, y, newX, newY) {
        const pawn = this.getPawnAtPosition(x, y);
        this.#gameBoard[y][x] = null;
        this.#gameBoard[newY][newX] = pawn;
    }
}