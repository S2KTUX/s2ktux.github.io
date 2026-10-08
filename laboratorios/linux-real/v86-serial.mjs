// Agrupa la salida para no escribir en el terminal carácter a carácter.
// No elimina bytes: conserva UTF-8 y las secuencias del terminal entre bloques.
export function createSerialOutput(onText, schedule=setTimeout, cancel=clearTimeout) {
  const decoder=new TextDecoder(),bytes=new Uint8Array(8192);
  let size=0,timer=null;
  function flush(){
    if(timer!==null){cancel(timer);timer=null;}
    if(!size)return;
    const length=size;size=0;
    const text=decoder.decode(bytes.subarray(0,length),{stream:true});
    if(text)onText(text);
  }
  return{flush,push(byte){
    if(size===bytes.length)flush();
    bytes[size++]=byte;
    if(timer===null)timer=schedule(flush,0);
  }};
}

// El historial de depuración no debe crecer indefinidamente con yes/journal.
// La salida del programa sigue llegando íntegra a xterm (scrollback propio).
export function appendTranscript(previous,text,limit=4*1048576){
  const combined=previous+text;
  return combined.length>limit?combined.slice(-limit):combined;
}
