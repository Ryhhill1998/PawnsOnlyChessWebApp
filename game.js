// DOM elements
const board = document.getElementById("board");

// game variables
let pieceSelected, spaceSelected = null;
let turn = "white";

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
    const space = target.closest(".space");
    const image = getImage(space);

    if (!image && pieceSelected) {
        // check if move is valid
        if (!moveIsValid(spaceSelected, space)) return;

        // UI
        spaceSelected.removeChild(pieceSelected);
        const newImage = document.createElement("img");
        space.appendChild(newImage);
        newImage.src = pieceSelected.src;

        removeSpaceHighlight(spaceSelected);
        spaceSelected = pieceSelected = null;

        changeTurn();

    } else if (correctColourClicked(image?.src)) {
        removeSpaceHighlight(spaceSelected);
        pieceSelected = image;
        spaceSelected = space;
        highlightSpace(space);
    }
}

const moveIsValid = (spaceSelected, spaceToMoveTo) => {
    // get current x and y positions of piece
    const x = Number.parseInt(spaceSelected.classList.value.at(-1));
    const y = Number.parseInt(spaceSelected.closest(".row").id.at(-1));

    // get possible moves for piece
    const pieceColour = getPieceColour(pieceSelected);
    const possibleMoves = getPossibleMoves(pieceColour, x, y);

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

const getPossibleMoves = (colour, startingX, startingY) => {
    const movement = colour === "white" ? -1 : 1;
    const possibleMoves = [];

    let coordinates = [];

    if (spaceIsFree(startingX, startingY + movement)) {
        coordinates.push(startingX);
        coordinates.push(startingY + movement);
        possibleMoves.push(coordinates);
    }

    return possibleMoves;
}

const spaceIsFree = (x, y) => {
    const row = document.getElementById("row-" + y);
    const space = row.querySelector(".space-" + x);
    return getImage(space) === null;
}

const changeTurn = () => turn = turn === "white" ? "black" : "white";

const getImage = (space) => space.querySelector("img")
const correctColourClicked = (imageSrc) => imageSrc?.includes(turn);

board.addEventListener("click", spaceClicked);