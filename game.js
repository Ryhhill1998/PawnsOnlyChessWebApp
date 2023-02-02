// ---------- DOM ELEMENTS ---------- //
const board = document.getElementById("board");
const blackPlayerInfo = document.getElementById("black-player-info");
const whitePlayerInfo = document.getElementById("white-player-info");

const undoButton = document.getElementById("undo-button");
const infoButton = document.getElementById("info-button");

// ---------- GAME VARIABLES ---------- //
let pieceSelected, spaceSelected = null;
let turn = "white";
let gameOver = false;
let possibleMoves = [];

const lastMove = {
    startSpace: null,
    endSpace: null,
    firstMove: false,
    take: false
};

const secondLastMove = {
    startSpace: null,
    endSpace: null
};

const piecesTaken = {
    white: 0,
    black: 0
};

const maxPiecesTaken = 4;

const pieceSelectedHTML = `<div class="space-overlay space-overlay-selected"></div>`;
const validMoveIndicatorHTML = `<div class="space-overlay space-overlay-possible-move"></div>`;
const validTakeIndicatorHTML = `<div class="space-overlay space-overlay-possible-take"></div>`;


// ---------- HELPER FUNCTIONS ---------- //

// add piece selected overlay to space
const addPieceSelectedOverlay = (space) => {
    if (!space) return;
    space.insertAdjacentHTML("beforeend", pieceSelectedHTML);
}

// add valid move overlay to space
const addValidMoveOverlay = (space) => {
    if (!space) return;
    space.insertAdjacentHTML("beforeend", validMoveIndicatorHTML);
}

// add valid take overlay to space
const addValidTakeOverlay = (space) => {
    if (!space) return;
    space.insertAdjacentHTML("beforeend", validTakeIndicatorHTML);
}

// remove selected overlay from square
const removeSelectedOverlay = (space) => {
    if (!space) return;
    const overlay = space.querySelector(".space-overlay-selected");
    if (!overlay) return;
    space.removeChild(overlay);
}

// remove valid move overlay from square
const removeValidMoveOverlay = (space) => {
    if (!space) return;
    const overlay = space.querySelector(".space-overlay-possible-move");
    if (!overlay) return;
    space.removeChild(overlay);
}

// remove valid take overlay from square
const removeValidTakeOverlay = (space) => {
    if (!space) return;
    const overlay = space.querySelector(".space-overlay-possible-take");
    if (!overlay) return;
    space.removeChild(overlay);
}

// remove possible positions overlay
const removePossiblePositionsOverlay = (space) => {
    removeValidMoveOverlay(space);
    removeValidTakeOverlay(space);
}

// set possible moves for piece
const setPossibleMoves = (space, piece) => {
    // get current x and y positions of piece
    const x = Number.parseInt(space.classList.value.at(-1));
    const y = Number.parseInt(space.closest(".row").id.at(-1));

    // get possible moves for piece
    const pieceColour = getPieceColour(piece);
    const hasMoved = pieceHasMoved(piece);
    possibleMoves = getPossibleMoves(pieceColour, hasMoved, x, y);
}

// show possible moves for piece selected
const showPossibleMoves = () => {
    possibleMoves.forEach(move => {
        const coordinates = move.coordinates;
        const row = document.getElementById("row-" + coordinates[1]);
        const space = row.querySelector(".space-" + coordinates[0]);
        if (move.type === "take") {
            addValidTakeOverlay(space);
        } else {
            addValidMoveOverlay(space);
        }
    });
}

// hide possible moves for previous piece selected
const hidePossibleMoves = () => {
    possibleMoves.forEach(move => {
        const coordinates = move.coordinates;
        const row = document.getElementById("row-" + coordinates[1]);
        const space = row.querySelector(".space-" + coordinates[0]);
        removePossiblePositionsOverlay(space);
    });
}

// show previous move on board
const showPreviousMove = () => {
    addPieceSelectedOverlay(lastMove.startSpace);
    addPieceSelectedOverlay(lastMove.endSpace);
}

// remove previous move from board
const hidePreviousMove = () => {
    removeSelectedOverlay(lastMove.startSpace);
    removeSelectedOverlay(lastMove.endSpace);
}

// select piece if of correct colour
const selectPiece = (space, image) => {
    if (!correctColourClicked(image?.getAttribute("src"))) return;

    deselectPiece();

    // select piece clicked by user
    pieceSelected = image;
    spaceSelected = space;
    setPossibleMoves(spaceSelected, pieceSelected);

    // highlight space clicked
    addPieceSelectedOverlay(spaceSelected);

    // show possible moves on board
    showPossibleMoves(pieceSelected);
}

// deselect piece
const deselectPiece = () => {
    removeSelectedOverlay(spaceSelected);
    hidePossibleMoves(pieceSelected);
    spaceSelected = pieceSelected = null;
}

// check if the attempted move is valid
const moveIsValid = (spaceSelected, spaceToMoveTo) => {
    // get new x and y positions of move
    const newX = Number.parseInt(spaceToMoveTo.classList.value.at(-1));
    const newY = Number.parseInt(spaceToMoveTo.closest(".row").id.at(-1));

    // check new x and y positions against possible moves
    let isValid = false;

    for (let i = 0; i < possibleMoves.length; i++) {
        const [xCoordinate, yCoordinate] = possibleMoves[i].coordinates;

        if (xCoordinate === newX && yCoordinate === newY) {
            isValid = true;
            break;
        }
    }

    return isValid;
}

// get an array of possible coordinates that the piece can move to
const getPossibleMoves = (colour, hasMoved, startingX, startingY) => {
    const movement = colour === "white" ? -1 : 1;
    const possibleMoves = [];

    if (spaceIsFree(startingX, startingY + movement)) {
        updatePossibleMoves(possibleMoves, startingX, startingY + movement, "standard");

        if (!hasMoved && spaceIsFree(startingX, startingY + 2 * movement)) {
            updatePossibleMoves(possibleMoves, startingX, startingY + 2 * movement, "standard");
        }
    }

    addRightTakeMoves(possibleMoves, colour, movement, startingX, startingY);
    addLeftTakeMoves(possibleMoves, colour, movement, startingX, startingY);

    return possibleMoves;
}

const updatePossibleMoves = (possibleMoves, x, y, type) => {
    const move = {
        coordinates: [x, y],
        type
    };

    possibleMoves.push(move);
}

const addRightTakeMoves = (possibleMoves, colour, movement, x, y) => {
    if (colour === "white" && x === 7 || colour === "black" && x === 0) return;

    addTakeMoves(possibleMoves, "right", colour, movement, x, y);
}

const addLeftTakeMoves = (possibleMoves, colour, movement, x, y) => {
    if (colour === "white" && x === 0 || colour === "black" && x === 7) return;

    addTakeMoves(possibleMoves, "left", colour, movement, x, y);
}

const addTakeMoves = (possibleMoves, takeDirection, colour, movement, x, y) => {
    const colourToTake = colour === "white" ? "black" : "white";

    const newX = takeDirection === "right" ? x - movement : x + movement;
    const newY = y + movement;

    if (takeIsPossible(colourToTake, newX, newY)) {
        updatePossibleMoves(possibleMoves, newX, newY, "take");
    }
}

// check whether the space is empty
const spaceIsFree = (x, y) => {
    const row = document.getElementById("row-" + y);
    const space = row.querySelector(".space-" + x);
    return getImage(space) === null;
}

// check whether the piece can take a piece of the opposite colour
const takeIsPossible = (colourToTake, x, y) => {
    let isPossible = false;

    const row = document.getElementById("row-" + y);
    const space = row.querySelector(".space-" + x);
    const pieceImage = getImage(space);

    if (pieceImage) {
        isPossible = getPieceColour(pieceImage) === colourToTake;
    }

    return isPossible;
}

// move piece on board
const movePiece = (previousSpace, newSpace, piece) => {
    // check if space contains image (take move)
    const newSpaceImage = newSpace.querySelector("img");

    // check if move is a take move
    if (newSpaceImage) {
        // set last move as a take move
        lastMove.take = true;

        // piece is taken so remove taken piece from new square
        newSpace.removeChild(newSpaceImage);

        if (turn === "white") {
            const piecesTakenElement = whitePlayerInfo.querySelector(".pieces-taken");
            piecesTaken.white++;

            if (piecesTaken.white <= maxPiecesTaken) {
                piecesTakenElement.appendChild(newSpaceImage);
            } else {
                const additionalPieces = piecesTaken.white - maxPiecesTaken;
                const additionalPiecesElement = whitePlayerInfo.querySelector(".additional-pieces");

                if (!additionalPiecesElement) {
                    const additionalPiecesHTML = `<p class="additional-pieces">+1</p>`;
                    piecesTakenElement.insertAdjacentHTML("beforeend", additionalPiecesHTML);
                } else {
                    additionalPiecesElement.innerHTML = "+" + additionalPieces;
                }
            }
        } else {
            const piecesTakenElement = blackPlayerInfo.querySelector(".pieces-taken");
            piecesTaken.black++;

            if (piecesTaken.black <= maxPiecesTaken) {
                piecesTakenElement.appendChild(newSpaceImage);
            } else {
                const additionalPieces = piecesTaken.black - maxPiecesTaken;
                const additionalPiecesElement = blackPlayerInfo.querySelector(".additional-pieces");

                if (!additionalPiecesElement) {
                    const additionalPiecesHTML = `<p class="additional-pieces">+1</p>`;
                    piecesTakenElement.insertAdjacentHTML("beforeend", additionalPiecesHTML);
                } else {
                    additionalPiecesElement.innerHTML = "+" + additionalPieces;
                }
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
        lastMove.firstMove = true;
    }

    hidePreviousMove();

    secondLastMove.startSpace = lastMove.startSpace;
    secondLastMove.endSpace = lastMove.endSpace;

    lastMove.startSpace = previousSpace;
    lastMove.endSpace = newSpace;

    showPreviousMove();
}

// get the colour associated with the image element of a piece
const getPieceColour = (image) => {
    if (!image) return;

    return image.getAttribute("src").includes("white") ? "white" : "black";
}

// determine whether the piece has moved by inspecting its image element
const pieceHasMoved = (image) => image.getAttribute("src").includes("moved");

// change turn variable to opposite colour
const changeTurn = () => {
    if (turn === "white") {
        turn = "black";
        whitePlayerInfo.classList.remove("active");
        blackPlayerInfo.classList.add("active");
    } else {
        turn = "white";
        blackPlayerInfo.classList.remove("active");
        whitePlayerInfo.classList.add("active");
    }
}

// get the image element from a space
const getImage = (space) => space.querySelector("img")

// determine whether the piece selected has the right colour (determined by turn)
const correctColourClicked = (imageSrc) => imageSrc?.includes(turn);

// check game is over
const checkGameOver = (moveSpace, pieceMoved) => {
    const colour = getPieceColour(pieceMoved);

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

// check if white has won
const whiteHasWon = (y) => {
    const hasWon = y === 0;

    if (hasWon) {
        whitePlayerInfo.classList.add("winner");
    }

    return hasWon;
}

// check if black has won
const blackHasWon = (y) => {
    const hasWon = y === 7;

    if (hasWon) {
        blackPlayerInfo.classList.add("winner");
    }

    return hasWon;
}

// ---------- EVENT LISTENER FUNCTIONS ---------- //

// space clicked handler function
const spaceClicked = ({target}) => {
    if (gameOver) return;

    const space = target.closest(".space");
    const image = getImage(space);

    if ((!image || getPieceColour(pieceSelected) !== getPieceColour(image)) && pieceSelected) {
        // check if move is valid
        if (!moveIsValid(spaceSelected, space)) return;

        movePiece(spaceSelected, space, pieceSelected);

        // check if game is over
        checkGameOver(space, pieceSelected);

        deselectPiece();

    } else if (space === spaceSelected) {
        deselectPiece();
    } else {
        selectPiece(space, image);
    }
}

// undo move handler function

// TODO -- FIX THIS SO THAT IT REPLACES A PIECE THAT WAS TAKEN
const undoMove = () => {
    const start = lastMove.startSpace;
    const end = lastMove.endSpace;

    if (!start || !end) return;

    const pieceMoved = end.querySelector("img");

    end.removeChild(pieceMoved);
    start.appendChild(pieceMoved);

    if (lastMove.firstMove) {
        const updatedImageSrc = pieceMoved.getAttribute("src").split("-")[0] + ".svg";
        pieceMoved.setAttribute("src", updatedImageSrc);
    }

    changeTurn();

    if (lastMove.take) {
        // remove last child from pieces selected and append it to the end square of the last move
        const playerInfo = turn === "white" ? whitePlayerInfo : blackPlayerInfo;
        const piecesTaken = playerInfo.querySelector(".pieces-taken");
        const lastPieceTaken = [...piecesTaken.querySelectorAll("img")].at(-1);
        piecesTaken.removeChild(lastPieceTaken);
        end.appendChild(lastPieceTaken);
    }

    hidePreviousMove();

    lastMove.startSpace = secondLastMove.startSpace;
    lastMove.endSpace = secondLastMove.endSpace;

    showPreviousMove();
}

// ---------- EVENT LISTENERS ---------- //
board.addEventListener("click", spaceClicked);
undoButton.addEventListener("click", undoMove);
