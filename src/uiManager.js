/* eslint-disable import/no-cycle */
/* eslint-disable no-shadow */
/* eslint-disable new-cap */
/* eslint-disable no-use-before-define */
import { format, parseISO } from "date-fns";
import todoManager from "./todoManager";
import todoEntry from "./todoClass";
import { signInUser, signOutUser } from "./firebaseBackend";

// cache Dom
const menuToggle = document.querySelector(".menu-toggle");
const sidebar = document.querySelector(".sidebar");
const menu = document.querySelector("nav.menu");
const entryContainer = document.querySelector("div.entry-container");
const addTodoButton = document.querySelector("button.add-button");
const addFolderButton = document.querySelector("button.add-folder");
const deleteFolderButton = document.querySelector("button.delete-folder");
const addFolderText = document.querySelector("#folder-name");
const folderErrorText = document.querySelector(".folder-error");
const addFolderForm = document.querySelector("form.add-folder");
const submitFolderForm = document.querySelector("form.add-folder");
const submitForm = document.querySelector("form.add-todo");
const editForm = document.querySelector("form.edit-todo");
const editFormTitle = document.querySelector("form.edit-todo>#title");
const editFormDescription = document.querySelector(
  "form.edit-todo>#description"
);
const editFormDeadline = document.querySelector("form.edit-todo>#deadline");
let editId;

const title = document.querySelector("input#title");
const description = document.querySelector("textarea#description");
const deadline = document.querySelector("input#deadline");
const pageTitle = document.querySelector(".title > .folder-title");
const pageTitleIcon = document.querySelector(".title > .icon");
const signInButton = document.querySelector("button.sign-in");
const signOutButton = document.querySelector("button.sign-out");
const usernameGreeting = document.querySelector("h2.greeting");
const welcomeContainer = document.querySelector("div.welcome-container");
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
  const todoArray = todoManager.getTodoArray();
  clearCanvas();
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < todoArray.length; i++) {
    if (todoArray[i].priority === folder) {
      addToDo(todoArray[i], todoArray[i].id);
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

  // set deleteFolderButton's visibility
  if (
    folder === "Inbox" ||
    folder === "Urgent" ||
    folder === "Someday" ||
    folder === "Logbook" ||
    folder === "Trash"
  ) {
    deleteFolderButton.classList.add("hide");
  } else {
    deleteFolderButton.classList.remove("hide");
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

function showFolderError(folderName) {
  folderErrorText.textContent = `${folderName} already exists.`;
  folderErrorText.classList.remove("hide");
}

function hideFolderError() {
  folderErrorText.classList.add("hide");
}

function init() {
  updateMenuItemEvents();

  signInButton.addEventListener("click", () => {
    signInUser();
  });
  signOutButton.addEventListener("click", () => {
    signOutUser();
  });

  deleteFolderButton.addEventListener("click", () => {
    const folderMenuEntry = document.querySelector(
      `[folder='${currentFolder}']`
    );
    const folderId = folderMenuEntry.getAttribute("doc-id"); // get folder's Firestore Document ID for deleting from backed
    todoManager.deleteFolder(currentFolder, folderId);
    folderMenuEntry.remove();
    switchToFolder("Inbox");
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
    todoManager.addTodo(newTodo).then(() => {
      // wait for the async todoManager.addTodo() finish and update canvas
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
    todoManager.editTodo(newTodo, editId);
    updateCanvas(currentFolder);
    editForm.reset();
    editForm.classList.toggle("hide");
    console.log("edited");
  });

  submitFolderForm.addEventListener("submit", (event) => {
    event.preventDefault(); // stop page from refreshing
    // check if folder already exists
    const folderName = addFolderText.value;
    if (todoManager.folderExists(folderName)) {
      showFolderError(folderName);
      return;
    }
    const newFolder = createElement("button", "menu-item");
    newFolder.setAttribute("folder", folderName);
    todoManager.addFolder(folderName);
    // add folder to todoManager

    const icon = createElement("img");
    icon.src = "assets/icons/folder.svg";
    newFolder.appendChild(icon);
    newFolder.appendChild(document.createTextNode(folderName));

    menu.insertBefore(newFolder, addFolderButton);
    submitFolderForm.reset();
    submitFolderForm.classList.toggle("hide");
    hideFolderError();
    updateMenuItemEvents();
  });

  addFolderButton.addEventListener("click", () => {
    addFolderForm.classList.toggle("hide");
  });
}
init();

function displayUserFolders() {
  // retrieve folderList from todoManager and add them to DOM

  const userFolderList = todoManager.getUserFolderArray();

  userFolderList.forEach((folderObj) => {
    const newFolder = createElement("button", "menu-item");
    newFolder.setAttribute("folder", folderObj.name);
    newFolder.setAttribute("doc-id", folderObj.id);
    const icon = createElement("img");
    icon.src = "assets/icons/folder.svg";
    newFolder.appendChild(icon);
    newFolder.appendChild(document.createTextNode(folderObj.name));
    menu.insertBefore(newFolder, addFolderButton);
    submitFolderForm.reset();
    submitFolderForm.classList.toggle("hide");
    updateMenuItemEvents();
  });
}

function setFolderId(folderName, folderId) {
  const folderElement = document.querySelector(`[folder='${folderName}']`);
  folderElement.setAttribute("doc-id", folderId);
  console.log(folderElement);
}

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

function makeEntryElem(todo, id) {
  const entryElem = createElement("div", "list-entry");
  entryElem.classList.add("target");
  entryElem.setAttribute("firestore-id", id);

  const checkButton = createElement("button", "check-button");
  const buttonImg = document.createElement("img");
  buttonImg.src = "assets/icons/check_box.svg";
  checkButton.appendChild(buttonImg);
  checkButton.addEventListener("click", (event) => {
    todoManager.changeFolder("Logbook", id);
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
      todoManager.changeFolder("Logbook", id);
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
      editId = id;
    });
    buttons.appendChild(editButton);

    const deleteButton = createElement(
      "button",
      "delete-button",
      "Delete To-Do"
    );
    deleteButton.addEventListener("click", (event) => {
      todoManager.changeFolder("Trash", id);
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
      todoManager.changeFolder("Logbook", id);
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

function addToDo(todo, id) {
  entryContainer.appendChild(makeEntryElem(todo, id));
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

function showWelcomeContainer() {
  welcomeContainer.classList.remove("hide");
  menu.classList.add("hide");
}

function hideWelcomeContainer() {
  welcomeContainer.classList.add("hide");
  menu.classList.remove("hide");
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
  displayUserFolders,
  hideWelcomeContainer,
  showWelcomeContainer,
  setFolderId,
};
