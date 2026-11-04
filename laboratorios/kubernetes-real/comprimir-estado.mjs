// El estado serializado es una copia de la VM, no su RAM en ejecución.
// Solo se consume cuando el llamador cede expresamente esa copia temporal.
export async function comprimirEstado(state,{consumir=false}={}){
 if(typeof consumir!=='boolean')throw Error('Propiedad del estado inválida');
 let bytes;try{bytes=Object.getOwnPropertyDescriptor(ArrayBuffer.prototype,'byteLength').get.call(state);}catch{throw Error('Estado serializado inválido');}
 if(!bytes)throw Error('Estado serializado inválido');
 const transfer=ArrayBuffer.prototype.transfer;
 // No crear un Blob temporal de toda la RAM: Chromium puede volcarlo al
 // disco y fallar al releerlo. Solo el resultado comprimido necesita un Blob.
 let owned=consumir&&typeof transfer==='function'?transfer.call(state):ArrayBuffer.prototype.slice.call(state,0);
 let offset=0;
 const source=new ReadableStream({pull(controller){
  if(offset===bytes){owned=null;controller.close();return;}
  const length=Math.min(1048576,bytes-offset);
  controller.enqueue(new Uint8Array(owned,offset,length).slice());offset+=length;
 },cancel(){owned=null;}});
 const packed=await new Response(source.pipeThrough(new CompressionStream('gzip'))).blob();
 return {bytes,packed};
}
