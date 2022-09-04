
const todoManager = (function todoManager() {
  const todoArray = [];
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

export default todoManager;
