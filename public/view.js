// All button in this webpage has [data-type] to demonstrate their task
// "new" => To create a new editable row
// "add" => Add the target editable event to database
// "cancel" => Quit the editable mode (2 scenarios: creating new && update existing)
// "drop" => Drop the target event
// "edit" => Toggle to editable mode, only avaible for existing event
// "update" => update the current
export default class View {
  // Get required elements
  constructor(model) {
    this.model = model;
    this.table = document.querySelector('main > table > tbody');

    // All these bind can actually just written in constructor
    // We containerize in functions for code readibility
    // In a more old-school MVC, these bind functions should be called in Controller
    // Each function take callback, which are model method.
    // However, that is just cumbersome in Mordern JS.
    // Therefore, I just move some initiation task to View
    this.bindPopAddEvent();
    this.bindAddEvent();
    this.bindCancelEvent();
    this.bindDropEvent();
    this.bindEditEvent();
    this.bindUpdateEvent()
  }

  // Get table row element, from javascript object ==> this.model.events;
  getTableRow({ id, eventName, startDate, endDate }, editable = false) {
    const row = document.createElement('tr');
    if (id) row.dataset.id = id; // [data-id], we know the id whenver we click any button

    // Four columns
    const col1 = document.createElement('td');
    const col2 = document.createElement('td');
    const col3 = document.createElement('td');
    const col4 = document.createElement('td');

    if (editable) {
      col1.innerHTML = `<input value=${eventName ? `"${eventName}"` : ''}>`;
      col2.innerHTML = `<input type='date' value=${startDate ? `${startDate}` : ''}>`;
      col3.innerHTML = `<input type='date' value=${endDate ? `${endDate}` : ''}>`;
      col4.innerHTML = `
        <button data-type="${id ? 'update' : 'add'}">
          ${id ? 'Save' : 'Add'}
        </button>
        <button data-type="cancel">Cancel</button>
      `;
    } else {
      col1.textContent = eventName;
      col2.textContent = startDate;
      col3.textContent = endDate;
      col4.innerHTML = `
        <button data-type="edit">Edit</button>
        <button data-type="drop">Drop</button>
      `;
    }

    row.append(col1, col2, col3, col4);
    return row;
  }

  // Turn <tr> into body { eventName, startDate, endDate }
  // Kinda validate the row at the same time
  // However, if time allowed, we should have purer functions
  parseTableRow(row) {
    const body = {};
    const values = [];
    
    for (let i = 0; i < 3; i++) {
      const input = row.cells[i].querySelector('input');

      if (input) values.push(input.value);
      else values.push(row.cells[i].textContent);
    }

    if (values.some(value => !value)) return null;

    body.eventName = values[0];
    body.startDate = values[1];
    body.endDate = values[2];

    return body;
  }

  // Now it is a full render, will change it to better way of rendering
  render() {
    this.table.innerHTML = '';

    this.model.events.forEach(event => {
      this.table.append(this.getTableRow(event));
    });
  }

  // bindXXX functions are to create a connection between View and Model
  // Such that Iteraction with View will call method in Model
  // After Model state changes, View will suscribe to that state change
  // Thuse View will render the page based on the new Model state
  // All below function use delegation to find the button
  bindPopAddEvent() {
    document.addEventListener('click', event => {
      if (event.target.matches('button[data-type="new"]')) {
        const row = this.getTableRow({}, true);
        this.table.append(row);
      }
    })
  }
  
  // This is tricky, how do you know you are canceling two of these?
  // 1. To post a new event; 2. To update an existing event
  // We use [data-id], if target has id, then I know it is an old event
  // If there is no id, then this must be a eidtable row for new event
  bindCancelEvent() {
    this.table.addEventListener('click', event => {
      if (!event.target.matches('button[data-type="cancel"]')) return false;
      
      const row = event.target.closest('tr');
      const id = row.dataset.id;
      
      if (id) {
        for (let row of this.table.rows) {
          if (row.dataset.id === id) row.hidden = false;
        }
      }

      row.remove();
    });
  }

  // validation is simple here, subject to change
  async bindAddEvent() {
    this.table.addEventListener('click', async(event) => {
      if (!event.target.matches('button[data-type="add"]')) return false;

      const row = event.target.closest('tr');
      const body = this.parseTableRow(row);

      if (body === null) {
        alert('Inputs are not valid!');
        return false;
      }

      const res = await this.model.createEvent(body);

      if (res) {
        this.errorHandler(res.error);
        return false;
      }

      row.remove();
    });
  }

  bindDropEvent() {
    this.table.addEventListener('click', async(event) => {
      if (!event.target.matches('button[data-type="drop"]')) return false;

      const row = event.target.closest('tr');
      const id = row.dataset.id;
      const res = await this.model.deleteEvent(id);

      if (res) {
        this.errorHandler(res.error);
        return false;
      }

      row.remove();
    });
  }

  bindEditEvent() {
    this.table.addEventListener('click', async(event) => {
      if (!event.target.matches('button[data-type="edit"]')) return false;

      const row = event.target.closest('tr');
      const id = row.dataset.id;

      const editRow = this.getTableRow({ id, ...this.parseTableRow(row) }, true);
      row.insertAdjacentElement('beforebegin', editRow);
      row.hidden = true;
    });
  }

  bindUpdateEvent() {
    this.table.addEventListener('click', async(event) => {
      if (!event.target.matches('button[data-type="update"]')) return false;

      const row = event.target.closest('tr');
      const id = row.dataset.id;
      const body = this.parseTableRow(row);

      if (body === null) {
        alert('Inputs are not valid!');
        return false;
      }

      const res = await this.model.updateEvent(id, body);

      if (res) {
        this.errorHandler(res.error);
        return false;
      }
    });
  }

  // For those View method that are calling Model method
  // It is possible error occurred in Model
  // So we take error from model and prompt user error occurred in View
  errorHandler(err) {
    console.log(err); // could be more developer-friendly
    alert('Internet error, please try again');
  }
}