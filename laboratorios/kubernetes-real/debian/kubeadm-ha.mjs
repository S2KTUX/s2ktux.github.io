// Variante exclusiva de HA en CPU emulada: solo amplía el timeout interno
// de etcd (2 -> 60 s). Conserva TLS, bootstrap, validación de salud y quorum.
import {verifiedDownload} from '../../verified-download.mjs';
import {servirArchivoRuntime} from './archivo-http-local.mjs?v=b2ec8cc5c0062f12';
export const kubeadmHA=Object.freeze({bytes:17703336,archiveSha256:'ad5abc53be9fc1232cc59486ab8a4b0e4b063df1faf296e02126d76181ef3dfe',binarySha256:'9485f9f0eeefa6ef2297ac1d45364678ebd00bd4687623e6a8770a9984f9e02c',version:'v1.35.9+s2ktux.ha.etcd60s'});
export const urlKubeadmHA='https://s2ktux-recursos.pages.dev/kubernetes/kubeadm-ha-v1/'+kubeadmHA.archiveSha256+'/kubeadm-ha.tar.gz';
let pending;
export async function instalarKubeadmHA({id,fresh,bus,run,copyFrame,download=verifiedDownload,serve=servirArchivoRuntime}){
 if(fresh!==true||!['controlplane','worker1','worker2'].includes(id)||typeof run!=='function')throw Error('El kubeadm HA solo se instala al preparar un miembro nuevo');
 // Una descarga y tres instalaciones; jamás se abre la BD del alumno.
 if(!pending)pending=download(urlKubeadmHA,{hash:kubeadmHA.archiveSha256,bytes:kubeadmHA.bytes}).catch(error=>{pending=null;throw error;});
 const bytes=await pending,transfer=await serve(bus,id,bytes,{copyFrame});
 const dir='/opt/kube-lab/kubeadm-ha-etcd60s';
 try{
  const result=await run(id,'Preparar kubeadm para la CPU emulada',`set -eu; test ! -e ${dir}; mkdir -p ${dir}; curl --fail --show-error --max-time 180 ${transfer.url} -o ${dir}/paquete.tar.gz; test "$(sha256sum ${dir}/paquete.tar.gz | cut -d ' ' -f1)" = ${kubeadmHA.archiveSha256}; tar -xzf ${dir}/paquete.tar.gz --no-same-owner --no-same-permissions -C ${dir}; (cd ${dir} && sha256sum -c SHA256SUMS); test "$(sha256sum ${dir}/kubeadm | cut -d ' ' -f1)" = ${kubeadmHA.binarySha256}; install -m 755 ${dir}/kubeadm /usr/bin/kubeadm; test "$(kubeadm version -o short)" = '${kubeadmHA.version}'; rm ${dir}/paquete.tar.gz`,300000);
  if(result?.ok!==true)throw Error('No se instaló el kubeadm HA verificado');
 }finally{transfer.close();}
}
