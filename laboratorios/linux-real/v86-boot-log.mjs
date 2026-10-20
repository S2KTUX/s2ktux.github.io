// Lee únicamente registros producidos por el invitado. No representa un arranque nuevo.
// Las marcas se generan dentro de Linux y se excluyen de la salida visible.
export function createGuestBootLog(nonce,onText){
 if(!/^[a-f0-9]{24}$/.test(nonce))throw Error('Identificador de lectura inválido');
 const begin='__BOOTLOG_'+nonce+'_BEGIN',end='__BOOTLOG_'+nonce+'_END';
 let line='',active=false,finished=false;
 return{
  command:"{ printf '\\n"+begin+"\\n'; (journalctl -b -k -n 18 --no-pager -o short-monotonic 2>/dev/null || dmesg --color=never | tail -n 18); systemctl list-units --type=service --state=running --no-pager --no-legend; printf '\\n"+end+"\\n'; }",
  receive(text){if(finished)return;for(const character of text){line+=character;if(character!=='\n')continue;const plain=line.replace(/\r|\x1b\[[0-?]*[ -/]*[@-~]/g,'').trim();if(plain===begin)active=true;else if(plain===end){active=false;finished=true;}else if(active)onText(line);line='';}},
  get finished(){return finished;}
 };
}
