// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQSc-BsOn4Ue9sjnUCPiQKZL6xx8NGF7M",
  authDomain: "web-quan-li-xuong.firebaseapp.com",
  projectId: "web-quan-li-xuong",
  storageBucket: "web-quan-li-xuong.firebasestorage.app",
  messagingSenderId: "432793458184",
  appId: "1:432793458184:web:32d210cfe3754cc9e4e3bd",
  measurementId: "G-0P478RG120"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 


