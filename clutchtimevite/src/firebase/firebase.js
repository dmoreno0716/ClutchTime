import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBs1rw4tfcC3Q4ECE1mcf-Xzmb0fkm1-bw",
  authDomain: "clutchtime-3b462.firebaseapp.com",
  projectId: "clutchtime-3b462",
  storageBucket: "clutchtime-3b462.appspot.com",
  messagingSenderId: "415004825907",
  appId: "1:415004825907:web:386aec03a67cf1e8374646",
  measurementId: "G-D056RGDC3G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };