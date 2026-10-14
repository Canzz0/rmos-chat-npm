import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import type { ChatMessage } from "../types";
import { touchConversationOnSend } from "./conversations";

function messagesCol(db: Firestore, conversationId: string) {
  return collection(db, "conversations", conversationId, "messages");
}

function mapDoc(conversationId: string, id: string, data: Record<string, unknown>): ChatMessage {
  const createdAtRaw = data.createdAt as { toMillis?: () => number } | number | undefined;
  let createdAt = 0;
  if (typeof createdAtRaw === "number") createdAt = createdAtRaw;
  else if (createdAtRaw && typeof createdAtRaw.toMillis === "function") {
    createdAt = createdAtRaw.toMillis();
  }

  return {
    id,
    conversationId,
    senderId: String(data.senderId ?? ""),
    text: String(data.text ?? ""),
    createdAt,
    status: (data.status as ChatMessage["status"]) ?? "sent",
  };
}

/** Konuşmadaki mesajları gerçek zamanlı dinler (yeniden eskiye değil, eskiden yeniye). */
export function subscribeMessages(
  db: Firestore,
  conversationId: string,
  onChange: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(messagesCol(db, conversationId), orderBy("createdAt", "asc"));

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) =>
        mapDoc(conversationId, d.id, d.data() as Record<string, unknown>),
      );
      onChange(list);
    },
    (err) => {
      onError?.(err);
    },
  );
}

export async function sendMessage(
  db: Firestore,
  conversationId: string,
  senderId: string,
  text: string,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Mesaj boş olamaz.");

  const ref = await addDoc(messagesCol(db, conversationId), {
    senderId,
    text: trimmed,
    createdAt: serverTimestamp(),
    status: "sent",
  });

  // Konuşma özeti (son mesaj + okunmamış sayacı). Başarısız olsa da mesaj gönderilmiş sayılır.
  try {
    await touchConversationOnSend(db, conversationId, senderId, trimmed);
  } catch (err) {
    console.warn("[rmos-chat] Konuşma özeti güncellenemedi:", err);
  }

  return ref.id;
}
