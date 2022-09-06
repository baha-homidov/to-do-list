class todoEntry {
  constructor(title, description, priority, deadline, id) {
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.deadline = deadline;
    this.id = id;
  }

  setID(id) {
    this.id = id;
  }
}


export default todoEntry;
