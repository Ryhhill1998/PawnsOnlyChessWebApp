import Controller from "./controller.js";
import Model from "../model.js";
import View from "../views/view.js";

class Controller1P extends Controller {

    constructor(model, view) {
        super(model, view, "1P");
        this.init();
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

        this.changeTurn();
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
            this.changeTurn();
        } else {
            this.moveComputerEasy();
        }
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

            this.moveComputerMedium();

        } else if (space === spaceSelected) {
            this.deselectPiece();
        } else {
            this.selectPiece(space, piece);
        }
    }

    init() {
        this.view.addSpaceClickedEventListener(this.spaceClicked.bind(this));
        this.view.addUndoClickedEventListener(this.undoClicked.bind(this));
        this.view.addInfoClickedEventListener(this.infoClicked.bind(this));
        this.view.addOverlayClickedEventListener(this.overlayClicked.bind(this));
        this.view.addCloseInstructionsButtonClickedEventListener(this.closeInstructionsButtonClicked.bind(this));
    }
}

const app = new Controller1P(new Model(), new View());