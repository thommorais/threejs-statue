// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDw5A4Tbe8Snf83yq9_UesBvqvRd-hLbAM",
    authDomain: "fantastic-threejs.firebaseapp.com",
    projectId: "fantastic-threejs",
    storageBucket: "fantastic-threejs.appspot.com",
    messagingSenderId: "64457075109",
    appId: "1:64457075109:web:95320d92291991f342a04c",
    measurementId: "G-CVGVDRXYJX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth();

export { auth };
export default app
