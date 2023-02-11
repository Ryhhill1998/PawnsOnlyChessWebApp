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

        const board = this.getArrayRepresentationOfBoard();

        const blackPieces = this.getPiecesFromBoardArray("black", board);

        let bestMoveValue = -Infinity;
        let bestMove;

        blackPieces.forEach(piece => {
            const {colour, hasMoved, x, y} = piece;
            let possibleMoves = this.model.generatePossibleMoves(colour, hasMoved, x, y);
            possibleMoves = this.filterMoves(possibleMoves, board, colour);

            possibleMoves.forEach(move => {
                const moveMade = {x, y, firstMove: !hasMoved};

                this.makeMove(piece, move, board);
                const moveValue = this.minimax(board, colour, false, 0, -Infinity, Infinity);

                this.movePieceBack(piece, moveMade, board);

                if (moveValue > bestMoveValue) {
                    bestMoveValue = moveValue;
                    bestMove = move;
                }
            });
        });

        console.log(bestMove, bestMoveValue)
    }

    minimax(board, colour, maximising, movesMade, alpha, beta) {
        if (movesMade === 7 || this.gameIsWon(board, colour)) {
            return this.evaluateBoard(board, maximising);
        }

        const pieces = this.getPiecesFromBoardArray(colour, board);

        if (maximising) {
            let maxEval = -Infinity;

            for (let i = 0; i < pieces.length; i++) {
                const piece = pieces[i];
                const {colour, hasMoved, x, y} = piece;
                let possibleMoves = this.model.generatePossibleMoves(colour, hasMoved, x, y);
                possibleMoves = this.filterMoves(possibleMoves, board, colour);

                for (let j = 0; j < possibleMoves.length; j++) {
                    const move = possibleMoves[j];
                    const moveMade = {x, y, firstMove: !hasMoved};

                    this.makeMove(piece, move, board);
                    const newColour = colour === "white" ? "black" : "white";
                    const moveValue = this.minimax(board, newColour, !maximising, movesMade + 1, alpha, beta);

                    this.movePieceBack(piece, moveMade, board);

                    maxEval = Math.max(maxEval, moveValue);
                    alpha = Math.max(alpha, moveValue);

                    if (beta <= alpha) {
                        return maxEval;
                    }
                }
            }

            return maxEval;
        } else {
            let minEval = Infinity;

            for (let i = 0; i < pieces.length; i++) {
                const piece = pieces[i];
                const {colour, hasMoved, x, y} = piece;
                let possibleMoves = this.model.generatePossibleMoves(colour, hasMoved, x, y);
                possibleMoves = this.filterMoves(possibleMoves, board, colour);

                for (let j = 0; j < possibleMoves.length; j++) {
                    const move = possibleMoves[j];
                    const moveMade = {x, y, firstMove: !hasMoved};

                    this.makeMove(piece, move, board);
                    const newColour = colour === "white" ? "black" : "white";
                    const moveValue = this.minimax(board, newColour, !maximising, movesMade + 1, alpha, beta);

                    this.movePieceBack(piece, moveMade, board);

                    minEval = Math.min(minEval, moveValue);
                    beta = Math.min(beta, moveValue);

                    if (beta <= alpha) {
                        return minEval;
                    }
                }
            }

            return minEval;
        }
    }

    gameIsWon(board, colour) {
        const row = colour === "white" ? 0 : 7;

        for (let i = 0; i < 8; i++) {
            const position = board[row][i];
            if (position === " ") continue;
            if (position.colour === colour) return true;
        }

        return false;
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

    makeMove(pieceBeingMoved, move, board) {
        const {x, y} = pieceBeingMoved;
        const [newX, newY] = move.coordinates;
        board[newY][newX] = pieceBeingMoved;
        board[y][x] = " ";
        pieceBeingMoved.x = newX;
        pieceBeingMoved.y = newY;
        pieceBeingMoved.hasMoved = true;
    }

    movePieceBack(pieceBeingMoved, previousMove, board) {
        const {x, y} = pieceBeingMoved;
        board[y][x] = " ";

        const [previousX, previousY] = [previousMove.x, previousMove.y];

        board[previousY][previousX] = pieceBeingMoved;
        pieceBeingMoved.x = previousX;
        pieceBeingMoved.y = previousY;

        pieceBeingMoved.hasMoved = !previousMove.firstMove;
    }

    evaluateBoard(board, maximising) {
        const blackPieces = this.getPiecesFromBoardArray("black", board);
        const whitePieces = this.getPiecesFromBoardArray("white", board);
        const multiplier = maximising ? 1 : -1;

        const blackValue = this.evaluatePositions(blackPieces, "black");
        const whiteValue = this.evaluatePositions(whitePieces, "white");

        return multiplier * (blackValue - whiteValue);
    }

    evaluatePositions(pieces, colour) {
        const adjustmentNeeded = colour === "white";

        return pieces.reduce((acc, piece) => {
            let {x} = piece;

            if (adjustmentNeeded) {
                x = 7 - x;
            }

            return acc + x;
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