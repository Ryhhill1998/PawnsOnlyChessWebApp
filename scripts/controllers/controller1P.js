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

    getFirstTakeMove() {
        let takeMove = null;

        const colour = this.model.turn;

        const pieces = this.view.getPiecesArray(colour);

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

        return takeMove;
    }

    moveComputerMedium() {
        if (this.model.gameOver) return;

        this.moveComputerHard();

        const takeMove = this.getFirstTakeMove();

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

        const pieces = this.view.getPiecesArray("black");

        let bestMoveScore = -Infinity;
        let bestMove = null;

        pieces.forEach(piece => {
            const possibleMoves = this.getPossibleMoves(piece);

            possibleMoves.forEach(move => {
                const moveScore = this.evaluateMove(piece, move);

                if (moveScore > bestMoveScore) {
                    bestMoveScore = moveScore;
                    const space = this.view.getSpaceFromPiece(piece);
                    bestMove = this.formatMove(piece, space, move);
                }
            });
        });

        const {pieceToMove, startSpace, endSpace} = bestMove;
        this.movePiece(startSpace, endSpace, pieceToMove);
        this.checkGameOver(endSpace);

        // remove all overlays
        this.deselectPiece();

        // show last move in view
        this.view.showLastMove(this.model.lastMove);
    }

    getPossibleMoves(piece) {
        const colour = this.view.getPieceColour(piece);
        const hasMoved = this.view.pieceHasMoved(piece);
        const space = this.view.getSpaceFromPiece(piece);
        const [x, y] = this.view.getCoordinatesFromSpace(space);
        const possibleMoves = this.model.generatePossibleMoves(colour, hasMoved, x, y);
        return this.filterPossibleMoves(space, possibleMoves);
    }

    evaluateMove(piece, move) {
        if (move.type === "standard") {
            const colour = this.view.getPieceColour(piece);
            return this.evaluateStandardMove(move, colour);
        } else {
            const direction = this.getTakeDirection(move.coordinates[0], piece);
            return this.evaluateTakeMove(move, direction);
        }
    }

    evaluateTakeMove(move, direction) {
        let score = 20;

        const [x, y] = move.coordinates;

        if (this.whiteCanWin(y)) {
            console.log("white can win!");
            return 100;
        }

        if (this.pieceBeCanTakenAfterMove("white", x, y)) {
            console.log("white can take after move!");
            score -= 5;
        }

        if (direction === "left") {
            if (this.pieceIsLeftProtected("black", x, y)) {
                console.log("black is left protected after take!");
                score += 20;
            }
        } else if (this.pieceIsRightProtected("black", x, y)) {
            console.log("black is right protected after take!");
            score += 20;
        }

        return score;
    }

    getTakeDirection(newX, piece) {
        const space = this.view.getSpaceFromPiece(piece);
        const [x] = this.view.getCoordinatesFromSpace(space);
        return x > newX ? "left" : "right";
    }

    evaluateStandardMove(move, colour) {
        console.log(move);
        let score = 5;
        const [x, y] = move.coordinates;

        if (this.pieceBeCanTakenAfterMove("white", x, y)) {
            console.log("piece can be taken after move");
            score -= 10;
        }

        if (this.pieceIsLeftProtected(colour, x, y)) {
            console.log("piece is left protected after move");
            score += 10;
        }

        if (this.pieceIsRightProtected(colour, x, y)) {
            console.log("piece is right protected after move");
            score += 10;
        }

        if (this.moveProtectsPiece(x, y, colour)) {
            console.log("move protects piece");
            score += 5;
        }

        console.log("\n");

        return score;
    }

    moveProtectsPiece(x, y, colour) {
        const lefDiagonal = this.view.getSpaceFromCoordinates(x - 1, y + 1);

        let piece = this.view.getPiece(lefDiagonal);
        if (piece && this.view.getPieceColour(piece) === colour) {
            return true;
        }

        const rightDiagonal = this.view.getSpaceFromCoordinates(x + 1, y + 1);

        piece = this.view.getPiece(rightDiagonal);
        return piece && this.view.getPieceColour(piece) === colour;
    }

    whiteCanWin(y) {
        return y === 1;
    }

    pieceIsLeftProtected(colourMoved, x, y) {
        const leftProtectedPosition = this.view.getSpaceFromCoordinates(x - 1, y - 1);

        const piece = this.view.getPiece(leftProtectedPosition);
        if (piece && this.view.getPieceColour(piece) === colourMoved) {
            return true;
        }
    }

    pieceIsRightProtected(colourMoved, x, y) {
        const rightProtectedPosition = this.view.getSpaceFromCoordinates(x + 1,  y - 1);

        let piece = this.view.getPiece(rightProtectedPosition);
        if (piece && this.view.getPieceColour(piece) === colourMoved) {
            return true;
        }
    }

    pieceBeCanTakenAfterMove(opponentColour, x, y) {
        const newY = y + 1;

        const leftTakePosition = this.view.getSpaceFromCoordinates(x - 1, newY);

        let piece = this.view.getPiece(leftTakePosition);
        if (piece && this.view.getPieceColour(piece) === opponentColour) {
            return true;
        }

        const rightTakePosition = this.view.getSpaceFromCoordinates(x + 1, newY);

        piece = this.view.getPiece(rightTakePosition);
        return piece && this.view.getPieceColour(piece) === opponentColour;
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