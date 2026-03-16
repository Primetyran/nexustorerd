import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDfvUyRnrAJieSGh5wCDAI6ZA1bCjsItFY",
  authDomain: "nexustorerd-ad42e.firebaseapp.com",
  projectId: "nexustorerd-ad42e",
  storageBucket: "nexustorerd-ad42e.firebasestorage.app",
  messagingSenderId: "632583329505",
  appId: "1:632583329505:web:afaf866fd2623aebd909a0",
  measurementId: "G-ZW4FHS8VST"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
