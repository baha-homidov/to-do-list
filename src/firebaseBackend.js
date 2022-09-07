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
} from "firebase/firestore";
// required libraries for firestore auth
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
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
  refreshUi();
  const auth = getAuth();
  const user = auth.currentUser;
  initUser(user.uid);
  updateDataFromBackend();
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
    refreshUi();
  }
}

function initFireBaseAuth() {
  // Listen to auth state changes
  onAuthStateChanged(getAuth(), authStateObserver);
}

initFireBaseAuth();

async function addFolder(userToken, folderName) {
  try {
    const docRef = await addDoc(
      collection(db, "users", userToken, "folderCollection"),
      {
        folderName,
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
        skip: true
      }
    );
    console.log("Document written with ID: ", Doc.id);

    // if user doesn't exist add a new user
    await setDoc(doc(db, "users", userToken), {});
    await addFolder(userToken, "Inbox");
    await addFolder(userToken, "Urgent");
    await addFolder(userToken, "Someday");
    await addFolder(userToken, "Logbook");
    await addFolder(userToken, "Trash");
    
    console.log("user added successfully");
  } catch (e) {
    console.log("Error: ", e);
  }
}

async function addTask(task) {
  try {
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
    console.log(userUID);
    const querySnapshot = await getDocs(
      collection(db, "users", userUID, "taskCollection")
    );

    const todoArray = [];
    querySnapshot.forEach((entryDocument) => {
      const entryObj = entryDocument.data();
      if (entryObj.skip !== true) {
        // eslint-disable-next-line new-cap
        const newTodo = new todoEntry(entryObj.title, entryObj.description, entryObj.priority, entryObj.deadline, entryDocument.id);
        todoArray.push(newTodo);
        todoManager.setTodoArray(todoArray);
        refreshUi();
      }
    });
  } catch (e) {
    console.log(`initUserData() error: ${e}`);
  }
}




export { signInUser, signOutUser, db, addTask };

// async function addData() {
//   try {
//     const docRef = await addDoc(collection(db, "users"), {
//       first: "Ada",
//       last: "Lovelace",
//       born: 1815,
//     });
//     console.log("Document written with ID: ", docRef.id);
//   } catch (e) {
//     console.error("Error adding document: ", e);
//   }
// }
