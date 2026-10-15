import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, inMemoryPersistence, initializeAuth, type Auth } from "firebase/auth";
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
    // Oturum yalnızca bu sekmenin belleğinde tutulur. Varsayılan (IndexedDB)
    // kalıcılık aynı origin'deki tüm sekmelerde paylaşılır: başka sekmede farklı
    // kullanıcıyla giriş yapılınca bu sekmenin Firebase kullanıcısı da değişir,
    // yazmalar yanlış uid ile gider. Token her açılışta zaten yeniden alınıyor.
    auth: existing ? getAuth(app) : initializeAuth(app, { persistence: inMemoryPersistence }),
    firestore: getFirestore(app),
  };
}
