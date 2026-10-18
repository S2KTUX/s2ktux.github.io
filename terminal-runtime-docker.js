import {dockerPracticeChecks} from './terminal-practice-checkers.js';
const basePackages = [
  'bash','coreutils','glibc','systemd','dnf','rpm','util-linux','findutils',
  'procps-ng','iproute','iputils','NetworkManager','openssh-server',
  'openssh-clients','curl','tar','gzip','bzip2','vim-minimal','nano','jq',
  'docker-ce','docker-ce-cli','containerd.io','docker-buildx-plugin','docker-compose-plugin'
];

export default {
  mode: 'docker',
  profile: {
    initialUser: 'root',
    cwd: ['root'],
    packages: basePackages,
    motd: 'Docker practice host — Docker Engine está listo para trabajar',
    network: { up:true, ip:'192.168.56.20', prefix:24, gw:'192.168.56.1', dns:'1.1.1.1', method:'auto', autoconnect:true }
  },
  manuals: {
    docker:{name:'docker - gestiona imágenes, contenedores y recursos',sec:'1',s:'docker [OPCIONES] COMANDO',d:'Cliente de Docker Engine para trabajar con imágenes, contenedores, redes, volúmenes, builds y aplicaciones Compose.',o:[['search TÉRMINO','busca imágenes en Docker Hub'],['pull IMAGEN[:TAG]','descarga una imagen'],['images','lista las imágenes locales'],['run [OPCIONES] IMAGEN [ORDEN]','crea y arranca un contenedor'],['ps [-a]','lista contenedores'],['build -t NOMBRE .','construye una imagen desde un Dockerfile'],['logs / exec / inspect','diagnostica un contenedor'],['network / volume','administra redes y almacenamiento'],['compose','gestiona aplicaciones multi-contenedor']],e:'docker run -d --name web -p 8080:80 nginx'},
    'docker-compose':{name:'docker compose - orquesta aplicaciones multi-contenedor',sec:'1',s:'docker compose [OPCIONES] COMANDO',d:'Crea y administra los servicios declarados en compose.yaml o docker-compose.yml.',o:[['config','valida la configuración'],['up -d','crea y arranca los servicios'],['ps','muestra su estado'],['logs','consulta sus registros'],['exec SERVICIO ORDEN','ejecuta una orden en un servicio'],['down [-v]','elimina el proyecto y opcionalmente sus volúmenes']],e:'docker compose up -d'}
  },
  manualBriefs: {
    docker:['gestiona imágenes, contenedores y recursos','docker COMANDO [OPCIONES]','Cliente de Docker Engine.'],
    'docker-compose':['orquesta aplicaciones con Compose','docker compose COMANDO','Administra aplicaciones multi-contenedor.']
  },
  completions: {
    docker:['run','ps','images','pull','build','exec','logs','inspect','start','stop','restart','rm','rmi','tag','push','commit','save','load','history','search','network','volume','system','compose','stats','top','port','rename','prune','create','attach','update','login','logout','version','info','--help'],
    'docker-compose':['config','up','down','ps','logs','exec','build','pull']
  },
  createChallenges(ctx) {
    const checks=dockerPracticeChecks(ctx);
    const s=ctx.state;
    const fileAt=(path)=>ctx.getNode(path.split('/').filter(Boolean));
    const solutions=[
      'docker search alpine\ndocker pull alpine\ndocker images alpine',
      'docker run -d --name primer-alpine alpine sleep 3600\ndocker ps',
      'docker run -d --name ciclo nginx\ndocker stop ciclo\ndocker start ciclo\ndocker restart ciclo\ndocker ps',
      'docker run -d --name web -p 8080:80 nginx\ndocker ps',
      'docker inspect web\ndocker logs web\ndocker top web\ndocker port web',
      "mkdir -p /root/miweb\necho '<h1>Mi web</h1>' > /root/miweb/index.html\necho 'FROM nginx' > /root/miweb/Dockerfile\necho 'COPY index.html /usr/share/nginx/html/index.html' >> /root/miweb/Dockerfile\ndocker build -t miweb:v1 /root/miweb",
      'docker run -d --name miweb-app -p 8081:80 miweb:v1\ndocker ps',
      'docker tag miweb:v1 alumno/miweb:1.0\ndocker save -o /root/miweb-1.0.tar alumno/miweb:1.0',
      'docker volume create datos\ndocker run -d --name persistente -v datos:/var/lib/app alpine sleep 3600\ndocker volume inspect datos',
      "mkdir -p /root/site\necho '<h1>Bind mount</h1>' > /root/site/index.html\ndocker run -d --name bindweb -p 8082:80 -v /root/site:/usr/share/nginx/html nginx",
      'docker network create labnet\ndocker run -d --name backend --network labnet nginx\ndocker run -d --name frontend --network labnet alpine sleep 3600\ndocker network inspect labnet',
      'docker run -d --name limitado --memory 256m --cpus 0.50 --restart unless-stopped nginx\ndocker stats',
      "mkdir -p /root/stack\ncat > /root/stack/compose.yaml <<'EOF'\nservices:\n  web:\n    image: nginx\n  db:\n    image: mariadb\n    environment:\n      MARIADB_ROOT_PASSWORD: curso\n    volumes:\n      - datos_db:/var/lib/mysql\nvolumes:\n  datos_db:\nEOF\ncd /root/stack\ndocker compose -p tienda up -d",
      'cd /root/stack\ndocker compose -p tienda config\ndocker compose -p tienda ps\ndocker compose -p tienda logs\ndocker compose -p tienda up -d --scale web=3',
      "mkdir -p /root/produccion\ncat > /root/produccion/Dockerfile <<'EOF'\nFROM node:20-alpine AS build\nWORKDIR /app\nCOPY . .\nRUN npm run build\nFROM nginx:alpine\nCOPY --from=build /app/dist /usr/share/nginx/html\nEOF\ndocker build -t miapp:prod /root/produccion\ndocker history miapp:prod"
    ];
    const challenges=[
      {badge:'NIVEL 1 · IMÁGENES',title:'Prepara Alpine',goal:'Busca la imagen oficial de Alpine y deja descargada localmente su etiqueta <b>latest</b>.',check:checks[0]},
      {badge:'NIVEL 1 · EJECUCIÓN',title:'Tu primer contenedor',goal:'Deja ejecutándose en segundo plano un contenedor llamado <b>primer-alpine</b> basado en Alpine.',check:checks[1]},
      {badge:'NIVEL 1 · CICLO DE VIDA',title:'Controla el ciclo de vida',goal:'Crea un contenedor llamado <b>ciclo</b>, detenlo, vuelve a arrancarlo y reinícialo. Debe quedar activo.',check:checks[2]},
      {badge:'NIVEL 2 · PUERTOS',title:'Publica un servidor web',goal:'Deja un contenedor nginx llamado <b>web</b> ejecutándose en segundo plano y publica su puerto 80 mediante el puerto 8080 del host.',check:checks[3]},
      {badge:'NIVEL 2 · DIAGNÓSTICO',title:'Investiga el servidor web',goal:'Revisa la configuración, los registros, los procesos y los puertos publicados del contenedor <b>web</b>.',check:checks[4]},
      {badge:'NIVEL 3 · DOCKERFILE',title:'Crea una imagen propia',goal:'Crea en <b>/root/miweb</b> un Dockerfile que parta de nginx y copie un index.html propio. Construye la imagen resultante como <b>miweb:v1</b>.',check:checks[5]},
      {badge:'NIVEL 3 · IMAGEN PROPIA',title:'Ejecuta tu build',goal:'Deja funcionando un contenedor llamado <b>miweb-app</b> creado desde <b>miweb:v1</b> y publícalo mediante el puerto 8081 del host.',check:checks[6]},
      {badge:'NIVEL 3 · TRANSPORTE',title:'Etiqueta y exporta la imagen',goal:'Crea la etiqueta <b>alumno/miweb:1.0</b> a partir de miweb:v1 y expórtala al fichero <b>/root/miweb-1.0.tar</b>.',check:checks[7]},
      {badge:'NIVEL 4 · VOLÚMENES',title:'Conserva los datos',goal:'Crea el volumen <b>datos</b> y móntalo en <b>/var/lib/app</b> dentro de un contenedor llamado <b>persistente</b>.',check:checks[8]},
      {badge:'NIVEL 4 · BIND MOUNT',title:'Sirve contenido del host',goal:'Crea contenido web en <b>/root/site</b> y móntalo en <b>/usr/share/nginx/html</b> dentro de un nginx llamado <b>bindweb</b>, accesible desde el puerto 8082 del host.',check:checks[9]},
      {badge:'NIVEL 4 · REDES',title:'Conecta una aplicación de dos capas',goal:'Crea la red <b>labnet</b> y conecta a ella dos contenedores activos llamados <b>frontend</b> y <b>backend</b>. Comprueba finalmente la red.',check:checks[10]},
      {badge:'NIVEL 5 · RECURSOS',title:'Limita un servicio',goal:'Deja activo un contenedor <b>limitado</b> con un máximo de 256 MiB de memoria, 0.50 CPU y política de reinicio <b>unless-stopped</b>. Revisa después su consumo.',check:checks[11]},
      {badge:'NIVEL 5 · COMPOSE',title:'Escribe una aplicación Compose',goal:'Crea <b>/root/stack/compose.yaml</b> con un servicio <b>web</b> basado en nginx, un servicio <b>db</b> basado en MariaDB y un volumen con nombre para la base de datos. Despliega el proyecto como <b>tienda</b>.',check:checks[12]},
      {badge:'NIVEL 5 · OPERACIÓN COMPOSE',title:'Opera el proyecto',goal:'Valida la configuración del proyecto <b>tienda</b>, revisa sus contenedores y sus logs, y escala el servicio web a tres réplicas.',check:checks[13]},
      {badge:'NIVEL 6 · PRODUCCIÓN',title:'Construye una imagen multi-stage',goal:'Crea <b>/root/produccion/Dockerfile</b> con una etapa de construcción nombrada mediante <b>AS</b> y una segunda etapa final. Construye el resultado como <b>miapp:prod</b>.',check:checks[14]}
    ];
    return challenges.map((challenge,index)=>({...challenge,solution:solutions[index]}));
  }
};
