import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyDUPlJt19LxV2X0-GgZ0ayTkAePJEaMR4k",
  authDomain: "healjaimini.firebaseapp.com",
  projectId: "healjaimini",
  storageBucket: "healjaimini.firebasestorage.app",
  messagingSenderId: "372949320807",
  appId: "1:372949320807:web:a99f595098e22f28d800c2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };