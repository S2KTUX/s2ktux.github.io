// Bloques comprobados también en la consola del Worker: el límite del
// comprobador por sí solo no demuestra que la consola reciba la línea.
// No enviar el fichero entero como una sola orden ni cambiar sus bytes.
export function comandosArchivoSerie(path,text){
 if(!/^\/(tmp|etc\/kubernetes(?:\/patches)?)\/[A-Za-z0-9._+-]+$/.test(path)||typeof text!=='string')throw Error('Archivo de preparación no válido');
 const bytes=new TextEncoder().encode(text),data=btoa(Array.from(bytes,n=>String.fromCharCode(n)).join(''));
 const commands=[`: > ${path}`];
 for(let at=0;at<data.length;at+=1200)commands.push(`printf '%s' '${data.slice(at,at+1200)}' | base64 -d >> ${path}`);
 return commands;
}
