import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { CheckIcon, CloseIcon, EditIcon, SendIcon } from "../ui/icons";

export interface MessageInputProps {
  /** Mesaj gönderildiğinde (veya düzenleme kaydedildiğinde) çağrılır */
  onSend: (text: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  /**
   * Düzenlenen mesaj. Verilince metin alanı mesajın metniyle dolar, üstte
   * "Mesajı düzenle" şeridi çıkar ve gönder butonu kaydet olur.
   */
  editing?: { id: string; text: string } | null;
  /** Düzenlemeden vazgeçilince (X veya Esc) */
  onCancelEdit?: () => void;
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
  editing = null,
  onCancelEdit,
  className,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const ref = useRef<HTMLTextAreaElement | null>(null);
  /** Düzenlemeye geçmeden önce yazılmış (gönderilmemiş) taslak */
  const draftRef = useRef("");
  const prevEditingId = useRef<string | null>(null);

  const isDisabled = disabled || sending;
  const editingId = editing?.id ?? null;

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  // Düzenleme başlayınca mesaj metnini yükle; bitince yarım kalan taslağa dön
  useEffect(() => {
    const prev = prevEditingId.current;
    prevEditingId.current = editingId;
    if (prev === editingId) return;

    if (editingId !== null) {
      if (prev === null) draftRef.current = value;
      setValue(editing?.text ?? "");
    } else {
      setValue(draftRef.current);
      draftRef.current = "";
    }

    const el = ref.current;
    if (!el) return;
    requestAnimationFrame(() => {
      autoGrow(el);
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  async function submit() {
    const text = value.trim();
    if (!text || isDisabled) return;

    setSending(true);
    try {
      await onSend(text);
      // Düzenlemede metni üst bileşen yönetir: başarılıysa düzenleme kapanır ve
      // taslak geri gelir; hata olursa yazılan metin kaybolmaz.
      if (!editing) setValue("");
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
    } else if (e.key === "Escape" && editing) {
      // preventDefault → kartın Esc ile kapanmasını engeller
      e.preventDefault();
      onCancelEdit?.();
    }
  }

  let cls = editing ? "rmos-composer rmos-composer--editing" : "rmos-composer";
  if (className) cls += ` ${className}`;

  return (
    <div className={cls} data-rmos-message-input>
      {editing ? (
        <div className="rmos-editbar">
          <span className="rmos-editbar__icon">
            <EditIcon size={15} />
          </span>
          <span className="rmos-editbar__text">
            <span className="rmos-editbar__title">Mesajı düzenle</span>
            <span className="rmos-editbar__orig">{editing.text}</span>
          </span>
          <button
            type="button"
            className="rmos-iconbtn"
            onClick={onCancelEdit}
            aria-label="Düzenlemeden vazgeç"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      ) : null}
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
        aria-label={editing ? "Mesajı düzenle" : "Mesaj"}
      />
      <button
        type="button"
        className="rmos-send"
        onClick={() => void submit()}
        disabled={isDisabled || value.trim().length === 0}
        aria-label={editing ? "Kaydet" : "Gönder"}
      >
        {editing ? <CheckIcon size={18} /> : <SendIcon size={18} />}
      </button>
    </div>
  );
}
