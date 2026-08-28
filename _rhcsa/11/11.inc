<div class="lesson-wrapper">

    <header class="lesson-header">
        <span class="badge">RHCSA Clase Extra</span>
        <h1>Clase Extra</h1>
        <p>Dominio de herramientas críticas, gestión de accesos y entorno de certificación</p>

        <a href="https://youtu.be/T7jPRmBA9_g" target="_blank" rel="noopener" class="video-card">
            <div class="video-icon">🎬</div>
            <div class="video-text">
                <strong>VER VIDEO YOUTUBE - CLASE EXTRA</strong>
                <span>Tips técnicos y metodología para el examen RHCSA</span>
            </div>
        </a>
    </header>

    <div class="lesson-layout">

        <aside class="lesson-toc">
            <h2>Objetivos Extra</h2>
            <ul>
                <li><a href="#obj1">1. Podman</a></li>
                <li><a href="#obj2">2. Comando Find</a></li>
                <li><a href="#obj3">3. Reset root</a></li>
                <li><a href="#obj4">4. SSH y copy-paste</a></li>
                <li><a href="#obj5">5. Inside Red Hat</a></li>
            </ul>
        </aside>
        <div class="course-content u-inline-285c4804ec">

            <section id="obj1" class="lesson-section">
                <h2>1. Podman</h2>
                <p>Podman es una herramienta para ejecutar contenedores y es muy probable que aparezca en el examen, especialmente en tareas relacionadas con el registro en repositorios y la creación de contenedores como servicios.</p>
                <p>A diferencia de <code>dnf</code>, Podman trabaja con imágenes de contenedor. Algunas imágenes están protegidas, por lo que primero debemos autenticarnos usando <code>podman login registry.redhat.io</code> e introducir nuestras credenciales.</p>
                <p>Podemos buscar imágenes con <code>podman search httpd</code> y descargarlas, por ejemplo, mediante <code>podman pull docker.io/library/httpd</code>. Las imágenes descargadas se consultan con <code>podman images</code> y pueden eliminarse usando <code>podman rmi ID-IMAGEN</code>.</p>
                <img class="u-inline-525b23bb9f" src="/images/podman1.png" alt="podman ejemplo" width="823" height="353">
                <p>Una vez disponible la imagen, podemos crear un contenedor y comprobar su estado. Podemos detenerlo con <code>podman stop</code> o eliminarlo con <code>podman rm</code>.</p>
                <pre><code>podman run -d --name NOMBRE -p PUERTO_HOST:PUERTO_CONTENEDOR ID-IMAGEN
podman ps</code></pre>
                <img class="u-inline-525b23bb9f" src="/images/podman2.png" alt="podman ejemplo" width="1299" height="407">
                <p>Si necesitamos trabajar de forma interactiva usaremos el modo <code>-it</code>. Para localizar contenido dentro del sistema, <code>find / -name index</code>. También pueden pedir mapear contenido local al contenedor mediante volúmenes:</p>
                <pre><code>podman run -it ID-IMAGEN /bin/bash
podman run -d --name NOMBRE -p 8080:80 -v /RUTA-LOCAL:/RUTA/index.html:Z ID-IMAGEN</code></pre>
                <img class="u-inline-525b23bb9f" src="/images/podman3.png" alt="podman ejemplo" width="1047" height="418">
                <p>Una tarea muy habitual en el examen es ejecutar un contenedor como servicio systemd, tanto para root como para un usuario normal. El procedimiento base es el mismo: descargar la imagen, crear el contenedor y generar su servicio. Si usamos <code>--new</code> (recomendado), debemos eliminar el contenedor para evitar conflictos.</p>
                <pre><code>podman pull IMAGEN
podman run -d --name mi-web -p 8080:80 ID-IMAGEN
podman ps
podman generate systemd --name NOMBRE --files --new
podman rm -f NOMBRE</code></pre>
                <p>Si trabajamos como root, movemos el fichero <code>.service</code> generado y activamos el servicio:</p>
                <pre><code>mv container-NOMBRE.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now NOMBRE.service
systemctl status NOMBRE.service</code></pre>
                <img class="u-inline-525b23bb9f" src="/images/podman4.png" alt="podman ejemplo" width="1117" height="733">
                <p>Si lo configuramos para un usuario normal, primero habilitamos la persistencia con <code>loginctl enable-linger usuario</code> (como root) y accedemos por SSH. Después, tras seguir los mismos pasos, colocamos el <code>.service</code> en la ruta del usuario y lo activamos con <code>--user</code>. Si la unidad trae <code>WantedBy=multi-user.target</code>, la cambiamos por <code>WantedBy=default.target</code>.</p>
                <pre><code>loginctl enable-linger usuario
ssh usuario@localhost
mkdir -p ~/.config/systemd/user/
mv container-NOMBRE.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now NOMBRE.service</code></pre>
                <img class="u-inline-525b23bb9f" src="/images/podman5.png" alt="podman ejemplo" width="1264" height="771">
                </section>

            <section id="obj2" class="lesson-section">
                <h2>2. Comando find</h2>
                <p>El comando <code>find</code> es esencial para buscar archivos. Los parametros más esenciales : </p>
                <ul>
                    <li><code>-type [f/d/l]</code> → tipo de archivo.</li>
                    <li><code>-name / -iname</code> → búsqueda por nombre.</li>
                    <li><code>-size</code> → filtrar por tamaño.</li>
                    <li><code>-user</code> → propietario.</li>
                    <li><code>-perm</code> → permisos (ej: SUID).</li>
                    <li><code>-mmin</code> → modificación por minutos.</li>
                    <li><code>-mtime</code> → modificación por días.</li>
                    <li><code>-exec COMANDO {} \;</code> → ejecutar acciones.</li>
                </ul>
            </section>

            <section id="obj3" class="lesson-section">
                <h2>3. Resetear contraseña root</h2>
                <p> Recordemos que esto es uno de los puntos esenciales del examen, siendo el primero o de los primeros. Si no sabemos hacer esto, no podremos hacer nada más. </p>
                <pre><code>rd.break
mount -o remount,rw /sysroot
# si falla, buscar la ruta con: find / -name chroot
chroot /sysroot
passwd root
touch /.autorelabel</code></pre>
               <p>Salir con <code>exit</code> dos veces para reiniciar y aplicar cambios.</p>
            </section>

            <section id="obj4" class="lesson-section">
                <h2>4. Usuario SSH para copy-paste rápido</h2>
                <p>En el examen puede ser útil usar un usuario con sudo para trabajar vía SSH y copiar comandos rápidamente.</p>
                <p>Una vez creado el usuario con useradd usuario, tenemos varias opciones :</p>
                <ul>
                    <li>Añadir a wheel: <code>usermod -aG wheel usuario</code></li>
                    <li>Configurar sudoers con <code>visudo</code></li>
                    <li>Crear un archivo en <code>/etc/sudoers.d</code> con el nombre del usuario y el mismo contenido que pondríamos en visudo</li>
                </ul>
                <p>Verificar siempre SSH, firewall, SELinux y servicio activo.</p>
            </section>

            <section id="obj5" class="lesson-section">
                <h2>5. Inside Red Hat y simulacro</h2>
               <p>Es recomendable ver el vídeo oficial <strong>Inside a Red Hat Certification</strong> para entender el entorno real del examen.</p>
                <p>Por otro lado, como simulacro, está disponible el repositorio <strong><a href="https://github.com/AustinNicely/rhcsa-simulator" target="_blank" rel="noopener">AustinNicely/rhcsa-simulator</a></strong>. Aunque está en inglés, es un recurso muy completo para practicar o repasar conceptos.</p>
                <img class="u-inline-525b23bb9f" src="/images/rhcsasimulator.png" alt="rhcsa sim ejemplo" width="669" height="99">
            </section>

        </div>
    </div>
</div>
