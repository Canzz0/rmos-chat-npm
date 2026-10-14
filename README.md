# @rmosyazilim/chat-widget

Rmos Yazılım Otel uygulamaları için gerçek zamanlı chat widget.

Sayfaya bir buton ekler. Tıklayınca kişi listesi açılır, kişiye tıklayınca sohbet başlar. Light/dark temayı host sayfadan otomatik alır.

Entegrasyon için yalnızca `token` ve `userId` gerekir.

---

## Kurulum

```bash
npm install @rmosyazilim/chat-widget firebase
```

Gerekenler: `react` / `react-dom` (>=18), `firebase` (^11).

---

## Kullanım

```tsx
import { RmosChat } from "@rmosyazilim/chat-widget";

// Menüde ikon + yazı
<RmosChat token={token} userId="19" label="Mesajlar" />

// Sadece ikon
<RmosChat token={token} userId="19" />

// Sağ altta sabit balon
<RmosChat token={token} userId="19" floating />
```

**Akış:** buton → kişi listesi → sohbet. Dışarı tıkla veya `Esc` ile kapanır.

### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|-----------|----------|
| `token` | `string` | — | RMOS oturum token'ı (zorunlu) |
| `userId` | `string` | — | Kullanıcı ID (zorunlu) |
| `floating` | `boolean` | `false` | Sağ/sol altta sabit balon |
| `position` | `"bottom-right" \| "bottom-left"` | `"bottom-right"` | Floating konumu |
| `title` | `string` | `"Mesajlar"` | Kart başlığı |
| `description` | `string` | `"Kişilerinizle gerçek zamanlı sohbet."` | Liste açıklaması |
| `label` | `string` | — | Buton yazısı |
| `defaultOpen` | `boolean` | `false` | Açık başlasın mı |
| `className` | `string` | — | Buton CSS sınıfı |
| `style` | `CSSProperties` | — | Sarmalayıcı stili |

---

## Tema

Host sayfanın temasını otomatik takip eder (`.dark` / `.light`, `data-theme` vb.).

```tsx
import { useHostTheme } from "@rmosyazilim/chat-widget";

const theme = useHostTheme(); // "light" | "dark"
```

---

## Kendi arayüzünüz

Hazır widget yerine kendi UI'nızı yazmak için:

```tsx
import {
  ChatProvider,
  useUsers,
  useMessages,
  useSendMessage,
  directConversationId,
} from "@rmosyazilim/chat-widget";

function ChatRoom({ myId, otherId }: { myId: string; otherId: string }) {
  const conversationId = directConversationId(myId, otherId);
  const { messages } = useMessages(conversationId);
  const { send } = useSendMessage();

  return (
    <button onClick={() => send(conversationId, "Merhaba")}>
      {messages.length} mesaj
    </button>
  );
}

<ChatProvider token={token} userId="19">
  <ChatRoom myId="19" otherId="320" />
</ChatProvider>
```

Diğer export'lar: `ChatThread`, `ConversationList`, `MessageList`, `MessageBubble`, `MessageInput`, `Avatar`, `useChatContext`, `useConversations`, `useGet`, `usePost`, `detectHostTheme`, `getUserFullName`.
