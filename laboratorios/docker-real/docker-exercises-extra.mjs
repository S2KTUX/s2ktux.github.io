const alpine='alpine:3.23',nginx='s2ktux/nginx-lab:2';
const running=name=>`test "$(docker inspect -f '{{.State.Running}}' ${name})" = true`;
const image=(name,tag)=>`expected=$(docker image inspect -f '{{.Id}}' ${tag}) && test "$(docker inspect -f '{{.Image}}' ${name})" = "$expected"`;
const mount=(name,type,source,target)=>`docker inspect -f '{{range .Mounts}}{{.Type}} {{if .Name}}{{.Name}}{{else}}{{.Source}}{{end}} {{.Destination}}{{println}}{{end}}' ${name} | grep -Fxq '${type} ${source} ${target}'`;

export const extraExercises=[
 {
  id:'entorno',class:1,title:'Configura sin cambiar la imagen',
  goal:'Crea /root/entorno.env con APP_ENV=desarrollo y MENSAJE=Curso Docker. Deja activo un contenedor Alpine llamado entorno que reciba esas variables desde el archivo, pero con APP_ENV cambiado a practicas al arrancar. Comprueba los valores dentro del contenedor.',
  solution:`printf 'APP_ENV=desarrollo\\nMENSAJE=Curso Docker\\n' > /root/entorno.env
docker run -d --name entorno --env-file /root/entorno.env -e APP_ENV=practicas ${alpine} sleep 3600
docker exec entorno printenv APP_ENV MENSAJE`,
  checks:[
   ['Archivo de configuración',"grep -qx 'APP_ENV=desarrollo' /root/entorno.env && grep -qx 'MENSAJE=Curso Docker' /root/entorno.env"],
   ['Contenedor activo',running('entorno')],
   ['Valores dentro del contenedor',`test "$(docker exec entorno printenv APP_ENV)" = practicas && test "$(docker exec entorno printenv MENSAJE)" = 'Curso Docker'`],
  ],
 },
 {
  id:'tarea-logs',class:1,title:'Una tarea que termina con error',
  goal:'Crea un contenedor Alpine llamado tarea-logs que escriba Inicio y Finalizada en dos líneas y termine con código 7. Consérvalo detenido para poder consultar su estado. Guarda sus registros en /root/tarea.log.',
  solution:`docker run --name tarea-logs ${alpine} sh -c 'echo Inicio; echo Finalizada; exit 7'
docker ps -a
docker inspect -f '{{.State.Status}} {{.State.ExitCode}}' tarea-logs
docker logs tarea-logs > /root/tarea.log`,
  checks:[
   ['Tarea detenida con código 7',`test "$(docker inspect -f '{{.State.Status}} {{.State.ExitCode}}' tarea-logs)" = 'exited 7'`],
   ['Registros del contenedor',"docker logs tarea-logs | grep -qx Inicio && docker logs tarea-logs | grep -qx Finalizada"],
   ['Registros guardados',"grep -qx Inicio /root/tarea.log && grep -qx Finalizada /root/tarea.log"],
  ],
 },
 {
  id:'arg-env',class:1,title:'Distingue ARG de ENV',
  goal:'En /root/configurable, crea una imagen configurable:1 basada en Alpine. Su Dockerfile tendrá un argumento VERSION: úsalo para guardar la versión de construcción en /version-build y como valor inicial de la variable VERSION. Construye con 2.0 y deja activo configurable con VERSION=3.0. El archivo debe seguir mostrando 2.0.',
  solution:`mkdir -p /root/configurable
cat > /root/configurable/Dockerfile <<'EOF'
FROM ${alpine}
ARG VERSION=1.0
RUN echo "$VERSION" > /version-build
ENV VERSION=$VERSION
CMD ["sleep", "3600"]
EOF
docker build --build-arg VERSION=2.0 -t configurable:1 /root/configurable
docker run -d --name configurable -e VERSION=3.0 configurable:1
docker exec configurable cat /version-build
docker exec configurable printenv VERSION`,
  checks:[
   ['Imagen construida y contenedor activo',`${image('configurable','configurable:1')} && ${running('configurable')}`],
   ['Versión de construcción',`test "$(docker exec configurable cat /version-build)" = 2.0`],
   ['ENV inicial en la imagen',"docker image inspect -f '{{range .Config.Env}}{{println .}}{{end}}' configurable:1 | grep -qx VERSION=2.0"],
   ['Configuración al ejecutar',`test "$(docker exec configurable printenv VERSION)" = 3.0`],
  ],
 },
 {
  id:'cmd-entrypoint',class:1,title:'Cambia el saludo de dos formas',
  goal:'Construye saludo-cmd:1 con CMD y saludo-entrypoint:1 con ENTRYPOINT, ambas desde Alpine. La primera debe decir hola por defecto y permitir sustituir el comando. La segunda debe fijar echo y recibir el mensaje como argumento. Conserva tres contenedores terminados: saludo-default con hola, saludo-cambio con adios usando la primera imagen y saludo-fijo con adios usando la segunda.',
  solution:`mkdir -p /root/saludos/cmd /root/saludos/entrypoint
cat > /root/saludos/cmd/Dockerfile <<'EOF'
FROM ${alpine}
CMD ["echo", "hola"]
EOF
cat > /root/saludos/entrypoint/Dockerfile <<'EOF'
FROM ${alpine}
ENTRYPOINT ["echo"]
CMD ["hola"]
EOF
docker build -t saludo-cmd:1 /root/saludos/cmd
docker build -t saludo-entrypoint:1 /root/saludos/entrypoint
docker run --name saludo-default saludo-cmd:1
docker run --name saludo-cambio saludo-cmd:1 echo adios
docker run --name saludo-fijo saludo-entrypoint:1 adios`,
  checks:[
   ['Imagen con CMD',"docker image inspect saludo-cmd:1 >/dev/null && test -z \"$(docker image inspect -f '{{join .Config.Entrypoint \" \"}}' saludo-cmd:1)\""],
   ['Imagen con ENTRYPOINT',"test -n \"$(docker image inspect -f '{{join .Config.Entrypoint \" \"}}' saludo-entrypoint:1)\""],
   ['Saludo por defecto',`${image('saludo-default','saludo-cmd:1')} && test "$(docker logs saludo-default)" = hola`],
   ['Comando sustituido',`${image('saludo-cambio','saludo-cmd:1')} && test "$(docker logs saludo-cambio)" = adios`],
   ['Argumento de ENTRYPOINT',`${image('saludo-fijo','saludo-entrypoint:1')} && test "$(docker logs saludo-fijo)" = adios`],
  ],
 },
 {
  id:'commit',class:2,title:'Conserva un cambio en una imagen',
  goal:'Crea captura-origen desde Alpine y escribe Conservado en /mensaje.txt dentro del contenedor, sin montar un volumen. Obtén la imagen captura:1 a partir de ese estado. Deja activo captura-restaurada desde la nueva imagen y comprueba que conserva el archivo.',
  solution:`docker run -d --name captura-origen ${alpine} sleep 3600
docker exec captura-origen sh -c 'echo Conservado > /mensaje.txt'
docker commit captura-origen captura:1
docker run -d --name captura-restaurada captura:1 sleep 3600
docker exec captura-restaurada cat /mensaje.txt
# Para construir imágenes reproducibles, usa un Dockerfile.`,
  checks:[
   ['Nueva imagen y contenedor activo',`${image('captura-restaurada','captura:1')} && ${running('captura-restaurada')}`],
   ['Archivo conservado',`test "$(docker exec captura-restaurada cat /mensaje.txt)" = Conservado`],
   ['Archivo sin volumen',"mounts=$(docker inspect -f '{{range .Mounts}}{{.Destination}}{{println}}{{end}}' captura-restaurada) && ! printf '%s\\n' \"$mounts\" | grep -Eq '^(/|/mensaje.txt)$'"],
  ],
 },
 {
  id:'load',class:2,title:'Recupera una imagen exportada',
  goal:'Etiqueta Alpine como archivo/alpine:1 y expórtala a /root/alpine-copia.tar. Elimina solo esa etiqueta local y recupérala desde el archivo. Crea archivo-verificado con la imagen importada: debe escribir IMPORTADA y terminar.',
  solution:`docker tag ${alpine} archivo/alpine:1
docker save -o /root/alpine-copia.tar archivo/alpine:1
docker rmi archivo/alpine:1
docker load -i /root/alpine-copia.tar
docker run --name archivo-verificado archivo/alpine:1 echo IMPORTADA`,
  checks:[
   ['Archivo exportado con la etiqueta',"tar -xOf /root/alpine-copia.tar manifest.json | grep -Fq 'archivo/alpine:1'"],
   ['Imagen local recuperada',`test "$(docker image inspect -f '{{.Id}}' archivo/alpine:1)" = "$(docker image inspect -f '{{.Id}}' ${alpine})"`],
   ['Imagen ejecutada',`${image('archivo-verificado','archivo/alpine:1')} && test "$(docker logs archivo-verificado)" = IMPORTADA`],
  ],
 },
 {
  id:'copiar',class:2,title:'Copia archivos en los dos sentidos',
  goal:'Crea /root/original.txt con el texto Copia Docker y un contenedor Alpine activo llamado copia. Copia el archivo a /tmp/dato.txt dentro del contenedor, sin montar esa ruta. Después recupéralo como /root/recuperado.txt. Los dos archivos deben tener el mismo contenido.',
  solution:`printf 'Copia Docker\\n' > /root/original.txt
docker run -d --name copia ${alpine} sleep 3600
docker cp /root/original.txt copia:/tmp/dato.txt
docker cp copia:/tmp/dato.txt /root/recuperado.txt
cmp /root/original.txt /root/recuperado.txt`,
  checks:[
   ['Contenedor activo',running('copia')],
   ['Archivo en el contenedor',`test "$(docker exec copia cat /tmp/dato.txt)" = 'Copia Docker'`],
   ['Archivo recuperado',"grep -qx 'Copia Docker' /root/original.txt && cmp /root/original.txt /root/recuperado.txt"],
  ],
 },
 {
  id:'recrear',class:2,title:'Borra el contenedor, no los datos',
  goal:'Crea el volumen datos-recuperados. Escribe Persistente en /datos/mensaje.txt desde un contenedor Alpine y elimina ese contenedor. Deja otro contenedor Alpine activo llamado recuperado con el mismo volumen en /datos. El archivo debe seguir ahí.',
  solution:`docker volume create datos-recuperados
docker run --rm -v datos-recuperados:/datos ${alpine} sh -c 'echo Persistente > /datos/mensaje.txt'
docker run -d --name recuperado -v datos-recuperados:/datos ${alpine} sleep 3600
docker exec recuperado cat /datos/mensaje.txt`,
  checks:[
   ['Contenedor activo',running('recuperado')],
   ['Volumen reutilizado',mount('recuperado','volume','datos-recuperados','/datos')],
   ['Datos conservados',`test "$(docker exec recuperado cat /datos/mensaje.txt)" = Persistente`],
  ],
 },
 {
  id:'sololectura',class:2,title:'Protege los archivos del host',
  goal:'Crea /root/sololectura/index.html con el texto Web protegida. Deja activo un Nginx llamado sololectura que sirva ese directorio en el puerto 8084 de Linux. El montaje debe ser de solo lectura: desde el contenedor no se podrá modificar la página.',
  solution:`mkdir -p /root/sololectura
printf 'Web protegida\\n' > /root/sololectura/index.html
docker run -d --name sololectura -p 8084:80 -v /root/sololectura:/usr/share/nginx/html:ro ${nginx}
curl http://localhost:8084
# Esta escritura debe fallar; la página no debe cambiar:
docker exec sololectura sh -c 'echo CAMBIO > /usr/share/nginx/html/index.html'
curl http://localhost:8084`,
  checks:[
   ['Directorio del host montado',mount('sololectura','bind','/root/sololectura','/usr/share/nginx/html')],
   ['Montaje de solo lectura',`test "$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/usr/share/nginx/html"}}{{.RW}}{{end}}{{end}}' sololectura)" = false`],
   ['Página publicada',"curl -fsS --max-time 5 http://127.0.0.1:8084/ | grep -qx 'Web protegida'"],
  ],
 },
 {
  id:'mover-red',class:2,title:'Cambia de red sin recrear',
  goal:'Crea las redes bridge red-origen y red-destino. Inicia cliente-red con Alpine en la primera y web-red con Nginx en la segunda. Sin recrear cliente-red, conéctalo a red-destino y desconéctalo de red-origen. Deja ambos activos y comprueba que el cliente puede acceder a la web por el nombre web-red.',
  solution:`docker network create red-origen
docker network create red-destino
docker run -d --name cliente-red --network red-origen ${alpine} sleep 3600
docker run -d --name web-red --network red-destino ${nginx}
docker network connect red-destino cliente-red
docker network disconnect red-origen cliente-red
docker exec cliente-red wget -qO- http://web-red/`,
  checks:[
   ['Ambos contenedores activos',`${running('cliente-red')} && ${running('web-red')}`],
   ['Redes bridge',`test "$(docker network inspect -f '{{.Driver}}' red-origen)" = bridge && test "$(docker network inspect -f '{{.Driver}}' red-destino)" = bridge`],
   ['Cliente en la red destino',`test -n "$(docker inspect -f '{{with index .NetworkSettings.Networks "red-destino"}}{{.IPAddress}}{{end}}' cliente-red)" && test -z "$(docker inspect -f '{{with index .NetworkSettings.Networks "red-origen"}}{{.IPAddress}}{{end}}' cliente-red)"`],
   ['Acceso por nombre',"docker exec cliente-red wget -qO- -T 5 http://web-red/ >/dev/null"],
  ],
 },
 {
  id:'registro',class:2,title:'Publica en tu propio registro',
  goal:'Levanta registro-curso con s2ktux/registry-lab:2 en el puerto 5000 de Linux y el volumen registro-datos en /var/lib/registry. Publica Alpine como localhost:5000/curso/alpine:1, elimina esa etiqueta local y vuelve a descargarla desde tu registro. Crea registro-verificado desde ella: debe escribir PUBLICADA y terminar. No necesitas una cuenta de Docker Hub.',
  solution:`docker volume create registro-datos
docker run -d --name registro-curso -p 5000:5000 -v registro-datos:/var/lib/registry s2ktux/registry-lab:2
curl http://localhost:5000/v2/
docker tag ${alpine} localhost:5000/curso/alpine:1
docker push localhost:5000/curso/alpine:1
docker rmi localhost:5000/curso/alpine:1
docker pull localhost:5000/curso/alpine:1
docker run --name registro-verificado localhost:5000/curso/alpine:1 echo PUBLICADA`,
  checks:[
   ['Registro activo y persistente',`${running('registro-curso')} && ${mount('registro-curso','volume','registro-datos','/var/lib/registry')}`],
   ['Imagen publicada en el registro',"curl -fsS --max-time 5 http://127.0.0.1:5000/v2/curso/alpine/tags/list | grep -Eq '\"tags\"[[:space:]]*:[[:space:]]*\\[[^]]*\"1\"[[:space:]]*(,|\\])'"],
   ['Imagen ejecutada',`${image('registro-verificado','localhost:5000/curso/alpine:1')} && test "$(docker logs registro-verificado)" = PUBLICADA`],
  ],
 },
 {
  id:'compose-build',class:2,title:'Compose construye y configura',
  goal:'En /root/repaso, crea un Dockerfile basado en Alpine que guarde Imagen propia en /app/creado.txt. Crea compose.yaml con un servicio app que construya esa imagen y reciba MENSAJE=Compose funciona desde .env, no desde el Dockerfile. Despliega el proyecto repaso; app debe seguir activo y escribir el mensaje en sus logs.',
  solution:`mkdir -p /root/repaso
cat > /root/repaso/Dockerfile <<'EOF'
FROM ${alpine}
WORKDIR /app
RUN echo 'Imagen propia' > creado.txt
CMD ["sh", "-c", "printenv MENSAJE; sleep 3600"]
EOF
printf 'MENSAJE=Compose funciona\\n' > /root/repaso/.env
cat > /root/repaso/compose.yaml <<'EOF'
services:
  app:
    build: .
    env_file: .env
EOF
cd /root/repaso
docker compose -p repaso up -d --build
docker compose -p repaso logs app`,
  checks:[
   ['Un servicio app activo',`test "$(docker ps -q --filter label=com.docker.compose.project=repaso --filter label=com.docker.compose.service=app | wc -l)" = 1`],
   ['Contenido de la imagen propia',`cid=$(docker ps -q --filter label=com.docker.compose.project=repaso --filter label=com.docker.compose.service=app); test "$(docker exec "$cid" cat /app/creado.txt)" = 'Imagen propia'`],
   ['Variable inyectada y registrada',`cid=$(docker ps -q --filter label=com.docker.compose.project=repaso --filter label=com.docker.compose.service=app); test "$(docker exec "$cid" printenv MENSAJE)" = 'Compose funciona' && docker logs "$cid" | grep -qx 'Compose funciona' && grep -qx 'MENSAJE=Compose funciona' /root/repaso/.env`],
   ['Mensaje fuera de la imagen',`cid=$(docker ps -q --filter label=com.docker.compose.project=repaso --filter label=com.docker.compose.service=app); test -n "$cid" || exit 1; iid=$(docker inspect -f '{{.Image}}' "$cid") || exit 1; envs=$(docker image inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$iid") && ! printf '%s\\n' "$envs" | grep -q '^MENSAJE='`],
  ],
 },
 {
  id:'imagen-segura',class:3,title:'Sin root y sin archivos privados',
  goal:'En /root/segura, prepara publico.txt con Hola y secreto.txt con Solo laboratorio. Construye segura:1 desde Alpine: copia el contexto a /app, pero excluye secreto.txt con .dockerignore. Deja activo segura desde esa imagen con un usuario distinto de root. Dentro debe existir publico.txt, pero no secreto.txt.',
  solution:`mkdir -p /root/segura
printf 'Hola\\n' > /root/segura/publico.txt
printf 'Solo laboratorio\\n' > /root/segura/secreto.txt
printf 'secreto.txt\\n' > /root/segura/.dockerignore
cat > /root/segura/Dockerfile <<'EOF'
FROM ${alpine}
WORKDIR /app
COPY . .
RUN adduser -D appuser
USER appuser
CMD ["sleep", "3600"]
EOF
docker build -t segura:1 /root/segura
docker run -d --name segura segura:1
docker exec segura id
docker exec segura ls /app`,
  checks:[
   ['Imagen construida y contenedor activo',`${image('segura','segura:1')} && ${running('segura')}`],
   ['Proceso sin root',`uid=$(docker exec segura id -u) && test "$uid" -gt 0`],
   ['Archivo público incluido',`test "$(docker exec segura cat /app/publico.txt)" = Hola`],
   ['Archivo privado excluido',"test -s /root/segura/.dockerignore && grep -qx 'Solo laboratorio' /root/segura/secreto.txt && docker exec segura test ! -e /app/secreto.txt"],
  ],
 },
 {
  id:'salud',class:3,title:'La aplicación también tiene que responder',
  goal:'Deja activo un Nginx llamado saludable con un healthcheck HTTP y una página /salud.txt que contenga OK. Comprueba que llega a healthy. Elimina temporalmente esa página, observa unhealthy y recupérala. Al terminar, la página debe responder y el contenedor estar healthy.',
  solution:`docker run -d --name saludable --health-cmd='wget -qO- -T 2 http://127.0.0.1/salud.txt | grep -qx OK' --health-interval=5s --health-timeout=3s --health-retries=2 ${nginx}
docker exec saludable sh -c 'echo OK > /usr/share/nginx/html/salud.txt'
# Espera a que pase la comprobación antes de consultar el estado:
docker inspect -f '{{.State.Health.Status}}' saludable
docker exec saludable rm /usr/share/nginx/html/salud.txt
# Tras dos comprobaciones fallidas debe aparecer unhealthy:
docker inspect -f '{{.State.Health.Status}}' saludable
docker exec saludable sh -c 'echo OK > /usr/share/nginx/html/salud.txt'
# Espera a la siguiente comprobación: debe volver a healthy.
docker inspect -f '{{.State.Health.Status}}' saludable`,
  checks:[
   ['Contenedor activo',running('saludable')],
   ['Healthcheck saludable',`test "$(docker inspect -f '{{.State.Health.Status}}' saludable)" = healthy`],
   ['Página de salud disponible',"docker exec saludable wget -qO- -T 5 http://127.0.0.1/salud.txt | grep -qx OK"],
  ],
 },
 {
  id:'actualizar-limites',class:3,title:'Ajusta un servicio en marcha',
  goal:'Inicia un Nginx llamado ajustable con 64 MiB de memoria y 0,25 CPU. Sin recrearlo, cambia los límites a 128 MiB y 0,75 CPU y su política de reinicio a unless-stopped. Déjalo activo y consulta su consumo.',
  solution:`docker run -d --name ajustable --memory 64m --memory-swap 256m --cpus 0.25 ${nginx}
docker inspect -f '{{.Id}}' ajustable
docker update --memory 128m --memory-swap 256m --cpus 0.75 --restart unless-stopped ajustable
docker inspect -f '{{.Id}} {{.HostConfig.Memory}} {{.HostConfig.NanoCpus}}' ajustable
docker stats --no-stream ajustable`,
  checks:[
   ['Contenedor activo',running('ajustable')],
   ['Límites actualizados',`test "$(docker inspect -f '{{.HostConfig.Memory}} {{.HostConfig.NanoCpus}}' ajustable)" = '134217728 750000000'`],
   ['Política de reinicio',`test "$(docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' ajustable)" = unless-stopped`],
  ],
 },
];
