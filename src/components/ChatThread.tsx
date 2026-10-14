import { useEffect, useState } from "react";
import { useChatContext } from "../context/useChatContext";
import { directConversationId } from "../conversation";
import { markConversationRead } from "../firebase/conversations";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import { useSendMessage } from "../hooks/useSendMessage";
import { getUserFullName } from "../hooks/useUsers";
import type { ChatUser } from "../types";
import { BackIcon, CloseIcon } from "../ui/icons";
import { Avatar } from "./Avatar";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

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

/** Seçili kişiyle gerçek zamanlı sohbet: başlık + mesajlar + yazma alanı. */
export function ChatThread({
  contact,
  onBack,
  onClose,
  showHeader = true,
  className,
}: ChatThreadProps) {
  const { userId, firebaseReady, firebaseError, firestore } = useChatContext();
  const [sendError, setSendError] = useState<string | null>(null);

  const conversationId = contact
    ? directConversationId(userId, String(contact.fldUserID))
    : null;

  const { messages, loading, error } = useMessages(conversationId);
  const { send } = useSendMessage();
  const { conversations } = useConversations();
  const unreadCount = conversationId
    ? conversations[conversationId]?.unreadCount ?? 0
    : 0;

  // Sohbet açıkken gelen mesajlar okunmuş sayılır
  useEffect(() => {
    if (!conversationId || !firestore || unreadCount === 0) return;
    markConversationRead(firestore, conversationId, userId).catch((err) => {
      console.warn("[rmos-chat] Okundu bilgisi yazılamadı:", err);
    });
  }, [conversationId, firestore, userId, unreadCount]);

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

  async function handleSend(text: string) {
    if (!conversationId) return;
    setSendError(null);
    try {
      await send(conversationId, text);
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
      />
    </div>
  );
}
