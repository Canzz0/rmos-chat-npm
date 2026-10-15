export { ChatProvider, type ChatProviderProps } from "./context/ChatProvider";
export { useChatContext } from "./context/useChatContext";

export { useGet, type UseGetOptions, type UseGetResult } from "./hooks/useGet";
export { usePost, type UsePostResult } from "./hooks/usePost";
export { useUsers, getUserFullName, type UseUsersResult } from "./hooks/useUsers";
export {
  useMessages,
  DEFAULT_MESSAGE_PAGE_SIZE,
  type UseMessagesOptions,
  type UseMessagesResult,
} from "./hooks/useMessages";
export {
  useConversations,
  type UseConversationsResult,
} from "./hooks/useConversations";
export {
  useSendMessage,
  type UseSendMessageResult,
} from "./hooks/useSendMessage";

export {
  ChatHttpError,
  type ChatConfig,
  type ChatContextValue,
  type ChatUser,
  type ChatMessage,
  type ChatConversation,
  type FirebaseWebConfig,
  type FirebaseTokenResponse,
} from "./types";

export {
  PRODUCTION_BASE_URL,
  DEVELOPMENT_BASE_URL,
  getDefaultBaseUrl,
  DEFAULT_USERS_PATH,
  DEFAULT_FIREBASE_TOKEN_PATH,
  DEFAULT_FIREBASE_CONFIG,
} from "./defaults";

export { directConversationId, parseDirectConversationId } from "./conversation";
export { useHostTheme, detectHostTheme, type Theme } from "./ui/useHostTheme";

export { RmosChat, type RmosChatProps } from "./components/RmosChat";
export { ChatThread, type ChatThreadProps } from "./components/ChatThread";
export { ChatWidget, type ChatWidgetProps } from "./components/ChatWidget";
export {
  ConversationList,
  type ConversationListProps,
} from "./components/ConversationList";
export {
  MessageList,
  messageStatus,
  type MessageListProps,
} from "./components/MessageList";
export {
  MessageBubble,
  type MessageBubbleProps,
  type MessageStatus,
} from "./components/MessageBubble";
export {
  DELETED_MESSAGE_TEXT,
  type ChangeMessageOptions,
} from "./firebase/messages";
export {
  MessageInput,
  type MessageInputProps,
} from "./components/MessageInput";
export { Avatar, type AvatarProps } from "./components/Avatar";
