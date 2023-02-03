import Model from "./model";
import View from "./view";

class Controller {

    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    filterPossibleMoves(space, possibleMoves) {
        const piece = this.view.getPiece(space);

        if (!piece) return;

        const colour = this.view.getPieceColour(piece);

        return possibleMoves
            .filter(move => {
                const [type, coordinates] = move;
                if (type === "standard") {
                    return this.view.spaceIsFree(...coordinates);
                } else {
                    const colourToTake = colour === "white" ? "black" : "white";
                    return this.takeIsPossible(colourToTake, ...coordinates);
                }
            });
    }

    takeIsPossible(colourToTake, x, y) {
        let isPossible = false;

        const space = this.view.getSpaceFromCoordinates(x, y);
        const pieceImage = this.view.getPiece(space);

        if (pieceImage) {
            isPossible = this.view.getPieceColour(pieceImage) === colourToTake;
        }

        return isPossible;
    }

    movePiece(previousSpace, newSpace, move, piece) {
        // check if move is a take move
        if (move.type === "take") {

            // piece is taken so remove taken piece from new square
            const pieceTaken = this.view.getPiece(newSpace);
            newSpace.removeChild(pieceTaken);

            if (this.model.turn === "white") {
                this.model.incrementWhitePiecesTaken();
                const additionalPieces = this.model.getWhitePiecesTaken() - 4;

                if (additionalPieces <= 0) {
                    // use view to add piece taken to white pieces taken section
                } else {
                    // use view to update the additional pieces number for white
                }
            } else {
                this.model.incrementBlackPiecesTaken();
                const additionalPieces = this.model.getBlackPiecesTaken() - 4;

                if (additionalPieces <= 0) {
                    // use view to add piece taken to black pieces taken section
                } else {
                    // use view to update the additional pieces number for black
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
        const previousTurn = this.model.turn;
        this.model.changeTurn();
        this.changeActivePlayer(previousTurn, this.model.turn);
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