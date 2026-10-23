// El estado serializado es una copia de la VM, no su RAM en ejecución.
// Solo se consume cuando el llamador cede expresamente esa copia temporal.
export async function comprimirEstado(state,{consumir=false}={}){
 if(typeof consumir!=='boolean')throw Error('Propiedad del estado inválida');
 let bytes;try{bytes=Object.getOwnPropertyDescriptor(ArrayBuffer.prototype,'byteLength').get.call(state);}catch{throw Error('Estado serializado inválido');}
 if(!bytes)throw Error('Estado serializado inválido');
 const source=new Blob([state]);
 // Blob ya conserva sus bytes inmutables. Soltar la copia original antes de
 // comprimir evita retener dos buffers de más de 1 GiB durante el guardado.
 const transfer=ArrayBuffer.prototype.transfer;
 if(consumir&&typeof transfer==='function')transfer.call(state,0);
 const packed=await new Response(source.stream().pipeThrough(new CompressionStream('gzip'))).blob();
 return {bytes,packed};
}
