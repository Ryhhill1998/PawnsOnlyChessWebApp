// DOM elements
const board = document.getElementById("board");

// game variables
let pieceSelected, spaceSelected = null;
let turn = "white";

const highlightSpace = (space) => {
    space.style.borderColor = "red";
    spaceSelected = space;
}

const removeSpaceHighlight = (space) => {
    if (space.classList.contains("space-blue")) {
        space.style.borderColor = "#3A8891";
    } else {
        space.style.borderColor = "#E2DCC8";
    }
}

const spaceClicked = ({target}) => {
    console.log(turn);
    const space = target.closest(".space");
    const image = getImage(space);

    if (!image && pieceSelected) {
        spaceSelected.removeChild(pieceSelected);
        const newImage = document.createElement("img");
        space.appendChild(newImage);
        newImage.src = pieceSelected.src;
        removeSpaceHighlight(spaceSelected);
        spaceSelected = pieceSelected = null;

        turn = turn === "white" ? "black" : "white";

    } else if (correctColourClicked(image?.src)) {
        pieceSelected = image;
        highlightSpace(space);
    }
}

const getImage = (space) => space.querySelector("img")
const correctColourClicked = (imageSrc) => imageSrc?.includes(turn);

board.addEventListener("click", spaceClicked);