// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-tf3X4plkjIovtD59phQ7O_4aUTDisCo",
  authDomain: "forarch-399d6.firebaseapp.com",
  projectId: "forarch-399d6",
  storageBucket: "forarch-399d6.firebasestorage.app",
  messagingSenderId: "830099239510",
  appId: "1:830099239510:web:31c6090cc0cb60f9adc1f7",
  measurementId: "G-SR5VBYJK68"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
