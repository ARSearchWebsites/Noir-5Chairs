// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "@firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCr-3gAyIt9gWDoItwzv4zBlbjuDp_XP_Q",
  authDomain: "project-noir-896cc.firebaseapp.com",
  projectId: "project-noir-896cc",
  storageBucket: "project-noir-896cc.firebasestorage.app",
  messagingSenderId: "607413888485",
  appId: "1:607413888485:web:1e4fa368bb74747b827b0c",
  measurementId: "G-EHYDTM3D2J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
//const analytics = getAnalytics(app);

