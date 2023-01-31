// ---------- DOM ELEMENTS ---------- //
const board = document.getElementById("board");


// ---------- GAME VARIABLES ---------- //
let pieceSelected, spaceSelected = null;
let turn = "white";
let gameOver = false;


// ---------- HELPER FUNCTIONS ---------- //

// select piece if of correct colour
const selectPiece = (space, image) => {
    if (!correctColourClicked(image?.src)) return;

    deselectPiece();

    // select piece clicked by user
    pieceSelected = image;
    spaceSelected = space;

    // highlight space clicked
    highlightSpace(space);
}

// deselect piece
const deselectPiece = () => {
    removeSpaceHighlight(spaceSelected);
    spaceSelected = pieceSelected = null;
}

// add highlight to space
const highlightSpace = (space) => {
    space.style.borderColor = "red";
}

// remove highlight from space
const removeSpaceHighlight = (space) => {
    if (!space) return;

    if (space.classList.contains("space-blue")) {
        space.style.borderColor = "#3A8891";
    } else {
        space.style.borderColor = "#E2DCC8";
    }
}

// check if the attempted move is valid
const moveIsValid = (spaceSelected, spaceToMoveTo) => {
    // get current x and y positions of piece
    const x = Number.parseInt(spaceSelected.classList.value.at(-1));
    const y = Number.parseInt(spaceSelected.closest(".row").id.at(-1));

    // get possible moves for piece
    const pieceColour = getPieceColour(pieceSelected);
    const hasMoved = pieceHasMoved(pieceSelected);
    const possibleMoves = getPossibleMoves(pieceColour, hasMoved, x, y);

    // get new x and y positions of move
    const newX = Number.parseInt(spaceToMoveTo.classList.value.at(-1));
    const newY = Number.parseInt(spaceToMoveTo.closest(".row").id.at(-1));

    // check new x and y positions against possible moves
    let isValid = false;

    for (let i = 0; i < possibleMoves.length; i++) {
        const [xCoordinate, yCoordinate] = possibleMoves[i];

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
        updatePossibleMoves(possibleMoves, startingX, startingY + movement);

        if (!hasMoved && spaceIsFree(startingX, startingY + 2 * movement)) {
            updatePossibleMoves(possibleMoves, startingX, startingY + 2 * movement);
        }
    }

    addRightTakeMoves(possibleMoves, colour, movement, startingX, startingY);
    addLeftTakeMoves(possibleMoves, colour, movement, startingX, startingY);

    return possibleMoves;
}

const updatePossibleMoves = (possibleMoves, x, y) => {
    const coordinates = [x, y];
    possibleMoves.push(coordinates);
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
        updatePossibleMoves(possibleMoves, newX, newY);
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

    if (newSpaceImage) {
        // piece is taken so remove taken piece from new square
        newSpace.removeChild(newSpaceImage);
    }

    // remove image element from space piece is being moved from
    previousSpace.removeChild(piece);
    const newImage = document.createElement("img");
    newSpace.appendChild(newImage);

    // update image src for new square to be that of the piece being moved
    let pieceImageSrc = piece.src;

    if (!pieceHasMoved(piece)) {
        // change image src to a moved piece if first move
        pieceImageSrc = piece.src.split(".")[0] + "-moved.svg";
    }

    newImage.src = pieceImageSrc;
}

// get the colour associated with the image element of a piece
const getPieceColour = (image) => {
    if (!image) return;

    return image.src.includes("white") ? "white" : "black";
}

// determine whether the piece has moved by inspecting its image element
const pieceHasMoved = (image) => image.src.includes("moved");

// change turn variable to opposite colour
const changeTurn = () => turn = turn === "white" ? "black" : "white";

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

    if (gameOver) {
        console.log(colour + " wins!");
    }
}

// check if white has won
const whiteHasWon = (y) => {
    return y === 0;
}

// check if black has won
const blackHasWon = (y) => {
    return y === 7;
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

        changeTurn();

    } else {
        selectPiece(space, image);
    }
}

// ---------- EVENT LISTENERS ---------- //
board.addEventListener("click", spaceClicked);
