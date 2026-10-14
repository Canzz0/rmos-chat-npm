import { useCallback, useState } from "react";
import { useChatContext } from "../context/useChatContext";
import { sendMessage } from "../firebase/messages";

export interface UseSendMessageResult {
  send: (conversationId: string, text: string) => Promise<string>;
  loading: boolean;
  error: Error | null;
}

/**
 * Mesajı Firebase Firestore'a yazar.
 * Gönderen userId context'ten alınır; baseUrl kullanılmaz.
 */
export function useSendMessage(): UseSendMessageResult {
  const { firestore, firebaseReady, userId } = useChatContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = useCallback(
    async (conversationId: string, text: string): Promise<string> => {
      if (!firebaseReady || !firestore) {
        throw new Error("Firebase henüz hazır değil.");
      }

      setLoading(true);
      setError(null);

      try {
        const id = await sendMessage(firestore, conversationId, userId, text);
        setLoading(false);
        return id;
      } catch (err: unknown) {
        const next = err instanceof Error ? err : new Error(String(err));
        setError(next);
        setLoading(false);
        throw next;
      }
    },
    [firestore, firebaseReady, userId],
  );

  return { send, loading, error };
}
