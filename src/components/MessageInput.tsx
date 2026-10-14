import { useRef, useState, type KeyboardEvent } from "react";
import { SendIcon } from "../ui/icons";

export interface MessageInputProps {
  /** Mesaj gönderildiğinde çağrılır */
  onSend: (text: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Mesaj yazma alanı. Enter gönderir, Shift+Enter yeni satır ekler.
 * Metin alanı içeriğe göre büyür (max 120px).
 */
export function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Mesaj yazın...",
  className,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const isDisabled = disabled || sending;

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  async function submit() {
    const text = value.trim();
    if (!text || isDisabled) return;

    setSending(true);
    try {
      await onSend(text);
      setValue("");
      if (ref.current) {
        ref.current.style.height = "auto";
        ref.current.focus();
      }
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  }

  const cls = className ? `rmos-composer ${className}` : "rmos-composer";

  return (
    <div className={cls} data-rmos-message-input>
      <textarea
        ref={ref}
        rows={1}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          setValue(e.target.value);
          autoGrow(e.target);
        }}
        onKeyDown={onKeyDown}
        aria-label="Mesaj"
      />
      <button
        type="button"
        className="rmos-send"
        onClick={() => void submit()}
        disabled={isDisabled || value.trim().length === 0}
        aria-label="Gönder"
      >
        <SendIcon size={18} />
      </button>
    </div>
  );
}
