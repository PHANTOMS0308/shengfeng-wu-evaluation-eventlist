// Model as EventTarget, so View can suscribe to custom event ['change'] in Model
export default class Model extends EventTarget {
  constructor() {
    super();
  }

  // A uniform error Handler, subject to change, now just console.log
  errorHandler(err) {
    console.log(err);
    return { error: err }
  } 

  // Custom fetch to modularize the code
  async fetch({ method, route, body }) {
    const url = `http://localhost:3000/events${route}`;

    const options = {
      method,
      headers: { "Content-Type": "application/json" }
    };

    // In case when we need request body
    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(url, options);

      if (!res.ok) {
        throw new Error('Bad Request');
      }
      
      return await res.json();
    } catch (err) {
      throw err; // let other function handle err
    }
  }

  async readAllEvents() {
    try {
      this.events = await this.fetch({ method: 'GET', route: '' });
      this.dispatchEvent(new CustomEvent('change'));
    } catch (err) {
      return this.errorHandler(err);
    }
  }

  // Usually, there should be a client-side validation, which I am not implement here
  // I assume this body is in form of { eventName, startDate, endDate }
  async createEvent(body) {
    try {
      const addedEvent = await this.fetch({ method: 'POST', route: '', body });
      this.events.push(addedEvent);
      this.dispatchEvent(new CustomEvent('change'));
    } catch (err) {
      return this.errorHandler(err);
    }
  }


  async deleteEvent(id) {
    id = parseInt(id); // just to make sure id is INT

    try {
      await this.fetch({ method: 'DELETE', route: `/${id}`});
      this.events = this.events.filter(e => e.id !== id);
      this.dispatchEvent(new CustomEvent('change'));
    } catch (err) {
      return this.errorHandler(err);
    }
  }


  // We use PUT, instead of PATCH, so full replacement
  // Again, we assume this body is { eventName, startDate, endDate }
  async updateEvent(id, body) {
    id = parseInt(id); // just to make sure id is INT

    try {
      const updatedEvent = await this.fetch({ method: 'PUT', route: `/${id}`, body });
      this.events = this.events.map(e => e.id === id ? updatedEvent : e);
      this.dispatchEvent(new CustomEvent('change'));
    } catch (err) {
      return this.errorHandler(err);
    }
  }
}