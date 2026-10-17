// Solo un panic de ARRANQUE, con el formato del kernel. Buscar la frase
// suelta confundía el eco de grep/comandos de diagnóstico con un fallo real.
export function panicDeArranque(transcript,ready){
 if(ready)return false;
 const text=transcript.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'');
 return /(?:^|\n)(?:\[\s*\d+(?:\.\d+)?\]\s*)?Kernel panic - not syncing:/.test(text);
}
