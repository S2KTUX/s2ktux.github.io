// Transporte dentro del navegador. El archivo se reconstruye con gzip/base64
// reales dentro de Debian; no hay un backend que ejecute órdenes.
export async function comandosArchivoGzipWeb(path,text){
 if(!/^\/tmp\/[A-Za-z0-9._+-]+$/.test(path)||typeof text!=='string')throw Error('Archivo temporal inválido');
 const bytes=new TextEncoder().encode(text);if(bytes.length>2*1048576)throw Error('Archivo demasiado grande');
 const packed=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
 const data=btoa(Array.from(packed,byte=>String.fromCharCode(byte)).join('')),temporary=path+'.upload.gz',commands=[`: > ${temporary}`];
 for(let at=0;at<data.length;at+=1200)commands.push(`printf '%s' '${data.slice(at,at+1200)}' | base64 -d >> ${temporary}`);
 commands.push(`gzip -dc ${temporary} > ${path} && rm -f ${temporary}`);return commands;
}
