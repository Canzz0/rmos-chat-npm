import { useEffect, useMemo, useState } from "react";
import { useChatContext } from "../context/useChatContext";
import { subscribeConversations } from "../firebase/conversations";
import type { ChatConversation } from "../types";

export interface UseConversationsResult {
  /** conversationId → özet */
  conversations: Record<string, ChatConversation>;
  /** Okunmamış mesajı olan sohbet sayısı */
  unreadConversations: number;
  /** Toplam okunmamış mesaj sayısı */
  totalUnread: number;
  loading: boolean;
  error: Error | null;
}

/**
 * Mevcut kullanıcının konuşma özetlerini (son mesaj + okunmamış sayısı)
 * Firebase Firestore üzerinden gerçek zamanlı dinler.
 */
export function useConversations(): UseConversationsResult {
  const { firestore, firebaseReady, firebaseError, userId } = useChatContext();
  const [list, setList] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
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

    const unsub = subscribeConversations(
      firestore,
      userId,
      (next) => {
        setList(next);
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
  }, [firestore, firebaseReady, firebaseError, userId]);

  return useMemo(() => {
    const conversations: Record<string, ChatConversation> = {};
    let unreadConversations = 0;
    let totalUnread = 0;
    for (const c of list) {
      conversations[c.id] = c;
      if (c.unreadCount > 0) {
        unreadConversations += 1;
        totalUnread += c.unreadCount;
      }
    }
    return { conversations, unreadConversations, totalUnread, loading, error };
  }, [list, loading, error]);
}
