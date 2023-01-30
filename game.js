// DOM elements
const board = document.getElementById("board");

// game variables
let pieceSelected, spaceSelected = null;
let turn = "white";
let gameOver = false;

const highlightSpace = (space) => {
    space.style.borderColor = "red";
}

const removeSpaceHighlight = (space) => {
    if (!space) return;

    if (space.classList.contains("space-blue")) {
        space.style.borderColor = "#3A8891";
    } else {
        space.style.borderColor = "#E2DCC8";
    }
}

const spaceClicked = ({target}) => {
    if (gameOver) return;

    const space = target.closest(".space");
    const image = getImage(space);

    if (pieceSelected) {
        // check if move is valid
        if (!moveIsValid(spaceSelected, space)) return;

        // UI
        // check if space contains image (take move)
        const spaceImage = space.querySelector("img");
        if (spaceImage) {
            space.removeChild(spaceImage);
        }

        spaceSelected.removeChild(pieceSelected);
        const newImage = document.createElement("img");
        space.appendChild(newImage);

        let pieceImageSrc = pieceSelected.src;
        if (!pieceHasMoved(pieceSelected)) {
            pieceImageSrc = pieceSelected.src.split(".")[0] + "-moved.svg";
        }
        newImage.src = pieceImageSrc;

        // check if game is over
        const pieceColour = getPieceColour(pieceSelected);
        gameOver = gameIsOver(space, pieceColour);

        removeSpaceHighlight(spaceSelected);
        spaceSelected = pieceSelected = null;
        changeTurn();

        if (gameOver) {
            console.log(pieceColour + " wins!");
        }

    } else if (correctColourClicked(image?.src)) {
        removeSpaceHighlight(spaceSelected);
        pieceSelected = image;
        spaceSelected = space;
        highlightSpace(space);
    }
}

const gameIsOver = (moveSpace, colourMoved) => {
    const y = Number.parseInt(moveSpace.closest(".row").id.at(-1));
    let isOver;

    if (colourMoved === "white") {
        isOver = whiteHasWon(y);
    } else {
        isOver = blackHasWon(y);
    }

    return isOver;
}

const whiteHasWon = (y) => {
    return y === 0;
}

const blackHasWon = (y) => {
    return y === 7;
}

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

const getPieceColour = (image) => {
    if (!image) return;

    return image.src.includes("white") ? "white" : "black";
}

const pieceHasMoved = (image) => image.src.includes("moved");

const getPossibleMoves = (colour, hasMoved, startingX, startingY) => {
    const movement = colour === "white" ? -1 : 1;
    const possibleMoves = [];

    let coordinates = [];

    if (spaceIsFree(startingX, startingY + movement)) {
        coordinates.push(startingX);
        coordinates.push(startingY + movement);
        possibleMoves.push(coordinates);

        coordinates = [];

        if (!hasMoved && spaceIsFree(startingX, startingY + 2 * movement)) {
            coordinates.push(startingX);
            coordinates.push(startingY + 2 * movement);
            possibleMoves.push(coordinates);
        }
    }

    coordinates = [];

    // check right take available
    const colourToTake = colour === "white" ? "black" : "white";
    let x = startingX - movement;
    let y = startingY + movement;

    if (takeIsPossible(colourToTake, x, y)) {
        coordinates.push(x);
        coordinates.push(y);
        possibleMoves.push(coordinates);
    }

    coordinates = [];

    // check left take available
    x = startingX + movement;
    y = startingY + movement;

    if (takeIsPossible(colourToTake, x, y)) {
        coordinates.push(x);
        coordinates.push(y);
        possibleMoves.push(coordinates);
    }

    return possibleMoves;
}

const spaceIsFree = (x, y) => {
    const row = document.getElementById("row-" + y);
    const space = row.querySelector(".space-" + x);
    return getImage(space) === null;
}

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

const changeTurn = () => turn = turn === "white" ? "black" : "white";

const getImage = (space) => space.querySelector("img")
const correctColourClicked = (imageSrc) => imageSrc?.includes(turn);

board.addEventListener("click", spaceClicked);