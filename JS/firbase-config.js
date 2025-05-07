import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBwAQnplJsJTTb2iWcLl_-VzG_w6n3-A6o",
  authDomain: "personalfinancemanager-37aea.firebaseapp.com",
  projectId: "personalfinancemanager-37aea",
  storageBucket: "personalfinancemanager-37aea.appspot.com",
  messagingSenderId: "4364494376",
  appId: "1:4364494376:web:c6b2da053c5e4bbe0bb71d",
  measurementId: "G-Q8TPD82RWE",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

