// kubeadm puede terminar la orden con espacios. Validar sus argumentos,
// no rechazar por ese formato ni ejecutar texto fuera de nuestro clúster.
export function leerJoinCurso(output){
 if(typeof output!=='string')throw Error('No se recibió el comando join');
 const command=output.trim();
 const found=/^kubeadm join 10\.77\.0\.10:6443 --token ([a-z0-9]{6}\.[a-z0-9]{16})\s+--discovery-token-ca-cert-hash sha256:([a-f0-9]{64})$/.exec(command);
 if(!found)throw Error('El comando join no pertenece al clúster del curso');
 return {command,token:found[1],hash:found[2]};
}
