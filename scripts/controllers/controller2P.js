import Controller from "./controller.js";
import Model from "../model.js";
import View from "../views/view.js";

export default class Controller2P extends Controller {

    constructor(model, view) {
        super(model, view, "2P");
    }
}