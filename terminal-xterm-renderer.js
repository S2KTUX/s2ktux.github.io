import { Terminal } from './vendor/xterm/xterm.mjs';
import { FitAddon } from './vendor/xterm/addon-fit.mjs';

const COLOR = {
  '#8fa876':'\x1b[38;2;143;168;118m', '#e08a2e':'\x1b[38;2;224;138;46m',
  '#ef8a7a':'\x1b[38;2;239;138;122m', '#a2957d':'\x1b[38;2;162;149;125m',
  '#a99a86':'\x1b[38;2;169;154;134m', '#e0a458':'\x1b[38;2;224;164;88m',
  '#e9ddc7':'\x1b[38;2;233;221;199m', '#d8cbad':'\x1b[38;2;216;203;173m',
  '#6f6250':'\x1b[38;2;111;98;80m'
};
const RESET = '\x1b[0m';

function loadStyles(href) {
  const current = document.querySelector(`link[href="${href}"]`);
  if (current) return Promise.resolve();
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = href;
  const ready = new Promise((resolve) => { link.addEventListener('load', resolve, { once:true }); link.addEventListener('error', resolve, { once:true }); });
  document.head.append(link);
  return ready;
}

function ansiFor(color) {
  if (!color) return '';
  const compact = color.replace(/\s/g, '').toLowerCase();
  if (COLOR[compact]) return COLOR[compact];
  const rgb = compact.match(/^rgb\((\d+),(\d+),(\d+)\)$/);
  return rgb ? `\x1b[38;2;${rgb[1]};${rgb[2]};${rgb[3]}m` : '';
}

function nodeToAnsi(node, inherited = '') {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const own = ansiFor(node.style?.color) || inherited;
  const text = [...node.childNodes].map((child) => nodeToAnsi(child, own)).join('');
  return own ? `${own}${text}${RESET}` : text;
}

function insertText(input, text) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  input.setRangeText(text, start, end, 'end');
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function deleteBackward(input) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  if (start !== end) input.setRangeText('', start, end, 'end');
  else if (start > 0) input.setRangeText('', start - 1, start, 'end');
}

export async function attachTerminalRenderer() {
  const windowEl = document.querySelector('.terminal-window');
  const host = document.getElementById('term-xterm');
  const body = document.getElementById('term-body');
  const line = document.getElementById('term-input-line');
  const prompt = document.getElementById('term-prompt');
  const input = document.getElementById('term-input');
  if (!windowEl || !host || !body || !line || !prompt || !input) return;

  await Promise.all([loadStyles('./vendor/xterm/xterm.css?v=6.0.0'), loadStyles('./terminal-xterm.css?v=20260822-2')]);
  if (document.fonts?.ready) await document.fonts.ready.catch(() => {});

  const term = new Terminal({
    cursorBlink:true, cursorStyle:'block', convertEol:true, scrollback:2500,
    fontFamily:'"Share Tech Mono", "Cascadia Mono", monospace', fontSize:17,
    lineHeight:1.18, letterSpacing:0, screenReaderMode:true, minimumContrastRatio:4.5,
    theme:{ background:'#12100b', foreground:'#d8cbad', cursor:'#e0a458', cursorAccent:'#12100b', selectionBackground:'#66543b99', black:'#12100b', red:'#ef8a7a', green:'#8fa876', yellow:'#e0a458', blue:'#6b8e9e', magenta:'#b887a4', cyan:'#7aa9a0', white:'#e9ddc7', brightBlack:'#6f6250', brightRed:'#ff9c8f', brightGreen:'#aac991', brightYellow:'#f2bd72', brightBlue:'#91afc0', brightMagenta:'#d1a1bd', brightCyan:'#96c5bc', brightWhite:'#fff7e8' }
  });
  const fit = new FitAddon();
  term.loadAddon(fit);
  // El contenedor debe ser visible antes de calcular filas y columnas.
  // FitAddon no puede medir correctamente un elemento con display:none.
  windowEl.classList.add('xterm-ready');
  term.open(host);
  fit.fit();
  host.setAttribute('aria-label', 'Terminal interactiva S2KTUX');

  let drawingPrompt = false;
  let destroyed = false;
  const promptAnsi = () => ansiFor(prompt.style.color || (prompt.textContent.endsWith('#') ? '#e08a2e' : '#8fa876'));
  const drawPrompt = () => {
    if (destroyed) return;
    drawingPrompt = true;
    const text = prompt.textContent || '';
    term.write(`\r\x1b[2K${text ? `${promptAnsi()}${text}${RESET} ` : ''}${input.value}`);
    const tail = input.value.length - (input.selectionStart ?? input.value.length);
    if (tail > 0) term.write(`\x1b[${tail}D`);
    drawingPrompt = false;
  };
  const writeOutput = (node) => {
    term.write(`\r\x1b[2K${nodeToAnsi(node, ansiFor(node.style?.color))}${RESET}\r\n`);
  };

  [...body.querySelectorAll(':scope > .term-out')].forEach(writeOutput);
  drawPrompt();

  const observer = new MutationObserver((records) => {
    let outputAdded = false;
    let outputRemoved = false;
    for (const record of records) {
      for (const node of record.addedNodes) if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('term-out')) { writeOutput(node); outputAdded = true; }
      for (const node of record.removedNodes) if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('term-out')) outputRemoved = true;
    }
    if (outputRemoved && !body.querySelector('.term-out') && !outputAdded) term.clear();
    queueMicrotask(drawPrompt);
  });
  observer.observe(body, { childList:true });
  new MutationObserver(() => drawPrompt()).observe(prompt, { childList:true, characterData:true, subtree:true, attributes:true });

  const dispatchKey = (key, options = {}) => {
    const event = new KeyboardEvent('keydown', { key, bubbles:true, cancelable:true, ...options });
    const allowed = input.dispatchEvent(event);
    queueMicrotask(drawPrompt);
    return allowed;
  };
  const beforeInput = (data, inputType) => input.dispatchEvent(new InputEvent('beforeinput', { data, inputType, bubbles:true, cancelable:true }));
  const handleData = (data) => {
    if (data === '\r' || data === '\n') { term.write('\r\x1b[2K'); dispatchKey('Enter'); return; }
    if (data === '\x7f') { const allowed = dispatchKey('Backspace'); if (allowed && beforeInput(null, 'deleteContentBackward')) deleteBackward(input); drawPrompt(); return; }
    if (data === '\t') { dispatchKey('Tab'); return; }
    if (data === '\x1b[A') { dispatchKey('ArrowUp'); return; }
    if (data === '\x1b[B') { dispatchKey('ArrowDown'); return; }
    if (data === '\x1b[C') { const allowed = dispatchKey('ArrowRight'); if (allowed) { const p = input.selectionStart ?? 0; input.setSelectionRange(Math.min(input.value.length, p + 1), Math.min(input.value.length, p + 1)); drawPrompt(); } return; }
    if (data === '\x1b[D') { const allowed = dispatchKey('ArrowLeft'); if (allowed) { const p = input.selectionStart ?? 0; input.setSelectionRange(Math.max(0, p - 1), Math.max(0, p - 1)); drawPrompt(); } return; }
    if (data === '\x1b[H' || data === '\x1bOH') { dispatchKey('Home'); input.setSelectionRange(0, 0); drawPrompt(); return; }
    if (data === '\x1b[F' || data === '\x1bOF') { dispatchKey('End'); input.setSelectionRange(input.value.length, input.value.length); drawPrompt(); return; }
    const controls = { '\x03':'c', '\x04':'d', '\x0c':'l', '\x12':'r', '\x1a':'z', '\x01':'a', '\x05':'e', '\x0b':'k', '\x15':'u', '\x17':'w', '\x19':'y' };
    if (controls[data]) { dispatchKey(controls[data], { ctrlKey:true }); return; }
    if (data === '\x1b') { dispatchKey('Escape'); return; }
    if (data.startsWith('\x1b')) return;
    if (!beforeInput(data, 'insertText')) return;
    insertText(input, data); drawPrompt();
  };
  term.onData(handleData);
  term.onSelectionChange(() => {});
  host.addEventListener('click', () => term.focus());

  const originalFocus = input.focus.bind(input);
  input.focus = () => { try { term.focus(); } catch (_) { originalFocus(); } };
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');

  document.querySelectorAll('[data-term-key]').forEach((button) => button.addEventListener('click', () => {
    const key = button.dataset.termKey;
    if (key === 'CTRL') { button.dataset.armed = button.dataset.armed === 'true' ? 'false' : 'true'; button.setAttribute('aria-pressed', button.dataset.armed); return; }
    const ctrl = document.querySelector('[data-term-key="CTRL"]');
    if (key === 'FULLSCREEN') { document.getElementById('term-fullscreen')?.click(); return; }
    const map = { ESC:'\x1b', TAB:'\t', UP:'\x1b[A', DOWN:'\x1b[B', LEFT:'\x1b[D', RIGHT:'\x1b[C' };
    if (ctrl?.dataset.armed === 'true') { ctrl.dataset.armed = 'false'; ctrl.setAttribute('aria-pressed', 'false'); const letter = key.length === 1 ? key.toLowerCase() : 'c'; dispatchKey(letter, { ctrlKey:true }); }
    else if (map[key]) handleData(map[key]);
    term.focus();
  }));

  const fullscreen = document.getElementById('term-fullscreen');
  const syncFullscreen = () => { fullscreen?.setAttribute('aria-label', document.fullscreenElement ? 'Salir de pantalla completa' : 'Abrir terminal a pantalla completa'); setTimeout(() => fit.fit(), 80); };
  fullscreen?.addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await windowEl.requestFullscreen(); } catch (_) {} syncFullscreen(); term.focus(); });
  document.addEventListener('fullscreenchange', syncFullscreen);
  const resize = new ResizeObserver(() => { try { fit.fit(); drawPrompt(); } catch (_) {} });
  resize.observe(host);
  addEventListener('beforeunload', () => { destroyed = true; observer.disconnect(); resize.disconnect(); term.dispose(); }, { once:true });
  term.focus();
}
