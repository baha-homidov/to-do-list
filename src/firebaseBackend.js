/* eslint-disable import/no-cycle */
/* eslint-disable import/no-duplicates */

/* firestore imports */
// required libraries to initialize firestore
import { initializeApp } from "firebase/app";
// required libraries for firestore
import { getFirestore, collection, addDoc } from "firebase/firestore";
// required libraries for firestore auth
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,

  signInWithPopup,
  signOut,
} from "firebase/auth";
import { updateGreeting, hideSignInButton } from "./uiManager";

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

async function signIn() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  const provider = new GoogleAuthProvider();
  await signInWithPopup(getAuth(), provider);
  hideSignInButton();
}

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
updateGreeting("Abdue");

function authStateObserver(user) {
  if (user) {
    // User is signed in!
    // Get the signed-in user's and name.
    const username = getUserName();
    updateGreeting(username);
  }
}


export { signIn, db };
