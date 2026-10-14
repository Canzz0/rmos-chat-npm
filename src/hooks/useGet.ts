import { useCallback, useEffect, useRef, useState } from "react";
import { useChatContext } from "../context/useChatContext";
import { request } from "../http/client";

export interface UseGetOptions {
  /** false ise istek atılmaz (varsayılan: true) */
  enabled?: boolean;
  /** path dışında ek bağımlılıklar; değişince yeniden çekilir */
  deps?: unknown[];
}

export interface UseGetResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useGet<T>(
  path: string,
  options: UseGetOptions = {},
): UseGetResult<T> {
  const { token, baseUrl } = useChatContext();
  const { enabled = true, deps = [] } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  const refetch = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;
    setLoading(true);
    setError(null);

    request<T>(baseUrl, token, path, { method: "GET", signal: controller.signal })
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled || controller.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps caller-controlled
  }, [baseUrl, token, path, enabled, tick, ...deps]);

  return { data, loading, error, refetch };
}
