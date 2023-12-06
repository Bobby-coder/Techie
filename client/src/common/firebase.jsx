/* eslint-disable no-unused-vars */
import { initializeApp } from "firebase/app";
import { signInWithPopup, GoogleAuthProvider, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCLrDR-dAJTh-h6Y3MjaaAbDvqfd6qRzMs",
  authDomain: "techie-612.firebaseapp.com",
  projectId: "techie-612",
  storageBucket: "techie-612.appspot.com",
  messagingSenderId: "9867215771",
  appId: "1:9867215771:web:4387804b4af2d0fa81173e",
  measurementId: "G-NWZ9S21TH1",
};

const app = initializeApp(firebaseConfig);

// Google Auth

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;

  try {
    const result = await signInWithPopup(auth, provider);
    user = result.user;
  } catch (error) {
    console.log(error);
  }

  return user;
};
