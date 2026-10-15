import { useEffect, useState } from "react";
import { useChatContext } from "../context/useChatContext";
import { directConversationId } from "../conversation";
import { markConversationRead } from "../firebase/conversations";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import { useSendMessage } from "../hooks/useSendMessage";
import { getUserFullName } from "../hooks/useUsers";
import type { ChatMessage, ChatUser } from "../types";
import { BackIcon, CloseIcon } from "../ui/icons";
import { Avatar } from "./Avatar";
import { MessageInput } from "./MessageInput";
import { MessageList, messageStatus } from "./MessageList";

export interface ChatThreadProps {
  /** Konuşulan kişi; null ise boş durum gösterilir */
  contact: ChatUser | null;
  /** Geri butonu (floating liste görünümüne dönmek için) */
  onBack?: () => void;
  /** Kapat butonu */
  onClose?: () => void;
  /** Kendi başlığını göstersin mi (varsayılan true). Floating kart kendi başlığını çizer. */
  showHeader?: boolean;
  className?: string;
}

/**
 * Seçili kişiyle gerçek zamanlı sohbet: başlık + mesajlar + yazma alanı.
 * Kendi mesajlarında okundu bilgisi (tik) görünür; mesajlar düzenlenip silinebilir.
 */
export function ChatThread({
  contact,
  onBack,
  onClose,
  showHeader = true,
  className,
}: ChatThreadProps) {
  const { userId, firebaseReady, firebaseError, firestore } = useChatContext();
  const [sendError, setSendError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ChatMessage | null>(null);

  const contactId = contact ? String(contact.fldUserID) : null;
  const conversationId = contactId ? directConversationId(userId, contactId) : null;

  const { messages, loading, error, hasMore, loadingMore, loadMore } =
    useMessages(conversationId);
  const { send, edit, remove } = useSendMessage();
  const { conversations } = useConversations();
  const conversation = conversationId ? conversations[conversationId] : undefined;
  const unreadCount = conversation?.unreadCount ?? 0;
  const contactReadAt = contactId ? conversation?.readAt[contactId] ?? 0 : 0;

  // Henüz okuma zamanı yazılmamış (eski) konuşmalarda da karşı tarafa okundu bilgisi gitsin
  const last = conversation?.lastMessage ?? null;
  const myReadAt = conversation?.readAt[userId] ?? 0;
  const needsRead =
    unreadCount > 0 ||
    (last !== null && last.senderId !== userId && last.createdAt > myReadAt);

  // Sohbet açıkken gelen mesajlar okunmuş sayılır
  useEffect(() => {
    if (!conversationId || !firestore || !needsRead) return;
    markConversationRead(firestore, conversationId, userId).catch((err) => {
      console.warn("[rmos-chat] Okundu bilgisi yazılamadı:", err);
    });
  }, [conversationId, firestore, userId, needsRead]);

  const cls = className ? `rmos-thread ${className}` : "rmos-thread";

  if (!contact) {
    return (
      <div className={cls} data-rmos-chat-thread>
        <div className="rmos-empty">
          Sohbet etmek için soldan bir kişi seçin.
        </div>
      </div>
    );
  }

  const isLast = (id: string) => messages[messages.length - 1]?.id === id;

  async function handleSend(text: string) {
    if (!conversationId) return;
    setSendError(null);
    try {
      if (editing) {
        if (text !== editing.text) {
          await edit(conversationId, editing.id, text, {
            isLast: isLast(editing.id),
            wasRead: messageStatus(editing, contactReadAt) === "read",
          });
        }
        setEditing(null);
      } else {
        await send(conversationId, text);
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleDelete(message: ChatMessage) {
    if (!conversationId) return;
    setSendError(null);
    if (editing?.id === message.id) setEditing(null);
    try {
      await remove(conversationId, message.id, { isLast: isLast(message.id) });
    } catch (err) {
      setSendError(err instanceof Error ? err.message : String(err));
    }
  }

  const name = getUserFullName(contact);

  return (
    <div className={cls} data-rmos-chat-thread>
      {showHeader ? (
        <div className="rmos-header">
          {onBack ? (
            <button type="button" className="rmos-iconbtn" onClick={onBack} aria-label="Geri">
              <BackIcon size={18} />
            </button>
          ) : null}
          <Avatar name={name} userId={String(contact.fldUserID)} size={34} showDetails={false} />
          <span className="rmos-header__title">{name}</span>
          {onClose ? (
            <button type="button" className="rmos-iconbtn" onClick={onClose} aria-label="Kapat">
              <CloseIcon size={18} />
            </button>
          ) : null}
        </div>
      ) : null}

      <MessageList
        messages={messages}
        currentUserId={userId}
        loading={loading}
        error={error ?? firebaseError}
        readAt={contactReadAt}
        onEdit={setEditing}
        onDelete={(m) => void handleDelete(m)}
        editingId={editing?.id ?? null}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />

      {sendError ? (
        <div className="rmos-state rmos-state--error" style={{ padding: "4px 12px" }}>
          {sendError}
        </div>
      ) : null}

      <MessageInput
        onSend={handleSend}
        disabled={!firebaseReady || Boolean(firebaseError)}
        placeholder={firebaseReady ? "Mesaj yazın..." : "Bağlanıyor..."}
        editing={editing ? { id: editing.id, text: editing.text } : null}
        onCancelEdit={() => setEditing(null)}
      />
    </div>
  );
}
