const allowed = new Set(['linux', 'docker', 'kubernetes']);
const requested = new URLSearchParams(location.search).get('mode');

// La portada de selección no necesita cargar el simulador completo.
// El motor elegido se descarga únicamente después de entrar en una sala.
if (!requested || !allowed.has(requested)) {
  document.documentElement.dataset.terminalState = 'selector';
} else {
  const mode = requested;
  try {
    const [{ default: engine }, { default: runtime }, { startTerminal }] = await Promise.all([
      import(`./terminal-engine-${mode}.js`),
      import(`./terminal-runtime-${mode}.js`),
      import('./terminal-core.js?v=20260822-realism5')
    ]);
    startTerminal(engine, runtime);
    try {
      const { attachTerminalRenderer } = await import('./terminal-xterm-renderer.js?v=20260822-6');
      await attachTerminalRenderer();
    } catch (rendererError) {
      console.warn('Se usa el renderizador de compatibilidad de la terminal.', rendererError);
      document.documentElement.dataset.terminalRendererError = rendererError instanceof Error
        ? rendererError.message
        : String(rendererError);
    }
  } catch (error) {
    console.error('No se pudo cargar el motor de terminal.', error);
    document.documentElement.dataset.terminalState = 'error';
    const body = document.getElementById('term-body');
    const line = document.getElementById('term-input-line');
    const input = document.getElementById('term-input');
    const prompt = document.getElementById('term-prompt');
    if (body && line) {
      const message = document.createElement('div');
      message.className = 'term-out';
      message.style.color = '#ef8a7a';
      message.textContent = 'No se pudo cargar esta máquina. Comprueba la conexión y vuelve a intentarlo.';
      body.insertBefore(message, line);
    }
    if (prompt) prompt.textContent = '';
    if (input) { input.disabled = true; input.removeAttribute('autofocus'); }
  }
}
