// Firebase client configuration
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDYXHIfb5T574P5CWyPfb-BQ1WnWJiYbic",
  authDomain: "linguanewes.firebaseapp.com",
  projectId: "linguanewes",
  storageBucket: "linguanewes.firebasestorage.app",
  messagingSenderId: "414257249045",
  appId: "1:414257249045:web:17ad5d90d62d3ad831871c"
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

