import type { ReactNode } from "react";
import { DELETED_MESSAGE_TEXT } from "../firebase/messages";
import { BanIcon, CheckIcon, ClockIcon, DoubleCheckIcon } from "../ui/icons";

/** Kendi mesajının iletim durumu: bekliyor (saat) → gönderildi (tek tik) → okundu (çift tik). */
export type MessageStatus = "pending" | "sent" | "read";

export interface MessageBubbleProps {
  /** Mesaj metni (children verilmezse kullanılır) */
  text?: string;
  /** true ise gönderen mevcut kullanıcıdır (sağa yaslanır) */
  mine?: boolean;
  /** Saat etiketi (örn. "14:08") */
  time?: string;
  /** Okundu bilgisi (yalnızca `mine` mesajlarda tik olarak görünür) */
  status?: MessageStatus;
  /** "düzenlendi" etiketi göster */
  edited?: boolean;
  /** Mesaj silindi → "Bu mesaj silindi" gösterilir */
  deleted?: boolean;
  /** Şu an düzenleniyor (vurgulanır) */
  highlighted?: boolean;
  /** Balonun içine yerleşen ek içerik (ör. mesaj menüsü) */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const STATUS_LABEL: Record<MessageStatus, string> = {
  pending: "Gönderiliyor",
  sent: "Gönderildi",
  read: "Okundu",
};

function StatusTick({ status }: { status: MessageStatus }) {
  const label = STATUS_LABEL[status];
  return (
    <span
      className={`rmos-tick rmos-tick--${status}`}
      role="img"
      aria-label={label}
      title={label}
    >
      {status === "pending" ? (
        <ClockIcon size={12} />
      ) : status === "read" ? (
        <DoubleCheckIcon size={16} strokeWidth={2.2} />
      ) : (
        <CheckIcon size={14} strokeWidth={2.2} />
      )}
    </span>
  );
}

/** Tek mesaj balonu. */
export function MessageBubble({
  text,
  mine = false,
  time,
  status,
  edited = false,
  deleted = false,
  highlighted = false,
  actions,
  children,
  className,
}: MessageBubbleProps) {
  let base = mine ? "rmos-bubble rmos-bubble--mine" : "rmos-bubble";
  if (deleted) base += " rmos-bubble--deleted";
  if (highlighted) base += " rmos-bubble--highlighted";
  if (actions) base += " rmos-bubble--actions";
  const cls = className ? `${base} ${className}` : base;

  return (
    <div className={cls} data-rmos-message-bubble data-mine={mine ? "true" : "false"}>
      {deleted ? (
        <span className="rmos-bubble__deleted">
          <BanIcon size={13} />
          {DELETED_MESSAGE_TEXT}
        </span>
      ) : (
        children ?? text
      )}
      <span className="rmos-bubble__meta">
        {edited && !deleted ? <span className="rmos-bubble__edited">düzenlendi</span> : null}
        {time ? <span className="rmos-bubble__time">{time}</span> : null}
        {mine && status && !deleted ? <StatusTick status={status} /> : null}
      </span>
      {actions}
    </div>
  );
}
