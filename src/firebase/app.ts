import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import type { FirebaseWebConfig } from "../types";

const APP_NAME = "rmos-chat-widget";

export interface FirebaseHandles {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function getOrInitFirebase(config: FirebaseWebConfig): FirebaseHandles {
  const existing = getApps().find((a) => a.name === APP_NAME);
  const app = existing ?? initializeApp(config, APP_NAME);

  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
