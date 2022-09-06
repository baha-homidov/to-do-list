/* eslint-disable import/no-cycle */
/* eslint-disable no-param-reassign */
import { addTask } from "./firebaseBackend";

const todoManager = (function todoManager() {
  let todoArray = [];

  const userFolderList = []; // folders except "Inbox", "Urgent", "Someday"

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

  function setTodoArray(newTodoArray) {
    todoArray = newTodoArray;
  }

  return { addTodo, getTodo, getTodoArray, setTodoArray, changeFolder, editTodo };
})();

export default todoManager;
