import { useContext } from "react";
import { ChatContext } from "./ChatProvider";
import type { ChatContextValue } from "../types";

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error(
      "useChatContext yalnızca <ChatProvider> içinde kullanılabilir.",
    );
  }
  return ctx;
}
