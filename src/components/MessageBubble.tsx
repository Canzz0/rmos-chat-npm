import type { ReactNode } from "react";

export interface MessageBubbleProps {
  /** Mesaj metni (children verilmezse kullanılır) */
  text?: string;
  /** true ise gönderen mevcut kullanıcıdır (sağa yaslanır) */
  mine?: boolean;
  /** Saat etiketi (örn. "14:08") */
  time?: string;
  children?: ReactNode;
  className?: string;
}

/** Tek mesaj balonu. */
export function MessageBubble({
  text,
  mine = false,
  time,
  children,
  className,
}: MessageBubbleProps) {
  const base = mine ? "rmos-bubble rmos-bubble--mine" : "rmos-bubble";
  const cls = className ? `${base} ${className}` : base;

  return (
    <div className={cls} data-rmos-message-bubble data-mine={mine ? "true" : "false"}>
      {children ?? text}
      {time ? <span className="rmos-bubble__time">{time}</span> : null}
    </div>
  );
}
