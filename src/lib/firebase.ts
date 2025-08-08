// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMHnI0IsSaMKehzbVLRm-1KmL8iIdwkk8",
  authDomain: "cineassist-knotb.firebaseapp.com",
  projectId: "cineassist-knotb",
  storageBucket: "cineassist-knotb.firebasestorage.app",
  messagingSenderId: "1041433213591",
  appId: "1:1041433213591:web:428754d08842988c8e87d2"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export { db, app };
