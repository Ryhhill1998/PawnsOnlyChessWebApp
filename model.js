class Model {

    constructor() {
    }

    moveIsValid(possibleMoves, x, y) {
        let isValid = false;

        for (let i = 0; i < possibleMoves.length; i++) {
            const [xCoordinate, yCoordinate] = possibleMoves[i].coordinates;

            if (xCoordinate === x && yCoordinate === y) {
                isValid = true;
                break;
            }
        }

        return isValid;
    }

    addMove(possibleMoves, x, y, type) {
        const move = {
            coordinates: [x, y],
            type
        };

        possibleMoves.push(move);
    }

    pieceIsAtEndRightSpace(colour, x) {
        return colour === "white" && x === 7 || colour === "black" && x === 0;
    }

    pieceIsAtEndLeftSpace(colour, x) {
        return colour === "white" && x === 0 || colour === "black" && x === 7;
    }
}

export default Model;