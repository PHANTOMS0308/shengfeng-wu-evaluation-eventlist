// In my implementation of MVC, View has access for all Model methods and properties
// However, Model does not know about either Controller or View
// Whereas, Controller can control both Model and View
// So the paradigm is like: [ View --> Model | View <-- Controller --> Model ]
// There are many variation of MVC, I believe the one I use makes more sense for mordern vanilla JS
export default class Controller {
  constructor(Model, View) {
    this.model = new Model();
    this.view = new View(this.model);
    
    // Suscribe View to "Change" Event in Model
    // It's like React, whenever the state changes, it triggers render
    this.model.addEventListener('change', () => this.view.render());
  }

  // To initiate the app, simply just reading all data from json server
  async init() {
    try {
      await this.model.readAllEvents();
    } catch (err) {
      // May would like to let View render a unique page to show that app crash
      alert('Internet Error, please refresh the page');
    }
  }
}