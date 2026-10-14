import { ChatHttpError, type RequestOptions } from "../types";

function joinUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

const STATUS_MESSAGES: Record<number, string> = {
  401: "Yetkilendirme başarısız. Token geçersiz veya süresi dolmuş.",
  403: "Bu işlem için yetkiniz yok.",
  404: "İstenen kaynak bulunamadı.",
  429: "Çok fazla istek gönderildi. Biraz bekleyip tekrar deneyin.",
};

function errorMessage(status: number, message?: string): string {
  const known = STATUS_MESSAGES[status];
  if (known) return known;
  if (status >= 500) return "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
  return message || "Bir hata oluştu. Tekrar deneyin.";
}

export async function request<T>(
  baseUrl: string,
  token: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, signal, headers = {} } = options;

  let res: Response;
  try {
    res = await fetch(joinUrl(baseUrl, path), {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.");
  }

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new ChatHttpError(
      res.status,
      errorMessage(res.status, payload?.message),
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
