import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDicafHAUWsUHziRxaMHdyZEQzSheB16Xg",
  authDomain: "gps-tracking-87134.firebaseapp.com",
  databaseURL: "https://gps-tracking-87134-default-rtdb.firebaseio.com",
  projectId: "gps-tracking-87134",
  storageBucket: "gps-tracking-87134.firebasestorage.app",
  messagingSenderId: "1088916310538",
  appId: "1:1088916310538:web:26fd70033a3b259f37adf3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get reference to the database
export const database = getDatabase(app);
export { ref, onValue };

