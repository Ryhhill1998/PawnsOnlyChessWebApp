import Controller from "./controller.js";
import Model from "../model.js";
import View from "../views/view.js";

class Controller2P extends Controller {

    constructor(model, view) {
        super(model, view, "2P");
        this.init();
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

    init() {
        this.view.addSpaceClickedEventListener(this.spaceClicked.bind(this));
        this.view.addUndoClickedEventListener(this.undoClicked.bind(this));
        this.view.addInfoClickedEventListener(this.infoClicked.bind(this));
        this.view.addOverlayClickedEventListener(this.overlayClicked.bind(this));
        this.view.addCloseInstructionsButtonClickedEventListener(this.closeInstructionsButtonClicked.bind(this));
    }
}

const app = new Controller2P(new Model(), new View());