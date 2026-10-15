import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { QueryDocumentSnapshot, Unsubscribe } from "firebase/firestore";
import { useChatContext } from "../context/useChatContext";
import { subscribeMessagePage, type MessagePage } from "../firebase/messages";
import type { ChatMessage } from "../types";

/** Varsayılan sayfa boyutu: açılışta son 10 mesaj, her "eski mesajları yükle"de +10. */
export const DEFAULT_MESSAGE_PAGE_SIZE = 10;

export interface UseMessagesOptions {
  /** Sayfa başına mesaj sayısı (varsayılan 10) */
  pageSize?: number;
}

export interface UseMessagesResult {
  /** Yüklenen mesajlar, eskiden yeniye */
  messages: ChatMessage[];
  loading: boolean;
  error: Error | null;
  /** Daha eski mesaj olabilir */
  hasMore: boolean;
  /** Eski mesaj sayfası yükleniyor */
  loadingMore: boolean;
  /** Bir önceki (daha eski) sayfayı yükler: 10 → 20 → 30 ... */
  loadMore: () => void;
}

interface Segment {
  byId: Map<string, ChatMessage>;
  /** Bu sayfada şimdiye dek görülen en eski mesaj — sonraki sayfanın imleci */
  oldest: { snap: QueryDocumentSnapshot; createdAt: number } | null;
  full: boolean;
}

function mergeSegment(prev: Segment | undefined, page: MessagePage): Segment {
  const byId = new Map<string, ChatMessage>();
  // En yeni sayfa, yeni mesaj geldikçe kayar ve en eskisini düşürür. Düşen mesaj
  // ekranda kalsın (silme zaten "soft delete"). Yalnızca reddedilen bekleyen
  // yazmalar (pending) gerçekten kaldırılır.
  if (prev) {
    for (const [id, m] of prev.byId) if (!m.pending) byId.set(id, m);
  }
  for (const m of page.messages) byId.set(m.id, m);

  let oldest = prev?.oldest ?? null;
  if (page.oldest) {
    const createdAt = byId.get(page.oldest.id)?.createdAt ?? 0;
    if (!oldest || createdAt < oldest.createdAt) oldest = { snap: page.oldest, createdAt };
  }

  // Önbellekten gelen ilk görüntü eksik olabilir; "daha fazlası var" bilgisini sunucu yanıtı belirler
  const full = page.fromCache ? prev?.full ?? true : page.full;
  return { byId, oldest, full };
}

function replaceAt(list: Segment[], index: number, page: MessagePage): Segment[] {
  const next = list.slice();
  next[index] = mergeSegment(list[index], page);
  return next;
}

/**
 * Bir konuşmanın mesajlarını Firebase Firestore üzerinden sayfalı ve gerçek
 * zamanlı dinler. Açılışta yalnızca son `pageSize` mesaj okunur; `loadMore` her
 * çağrıldığında bir önceki sayfa eklenir. Yüklenen sayfalar tekrar okunmaz.
 * baseUrl kullanılmaz.
 */
export function useMessages(
  conversationId: string | null,
  { pageSize = DEFAULT_MESSAGE_PAGE_SIZE }: UseMessagesOptions = {},
): UseMessagesResult {
  const { firestore, firebaseReady, firebaseError } = useChatContext();
  /** 0 = en yeni sayfa (canlı), 1.. = eski sayfalar */
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(Boolean(conversationId));
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const segmentsRef = useRef<Segment[]>([]);
  segmentsRef.current = segments;
  const unsubsRef = useRef<Unsubscribe[]>([]);
  const inFlightRef = useRef(false);

  useEffect(() => {
    setSegments([]);
    setLoadingMore(false);
    inFlightRef.current = false;

    if (!conversationId) {
      setLoading(false);
      setError(null);
      return;
    }

    if (firebaseError) {
      setError(firebaseError);
      setLoading(false);
      return;
    }

    if (!firebaseReady || !firestore) {
      setLoading(true);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubs: Unsubscribe[] = [];
    unsubsRef.current = unsubs;

    unsubs.push(
      subscribeMessagePage(
        firestore,
        conversationId,
        { pageSize },
        (page) => {
          setSegments((prev) => replaceAt(prev, 0, page));
          if (!page.fromCache || page.messages.length > 0) setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        },
      ),
    );

    return () => {
      for (const u of unsubs) u();
      unsubsRef.current = [];
    };
  }, [conversationId, firestore, firebaseReady, firebaseError, pageSize]);

  const loadMore = useCallback(() => {
    const segs = segmentsRef.current;
    const last = segs[segs.length - 1];
    if (!firestore || !conversationId || inFlightRef.current || !last?.full) return;

    let cursor: Segment["oldest"] = null;
    for (const s of segs) {
      if (s?.oldest && (!cursor || s.oldest.createdAt < cursor.createdAt)) cursor = s.oldest;
    }
    if (!cursor) return;

    const index = segs.length;
    inFlightRef.current = true;
    setLoadingMore(true);

    unsubsRef.current.push(
      subscribeMessagePage(
        firestore,
        conversationId,
        { pageSize, after: cursor.snap },
        (page) => {
          setSegments((prev) => replaceAt(prev, index, page));
          if (!page.fromCache && inFlightRef.current) {
            inFlightRef.current = false;
            setLoadingMore(false);
          }
        },
        (err) => {
          setError(err);
          inFlightRef.current = false;
          setLoadingMore(false);
        },
      ),
    );
  }, [firestore, conversationId, pageSize]);

  const messages = useMemo(() => {
    const all = new Map<string, ChatMessage>();
    // Eski sayfadan yeniye: aynı mesaj birden fazla sayfadaysa en yeni sayfadaki kazanır
    for (let i = segments.length - 1; i >= 0; i--) {
      for (const [id, m] of segments[i]?.byId ?? []) all.set(id, m);
    }
    return [...all.values()].sort(
      (a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id),
    );
  }, [segments]);

  const hasMore = loadingMore || Boolean(segments[segments.length - 1]?.full);

  return { messages, loading, error, hasMore, loadingMore, loadMore };
}
