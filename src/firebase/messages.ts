import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  type Firestore,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import type { ChatMessage } from "../types";
import { touchConversationOnChange, touchConversationOnSend } from "./conversations";

/** Silinen mesajın balonda ve liste önizlemesinde görünen metni. */
export const DELETED_MESSAGE_TEXT = "Bu mesaj silindi";

function messagesCol(db: Firestore, conversationId: string) {
  return collection(db, "conversations", conversationId, "messages");
}

function toMillis(raw: unknown): number {
  if (typeof raw === "number") return raw;
  const ts = raw as { toMillis?: () => number } | null | undefined;
  return ts && typeof ts.toMillis === "function" ? ts.toMillis() : 0;
}

function mapDoc(
  conversationId: string,
  id: string,
  data: Record<string, unknown>,
  pending: boolean,
): ChatMessage {
  const editedAt = toMillis(data.editedAt);
  return {
    id,
    conversationId,
    senderId: String(data.senderId ?? ""),
    text: String(data.text ?? ""),
    createdAt: toMillis(data.createdAt),
    status: (data.status as ChatMessage["status"]) ?? "sent",
    ...(editedAt ? { editedAt } : {}),
    ...(data.deleted === true ? { deleted: true } : {}),
    ...(pending ? { pending: true } : {}),
  };
}

/** Bir mesaj sayfasının anlık görüntüsü (yeniden eskiye sıralı). */
export interface MessagePage {
  messages: ChatMessage[];
  /** Sayfadaki en eski mesajın dokümanı — bir sonraki (daha eski) sayfanın imleci */
  oldest: QueryDocumentSnapshot | null;
  /** Sayfa dolu geldi → daha eski mesaj olabilir */
  full: boolean;
  /** Yerel önbellekten geldi; sunucu yanıtı henüz gelmedi (sayfa eksik olabilir) */
  fromCache: boolean;
}

/**
 * Bir mesaj sayfasını gerçek zamanlı dinler. Yalnızca `pageSize` kadar doküman
 * okunur; konuşmanın tamamı hiçbir zaman çekilmez.
 *
 * - `after` yoksa: en yeni `pageSize` mesaj (yeni gelenler, düzenleme/silme canlı gelir).
 * - `after` varsa: o mesajdan daha eski `pageSize` mesaj ("eski mesajları yükle").
 *   Yeni mesajlar hep en yeni olduğundan bu aralık sabittir.
 */
export function subscribeMessagePage(
  db: Firestore,
  conversationId: string,
  { pageSize, after = null }: { pageSize: number; after?: QueryDocumentSnapshot | null },
  onChange: (page: MessagePage) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = after
    ? query(
        messagesCol(db, conversationId),
        orderBy("createdAt", "desc"),
        startAfter(after),
        limit(pageSize),
      )
    : query(messagesCol(db, conversationId), orderBy("createdAt", "desc"), limit(pageSize));

  // includeMetadataChanges → bekleyen yazma sunucuya ulaşınca (saat → tik) yeniden yayınlanır
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snap) => {
      const messages = snap.docs.map((d) =>
        mapDoc(
          conversationId,
          d.id,
          // Bekleyen serverTimestamp için tahmini değer → saat anında görünür
          d.data({ serverTimestamps: "estimate" }) as Record<string, unknown>,
          d.metadata.hasPendingWrites,
        ),
      );
      onChange({
        messages,
        oldest: snap.docs[snap.docs.length - 1] ?? null,
        full: snap.size >= pageSize,
        fromCache: snap.metadata.fromCache,
      });
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

export interface ChangeMessageOptions {
  /** Mesaj konuşmanın son mesajı mı (liste önizlemesi güncellensin) */
  isLast?: boolean;
  /** Mesaj karşı tarafça okunmuş muydu (düzenlemede okundu bilgisi sıfırlanır) */
  wasRead?: boolean;
}

/**
 * Gönderilmiş bir mesajı düzenler. `editedAt` yenilendiği için karşı tarafın
 * okuma zamanı artık mesajdan eskidir → okundu bilgisi sıfırlanır. Mesaj daha
 * önce okunmuşsa alıcının okunmamış sayacı da artar ki yeniden okusun.
 */
export async function editMessage(
  db: Firestore,
  conversationId: string,
  messageId: string,
  senderId: string,
  text: string,
  { isLast = false, wasRead = false }: ChangeMessageOptions = {},
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Mesaj boş olamaz.");

  await updateDoc(doc(messagesCol(db, conversationId), messageId), {
    text: trimmed,
    editedAt: serverTimestamp(),
  });

  if (!isLast && !wasRead) return;
  try {
    await touchConversationOnChange(db, conversationId, senderId, {
      ...(isLast ? { lastText: trimmed } : {}),
      bumpUnread: wasRead,
    });
  } catch (err) {
    console.warn("[rmos-chat] Konuşma özeti güncellenemedi:", err);
  }
}

/**
 * Mesajı herkes için siler. Doküman kalır; metni boşaltılıp `deleted: true`
 * işaretlenir ve balon "Bu mesaj silindi" olarak görünür.
 */
export async function deleteMessage(
  db: Firestore,
  conversationId: string,
  messageId: string,
  senderId: string,
  { isLast = false }: Pick<ChangeMessageOptions, "isLast"> = {},
): Promise<void> {
  await updateDoc(doc(messagesCol(db, conversationId), messageId), {
    text: "",
    deleted: true,
    deletedAt: serverTimestamp(),
  });

  if (!isLast) return;
  try {
    await touchConversationOnChange(db, conversationId, senderId, {
      lastText: DELETED_MESSAGE_TEXT,
    });
  } catch (err) {
    console.warn("[rmos-chat] Konuşma özeti güncellenemedi:", err);
  }
}
