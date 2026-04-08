// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaehx_gf0BJTd1Vjksg2GWoAZiu6r7QOQ",
  authDomain: "calendas-6d477.firebaseapp.com",
  databaseURL: "https://calendas-6d477-default-rtdb.firebaseio.com",
  projectId: "calendas-6d477",
  storageBucket: "calendas-6d477.firebasestorage.app",
  messagingSenderId: "451404200393",
  appId: "1:451404200393:web:769e172abf6ab10c115018"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Realtime Database e exporta para usar nos serviços
export const db = getDatabase(app);