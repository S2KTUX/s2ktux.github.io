import assert from 'node:assert/strict';
import {instalarKubeadmHA,kubeadmHA,urlKubeadmHA} from '../laboratorios/kubernetes-real/debian/kubeadm-ha.mjs';
let downloads=0,closed=0;const commands=[];
const options={fresh:true,id:'controlplane',bus:{},download:async(url,options)=>{downloads++;assert.equal(url,urlKubeadmHA);assert.equal(options.hash,kubeadmHA.archiveSha256);assert.equal(options.bytes,kubeadmHA.bytes);return new ArrayBuffer(4);},serve:async()=>({url:'http://10.77.0.2/lab/runtime-1.35.tar.gz',close(){closed++;}}),run:async(id,label,command,timeout)=>{commands.push(command);assert.equal(timeout,300000);return {ok:true};}};
for(const invalid of [{fresh:false},{id:'student'}])await assert.rejects(instalarKubeadmHA({...options,...invalid}));assert.equal(downloads,0);
for(const id of ['controlplane','worker1','worker2'])await instalarKubeadmHA({...options,id});
assert.equal(downloads,1);assert.equal(closed,3);
for(const command of commands){assert.ok(command.includes(kubeadmHA.archiveSha256));assert.ok(command.includes(kubeadmHA.binarySha256));assert.ok(command.includes(kubeadmHA.version));assert.doesNotMatch(command,/insecure|skip.*tls|rm -rf/);assert.match(command,/test ! -e/);}
await assert.rejects(instalarKubeadmHA({...options,run:async()=>({ok:false})}),/No se instaló/);assert.equal(closed,4,'Liberar el servidor interno incluso si falla la instalación');
console.log('HA: variante de kubeadm exclusiva para miembros nuevos, instalación con doble checksum, descarga compartida y cierre ante fallos. No acredita todavía el arranque nativo.');
