import {
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import { parseDirectConversationId } from "../conversation";
import type { ChatConversation } from "../types";

/**
 * Konuşma özet dokümanı: conversations/{conversationId}
 *   participants: string[]
 *   lastMessage: { text, senderId, createdAt }
 *   updatedAt: Timestamp
 *   unread: { [userId]: number }
 */
function conversationDoc(db: Firestore, conversationId: string) {
  return doc(db, "conversations", conversationId);
}

function toMillis(raw: unknown): number {
  if (typeof raw === "number") return raw;
  const ts = raw as { toMillis?: () => number } | null | undefined;
  return ts && typeof ts.toMillis === "function" ? ts.toMillis() : 0;
}

function mapConversation(
  id: string,
  data: Record<string, unknown>,
  userId: string,
): ChatConversation {
  const last = data.lastMessage as Record<string, unknown> | undefined;
  const unread = (data.unread ?? {}) as Record<string, unknown>;
  const count = Number(unread[userId] ?? 0);

  return {
    id,
    participants: Array.isArray(data.participants)
      ? data.participants.map(String)
      : [],
    lastMessage: last
      ? {
          text: String(last.text ?? ""),
          senderId: String(last.senderId ?? ""),
          createdAt: toMillis(last.createdAt),
        }
      : null,
    unreadCount: Number.isFinite(count) && count > 0 ? count : 0,
  };
}

/** Kullanıcının dahil olduğu konuşmaların özetlerini gerçek zamanlı dinler. */
export function subscribeConversations(
  db: Firestore,
  userId: string,
  onChange: (conversations: ChatConversation[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId),
  );

  return onSnapshot(
    q,
    (snap) => {
      onChange(
        snap.docs.map((d) =>
          mapConversation(
            d.id,
            // Bekleyen serverTimestamp için tahmini değer → sıralama anında doğru olur
            d.data({ serverTimestamps: "estimate" }) as Record<string, unknown>,
            userId,
          ),
        ),
      );
    },
    (err) => {
      onError?.(err);
    },
  );
}

/** Mesaj gönderildiğinde son mesajı yazar ve alıcının okunmamış sayacını artırır. */
export async function touchConversationOnSend(
  db: Firestore,
  conversationId: string,
  senderId: string,
  text: string,
): Promise<void> {
  const participants = parseDirectConversationId(conversationId);
  const unread: Record<string, unknown> = {};
  if (participants) {
    for (const p of participants) {
      if (p !== senderId) unread[p] = increment(1);
    }
  }

  await setDoc(
    conversationDoc(db, conversationId),
    {
      ...(participants ? { participants } : {}),
      lastMessage: { text, senderId, createdAt: serverTimestamp() },
      updatedAt: serverTimestamp(),
      unread,
    },
    { merge: true },
  );
}

/** Kullanıcının bu konuşmadaki okunmamış sayacını sıfırlar. */
export async function markConversationRead(
  db: Firestore,
  conversationId: string,
  userId: string,
): Promise<void> {
  await setDoc(
    conversationDoc(db, conversationId),
    { unread: { [userId]: 0 } },
    { merge: true },
  );
}
