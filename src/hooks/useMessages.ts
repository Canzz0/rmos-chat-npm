import { useEffect, useState } from "react";
import { useChatContext } from "../context/useChatContext";
import { subscribeMessages } from "../firebase/messages";
import type { ChatMessage } from "../types";

export interface UseMessagesResult {
  messages: ChatMessage[];
  loading: boolean;
  error: Error | null;
}

/**
 * Bir konuşmanın mesajlarını Firebase Firestore üzerinden gerçek zamanlı dinler.
 * baseUrl kullanılmaz.
 */
export function useMessages(conversationId: string | null): UseMessagesResult {
  const { firestore, firebaseReady, firebaseError } = useChatContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(Boolean(conversationId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (firebaseError) {
      setError(firebaseError);
      setLoading(false);
      return;
    }

    if (!firebaseReady || !firestore) {
      setLoading(true);
      return;
    }

    setLoading(true);
    setError(null);

    const unsub = subscribeMessages(
      firestore,
      conversationId,
      (list) => {
        setMessages(list);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => {
      unsub();
    };
  }, [conversationId, firestore, firebaseReady, firebaseError]);

  return { messages, loading, error };
}
