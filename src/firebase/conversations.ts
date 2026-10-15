import {
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
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
 *   readAt: { [userId]: Timestamp }  — okundu bilgisi (tik) için
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
  const readAtRaw = (data.readAt ?? {}) as Record<string, unknown>;
  const readAt: Record<string, number> = {};
  for (const [uid, ts] of Object.entries(readAtRaw)) readAt[uid] = toMillis(ts);

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
    readAt,
  };
}

/**
 * Verilen konuşma dokümanlarını tek tek gerçek zamanlı dinler.
 * (Koleksiyon sorgusu yerine doküman bazlı dinleme — Firestore kuralları
 * yalnızca tekil doküman okumaya izin verse de çalışır.)
 * Henüz olmayan konuşmalar listede yer almaz.
 */
export function subscribeConversationDocs(
  db: Firestore,
  conversationIds: string[],
  userId: string,
  onChange: (conversations: ChatConversation[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const byId = new Map<string, ChatConversation | null>();

  const emit = () => {
    // Tüm dokümanların ilk snapshot'ı gelmeden yayınlama → tek seferde dolu liste
    if (byId.size < conversationIds.length) return;
    const list: ChatConversation[] = [];
    for (const c of byId.values()) if (c) list.push(c);
    onChange(list);
  };

  if (conversationIds.length === 0) onChange([]);

  const unsubs = conversationIds.map((id) =>
    onSnapshot(
      conversationDoc(db, id),
      (snap) => {
        byId.set(
          id,
          snap.exists()
            ? mapConversation(
                id,
                // Bekleyen serverTimestamp için tahmini değer → sıralama anında doğru olur
                snap.data({ serverTimestamps: "estimate" }) as Record<string, unknown>,
                userId,
              )
            : null,
        );
        emit();
      },
      (err) => {
        byId.set(id, null);
        onError?.(err);
        emit();
      },
    ),
  );

  return () => {
    for (const u of unsubs) u();
  };
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

/**
 * Düzenleme/silme sonrası konuşma özetini günceller.
 * - `lastText` verilirse son mesaj önizlemesi değişir (düzenlenen/silinen mesaj sonuncuysa).
 * - `bumpUnread` ise alıcının okunmamış sayacı artar; düzenlenen mesaj daha önce
 *   okunmuşsa yeniden "okunmadı" olur ve alıcı açınca okundu bilgisi tazelenir.
 */
export async function touchConversationOnChange(
  db: Firestore,
  conversationId: string,
  senderId: string,
  { lastText, bumpUnread }: { lastText?: string; bumpUnread?: boolean },
): Promise<void> {
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (lastText !== undefined) data.lastMessage = { text: lastText };

  if (bumpUnread) {
    const unread: Record<string, unknown> = {};
    for (const p of parseDirectConversationId(conversationId) ?? []) {
      if (p !== senderId) unread[p] = increment(1);
    }
    data.unread = unread;
  }

  await setDoc(conversationDoc(db, conversationId), data, { merge: true });
}

/** Kullanıcının okunmamış sayacını sıfırlar ve okuma zamanını (readAt) yazar. */
export async function markConversationRead(
  db: Firestore,
  conversationId: string,
  userId: string,
): Promise<void> {
  await setDoc(
    conversationDoc(db, conversationId),
    { unread: { [userId]: 0 }, readAt: { [userId]: serverTimestamp() } },
    { merge: true },
  );
}
