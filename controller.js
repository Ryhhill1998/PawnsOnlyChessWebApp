import Model from "./model";
import View from "./view";

class Controller {

    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    deSelectPiece() {
        const pieceColour = this.view.getPieceColour(piece);

        if (this.model.turn !== pieceColour) return;

        // this.deselectPiece();

        this.model.spaceSelected = space;

        // set possible moves
        const pieceHasMoved = this.view.pieceHasMoved(piece);
        const coordinates = this.view.getCoordinatesFromSpace(piece);

        const possibleMoves = this.model.generatePossibleMoves(pieceColour, pieceHasMoved, ...coordinates);
        this.model.possibleMoves = this.filterPossibleMoves(spaceSelected, possibleMoves);

        // show piece selected in view
        this.view.addPieceSelectedOverlay(spaceSelected);

        // show possible moves in view
        this.view.showPossibleMoves(pieceSelected);
    }

    selectPiece(space, piece) {
        const pieceColour = this.view.getPieceColour(piece);

        if (this.model.turn !== pieceColour) return;

        // this.deselectPiece();

        this.model.spaceSelected = space;

        // set possible moves
        const pieceHasMoved = this.view.pieceHasMoved(piece);
        const coordinates = this.view.getCoordinatesFromSpace(piece);

        const possibleMoves = this.model.generatePossibleMoves(pieceColour, pieceHasMoved, ...coordinates);
        this.model.possibleMoves = this.filterPossibleMoves(spaceSelected, possibleMoves);

        // show piece selected in view
        this.view.addPieceSelectedOverlay(spaceSelected);

        // show possible moves in view
        this.view.showPossibleMoves(pieceSelected);
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

    updatePiecesTaken(pieceTaken) {
        const turn = this.model.turn;
        let additionalPieces;

        if (turn === "white") {
            this.model.incrementWhitePiecesTaken();
            additionalPieces = this.model.getWhitePiecesTaken() - 4;
        } else {
            this.model.incrementBlackPiecesTaken();
            additionalPieces = this.model.getBlackPiecesTaken() - 4;
        }

        this.view.addPieceTaken(turn, pieceTaken, additionalPieces);
    }

    movePiece(previousSpace, newSpace, move, pieceBeingMoved) {
        const moveIsTake = move.type === "take";

        // check if move is a take move
        if (moveIsTake) {

            // piece is taken so remove taken piece from new square
            const pieceTaken = this.view.getPiece(newSpace);
            newSpace.removeChild(pieceTaken);

            this.updatePiecesTaken(pieceTaken);
        }

        // remove image element from space piece is being moved from
        const isFirstMove = !this.view.pieceHasMoved(pieceBeingMoved);
        this.view.movePiece(pieceBeingMoved, previousSpace, newSpace);

        this.model.updateLastMove(previousSpace, newSpace, isFirstMove, moveIsTake);

        // show last move in view
        this.view.showPreviousMove(this.model.lastMove);

        // hide second last move in view
        this.view.hidePreviousMove(this.model.secondLastMove);

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
        const turn = this.model.turn;

        // get y value for piece that just moved
        const y = Number.parseInt(moveSpace.closest(".row").id.at(-1));

        // check if colour that just moved has won
        const gameOver = turn === "white" ? this.model.whiteHasWon(y) : this.model.blackHasWon(y)

        if (gameOver) {
            this.view.displayWinner(turn);
        } else {
            changeTurn();
        }
    }

    spaceClicked({target}) {
        if (this.model.gameIsOver) return;

        const space = this.view.getSpaceClicked(target);
        const piece = this.view.getPiece(space);

        const spaceSelected = this.model.spaceSelected;
        const pieceSelected = this.view.getPiece(spaceSelected);

        if ((!piece || this.view.getPieceColour(pieceSelected) !== this.view.getPieceColour(piece)) && pieceSelected) {

            // check if move is valid
            if (!this.model.moveIsValid(spaceSelected, space)) return;

            movePiece(spaceSelected, space, pieceSelected);

            // check if game is over
            checkGameOver(space, pieceSelected);

            deselectPiece();

        } else if (space === spaceSelected) {
            deselectPiece();
        } else {
            selectPiece(space, piece);
        }
    }
}

const app = new Controller(new Model(), new View());