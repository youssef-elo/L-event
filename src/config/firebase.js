// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase config - Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuYDyImq0UDgGfGvtd8hz7SsiqUaWmgSQ",
  authDomain: "levent-7fe55.firebaseapp.com",
  projectId: "levent-7fe55",
  storageBucket: "levent-7fe55.firebasestorage.app",
  messagingSenderId: "947687421848",
  appId: "1:947687421848:web:2924e13d9c7d11773a1ded"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
