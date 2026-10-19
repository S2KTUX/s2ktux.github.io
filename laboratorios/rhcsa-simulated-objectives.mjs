import {exercises as nativeTasks} from './linux-real/v86-exercises.mjs';
import {simulatedLearningLinux} from './learning-linux.mjs';
const clean=s=>String(s||'').replace(/\r/g,'').trimEnd();
export function simulatedRhcsaObjectives(ctx,legacy){
 const s=ctx.state,node=path=>ctx.getNode(path.split('/').filter(Boolean));
 const exact=(path,value)=>node(path)?.type==='file'&&clean(node(path).content)===value;
 const known=new Map([...legacy,...simulatedLearningLinux(ctx)].map(task=>[task.id,task]));
 const conditions={
  'salida-i':()=>exact('/root/salida.txt','Hola'),'salida-ii':()=>exact('/root/salida-dos.txt','Primera\nSegunda'),
  'grep-i':()=>exact('/root/eventos.txt','INFO inicio\nERROR disco')&&exact('/root/errores.txt','ERROR disco'),
  'grep-ii':()=>exact('/root/eventos-filtro.txt','ERROR 12\nERROR abc\nINFO 12')&&exact('/root/errores-filtrados.txt','ERROR 12'),
  'vi-i':()=>exact('/root/nota-vi.txt','Mi primera nota'),'vi-ii':()=>exact('/root/nota-editada.txt','Servidor\nEstado: activo'),
  'archivos-ii':()=>exact('/root/organizar/final.txt','Pendiente')&&!node('/root/organizar/copia.txt')&&!node('/root/organizar/borrador.txt'),
  'archivo':()=>exact('/root/practica.txt','Linux real')&&node('/root/practica.txt')?.owner==='root'&&node('/root/practica.txt')?.group==='root'&&node('/root/practica.txt')?.mode==='rw-r-----',
  'usuarios':()=>s.groupsDb.has('equipo')&&s.users.ana?.groups.includes('equipo')&&s.users.ana?.primary!=='equipo'&&s.users.ana?.shell==='/bin/bash'&&node('/home/ana')?.owner==='ana',
  'grupo-i':()=>s.groupsDb.has('alumnos'),'grupo-ii':()=>s.groupsDb.has('soporte')&&s.users.tecnico?.groups.includes('soporte')&&s.users.tecnico?.primary!=='soporte'&&node('/home/tecnico')?.type==='dir',
  'su-i':()=>exact('/home/practica-su/quien.txt','practica-su')&&node('/home/practica-su/quien.txt')?.owner==='practica-su',
  'su-ii':()=>exact('/home/sesion/directorio.txt','/home/sesion')&&node('/home/sesion/directorio.txt')?.owner==='sesion',
  'servicio-i':()=>s.services.crond?.active,'servicio-ii':()=>s.services.crond?.active&&s.services.crond.enabled&&!s.services.httpd?.active,
  'tuned-i':()=>s.tunedProfile==='balanced','tuned':()=>s.tunedProfile===(ctx.helpers?.tunedRecommendedProfile?.()||'virtual-host'),
  'target-i':()=>/\.target$/.test(clean(node('/root/target.txt')?.content)),
  'sticky-i':()=>node('/var/tmp/compartido-practica')?.mode==='rwxrwxrwt',
  'sgid':()=>s.groupsDb.has('equipo')&&node('/datos/equipo')?.type==='dir'&&node('/datos/equipo')?.group==='equipo'&&node('/datos/equipo')?.owner==='root'&&node('/datos/equipo')?.mode==='rwxrws---',
  'modo-selinux-i':()=>s.selinux.mode==='Enforcing',
  'modo-selinux-ii':()=>s.selinux.mode==='Enforcing'&&/^SELINUX=enforcing$/m.test(node('/etc/selinux/config')?.content||''),
  'puerto-i':()=>s.selinux.mode==='Enforcing'&&s.selinux.httpPorts.includes(8091),
  'firewall-i':()=>s.fw.services.has('http')&&s.fw.permanentServices.has('http'),
  'firewall-ii':()=>s.fw.ports.has('8083/tcp')&&s.fw.permanentPorts.has('8083/tcp'),
  'umask-ii':()=>exact('/root/directorio-mascara/dato.txt','Privado')&&node('/root/directorio-mascara')?.mode==='rwxr-x---'&&node('/root/directorio-mascara/dato.txt')?.mode==='rw-r-----',
  'hostname-ii':()=>exact('/etc/hostname','servidor.lab.local')&&/^127\.0\.1\.1\s+servidor\.lab\.local(?:\s|$)/m.test(node('/etc/hosts')?.content||''),
  'dns-i':()=>/^192\.0\.2\.10\s+web-practica\.lab(?:\s|$)/m.test(node('/etc/hosts')?.content||''),
  'dns-ii':()=>/^192\.0\.2\.20\s+servidor-practica\.lab\s+archivos-practica\s*$/m.test(node('/etc/hosts')?.content||''),
  'ipv4-i':()=>s.net.eth0.ip==='10.42.0.20'&&s.net.eth0.prefix===24,
  'ipv4-ii':()=>s.net.eth0.ip==='10.42.0.20'&&s.net.eth0.prefix===24&&s.net.eth0.gw==='10.42.0.1'&&s.net.eth0.dns==='1.1.1.1',
  'cron-ii':()=>/^15\s+23\s+\*\s+\*\s+\*\s+(?:\/usr\/bin\/)?logger\s+["']?Copia diaria["']?\s*$/m.test(node('/var/spool/cron/root')?.content||''),
 };
 const result=[];
 for(const source of nativeTasks.filter(task=>!task.practiceExam&&!task.legacyOnly)){
  const compatible=known.get(source.sourceId)||known.get(source.id),condition=conditions[source.sourceId];
  if(!compatible&&!condition)continue;
  if(source.prepare&&!compatible)continue;
  if(compatible?.id?.startsWith('sim-'))continue;
  const task={...source,...(compatible?{goal:compatible.goal,solution:compatible.solution,loadSolution:compatible.loadSolution}:{}),check:compatible?.check||(()=>({ok:Boolean(condition()),msg:'Comprueba el resultado indicado en el enunciado.'}))};
  // El simulador representa RHEL: usa sus nombres, no aliases de Debian.
  if(['servicio-i','servicio-ii'].includes(source.sourceId)){task.goal=source.sourceId==='servicio-i'?'Deja crond activo.':'Deja crond activo y habilitado; httpd debe quedar detenido.';task.solution=task.solution.replace(/\bcron\b/g,'crond').replaceAll('apache2','httpd');}
  delete task.checks;delete task.prepare;result.push(task);
 }
 // El intérprete antiguo conserva sus ejercicios de Bash simples; no finge
 // evaluar los programas nuevos que requieren un Bash real.
 const simple=known.get('inicio-script'),script=known.get('sim-19');
 if(simple)result.push({...simple,id:'rhcsa-sim-script-0',practiceExam:false,classes:[3],title:'Scripts Bash · I',order:0});
 for(const [number,topic,ids]of [[5,'Almacenamiento local',['inicio-discos','sim-15']],[11,'Búsquedas de archivos',['inicio-find','sim-11']]])for(const [index,id]of ids.entries()){
  const task=known.get(id);if(task&&index===0)result.push({...task,id:'rhcsa-sim-'+number+'-'+index,practiceExam:false,classes:[number],title:topic+' · I',order:index});
 }
 const examConditions={
  'repaso-usuarios':()=>s.users.luna?.shell==='/bin/bash'&&node('/home/luna')?.type==='dir'&&s.groupsDb.has('operaciones')&&s.users.luna.groups.includes('operaciones')&&s.users.luna.primary!=='operaciones'&&Number(s.systemSettings.chage.luna?.max)===60&&Number(s.systemSettings.chage.luna?.warn)===5,
  'repaso-directorio':()=>node('/datos/turno')?.owner==='root'&&node('/datos/turno')?.group==='operaciones'&&node('/datos/turno')?.mode==='rwxrws---',
  'repaso-cron':()=>/^20\s+18\s+\*\s+\*\s+1-5\s+(?:\/usr\/bin\/)?logger\s+["']?Revision del laboratorio["']?\s*$/m.test(node('/var/spool/cron/root')?.content||''),
  'repaso-texto':()=>exact('/root/registro-repaso.txt','aviso 10\nERROR 20\nerror 30\nINFO 40')&&exact('/root/incidencias.txt','ERROR 20\nerror 30'),
  'repaso-umask':()=>exact('/root/privado-repaso/informe.txt','Revision')&&node('/root/privado-repaso')?.mode==='rwxr-x---'&&node('/root/privado-repaso/informe.txt')?.mode==='rw-r-----',
  'repaso-firewall':()=>s.services.firewalld?.active&&s.services.firewalld.enabled&&s.fw.ports.has('8094/tcp')&&s.fw.permanentPorts.has('8094/tcp'),
 };
 for(const task of nativeTasks.filter(task=>task.practiceExam&&examConditions[task.id]))result.push({...task,check:()=>({ok:Boolean(examConditions[task.id]()),msg:'Comprueba el resultado indicado en el enunciado.'})});
 return result;
}
