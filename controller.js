import Model from "./model";
import View from "./view";

class Controller {

    constructor(model, view) {
        this.model = model;
        this.view = view;
    }
}

const app = new Controller(new Model(), new View());