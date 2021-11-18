import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you
const firebaseConfig = {
  apiKey: "AIzaSyATeRWvtCHoqVW_xshv013jMiM0bnOzyg8",
  authDomain: "ecomweb-by-om-soni.firebaseapp.com",
  projectId: "ecomweb-by-om-soni",
  storageBucket: "ecomweb-by-om-soni.appspot.com",
  messagingSenderId: "248499799016",
  appId: "1:248499799016:web:2cf9d2557b3575ea1a1a5d",
  measurementId: "G-T2R5TJDNB0"
};
// Initialize Firebase
const app=firebase.initializeApp(firebaseConfig);
const db=getFirestore(app);
const auth=firebase.auth();
const provider=new firebase.auth.GoogleAuthProvider();
const storage = getStorage(app);
export {auth,provider,storage};
export default db;