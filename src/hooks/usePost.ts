import { useCallback, useRef, useState } from "react";
import { useChatContext } from "../context/useChatContext";
import { request } from "../http/client";

export interface UsePostResult<TBody, TResponse> {
  post: (body: TBody, pathOverride?: string) => Promise<TResponse>;
  data: TResponse | null;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}

export function usePost<TBody = unknown, TResponse = unknown>(
  path?: string,
): UsePostResult<TBody, TResponse> {
  const { token, baseUrl } = useChatContext();

  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const defaultPathRef = useRef(path);
  defaultPathRef.current = path;

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const post = useCallback(
    async (body: TBody, pathOverride?: string): Promise<TResponse> => {
      const targetPath = pathOverride ?? defaultPathRef.current;
      if (!targetPath) {
        throw new Error(
          "usePost: path verilmedi. Hook'a path geçin veya post(body, path) kullanın.",
        );
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const result = await request<TResponse>(baseUrl, token, targetPath, {
          method: "POST",
          body,
          signal: controller.signal,
        });
        setData(result);
        setLoading(false);
        return result;
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          throw err;
        }
        const next = err instanceof Error ? err : new Error(String(err));
        setError(next);
        setLoading(false);
        throw next;
      }
    },
    [baseUrl, token],
  );

  return { post, data, loading, error, reset };
}
