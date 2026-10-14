/**
 * İki kullanıcı arasındaki birebir (DM) konuşma için deterministik Firestore
 * konuşma ID'si üretir. Sıra fark etmez: (a,b) ve (b,a) aynı ID'yi verir.
 *
 * ```ts
 * directConversationId("19", "319") // "dm_19_319"
 * directConversationId("319", "19") // "dm_19_319"
 * ```
 */
export function directConversationId(a: string, b: string): string {
  const na = Number(a);
  const nb = Number(b);

  let first = a;
  let second = b;

  if (Number.isFinite(na) && Number.isFinite(nb)) {
    if (nb < na) {
      first = b;
      second = a;
    }
  } else if (b < a) {
    first = b;
    second = a;
  }

  return `dm_${first}_${second}`;
}

/**
 * `directConversationId` çıktısını katılımcı ID'lerine ayırır.
 * Biçim uymuyorsa null döner.
 *
 * ```ts
 * parseDirectConversationId("dm_19_319") // ["19", "319"]
 * ```
 */
export function parseDirectConversationId(
  conversationId: string,
): [string, string] | null {
  const m = /^dm_([^_]+)_([^_]+)$/.exec(conversationId);
  return m ? [m[1]!, m[2]!] : null;
}
