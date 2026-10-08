// El portapapeles pertenece al navegador, nunca al disco de la VM.
// Leer solo después de un clic derecho; copiar solo tras una selección del usuario.
export function attachTerminalClipboard(terminal, container, {canPaste, notify, clipboard = navigator.clipboard}) {
  let selecting = false;
  const begin = event => { if (event.button === 0) selecting = true; };
  const copy = async () => {
    if (!selecting) return;
    selecting = false;
    const text = terminal.getSelection();
    if (!text) return;
    try {
      if (!clipboard?.writeText) throw Error('Portapapeles no disponible');
      await clipboard.writeText(text);
      notify('Selección copiada.');
    } catch {
      notify('El navegador ha bloqueado la copia automática. Usa Ctrl+Shift+C con el texto seleccionado.');
    }
  };
  const paste = async event => {
    event.preventDefault(); event.stopPropagation();
    if (!canPaste()) { notify('Espera a que la terminal esté disponible para pegar.'); return; }
    try {
      if (!clipboard?.readText) throw Error('Portapapeles no disponible');
      const text = await clipboard.readText();
      if (!canPaste()) { notify('La terminal está ocupada; no se ha pegado nada.'); return; }
      terminal.focus(); terminal.paste(text);
      notify(text ? 'Texto pegado.' : 'El portapapeles está vacío.');
    } catch {
      notify('El navegador ha bloqueado el pegado. Permite el portapapeles para esta página o usa Ctrl+Shift+V.');
    }
  };
  container.addEventListener('mousedown', begin);
  document.addEventListener('mouseup', copy);
  // Captura antes del menú propio de xterm: un solo pegado por clic.
  container.addEventListener('contextmenu', paste, true);
  return () => {
    container.removeEventListener('mousedown', begin);
    document.removeEventListener('mouseup', copy);
    container.removeEventListener('contextmenu', paste, true);
  };
}
