const basePackages = [
  'bash','coreutils','glibc','systemd','dnf','rpm','util-linux','findutils',
  'procps-ng','iproute','iputils','NetworkManager','openssh-server',
  'openssh-clients','curl','tar','gzip','bzip2','vim-minimal','nano','jq'
];

export default {
  mode: 'docker',
  profile: {
    initialUser: 'root',
    cwd: ['root'],
    packages: basePackages,
    motd: 'Docker practice host — instala el motor y trabaja como en un Linux real',
    network: { up:true, ip:'192.168.56.20', prefix:24, gw:'192.168.56.1', dns:'1.1.1.1', method:'auto', autoconnect:true }
  },
  manuals: {
    docker:{name:'docker - gestiona contenedores e imágenes',sec:'1',s:'docker SUBCOMANDO ...',d:'Construye, descarga y ejecuta contenedores mediante Docker Engine.',o:[['ps [-a]','lista contenedores (todos con -a)'],['images','lista las imágenes locales'],['pull','descarga una imagen'],['run [-d]','crea y arranca un contenedor'],['build -t N .','construye una imagen desde un Dockerfile'],['logs / exec / inspect','logs, shell y detalles de un contenedor']],e:'docker run -d --name web nginx'},
    'docker-compose':{name:'docker-compose - orquesta aplicaciones con Compose',sec:'1',s:'docker compose SUBCOMANDO',d:'Gestiona aplicaciones formadas por varios contenedores a partir de un fichero Compose.',o:[['up -d','crea y arranca los servicios en segundo plano'],['ps','muestra el estado de los servicios'],['logs','consulta sus registros'],['down','detiene y elimina los recursos del proyecto']],e:'docker compose up -d'},
    dockerd:{name:'dockerd - daemon de Docker Engine',sec:'8',s:'dockerd [--validate]',d:'Inicia el daemon que administra imágenes, redes, volúmenes y contenedores. Normalmente systemd lo ejecuta como docker.service.',o:[['--validate','valida /etc/docker/daemon.json sin arrancar el daemon']],e:'dockerd --validate'}
  },
  manualBriefs: {
    docker:['gestiona contenedores e imágenes','docker run|ps|build|images ...','Cliente de Docker Engine.'],
    'docker-compose':['orquesta contenedores con un YAML','docker compose up|down','Levanta aplicaciones multi-contenedor.'],
    dockerd:['daemon de Docker Engine','dockerd [--validate]','Proceso servidor de Docker; normalmente se administra con systemctl.']
  },
  completions: {
    docker:['run','ps','images','pull','build','exec','logs','inspect','start','stop','restart','rm','rmi','tag','push','commit','save','load','history','search','network','volume','system','compose','stats','top','port','rename','prune','create','attach','update','login','logout','version','info','--help'],
    'docker-compose':['up','down','ps','logs','build','pull']
  },
  createCommands(ctx) {
    const {out,err}=ctx.io;
    return {
      dockerd({args}) {
        const cfg=ctx.helpers.dockerConfigError();
        if(args.includes('--validate')){
          if(cfg)err('unable to configure the Docker daemon with file /etc/docker/daemon.json: '+cfg);
          else out('configuration OK');
          return;
        }
        if(cfg){err('failed to start daemon: '+cfg);return;}
        out('INFO['+new Date().toISOString()+'] Starting up');
        out('INFO['+new Date().toISOString()+'] API listen on /var/run/docker.sock');
      }
    };
  },
  createChallenges(ctx) {
    const s=ctx.state;
    return [
      {badge:'NIVEL 1 · INSTALACIÓN',title:'Instala Docker Engine',goal:'Prepara este host Rocky Linux con Docker Engine Community. Deben quedar instalados el motor, la CLI, containerd, Buildx y Compose.',check:()=>s.dockerInstalled?{ok:true,msg:'Docker Engine está instalado.'}:{ok:false,msg:'Docker todavía no está instalado.'}},
      {badge:'NIVEL 1 · DAEMON',title:'Activa y verifica el daemon',goal:'Deja Docker activo ahora y habilitado para los siguientes arranques. Confirma además que tanto el cliente como el servidor responden.',check:()=>s.services.docker&&s.services.docker.active&&s.services.docker.enabled&&s.history.some(h=>/^docker (version|info)/.test(h))?{ok:true,msg:'Daemon activo, habilitado y comprobado.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'NIVEL 1 · EJECUCIÓN',title:'Completa el hello-world',goal:'Verifica la instalación con la imagen <b>hello-world</b> y deja constancia de que el contenedor terminó correctamente.',check:()=>s.images.some(i=>i.repo==='hello-world')&&s.containers.some(c=>c.image.startsWith('hello-world'))&&s.history.some(h=>/^docker ps .*a/.test(h))?{ok:true,msg:'Has completado y revisado el primer contenedor.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'NIVEL 2 · CICLO DE VIDA',title:'Controla el ciclo de vida',goal:'Crea un contenedor llamado <b>ciclo</b>, detenlo, arráncalo de nuevo y reinícialo. Debe terminar activo.',check:()=>s.containers.some(c=>c.name==='ciclo'&&c.running)&&['stop','start','restart'].every(op=>s.history.some(h=>h.startsWith('docker '+op+' ciclo')))?{ok:true,msg:'Ciclo de vida completo.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'NIVEL 2 · PUERTOS',title:'Publica un servidor nginx',goal:'Publica un servidor nginx llamado <b>web</b>, en segundo plano, para que el puerto 80 del contenedor sea accesible en el 8080 del host. Verifica el mapeo.',check:()=>s.containers.some(c=>c.name==='web'&&c.running&&c.image.startsWith('nginx')&&c.ports.includes('8080:80'))&&s.history.some(h=>h==='docker port web')?{ok:true,msg:'nginx está activo y su puerto está comprobado.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'NIVEL 2 · DIAGNÓSTICO',title:'Inspecciona un contenedor',goal:'Obtén del contenedor <b>web</b> su configuración completa, sus registros, sus procesos activos y el resultado de una orden ejecutada en su interior.',check:()=>['inspect','logs','top','exec'].every(op=>s.history.some(h=>h.startsWith('docker '+op+' web')))?{ok:true,msg:'Has aplicado las cuatro herramientas de diagnóstico.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'NIVEL 3 · DOCKERFILE',title:'Construye miapp:v1',goal:'En <b>/root/containers</b> hay un Dockerfile. Construye la imagen <b>miapp:v1</b> y examina después las capas que la forman.',check:()=>s.images.some(i=>i.repo==='miapp'&&i.tag==='v1')&&s.history.some(h=>/^docker history miapp(:v1)?/.test(h))?{ok:true,msg:'Imagen construida y capas inspeccionadas.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'NIVEL 3 · VERSIONADO',title:'Etiqueta y exporta una imagen',goal:'A partir de <b>miapp:v1</b>, prepara la versión <b>alumno/miapp:1.0</b> y guárdala como archivo transportable en <b>/root/miapp.tar</b>.',check:()=>s.images.some(i=>i.repo==='alumno/miapp'&&i.tag==='1.0')&&s.history.some(h=>/^docker save .*miapp/.test(h))?{ok:true,msg:'Imagen etiquetada y exportada.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'NIVEL 3 · VOLÚMENES',title:'Haz persistente el contenido',goal:'Crea almacenamiento persistente llamado <b>datos</b>, móntalo en <b>/data</b> dentro de un contenedor <b>persistente</b> y revisa sus metadatos.',check:()=>s.dockerVolumes.some(v=>v.name==='datos')&&s.containers.some(c=>c.name==='persistente'&&c.volume==='datos')&&s.history.some(h=>h==='docker volume inspect datos')?{ok:true,msg:'Volumen creado, inspeccionado y montado.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'NIVEL 3 · BIND MOUNT',title:'Publica contenido del host',goal:'Sirve con un contenedor <b>bindweb</b> el contenido de una ruta absoluta del host y hazlo accesible desde un puerto publicado.',check:()=>s.containers.some(c=>c.name==='bindweb'&&c.bind&&c.ports)?{ok:true,msg:'Bind mount y publicación configurados.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'NIVEL 4 · REDES',title:'Crea una red de aplicación',goal:'Crea una red <b>labnet</b> para una aplicación de dos capas. Los contenedores <b>frontend</b> y <b>backend</b> deben pertenecer a ella y la configuración final debe quedar verificada.',check:()=>s.dockerNetworks.some(n=>n.name==='labnet')&&['frontend','backend'].every(n=>s.containers.some(c=>c.name===n&&c.net==='labnet'))&&s.history.some(h=>h==='docker network inspect labnet')?{ok:true,msg:'Aplicación de dos capas conectada a labnet.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'NIVEL 4 · RECURSOS',title:'Protege los recursos del host',goal:'Ejecuta un contenedor <b>limitado</b> con límites de memoria y CPU, política de reinicio unless-stopped y una comprobación de su consumo.',check:()=>s.containers.some(c=>c.name==='limitado'&&c.mem&&c.cpus&&c.restart==='unless-stopped')&&s.history.some(h=>h.startsWith('docker stats'))?{ok:true,msg:'Recursos y reinicio configurados y observados.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'NIVEL 4 · COMPOSE',title:'Despliega la aplicación Compose',goal:'Despliega en segundo plano el proyecto definido en <b>/root/containers</b> y comprueba tanto el estado de sus servicios como sus registros.',check:()=>s.composeProjects.app&&s.composeProjects.app.running&&s.history.some(h=>/^docker compose ps/.test(h))&&s.history.some(h=>/^docker compose logs/.test(h))?{ok:true,msg:'Stack Compose activo y diagnosticado.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'NIVEL 5 · REGISTRY',title:'Prepara y publica una release',goal:'Prepara la imagen <b>alumno/miapp:release</b>, autentícate en el registro y publica esa versión.',check:()=>s.images.some(i=>i.repo==='alumno/miapp'&&i.tag==='release')&&s.history.some(h=>h.startsWith('docker login'))&&s.history.some(h=>/^docker push alumno\/miapp:release/.test(h))?{ok:true,msg:'Release etiquetada y publicada.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'NIVEL 5 · MANTENIMIENTO',title:'Audita y limpia sin romper lo activo',goal:'Mide el espacio ocupado por Docker y recupera el de contenedores detenidos e imágenes sin uso, conservando intactos los recursos activos.',check:()=>s.history.some(h=>h==='docker system df')&&s.history.some(h=>h.includes('container prune'))&&s.history.some(h=>h.includes('image prune'))?{ok:true,msg:'Auditoría y limpieza selectiva completadas.'}:{ok:false,msg:'El objetivo todavía no está completo.'}}
    ];
  }
};
