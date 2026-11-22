import fs from 'node:fs';
import {basesPublicadas,revisionesCompatibles} from '../laboratorios/kubernetes-real/debian/bases-publicadas.mjs';
const current=fs.readFileSync('laboratorios/kubernetes-real/debian/multinodo.mjs','utf8').match(/const cleanRevision='([a-f0-9]+)'/)[1];
const old=basesPublicadas[0].revision,file='laboratorios/kubernetes-real/debian/bases-publicadas.mjs';
if(current!==old){
 let text=fs.readFileSync(file,'utf8');
 if(!revisionesCompatibles[current])text=text.replace('export const revisionesCompatibles=Object.freeze({','export const revisionesCompatibles=Object.freeze({\n '+JSON.stringify(current)+':Object.freeze('+JSON.stringify([old,...(revisionesCompatibles[old]||[])])+'),');
 text=text.replaceAll('"revision":"'+old+'"','"revision":"'+current+'"').replaceAll("revision:'"+old+"'","revision:'"+current+"'");fs.writeFileSync(file,text);
}
console.log(current);
