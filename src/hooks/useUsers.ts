import { useChatContext } from "../context/useChatContext";
import type { ChatUser } from "../types";
import { useGet } from "./useGet";

export interface UseUsersResult {
  users: ChatUser[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/** fldName + fldSurname'i birleştiren yardımcı */
export function getUserFullName(user: ChatUser): string {
  return `${user.fldName} ${user.fldSurname}`.trim();
}

/**
 * Kullanıcı listesini REST API'den çeker.
 * GET {baseUrl}/api/Users/GetUsersBySirket?programId=0
 * Authorization: Bearer {token}
 *
 * Dönen yapı: { fldUserID, fldName, fldSurname }[]
 */
export function useUsers(): UseUsersResult {
  const { usersPath } = useChatContext();
  // programId sabit 0
  const fullPath = `${usersPath}?programId=0`;
  const { data, loading, error, refetch } = useGet<ChatUser[]>(fullPath);

  return {
    users: data,
    loading,
    error,
    refetch,
  };
}
