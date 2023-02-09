import Controller1P from "./controllers/controller1P.js";
import Controller2P from "./controllers/controller2P.js";
import Model from "./model.js";
import View from "./views/view.js";

const gameModePopUp = document.getElementById("game-mode");
const levelSelectorPopUp = document.getElementById("level-selector");
const overlay = document.getElementById("overlay");

const selectGameMode = ({target}) => {
    const chosenGameMode = target.closest("button")?.id;
    if (!chosenGameMode) return;

    if (chosenGameMode === "single-player") {
        levelSelectorPopUp.classList.remove("no-display");
        overlay.classList.remove("no-display");
    } else {
        new Controller2P(new Model(), new View());
    }

    gameModePopUp.classList.add("no-display");
}

const selectLevel = ({target}) => {
    const chosenLevel = target.closest("button")?.id;
    if (!chosenLevel) return;

    new Controller1P(new Model(), new View(), chosenLevel);
    levelSelectorPopUp.classList.add("no-display");
    overlay.classList.add("no-display");
}

gameModePopUp.addEventListener("click", selectGameMode);
levelSelectorPopUp.addEventListener("click", selectLevel);
