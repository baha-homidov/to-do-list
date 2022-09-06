class todoEntry {
  constructor(title, description, priority, deadline) {
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.deadline = deadline;
    this.id = "";
  }

  setID(id) {
    this.id = id;
  }
}


export default todoEntry;
