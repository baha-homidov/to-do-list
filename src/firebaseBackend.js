/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
/* eslint-disable import/no-cycle */
/* eslint-disable import/no-duplicates */

/* firestore imports */
// required libraries to initialize firestore
import { initializeApp } from "firebase/app";
// required libraries for firestore
import {
  doc,
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
// required libraries for firestore divide
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,

} from "firebase/auth";
import {
  updateGreeting,
  showGreeting,
  hideGreeting,
  hideSignInButton,
  showSignInbutton,
  refreshUi,
  showSignOutbutton,
  hideSignOutButton,
  displayUserFolders,
  hideWelcomeContainer,
  showWelcomeContainer,
} from "./uiManager";

import todoEntry from "./todoClass";
import todoManager from "./todoManager";

// My web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNqafFzXpxXMiUpL69n1YfR1MmsJQTBeM",
  authDomain: "gotta-do-list.firebaseapp.com",
  projectId: "gotta-do-list",
  storageBucket: "gotta-do-list.appspot.com",
  messagingSenderId: "441076371410",
  appId: "1:441076371410:web:fc8f24cb094396d996c20b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let userUID = "";

async function signInUser() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  const provider = new GoogleAuthProvider();
  await signInWithPopup(getAuth(), provider);
  // eslint-disable-next-line no-restricted-globals
  const auth = getAuth();
  const user = auth.currentUser;
  initUser(user.uid);
}

function signOutUser() {
  // Sign out of Firebase
  signOut(getAuth());
  // eslint-disable-next-line no-restricted-globals
  location.reload();
}

function getUsername() {
  return getAuth().currentUser.displayName;
}

function authStateObserver(user) {
  if (user) {
    // User is signed in!

    hideWelcomeContainer();
    const username = getUsername();
    updateGreeting(username);
    showGreeting();
    hideSignInButton();
    showSignOutbutton();
    const auth = getAuth();
    userUID = auth.currentUser.uid;
    updateDataFromBackend();

  } else {
    // User is signed out!
    updateGreeting("");
    showSignInbutton();
    hideGreeting();
    hideSignOutButton();

    showWelcomeContainer();
  }
}

function initFireBaseAuth() {
  // Listen to auth state changes
  onAuthStateChanged(getAuth(), authStateObserver);
}

initFireBaseAuth();

async function addFolder(userToken, folderName, customFolder) {
  try {
    const docRef = await addDoc(
      collection(db, "users", userToken, "folderCollection"),
      {
        folderName,
        customFolder,
        timestamp: serverTimestamp(),
      }
    );
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.log(`Error adding folder: ${e}`);
  }
}

async function addCustomFolder(folderName) {
  // function for adding custom folder for useage outside the module
  try {
    const docRef = await addDoc(
      collection(db, "users", userUID, "folderCollection"),
      {
        folderName,
        customFolder: true,
        timestamp: serverTimestamp(),
      }
    );
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.log(`Error adding folder: ${e}`);
  }
}

async function deleteCustomFolder(folderName) {
  // function for adding custom folder for useage outside the module
  try {
    const docRef = await addDoc(
      collection(db, "users", userUID, "folderCollection"),
      {
        folderName,
        customFolder: true,
        timestamp: serverTimestamp(),
      }
    );
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.log(`Error adding folder: ${e}`);
  }
}

async function initUser(userToken) {
  // add an entry for a new user and initialize default folders

  try {
    // check if user already exists
    const docRef = doc(db, "users", userToken);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log(`user ${userToken} already exists`);
      return;
    }

    const Doc = await addDoc(
      collection(db, "users", userToken, "taskCollection"),
      {
        skip: true,
      }
    );
    console.log("Document written with ID: ", Doc.id);

    // if user doesn't exist add a new user
    await setDoc(doc(db, "users", userToken), {});
    await addFolder(userToken, "Inbox", false);
    await addFolder(userToken, "Urgent", false);
    await addFolder(userToken, "Someday", false);
    await addFolder(userToken, "Logbook", false);
    await addFolder(userToken, "Trash", false);

    console.log("user added successfully");
  } catch (e) {
    console.log("Error: ", e);
  }
}

async function addTask(task) {
  try {
    // eslint-disable-next-line no-param-reassign
    task.timestamp = serverTimestamp(); // add server timestamp to the task
    const docRef = await addDoc(
      collection(db, "users", userUID, "taskCollection"),
      task
    );
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.log(`addTask error: ${error}`);
  }
}

async function updateDataFromBackend() {
  try {
    // get sorted list of tasks
    const taskCollectionRef = collection(
      db,
      "users",
      userUID,
      "taskCollection"
    );
    const taskCollectionSnapshop = await getDocs(
      query(taskCollectionRef, orderBy("timestamp"))
    );

    const todoArray = [];
    taskCollectionSnapshop.forEach((entryDocument) => {
      const entryObj = entryDocument.data();
      if (entryObj.skip !== true) {
        // eslint-disable-next-line new-cap
        const newTodo = new todoEntry(
          entryObj.title,
          entryObj.description,
          entryObj.priority,
          entryObj.deadline,
          entryDocument.id
        );
        todoArray.push(newTodo);
      }
    });

    // get sorted list of user-made folders
    const folderCollectionRef = collection(
      db,
      "users",
      userUID,
      "folderCollection"
    );
    const folderCollectionRefSnapshot = await getDocs(
      query(folderCollectionRef, orderBy("timestamp"))
    );

    const folderArray = [];
    folderCollectionRefSnapshot.forEach((entryDocument) => {
      const folderObj = entryDocument.data();
      if (folderObj.customFolder === true) {
        folderArray.push(folderObj.folderName);
      }
    });
    console.log(folderArray);
    todoManager.setTodoArray(todoArray);
    todoManager.setUserFolderArray(folderArray);
    refreshUi();
    displayUserFolders();
  } catch (e) {
    console.log(`initUserData() error: ${e}`);
  }
}

// changes a task's folder to 'newFolder' with a given 'taskId'
async function changeTaskFolder(taskId, newFolder) {
  try {
    const taskRef = doc(db, "users", userUID, "taskCollection", taskId);
    setDoc(taskRef, { priority: newFolder }, { merge: true });
  } catch (e) {
    console.log(`changeTaskFolderError: ${e}`);
  }
}

async function editTask(newTask, taskId) {
  try {
    const taskRef = doc(db, "users", userUID, "taskCollection", taskId);
    
    // retrieve timestamp and assign to the newTask
    const taskSnap = await getDoc(taskRef);
    // eslint-disable-next-line no-param-reassign
    newTask.timestamp = taskSnap.data().timestamp;

    setDoc(taskRef, newTask);
  } catch (e) {
    console.log(`changeTaskFolderError: ${e}`);
  }
}

export { signInUser, signOutUser, db, addTask, addCustomFolder, changeTaskFolder, editTask };
