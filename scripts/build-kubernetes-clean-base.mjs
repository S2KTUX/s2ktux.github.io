import {mkdir,open,readFile,writeFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {createGunzip} from 'node:zlib';
import {resolve} from 'node:path';
// Generación manual desde la caché limpia de una prueba propia. Nunca lee la
// base de sesiones del alumno ni exporta una VM después de hacer ejercicios.
const [metadataPath,controlplanePath,workerPath,destination]=process.argv.slice(2);
if(!destination)throw Error('Uso: metadata.json controlplane.gz worker1.gz carpeta-nueva');
const metadata=JSON.parse(await readFile(metadataPath,'utf8'));
if(metadata.format!=='s2ktux-kubernetes-clean-cluster-v1'||metadata.level!=='intermedio'||metadata.nodes?.length!==2)throw Error('No es la base intermedia limpia');
const directory=resolve(destination);await mkdir(directory,{recursive:false});await mkdir(directory+'/fragmentos');
const files={controlplane:controlplanePath,worker1:workerPath};
for(const node of metadata.nodes){
 const file=files[node.id];if(!file)throw Error('Nodo inesperado');
 let packedBytes=0;const hash=createHash('sha256');for await(const chunk of createReadStream(file)){packedBytes+=chunk.length;hash.update(chunk);}
 if(packedBytes!==node.packedBytes||hash.digest('hex')!==node.sha256)throw Error('Estado comprimido alterado: '+node.id);
 let rawBytes=0;for await(const chunk of createReadStream(file).pipe(createGunzip())){rawBytes+=chunk.length;if(rawBytes>node.bytes)throw Error('Estado excesivo');}
 if(rawBytes!==node.bytes)throw Error('Estado descomprimido incompleto');
 const handle=await open(file,'r');node.parts=[];
 try{for(let offset=0;offset<packedBytes;){const buffer=Buffer.alloc(Math.min(8*1048576,packedBytes-offset));let at=0;
  while(at<buffer.length){const {bytesRead}=await handle.read(buffer,at,buffer.length-at,offset+at);if(!bytesRead)throw Error('Lectura incompleta');at+=bytesRead;}
  const sha256=createHash('sha256').update(buffer).digest('hex'),part={offset,bytes:buffer.length,sha256,file:sha256+'.part'};
  await writeFile(directory+'/fragmentos/'+part.file,buffer,{flag:'wx'});node.parts.push(part);offset+=buffer.length;
 }}finally{await handle.close();}
 delete node.file;node.terminalText='';
}
metadata.sourceCommit='fa8ea3c257cb49fab3c1f132fc11318150f2aac3';
const bytes=Buffer.from(JSON.stringify(metadata,null,2)+'\n');await writeFile(directory+'/cluster.json',bytes,{flag:'wx'});
console.log(JSON.stringify({directory,sha256:createHash('sha256').update(bytes).digest('hex'),packedMiB:metadata.nodes.reduce((sum,n)=>sum+n.packedBytes,0)/1048576,parts:metadata.nodes.reduce((sum,n)=>sum+n.parts.length,0)}));
