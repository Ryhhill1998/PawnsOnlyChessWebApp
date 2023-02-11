import Controller from "./controller.js";

export default class Controller1P extends Controller {

    constructor(model, view, level) {
        super(model, view, "1P");
        this.level = level;
    }

    moveComputer() {
        if (this.level === "easy") {
            this.moveComputerEasy();
        } else if (this.level === "medium") {
            this.moveComputerMedium();
        } else if (this.level === "hard") {
            this.moveComputerHard();
        }
    }

    moveComputerEasy() {
        if (this.model.gameOver) return;

        const colour = this.model.turn;

        let move = null;

        while (!move) {
            move = this.generateRandomComputerMove(colour);
        }

        const {pieceToMove, startSpace, endSpace} = move;

        this.movePiece(startSpace, endSpace, pieceToMove);

        this.checkGameOver(endSpace);

        // remove all overlays
        this.deselectPiece();

        // show last move in view
        this.view.showLastMove(this.model.lastMove);
    }

    getAllTakeMoves() {
        const takeMoves = [];

        const colour = this.model.turn;

        const pieces = this.view.getPiecesArray(colour);
        let takeMove = null;

        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            const hasMoved = this.view.pieceHasMoved(piece);
            const space = this.view.getSpaceFromPiece(piece);
            const [x, y] = this.view.getCoordinatesFromSpace(space);
            const possibleMoves = this.model.generatePossibleMoves(colour, hasMoved, x, y);
            const filteredMoves = this.filterPossibleMoves(space, possibleMoves);

            for (let j = 0; j < filteredMoves.length; j++) {
                const possibleMove = filteredMoves[j];
                if (possibleMove.type === "take") {
                    takeMove = this.formatMove(piece, space, possibleMove);
                    takeMoves.push(takeMove);
                }
            }
        }

        return takeMoves;
    }

    moveComputerMedium() {
        if (this.model.gameOver) return;

        const takeMoves = this.getAllTakeMoves();

        if (takeMoves.length) {
            this.chooseBestTakeMove(takeMoves);
            const takeMove = takeMoves[0];
            const {pieceToMove, startSpace, endSpace} = takeMove;
            this.movePiece(startSpace, endSpace, pieceToMove);
            this.checkGameOver(endSpace);

            // remove all overlays
            this.deselectPiece();

            // show last move in view
            this.view.showLastMove(this.model.lastMove);

        } else {
            this.moveComputerEasy();
        }
    }

    moveComputerHard() {
        if (this.model.gameOver) return;

        const takeMoves = this.getAllTakeMoves();


    }

    chooseBestTakeMove(takeMoves) {
        let chosenMove;
        let bestScore = -Infinity;

        for (let i = 0; i < takeMoves.length; i++) {
            const move = takeMoves[i];
            console.log(move)
            let moveScore = 10;
            const [x, y] = this.view.getCoordinatesFromSpace(move.endSpace);

            if (this.whiteCanWin(y)) {
                console.log("white can win!");
                chosenMove = move;
                break;
            }

            if (this.whiteCanTakeAfterMove(x, y)) {
                console.log("white can take after move!");
                moveScore -= 5;
            }
        }
    }

    whiteCanWin(y) {
        return y === 1;
    }

    whiteCanTakeAfterMove(x, y) {
        const newY = y + 1;

        const leftTakePosition = this.view.getSpaceFromCoordinates(x - 1, newY);

        let piece = this.view.getPiece(leftTakePosition);
        if (piece && this.view.getPieceColour(piece) === "white") {
            return true;
        }

        const rightTakePosition = this.view.getSpaceFromCoordinates(x + 1, newY);

        piece = this.view.getPiece(rightTakePosition);
        return piece && this.view.getPieceColour(piece) === "white";
    }

    generateRandomComputerMove(colour) {
        const pieceToMove = this.view.getRandomPiece(colour);
        const hasMoved = this.view.pieceHasMoved(pieceToMove);
        const space = this.view.getSpaceFromPiece(pieceToMove);
        const [x, y] = this.view.getCoordinatesFromSpace(space);
        const possibleMoves = this.model.generatePossibleMoves(colour, hasMoved, x, y);
        this.model.possibleMoves = this.filterPossibleMoves(space, possibleMoves);
        const chosenMove = this.model.getComputerMove();

        if (!chosenMove) return null;

        return this.formatMove(pieceToMove, space, chosenMove);
    }

    formatMove(pieceToMove, startSpace, move) {
        const endSpace = this.view.getSpaceFromCoordinates(...move.coordinates);

        return {
            pieceToMove,
            startSpace,
            endSpace
        }
    }

    undoClicked() {
        super.undoClicked();
        super.undoClicked();
    }
}