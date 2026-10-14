import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types";
import { formatTime } from "../ui/format";
import { MessageBubble } from "./MessageBubble";

export interface MessageListProps {
  messages: ChatMessage[];
  /** Mevcut kullanıcının ID'si — kendi mesajlarını sağa yaslamak için */
  currentUserId: string;
  loading?: boolean;
  error?: Error | null;
  emptyText?: string;
  className?: string;
}

/** Mesajları balonlar halinde gösterir; yeni mesajda otomatik en alta kayar. */
export function MessageList({
  messages,
  currentUserId,
  loading = false,
  error = null,
  emptyText = "Henüz mesaj yok. İlk mesajı siz yazın.",
  className,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const cls = className ? `rmos-messages ${className}` : "rmos-messages";

  if (error) {
    return (
      <div className={cls} data-rmos-message-list>
        <div className="rmos-empty" style={{ color: "#ef4444" }}>
          Mesajlar yüklenemedi: {error.message}
        </div>
      </div>
    );
  }

  if (loading && messages.length === 0) {
    return (
      <div className={cls} data-rmos-message-list>
        <div className="rmos-empty">Yükleniyor...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={cls} data-rmos-message-list>
        <div className="rmos-empty">{emptyText}</div>
      </div>
    );
  }

  return (
    <div className={cls} data-rmos-message-list>
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          text={m.text}
          mine={m.senderId === currentUserId}
          time={formatTime(m.createdAt)}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}
