import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { browser } from '$app/env';

const firebaseConfig = {
  apiKey: "AIzaSyDQcbr4SLpZj5bP7zn84_vK1fzbkuxjG_k",
  authDomain: "chat-app-9ff7a.firebaseapp.com",
  projectId: "chat-app-9ff7a",
  storageBucket: "chat-app-9ff7a.appspot.com",
  messagingSenderId: "870524125509",
  appId: "1:870524125509:web:8d3cfb6c72a3f3aadb7e2c",
};

browser && initializeApp(firebaseConfig)

const auth = browser && getAuth()
const db = browser && getFirestore()
const storage = browser && getStorage()
 

export { auth, db, storage }
