import Controller from "./controller.js";
import Model from "../model.js";
import View from "../views/view.js";

class Controller2P extends Controller {

    constructor(model, view) {
        super(model, view, "2P");
    }
}

const app = new Controller2P(new Model(), new View());