/* eslint-disable import/no-cycle */
/* eslint-disable no-shadow */
/* eslint-disable new-cap */
/* eslint-disable no-use-before-define */
import { format, parseISO } from "date-fns";
import todoManager from "./todoManager";
import todoEntry from "./todoClass";
import { addTask, signInUser, signOutUser } from "./firebaseBackend";

// cache Dom
const menuToggle = document.querySelector(".menu-toggle");
const sidebar = document.querySelector(".sidebar");
const menu = document.querySelector("nav.menu");
const entryContainer = document.querySelector("div.entry-container");
const addTodoButton = document.querySelector("button.add-button");
const addFolderButton = document.querySelector("button.add-folder");
const addFolderText = document.querySelector("#folder-name");
const addFolderForm = document.querySelector("form.add-folder");
const submitFolderForm = document.querySelector("form.add-folder");
const submitForm = document.querySelector("form.add-todo");
const editForm = document.querySelector("form.edit-todo");
const editFormTitle = document.querySelector("form.edit-todo>#title");
const editFormDescription = document.querySelector(
  "form.edit-todo>#description"
);
const editFormDeadline = document.querySelector("form.edit-todo>#deadline");
let editIndex;

const title = document.querySelector("input#title");
const description = document.querySelector("textarea#description");
const deadline = document.querySelector("input#deadline");
const pageTitle = document.querySelector(".title > .folder-title");
const pageTitleIcon = document.querySelector(".title > .icon");
const signInButton = document.querySelector("button.sign-in");
const signOutButton = document.querySelector("button.sign-out");
const usernameGreeting = document.querySelector("h2.greeting");
let menuItems = document.querySelectorAll("button.menu-item");

let currentFolder = "Inbox";

function updateMenuItemEvents() {
  menuItems = document.querySelectorAll("button.menu-item");
  menuItems.forEach((button) => {
    button.addEventListener("click", () => {
      switchToFolder(button.getAttribute("folder"));
      button.classList.toggle("is-active");
    });
  });
}

function updateCanvas(folder) {
  console.log("update canvas");
  const todoArray = todoManager.getTodoArray();
  clearCanvas();
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < todoArray.length; i++) {
    if (todoArray[i].priority === folder) {
      addToDo(todoArray[i], i);
    }
  }
}

function switchToFolder(folder) {
  let iconPath;
  currentFolder = folder;
  switch (folder) {
    case "Inbox":
      iconPath = "assets/icons/inbox_big.svg";
      break;
    case "Urgent":
      iconPath = "assets/icons/urgent_big.svg";
      break;
    case "Someday":
      iconPath = "assets/icons/someday_big.svg";
      break;
    case "Logbook":
      iconPath = "assets/icons/logbook_big.svg";
      break;
    case "Trash":
      iconPath = "assets/icons/trash_big.svg";
      break;
    default:
      iconPath = "assets/icons/folder_big.svg";
      break;
  }
  pageTitle.textContent = folder;
  pageTitleIcon.src = iconPath;
  updateCanvas(folder);
  addTodoButton.classList.remove("hide");
  if (folder === "Trash" || folder === "Logbook") {
    addTodoButton.classList.add("hide");
  }
  menuItems.forEach((button) => {
    button.classList.remove("is-active");
  });
}

function init() {
  document.querySelector("#test").addEventListener("click", () => {
    console.log("Click");
    addTask("Inbox", {
      title: "Do something",
      description: "Some description",
      deadline: "22-02-2023",
    });
  });

  updateMenuItemEvents();

  signInButton.addEventListener("click", () => {
    signInUser();
  });
  signOutButton.addEventListener("click", () => {
    signOutUser();
  });

  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("is-active");
    sidebar.classList.toggle("is-active");
  });

  addTodoButton.addEventListener("click", () => {
    submitForm.classList.toggle("hide");
  });

  submitForm.addEventListener("submit", (event) => {
    event.preventDefault(); // stop page form refreshing
    // eslint-disable-next-line new-cap
    const newTodo = new todoEntry(
      title.value,
      description.value,
      currentFolder,
      deadline.value
    );
    todoManager.addTodo(newTodo).then(() => { // wait for the async todoManager.addTodo() finish and update canvas
      updateCanvas(currentFolder);
    });
    // updateCanvas(currentFolder);
    submitForm.reset();
    submitForm.classList.toggle("hide");
  });

  editForm.addEventListener("submit", (event) => {
    event.preventDefault(); // stop page from refreshing
    const newTodo = new todoEntry(
      editFormTitle.value,
      editFormDescription.value,
      currentFolder,
      editFormDeadline.value
    );
    todoManager.editTodo(newTodo, editIndex);
    updateCanvas(currentFolder);
    editForm.reset();
    editForm.classList.toggle("hide");
    console.log("edited");
  });

  submitFolderForm.addEventListener("submit", (event) => {
    event.preventDefault(); // stop page from refreshing
    const newFolder = createElement("button", "menu-item");
    newFolder.setAttribute("folder", addFolderText.value);
    const icon = createElement("img");
    icon.src = "assets/icons/folder.svg";
    newFolder.appendChild(icon);
    newFolder.appendChild(document.createTextNode(addFolderText.value));

    menu.insertBefore(newFolder, addFolderButton);
    submitFolderForm.reset();
    submitFolderForm.classList.toggle("hide");
    updateMenuItemEvents();
  });

  addFolderButton.addEventListener("click", () => {
    addFolderForm.classList.toggle("hide");
  });
}
init();

function clearCanvas() {
  // eslint-disable-next-line no-shadow
  const entryContainer = document.querySelector("div.entry-container");
  entryContainer.textContent = "";
}

function createElement(type, className, textContent) {
  const element = document.createElement(type);
  if (className) {
    element.classList.add(className);
  }
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
}

function makeEntryElem(todo, index) {
  const entryElem = createElement("div", "list-entry");
  entryElem.classList.add("target");
  entryElem.setAttribute("array-index", index);

  const checkButton = createElement("button", "check-button");
  const buttonImg = document.createElement("img");
  buttonImg.src = "assets/icons/check_box.svg";
  checkButton.appendChild(buttonImg);
  checkButton.addEventListener("click", (event) => {
    todoManager.changeFolder("Logbook", index);
    updateCanvas(currentFolder);
    event.stopImmediatePropagation();
  });
  entryElem.appendChild(checkButton);
  entryElem.appendChild(createElement("div", "title", todo.title));

  entryElem.addEventListener("click", (event) => {
    if (entryElem.classList.contains("is-active")) {
      return;
    }
    console.log("first");
    entryElem.textContent = "";
    entryElem.classList.add("is-active");

    entryElem.appendChild(createElement("div", "title", todo.title));
    entryElem.appendChild(
      createElement("div", "description", todo.description)
    );
    entryElem.appendChild(createElement("div", "line"));
    entryElem.appendChild(
      createElement("div", "priority", `Priority: ${todo.priority}`)
    );
    entryElem.appendChild(createElement("div", "line"));
    let formattedDate = "";
    if (todo.deadline) {
      formattedDate = format(parseISO(todo.deadline), "MMMM do yyyy");
    }
    entryElem.appendChild(
      createElement("div", "deadline", `Deadline: ${formattedDate}`)
    );

    const buttons = createElement("div", "buttons");
    // eslint-disable-next-line no-shadow
    const checkButton = createElement(
      "button",
      "check-button",
      "Mark Complete"
    );

    // eslint-disable-next-line no-shadow
    checkButton.addEventListener("click", (event) => {
      todoManager.changeFolder("Logbook", index);
      updateCanvas(currentFolder);
      event.stopImmediatePropagation();
    });

    buttons.appendChild(checkButton);

    const editButton = createElement("button", "edit-button", "Edit");
    editButton.addEventListener("click", () => {
      editForm.classList.toggle("hide");
      editFormTitle.value = todo.title;
      editFormDescription.value = todo.description;
      console.log(todo.deadline);
      editFormDeadline.value = todo.deadline;
      editIndex = index;
    });
    buttons.appendChild(editButton);

    const deleteButton = createElement(
      "button",
      "delete-button",
      "Delete To-Do"
    );
    deleteButton.addEventListener("click", (event) => {
      todoManager.changeFolder("Trash", index);
      updateCanvas(currentFolder);

      event.stopImmediatePropagation();
    });
    buttons.appendChild(deleteButton);

    entryElem.appendChild(buttons);
    event.stopImmediatePropagation(); // stops further event listeners from firing
  });

  entryElem.addEventListener("click", () => {
    if (!entryElem.classList.contains("is-active")) {
      return;
    }

    entryElem.textContent = "";
    entryElem.classList.toggle("is-active");

    const checkButton = createElement("button", "check-button");

    checkButton.addEventListener("click", (event) => {
      todoManager.changeFolder("Logbook", index);
      updateCanvas(currentFolder);
      event.stopImmediatePropagation();
    });

    const buttonImg = document.createElement("img");
    buttonImg.src = "assets/icons/check_box.svg";
    checkButton.appendChild(buttonImg);
    entryElem.appendChild(checkButton);
    entryElem.appendChild(createElement("div", "title", todo.title));
  });

  return entryElem;
}

function addToDo(todo, index) {
  entryContainer.appendChild(makeEntryElem(todo, index));
}

function updateGreeting(username) {
  if (username === "") {
    usernameGreeting.textContent = "Hi!";
  } else {
    usernameGreeting.textContent = `Hi, ${username}!`;
  }
}

function hideGreeting() {
  usernameGreeting.classList.add("hide");
}

function showGreeting() {
  usernameGreeting.classList.remove("hide");
}

function hideSignInButton() {
  signInButton.classList.add("hide");
}

function showSignInbutton() {
  signInButton.classList.remove("hide");
}

function hideSignOutButton() {
  signOutButton.classList.add("hide");
}

function showSignOutbutton() {
  signOutButton.classList.remove("hide");
}

function refreshUi() {
  switchToFolder("Inbox");
}

export {
  updateGreeting,
  hideSignInButton,
  showSignInbutton,
  hideSignOutButton,
  showSignOutbutton,
  hideGreeting,
  showGreeting,
  refreshUi,
};
