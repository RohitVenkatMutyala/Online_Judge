
import { initializeApp } from "firebase/app";
import { getFirestore}  from "firebase/firestore"
const firebaseConfig = {
  apiKey: "AIzaSyBCB9pJEAk3llyjmH5fKQurOjN3GgQh4wA",
  authDomain: "onlinejudge-2f1f7.firebaseapp.com",
  projectId: "onlinejudge-2f1f7",
  storageBucket: "onlinejudge-2f1f7.firebasestorage.app",
  messagingSenderId: "601894735466",
  appId: "1:601894735466:web:a6cfa47956418d06604413"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
export { db};