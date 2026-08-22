<div class="lesson-wrapper">

    <header class="lesson-header">
        <span class="badge">RHCSA Objetivo</span>
        <h1>Implementar, configurar y mantener sistemas</h1>
        <p>Tareas programadas, servicios, paquetes y arranque</p>

        <a href="https://youtu.be/TRauHLhYB4c" target="_blank" rel="noopener" class="video-card">
            <div class="video-icon">🎬</div>
            <div class="video-text">
                <strong>VER VIDEO YOUTUBE - CLASE 7</strong>
                <span>Automatización, systemd y mantenimiento del sistema</span>
            </div>
        </a>
    </header>

    <div class="lesson-layout">

        <aside class="lesson-toc">
            <h2>Objetivos del bloque</h2>
            <ul>
                <li><a href="#obj1">1. Programar tareas</a></li>
                <li><a href="#obj2">2. Gestionar servicios</a></li>
                <li><a href="#obj3">3. Objetivo de arranque</a></li>
                <li><a href="#obj4">4. Cliente de tiempo</a></li>
                <li><a href="#obj5">5. Gestión de paquetes</a></li>
                <li><a href="#obj6">6. Gestor de arranque</a></li>
            </ul>
        </aside>

        <div class="course-content" style="min-width:0;max-width:100%;overflow-wrap:anywhere">

            <section id="obj1" class="lesson-section">
                <h2>1. Programar tareas con cron y temporizadores systemd</h2>
                 <p>En Linux podemos automatizar tareas para ejecutarlas en momentos concretos usando cron o temporizadores systemd. Aunque existe el comando at, su uso es menor.</p>
                <p>La forma clásica es <strong>cron</strong> mediante <code>crontab -e</code>. Cada línea define cuándo y qué comando ejecutar siguiendo la sintaxis: <strong>min hora día mes día-semana usuario comando</strong>.</p>
                <p>Para programar tareas podemos editar el archivo <code>/etc/crontab</code> (añadiendo el campo de usuario) o usar el comando <code>crontab -e -u USUARIO</code> (sin campo de usuario) donde editaremos directamente el cron de ese user, que se crean en <code>/var/spool/cron</code> :</p>
                <img src="/images/cron.png" alt="cron ejemplo" width="1067" height="618" style="max-width:100%;height:auto">
                <p>Podemos verificar tareas con <code>crontab -l</code> y revisar logs en <code>/var/log/cron</code>. Es importante comprobar que el servicio <code>crond</code> esté activo.</p>
                 <p>Systemd introduce los <strong>timers</strong>, una alternativa más moderna y controlable ubicada normalmente en <code>/etc/systemd/system</code>.</p>
                <img src="/images/systemd-timer.png" alt="systemd timer ejemplo" width="851" height="299" style="max-width:100%;height:auto">
             <p>Tras configurarlos ejecutamos <code>systemctl daemon-reload</code> y comprobamos con <code>systemctl list-timers</code>. En mi ejemplo llamado app.timer buscará un app.service en la misma ruta y será lo que ejecute como lo hayamos programado</p>
                <img src="/images/systemd-timer-status.png" alt="systemd timer ejemplo" width="1141" height="580" style="max-width:100%;height:auto">
                <p> Deberá estar creado el .service con el mismo nombre y activo para poder levantar el .timer</p>
            </section>

            <section id="obj2" class="lesson-section">
                <h2>2. Iniciar, detener y habilitar servicios</h2>
                  <p>Los servicios se gestionan mediante <code>systemctl</code>. Los comandos principales son:</p>
                <ul>
                    <li><strong>systemctl start servicio</strong> → Levanta el servicio</li>
                    <li><strong>systemctl stop servicio</strong> → Detiene el servicio</li>
                    <li><strong>systemctl restart servicio</strong> → Reinicia el servicio</li>
                    <li><strong>systemctl status servicio</strong> → Muestra su estado y unas lineas de log.</li>
                    <li><strong>systemctl enable servicio</strong> → Arranque automáticamente (Con --now habilitamos y levantaremos al mismo tiempo)</li>
                    <li><strong>systemctl disable servicio</strong> → Deshabilita (No arranca al iniciar el sistema)</li>
                </ul>
                <p> Por otro lado, nos podrían pedir crear un servicio. Los servicios del sistema están en <code>/usr/bin/systemd/system</code>, pero donde nosotros lo creariamos sería en <code>/etc/systemd/system</code></p>
                <img src="/images/service-sctl.png" alt="systemctl ejemplo" width="760" height="237" style="max-width:100%;height:auto">
                <p> Tened cuidado con las mayusculas/minusculas como en ExecStart, systemd se pone tonto y tarda un rato para saltar un error haciendonos perder bastante tiempo por una tontería. Nos sale como dead ya que ya se habría ejecutado, de ahí que usemos un .timer</p>
                <img src="/images/service-sctl-status.png" alt="systemctl status" width="886" height="455" style="max-width:100%;height:auto">
            </section>

             <section id="obj3" class="lesson-section">
                <h2>3. Configurar el sistema para iniciar en un objetivo específico</h2>
                <p>Systemd utiliza <strong>targets</strong> para definir cómo arranca el sistema. Recordabamos los más importantes a tener en cuenta : </p>
                <ul>
                    <li><strong>graphical.target</strong> → Modo gráfico</li>
                    <li><strong>multi-user.target</strong> → Modo texto con red</li>
                    <li><strong>rescue.target</strong> → Modo rescate</li>
                    <li><strong>emergency.target</strong> → Modo mínimo</li>
                </ul>
                <p>Podemos cambiar temporalmente usando <code>systemctl isolate TARGET</code> o hacerlo permanente con set-default.</p>
                <img src="/images/set-default-target.png" alt="set-default target" width="962" height="234" style="max-width:100%;height:auto">
                <p> En el video indico que si falla el set-default hagamos un enlace, pero no funciona bien. Es debido a que está mal lanzado. Los pasos correctos y simples serían : </p>
                <img src="/images/default-alt.png" alt="set-default alternative" width="962" height="165" style="max-width:100%;height:auto">
            </section>

            <section id="obj4" class="lesson-section">
                <h2>4. Configurar clientes de servicio de tiempo</h2>
                <p>Red Hat utiliza <strong>chrony</strong> para sincronización horaria. Su configuración se encuentra en <code>/etc/chrony.conf</code>. Su sintaxis es <code>server IP iburst</code></p>
                <img src="/images/chrony.png" alt="chrony ejemplo" width="771" height="208" style="max-width:100%;height:auto">
                <p>Tras configurarlo reiniciamos el servicio y verificamos con <code>chronyc sources -v</code> (Recordamos que si sale * esta OK, si sale ? es que estaría mal). </p>
                <img src="/images/chrony-check.png" alt="chrony ejemplo" width="696" height="738" style="max-width:100%;height:auto">
                <p> Importante que añadais el servicio de ntp al firewall con <code>firewall-cmd --permanent --add-service=ntp</code>.</p>
                <p>También pueden pedir cambios de zona horaria, idioma o teclado.</p>
                <img src="/images/idioma-teclado.png" alt="teclado-idioma-zona" width="804" height="497" style="max-width:100%;height:auto">
                
            </section>

            <section id="obj5" class="lesson-section">
                <h2>Instalar y actualizar paquetes de software</h2>
               <p>Red Hat utiliza <code>dnf</code> como gestor de paquetes. Los repositorios se configuran en <code>/etc/yum.repos.d/</code>.</p>
                <p>Lo que nos piden en este objetivo es basicamente conocer dnf, saber crear un repositorio ( Recordad los repositorios están ubicados en <code>/etc/yum.repos.d/</code>) que pedirán probablemente con URL o con un ISO y CDN que es el metodo oficial de REDHAT. </p>
                <p>Si trabajamos con un ISO debemos montarlo usando <code>-o loop</code> y crear el archivo .repo correspondiente:</p>
                <img src="/images/repo-iso.png" alt="iso repo ejemplo" width="857" height="289" style="max-width:100%;height:auto">
                <p>Tras modificar repositorios ejecutamos <code>dnf clean all</code>, <code>dnf makecache</code> y comprobamos con <code>dnf repolist</code>.</p>
                <p> Por otro lado, y MUY SEGURAMENTE nos lo pidan, acceso a los repos de REDHAT. Si el sistema es mayor a 8.8 usaremos la forma de <code>rhc</code>, si es inferior usaremos <code>subscription-manager</code>.</p>
                <p>Independientemente de la herramienta, gestionamos tres contenidos: <strong>Content</strong> (acceso a repositorios), <strong>Analytics</strong> (vulnerabilidades vía Insights) y <strong>Remote-management</strong> (solo disponible en <code>rhc</code>, permite ejecutar soluciones remotas de forma automatizada).</p>
                <img src="/images/repo-rh.png" alt=" repo Redhat ejemplo rhc" width="856" height="560" style="max-width:100%;height:auto">
                <img src="/images/repo-sm.png" alt="repo subscription manager" width="1031" height="646" style="max-width:100%;height:auto">
                <img src="/images/repo-sm2.png" alt="repo subscription manager 2" width="815" height="408" style="max-width:100%;height:auto">
            </section>

            <section id="obj6" class="lesson-section">
                <h2>6. Modificar el gestor de arranque del sistema</h2>
                 <p>El gestor de arranque es <strong>GRUB2</strong>. Podemos modificarlo editando <code>/etc/default/grub</code> o usando <code>grubby</code>.</p>
                <img src="/images/grubby.png" alt="grub ejemplo" width="1361" height="594" style="max-width:100%;height:auto">
                <p>Si editamos manualmente debemos regenerar la configuración:</p>
                <p>
                    <code>grub2-mkconfig -o /boot/grub2/grub.cfg</code> (BIOS)<br>
                    <code>grub2-mkconfig -o /boot/efi/EFI/redhat/grub.cfg</code> (UEFI)
                </p>
            </section>

        </div>
    </div>
</div>
