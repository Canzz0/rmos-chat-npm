import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { directConversationId } from "../conversation";
import { subscribeConversationDocs } from "../firebase/conversations";
import { useChatContext } from "./useChatContext";
import { useUsers } from "../hooks/useUsers";
import type { ChatConversation } from "../types";

export interface ConversationsContextValue {
  /** conversationId → özet */
  conversations: Record<string, ChatConversation>;
  /** Okunmamış mesajı olan sohbet sayısı */
  unreadConversations: number;
  /** Toplam okunmamış mesaj sayısı */
  totalUnread: number;
  loading: boolean;
  error: Error | null;
}

export const ConversationsContext = createContext<ConversationsContextValue | null>(null);

/**
 * ChatProvider render edildiği anda kullanıcı listesini alır ve her kişiyle olan
 * konuşma özetini (son mesaj + okunmamış sayısı) gerçek zamanlı dinlemeye başlar.
 * Kartın açık olması gerekmez; buton rozeti bu sayede anında güncellenir.
 */
export function ConversationsProvider({ children }: { children: ReactNode }) {
  const { firestore, firebaseReady, firebaseError, userId } = useChatContext();
  const { users, error: usersError } = useUsers();

  const [list, setList] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Kişi listesi her refetch'te yeni dizi döner; aynı ID'lerde yeniden abone olmamak için string anahtar
  const idsKey = useMemo(() => {
    if (!users) return null;
    const ids = new Set(users.map((u) => directConversationId(userId, String(u.fldUserID))));
    return [...ids].sort().join(",");
  }, [users, userId]);

  useEffect(() => {
    if (firebaseError || usersError) {
      setError(firebaseError ?? usersError);
      setLoading(false);
      return;
    }

    if (!firebaseReady || !firestore || idsKey === null) {
      setLoading(true);
      return;
    }

    setLoading(true);
    setError(null);

    const unsub = subscribeConversationDocs(
      firestore,
      idsKey ? idsKey.split(",") : [],
      userId,
      (next) => {
        setList(next);
        setLoading(false);
      },
      (err) => {
        setError(err);
      },
    );

    return () => {
      unsub();
    };
  }, [firestore, firebaseReady, firebaseError, usersError, userId, idsKey]);

  const value = useMemo<ConversationsContextValue>(() => {
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

  return (
    <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>
  );
}
