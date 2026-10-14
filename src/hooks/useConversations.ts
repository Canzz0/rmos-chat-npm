import { useContext } from "react";
import {
  ConversationsContext,
  type ConversationsContextValue,
} from "../context/ConversationsProvider";

export type UseConversationsResult = ConversationsContextValue;

/**
 * Mevcut kullanıcının konuşma özetleri (son mesaj + okunmamış sayısı).
 * Dinleme ChatProvider mount olduğu anda başlar; bu hook yalnızca sonucu okur.
 */
export function useConversations(): UseConversationsResult {
  const ctx = useContext(ConversationsContext);
  if (!ctx) {
    throw new Error(
      "useConversations yalnızca <ChatProvider> içinde kullanılabilir.",
    );
  }
  return ctx;
}
