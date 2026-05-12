import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
 apiKey: "AIzaSyBw4mfGHMQTW3a2or_QWGAF-b5krU8oCLQ",
  authDomain: "sanos-y-salvos-git.firebaseapp.com",
  projectId: "sanos-y-salvos-git",
  storageBucket: "sanos-y-salvos-git.firebasestorage.app",
  messagingSenderId: "661866938794",
  appId: "1:661866938794:web:30abdca850ce2a77196bd3"
};

// Inicializamos Firebase solo si no se ha inicializado ya
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Exportamos 'auth' para usarlo en el Header y páginas de Login/Registro
export const auth = getAuth(app);