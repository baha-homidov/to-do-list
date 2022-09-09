/* eslint-disable import/no-cycle */
/* eslint-disable no-param-reassign */
import {
  addCustomFolder,
  addTask,
  changeTaskFolder,
  deleteCustomFolder,
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
    addCustomFolder(folderName);
    userFolderArray.push({ name: folderName});
  }


  // find folder and set it's Firestore Document ID
  function setFolderId(folderName, folderId) {
    userFolderArray.forEach((folderObj, index) => {
      if (folderObj.name === folderName) {
        userFolderArray[index].id = folderId;
      }
    })
  }


  function getUserFolderArray() {
    return userFolderArray;
  }

  function setUserFolderArray(newFolderArray) {
    userFolderArray = newFolderArray;
  }

  function folderExists(folderName) {
    return (
      (function arrayIncludes() {
        // check if 'userFolderArray' includes a folder with a similar 'folderName'
        for (let i = 0; i < userFolderArray.length; i += 1) {
          if (userFolderArray[i].name === folderName) return true;
        }
        return false;
      })() ||
      folderName === "Inbox" ||
      folderName === "Urgent" ||
      folderName === "Someday" ||
      folderName === "Logbook" ||
      folderName === "Trash"
    );
  }

  function deleteFolder(folderName, folderId) {
    console.log(`Delete ${userFolderArray}`);
    todoArray.forEach((element) => {
      // move all elements from current folder to trash
      if (element.priority === folderName) {
        element.priority = "Trash";
        changeTaskFolder(element.id, "Trash");
      }
    });
    userFolderArray = userFolderArray.filter(
      (element) => element.name !== folderName
    );
    deleteCustomFolder(folderId)
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
    setFolderId
  };
})();

export default todoManager;
