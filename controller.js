import Model from "./model";
import View from "./view";

class Controller {

    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    #addMove(possibleMoves, x, y, type) {
        const move = {
            coordinates: [x, y],
            type
        };

        possibleMoves.push(move);
    }

    getPossibleMoves(colour, hasMoved, x, y) {
        const movement = colour === "white" ? -1 : 1;
        const possibleMoves = [];

        if (spaceIsFree(x, y + movement)) {
            this.#addMove(possibleMoves, x, y + movement, "standard");

            if (!hasMoved && spaceIsFree(x, y + 2 * movement)) {
                this.#addMove(possibleMoves, x, y + 2 * movement, "standard");
            }
        }

        addRightTakeMoves(possibleMoves, colour, movement, x, y);
        addLeftTakeMoves(possibleMoves, colour, movement, x, y);

        return possibleMoves;
    }

    addRightTakeMoves(possibleMoves, colour, movement, x, y) {
        if (colour === "white" && x === 7 || colour === "black" && x === 0) return;

        addTakeMoves(possibleMoves, "right", colour, movement, x, y);
    }

    addLeftTakeMoves(possibleMoves, colour, movement, x, y) {
        if (colour === "white" && x === 0 || colour === "black" && x === 7) return;

        addTakeMoves(possibleMoves, "left", colour, movement, x, y);
    }

    addTakeMoves(possibleMoves, takeDirection, colour, movement, x, y) {
        const colourToTake = colour === "white" ? "black" : "white";

        const newX = takeDirection === "right" ? x - movement : x + movement;
        const newY = y + movement;

        if (takeIsPossible(colourToTake, newX, newY)) {
            updatePossibleMoves(possibleMoves, newX, newY, "take");
        }
    }

    takeIsPossible(colourToTake, x, y) {
        let isPossible = false;

        const row = document.getElementById("row-" + y);
        const space = row.querySelector(".space-" + x);
        const pieceImage = getImage(space);

        if (pieceImage) {
            isPossible = getPieceColour(pieceImage) === colourToTake;
        }

        return isPossible;
    }

    movePiece(previousSpace, newSpace, piece) {
        // check if space contains image (take move)
        const newSpaceImage = newSpace.querySelector("img");
        let moveIsTake, isFirstMove = false;

        // check if move is a take move
        if (newSpaceImage) {
            // set last move as a take move
            moveIsTake = true;

            // piece is taken so remove taken piece from new square
            newSpace.removeChild(newSpaceImage);

            if (turn === "white") {
                const piecesTakenElement = whitePlayerInfo.querySelector(".pieces-taken .pieces");
                piecesTaken.white++;

                if (piecesTaken.white <= maxPiecesTaken) {
                    piecesTakenElement.appendChild(newSpaceImage);
                } else {
                    const additionalPieces = piecesTaken.white - maxPiecesTaken;
                    const additionalPiecesElement = whitePlayerInfo.querySelector(".additional-pieces");
                    additionalPiecesElement.innerHTML = "+" + additionalPieces;
                }
            } else {
                const piecesTakenElement = blackPlayerInfo.querySelector(".pieces-taken .pieces");
                piecesTaken.black++;

                if (piecesTaken.black <= maxPiecesTaken) {
                    piecesTakenElement.appendChild(newSpaceImage);
                } else {
                    const additionalPieces = piecesTaken.black - maxPiecesTaken;
                    const additionalPiecesElement = blackPlayerInfo.querySelector(".additional-pieces");
                    additionalPiecesElement.innerHTML = "+" + additionalPieces;
                }
            }
        }

        // remove image element from space piece is being moved from
        previousSpace.removeChild(piece);
        newSpace.appendChild(piece);

        if (!pieceHasMoved(piece)) {
            // change image src to a moved piece if first move
            const pieceImageSrc = piece.getAttribute("src").split(".")[0] + "-moved.svg";
            piece.setAttribute("src", pieceImageSrc);
            isFirstMove = true;
        }

        hidePreviousMove();

        secondLastMove.startSpace = lastMove.startSpace;
        secondLastMove.endSpace = lastMove.endSpace;

        lastMove.startSpace = previousSpace;
        lastMove.endSpace = newSpace;
        lastMove.firstMove = isFirstMove;
        lastMove.take = moveIsTake;

        showPreviousMove();

        undoJustUsed = false;
    }

    changeActivePlayer(previous, current) {
        this.view.hideActivePlayer(previous);
        this.view.displayActivePlayer(current);
    }

    changeTurn() {
        const previousTurn = turn;
        turn = turn === "white" ? "black" : "white";
        this.changeActivePlayer(previousTurn, turn);
    }

    checkGameOver(moveSpace, pieceMoved) {
        const colour = this.view.getPieceColour(pieceMoved);

        // get y value for piece that just moved
        const y = Number.parseInt(moveSpace.closest(".row").id.at(-1));

        // check if colour that just moved has won
        if (colour === "white") {
            gameOver = whiteHasWon(y);
        } else {
            gameOver = blackHasWon(y);
        }

        if (!gameOver) {
            changeTurn();
        }
    }

    whiteHasWon(y) {
        const hasWon = y === 0;

        if (hasWon) {
            this.view.displayWinner("white");
        }

        return hasWon;
    }

    blackHasWon(y) {
        const hasWon = y === 7;

        if (hasWon) {
            this.view.displayWinner("black");
        }

        return hasWon;
    }
}

const app = new Controller(new Model(), new View());