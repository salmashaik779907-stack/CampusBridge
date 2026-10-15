
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7n9hdhoTwmBnbuSZPwYlVbZMP9zB2XS4",
  authDomain: "campusbridge-69bde.firebaseapp.com",
  projectId: "campusbridge-69bde",
  storageBucket: "campusbridge-69bde.firebasestorage.app",
  messagingSenderId: "788969472053",
  appId: "1:788969472053:web:d7280103f925a88bb0317c",
  measurementId: "G-XGXELNQJ8M",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
