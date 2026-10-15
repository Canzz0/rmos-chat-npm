import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ChatMessage } from "../types";
import { formatTime } from "../ui/format";
import { ChevronDownIcon, EditIcon, TrashIcon } from "../ui/icons";
import { MessageBubble, type MessageStatus } from "./MessageBubble";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface MessageListProps {
  messages: ChatMessage[];
  /** Mevcut kullanıcının ID'si — kendi mesajlarını sağa yaslamak için */
  currentUserId: string;
  loading?: boolean;
  error?: Error | null;
  emptyText?: string;
  /**
   * Karşı tarafın konuşmayı en son okuduğu zaman (ms). Verilirse kendi
   * mesajlarında okundu bilgisi (tik) gösterilir.
   */
  readAt?: number;
  /** Verilirse kendi mesajlarının menüsünde "Düzenle" çıkar */
  onEdit?: (message: ChatMessage) => void;
  /** Verilirse kendi mesajlarının menüsünde "Sil" çıkar */
  onDelete?: (message: ChatMessage) => void;
  /** Şu an düzenlenen mesajın ID'si (vurgulanır) */
  editingId?: string | null;
  /** Daha eski mesaj var → üstte "Eski mesajları yükle" butonu */
  hasMore?: boolean;
  /** Eski mesajlar yükleniyor */
  loadingMore?: boolean;
  /** "Eski mesajları yükle" tıklanınca */
  onLoadMore?: () => void;
  className?: string;
}

/** Kendi mesajının okundu durumu: düzenlenen mesaj, düzenlemeden sonra okunana dek "okunmadı" sayılır. */
export function messageStatus(message: ChatMessage, readAt: number): MessageStatus {
  if (message.pending) return "pending";
  const at = message.editedAt ?? message.createdAt;
  return readAt > 0 && at > 0 && readAt >= at ? "read" : "sent";
}

/** Mesajları balonlar halinde gösterir; yeni mesajda otomatik en alta kayar. */
export function MessageList({
  messages,
  currentUserId,
  loading = false,
  error = null,
  emptyText = "Henüz mesaj yok. İlk mesajı siz yazın.",
  readAt,
  onEdit,
  onDelete,
  editingId = null,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  className,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [menu, setMenu] = useState<{ id: string; up: boolean; confirm: boolean } | null>(
    null,
  );

  // Kaydırma: yeni mesaj (veya ilk açılış) → en alta; eski mesajlar üste eklendi →
  // kullanıcının baktığı yer kaymasın diye eklenen yükseklik kadar aşağı kaydır.
  const scrollRef = useRef<{ firstId?: string; lastId?: string; height: number }>({ height: 0 });
  useIsomorphicLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const firstId = messages[0]?.id;
    const lastId = messages[messages.length - 1]?.id;
    const prev = scrollRef.current;
    if (lastId !== prev.lastId) {
      el.scrollTop = el.scrollHeight;
    } else if (firstId !== prev.firstId && prev.height > 0) {
      el.scrollTop += el.scrollHeight - prev.height;
    }
    scrollRef.current = { firstId, lastId, height: el.scrollHeight };
  });

  // Menü: dışına tıklama + Esc ile kapanır (Esc kartı kapatmasın diye capture + preventDefault)
  useEffect(() => {
    if (!menu) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t?.closest?.("[data-rmos-message-menu]")) return;
      setMenu(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setMenu(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [menu]);

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

  const hasActions = Boolean(onEdit || onDelete);

  function openMenu(id: string, button: HTMLElement) {
    if (menu?.id === id) {
      setMenu(null);
      return;
    }
    // Listenin altına yakınsa menü yukarı açılır (kaydırma alanında kırpılmasın)
    const list = listRef.current?.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    const up = list ? rect.bottom + 120 > list.bottom : false;
    setMenu({ id, up, confirm: false });
  }

  function renderMenu(m: ChatMessage) {
    const open = menu?.id === m.id;
    return (
      <span className="rmos-msgmenu" data-rmos-message-menu>
        <button
          type="button"
          className={`rmos-msgmenu__btn${open ? " rmos-msgmenu__btn--open" : ""}`}
          aria-label="Mesaj seçenekleri"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(e) => openMenu(m.id, e.currentTarget)}
        >
          <ChevronDownIcon size={16} />
        </button>
        {open ? (
          <span
            className={`rmos-menu${menu.up ? " rmos-menu--up" : ""}`}
            role="menu"
          >
            {menu.confirm ? (
              <>
                <span className="rmos-menu__note">Mesaj herkesten silinsin mi?</span>
                <button
                  type="button"
                  role="menuitem"
                  className="rmos-menu__item rmos-menu__item--danger"
                  onClick={() => {
                    setMenu(null);
                    onDelete?.(m);
                  }}
                >
                  <TrashIcon size={15} /> Sil
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="rmos-menu__item"
                  onClick={() => setMenu(null)}
                >
                  Vazgeç
                </button>
              </>
            ) : (
              <>
                {onEdit ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="rmos-menu__item"
                    onClick={() => {
                      setMenu(null);
                      onEdit(m);
                    }}
                  >
                    <EditIcon size={15} /> Düzenle
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="rmos-menu__item rmos-menu__item--danger"
                    onClick={() => setMenu({ ...menu, confirm: true })}
                  >
                    <TrashIcon size={15} /> Sil
                  </button>
                ) : null}
              </>
            )}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <div ref={listRef} className={cls} data-rmos-message-list>
      {hasMore && onLoadMore ? (
        <div className="rmos-loadmore">
          <button type="button" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? "Yükleniyor..." : "Eski mesajları yükle"}
          </button>
        </div>
      ) : null}
      {messages.map((m) => {
        const mine = m.senderId === currentUserId;
        const canAct = mine && hasActions && !m.deleted && !m.pending;
        return (
          <MessageBubble
            key={m.id}
            text={m.text}
            mine={mine}
            time={formatTime(m.createdAt)}
            status={mine && readAt !== undefined ? messageStatus(m, readAt) : undefined}
            edited={Boolean(m.editedAt)}
            deleted={m.deleted}
            highlighted={editingId === m.id}
            actions={canAct ? renderMenu(m) : null}
            className={menu?.id === m.id ? "rmos-bubble--menu-open" : undefined}
          />
        );
      })}
    </div>
  );
}
