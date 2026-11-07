
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA8GIorcZQ1jfhyiE04SlQi-zMqneAnO1A",
  authDomain: "zenvora-58e99.firebaseapp.com",
  projectId: "zenvora-58e99",
  storageBucket: "zenvora-58e99.firebasestorage.app",
  messagingSenderId: "605128913206",
  appId: "1:605128913206:web:3ffc4db493f514a83b8397"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
