const status=document.querySelector('#lab-loading');
const retry=document.querySelector('#lab-retry');
import {parametrosPublicos} from './disponibilidad-curso.mjs';
const publicURL=new URL(location.href);publicURL.search=parametrosPublicos(publicURL.search).toString();
history.replaceState(history.state,'',publicURL.href);
retry.onclick=()=>location.reload();
try{
 await import('./multinodo.mjs?v=d5046c6d5f737151');
 status.hidden=true;
}catch(error){
 status.textContent='No se ha podido cargar el laboratorio. Vuelve a intentarlo.';
 retry.hidden=false;
 console.error('Carga del laboratorio:',error);
}
