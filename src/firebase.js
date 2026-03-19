import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCeaJjnz5qNEmddQoOpsQMGAnAosNUeAWw",
  authDomain: "typing-game-d2542.firebaseapp.com",
  projectId: "typing-game-d2542",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);