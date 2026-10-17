import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base=new URL('../laboratorios/kubernetes-real/',import.meta.url),file=new URL('publicacion.json',base);
const manifest=JSON.parse(await readFile(file,'utf8'));
for(const record of manifest.files){
 if(!/^[a-zA-Z0-9_.\/-]+$/.test(record.path)||record.path.split('/').includes('..'))throw Error('Ruta fuera de la entrega');
 const bytes=await readFile(new URL(record.path,base));record.bytes=bytes.length;record.sha256=createHash('sha256').update(bytes).digest('hex');
}
await writeFile(file,JSON.stringify(manifest,null,2)+'\n');
console.log('Manifiesto Kubernetes beta actualizado; discos y motor permanecen fijados al commit de recursos.');
