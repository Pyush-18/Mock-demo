import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDL1ybB_PtQBL1FVenx880FfAxiZ7eSRj4",
  authDomain: "mock-app-c939e.firebaseapp.com",
  projectId: "mock-app-c939e",
  storageBucket: "mock-app-c939e.firebasestorage.app",
  messagingSenderId: "177689919902",
  appId: "1:177689919902:web:6d365a050264be0260968f",
  measurementId: "G-4XN79LWZFZ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
