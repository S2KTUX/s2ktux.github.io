import { buildProbe, parseProbe, probeTimeoutMs } from './v86-exercises.mjs?v=20261009-exam';

export const cleanSerial = text => text.replace(/\r/g, '').replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
// Un aviso del kernel puede llegar después del prompt, sin que Bash esté
// ocupado. Admitir solo sus líneas completas con marca de tiempo; no salida
// arbitraria ni una línea donde el usuario ya haya empezado a escribir.
export const atShellPrompt = text => /(?:^|\n)(?:V86TEST# |V86USER\$ |\[[a-z_][a-z0-9_-]*@[a-zA-Z0-9_.-]+ [^\n\]]*\][#$] |[a-z_][a-z0-9_-]*@[a-zA-Z0-9_.-]+:[^\n]*[#$] )(?:(?:\[\s*\d+\.\d+\][^\n]*\n)|\n)*$/.test(cleanSerial(text.slice(-1500)));

// Una sola comprobación por consola. No interrumpe vi, passwd ni otro comando.
// La salida interna no llena la terminal: el resultado se presenta en el panel.
export function createCheckRunner(send, idle, timeoutMs) {
  let pending;
  return {
    run(exercise, setupCommand) {
      if (pending || !idle()) return Promise.reject(Error('Vuelve al prompt de Linux, termina el comando o editor y deja la línea vacía antes de comprobar.'));
      const nonce = Array.from(crypto.getRandomValues(new Uint8Array(12)), n => n.toString(16).padStart(2, '0')).join('');
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending = undefined;
          reject(Error('La consulta no terminó a tiempo. No se considera aprobada. Vuelve al prompt o usa Reset si Linux está bloqueado.'));
        }, timeoutMs??Math.max(110000,probeTimeoutMs(exercise)));
        pending = { exercise, nonce, output: '', resolve, reject, timer, setup: setupCommand !== undefined };
        try { send((setupCommand !== undefined ? setupCommand + `; printf '\\n__SETUP_${nonce}=%s\\n' "$?"` : buildProbe(exercise, nonce)) + '\n'); }
        catch (error) { clearTimeout(timer); pending = undefined; reject(error); }
      });
    },
    receive(text) {
      if (!pending) return false;
      pending.output += text;
      // Consultar primero solo la cola. Limpiar toda la salida por cada byte
      // encarece las comprobaciones largas, sin cambiar su resultado.
      if (atShellPrompt(pending.output)) {
        const output = cleanSerial(pending.output);
        let result, error;
        try {
          if (pending.setup) {
            const end = new RegExp('(?:^|\\n)__SETUP_' + pending.nonce + '=(\\d+)\\n').exec(output);
            if (end) {
              if (Number(end[1]) !== 0) throw Error('Linux no pudo preparar la consola. Usa Reset o revisa tu sesión.');
              result = {output, serial: pending.output};
            }
          } else result = parseProbe(pending.exercise, pending.nonce, output);
        }
        catch (caught) { error = caught; }
        if (result || error) {
          const task = pending; clearTimeout(task.timer); pending = undefined;
          if (error) task.reject(error); else task.resolve(result);
        }
      }
      return true;
    },
  };
}
