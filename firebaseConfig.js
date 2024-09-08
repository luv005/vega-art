import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase configuration object
  apiKey: "AIzaSyC45rGbVeba1iNfRkfFixB35ULJR_tpbsI",
  authDomain: "vegaart-d14b4.firebaseapp.com",
  projectId: "vegaart-d14b4",
  storageBucket: "vegaart-d14b4.appspot.com",
  messagingSenderId: "1090980503781",
  appId: "1:1090980503781:web:be3d0c7a3775cd1949f40c",
  measurementId: "G-E3B68G3Y9H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };