<div class="lesson-wrapper">
    <header class="lesson-header">
        <span class="badge">RHCSA Objetivo 2</span>
        <h1>Administración del Software</h1>
        <p>Gestión de paquetes y repositorios en sistemas Linux (RPM y Flatpak)</p>
        
        <a href="https://youtu.be/GM_9D8zNOag" target="_blank" rel="noopener" class="video-card">
            <div class="video-icon">🎬</div>
            <div class="video-text">
                <strong>VER VIDEO YOUTUBE - CLASE 2</strong>
                <span>Gestión de software y repositorios paso a paso</span>
            </div>
        </a>
    </header>

    <div class="lesson-layout">
        <aside class="lesson-toc">
            <h2>Objetivos del bloque</h2>
            <ul>
                <li><a href="#obj1">1. Repositorios RPM</a></li>
                <li><a href="#obj2">2. Gestión de paquetes RPM</a></li>
                <li><a href="#obj3">3. Repositorios Flatpak</a></li>
                <li><a href="#obj4">4. Gestión de paquetes Flatpak</a></li>
            </ul>
        </aside>

        <div class="course-content" style="min-width:0;max-width:100%;overflow-wrap:anywhere">
            
            <div class="lesson-alert" style="background: rgba(255,165,0,0.1); border-left: 4px solid #ffa500; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <strong>⚠️ ATENCIÓN:</strong> Los puntos 3 y 4 solo aplican a <strong>RHCSA v10</strong>. En  <strong>RHCSA v9</strong> no forman parte del examen.
            </div>

            <section id="obj1" class="lesson-section">
                <h2>1. Configurar el acceso a los repositorios de RPM</h2>
                <p>Los repositorios son fuentes de software que se definen mediante archivos <code>.repo</code> en <code>/etc/yum.repos.d/</code>. Son esenciales para que <strong>dnf</strong> pueda resolver dependencias automáticamente.</p>
                
                <img src="/images/repo-rpm.png" alt="Estructura de un archivo .repo" width="748" height="165" style="max-width:100%;height:auto">
                <p>Donde cada campo significa:</p>
                <ul>
                    <li><strong>[id-del-repo]</strong> → Identificador del repositorio.</li>
                    <li><strong>name</strong> → Nombre descriptivo.</li>
                    <li><strong>baseurl</strong> → Enlace directo al servidor donde se encuentran los paquetes RPM (Si es local: baseurl=file:///RUTA-MONTAJE).</li>
                    <li><strong>enabled</strong> → Define si el repositorio está activo (1) o ignorado (0).</li>
                    <li><strong>gpgcheck</strong> → Indica si el sistema debe validar la firma de seguridad de los paquetes (1) o no (0).</li>
                    <li><strong>gpgkey</strong> → URL de la clave pública del proveedor para verificar la autenticidad del software.</li>
                </ul>
                <p>Comandos de mantenimiento tras añadir un repo:</p>
                <ul>
                    <li><code>dnf clean all</code> → Limpia la caché.</li>
                    <li><code>dnf makecache</code> → Regenera la caché.</li>
                    <li><code>dnf repolist</code> → Comprueba los repositorios activos.</li>
                </ul>
                <img src="/images/recargar-repo-rpm.png" alt="Refrescar repositorios" width="1269" height="374" style="max-width:100%;height:auto">
                <p>Por último, podríamos gestionar repositorios a través de comandos:</p>
                <ul>
                    <li><strong>dnf config-manager --add-repo=URL</strong> → Añade un nuevo repositorio desde una URL.</li>
                    <li><strong>dnf config-manager --set-enabled [id-del-repo]</strong> → Habilita un repositorio.</li>
                    <li><strong>dnf config-manager --set-disabled [id-del-repo]</strong> → Deshabilita un repositorio.</li>
                    <li><strong>sudo rm /etc/yum.repos.d/[nombre-archivo].repo</strong> → Elimina el repositorio borrando su archivo.</li>
                </ul>
            </section>

            <section id="obj2" class="lesson-section">
                <h2>2. Instalar y eliminar paquetes de software RPM</h2>
                <p>Los gestores de paquetes principales en sistemas modernos son <strong>RPM y DNF</strong>. RPM permite gestionar paquetes pero no resuelve dependencias automáticamente, mientras que DNF sí lo hace. Yum está obsoleto.</p>
                <p>Comandos más utilizados de <strong>RPM</strong>:</p>
                <ul>
                    <li><strong>rpm -ivh paquete.rpm</strong> → Instalar un paquete RPM localmente.</li>
                    <li><strong>rpm -Uvh paquete.rpm</strong> → Actualiza (o instala) un paquete rpm.</li>
                    <li><strong>rpm -e nombre_paquete</strong> → Eliminar un paquete instalado.</li>
                    <li><strong>rpm -V nombre_paquete</strong> → Verificar la integridad de los archivos.</li>
                    <li><strong>rpm -qa</strong> → Listar todos los paquetes instalados.</li>
                    <li><strong>rpm -qf</strong> → Consulta a qué paquete pertenece un archivo del sistema..</li>
                    <li><strong>rpm -qi nombre_paquete</strong> → Mostrar información detallada de un paquete instalado.</li>
                    <li><strong>rpm -ql paquete</strong> → Lista los archivos que existen en un paquete.</li>
                </ul>

                <p>Comandos más utilizados de <strong>DNF</strong>:</p>
                <ul>
                    <li><strong>dnf install paquete</strong> → Instalar un paquete.</li>
                    <li><strong>dnf download paquete</strong> → Descargar un paquete .rpm.</li>
                    <li><strong>dnf remove paquete</strong> → Eliminar un paquete.</li>
                    <li><strong>dnf upgrade paquete</strong> → Actualizar el paquete.</li>
                    <li><strong>dnf search paquete</strong> → Buscar paquetes.</li>
                    <li><strong>dnf list (installed)</strong> → Lista todos los paquetes (instalados).</li>
                    <li><strong>dnf repoquery paquete</strong> → Busca los paquetes disponibles.</li>
                    <li><strong>dnf info paquete</strong> → Información de un paquete (similar a qi).</li>
                    <li><strong>dnf provides</strong> → Indica qué paquete pertenece a un comando o archivo (similar a qf).</li>
                </ul>
                <p>Dentro de dnf podemos ver su historial con <code>dnf history</code> y deshacer acciones con <code>dnf history undo Nº</code>.</p>
                <img src="/images/history-rpm.png" alt="Historial DNF" width="754" height="147" style="max-width:100%;height:auto">
                <p>Para extraer archivos concretos de un paquete RPM usamos <code>rpm2cpio</code> junto con <code>cpio -idv</code>:</p>
                <img src="/images/recuperar-archivo-rpm.png" alt="Uso de rpm2cpio" width="1245" height="373" style="max-width:100%;height:auto">
            </section>

            <section id="obj3" class="lesson-section">
                <h2>3. Configurar el acceso a los repositorios de Flatpak</h2>
                <p>Flatpak es un sistema de distribución de aplicaciones aisladas mediante contenedores de usuario. Los repositorios pueden añadirse mediante:</p>
                <ul>
                    <li><strong>flatpak remote-add --if-not-exists flathub URL</strong> → Añadir repositorios</li>
                    <li><strong>flatpak remotes</strong> → Listar repositorios configurados</li>
                    <li><strong>flatpak remote-delete</strong> → Eliminar repositorios</li>
                </ul>
                <p>Esto se crea para el usuario actual; para todos los usuarios añadiremos <code>--system</code>.</p>
                <p> En el examen RHCSA nos podrían pedir añadir un repositorio oficial de RED HAT :</p>
                <img src="/images/flatpak-redhat.png" alt="Configurar repo oficial Red Hat" width="864" height="237" style="max-width:100%;height:auto">
                <p>Si <code>--auth-file</code> falla, usamos la configuración manual: <code>cp $XDG_RUNTIME_DIR/containers/auth.json /etc/flatpak/oci-auth.json</code> y <code>chmod 644 /etc/flatpak/oci-auth.json</code>.</p>
            </section>

            <section id="obj4" class="lesson-section">
                <h2>4. Instalar y eliminar paquetes de software Flatpak</h2>
                <p>Una vez configurado un repositorio Flatpak, podemos gestionar aplicaciones de forma sencilla y segura. Las aplicaciones Flatpak usan nombres de dominio invertidos (ej: <code>org.mozilla.firefox</code>) para su gestión.</p>

                <ul>
                    <li><strong>flatpak install app</strong> → Instalar una aplicación</li>
                    <li><strong>flatpak update app</strong> → Actualizar una aplicación</li>
                    <li><strong>flatpak info app</strong> → Información de una aplicación</li>
                    <li><strong>flatpak list</strong> → Listar aplicaciones instaladas</li>
                    <li><strong>flatpak run app</strong> →  Lanzar una aplicación</li>
                    <li><strong>flatpak ps app</strong> → Ver las aplicaciones que están corriendo</li>
                    <li><strong>flatpak uninstall app</strong> → Eliminar una aplicación</li>
                    <li><strong>flatpak search app</strong> → Buscar una aplicación</li>
                </ul>
                <img src="/images/flatpak-install.png" alt="Instalación Flatpak" width="1273" height="789" style="max-width:100%;height:auto">
            </section>

        </div>
    </div>
</div>
