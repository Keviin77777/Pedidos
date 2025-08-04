
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "cineassist-knotb",
  "appId": "1:1041433213591:web:428754d08842988c8e87d2",
  "storageBucket": "cineassist-knotb.appspot.com",
  "apiKey": "AIzaSyAMHnI0IsSaMKehzbVLRm-1KmL8iIdwkk8",
  "authDomain": "cineassist-knotb.firebaseapp.com",
  "measurementId": "G-5G152F942B",
  "messagingSenderId": "1041433213591"
};


// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export { db };
