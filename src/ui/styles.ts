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
  --rmos-chat-bg: #f6f7f9;
  --rmos-chat-dots: rgba(15, 23, 42, 0.035);
  --rmos-bubble-in: #ffffff;
  --rmos-bubble-in-fg: #1f2937;
  --rmos-bubble-out: #eaf2fb;
  --rmos-bubble-out-fg: #1f2937;
  --rmos-bubble-shadow: 0 1px 1px rgba(15, 23, 42, 0.06);
  --rmos-tick-read: #4a90d9;
  --rmos-highlight: #8bb8e8;
  --rmos-danger: #dc2626;

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
  --rmos-chat-bg: #18191c;
  --rmos-chat-dots: rgba(255, 255, 255, 0.025);
  --rmos-bubble-in: #26282c;
  --rmos-bubble-in-fg: #e5e7eb;
  --rmos-bubble-out: #2c3846;
  --rmos-bubble-out-fg: #e8eef5;
  --rmos-bubble-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  --rmos-tick-read: #7cb7f0;
  --rmos-highlight: #5d86b3;
  --rmos-danger: #f87171;
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

/* ---------- Thread (WhatsApp tarzı desenli zemin) ---------- */
.rmos-thread {
  display: flex; flex-direction: column; min-width: 0; min-height: 0; flex: 1;
  background-color: var(--rmos-chat-bg);
  background-image: radial-gradient(var(--rmos-chat-dots) 1px, transparent 1px);
  background-size: 18px 18px;
}
.rmos-messages { flex: 1; overflow-y: auto; min-height: 0; padding: 16px 20px; display: flex; flex-direction: column; gap: 2px; }
.rmos-loadmore { display: flex; justify-content: center; padding: 2px 0 10px; flex-shrink: 0; }
.rmos-loadmore button {
  border: 1px solid var(--rmos-border); background: var(--rmos-bg); color: var(--rmos-muted);
  font-size: 12px; padding: 5px 14px; border-radius: 999px; cursor: pointer;
  box-shadow: var(--rmos-bubble-shadow); transition: color .15s, background .15s;
}
.rmos-loadmore button:hover:not(:disabled) { color: var(--rmos-fg); background: var(--rmos-surface); }
.rmos-loadmore button:disabled { cursor: progress; opacity: .7; }
.rmos-empty { margin: auto; text-align: center; color: var(--rmos-muted); font-size: 13px; padding: 24px; }

/* ---------- Bubble ---------- */
.rmos-bubble {
  max-width: 80%; padding: 6px 9px 4px; background: var(--rmos-bubble-in); color: var(--rmos-bubble-in-fg);
  align-self: flex-start; word-break: break-word; white-space: pre-wrap; position: relative;
  border-radius: 0 8px 8px 8px; box-shadow: var(--rmos-bubble-shadow); margin-top: 8px;
  animation: rmos-fade-up .18s ease;
}
.rmos-bubble--mine { align-self: flex-end; background: var(--rmos-bubble-out); color: var(--rmos-bubble-out-fg); border-radius: 8px 0 8px 8px; }
/* Grubun ilk balonunda kuyruk */
.rmos-bubble::before {
  content: ""; position: absolute; top: 0; left: -7px; width: 8px; height: 13px;
  background: inherit; clip-path: polygon(0 0, 100% 0, 100% 100%);
}
.rmos-bubble--mine::before { left: auto; right: -7px; clip-path: polygon(0 0, 100% 0, 0 100%); }
/* Aynı kişiden ardışık balonlar: kuyruk yok, sıkı aralık */
.rmos-bubble--mine + .rmos-bubble--mine,
.rmos-bubble:not(.rmos-bubble--mine) + .rmos-bubble:not(.rmos-bubble--mine) { margin-top: 0; border-radius: 8px; }
.rmos-bubble--mine + .rmos-bubble--mine::before,
.rmos-bubble:not(.rmos-bubble--mine) + .rmos-bubble:not(.rmos-bubble--mine)::before { display: none; }
.rmos-bubble__meta {
  display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-top: 2px;
  font-size: 10px; line-height: 1; white-space: nowrap;
}
.rmos-bubble__time, .rmos-bubble__edited { opacity: .6; }
.rmos-bubble__edited { font-style: italic; }
.rmos-bubble__deleted { display: inline-flex; align-items: center; gap: 5px; font-style: italic; opacity: .65; }
.rmos-bubble--highlighted { box-shadow: 0 0 0 2px var(--rmos-highlight); }
.rmos-bubble--menu-open { z-index: 3; }

/* ---------- Okundu bilgisi (tik) ---------- */
.rmos-tick { display: inline-flex; align-items: center; opacity: .6; }
.rmos-tick--read { opacity: 1; color: var(--rmos-tick-read); }

/* ---------- Mesaj menüsü (düzenle / sil) ---------- */
.rmos-msgmenu__btn {
  position: absolute; top: 3px; right: 3px; width: 22px; height: 22px; padding: 0; border: none;
  border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
  background: var(--rmos-bubble-out); color: inherit; opacity: 0; transition: opacity .12s;
  box-shadow: -6px 0 8px var(--rmos-bubble-out);
}
.rmos-bubble:hover .rmos-msgmenu__btn, .rmos-msgmenu__btn:focus-visible, .rmos-msgmenu__btn--open { opacity: .85; }
/* Dokunmatik ekranda hover yok: buton hep görünür, metnin üstüne binmesin */
@media (hover: none) {
  .rmos-msgmenu__btn { opacity: .6; }
  .rmos-bubble--actions { padding-right: 30px; }
}
.rmos-menu {
  position: absolute; top: 28px; right: 0; z-index: 5; min-width: 180px; padding: 4px;
  display: flex; flex-direction: column; white-space: normal; text-align: left;
  background: var(--rmos-bg); color: var(--rmos-fg); border: 1px solid var(--rmos-border);
  border-radius: 10px; box-shadow: 0 10px 28px rgba(0,0,0,.18); animation: rmos-pop-in .14s ease;
}
.rmos-menu--up { top: auto; bottom: calc(100% + 4px); }
.rmos-menu__item {
  display: flex; align-items: center; gap: 8px; width: 100%; padding: 7px 10px; border: none;
  border-radius: 6px; background: transparent; color: inherit; font-size: 13px; cursor: pointer; text-align: left;
}
.rmos-menu__item:hover, .rmos-menu__item:focus-visible { background: var(--rmos-surface); outline: none; }
.rmos-menu__item--danger { color: var(--rmos-danger); }
.rmos-menu__note { padding: 6px 10px 4px; font-size: 12px; color: var(--rmos-muted); }

/* ---------- Composer ---------- */
.rmos-composer { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 8px; padding: 10px 12px; border-top: 1px solid var(--rmos-border); background: var(--rmos-surface); flex-shrink: 0; }
.rmos-editbar {
  flex-basis: 100%; display: flex; align-items: center; gap: 8px; padding: 4px 4px 4px 10px;
  border-left: 3px solid var(--rmos-highlight); border-radius: 8px; background: var(--rmos-bg);
}
.rmos-editbar__icon { display: inline-flex; color: var(--rmos-highlight); }
.rmos-editbar__text { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.35; }
.rmos-editbar__title { font-size: 12px; font-weight: 600; color: var(--rmos-highlight); }
.rmos-editbar__orig { font-size: 12px; color: var(--rmos-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
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
  cursor: pointer; transition: filter .15s, opacity .15s;
}
.rmos-send:hover:not(:disabled) { filter: brightness(1.08); }
.rmos-send:disabled { opacity: .45; cursor: not-allowed; }

/* ---------- Trigger (buton) + popover card ---------- */
.rmos { display: inline-flex; vertical-align: middle; }
.rmos--floating { position: fixed; right: 24px; bottom: 24px; z-index: 2147483000; }
.rmos--floating.rmos--bl { right: auto; left: 24px; }

/* Floating tetikleyici: dolgulu yuvarlak balon (FAB) */
.rmos-trigger {
  position: relative; border: none; background: var(--rmos-accent); color: var(--rmos-accent-fg); margin: 0; padding: 0;
  width: 54px; height: 54px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(0,0,0,.22); cursor: pointer; transition: filter .15s ease;
  -webkit-tap-highlight-color: transparent;
}
.rmos-trigger:hover { filter: brightness(1.08); }
.rmos-trigger:focus-visible { outline: 2px solid var(--rmos-accent); outline-offset: 3px; }

/* Inline tetikleyici: minimal ikon (+ opsiyonel yazı) — sidebar/menü için */
.rmos-trigger--inline {
  width: auto; height: auto; border-radius: 8px; background: transparent; color: var(--rmos-fg);
  box-shadow: none; gap: 8px; padding: 8px 10px; font-weight: 500; white-space: nowrap;
}
.rmos-trigger--inline { transition: background .15s ease; }
.rmos-trigger--inline:hover { background: var(--rmos-surface); filter: none; }

.rmos-trigger-iconwrap { position: relative; display: inline-flex; }
.rmos-trigger-icon { display: inline-flex; transition: opacity .1s ease; }
.rmos-trigger:active .rmos-trigger-icon { opacity: .55; }

.rmos-card {
  position: fixed; z-index: 2147483001; display: flex; flex-direction: column; overflow: hidden;
  background: var(--rmos-bg); border: 1px solid var(--rmos-border); border-radius: var(--rmos-radius);
  box-shadow: 0 16px 48px rgba(0,0,0,.24); animation: rmos-pop-in .22s cubic-bezier(.2,.9,.3,1.2);
}
.rmos-card__body { flex: 1; min-height: 0; display: flex; flex-direction: column; }

/* ---------- Yatay (WhatsApp tarzı) iki panel: solda kişiler, sağda sohbet ---------- */
.rmos-split { flex: 1; min-height: 0; display: flex; }
.rmos-sidebar {
  width: 36%; min-width: 260px; max-width: 340px; flex-shrink: 0; min-height: 0;
  display: flex; flex-direction: column; border-right: 1px solid var(--rmos-border); background: var(--rmos-bg);
}
.rmos-main { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; position: relative; }
.rmos-split .rmos-header { height: 64px; background: var(--rmos-surface); }
.rmos-split .rmos-brand { align-items: center; }
.rmos-split .rmos-bubble { max-width: 65%; }
.rmos-welcome {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; padding: 32px; text-align: center; background: var(--rmos-surface);
}
.rmos-welcome__close { position: absolute; top: 16px; right: 14px; }
.rmos-welcome__icon {
  display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px;
  border-radius: 50%; background: var(--rmos-bg); color: var(--rmos-muted); margin-bottom: 4px;
}
.rmos-welcome__title { font-size: 20px; font-weight: 600; color: var(--rmos-fg); }
.rmos-welcome__text { margin: 0; max-width: 320px; font-size: 13px; color: var(--rmos-muted); }

/* ---------- Scrollbar ---------- */
.rmos-list::-webkit-scrollbar, .rmos-messages::-webkit-scrollbar { width: 8px; }
.rmos-list::-webkit-scrollbar-thumb, .rmos-messages::-webkit-scrollbar-thumb { background: var(--rmos-border); border-radius: 8px; }
.rmos-list::-webkit-scrollbar-thumb:hover, .rmos-messages::-webkit-scrollbar-thumb:hover { background: var(--rmos-muted); }

@keyframes rmos-pop-in { from { opacity: 0; transform: translateY(6px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes rmos-fade-up { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes rmos-badge-in { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: scale(1); } }

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
