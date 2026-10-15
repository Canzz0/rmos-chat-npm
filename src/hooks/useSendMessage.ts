import { useCallback, useState } from "react";
import type { Firestore } from "firebase/firestore";
import { useChatContext } from "../context/useChatContext";
import {
  deleteMessage,
  editMessage,
  sendMessage,
  type ChangeMessageOptions,
} from "../firebase/messages";

export interface UseSendMessageResult {
  send: (conversationId: string, text: string) => Promise<string>;
  /** Kendi gönderdiğin mesajı düzenler (okundu bilgisi sıfırlanır). */
  edit: (
    conversationId: string,
    messageId: string,
    text: string,
    options?: ChangeMessageOptions,
  ) => Promise<void>;
  /** Kendi gönderdiğin mesajı herkes için siler. */
  remove: (
    conversationId: string,
    messageId: string,
    options?: Pick<ChangeMessageOptions, "isLast">,
  ) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

/**
 * Mesajı Firebase Firestore'a yazar, düzenler ve siler.
 * Gönderen userId context'ten alınır; baseUrl kullanılmaz.
 */
export function useSendMessage(): UseSendMessageResult {
  const { firestore, firebaseReady, userId } = useChatContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(
    async <T>(fn: (db: Firestore) => Promise<T>): Promise<T> => {
      if (!firebaseReady || !firestore) {
        throw new Error("Firebase henüz hazır değil.");
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fn(firestore);
        setLoading(false);
        return result;
      } catch (err: unknown) {
        const next = err instanceof Error ? err : new Error(String(err));
        setError(next);
        setLoading(false);
        throw next;
      }
    },
    [firestore, firebaseReady],
  );

  const send = useCallback(
    (conversationId: string, text: string) =>
      run((db) => sendMessage(db, conversationId, userId, text)),
    [run, userId],
  );

  const edit = useCallback(
    (
      conversationId: string,
      messageId: string,
      text: string,
      options?: ChangeMessageOptions,
    ) => run((db) => editMessage(db, conversationId, messageId, userId, text, options)),
    [run, userId],
  );

  const remove = useCallback(
    (
      conversationId: string,
      messageId: string,
      options?: Pick<ChangeMessageOptions, "isLast">,
    ) => run((db) => deleteMessage(db, conversationId, messageId, userId, options)),
    [run, userId],
  );

  return { send, edit, remove, loading, error };
}
