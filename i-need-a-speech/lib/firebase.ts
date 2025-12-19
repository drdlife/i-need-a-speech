import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: REPLACE THIS WITH YOUR OWN FIREBASE CONFIGURATION
// Get this from: https://console.firebase.google.com/ -> Project Settings
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
// We wrap this in a try-catch to prevent the app from crashing if config is missing during development
let app;
let auth;
let db;
let googleProvider;

try {
  // Check if config is actually replaced
  if (firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } else {
    console.warn("Firebase not configured. Please update lib/firebase.ts");
  }
} catch (e) {
  console.error("Firebase initialization error", e);
}

export { auth, db, googleProvider };
