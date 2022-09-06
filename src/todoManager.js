/* eslint-disable import/no-cycle */
/* eslint-disable no-param-reassign */
import { addTask } from "./firebaseBackend";

const todoManager = (function todoManager() {
  const todoArray = [];

  const userFolderList = []; // folders except "Inbox", "Urgent", "Someday"

  async function addTodo(todo) {
    // add an entry to Firebase and retrieve newly generated ID
    todo.id = await addTask(todo.priority, {
      title: todo.title,
      description: todo.description,
      deadline: todo.deadline,
    });
    console.log(todo);
    todoArray.push(todo);
  }

  function editTodo(newTodo, index) {
    todoArray[index] = newTodo;
  }

  function getTodo(index) {
    return todoArray[index];
  }

  function changeFolder(newFolder, index) {
    todoArray[index].priority = newFolder;
  }

  function getTodoArray() {
    return todoArray;
  }

  return { addTodo, getTodo, getTodoArray, changeFolder, editTodo };
})();

export default todoManager;
