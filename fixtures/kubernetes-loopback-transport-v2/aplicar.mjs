import {createHash} from 'node:crypto';
const sha=value=>createHash('sha256').update(value).digest('hex');
export function aplicarTransporteLoopback(source){
 if(typeof source!=='string'||sha(source)!=='807abf09cba645f3d4ee259caa4504993b7db1b02a580b4ce4e9119254f200ed')throw Error('La fuente no es cache.go de Kubernetes 1.36.5 comprobado');
 const marker='\tvar transport http.RoundTripper = httpTransport';
 if(source.split(marker).length!==2)throw Error('Punto de inserción ambiguo');
 const modified=source.replace(marker,'\tbrowserLoopbackTransportBudget(config, httpTransport)\n'+marker);
 if(sha(modified)!=='c0c2b004281979bd628166a9465fa64a48c9f9a523811a6dd4fdf0a783bb3769')throw Error('El parche difiere del candidato comprobado');
 return modified;
}
