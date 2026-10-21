import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const source=await readFile(process.argv[2],'utf8'),canonical=source.replaceAll('\r\n','\n');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
if(hash(canonical)!=='fab8d6e8933e44f8af7398603fb63122e4ea6490f0af83549108d68647edd9e9')throw Error('El manifiesto original v0.0.34 no coincide');
let yaml=canonical;
function replace(from,to){if(yaml.split(from).length!==2)throw Error('Manifiesto inesperado');yaml=yaml.replace(from,to);}
replace('image: rancher/local-path-provisioner:v0.0.34','image: s2ktux/local-path-lab:0.0.34');
replace('      serviceAccountName: local-path-provisioner-service-account\n      containers:\n','      serviceAccountName: local-path-provisioner-service-account\n      nodeSelector:\n        kubernetes.io/hostname: cka-cp1\n      tolerations:\n        - key: node-role.kubernetes.io/control-plane\n          operator: Exists\n          effect: NoSchedule\n      containers:\n');
replace('      tolerations:\n        - key: node.kubernetes.io/disk-pressure','      tolerations:\n        - key: node-role.kubernetes.io/control-plane\n          operator: Exists\n          effect: NoSchedule\n        - key: node.kubernetes.io/disk-pressure');
replace('        image: busybox\n','        image: busybox:1.37.0-musl\n');
const root=new URL('../laboratorios/kubernetes-real/',import.meta.url),dir=new URL('recursos/almacenamiento-v1/',root);await mkdir(dir,{recursive:true});
const packed=gzipSync(Buffer.from(yaml),{level:9});await writeFile(new URL('local-path.yaml.gz',dir),packed);
await writeFile(new URL('local-path-original.yaml',dir),canonical);
await writeFile(new URL('debian/almacenamiento-paquete.mjs',root),"// Manifiesto Rancher v0.0.34: misma lógica, imagen linux/386 y ubicación del laboratorio.\nexport const almacenamientoHash='"+hash(packed)+"';\n");
console.log('Manifiesto de almacenamiento generado: '+packed.length+' bytes, SHA256 '+hash(packed));
