import { useEffect } from "react";

const STYLE_ID = "rmos-chat-styles";

/**
 * Tüm bileşenlerin stilleri. Çalışma anında <head>'e bir kez enjekte edilir;
 * böylece paketi kullananın ayrıca CSS import etmesi gerekmez.
 *
 * Renkler CSS değişkenleri (token) üzerinden tanımlı ve `data-rmos-theme="dark"`
 * altında yeniden atanıyor; tema host sayfadan (useHostTheme) okunur.
 * Token değerleri @rmosyazilim/helpdesk ile aynı tasarım dilini paylaşır.
 */
export const RMOS_CSS = `
.rmos-theme {
  --rmos-bg: #ffffff;
  --rmos-fg: #171717;
  --rmos-muted: #737373;
  --rmos-surface: #f5f5f5;
  --rmos-active: #ededed;
  --rmos-border: #e5e5e5;
  --rmos-accent: #171717;
  --rmos-accent-fg: #ffffff;
  --rmos-error-bg: #fef2f2;
  --rmos-error-fg: #b91c1c;
  --rmos-online: #22c55e;
  --rmos-badge: #ef4444;
  --rmos-badge-fg: #ffffff;
  --rmos-radius: 14px;

  color-scheme: light;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--rmos-fg);
}
.rmos-theme[data-rmos-theme="dark"] {
  --rmos-bg: #1c1c1e;
  --rmos-fg: #f5f5f5;
  --rmos-muted: #a3a3a3;
  --rmos-surface: #2a2a2d;
  --rmos-active: #343438;
  --rmos-border: #3a3a3d;
  --rmos-accent: #f5f5f5;
  --rmos-accent-fg: #171717;
  --rmos-error-bg: rgba(239, 68, 68, 0.15);
  --rmos-error-fg: #fca5a5;
  color-scheme: dark;
}
.rmos-theme, .rmos-theme *, .rmos-theme *::before, .rmos-theme *::after { box-sizing: border-box; }
.rmos-theme button { font: inherit; }

/* ---------- Avatar ---------- */
.rmos-avatar { display: inline-flex; align-items: center; gap: 10px; min-width: 0; }
.rmos-avatar__circle {
  position: relative; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%; background: var(--rmos-surface); color: var(--rmos-fg); font-weight: 600; letter-spacing: .3px;
}
.rmos-avatar__dot {
  position: absolute; right: -1px; bottom: -1px; width: 10px; height: 10px;
  border-radius: 50%; background: var(--rmos-online); border: 2px solid var(--rmos-bg);
}
.rmos-avatar__meta { display: flex; flex-direction: column; min-width: 0; line-height: 1.25; }
.rmos-avatar__name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rmos-avatar__id { color: var(--rmos-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ---------- Header / chrome ---------- */
.rmos-header {
  display: flex; align-items: center; gap: 10px; padding: 12px 14px;
  border-bottom: 1px solid var(--rmos-border); background: var(--rmos-bg); flex-shrink: 0; min-height: 56px;
}
.rmos-header__title { font-weight: 600; font-size: 15px; flex: 1; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rmos-brand { display: flex; align-items: flex-start; gap: 8px; min-width: 0; flex: 1; }
.rmos-brand-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.rmos-title { font-size: 15px; font-weight: 600; line-height: 1.3; }
.rmos-title-icon {
  display: inline-flex; flex-shrink: 0; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 8px; background: var(--rmos-surface); color: var(--rmos-fg);
}
.rmos-desc { margin: 0; font-size: 12px; line-height: 1.4; color: var(--rmos-muted); }
.rmos-actions { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
.rmos-iconbtn {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent;
  color: var(--rmos-muted); cursor: pointer; transition: background .15s, color .15s; padding: 0;
}
.rmos-iconbtn:hover { background: var(--rmos-surface); color: var(--rmos-fg); }

/* ---------- Search ---------- */
.rmos-search { position: relative; padding: 10px 12px; border-bottom: 1px solid var(--rmos-border); flex-shrink: 0; }
.rmos-search__icon { position: absolute; left: 22px; top: 50%; transform: translateY(-50%); color: var(--rmos-muted); pointer-events: none; display: inline-flex; }
.rmos-search input {
  width: 100%; height: 36px; padding: 0 12px 0 34px; border: 1px solid var(--rmos-border);
  border-radius: 10px; background: var(--rmos-bg); font: inherit; color: var(--rmos-fg); outline: none;
  transition: border-color .15s;
}
.rmos-search input:focus { border-color: var(--rmos-accent); }
.rmos-search input::placeholder { color: var(--rmos-muted); }

/* ---------- Contact list ---------- */
.rmos-list { flex: 1; overflow-y: auto; min-height: 0; padding: 6px; }
.rmos-row {
  display: flex; align-items: center; width: 100%; padding: 8px 10px;
  border: none; background: transparent; border-radius: 10px; cursor: pointer;
  text-align: left; font: inherit; color: inherit; transition: background .12s;
}
.rmos-row { gap: 10px; }
.rmos-row:hover { background: var(--rmos-surface); }
.rmos-row--active { background: var(--rmos-active); }
.rmos-row__meta { display: flex; flex-direction: column; flex: 1; min-width: 0; line-height: 1.3; gap: 2px; }
.rmos-row__line { display: flex; align-items: center; gap: 8px; min-width: 0; }
.rmos-row__name { flex: 1; min-width: 0; font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rmos-row__time { flex-shrink: 0; font-size: 11px; color: var(--rmos-muted); }
.rmos-row__preview { flex: 1; min-width: 0; font-size: 12px; color: var(--rmos-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rmos-row--unread .rmos-row__preview { color: var(--rmos-fg); font-weight: 600; }
.rmos-row--unread .rmos-row__time { color: var(--rmos-badge); font-weight: 600; }

/* ---------- Okunmamış rozeti ---------- */
.rmos-badge, .rmos-trigger-badge {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px;
  background: var(--rmos-badge); color: var(--rmos-badge-fg);
  font-size: 11px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums;
}
.rmos-trigger-badge {
  position: absolute; top: -6px; right: -8px; pointer-events: none;
  box-shadow: 0 0 0 2px var(--rmos-bg); animation: rmos-badge-in .2s ease;
}
.rmos--floating .rmos-trigger-badge { top: -2px; right: -2px; min-width: 20px; height: 20px; border-radius: 10px; }
.rmos-state { padding: 24px 16px; text-align: center; color: var(--rmos-muted); font-size: 13px; }
.rmos-state--error { color: var(--rmos-error-fg); }

/* ---------- Thread ---------- */
.rmos-thread { display: flex; flex-direction: column; min-width: 0; min-height: 0; flex: 1; background: var(--rmos-bg); }
.rmos-messages { flex: 1; overflow-y: auto; min-height: 0; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.rmos-empty { margin: auto; text-align: center; color: var(--rmos-muted); font-size: 13px; padding: 24px; }

/* ---------- Bubble ---------- */
.rmos-bubble {
  max-width: 80%; padding: 8px 12px; background: var(--rmos-surface); color: var(--rmos-fg);
  align-self: flex-start; word-break: break-word; white-space: pre-wrap; position: relative;
  border-radius: 4px 14px 14px 14px; animation: rmos-fade-up .18s ease;
}
.rmos-bubble--mine { align-self: flex-end; background: var(--rmos-accent); color: var(--rmos-accent-fg); border-radius: 14px 4px 14px 14px; }
.rmos-bubble__time { display: block; margin-top: 3px; font-size: 10px; opacity: .6; text-align: right; }

/* ---------- Composer ---------- */
.rmos-composer { display: flex; align-items: flex-end; gap: 8px; padding: 10px 12px; border-top: 1px solid var(--rmos-border); background: var(--rmos-bg); flex-shrink: 0; }
.rmos-composer textarea {
  flex: 1; resize: none; max-height: 120px; min-height: 38px; padding: 9px 12px; border: 1px solid var(--rmos-border);
  border-radius: 10px; font: inherit; color: var(--rmos-fg); outline: none; background: var(--rmos-bg); line-height: 1.4;
  transition: border-color .15s;
}
.rmos-composer textarea:focus { border-color: var(--rmos-accent); }
.rmos-composer textarea:disabled { background: var(--rmos-surface); cursor: not-allowed; }
.rmos-send {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 38px; height: 38px; border-radius: 10px; border: none; background: var(--rmos-accent); color: var(--rmos-accent-fg);
  cursor: pointer; transition: filter .15s, opacity .15s, transform .15s;
}
.rmos-send:hover:not(:disabled) { filter: brightness(1.12); }
.rmos-send:active:not(:disabled) { transform: scale(.95); }
.rmos-send:disabled { opacity: .45; cursor: not-allowed; }

/* ---------- Trigger (buton) + popover card ---------- */
.rmos { display: inline-flex; vertical-align: middle; }
.rmos--floating { position: fixed; right: 24px; bottom: 24px; z-index: 2147483000; }
.rmos--floating.rmos--bl { right: auto; left: 24px; }

/* Floating tetikleyici: dolgulu yuvarlak balon (FAB) */
.rmos-trigger {
  position: relative; border: none; background: var(--rmos-accent); color: var(--rmos-accent-fg); margin: 0; padding: 0;
  width: 54px; height: 54px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(0,0,0,.22); cursor: pointer; transition: transform .2s ease, filter .2s ease;
}
.rmos-trigger:hover { filter: brightness(1.1); transform: translateY(-2px); }
.rmos-trigger:active { transform: scale(.94); }
.rmos-trigger:focus-visible { outline: 2px solid var(--rmos-accent); outline-offset: 3px; }

/* Inline tetikleyici: minimal ikon (+ opsiyonel yazı) — sidebar/menü için */
.rmos-trigger--inline {
  width: auto; height: auto; border-radius: 8px; background: transparent; color: var(--rmos-fg);
  box-shadow: none; gap: 8px; padding: 8px 10px; font-weight: 500; white-space: nowrap;
}
.rmos-trigger--inline:hover { background: var(--rmos-surface); filter: none; transform: none; }
.rmos-trigger--inline:active { transform: scale(.97); }

.rmos-trigger-iconwrap { position: relative; display: inline-flex; }
.rmos-trigger-icon { display: inline-flex; animation: rmos-spin-in .25s ease; }

.rmos-card {
  position: fixed; z-index: 2147483001; display: flex; flex-direction: column; overflow: hidden;
  background: var(--rmos-bg); border: 1px solid var(--rmos-border); border-radius: var(--rmos-radius);
  box-shadow: 0 16px 48px rgba(0,0,0,.24); animation: rmos-pop-in .22s cubic-bezier(.2,.9,.3,1.2);
}
.rmos-card__body { flex: 1; min-height: 0; display: flex; flex-direction: column; }

/* ---------- Scrollbar ---------- */
.rmos-list::-webkit-scrollbar, .rmos-messages::-webkit-scrollbar { width: 8px; }
.rmos-list::-webkit-scrollbar-thumb, .rmos-messages::-webkit-scrollbar-thumb { background: var(--rmos-border); border-radius: 8px; }
.rmos-list::-webkit-scrollbar-thumb:hover, .rmos-messages::-webkit-scrollbar-thumb:hover { background: var(--rmos-muted); }

@keyframes rmos-pop-in { from { opacity: 0; transform: translateY(6px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes rmos-fade-up { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes rmos-badge-in { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: scale(1); } }
@keyframes rmos-spin-in { from { opacity: 0; transform: rotate(-90deg) scale(.6); } to { opacity: 1; transform: rotate(0) scale(1); } }

@media (max-width: 480px) {
  .rmos-card { left: 12px !important; right: 12px !important; width: auto !important;
    top: 12px !important; bottom: 12px !important; height: auto !important; max-height: none !important; }
}
@media (prefers-reduced-motion: reduce) {
  .rmos-theme *, .rmos-theme *::before, .rmos-theme *::after {
    animation-duration: .01ms !important; transition-duration: .01ms !important;
  }
}
`;

/** Stilleri bir kez <head>'e enjekte eder (SSR güvenli — yalnızca client'ta). */
export function useRmosStyles(): void {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = RMOS_CSS;
    document.head.appendChild(el);
  }, []);
}
