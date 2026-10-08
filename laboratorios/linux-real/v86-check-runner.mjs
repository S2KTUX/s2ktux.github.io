import { buildProbe, parseProbe, probeTimeoutMs } from './v86-exercises.mjs';

export const cleanSerial = text => text.replace(/\r/g, '').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
export const atShellPrompt = text => /(?:^|\n)(?:V86TEST# |V86USER\$ )$/.test(cleanSerial(text.slice(-1500)).slice(-500));

// Una sola comprobación por consola. No interrumpe vi, passwd ni otro comando.
// La salida interna no llena la terminal: el resultado se presenta en el panel.
export function createCheckRunner(send, idle, timeoutMs) {
  let pending;
  return {
    run(exercise) {
      if (pending || !idle()) return Promise.reject(Error('Vuelve al prompt de Linux, termina el comando o editor y deja la línea vacía antes de comprobar.'));
      const nonce = Array.from(crypto.getRandomValues(new Uint8Array(12)), n => n.toString(16).padStart(2, '0')).join('');
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending = undefined;
          reject(Error('La consulta no terminó a tiempo. No se considera aprobada. Vuelve al prompt o usa Reset si Linux está bloqueado.'));
        }, timeoutMs??Math.max(110000,probeTimeoutMs(exercise)));
        pending = { exercise, nonce, output: '', resolve, reject, timer };
        try { send(buildProbe(exercise, nonce) + '\n'); }
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
        try { result = parseProbe(pending.exercise, pending.nonce, output); }
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
