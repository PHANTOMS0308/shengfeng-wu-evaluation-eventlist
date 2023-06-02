import Controller from "./controller.js";
import View from "./view.js";
import Model from "./model.js";

const app = new Controller(Model, View);
app.init();