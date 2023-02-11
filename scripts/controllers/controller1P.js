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
        }
    }

    moveComputerEasy() {
        if (this.model.gameOver) return;

        this.moveComputerHard()

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

        const boardArray = this.getArrayRepresentationOfBoard();

        const blackPieces = this.getPiecesFromBoardArray("black", boardArray);

        blackPieces.forEach(piece => {
            const {colour, hasMoved, x, y} = piece;
            let possibleMoves = this.model.generatePossibleMoves(colour, hasMoved, x, y);
            possibleMoves = this.filterMoves(possibleMoves, boardArray, colour);

            possibleMoves.forEach(move => this.minimax(piece, move, boardArray));
        });
    }

    filterMoves(moves, board, colour) {
        let standardMovesAvailable = true;

        return moves.filter(move => {
            const {coordinates, type} = move;
            const [x, y] = coordinates;

            const positionIsFree = this.positionIsFree(board, x, y);

            if (type === "standard") {
                if (!positionIsFree) {
                    standardMovesAvailable = false;
                }

                return standardMovesAvailable && positionIsFree;
            } else {
                return !positionIsFree && this.pieceCanTake(board, colour, x, y);
            }
        });
    }

    positionIsFree(boardArray, x, y) {
        return boardArray[y][x] === " ";
    }

    pieceCanTake(board, colour, x, y) {
        const colourToTake = colour === "white" ? "black" : "white";
        const position = board[y][x];
        return position.colour === colourToTake;
    }

    getPiecesFromBoardArray(colour, boardArray) {
        const piecesArray = [];

        boardArray.forEach(row => {
            row.forEach(position => {
                if (position?.colour === colour) {
                    piecesArray.push(position);
                }
            });
        });

        return piecesArray;
    }

    stringifyBoardArray(boardArray) {
        let output = "";

        for (let i = 0; i < 8; i++) {
            output += "_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _\n\n"
            output += "| ";
            for (let j = 0; j < 8; j++) {
                const position = boardArray[i][j];

                if (position === " ") {
                    output += position;
                } else {
                    output += position.symbol;
                }

                output += " | ";
            }

            output += "\n";

            if (i === 7) {
                output += "_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _"
            }
        }

        return output;
    }

    createPieceObjectFromPiece(piece) {
        const colour = this.view.getPieceColour(piece);
        const hasMoved = this.view.pieceHasMoved(piece);
        const symbol = colour === "white" ? "W" : "B";
        const space = this.view.getSpaceFromPiece(piece);
        const [x, y] = this.view.getCoordinatesFromSpace(space);

        return {colour, hasMoved, symbol, x, y};
    }

    getArrayRepresentationOfBoard() {
        const boardArray = [];

        for (let i = 0; i < 8; i++) {
            const row = [];

            for (let j = 0; j < 8; j++) {
                const space = this.view.getSpaceFromCoordinates(j, i);
                const piece = this.view.getPiece(space);

                if (piece) {
                    row.push(this.createPieceObjectFromPiece(piece));
                } else {
                    row.push(" ");
                }
            }

            boardArray.push(row);
        }

        return boardArray;
    }

    deepCopyBoardArray(boardArray) {
        const boardArrayCopy = [];

        for (let i = 0; i < 8; i++) {
            const row = [];

            for (let j = 0; j < 8; j++) {
                const position = boardArray[i][j];

                if (position === " ") {
                    row.push(position);
                } else {
                    row.push({...position});
                }
            }

            boardArrayCopy.push(row);
        }

        return boardArrayCopy;
    }

    minimax(pieceBeingMoved, move, board) {
        const boardCopy = this.deepCopyBoardArray(board);
        const {x, y} = pieceBeingMoved;
        const [newX, newY] = move.coordinates;
        this.makeMove(pieceBeingMoved, x, y, newX, newY, boardCopy);
        console.log(this.stringifyBoardArray(board));
    }

    makeMove(pieceBeingMoved, x, y, newX, newY, board) {
        board[newY][newX] = pieceBeingMoved;
        board[y][x] = " ";
    }

    evaluatePositions(pieces) {
        return pieces.reduce((total, piece) => {
            return total + 1;
        }, 0);
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