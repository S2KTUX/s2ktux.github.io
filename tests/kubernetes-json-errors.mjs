import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {exigirJSON} from '../laboratorios/kubernetes-real/debian/comprobaciones-json.mjs';
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
const query='kubectl get --raw=/apis/metrics.k8s.io/v1beta1/nodes --request-timeout=20s | jq -e true';
const guarded=exigirJSON(query);
assert.match(guarded,/object=\$\(kubectl get --raw=/);assert.equal(exigirJSON(guarded),guarded);
// Reproduce deliberadamente jq sin entrada devolviendo cero. La protección
// tiene que rechazar la consulta antes de que llegue a ese falso éxito.
for(const [mode,ok]of [['server-error',false],['empty',false],['json',true]]){
 const source=`kubectl(){ case '${mode}' in server-error) echo NotFound >&2; return 1;; empty) return 0;; json) echo '{"items":[{}]}';; esac; }; jq(){ input=$(cat); test -z "$input" || test "$input" = '{"items":[{}]}'; }; ${guarded}`;
 const result=spawnSync(bash,['--noprofile','--norc','-c',source],{encoding:'utf8'});assert.equal(result.status===0,ok,mode+' '+result.stderr);
}
assert.equal(exigirJSON('kubectl get --raw=/readyz'), 'kubectl get --raw=/readyz');
assert.match(exigirJSON('kubectl get pods -o json | jq -e true'),/object=\$\(kubectl/);
assert.match(exigirJSON('etcdutl snapshot status /opt/backup.db -w json | jq -e true'),/object=\$\(etcdutl/);
console.log('Consultas JSON normales y --raw: un error o una respuesta vacía no se convierten en un éxito de jq.');
