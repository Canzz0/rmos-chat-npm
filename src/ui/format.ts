/** createdAt (ms) → "14:08" gibi saat:dakika. */
export function formatTime(ms: number): string {
  if (!ms) return "";
  try {
    return new Date(ms).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/** Liste için kısa zaman: bugün → "14:08", dün → "Dün", aksi halde "12.10.2026". */
export function formatListTime(ms: number): string {
  if (!ms) return "";
  try {
    const d = new Date(ms);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (ms >= startOfToday) return formatTime(ms);
    if (ms >= startOfToday - 86_400_000) return "Dün";
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
