import { uiManager } from "./uiManager";
import { todoEntry } from "./todoClass";

const todoManager = (function () {
  let todoArray = new Array();
  // let folderArray = new Array();

  function addTodo(todo) {
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

export { todoManager };
