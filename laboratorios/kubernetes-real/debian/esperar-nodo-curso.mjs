// kubeadm join completa el bootstrap TLS antes de garantizar que el objeto
// Node sea visible. Esperar registro y Ready dentro de UN mismo plazo.
export function ordenEsperarNodoCurso(name,seconds=180){
 if(!/^cka-w[12]$/.test(name))throw Error('Worker fuera del laboratorio');
 if(!Number.isInteger(seconds)||seconds<10||seconds>180)throw Error('Plazo de nodo no admitido');
 return `deadline=$(($(date +%s)+${seconds})); while ! kubectl get node ${name} --request-timeout=5s -o name >/dev/null 2>&1; do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 2; done; remaining=$((deadline-$(date +%s))); test "$remaining" -gt 0; kubectl wait --for=condition=Ready node/${name} --request-timeout=10s --timeout="\${remaining}s"`;
}
