// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCnohb8DSgLPvAlwM8BZOy4rm5N9TKoX0I",
  authDomain: "smart-expense-tracker-c6913.firebaseapp.com",
  projectId: "smart-expense-tracker-c6913",
  storageBucket: "smart-expense-tracker-c6913.firebasestorage.app",
  messagingSenderId: "675472125526",
  appId: "1:675472125526:web:935b8a0f49638892b9d5f7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
