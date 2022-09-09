/* eslint-disable import/no-cycle */
/* eslint-disable no-param-reassign */
import {
  addCustomFolder,
  addTask,
  changeTaskFolder,
  editTask,
} from "./firebaseBackend";

const todoManager = (function todoManager() {
  let todoArray = [];
  let userFolderArray = []; // folders except "Inbox", "Urgent", "Someday"

  async function addTodo(todo) {
    // add an entry to Firebase and retrieve newly generated ID
    todo.id = await addTask({
      title: todo.title,
      description: todo.description,
      deadline: todo.deadline,
      priority: todo.priority,
    });
    console.log(todo);
    todoArray.push(todo);
  }

  function editTodo(newTodo, id) {
    for (let i = 0; i < todoArray.length; i += 1) {
      if (todoArray[i].id === id) {
        todoArray[i] = newTodo;
      }
    }
    editTask(
      {
        title: newTodo.title,
        description: newTodo.description,
        deadline: newTodo.deadline,
        priority: newTodo.priority,
      },
      id
    );
  }

  function getTodo(index) {
    return todoArray[index];
  }

  function changeFolder(newFolder, id) {
    for (let i = 0; i < todoArray.length; i += 1) {
      if (todoArray[i].id === id) {
        todoArray[i].priority = newFolder;
      }
    }
    changeTaskFolder(id, newFolder);
  }

  function getTodoArray() {
    return todoArray;
  }

  function setTodoArray(newTodoArray) {
    todoArray = newTodoArray;
  }

  function addFolder(folderName) {
    userFolderArray.push(folderName);
    addCustomFolder(folderName);
    console.log(userFolderArray);
  }

  function getUserFolderArray() {
    return userFolderArray;
  }

  function setUserFolderArray(newFolderArray) {
    userFolderArray = newFolderArray;
  }

  function folderExists(folderName) {
    return (
      userFolderArray.includes(folderName) ||
      folderName === "Inbox" ||
      folderName === "Urgent" ||
      folderName === "Someday" ||
      folderName === "Logbook" ||
      folderName === "Trash"
    );
  }

  async function deleteFolder(folderName) {
    console.log(`Delete ${folderName}`);
    todoArray.forEach((element) => { // move all elements from current folder to trash
      if (element.priority === folderName) {
        element.priority = "Trash";
        changeTaskFolder(element.id, "Trash");
      }
    })
    userFolderArray = userFolderArray.filter(
      (element) => element !== folderName
    );

    
  }

  return {
    addTodo,
    getTodo,
    getTodoArray,
    getUserFolderArray,
    setTodoArray,
    setUserFolderArray,
    changeFolder,
    editTodo,
    addFolder,
    deleteFolder,
    folderExists,
  };
})();

export default todoManager;
