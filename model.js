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
}

export default Model;