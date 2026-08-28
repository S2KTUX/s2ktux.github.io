<div class="lesson-wrapper">

    <header class="lesson-header">
        <span class="badge">DOCKER Clase 2</span>
        <h1>Docker para el día a día</h1>
        <p>Gestionar y compartir imágenes, persistir datos con volúmenes, conectar contenedores en red y levantarlo todo con Docker Compose</p>

        <a href="https://www.youtube.com/watch?v=15_TPrR1cSA" target="_blank" rel="noopener" class="video-card">
            <div class="video-icon">🎬</div>
            <div class="video-text">
                <strong>VER VIDEO YOUTUBE - CLASE 2</strong>
                <span>Imágenes, volúmenes, redes y Docker Compose</span>
            </div>
        </a>
    </header>

    <div class="lesson-layout">

        <aside class="lesson-toc">
            <h2>Contenido</h2>
            <ul>
                <li><a href="#obj1">1. Gestionar imágenes</a></li>
                <li><a href="#obj2">2. Volúmenes</a></li>
                <li><a href="#obj3">3. Redes</a></li>
                <li><a href="#obj4">4. Docker Compose</a></li>
            </ul>
        </aside>

        <div class="course-content u-inline-285c4804ec">

            <section id="obj1" class="lesson-section">
                <h2>1. Gestionar imágenes</h2>

                <h3>Crear y exportar</h3>
                <p>En la Clase 1 ya creamos imágenes con <code>docker build</code> y las vimos con <code>docker images</code>. Ahora toca lo que hacemos con ellas: etiquetarlas, compartirlas y moverlas de una máquina a otra.</p>
                <p>Si ya tenemos un contenedor en ejecución, podemos crear una imagen a partir de su estado actual con <code>docker commit</code>:</p>
                <pre><code>docker commit ID-CONTENEDOR NOMBRE-IMAGEN</code></pre>
                <p><strong>Aviso:</strong> esto es un atajo, no la forma buena de crear imágenes. Lo correcto es el <code>Dockerfile</code> de la Clase 1, porque es reproducible; el <code>commit</code> es una foto manual que nadie sabe cómo se hizo. Que sepas que existe, pero no cojas el hábito.</p>
                <p>Todas las imágenes —creadas, descargadas o commiteadas— se pueden exportar a un fichero <code>.tar</code> para llevarlas a otro sistema:</p>
                <pre><code>docker save -o fichero.tar imagen</code></pre>
                <p>Y para importarlas en la máquina de destino:</p>
                <pre><code>docker load -i fichero.tar</code></pre>
                <img class="u-inline-525b23bb9f" src="/images/Docker-save1.png" alt="docker save y docker load" width="912" height="547">

                <h3>Etiquetas: el tag de una imagen</h3>
                <p>Una imagen se identifica con <code>nombre:version</code>. Esa versión es la <strong>etiqueta</strong> (tag), y la podemos indicar al construir con el argumento <code>-t</code> del <code>docker build</code>.</p>
                <p>También podemos añadir un nombre y etiqueta nuevos a una imagen ya existente:</p>
                <pre><code>docker tag &lt;nombre_imagen&gt;:&lt;etiqueta&gt; &lt;nuevo_nombre&gt;:&lt;nueva_etiqueta&gt;</code></pre>
                <p><strong>Nota:</strong> <code>docker tag</code> no duplica la imagen, solo le añade otro nombre que apunta a la misma. Si no indicamos etiqueta, Docker asume <code>:latest</code>.</p>

                <h3>Compartir imágenes: push y pull</h3>
                <p>Para compartir una imagen la subimos a <strong>DockerHub</strong>, el repositorio donde hay miles de imágenes públicas. Se sube con:</p>
                <pre><code>docker push USUARIO/imagen:tag</code></pre>
                <p><strong>Importante:</strong> el usuario debe ser el mismo con el que nos hemos registrado, y hay que haber iniciado sesión antes con <code>docker login</code>. Es decir, la imagen debe llamarse ya <code>usuario/imagen:tag</code> (si no, la renombramos con <code>docker tag</code>).</p>
                <p>A partir de ahí, cualquiera la descarga igual que hicimos con las imágenes públicas en la Clase 1:</p>
                <pre><code>docker pull usuario/miweb:1.0</code></pre>
                <p>También se pueden subir a otros repositorios remotos; en ese caso el nombre debe incluir la dirección del registro, por ejemplo con GitHub.</p>
            </section>

            <section id="obj2" class="lesson-section">
                <h2>2. Volúmenes</h2>
                <p>Hay que entender una cosa clave: <strong>un contenedor no guarda su estado</strong>. Todo lo que se escribe dentro vive solo mientras el contenedor existe; en cuanto lo borras, esos datos desaparecen. Para una base de datos o cualquier fichero que deba sobrevivir, eso no vale.</p>
                <p>La solución son los <strong>volúmenes</strong>: almacenamiento que vive fuera del contenedor y que montamos dentro. Así podemos borrar y recrear el contenedor, pero los datos permanecen. Físicamente Docker los guarda en su propia carpeta del sistema (<code>/var/lib/docker/volumes</code>), pero la gracia es justo esa: no te tienes que preocupar de dónde están, los gestiona él.</p>
                <pre><code>docker volume create mi-vol
docker volume ls
docker volume inspect mi-vol</code></pre>
                <img class="u-inline-525b23bb9f" src="/images/VOLUMEN-1.png" alt="Crear e inspeccionar un volumen" width="743" height="427">
                <p>Para montarlos usamos el argumento <code>-v</code> al lanzar <code>docker run</code>, y hay dos formas:</p>
                <div class="lesson-table-scroll u-inline-7156d61cff">
                <table class="lesson-table">
                    <thead>
                        <tr><th scope="col">Tipo</th><th scope="col">Sintaxis</th><th scope="col">Para qué</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Volumen</td><td><code>-v nombre:/ruta</code></td><td>Almacenamiento gestionado por Docker. El habitual para datos.</td></tr>
                        <tr><td>Bind mount</td><td><code>-v /ruta/host:/ruta/contenedor</code></td><td>Monta una carpeta real de tu máquina dentro del contenedor.</td></tr>
                    </tbody>
                </table>
                </div>
                <p>El <strong>volumen</strong> lo gestiona Docker y es el que usarás para persistir datos de verdad (la base de datos, por ejemplo). El <strong>bind mount</strong> apunta a una carpeta concreta de tu host y es cómodo para desarrollo: editas un fichero en tu máquina y el contenedor lo ve al instante.</p>
                <p><strong>El truco para distinguirlos es la barra:</strong> si empieza por <code>/</code> es una ruta de tu máquina, o sea un bind mount; si es solo un nombre, es un volumen de Docker.</p>
                <p>Un ejemplo con volumen:</p>
                <pre><code>docker run -d --name db -v datos:/var/lib/mysql mariadb</code></pre>
                <p>Un ejemplo con bind mount:</p>
                <pre><code>docker run -d --name web -v /home/usuario/web:/usr/share/nginx/html nginx</code></pre>
                <img class="u-inline-525b23bb9f" src="/images/VOLUMEN-2.png" alt="Contenedor con un volumen montado" width="823" height="169">
                <p>Aunque borremos el contenedor <code>db</code>, el volumen <code>datos</code> sigue ahí con la información, listo para montarlo en otro. La prueba, en tres pasos:</p>
                <pre><code>docker rm -f db                                            # borramos el contenedor
docker run -d --name db -v datos:/var/lib/mysql mariadb    # lo recreamos igual
docker exec -it db mysql -uroot -p                         # los datos siguen ahí</code></pre>
                <p>Para borrar un volumen que ya no usamos:</p>
                <pre><code>docker volume rm mi-vol</code></pre>

                <h3>Copiar ficheros puntuales con docker cp</h3>
                <p>Si lo único que quieres es sacar o meter un fichero concreto en un contenedor, no hace falta montar un volumen. Para eso está <code>docker cp</code>, que copia igual que el <code>cp</code> de siempre pero entre tu máquina y el contenedor:</p>
                <pre><code>docker cp db:/etc/mysql/my.cnf .      # del contenedor a tu carpeta
docker cp ./config.txt db:/tmp/       # de tu carpeta al contenedor</code></pre>
                <img class="u-inline-525b23bb9f" src="/images/VOLUMEN-3.png" alt="docker cp entre host y contenedor" width="726" height="546">
            </section>

            <section id="obj3" class="lesson-section">
                <h2>3. Redes</h2>
                <p>Por defecto, cada contenedor está aislado. Cuando tenemos varios que deben hablar entre sí (una web y su base de datos, por ejemplo), los ponemos en la <strong>misma red</strong>.</p>
                <pre><code>docker network create red
docker network ls
docker network inspect red</code></pre>
                <img class="u-inline-525b23bb9f" src="/images/RED-1.png" alt="Crear y listar redes" width="745" height="849">
                <p>El driver que vas a usar casi siempre es <strong>bridge</strong> — es más, es el que se pone por defecto si no dices nada. Para empezar usaremos casi siempre bridge, pero podríamos ver otras opciones. Para poner una en específico podríamos indicar <code>docker network create --driver bridge red</code>. Las que existen son:</p>
                <div class="lesson-table-scroll u-inline-7156d61cff">
                <table class="lesson-table">
                    <thead>
                        <tr><th scope="col">Driver</th><th scope="col">Qué hace</th></tr>
                    </thead>
                    <tbody>
                        <tr><td><code>bridge</code></td><td>Red predeterminada que conecta contenedores dentro de una misma máquina.</td></tr>
                        <tr><td><code>host</code></td><td>El contenedor usa directamente la red del anfitrión. Más rápido, pero menos aislamiento.</td></tr>
                        <tr><td><code>overlay</code></td><td>Conecta contenedores que se ejecutan en máquinas diferentes.</td></tr>
                        <tr><td><code>macvlan</code></td><td>El contenedor aparece en la red como un dispositivo independiente, con su propia MAC.</td></tr>
                        <tr><td><code>none</code></td><td>Desactiva la red del contenedor, dejándolo sin conexión externa.</td></tr>
                    </tbody>
                </table>
                </div>
                <p>Esta red la podemos usar al lanzar el contenedor:</p>
                <pre><code>docker run -d --name web --network red nginx</code></pre>
                <p>También podemos conectar una red a un contenedor ya existente (tanto la red como el contenedor deben existir previamente):</p>
                <pre><code>docker network connect mi-red mi-contenedor
docker network disconnect mi-red mi-contenedor</code></pre>
                <p>Cuando un contenedor necesita hablar con otro, necesita saber dónde está: normalmente su IP. El problema es que <strong>las IPs de los contenedores cambian</strong> — paras uno y al arrancarlo Docker puede darle otra.</p>
                <p>Dentro de una red creada por nosotros esto se soluciona solo: cada contenedor es alcanzable por <strong>su propio nombre</strong>, y Docker se encarga de traducirlo a la IP que tenga en ese momento. Como el nombre nunca cambia, siempre funciona. Eso sí, sin una red propia los contenedores no es que no se vean — se ven, pero solo por IP.</p>
                <p>Por ejemplo:</p>
                <pre><code>docker run -dit --name linux --network red alpine
docker exec -it linux ping web</code></pre>
                <img class="u-inline-525b23bb9f" src="/images/RED-2.png" alt="Resolución por nombre entre contenedores" width="746" height="483">
                <p>Por último, para borrar una red:</p>
                <pre><code>docker network rm red</code></pre>
            </section>

            <section id="obj4" class="lesson-section">
                <h2>4. Docker Compose</h2>
                <p>Hasta ahora, para levantar una web con su base de datos hemos tenido que lanzar varios <code>docker run</code>, crear la red, crear el volumen… a mano y en orden. <strong>Docker Compose</strong> nos permite describir todo eso en un único fichero y levantarlo con un solo comando.</p>
                <p>El fichero se llama <code>compose.yaml</code> y describe los servicios (contenedores), sus volúmenes y su configuración. Un ejemplo sencillo:</p>
                <img class="u-inline-525b23bb9f" src="/images/COMPOSE-1.png" alt="Ejemplo de fichero compose.yaml" width="754" height="234">
                <p>Tenemos el servicio <code>web</code> que está usando la imagen <code>nginx</code>, publicando el puerto 80 del contenedor en el 8080 del host.</p>
                <p>Podemos comprobar que no describimos pasos, describimos el resultado que queremos: qué servicios existen y cómo son. Docker se encarga del cómo.</p>
                <p>Levantamos todos los servicios de una vez, y una vez levantado con Compose, dejamos de usar <code>docker ps</code> o <code>docker logs</code> y tiramos de los del propio Compose, que actúan sobre todos los servicios del fichero a la vez:</p>
                <pre><code>docker compose up -d
docker compose -f /ruta/al/compose.yaml up -d    # si el fichero está en otra ruta

docker compose ps
docker compose logs -f
docker compose exec web sh</code></pre>
                <img class="u-inline-525b23bb9f" src="/images/COMPOSE-2.png" alt="docker compose up, ps y logs" width="1421" height="791">
                <p>En estos comandos usas el nombre del <em>servicio</em> (<code>web</code>), no el del contenedor que ves en <code>docker ps</code> — Compose razona por servicios.</p>

                <h3>Construir un Dockerfile desde Compose</h3>
                <p>En vez de usar una imagen ya hecha, podemos pedirle a Compose que construya la nuestra. Si tenemos un <code>Dockerfile</code> en la misma carpeta que el fichero compose, solo hay que añadir la clave <code>build</code> en el servicio e indicar su ruta:</p>
                <pre><code>services:
  web:
    build: .
    ports:
      - "8080:80"</code></pre>
                <p>Ese <code>.</code> significa "el Dockerfile de esta misma carpeta". Con <code>docker compose up -d --build</code> forzamos que lo reconstruya cuando cambiemos algo.</p>

                <h3>Un ejemplo más completo</h3>
                <img class="u-inline-525b23bb9f" src="/images/COMPOSE-3.png" alt="Ejemplo de compose con varios servicios" width="1052" height="415">
                <img class="u-inline-525b23bb9f" src="/images/COMPOSE-4.png" alt="Servicios levantados con Compose" width="1396" height="721">

                <h3>Volúmenes y redes en Compose</h3>
                <p>Los volúmenes y las redes se declaran en su propia sección y luego se referencian en cada servicio que los use. Un ejemplo completo con nginx como web y redis como su almacén, con red y un volumen:</p>
                <img class="u-inline-525b23bb9f" src="/images/COMPOSE-5.png" alt="Compose con volúmenes y redes declarados" width="1044" height="516">
                <img class="u-inline-525b23bb9f" src="/images/COMPOSE-6.png" alt="Compose levantando los servicios con su red y volumen" width="1417" height="589">
                <p>Abajo se declaran el volumen y la red. Al volumen lo referencia el servicio de <strong>redis</strong>, indicando la ruta donde se monta dentro del contenedor (<code>/data</code>, donde redis guarda su información). La red la comparten los dos servicios, y por eso el servicio web puede encontrar a <strong>redis</strong> por su nombre.</p>
                <p>Al declararlos solo con el nombre, Docker los crea con sus valores por defecto: un volumen normal gestionado por él y una red de tipo <code>bridge</code>. Se pueden personalizar, pero para la mayoría de casos con esto sobra.</p>
                <p>De hecho, si no declaramos ninguna red, Compose <strong>crea una automáticamente</strong> y mete todos los servicios dentro — por eso el primer ejemplo ya funcionaba sin escribir nada de redes. Esa red toma el nombre de la carpeta del proyecto seguido de <code>_default</code> (por ejemplo <code>miproyecto_default</code>), y puedes verla con <code>docker network ls</code> o mirarla a fondo con <code>docker network inspect</code>, como vimos antes.</p>
                <p>Lo más importante a tener en cuenta es que en Compose describimos <em>qué</em> queremos que exista —estos servicios, este volumen, esta red— y Docker lo monta. No le decimos cómo, le decimos qué. Esto funciona de la misma manera en <strong>Kubernetes</strong>.</p>
                <p>Como vemos al final de la última imagen, podemos parar y eliminar todo lo que levantamos (contenedores y red):</p>
                <pre><code>docker compose down</code></pre>
                <p>Si además queremos borrar los volúmenes, usamos <code>docker compose down -v</code> — pero cuidado, que eso se lleva los datos por delante.</p>
            </section>

        </div>
    </div>
</div>
