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

    const model = new Model();
    const view = new View();

    if (chosenGameMode === "single-player") {
        new Controller1P(model, view);
        levelSelectorPopUp.classList.remove("no-display");
        overlay.classList.remove("no-display");
    } else {
        new Controller2P(model, view);
    }

    gameModePopUp.classList.add("no-display");
}

gameModePopUp.addEventListener("click", selectGameMode);
