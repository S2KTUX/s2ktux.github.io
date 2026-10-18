// Correctores de estado: no ejecutan soluciones ni modifican la máquina.
import {publishedPortEntries} from './terminal-network-state.js';
import {parseDockerImageReference} from './terminal-docker-state.js';

const result=(ok,msg)=>({ok:Boolean(ok),msg:ok?msg:'El estado actual todavía no cumple todos los requisitos del enunciado.'});
const lines=text=>String(text||'').split(/\r?\n/).map(line=>line.trim()).filter(line=>line&&!line.startsWith('#'));
const textLines=text=>String(text||'').replace(/\r\n/g,'\n').replace(/\n$/,'').split('\n');
const words=line=>(String(line).match(/"[^"]*"|'[^']*'|[^\s]+/g)||[]).map(word=>word.replace(/^(['"])(.*)\1$/,'$2'));
const imageIs=(reference,repo,tag)=>{const parsed=parseDockerImageReference(reference);return parsed.repo===repo&&(!tag||parsed.tag===tag);};
const sizeMiB=value=>{const match=String(value||'').match(/^(\d+(?:\.\d+)?)\s*([kmgt]?)(?:i?b)?$/i);return match?Number(match[1])*({k:1/1024,m:1,g:1024,t:1024*1024,'':1/1048576}[match[2].toLowerCase()]):NaN;};
const sameNode=(a,b)=>Boolean(a&&b&&a.type===b.type&&(a.type==='file'?a.content===b.content:a.type==='symlink'?a.target===b.target:Object.keys(a.children||{}).every(name=>sameNode(a.children[name],b.children?.[name]))));
const containsPaths=(a,b)=>!a||Boolean(b&&a.type===b.type&&(a.type!=='dir'||Object.keys(a.children||{}).every(name=>containsPaths(a.children[name],b.children?.[name]))));
function walk(node,path=''){
 if(!node)return [];
 return [[path||'/',node],...(node.type==='dir'?Object.entries(node.children||{}).flatMap(([name,child])=>walk(child,path+'/'+name)):[])];
}
function ini(text){
 const sections=[];let section;
 for(const line of lines(text)){
  if(/^\[.+\]$/.test(line)){section={};sections.push(section);}
  else {const pair=line.match(/^([^=]+)=(.*)$/);if(pair&&section)section[pair[1].trim().toLowerCase()]=pair[2].trim();}
 }
 return sections;
}
function deviceMatches(value,device,aliases=[]){return value===device||aliases.filter(Boolean).includes(value);}
function persistent(getNode,device,path,type,aliases=[]){
 return lines(getNode(['etc','fstab'])?.content).some(line=>{const fields=line.split(/\s+/);return fields.length>=4&&deviceMatches(fields[0],device,aliases)&&fields[1]===path&&fields[2]===type&&!fields[3].split(',').includes('noauto');});
}

export function linuxPracticeChecks(ctx){
 const s=ctx.state,get=ctx.getNode;
 const file=path=>get(path.split('/').filter(Boolean));
 const originalWeb=structuredClone(file('/var/www/html'));
 const originalLogs=structuredClone(file('/var/log'));
 const active=unit=>Boolean(s.services[unit]?.active);
 const pass=(ok,msg)=>result(ok,msg);
 return [
  ()=>pass(s.rootRecovered&&s.users.root?.password==='titanio7','root recuperado con la contraseña pedida.'),
  ()=>pass(file('/etc/hostname')?.content.trim()==='nodo1.lab.local'&&s.net.eth0.ip==='192.168.1.20'&&s.net.eth0.prefix===24&&s.net.eth0.gw==='192.168.1.1'&&s.net.eth0.dns==='192.168.1.254','Red y hostname configurados.'),
  ()=>{
   const directory=file('/etc/yum.repos.d');
   const sections=Object.values(directory?.children||{}).filter(node=>node.type==='file').flatMap(node=>ini(node.content));
   return pass(['BaseOS','AppStream'].every(name=>sections.some(section=>section.baseurl?.replace(/\/$/,'')==='http://mirror.lab.local/rocky9/x86_64/'+name&&/^(?:1|yes|true)$/i.test(section.enabled??'1')&&/^(?:0|no|false)$/i.test(section.gpgcheck??'1'))),'BaseOS y AppStream configurados.');
  },
  ()=>{
   const configs=[file('/etc/httpd/conf/httpd.conf'),...Object.values(file('/etc/httpd/conf.d')?.children||{})];
   const listens=configs.some(node=>node?.type==='file'&&lines(node.content).some(line=>/^Listen\s+(?:\S+:)?8090(?:\s|$)/i.test(line)));
   return pass(listens&&s.selinux.mode==='Enforcing'&&s.selinux.httpPorts.includes(8090)&&active('httpd')&&(!originalWeb||sameNode(originalWeb,file('/var/www/html'))),'httpd escucha en el puerto 8090 con SELinux activo.');
  },
  ()=>pass(s.groupsDb.has('olimpo')&&['zeus','hera'].every(user=>s.users[user]?.groups.includes('olimpo'))&&['/sbin/nologin','/usr/sbin/nologin'].includes(s.users.ares?.shell)&&!s.users.ares.groups.includes('olimpo')&&['zeus','hera','ares'].every(user=>s.users[user]?.password==='cambiame1'),'Usuarios y grupos correctos.'),
  ()=>{const node=file('/datos/olimpo');return pass(node?.type==='dir'&&node.group==='olimpo'&&node.mode?.slice(3,6)==='rws'&&node.mode.slice(6)==='---','Directorio colaborativo con SGID correcto.');},
  ()=>pass(lines(file('/var/spool/cron/hera')?.content).some(line=>{
   const parts=words(line);return parts.length===8&&parts.slice(0,5).every(part=>['*','*/1'].includes(part))&&['logger','/usr/bin/logger','/bin/logger'].includes(parts[5])&&parts.slice(6).join(' ')==='Backup diario';
  })||lines(file('/var/spool/cron/hera')?.content).some(line=>{
   const parts=words(line);return parts.length===7&&parts.slice(0,5).every(part=>['*','*/1'].includes(part))&&['logger','/usr/bin/logger','/bin/logger'].includes(parts[5])&&parts[6]==='Backup diario';
  }),'Cron de hera configurado cada minuto.'),
  ()=>{
   const node=file('/root/varlog-backup.tar.bz2');let archive;
   try{if(node?.type==='file'&&node.content.startsWith('TARJSON:bzip2:'))archive=JSON.parse(node.content.slice('TARJSON:bzip2:'.length));}catch{}
   return pass(Array.isArray(archive)&&archive.some(entry=>entry.path.replace(/^\/+|^\.\//g,'').replace(/\/$/,'')==='var/log'&&entry.node?.type==='dir'&&containsPaths(originalLogs,entry.node)),'Copia bzip2 de /var/log creada.');
  },
  ()=>{
   const node=file('/var/tmp/hosts'),acl=node?.acl||[];
   const named=user=>acl.find(item=>item.type==='user'&&item.name===user);
   const mask=acl.find(item=>item.type==='mask')?.perms||node?.mode?.slice(3,6)||'';
   return pass(node?.type==='file'&&sameNode(file('/etc/hosts'),node)&&node.owner==='root'&&node.group==='root'&&!/[xst]/i.test(node.mode||'')&&named('zeus')?.perms.includes('r')&&named('zeus').perms.includes('w')&&mask.includes('r')&&mask.includes('w')&&named('ares')?.perms==='---'&&node.mode[6]==='r','Contenido, permisos y ACL correctos.');
  },
  ()=>pass(lines(file('/etc/chrony.conf')?.content).some(line=>/^(?:server|pool)\s+ntp\.lab\.local(?:\s|$)/i.test(line))&&active('chronyd'),'chrony configurado con ntp.lab.local y activo.'),
  ()=>{
   const destination=file('/root/herafiles');
   const sources=walk(get([])).filter(([path,node])=>node.owner==='hera'&&!path.startsWith('/root/herafiles'));
   const copies=walk(destination).slice(1),used=new Set();
   return pass(destination?.type==='dir'&&sources.length>0&&sources.every(([path,node])=>{
    const index=copies.findIndex(([copyPath,copy],i)=>!used.has(i)&&copyPath.split('/').at(-1)===path.split('/').at(-1)&&sameNode(node,copy));
    if(index<0)return false;used.add(index);return true;
   }),'Los archivos y directorios de hera están copiados.');
  },
  ()=>{
   const source=file('/usr/share/dict/words'),destination=file('/root/coincidencias');
   const expected=source?.type==='file'?textLines(source.content).filter(line=>line.includes('rich')):null;
   return pass(expected&&destination?.type==='file'&&textLines(destination.content).join('\n')===expected.join('\n'),'Todas las líneas coincidentes están copiadas.');
  },
  ()=>pass(s.users.apolo?.uid===4120&&s.users.apolo.password==='orquidea3','Usuario apolo (UID 4120) creado.'),
  ()=>{const rule=s.users.zeus&&ctx.helpers?.sudoersRuleFor?.('zeus','ALL');return pass(rule?.nopasswd&&rule.commands.includes('ALL'),'sudo NOPASSWD configurado para zeus.');},
  ()=>{
   const lv=s.lvm.lvs.find(item=>item.name==='appvol'&&item.vg==='datavg'&&item.extents===60&&item.fstype==='ext4'&&item.mount==='/mnt/appvol');
   return pass(lv&&persistent(get,'/dev/datavg/appvol','/mnt/appvol','ext4',['/dev/mapper/datavg-appvol',lv.uuid&&'UUID='+lv.uuid,lv.label&&'LABEL='+lv.label]),'LV appvol montado y persistente.');
  },
  ()=>{
   const disk=s.disks.find(item=>item.name==='sdb');
   return pass(disk?.parts.some(part=>part.fstype==='swap'&&part.mount==='[SWAP]'&&Math.abs(sizeMiB(part.size)-512)<0.01&&lines(file('/etc/fstab')?.content).some(line=>{const fields=line.split(/\s+/);return fields.length>=4&&deviceMatches(fields[0],'/dev/'+part.name,[part.uuid&&'UUID='+part.uuid])&&fields[2]==='swap'&&!fields[3].split(',').includes('noauto');})),'Swap de 512 MiB activa y persistente.');
  },
  ()=>pass(s.lvm.lvs.some(lv=>lv.size*1024>=230&&lv.size*1024<=260&&lv.reduced),'Volumen redimensionado en el rango pedido.'),
  ()=>pass(s.tunedProfile===(ctx.helpers?.tunedRecommendedProfile?.()||'virtual-host'),'Perfil tuned recomendado aplicado.'),
  ()=>{
   const node=file('/usr/local/bin/saludo');
   const prints=lines(node?.content).some(line=>/^(?:\/usr\/bin\/|\/bin\/)?(?:echo\s+(?:-e\s+)?["']?Hola equipo olimpo["']?|printf\s+(?:["']Hola equipo olimpo(?:\\n)?["']|["']%s(?:\\n)?["']\s+["']Hola equipo olimpo["']))\s*;?$/.test(line));
   return pass(node?.type==='file'&&[2,5,8].every(index=>node.mode?.[index]==='x'&&node.mode[index-2]==='r')&&prints,'Script saludo ejecutable por todos.');
  },
  ()=>{
   const root=file('/sitio/web'),page=file('/sitio/web/index.html'),conf=file('/etc/httpd/conf/httpd.conf');
   return pass(root?.type==='dir'&&page?.type==='file'&&lines(conf?.content).some(line=>/^DocumentRoot\s+["']?\/sitio\/web["']?\s*$/i.test(line))&&active('httpd')&&s.selinux.mode==='Enforcing'&&[root,page].every(node=>node.context==='httpd_sys_content_t')&&root.mode[8]==='x'&&page.mode[6]==='r'&&(s.fw.services.has('http')||s.fw.ports.has('80/tcp')),'Apache sirve /sitio/web con permisos, contexto y firewall.');
  },
  ()=>{
   const container=s.containers.find(item=>item.name==='webapp'&&item.owner==='hermes'&&item.engine==='podman'&&item.running&&imageIs(item.image,'httpd'));
   const mounts=container?.mounts||[];
   const mapped=[['/opt/entrada','/data/in'],['/opt/salida','/data/out']].every(([source,target])=>mounts.some(mount=>mount.type==='bind'&&mount.source===source&&mount.target===target));
   const unit=Object.entries(s.userUnits.hermes||{}).some(([name,state])=>{
    const node=file('/home/hermes/.config/systemd/user/'+name.replace(/\.service$/,'')+'.service');
    return state.enabled&&state.active&&node?.owner==='hermes'&&lines(node.content).some(line=>/^ExecStart=.*\bpodman\b.*\b(?:start|run)\b/.test(line)&&(new RegExp('(?:\\bwebapp\\b|'+(container?.id||'(?!)')+')')).test(line));
   });
   return pass(container&&mapped&&s.linger.hermes&&unit,'Contenedor rootless con montajes y servicio de hermes activo.');
  },
 ];
}

export function dockerPracticeChecks(ctx){
 const s=ctx.state,file=path=>ctx.getNode(path.split('/').filter(Boolean));
 const container=name=>s.containers.find(item=>item.name===name);
 const running=name=>container(name)?.running&&!container(name)?.paused;
 const port=(name,host)=>publishedPortEntries(container(name)?.ports).some(item=>item.hostPort===host&&item.containerPort===80&&item.protocol==='tcp');
 const image=(repo,tag)=>s.images.find(item=>item.repo===repo&&item.tag===tag);
 const history=(operation,ref)=>s.history.some(line=>{const tokens=words(line);if(tokens[0]==='sudo')tokens.shift();if(tokens[0]!=='docker')return false;if(tokens[1]==='container')tokens.splice(1,1);return tokens[1]===operation&&(!ref||tokens.slice(2).some(token=>token===ref||container(ref)?.id?.startsWith(token)));});
 const project=name=>s.containers.filter(item=>item.composeProject==='tienda'&&item.composeService===name);
 const composeHistory=operation=>s.history.some(line=>/^\s*(?:docker\s+compose|docker-compose)\b/.test(line)&&words(line).includes(operation));
 return [
  ()=>result(image('alpine','latest')&&history('search','alpine'),'Alpine está localizada y descargada.'),
  ()=>result(running('primer-alpine')&&imageIs(container('primer-alpine')?.image,'alpine'),'El primer contenedor está activo.'),
  ()=>result(running('ciclo')&&['stop','start','restart'].every(operation=>history(operation,'ciclo')),'Ciclo de vida completo.'),
  ()=>result(running('web')&&imageIs(container('web')?.image,'nginx')&&port('web',8080),'El servidor está publicado.'),
  ()=>result(container('web')&&['inspect','logs','top','port'].every(operation=>history(operation,'web')),'Diagnóstico completo.'),
  ()=>{
   const dockerfile=file('/root/miweb/Dockerfile'),page=file('/root/miweb/index.html');
   return result(dockerfile?.type==='file'&&page?.type==='file'&&lines(dockerfile.content).some(line=>/^FROM\s+(?:docker\.io\/library\/)?nginx(?::\S+)?(?:\s|$)/i.test(line))&&lines(dockerfile.content).some(line=>/^COPY\s+.*\bindex\.html\b/i.test(line))&&image('miweb','v1'),'Dockerfile, página e imagen propia preparados.');
  },
  ()=>result(running('miweb-app')&&container('miweb-app')?.image==='miweb:v1'&&port('miweb-app',8081),'La imagen propia está desplegada.'),
  ()=>{
   let bundle;try{bundle=JSON.parse(file('/root/miweb-1.0.tar')?.content||'');}catch{}
   const original=image('miweb','v1'),tagged=image('alumno/miweb','1.0');
   return result(original&&tagged&&original.id===tagged.id&&bundle?.format==='s2ktux-docker-image'&&bundle.image?.id===original.id&&bundle.image.repo==='alumno/miweb'&&bundle.image.tag==='1.0','La misma imagen está etiquetada y exportada.');
  },
  ()=>result(s.dockerVolumes.some(volume=>volume.name==='datos')&&container('persistente')?.mounts?.some(mount=>mount.type==='volume'&&mount.source==='datos'&&mount.target==='/var/lib/app'),'El volumen está montado en la ruta solicitada.'),
  ()=>result(running('bindweb')&&imageIs(container('bindweb')?.image,'nginx')&&port('bindweb',8082)&&file('/root/site/index.html')?.type==='file'&&container('bindweb')?.mounts?.some(mount=>mount.type==='bind'&&mount.source==='/root/site'&&mount.target==='/usr/share/nginx/html'),'Contenido web, bind mount y puerto configurados.'),
  ()=>result(s.dockerNetworks.some(network=>network.name==='labnet')&&['frontend','backend'].every(name=>running(name)&&container(name)?.networks?.labnet)&&s.history.some(line=>{const tokens=words(line);return tokens[0]==='docker'&&tokens[1]==='network'&&tokens[2]==='inspect'&&tokens.includes('labnet');}),'Aplicación conectada y red comprobada.'),
  ()=>result(running('limitado')&&sizeMiB(container('limitado')?.mem)===256&&Number(container('limitado')?.cpus)===0.5&&container('limitado')?.restart==='unless-stopped'&&history('stats'),'Límites aplicados y consumo revisado.'),
  ()=>{
   const spec=file('/root/stack/compose.yaml'),state=s.composeProjects.tienda;
   const web=project('web'),db=project('db');
   return result(spec?.type==='file'&&state?.running&&web.some(item=>item.running&&imageIs(item.image,'nginx'))&&db.some(item=>item.running&&imageIs(item.image,'mariadb')&&item.mounts?.some(mount=>mount.type==='volume'&&mount.target==='/var/lib/mysql'&&s.dockerVolumes.some(volume=>volume.name===mount.source))),'Proyecto Compose con imágenes y volumen correctos.');
  },
  ()=>result(['config','ps','logs'].every(composeHistory)&&project('web').filter(item=>item.running&&!item.paused).length===3,'Proyecto validado, observado y escalado.'),
  ()=>{const node=file('/root/produccion/Dockerfile'),instructions=lines(node?.content);return result(node?.type==='file'&&instructions.filter(line=>/^FROM\s+/i.test(line)).length>=2&&instructions.some(line=>/^FROM\s+\S+\s+AS\s+\S+/i.test(line))&&image('miapp','prod'),'Imagen multi-stage construida.');},
 ];
}
