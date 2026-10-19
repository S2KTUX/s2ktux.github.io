import assert from 'node:assert/strict';
import linux from '../terminal-runtime-linux.js';
import docker from '../terminal-runtime-docker.js';
import {createDirectory,createFile,ensureVirtualDirectory,resolveVirtualNode} from '../terminal-virtual-fs.js';
import {exercises as realDocker} from '../laboratorios/docker-real/docker-exercises.mjs';
import {introExercises} from '../laboratorios/linux-real/v86-exercises.mjs';
import {courseExercises} from '../laboratorios/linux-real/v86-course-exercises.mjs';
import {extraExercises} from '../laboratorios/linux-real/v86-extra-exercises.mjs';
import {examQuestions} from '../laboratorios/linux-real/v86-exam-data.mjs';
import {executeDockerCommand} from '../terminal-docker-command.js';
import {executeLinuxCommand} from '../terminal-linux-command.js';
import {createTerminalFidelity} from '../terminal-fidelity.js';
import {dockerImageFiles,dockerHttpDocument} from '../terminal-docker-http.js';

function fixture(){
 const root=createDirectory();
 const state={rootRecovered:false,users:{root:{password:''}},net:{eth0:{}},history:[],services:{},images:[],containers:[],disks:[],selinux:{mode:'Enforcing',httpPorts:[80,443]},fw:{services:new Set(),ports:new Set()},lvm:{lvs:[]},groupsDb:new Set(),linger:{},userUnits:{},tunedProfile:'virtual-guest',dockerVolumes:[],dockerNetworks:[],composeProjects:{}};
 const get=path=>resolveVirtualNode(root,path.split('/').filter(Boolean));
 const put=(path,content='',options={})=>{const segments=path.split('/').filter(Boolean);const parent=ensureVirtualDirectory(root,segments.slice(0,-1).join('/'));return parent.children[segments.at(-1)]=createFile(content,options);};
 const dir=(path,options={})=>Object.assign(ensureVirtualDirectory(root,path),options);
 const copy=(source,target)=>{const segments=target.split('/').filter(Boolean);ensureVirtualDirectory(root,segments.slice(0,-1).join('/')).children[segments.at(-1)]=structuredClone(get(source));};
 const image=(repo,tag='latest',id=repo+'-id')=>{const item={repo,tag,id};state.images.push(item);return item;};
 const container=(name,extra={})=>{const item={name,id:name+'-1234567890',image:'nginx:latest',running:true,ports:'',mounts:[],networks:{},...extra};state.containers.push(item);return item;};
 put('/etc/hosts','127.0.0.1 localhost\n');put('/usr/share/dict/words','rich\nplain\nostrich\nenrich\n');put('/var/www/html/index.html','Original');put('/var/log/messages','Log inicial');
 const ctx={state,getNode:segments=>resolveVirtualNode(root,segments),helpers:{sudoersRuleFor:()=>state.sudoRule||null,sudoersSyntaxError:createTerminalFidelity({}).sudoersSyntaxError,tunedRecommendedProfile:()=> 'virtual-host'}};
 return {s:state,root,get,put,dir,copy,image,container,ctx};
}
let positives=0,negatives=0,variants=0;
function check(mode,index,prepare,breakers=[],alternatives=[]){
 const runtime=mode==='linux'?linux:docker;
 const run=mutate=>{const f=fixture();const catalog=runtime.createChallenges(f.ctx);prepare(f);mutate?.(f);return catalog[index].check();};
 assert.equal(run().ok,true,`${mode} ${index+1}: solución válida`);positives++;
 for(const mutate of breakers){assert.equal(run(mutate).ok,false,`${mode} ${index+1}: debe rechazar respuesta incompleta`);negatives++;}
 for(const mutate of alternatives){assert.equal(run(mutate).ok,true,`${mode} ${index+1}: variante equivalente`);variants++;}
}
check('linux',0,f=>{f.s.rootRecovered=true;f.s.users.root.password='titanio7';},[f=>f.s.rootRecovered=false,f=>f.s.users.root.password='incorrecta',f=>f.s.selinux.mode='Permissive']);
check('linux',1,f=>{f.put('/etc/hostname','nodo1.lab.local\n');Object.assign(f.s.net.eth0,{ip:'192.168.1.20',prefix:24,gw:'192.168.1.1',dns:'192.168.1.254'});},[f=>f.s.net.eth0.prefix=16,f=>f.s.net.eth0.gw='1.1.1.1',f=>f.put('/etc/hostname','otro')]);
const repos='[base]\nbaseurl=http://mirror.lab.local/rocky9/x86_64/BaseOS\nenabled=1\ngpgcheck=0\n[app]\nbaseurl=http://mirror.lab.local/rocky9/x86_64/AppStream\nenabled=1\ngpgcheck=0\n';
check('linux',2,f=>f.put('/etc/yum.repos.d/lab.repo',repos),[f=>f.put('/etc/yum.repos.d/lab.repo',repos.replaceAll('gpgcheck=0','gpgcheck=1')),f=>f.put('/etc/yum.repos.d/lab.repo',repos.replaceAll('enabled=1','enabled=0')),f=>f.put('/etc/yum.repos.d/lab.repo','# '+repos.replaceAll('\n','\n# '))],[f=>f.put('/etc/yum.repos.d/lab.repo',repos.replaceAll('enabled=1\n',''))]);
check('linux',3,f=>{f.put('/etc/httpd/conf.d/port.conf','Listen 8090');f.s.selinux.httpPorts.push(8090);f.s.services.httpd={active:true,enabled:true};},[f=>f.s.selinux.mode='Permissive',f=>f.s.services.httpd.enabled=false,f=>f.s.selinux.httpPorts=[80],f=>f.put('/etc/httpd/conf.d/port.conf','# Listen 8090'),f=>f.put('/var/www/html/index.html','Modificado')],[f=>f.put('/etc/httpd/conf.d/port.conf','Listen 0.0.0.0:8090')]);
check('linux',4,f=>{f.s.groupsDb.add('olimpo');for(const user of ['zeus','hera','ares'])f.s.users[user]={primary:user,groups:user==='ares'?[]:['olimpo'],password:'cambiame1',shell:user==='ares'?'/sbin/nologin':'/bin/bash'};},[f=>f.s.users.ares.groups.push('olimpo'),f=>f.s.users.hera.password='otra',f=>f.s.users.ares.shell='/bin/bash',f=>f.s.users.zeus.primary='olimpo']);
check('linux',5,f=>f.dir('/datos/olimpo',{group:'olimpo',mode:'rwxrws---'}),[f=>f.get('/datos/olimpo').owner='hera',f=>f.get('/datos/olimpo').mode='rwx--s---',f=>f.get('/datos/olimpo').mode='rwxrwsr-x']);
check('linux',6,f=>f.put('/var/spool/cron/hera','* * * * * logger "Backup diario"'),[f=>f.put('/var/spool/cron/hera','0 0 * * * logger "Backup diario"'),f=>f.put('/var/spool/cron/hera','# * * * * * logger "Backup diario"')],[f=>f.put('/var/spool/cron/hera','*/1 * * * * /usr/bin/logger \'Backup diario\'')]);
check('linux',7,f=>f.put('/root/varlog-backup.tar.bz2','TARJSON:bzip2:'+JSON.stringify([{path:'var/log',node:structuredClone(f.get('/var/log'))}])),[f=>f.put('/root/varlog-backup.tar.bz2','TARJSON:bzip2:'+JSON.stringify([{path:'var/log',node:createDirectory()}])),f=>f.put('/root/varlog-backup.tar.bz2','TARJSON:bzip2:'+JSON.stringify([{path:'etc',node:createDirectory()}])),f=>f.put('/root/varlog-backup.tar.bz2','texto'),f=>{f.get('/root').children['varlog-backup.tar']=f.get('/root/varlog-backup.tar.bz2');delete f.get('/root').children['varlog-backup.tar.bz2'];}]);
check('linux',8,f=>{f.copy('/etc/hosts','/var/tmp/hosts');Object.assign(f.get('/var/tmp/hosts'),{mode:'rw-rw-r--',acl:[{type:'user',name:'zeus',perms:'rw-'},{type:'user',name:'ares',perms:'---'}]});},[f=>f.get('/var/tmp/hosts').content='diferente',f=>f.get('/var/tmp/hosts').mode='rw-rw----',f=>f.get('/var/tmp/hosts').acl.push({type:'mask',perms:'r--'}),f=>f.get('/var/tmp/hosts').mode='rwxrw-r--']);
check('linux',9,f=>{f.put('/etc/chrony.conf','server ntp.lab.local iburst');f.s.services.chronyd={active:true};},[f=>f.put('/etc/chrony.conf','# server ntp.lab.local iburst'),f=>f.s.services.chronyd.active=false],[f=>f.put('/etc/chrony.conf','pool ntp.lab.local iburst')]);
check('linux',10,f=>{f.dir('/home/hera',{owner:'hera'});f.put('/home/hera/dato','contenido',{owner:'hera'});f.copy('/home/hera','/root/herafiles/home/hera');},[f=>f.get('/root/herafiles').children={},f=>f.get('/root/herafiles/home/hera/dato').content='corrupto'],[f=>{f.copy('/home/hera','/root/herafiles/hera');delete f.get('/root/herafiles').children.home;}]);
check('linux',11,f=>f.put('/root/coincidencias','rich\nostrich\nenrich\n'),[f=>f.put('/root/coincidencias','rich'),f=>f.put('/root/coincidencias','rich\nplain\nostrich\nenrich\n')],[f=>f.put('/root/coincidencias','rich\nostrich\nenrich')]);
check('linux',12,f=>f.s.users.apolo={uid:4120,password:'orquidea3'},[f=>f.s.users.apolo.uid=4121,f=>f.s.users.apolo.password='otra']);
check('linux',13,f=>{f.s.users.zeus={};f.s.sudoRule={nopasswd:true,commands:['ALL']};},[f=>f.s.sudoRule.nopasswd=false,f=>f.s.sudoRule.commands=['/usr/bin/passwd'],f=>f.put('/etc/sudoers.d/zeus','zeus ALL=(ALL NOPASSWD: ALL')]);
check('linux',14,f=>{f.s.lvm.lvs.push({name:'appvol',vg:'datavg',extents:60,fstype:'ext4',mount:'/mnt/appvol',uuid:'app-uuid'});f.put('/etc/fstab','/dev/datavg/appvol /mnt/appvol ext4 defaults 0 0');},[f=>f.put('/etc/fstab','# /dev/datavg/appvol /mnt/appvol ext4 defaults 0 0'),f=>f.put('/etc/fstab','/dev/datavg/appvol /otro ext4 defaults 0 0'),f=>f.put('/etc/fstab','/dev/datavg/appvol /mnt/appvol ext4 noauto 0 0')],[f=>f.put('/etc/fstab','UUID=app-uuid /mnt/appvol ext4 defaults 0 0'),f=>f.put('/etc/fstab','/dev/mapper/datavg-appvol /mnt/appvol ext4 defaults 0 0')]);
check('linux',15,f=>{f.s.disks.push({name:'sdb',parts:[{name:'sdb1',size:'512M',fstype:'swap',mount:'[SWAP]',uuid:'swap-uuid'}]});f.put('/etc/fstab','/dev/sdb1 none swap defaults 0 0');},[f=>f.put('/etc/fstab','/dev/sdb1 none swap'),f=>f.s.disks[0].parts[0].size='128M',f=>f.s.disks[0].name='sdc',f=>f.put('/etc/fstab','# /dev/sdb1 none swap defaults 0 0')],[f=>f.put('/etc/fstab','UUID=swap-uuid none swap defaults 0 0')]);
check('linux',16,f=>f.s.lvm.lvs.push({size:250/1024,reduced:true}),[f=>f.s.lvm.lvs[0].size=265/1024,f=>f.s.lvm.lvs[0].reduced=false],[f=>f.s.lvm.lvs[0].size=230/1024,f=>f.s.lvm.lvs[0].size=260/1024]);
check('linux',17,f=>f.s.tunedProfile='virtual-host',[f=>f.s.tunedProfile='powersave',f=>f.s.tunedProfile='throughput-performance']);
check('linux',18,f=>f.put('/usr/local/bin/saludo','#!/bin/bash\necho "Hola equipo olimpo"',{mode:'rwxr-xr-x'}),[f=>f.get('/usr/local/bin/saludo').mode='--x--x--x',f=>f.get('/usr/local/bin/saludo').mode='rwx------',f=>f.get('/usr/local/bin/saludo').content='# echo "Hola equipo olimpo"',f=>f.get('/usr/local/bin/saludo').content='echo "Hola equipo olimpo',f=>f.get('/usr/local/bin/saludo').content='echo "Hola equipo olimpo"\nesto no es un script valido ('],[f=>f.get('/usr/local/bin/saludo').content="#!/bin/sh\nprintf '%s\\n' 'Hola equipo olimpo'"]);
check('linux',19,f=>{f.dir('/sitio/web',{context:'httpd_sys_content_t'});f.put('/sitio/web/index.html','web',{context:'httpd_sys_content_t'});f.get('/sitio/web/index.html').context='httpd_sys_content_t';f.put('/etc/httpd/conf/httpd.conf','DocumentRoot "/sitio/web"');f.s.services.httpd={active:true};f.s.fw.services.add('http');},[f=>f.get('/sitio/web/index.html').context='default_t',f=>f.s.selinux.mode='Permissive',f=>f.get('/sitio/web').mode='rwx------',f=>f.s.fw.services.clear()]);
check('linux',20,f=>{f.s.users.hermes={};f.s.linger.hermes=true;f.s.userUnits.hermes={custom:{enabled:true,active:true}};f.container('webapp',{image:'httpd:latest',owner:'hermes',engine:'podman',mounts:[{type:'bind',source:'/opt/entrada',target:'/data/in'},{type:'bind',source:'/opt/salida',target:'/data/out'}]});f.put('/home/hermes/.config/systemd/user/custom.service','[Service]\nExecStart=/usr/bin/podman start webapp',{owner:'hermes'});},[f=>f.s.containers=[],f=>f.s.containers[0].owner='root',f=>f.s.containers[0].mounts.pop(),f=>f.s.userUnits.hermes.custom.enabled=false,f=>f.put('/home/hermes/.config/systemd/user/custom.service','[Service]\nExecStart=/bin/true',{owner:'hermes'})]);

check('docker',0,f=>{f.image('alpine');f.s.history=['docker search --limit 5 alpine'];},[f=>f.s.images=[],f=>f.s.history=['echo docker search alpine']]);
check('docker',1,f=>f.container('primer-alpine',{image:'alpine:latest'}),[f=>f.s.containers[0].running=false,f=>f.s.containers[0].image='alpine-falsa:latest']);
check('docker',2,f=>{f.container('ciclo');f.s.history=['docker stop ciclo','docker start ciclo','docker restart ciclo'];},[f=>f.s.history=['docker stop ciclo-otro','docker start ciclo-otro','docker restart ciclo-otro']],[f=>f.s.history=['docker container stop -t 2 ciclo','docker start ciclo','docker restart ciclo']]);
check('docker',3,f=>f.container('web',{ports:'8080:80'}),[f=>f.s.containers[0].ports='18080:80',f=>f.s.containers[0].ports='8080:80/udp'],[f=>f.s.containers[0].ports='127.0.0.1:8080:80/tcp']);
check('docker',4,f=>{f.container('web');f.s.history=['docker inspect web','docker logs --tail 5 web','docker top web','docker port web'];},[f=>f.s.containers=[],f=>f.s.history=['docker inspect web-otra','docker logs web-otra','docker top web-otra','docker port web-otra']]);
check('docker',5,f=>{f.put('/root/miweb/Dockerfile','FROM nginx\nCOPY index.html /usr/share/nginx/html/index.html');f.put('/root/miweb/index.html','web');f.image('miweb','v1');},[f=>delete f.get('/root/miweb').children['index.html'],f=>f.put('/root/miweb/Dockerfile','# FROM nginx\n# COPY index.html /usr/share/nginx/html/index.html')]);
check('docker',6,f=>f.container('miweb-app',{image:'miweb:v1',ports:'8081:80'}),[f=>f.s.containers[0].image='miweb:v2',f=>f.s.containers[0].ports='18081:80']);
check('docker',7,f=>{f.image('miweb','v1','shared');const tagged=f.image('alumno/miweb','1.0','shared');f.put('/root/miweb-1.0.tar',JSON.stringify({format:'s2ktux-docker-image',image:tagged}));},[f=>f.put('/root/miweb-1.0.tar','vacío'),f=>f.s.images[1].id='otra']);
check('docker',8,f=>{f.s.dockerVolumes.push({name:'datos'});f.container('persistente',{mounts:[{type:'volume',source:'datos',target:'/var/lib/app'}]});},[f=>f.s.containers[0].mounts[0].target='/otro',f=>f.s.containers[0].running=false]);
check('docker',9,f=>{f.container('bindweb',{ports:'8082:80',mounts:[{type:'bind',source:'/root/site',target:'/usr/share/nginx/html'}]});f.put('/root/site/index.html','web');},[f=>delete f.get('/root/site').children['index.html'],f=>f.s.containers[0].image='redis:latest']);
check('docker',10,f=>{f.s.dockerNetworks.push({name:'labnet'});for(const name of ['frontend','backend'])f.container(name,{fs:dockerImageFiles('nginx'),networks:{labnet:{ip:'1.2.3.4'}}});f.s.history=['docker network inspect --verbose labnet'];},[f=>f.s.containers[0].networks={},f=>f.s.containers[1].image='redis:latest',f=>f.s.containers[1].fs={},f=>f.s.containers[1].cmd='sleep 3600',f=>f.s.history=['echo docker network inspect labnet']]);
check('docker',11,f=>{f.container('limitado',{mem:'256m',cpus:'0.50',restart:'unless-stopped'});f.s.history=['docker stats --no-stream limitado'];},[f=>f.s.containers[0].mem='1256m',f=>f.s.containers[0].cpus='0.75'],[f=>{f.s.containers[0].mem='268435456';f.s.containers[0].cpus='0.5';}]);
check('docker',12,f=>{f.put('/root/stack/compose.yaml','services:\n  web:\n    image: nginx\n  db:\n    image: mariadb');f.s.composeProjects.tienda={running:true};f.container('tienda-web-1',{composeProject:'tienda',composeService:'web'});f.container('tienda-db-1',{image:'mariadb:latest',composeProject:'tienda',composeService:'db',mounts:[{type:'volume',source:'tienda_datos',target:'/var/lib/mysql'}]});f.s.dockerVolumes.push({name:'tienda_datos'});},[f=>f.s.containers[1].mounts=[],f=>f.s.containers[1].image='postgres:latest',f=>f.s.containers[0].running=false]);
check('docker',13,f=>{for(let i=0;i<3;i++)f.container('web-'+i,{composeProject:'tienda',composeService:'web'});f.s.history=['docker compose -p tienda config','docker compose -p tienda ps','docker compose -p tienda logs'];},[f=>f.s.containers[0].running=false,f=>f.s.history=[]],[f=>f.s.history=['docker-compose -p tienda config','docker-compose -p tienda ps','docker-compose -p tienda logs']]);
check('docker',14,f=>{f.put('/root/produccion/Dockerfile','FROM node AS build\nFROM nginx');f.image('miapp','prod');},[f=>f.put('/root/produccion/Dockerfile','# FROM node AS build\nFROM nginx'),f=>f.s.images=[]]);

assert.equal(linux.createChallenges(fixture().ctx).length,21);
assert.equal(docker.createChallenges(fixture().ctx).length,15);
assert.equal(realDocker.length,56);
assert.equal(introExercises.length+courseExercises.length+extraExercises.length,44);
assert.equal(examQuestions.length,22);
const http={image:'nginx',fs:dockerImageFiles('nginx'),mounts:[]};
assert.match(dockerHttpDocument(http),/Welcome to nginx/);delete http.fs['/usr/share/nginx/html/index.html'];assert.equal(dockerHttpDocument(http),undefined);
http.mounts=[{type:'bind',source:'/root/site',target:'/usr/share/nginx/html'}];assert.equal(dockerHttpDocument(http,'/',path=>path==='/root/site/index.html'?'CONTENIDO_REAL_DEL_MODELO':undefined),'CONTENIDO_REAL_DEL_MODELO');
http.cmd='sleep 3600';assert.equal(dockerHttpDocument(http,'/',()=> 'No debe servirse'),undefined);
const compose=fixture();compose.s.fs=compose.root;compose.s.cwd=['root','stack'];compose.s.currentUser='root';compose.s.services.docker={active:true};
compose.put('/root/stack/compose.yaml','services:\n  web:\n    image: nginx\n  db:\n    image: mariadb\n    volumes:\n      - datos_db:/var/lib/mysql\nvolumes:\n  datos_db:\n');
let actual=await executeDockerCommand(compose.s,{name:'docker',args:['compose','-p','tienda','up','-d','--scale','web=3']});
assert.equal(actual.status,0);assert.equal(actual.state.containers.filter(item=>item.composeService==='web').length,3);
assert.deepEqual(actual.state.containers.find(item=>item.composeService==='db').mounts,[{type:'volume',source:'tienda_datos_db',target:'/var/lib/mysql',readOnly:false}]);
actual.state.volumes.find(item=>item.name==='tienda_datos_db').data.dato='CONSERVAR';
const previous=actual.state.containers.length;
let rejected=await executeDockerCommand(actual.state,{name:'docker',args:['compose','-p','tienda','up','-d','--scale','web=mal']});
assert.notEqual(rejected.status,0);assert.equal(rejected.state.containers.length,previous);
actual=await executeDockerCommand(actual.state,{name:'docker',args:['compose','-p','tienda','down']});
actual=await executeDockerCommand(actual.state,{name:'docker',args:['compose','-p','tienda','up','-d']});
assert.equal(actual.state.volumes.find(item=>item.name==='tienda_datos_db').data.dato,'CONSERVAR');
const rootless=fixture();rootless.s.fs=rootless.root;rootless.s.currentUser='hermes';rootless.s.cwd=['home','hermes'];rootless.s.users.hermes={groups:['hermes']};rootless.dir('/home/hermes',{owner:'hermes',group:'hermes'});
rootless.container('privado-root',{owner:'root',engine:'podman'});
let podman=await executeLinuxCommand(rootless.s,{name:'podman',args:['run','-d','--name','webapp','-v','/opt/entrada:/data/in:Z','-v','/opt/salida:/data/out:Z','httpd']});
assert.equal(podman.status,0);const webapp=podman.state.containers.find(item=>item.name==='webapp');assert.equal(webapp.owner,'hermes');assert.equal(webapp.engine,'podman');assert.equal(webapp.mounts.length,2);
podman=await executeLinuxCommand(podman.state,{name:'podman',args:['generate','systemd','--name','webapp','--files']});
assert.equal(podman.status,0);const unit=resolveVirtualNode(podman.state.fs,['home','hermes','container-webapp.service']);assert.equal(unit.owner,'hermes');assert.match(unit.content,/ExecStart=\/usr\/bin\/podman start "webapp"/);
podman=await executeLinuxCommand(podman.state,{name:'podman',args:['generate','systemd','--name','webapp']});assert.match(podman.outputs.map(item=>item.text).join('\n'),/WantedBy=default.target/);
for(const args of [['stop','privado-root'],['generate','systemd','--name','privado-root'],['stop','inexistente']]){const invalid=await executeLinuxCommand(podman.state,{name:'podman',args});assert.notEqual(invalid.status,0);assert.equal(invalid.state.containers.find(item=>item.name==='privado-root').running,true);}
podman.state.currentUser='root';const otherUser=await executeLinuxCommand(podman.state,{name:'podman',args:['stop','webapp']});assert.notEqual(otherUser.status,0);assert.equal(otherUser.state.containers.find(item=>item.name==='webapp').running,true);
console.log(`Simuladas: ${positives} positivos, ${negatives} negativos y ${variants} variantes equivalentes; bancos diferentes: Linux 21/44+22, Docker 15/30. Podman: propietario, aislamiento, generación y errores comprobados.`);
