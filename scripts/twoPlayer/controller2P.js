import Model from "../model.js";
import View from "../views/view.js";

class Controller2P {

    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.init();
    }

    deselectPiece() {
        this.view.removeSelectedOverlay(this.model.spaceSelected);
        this.view.hidePossibleMoves(this.model.possibleMoves);
        this.model.spaceSelected = null;
    }

    selectPiece(space, piece) {
        const pieceColour = this.view.getPieceColour(piece);

        if (this.model.turn !== pieceColour) return;

        this.deselectPiece();

        this.model.spaceSelected = space;

        // set possible moves
        const pieceHasMoved = this.view.pieceHasMoved(piece);
        const coordinates = this.view.getCoordinatesFromSpace(space);

        const possibleMoves = this.model.generatePossibleMoves(pieceColour, pieceHasMoved, ...coordinates);
        this.model.possibleMoves = this.filterPossibleMoves(space, possibleMoves);

        // show piece selected in view
        this.view.addPieceSelectedOverlay(space);

        // show possible moves in view
        this.view.showPossibleMoves(this.model.possibleMoves);
    }



    filterPossibleMoves(space, possibleMoves) {
        const piece = this.view.getPiece(space);

        if (!piece) return;

        const colour = this.view.getPieceColour(piece);

        return possibleMoves
            .filter(move => {
                if (move.type === "standard") {
                    return this.view.spaceIsFree(...move.coordinates);
                } else {
                    const colourToTake = colour === "white" ? "black" : "white";
                    return this.takeIsPossible(colourToTake, ...move.coordinates);
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

    updatePiecesTakenMove(pieceTaken) {
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

    updatePiecesTakenUndo(space) {
        const turn = this.model.turn;
        let additionalPieces;

        if (turn === "white") {
            this.model.decrementWhitePiecesTaken();
            additionalPieces = this.model.getWhitePiecesTaken() - 4;
        } else {
            this.model.decrementBlackPiecesTaken();
            additionalPieces = this.model.getBlackPiecesTaken() - 4;
        }

        this.view.replacePieceTaken(turn, additionalPieces, space);
    }

    movePiece(previousSpace, newSpace, pieceBeingMoved) {
        const moveIsTake = this.view.getPiece(newSpace) !== null;

        // check if move is a take move
        if (moveIsTake) {

            // piece is taken so remove taken piece from new square
            const pieceTaken = this.view.getPiece(newSpace);
            newSpace.removeChild(pieceTaken);

            this.updatePiecesTakenMove(pieceTaken);
        }

        // remove image element from space piece is being moved from
        const isFirstMove = !this.view.pieceHasMoved(pieceBeingMoved);
        this.view.movePiece(pieceBeingMoved, previousSpace, newSpace);

        this.model.updateLastMove(previousSpace, newSpace, isFirstMove, moveIsTake);

        // show last move in view
        this.view.showPreviousMove(this.model.lastMove);

        // hide second last move in view
        this.view.hidePreviousMove(this.model.secondLastMove);
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

    checkGameOver(moveSpace) {
        const turn = this.model.turn;

        // get y value for piece that just moved
        const y = this.view.getCoordinatesFromSpace(moveSpace)[1];

        // check if colour that just moved has won
        const gameOver = turn === "white" ? this.model.whiteHasWon(y) : this.model.blackHasWon(y)

        if (gameOver) {
            this.view.displayWinner(turn);
        } else {
            this.changeTurn();
        }
    }

    spaceClicked({target}) {
        if (this.model.gameOver) return;

        const space = this.view.getSpaceClicked(target);
        const piece = this.view.getPiece(space);

        const spaceSelected = this.model.spaceSelected;
        const pieceSelected = this.view.getPiece(spaceSelected);

        if ((!piece || this.view.getPieceColour(pieceSelected) !== this.view.getPieceColour(piece))
            && pieceSelected) {
            // check if move is valid
            const [x, y] = this.view.getCoordinatesFromSpace(space);
            if (!this.model.moveIsValid(x, y)) return;

            this.movePiece(spaceSelected, space, pieceSelected);

            // check if game is over
            this.checkGameOver(space, pieceSelected);

            this.deselectPiece();

        } else if (space === spaceSelected) {
            this.deselectPiece();
        } else {
            this.selectPiece(space, piece);
        }
    }

    undoClicked() {
        if (this.model.undoJustUsed || this.model.gameOver || !this.model.lastMove.startSpace) return;

        const {startSpace, endSpace, firstMove, take} = this.model.lastMove;
        const lastPieceMoved = this.view.getPiece(endSpace);

        // move piece in view from end space to start space
        this.view.movePiece(lastPieceMoved, endSpace, startSpace);

        // deselect the current last move in view
        this.view.hidePreviousMove(this.model.lastMove);

        // if move was first move, revert image src in view
        if (firstMove) {
            this.view.undoFirstMove(lastPieceMoved);
        }

        // undo last move in model
        this.model.undoLastMove();

        // select the new last move in view
        this.view.showPreviousMove(this.model.lastMove);

        // if move was take, remove piece taken and add to board at end space
        if (take) {
            this.updatePiecesTakenUndo(endSpace);
        }

        // deselect current piece
        this.deselectPiece();
    }

    infoClicked() {
        this.view.showInstructions();
        this.view.showOverlay();
    }

    #hideInstructionsAndOverlay() {
        this.view.hideInstructions();
        this.view.hideOverlay();
    }

    overlayClicked() {
        this.#hideInstructionsAndOverlay();
    }

    closeInstructionsButtonClicked() {
        this.#hideInstructionsAndOverlay();
    }

    init() {
        this.view.addSpaceClickedEventListener(this.spaceClicked.bind(this));
        this.view.addUndoClickedEventListener(this.undoClicked.bind(this));
        this.view.addInfoClickedEventListener(this.infoClicked.bind(this));
        this.view.addOverlayClickedEventListener(this.overlayClicked.bind(this));
        this.view.addCloseInstructionsButtonClickedEventListener(this.closeInstructionsButtonClicked.bind(this));
    }
}

const app = new Controller2P(new Model(), new View());