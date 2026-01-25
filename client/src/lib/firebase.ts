import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log('Environment variables available:', Object.keys(import.meta.env));
console.log('Firebase Config API Key present:', !!firebaseConfig.apiKey);
if (!firebaseConfig.apiKey) {
  console.error('Firebase API Key is missing! Check environment variables.');
  console.log('Full Env Object (redacted):', Object.keys(import.meta.env).reduce((acc: any, key) => {
    acc[key] = key.includes('KEY') || key.includes('ID') ? '***' : import.meta.env[key];
    return acc;
  }, {}));
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Initialize Firebase Cloud Messaging (only if supported)
let messaging: any = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});
export { messaging };

export default app;
