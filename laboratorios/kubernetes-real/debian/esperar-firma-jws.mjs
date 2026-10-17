// La API puede estar arrancando. Un fallo transitorio de kubectl dentro de
// una asignación no debe cortar el bucle por set -e; la firma sigue siendo
// obligatoria y el plazo permanece acotado.
export function ordenEsperarFirmaJWS(tokenId,seconds=120){
 if(!/^[a-z0-9]{6}$/.test(tokenId)||![90,120].includes(seconds))throw Error('Espera JWS inválida');
 return `deadline=$(($(date +%s)+${seconds})); while test "$(date +%s)" -lt "$deadline"; do if signature=$(kubectl --request-timeout=15s -n kube-public get cm cluster-info -o jsonpath='{.data.jws-kubeconfig-${tokenId}}'); then test -n "$signature" && exit 0; fi; sleep 2; done; exit 1`;
}
