// Preparación fría de HA: los componentes pueden estar sanos antes de que
// termine de arrancar el firmante. Nunca se omite la firma ni el join real.
export async function esperarFirmaHA({tokenId,read,onPending,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),now=()=>performance.now()}){
 if(!/^[a-z0-9]{6}$/.test(tokenId)||[read,onPending,wait,now].some(value=>typeof value!=='function'))throw Error('Espera de firma HA inválida');
 const deadline=now()+600000;
 while(now()<deadline){
  const signature=await read(tokenId);
  if(typeof signature!=='string')throw Error('Respuesta de firma HA inválida');
  if(now()>deadline)break;
  if(signature.trim()){
   if(!/^[A-Za-z0-9_-]+\.\.[A-Za-z0-9_-]+$/.test(signature.trim()))throw Error('Respuesta de firma HA inválida');
   return signature.trim();
  }
  if(now()>=deadline)break;
  await onPending();
  const remaining=deadline-now();if(remaining>0)await wait(Math.min(10000,remaining));
 }
 throw Error('El controlador no ha firmado el token HA dentro de su plazo. No se incorporan otros nodos.');
}
