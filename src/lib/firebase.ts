// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC7VrvHdnojLN-6qSRyjlmo7Wz9VzR-Ygc",
  authDomain: "tech-hiem.firebaseapp.com",
  projectId: "tech-hiem",
  storageBucket: "tech-hiem.appspot.com",
  messagingSenderId: "871814162415",
  appId: "1:871814162415:web:4a69155039eedaab03381a",
  measurementId: "G-H4Z04PFCCJ",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
