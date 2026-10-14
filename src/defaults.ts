import type { FirebaseWebConfig } from "./types";

/**
 * Paket içi varsayılanlar.
 * REST uçları yalnızca kullanıcı listesi + Firebase custom JWT içindir;
 * mesajlaşma Firebase Firestore üzerinden yürür.
 */

export const DEFAULT_BASE_URL = "https://dev-generalapis.rmosweb.com";
export const DEFAULT_USERS_PATH = "/api/Users/GetUsersBySirket";
export const DEFAULT_FIREBASE_TOKEN_PATH = "/api/Firebase/GetFirebaseToken";

/** Paket içi varsayılan Firebase projesi (rmos-npm-chat) */
export const DEFAULT_FIREBASE_CONFIG: FirebaseWebConfig = {
  apiKey: "AIzaSyA1k_DxaCtI51RDIDAwAV496D8ZbvqB-g4",
  authDomain: "rmos-npm-chat.firebaseapp.com",
  projectId: "rmos-npm-chat",
  storageBucket: "rmos-npm-chat.firebasestorage.app",
  messagingSenderId: "1087126841990",
  appId: "1:1087126841990:web:8bb549d26450707fe23f07",
};
