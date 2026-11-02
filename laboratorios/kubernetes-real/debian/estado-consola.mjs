const clean=text=>text.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'');
export class EstadoConsola{
 idle=false;
 receive(transcript){
  // El prompt solo puede estar en la última línea, esperando la entrada.
  // No volver a limpiar cientos de miles de caracteres por cada bloque UART.
  const start=transcript.lastIndexOf('\n')+1;
  if(transcript.length-start>65536)return;
  if(/(?:^|\n)\[[^\n@\]]+@[^\n\]]+ [^\n\]]*\][#$] $/.test(clean(transcript.slice(start))))this.idle=true;
 }
 input(text){if(!/^\x1b\[\d+;\d+R$/.test(text))this.idle=false;}
}
