import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC45rGbVeba1iNfRkfFixB35ULJR_tpbsI",
    authDomain: "vegaart-d14b4.firebaseapp.com",
    projectId: "vegaart-d14b4",
    storageBucket: "vegaart-d14b4.appspot.com",
    messagingSenderId: "1090980503781",
    appId: "1:1090980503781:web:be3d0c7a3775cd1949f40c",
    measurementId: "G-E3B68G3Y9H"
};

let app;
try {
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully");
    } else {
        app = getApps()[0];
        console.log("Firebase app already exists");
    }
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

export const auth = getAuth(app);
export const db = getFirestore(app);