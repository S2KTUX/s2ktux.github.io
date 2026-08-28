<div class="lesson-wrapper">

    <header class="lesson-header">
        <span class="badge">RHCSA Objetivo</span>
        <h1>Administrar usuarios y grupos</h1>
        <p>Gestión de cuentas locales, políticas de contraseñas y privilegios sudo</p>

        <a href="https://youtu.be/3N-B_vGKTYQ" target="_blank" rel="noopener" class="video-card">
            <div class="video-icon">🎬</div>
            <div class="video-text">
                <strong>VER VIDEO YOUTUBE - CLASE 9</strong>
                <span>Administración de usuarios, grupos y acceso privilegiado</span>
            </div>
        </a>
    </header>

    <div class="lesson-layout">

        <aside class="lesson-toc">
            <h2>Objetivos del bloque</h2>
            <ul>
                <li><a href="#obj1">1. Cuentas de usuario</a></li>
                <li><a href="#obj2">2. Políticas de contraseña</a></li>
                <li><a href="#obj3">3. Grupos y membresías</a></li>
                <li><a href="#obj4">4. Acceso privilegiado</a></li>
            </ul>
        </aside>

        <div class="course-content u-inline-285c4804ec">

            <section id="obj1" class="lesson-section">
                <h2>1. Crear, eliminar y modificar cuentas de usuario locales</h2>
              <p>La administración de usuarios en RHEL se basa principalmente en los archivos <code>/etc/passwd</code> y <code>/etc/shadow</code>, donde se almacenan los datos de cuenta y contraseñas cifradas.</p>
                <p>Los parametros mas importantes al .crear un usuario son : </p>
                <ul>
                    <li><code>-u UID</code> → Define un identificador de usuario específico.</li>
                    <li><code>-g GRUPO</code> → Asigna el grupo primario existente.</li>
                    <li><code>-G GRUPOS</code> → Añade grupos secundarios.</li>
                    <li><code>-c "TEXTO"</code> → Comentario descriptivo.</li>
                    <li><code>-s SHELL</code> → Shell asignada (bash, zsh, nologin...).</li>
                    <li><code>-d RUTA</code> → Directorio home personalizado.</li>
                    <li><code>-m</code> → Crea automáticamente el home.</li>
                </ul>
                <p>Tras crear la cuenta usamos <code>passwd</code> para asignar o modificar la contraseña.</p>
                <img class="u-inline-525b23bb9f" src="/images/user-admin.png" alt="Ejemplo de gestión de usuarios" width="678" height="267">
                <p>Por otro lado, tenemos otros parametros para modificar cuentas de usuario : </p>
                <ul>
                    <li><code>-aG GRUPO</code> → Añade grupos secundarios sin eliminar los existentes. ¡¡MUY IMPORTANTE!!</li>
                    <li><code>-L</code> → Bloquea la cuenta.</li>
                    <li><code>-U</code> → Desbloquea la cuenta.</li>
                    <li><code>-l NUEVO_LOGIN</code> → Cambia el nombre de usuario.</li>
                    <li><code>-s NUEVA_SHELL</code> → Modifica la shell.</li>
                    <li><code>-u NUEVO_UID</code> → Cambia el UID.</li>
                </ul>
                <img class="u-inline-525b23bb9f" src="/images/user-admin2.png" alt="Ejemplo de gestión de usuarios 2" width="617" height="503">
                <p>Para eliminar usuarios usamos opciones como <code>-r</code> (borra home y correo) o <code>-f</code> para forzar la eliminación.</p>
                
            </section>

            <section id="obj2" class="lesson-section">
                <h2>2. Cambiar contraseñas y configurar el envejecimiento</h2>
               <p>El comando <code>passwd</code> permite cambiar contraseñas y gestionar diferentes opciones relacionadas con autenticación (-h).</p>
                <img class="u-inline-525b23bb9f" src="/images/passwd.png" alt="Uso de passwd" width="603" height="431">
                <p>Para aplicar políticas de seguridad usamos <code>chage</code>, que permite controlar expiración, aviso previo y tiempo mínimo entre cambios.</p>
                <p>Lo mejor para entender este comando es con esta imagen.:</p>
                <img class="u-inline-525b23bb9f" src="/images/chage.png" alt="Chage exp imagen" width="1024" height="393">
                <img class="u-inline-525b23bb9f" src="/images/chage-comm.png" alt="Uso de chage para envejecimiento" width="851" height="758">
                <img class="u-inline-525b23bb9f" src="/images/chage-ex.png" alt="Ejemplo chage" width="1016" height="313">
                <p>Los valores por defecto de políticas de contraseña se definen en <code>/etc/login.defs</code>.</p>
            </section>

            <section id="obj3" class="lesson-section">
                <h2>3. Crear, eliminar y modificar grupos locales</h2>
                <p>Los grupos permiten gestionar permisos para múltiples usuarios. Cada usuario tiene un grupo primario y puede pertenecer a varios grupos secundarios.</p>
                <p>Comandos principales:</p>
                <ul>
                    <li><code>groupadd</code> → Crear grupos.</li>
                    <li><code>groupmod</code> → Modificar grupos.</li>
                    <li><code>groupdel</code> → Eliminar grupos.</li>
                </ul>
                <img class="u-inline-525b23bb9f" src="/images/group-admin.png" alt="Gestión de grupos y membresías" width="538" height="303">
                <p>Podemos verificar membresías con <code>id</code>, <code>groups</code>, <code>getent group</code> o revisando <code>/etc/group</code>.</p>
                <img class="u-inline-525b23bb9f" src="/images/group-check.png" alt="Check de grupos" width="903" height="409">
                <p> Por ultimo, podemos asignarle una contraseña a un grupo con el comando <code>gpasswd GRUPO</code>, y con este comando añadir usuarios a ese grupo <code>gpasswd -a USER grupo</code>, borrarlo con <code>-d</code>, eliminar la contraseña con <code>-r</code>...</p>
                <img class="u-inline-525b23bb9f" src="/images/gpasswd.png" alt="Gestión de la pertenencia a grupos con gpasswd" width="564" height="394">
            </section>

            <section id="obj4" class="lesson-section">
                <h2>4. Configurar el acceso privilegiado</h2>
                <p>En lugar de compartir la contraseña de root, utilizamos <code>sudo</code> para delegar privilegios de forma controlada mediante <code>/etc/sudoers</code> y <code>/etc/sudoers.d/</code>.</p>
                <p>Para editar estos archivos de forma segura, usamos <code>visudo</code>, que verifica la sintaxis antes de guardar para evitar que perdamos el acceso al sistema. Podemos editar tanto el archivo principal como crear uno exclusivo, que lo editariamos con <code>visudo -f /etc/sudoers.d/ARCHIVO</code></p>
                <p>La sintaxis de sudoers es USUARIO/GRUPO MAQUINA=(USUARIO_A_SUPLANTAR) COMANDOS (los grupos van entre %). Tened en cuenta que si nos pidieran ejecutar algo sin interactividad o para ser usado en scripts se refieren al uso de <strong>NOPASSWD: X</strong>, siempre con un espacio entre : y los comandos</p>
                <img class="u-inline-525b23bb9f" src="/images/sudoers.png" alt="Configuración de sudoers" width="1047" height="178">
                 <p>Otra forma habitual es añadir usuarios al grupo <code>wheel</code>.</p>
                <img class="u-inline-525b23bb9f" src="/images/wheel.png" alt="grupo wheel privilegios" width="577" height="320">
                <p><code>sudo -i</code> carga el entorno completo de root, mientras que <code>sudo -s</code> abre una shell de root manteniendo el entorno del usuario.</p>
                
            </section>

        </div>
    </div>
</div>
