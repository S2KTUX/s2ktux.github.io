const status=document.querySelector('#lab-loading');
const retry=document.querySelector('#lab-retry');
retry.onclick=()=>location.reload();
try{
 await import('./multinodo.mjs');
 status.hidden=true;
}catch(error){
 status.textContent='No se ha podido cargar el laboratorio. Vuelve a intentarlo.';
 retry.hidden=false;
 console.error('Carga del laboratorio:',error);
}
