import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import {
  DEFAULT_BASE_URL,
  DEFAULT_FIREBASE_CONFIG,
  DEFAULT_FIREBASE_TOKEN_PATH,
  DEFAULT_USERS_PATH,
} from "../defaults";
import { getOrInitFirebase } from "../firebase/app";
import { signInWithFirebaseToken } from "../firebase/auth";
import { request } from "../http/client";
import { ConversationsProvider } from "./ConversationsProvider";
import type {
  ChatConfig,
  ChatContextValue,
  FirebaseTokenResponse,
  FirebaseWebConfig,
} from "../types";

export const ChatContext = createContext<ChatContextValue | null>(null);

export interface ChatProviderProps extends ChatConfig {
  children: ReactNode;
}

export function ChatProvider({
  token,
  userId,
  baseUrl = DEFAULT_BASE_URL,
  firebaseConfig = DEFAULT_FIREBASE_CONFIG,
  firebaseTokenPath = DEFAULT_FIREBASE_TOKEN_PATH,
  usersPath = DEFAULT_USERS_PATH,
  children,
}: ChatProviderProps) {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const resolvedConfig: FirebaseWebConfig = firebaseConfig;

  const [firebaseReady, setFirebaseReady] = useState(false);
  const [firebaseError, setFirebaseError] = useState<Error | null>(null);
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);

  const firebaseConfigKey = [
    resolvedConfig.apiKey,
    resolvedConfig.authDomain,
    resolvedConfig.projectId,
    resolvedConfig.appId,
  ].join("|");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function connectFirebase() {
      setFirebaseReady(false);
      setFirebaseError(null);

      try {
        const handles = getOrInitFirebase(resolvedConfig);
        if (cancelled) return;

        setFirebaseApp(handles.app);
        setFirebaseAuth(handles.auth);
        setFirestore(handles.firestore);

        // baseUrl → Firebase custom JWT (mesajlaşma için; REST sadece burada)
        // GET /api/Firebase/GetFirebaseToken — Authorization: Bearer {token}
        const tokenRes = await request<FirebaseTokenResponse>(
          normalizedBase,
          token,
          firebaseTokenPath,
          {
            method: "GET",
            signal: controller.signal,
          },
        );

        if (cancelled) return;
        if (!tokenRes?.token) {
          throw new Error(
            `Firebase JWT yanıtında token yok. API yanıtı: ${JSON.stringify(tokenRes)}`,
          );
        }

        await signInWithFirebaseToken(handles.auth, tokenRes.token);
        if (cancelled) return;

        setFirebaseReady(true);
      } catch (err: unknown) {
        if (cancelled || controller.signal.aborted) return;
        setFirebaseError(
          err instanceof Error ? err : new Error(String(err)),
        );
        setFirebaseReady(false);
      }
    }

    void connectFirebase();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // resolvedConfig alanları firebaseConfigKey ile izlenir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedBase, token, userId, firebaseTokenPath, firebaseConfigKey]);

  const value = useMemo<ChatContextValue>(
    () => ({
      token,
      userId,
      baseUrl: normalizedBase,
      firebaseConfig: resolvedConfig,
      firebaseTokenPath,
      usersPath,
      firebaseReady,
      firebaseError,
      firebaseApp,
      firebaseAuth,
      firestore,
    }),
    [
      token,
      userId,
      normalizedBase,
      resolvedConfig,
      firebaseTokenPath,
      usersPath,
      firebaseReady,
      firebaseError,
      firebaseApp,
      firebaseAuth,
      firestore,
    ],
  );

  return (
    <ChatContext.Provider value={value}>
      <ConversationsProvider>{children}</ConversationsProvider>
    </ChatContext.Provider>
  );
}
