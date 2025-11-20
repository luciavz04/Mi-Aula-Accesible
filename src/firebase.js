import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBen-3ThX63DlCtu-rd8UcXO38e7F6NBP0",
  authDomain: "eduadapt-188ea.firebaseapp.com",
  projectId: "eduadapt-188ea",
  storageBucket: "eduadapt-188ea.appspot.com",
  messagingSenderId: "330443351599",
  appId: "1:330443351599:web:8fb03e189d39929291c8da",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
