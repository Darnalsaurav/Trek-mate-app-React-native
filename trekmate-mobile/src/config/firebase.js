// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAgwYZLky2A-1EhhiXSKcbmgtC-6tSr7Gw",
    authDomain: "database-for-trekmate-project.firebaseapp.com",
    projectId: "database-for-trekmate-project",
    storageBucket: "database-for-trekmate-project.firebasestorage.app",
    messagingSenderId: "781500331198",
    appId: "1:781500331198:android:8c56b0ada96836282a5aef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);
