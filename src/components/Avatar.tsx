import type { CSSProperties } from "react";
import { initials } from "../ui/theme";

export interface AvatarProps {
  /** Kullanıcı adı (tam ad) */
  name: string;
  /** Kullanıcı ID */
  userId: string;
  /** Daire boyutu (px), varsayılan 40 */
  size?: number;
  /** Ad + id metnini göster (varsayılan true) */
  showDetails?: boolean;
  /** Çevrimiçi noktası */
  online?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Baş harfli renkli avatar + (opsiyonel) ad & id. */
export function Avatar({
  name,
  userId,
  size = 40,
  showDetails = true,
  online = false,
  className,
  style,
}: AvatarProps) {
  const cls = className ? `rmos-avatar ${className}` : "rmos-avatar";

  return (
    <div className={cls} style={style} data-rmos-avatar>
      <span
        className="rmos-avatar__circle"
        style={{
          width: size,
          height: size,
          fontSize: Math.round(size * 0.4),
        }}
      >
        {initials(name)}
        {online ? <span className="rmos-avatar__dot" /> : null}
      </span>
      {showDetails ? (
        <span className="rmos-avatar__meta">
          <span className="rmos-avatar__name" style={{ fontSize: 13 }}>
            {name}
          </span>
          <span className="rmos-avatar__id" style={{ fontSize: 11 }}>
            {userId}
          </span>
        </span>
      ) : null}
    </div>
  );
}
