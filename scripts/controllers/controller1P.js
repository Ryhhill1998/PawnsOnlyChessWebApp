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

    moveComputerMedium() {
        if (this.model.gameOver) return;

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
                    break;
                }
            }
        }

        if (takeMove) {
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

        console.log(null);
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