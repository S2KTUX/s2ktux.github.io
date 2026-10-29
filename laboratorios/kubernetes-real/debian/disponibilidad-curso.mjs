// La publicación solo abre escenarios con comprobación nativa completa.
export const avanzadoPublicado=true;
export const claseDisponible=number=>Number.isInteger(number)&&number>=0&&number<=(avanzadoPublicado?34:23);
export const nivelDisponible=level=>level==='inicial'||level==='intermedio'||(avanzadoPublicado&&level==='avanzado');
export const limiteNodos=level=>level==='inicial'?1:level==='intermedio'?2:avanzadoPublicado&&level==='avanzado'?3:0;
export function parametrosPublicos(input){
 const params=new URLSearchParams(input);
 params.set('mode','course');params.set('factory','v6');params.set('tls','classical');params.set('persistent-network','1');
 for(const key of ['fast','policies','netpol','use-scheduling-api'])params.delete(key);
 if(params.get('level')==='avanzado'){params.set('factory',['montaje-cluster','ha-cluster'].includes(params.get('escenario'))?'v14':'v15');params.set('use-scheduling-api','1');}
 else params.delete('escenario');
 return params;
}
