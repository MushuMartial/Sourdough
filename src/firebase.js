import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDSg3j8_KWWaJ8pW5PnEbgiM5cBMuSGDHI",
  authDomain: "sourdough-mushubinks.firebaseapp.com",
  projectId: "sourdough-mushubinks",
  storageBucket: "sourdough-mushubinks.firebasestorage.app",
  messagingSenderId: "541712514205",
  appId: "1:541712514205:web:b1d5ec9fb886c214106874",
  measurementId: "G-TDFSKX4L90"
};

const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };
