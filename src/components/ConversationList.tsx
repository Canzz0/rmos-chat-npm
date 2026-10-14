import { useMemo, useState, type CSSProperties } from "react";
import { useChatContext } from "../context/useChatContext";
import { directConversationId } from "../conversation";
import { useConversations } from "../hooks/useConversations";
import { getUserFullName, useUsers } from "../hooks/useUsers";
import type { ChatUser } from "../types";
import { formatListTime } from "../ui/format";
import { SearchIcon } from "../ui/icons";
import { Avatar } from "./Avatar";

export interface ConversationListProps {
  /** Seçili kullanıcının ID'si (vurgulamak için) */
  selectedUserId?: string | null;
  /** Bir kişiye tıklanınca */
  onSelect?: (user: ChatUser) => void;
  /** Arama kutusunu göster (varsayılan true) */
  searchable?: boolean;
  /** Arama placeholder'ı */
  searchPlaceholder?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * API'den kullanıcıları çekip aranabilir, seçilebilir liste olarak gösterir.
 * Her satırda son mesaj ve okunmamış mesaj sayısı görünür; en son yazışılan üstte.
 */
export function ConversationList({
  selectedUserId,
  onSelect,
  searchable = true,
  searchPlaceholder = "Kişi ara...",
  className,
  style,
}: ConversationListProps) {
  const { userId } = useChatContext();
  const { users, loading, error } = useUsers();
  const { conversations } = useConversations();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    if (!users) return [];
    const q = query.trim().toLocaleLowerCase("tr");
    const matched = q
      ? users.filter((u) => {
          const name = getUserFullName(u).toLocaleLowerCase("tr");
          return name.includes(q) || String(u.fldUserID).includes(q);
        })
      : users;

    return matched
      .map((user) => ({
        user,
        conversation:
          conversations[directConversationId(userId, String(user.fldUserID))] ??
          null,
      }))
      .sort(
        (a, b) =>
          (b.conversation?.lastMessage?.createdAt ?? 0) -
          (a.conversation?.lastMessage?.createdAt ?? 0),
      );
  }, [users, query, conversations, userId]);

  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1, ...style }}
      data-rmos-conversation-list
    >
      {searchable ? (
        <div className="rmos-search">
          <span className="rmos-search__icon">
            <SearchIcon size={16} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Kişi ara"
          />
        </div>
      ) : null}

      <div className="rmos-list">
        {loading ? <div className="rmos-state">Yükleniyor...</div> : null}
        {error ? (
          <div className="rmos-state rmos-state--error">
            Kişiler yüklenemedi: {error.message}
          </div>
        ) : null}
        {!loading && !error && rows.length === 0 ? (
          <div className="rmos-state">
            {query ? "Eşleşen kişi yok." : "Kişi bulunamadı."}
          </div>
        ) : null}

        {rows.map(({ user, conversation }) => {
          const id = String(user.fldUserID);
          const name = getUserFullName(user);
          const active = selectedUserId === id;
          const last = conversation?.lastMessage ?? null;
          const unread = conversation?.unreadCount ?? 0;

          let cls = "rmos-row";
          if (active) cls += " rmos-row--active";
          if (unread > 0) cls += " rmos-row--unread";

          return (
            <button
              key={user.fldUserID}
              type="button"
              className={cls}
              onClick={() => onSelect?.(user)}
              aria-pressed={active}
              aria-label={unread > 0 ? `${name}, ${unread} okunmamış mesaj` : name}
            >
              <Avatar name={name} userId={id} size={38} showDetails={false} />
              <span className="rmos-row__meta">
                <span className="rmos-row__line">
                  <span className="rmos-row__name">{name}</span>
                  {last ? (
                    <span className="rmos-row__time">
                      {formatListTime(last.createdAt)}
                    </span>
                  ) : null}
                </span>
                <span className="rmos-row__line">
                  <span className="rmos-row__preview">
                    {last
                      ? `${last.senderId === userId ? "Siz: " : ""}${last.text}`
                      : "Henüz mesaj yok"}
                  </span>
                  {unread > 0 ? (
                    <span className="rmos-badge">{unread > 99 ? "99+" : unread}</span>
                  ) : null}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
