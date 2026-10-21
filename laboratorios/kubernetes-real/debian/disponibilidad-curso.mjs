// La publicación solo abre escenarios con comprobación nativa completa.
export const claseDisponible=number=>Number.isInteger(number)&&number>=0&&number<=14;
export const nivelDisponible=level=>level==='inicial'||level==='intermedio';
export const limiteNodos=level=>level==='inicial'?1:level==='intermedio'?2:0;
export function parametrosPublicos(input){
 const params=new URLSearchParams(input);
 params.set('mode','course');params.set('factory','v6');params.set('tls','classical');params.set('persistent-network','1');
 for(const key of ['fast','policies','netpol','use-scheduling-api'])params.delete(key);
 return params;
}
