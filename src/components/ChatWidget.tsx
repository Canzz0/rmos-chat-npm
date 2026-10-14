import type { CSSProperties, ReactNode } from "react";
import { useChatContext } from "../context/useChatContext";

export interface ChatWidgetProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Kapsayıcıyı dolduran kök widget kabuğu (UI sonraki adımda). */
export function ChatWidget({ children, className, style }: ChatWidgetProps) {
  useChatContext();

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        minHeight: 0,
        ...style,
      }}
      data-rmos-chat-widget
    >
      {children}
    </div>
  );
}
