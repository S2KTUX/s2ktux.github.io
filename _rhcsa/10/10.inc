<div class="lesson-wrapper">

    <header class="lesson-header">
        <span class="badge">RHCSA Objetivo</span>
        <h1>Administrar la seguridad</h1>
        <p>Firewall, permisos, autenticación SSH y hardening con SELinux</p>

        <a href="https://youtu.be/mDqQq9ZGehA" target="_blank" rel="noopener" class="video-card">
            <div class="video-icon">🎬</div>
            <div class="video-text">
                <strong>VER VIDEO YOUTUBE - CLASE 10</strong>
                <span>Firewall, SSH y seguridad avanzada con SELinux</span>
            </div>
        </a>
    </header>

    <div class="lesson-layout">

        <aside class="lesson-toc">
            <h2>Objetivos del bloque</h2>
            <ul>
                <li><a href="#obj1">1. Firewall</a></li>
                <li><a href="#obj2">2. Permisos (umask)</a></li>
                <li><a href="#obj3">3. Claves SSH</a></li>
                <li><a href="#obj4">4. Modos SELinux</a></li>
                <li><a href="#obj5">5. Contextos SELinux</a></li>
                <li><a href="#obj6">6. Restaurar contextos</a></li>
                <li><a href="#obj7">7. Puertos SELinux</a></li>
                <li><a href="#obj8">8. Booleanos SELinux</a></li>
            </ul>
        </aside>

        <div class="course-content u-inline-285c4804ec">

            <section id="obj1" class="lesson-section">
                <h2>1. Configurar el firewall con firewalld</h2>
                <p>Como ya sabemos, firewalld permite gestionar reglas dinámicas mediante zonas, servicios y reglas avanzadas almacenadas en <code>/etc/firewalld/zones/</code>.</p>
                <p>Podemos crear aplicaciones personalizadas copiando servicios desde <code>/usr/lib/firewalld/services/</code> hacia <code>/etc/firewalld/services/</code> y aplicando contextos SELinux con <code>restorecon</code>.</p> 
                <img class="u-inline-525b23bb9f" src="/images/firewall-app.png" alt="app perso de firewall" width="1289" height="587">
                <p>Las <strong>rich rules</strong> permiten crear reglas específicas por IP, puerto o servicio.</p>
                <img class="u-inline-525b23bb9f" src="/images/firewall-rich.png" alt="richrules de firewall" width="1312" height="741">
                <p>NAT permite enrutar tráfico mediante:</p>
                <ul>
                    <li><strong>Masquerade</strong> → acceso a internet desde redes internas.</li>
                    <li><strong>Port Forwarding</strong> → redirección de puertos.</li>
                    <li><strong>Rich Rule NAT</strong> → redirección específica por IP/red.</li>
                </ul>
                <img class="u-inline-525b23bb9f" src="/images/firewall-nat.png" alt="nat de firewall" width="1218" height="530">
                <p>Las <code>ipset</code> permiten manejar listas grandes de IPs de forma eficiente.</p>
                <img class="u-inline-525b23bb9f" src="/images/firewall-ipset.png" alt="ipset de firewall" width="1091" height="561">
            </section>

            <section id="obj2" class="lesson-section">
                <h2>2. Administrar permisos predeterminados (umask)</h2>
                <p><code>umask</code> define los permisos que se eliminan al crear archivos o directorios.</p>
                <p>El valor máximo es 666 para archivos y 777 para directorios (ya que x no se aplica por seguridad).Es decir, la regla o la suma es  Permisos totales - UMASK = Permisos reales. Si el umask es 022, el archivo se crea con 644 (666-022) y el directorio con 755 (777-022).</p>
                <p>Puede aplicarse temporalmente con <code>umask</code> o permanentemente en <code>/etc/profile</code> para global o <code>~/.bashrc</code> para un usuario en especifico.</p>
            </section>
            <section id="obj3" class="lesson-section">
                <h2>3. Autenticación SSH mediante claves</h2>
                <p>Permite acceso seguro sin contraseña usando criptografía pública/privada. La clave pública se copia al servidor y la privada nunca se comparte.</p>
                <p>Lo que tenemos que tener más claro es que la clave publica es la que compartiremos con el servidor pero la privada NUNCA la compartiremos. Practicad el hecho de que <code>ssh-copy-id</code> podría fallar, el examen está hecho para ponernos trampas en todo momento</p>
                <img class="u-inline-525b23bb9f" src="/images/ssh-key.png" alt="Autenticación SSH" width="957" height="578">
                <p>Debemos verificar en <code>/etc/ssh/sshd_config</code> que estén activadas las opciones:</p>
                <ul>
                    <li><code>PubkeyAuthentication yes</code></li>
                    <li><code>AuthorizedKeysFile .ssh/authorized_keys</code></li>
                </ul>

                <p>Tras cambios reiniciamos el servicio con <code>systemctl restart sshd</code>.</p>
            </section>

            <section id="obj4" class="lesson-section">
                <h2>4. Modos de SELinux</h2>
                <p>SELinux puede funcionar en tres estados:</p>
                <ul>
                    <li><strong>Enforcing</strong> → bloquea accesos no permitidos.</li>
                    <li><strong>Permissive</strong> → solo registra eventos.</li>
                    <li><strong>Disabled</strong> → desactivado.</li>
                </ul>
                <p>Se consulta con <code>getenforce</code> y se cambia temporalmente con <code>setenforce</code>. Para hacerlo permanente se modifica <code>/etc/selinux/config</code>.</p>
                <img class="u-inline-525b23bb9f" src="/images/selinux-modes.png" alt="Modos SELinux" width="573" height="449">
            </section>

            <section id="obj5" class="lesson-section">
                <h2>5. Contextos SELinux</h2>
               <p>SELinux etiqueta recursos con un contexto (usuario:rol:tipo:nivel). El campo más importante es el <strong>tipo</strong>.</p>
                <ul>
                    <li><code>ls -Z</code> → contexto de archivos.</li>
                    <li><code>ps -eZ</code> → contexto de procesos.</li>
                </ul>
                <p>No hay que memorizarlos los contextos.<code>semanage fcontext -l | grep servicio</code> lista las etiquetas recomendadas, <code>matchpathcon /ruta/archivo</code> indica la que debería tener y <code>ls -Z</code> la que tiene realmente.</p>
                <img class="u-inline-525b23bb9f" src="/images/selinux-context.png" alt="Contextos SELinux" width="1322" height="413">
                <p>Para investigar fallos de SELinux, usa <code>ausearch</code> (rastreador) y <code>audit2why</code> (traductor). Lo más común es combinarlos con <code>ausearch -m avc -ts recent | audit2why</code>, ya que la mayoría de bloqueos se registran bajo el tipo avc.</p>
                <img class="u-inline-525b23bb9f" src="/images/selinux-audit.png" alt="AUSEARCH -AUDIT- SELinux" width="1282" height="540">
            </section>

            <section id="obj6" class="lesson-section">
                <h2>6. Restaurar contextos predeterminados</h2>
                <p><code>restorecon</code> restaura etiquetas correctas cuando archivos se mueven o cambian manualmente.</p>
                <p>El ejemplo más sencillo es el servicio httpd. Este servicio se encuentra en <code>/var/www/html/</code> y necesita un contexto para funcionar. Si importamos un archivo desde otra ubicación y no nos aseguramos de que tenga un contexto correcto, no funcionará. Tal y como hemos visto en la imagen de <code>ausearch -m avc -ts recent | audit2why</code></p>
                <img class="u-inline-525b23bb9f" src="/images/restorecon.png" alt="Uso de restorecon" width="1057" height="515">
                <p>Para nuevas rutas usamos <code>semanage fcontext -a</code> y aplicamos cambios con <code>restorecon -Rv</code>.</p>
                <img class="u-inline-525b23bb9f" src="/images/restorecon-add.png" alt="Uso de restorecon" width="931" height="469">
                <p> De la misma manera que agregamos con <code>-a</code>, podemos eliminar una regla que hayamos creado exactamente igual pero con <code>-d</code> o modificarla con <code>-m</code>. Recordad lanzar siempre el comando <code>restorecon -Rv</code> para aplicar esos cambios. En el video menciono <code>chcon</code> pero este haría un cambio temporal y se perdería al reiniciar, por lo que mejor usar semanage fcontext. </p>
                
            </section>

            <section id="obj7" class="lesson-section">
                <h2>7. Administrar etiquetas de puerto SELinux</h2>
                <p>Si un servicio (ej. Apache) debe escuchar en un puerto no estándar, debemos etiquetar ese puerto en SELinux. Podemos comprobar el contexto de los puertos de la misma manera que la de los servicios : <code>semanage port -l | grep servicio</code>.</p>
                <img class="u-inline-525b23bb9f" src="/images/semanage-ports.png" alt="Puertos SELinux" width="691" height="207">
                <p>Si un servicio necesita usar un puerto diferente, debemos añadirlo con <code>semanage port -a X -p tcp PUERTO</code>. Por ejemplo, permitir que <strong>httpd</strong> use el puerto 8080:</p>
                <img class="u-inline-525b23bb9f" src="/images/semanage-ports2.png" alt="Puertos SELinux change" width="736" height="389">
                <p>Si el puerto ya existe y queremos modificarlo usamos <code>-m</code>, y para eliminarlo usamos <code>-d</code>.</p>
            </section>
             <section id="obj8" class="lesson-section">
                <h2>8. Booleanos SELinux</h2>
                <p>Los booleanos son interruptores (on/off) que permiten cambiar reglas de SELinux en tiempo real sin modificar la política completa. Tenemos que tener en cuenta que si un servicio funciona pero SELinux lo bloquea lo primero que revisaremos será los booleanos</p>
                <p> Con el comando <code>getsebool -a</code> podemos listar todos los booleanos disponibles y podemos filtrar con grep servicio. Tambien podemos filtrar con <code>semanage boolean -l | grep X</code>. </p>
                <img class="u-inline-525b23bb9f" src="/images/selinux-booleans.png" alt="Booleanos SELinux" width="876" height="533">
                <p>Se listan con <code>getsebool -a</code> y se modifican con <code>setsebool</code>. Para hacerlo persistente usamos <code>-P</code>.</p>
                <img class="u-inline-525b23bb9f" src="/images/selinux-booleans2.png" alt="Booleanos SELinux" width="859" height="607">
                <p>No es necesario memorizar booleanos concretos, sino saber identificarlos con <code>getsebool</code> o <code>getsebool -a</code> y activarlos correctamente usando <code>setsebool</code> o <code>setsebool -P</code> cuando SELinux bloquea un servicio.</p>
                <p>Ejemplos comunes:</p>
                <ul>
                    <li><code>httpd_can_network_connect</code></li>
                    <li><code>httpd_enable_homedirs</code></li>
                    <li><code>ftp_home_dir</code></li>
                    <li><code>ssh_sysadm_login</code></li>
                    <li><code>container_manage_cgroup</code></li>
                </ul>       
            </section>

        </div>
    </div>
</div>
