export default class Controller {

    constructor(model, view, type) {
        this.model = model;
        this.view = view;
        this.type = type;
        this.init();
    }

    deselectPiece() {
        this.view.removeAllOverlays();
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

        // show selected piece in view
        this.view.addPieceSelectedOverlay(space);

        // show possible moves in view
        this.view.showPossibleMoves(this.model.possibleMoves);
    }

    filterPossibleMoves(space, possibleMoves) {
        const piece = this.view.getPiece(space);

        if (!piece) return;

        const colour = this.view.getPieceColour(piece);
        let standardMovesAvailable = true;

        return possibleMoves
            .filter(move => {
                if (move.type === "standard") {
                    if (!this.view.spaceIsFree(...move.coordinates)) {
                        standardMovesAvailable = false;
                    }

                    return standardMovesAvailable && this.view.spaceIsFree(...move.coordinates);
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
            additionalPieces = this.model.getWhitePiecesTaken() - 4;
        } else {
            additionalPieces = this.model.getBlackPiecesTaken() - 4;
        }

        this.view.addPieceTaken(turn, pieceTaken, additionalPieces);
    }

    updatePiecesTakenUndo(pieceTaken, spaceTakenFrom) {
        const colour = this.view.getPieceColour(pieceTaken);
        let additionalPieces;

        if (colour === "white") {
            additionalPieces = this.model.getBlackPiecesTaken() - 4;
        } else {
            additionalPieces = this.model.getWhitePiecesTaken() - 4;
        }

        this.view.replacePieceTaken(pieceTaken, spaceTakenFrom, additionalPieces);
    }

    movePiece(previousSpace, newSpace, pieceBeingMoved, type = "move") {
        const moveIsTake = this.view.getPiece(newSpace) !== null;
        const isFirstMove = !this.view.pieceHasMoved(pieceBeingMoved);

        // check if move is a take move
        if (moveIsTake) {
            // piece is taken so remove taken piece from new square
            const pieceTaken = this.view.getPiece(newSpace);
            newSpace.removeChild(pieceTaken);

            // add take move in model
            this.model.addMove(pieceBeingMoved, previousSpace, newSpace, isFirstMove, pieceTaken);

            // update pieces taken display in player info
            this.updatePiecesTakenMove(pieceTaken);
        } else if (type === "move") {
            // add standard move in model
            this.model.addMove(pieceBeingMoved, previousSpace, newSpace, isFirstMove, null);
        }

        // remove image element from space piece is being moved from
        this.view.movePiece(pieceBeingMoved, previousSpace, newSpace);
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
        const gameOver = turn === "white" ? this.model.whiteHasWon(y) : this.model.blackHasWon(y);

        if (gameOver) {
            this.view.displayWinner(turn);
        } else {
            if (!this.moveIsPossible()) {
                this.model.gameOver = true;
                console.log("STALEMATE!");
            }
        }

        this.changeTurn();
    }

    moveIsPossible() {
        let movePossible = false;
        const piecesArray = this.view.getPiecesArray(this.model.turn);

        for (let i = 0; i < piecesArray.length; i++) {
            const piece = piecesArray[i];
            const space = this.view.getSpaceFromPiece(piece);
            const hasMoved = this.view.pieceHasMoved(piece);
            const [x, y] = this.view.getCoordinatesFromSpace(space);

            const possibleMoves = this.model.generatePossibleMoves(this.model.turn, hasMoved, x, y);
            const filteredMoves = this.filterPossibleMoves(space, possibleMoves);

            if (filteredMoves.length) {
                movePossible = true;
                break;
            }
        }

        return movePossible;
    }

    moveComputer() {}

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
            this.checkGameOver(space);

            // remove all overlays
            this.deselectPiece();

            // show last move in view
            this.view.showLastMove(this.model.lastMove);

            // if game type is 1P and game is not over, make computer move
            if (!this.model.gameOver && this.type === "1P") {
                this.moveComputer();
            }

        } else if (space === spaceSelected) {
            this.deselectPiece();
        } else {
            this.selectPiece(space, piece);
        }
    }

    undoClicked() {
        if (this.model.gameOver || !this.model.lastMove) return;

        const {pieceMoved, startSpace, endSpace, isFirstMove, pieceTaken} = this.model.undoLastMove();

        this.movePiece(endSpace, startSpace, pieceMoved, "undo");

        if (isFirstMove) {
            this.view.undoFirstMove(pieceMoved);
        }

        if (pieceTaken) {
            this.updatePiecesTakenUndo(pieceTaken, endSpace);
        }

        // remove all overlays
        this.deselectPiece();

        this.changeTurn();

        // show last move in view
        const lastMove = this.model.lastMove;

        if (lastMove) {
            this.view.showLastMove(lastMove);
        }
    }

    infoClicked() {
        this.view.showInstructions();
        this.view.showOverlay();
    }

    #hideInstructionsAndOverlay() {
        if (!this.view.instructionsAreOpen()) return;

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