import {comandosArchivoSerie} from '../archivos-serie.mjs';
const debug='tlsmlkem=0';
export function comandosTlsApiServer(){
 const path='/etc/kubernetes/manifests/kube-apiserver.yaml';
 return [
  `set -eu; test -f ${path}; if grep -q '^    env:' ${path}; then grep -q '^    - name: GODEBUG$' ${path}; grep -q '^      value: tlsmlkem=0$' ${path}; else test "$(grep -c '^    image:' ${path})" = 1; awk '/^    image:/ {print "    env:"; print "    - name: GODEBUG"; print "      value: tlsmlkem=0"} {print}' ${path} >/tmp/api-tls-lab.yaml && cp /tmp/api-tls-lab.yaml ${path}; fi`,
  `set -eu; deadline=$(($(date +%s)+180)); while test "$(date +%s)" -lt "$deadline"; do id=$(crictl ps --name kube-apiserver -q | head -1); if test -n "$id" && crictl inspect "$id" | jq -e 'any(.info.runtimeSpec.process.env[]; .=="GODEBUG=tlsmlkem=0")'; then kubectl get --raw=/readyz --request-timeout=10s && exit 0; fi; sleep 3; done; exit 1`
 ];
}
export function comandosTlsLaboratorio(){
 const path='/tmp/kubelet-tls-lab.conf',unit='[Service]\n# Compatibilidad TLS del laboratorio emulado; conserva TLS y certificados.\nEnvironment="GODEBUG=tlsmlkem=0"\n';
 return [...comandosArchivoSerie(path,unit),
  `install -m 644 ${path} /etc/systemd/system/kubelet.service.d/20-tls-lab.conf && if ! grep -Fxq 'export GODEBUG=${debug}' /root/.bash_profile; then printf '\\nexport GODEBUG=${debug}\\n' >>/root/.bash_profile; fi && systemctl daemon-reload && if test -e /etc/kubernetes/kubelet.conf; then systemctl restart kubelet && systemctl is-active --quiet kubelet; fi`];
}
export function ordenEntornoTls(nonce){
 if(!/^[a-f0-9]{24}$/.test(nonce))throw Error('Marcador TLS inválido');
 return `export GODEBUG=${debug}; printf '\\n__DEBIAN_TLS_${nonce}__\\n'\n`;
}
export function entornoTlsConfirmado(text,nonce){
 ordenEntornoTls(nonce);const clean=text.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'');
 return clean.split('\n').includes(`__DEBIAN_TLS_${nonce}__`)&&/\[root@cka-(?:cp1|w1|w2) ~\]# $/.test(clean);
}
