<div class="lesson-wrapper">
    <header class="lesson-header">
        <span class="badge">LPIC-1 Examen 108</span>
        <h1>Servicios esenciales del sistema</h1>
        <p>Domina la gestión de la hora del sistema, los registros, el correo electrónico y la impresión en Linux.</p>
    </header>

    <div class="lesson-layout">
        <aside class="lesson-toc">
            <h2>Objetivos del bloque</h2>
            <ul>
                <li><a href="#108.1">108.1 Mantener la hora del sistema</a></li>
                <li><a href="#108.2">108.2 Registros del sistema</a></li>
                <li><a href="#108.3">108.3 Conceptos básicos del Agente de Transferencia de Correo</a></li>
                <li><a href="#108.4">108.4 Gestión de la impresión</a></li>
            </ul>
        </aside>

        <div class="course-content" style="min-width:0;max-width:100%;overflow-wrap:anywhere">
            
            <section id="108.1" class="lesson-section">
                <h2>108.1 Mantener la hora del sistema</h2>
                <p>El comando <code>date</code> muestra la hora y fecha actual del sistema y permite ajustarla manualmente. <code>timedatectl</code> ofrece una alternativa para verificar y configurar la hora.</p>

                <h3>Reloj de hardware</h3>
                <p>El comando <code>hwclock</code> interactúa con el reloj en tiempo real (RTC) del hardware, manteniendo la hora incluso si el sistema está apagado.</p>
                <p><strong>Ejemplos <code>timedatectl</code>:</strong></p>
                <ul>
                    <li>Listar zonas: <code>timedatectl list-timezones</code></li>
                    <li>Ajustar hora: <code>timedatectl set-time "2025-05-24 12:30:00"</code></li>
                </ul>

                <h3>Zona horaria</h3>
                <p>La zona horaria define el desfase respecto a UTC. Los datos están en <code>/usr/share/zoneinfo/</code> (ej. <code>Canada/Eastern</code>). <code>/etc/localtime</code> suele ser un enlace simbólico a uno de estos archivos.</p>
                <p><strong>Configuración manual:</strong> <code>sudo ln -sf /usr/share/zoneinfo/Canada/Eastern /etc/localtime</code>.</p>
                <p>Una zona correcta es clave para convertir marcas de tiempo Unix a hora local.</p>

                <h3>Demonio NTP</h3>
                <p>El protocolo NTP sincroniza la hora con servidores de red. <code>ntpd</code> se ejecuta en segundo plano. Su configuración es <code>/etc/ntp.conf</code>.</p>
                <p><code>ntpd</code> sondea múltiples servidores y selecciona los más precisos para ajustar la hora.</p>

                <h3>Chrony</h3>
                <p>Alternativa moderna a <code>ntpd</code>, con mejor precisión y soporte para sincronización intermitente. Configuración en <code>/etc/chrony.conf</code>.</p>
                <p>Fuentes remotas: <code>pool</code> y <code>server</code>.</p>
                <pre><code>pool pool.ntp.org iburst</code></pre>
                <p>La opción <code>iburst</code> acelera la sincronización inicial.</p>
            </section>

            <section id="108.2" class="lesson-section">
                <h2>108.2 Registros del sistema</h2>
                <p>Los registros almacenan eventos en orden cronológico. rsyslog y systemd-journald son los principales servicios. Facilidades: mail, local5, etc.</p>

                <h3>Gestión con rsyslog</h3>
                <p>rsyslog usa modelo cliente-servidor. Configuración en <code>/etc/rsyslog.conf</code>. Registros en <code>/var/log/</code>.</p>
                <ul>
                    <li><strong><code>/etc/rsyslog.conf</code>:</strong> Define reglas (<code>&lt;facilidad&gt;.&lt;prioridad&gt; &lt;acción&gt;</code>).</li>
                    <li><strong>Directorios <code>/var/log/</code>:</strong>
                        <ul>
                            <li><code>syslog</code>: Mensajes generales.</li>
                            <li><code>auth.log</code>: Autenticación.</li>
                            <li><code>kern.log</code>: Kernel.</li>
                            <li><code>messages</code>: Diversos (destino por defecto).</li>
                        </ul>
                    </li>
                    <li><strong><code>logger</code>:</strong> Añade mensajes manualmente (ej. <code>logger "Mensaje de prueba"</code>).</li>
                </ul>

                <h3>Rotación con logrotate</h3>
                <p>Evita que los registros ocupen demasiado espacio. <code>logrotate</code> se ejecuta vía <code>/etc/cron.daily/logrotate</code>.</p>
                <ul>
                    <li><strong>Configuración:</strong> <code>/etc/logrotate.conf</code> (global) y <code>/etc/logrotate.d/</code> (específica).</li>
                    <li>Opciones comunes: <code>weekly</code>, <code>rotate 4</code>, <code>compress</code>.</li>
                </ul>

                <h3>Gestión con systemd-journald</h3>
                <p>Centraliza registros en formato binario. Almacenamiento en <code>/run/log/journal/</code> (volátil) o <code>/var/log/journal/</code> (persistente).</p>
                <ul>
                    <li><strong><code>journalctl</code>:</strong> Consulta el journal (filtros: <code>--since</code>, <code>-u</code>, <code>-b</code>).</li>
                    <li><strong><code>systemd-cat</code>:</strong> Envía mensajes al journal (ej. <code>echo "Mensaje" | systemd-cat</code>).</li>
                    <li><strong><code>/etc/systemd/journald.conf</code>:</strong> Configura ubicación (<code>Storage=</code>) y límites.</li>
                </ul>
            </section>

            <section id="108.3" class="lesson-section">
                <h2>108.3 Conceptos básicos del Agente de Transferencia de Correo</h2>
                <p>Un MTA envía y recibe correos en Linux, guardándolos en bandejas privadas (ej. <code>/var/spool/mail/usuario</code>). Usa SMTP (puerto TCP 25).</p>

                <h3>MTAs en Linux: sendmail, postfix, exim</h3>
                <ul>
                    <li><strong>sendmail:</strong> Tradicional, flexible pero complejo. Por defecto solo local. Para aceptar remotas, editar <code>/etc/mail/sendmail.mc</code> en <code>DAEMON_OPTIONS</code> y reiniciar servicio.</li>
                    <li><strong>postfix:</strong> Moderno, sencillo de configurar. Cola en <code>/var/spool/postfix/</code>.</li>
                    <li><strong>exim:</strong> Popular en Debian, flexible.</li>
                </ul>
                <p>Los MTAs modernos son compatibles con comandos de sendmail.</p>

                <h3>Herramientas y comandos del MTA</h3>
                <ul>
                    <li><strong>sendmail emulation:</strong> <code>sendmail -bp</code> (lista cola), <code>sendmail -q</code> (reintenta).</li>
                    <li><strong><code>mailq</code>:</strong> Muestra cola pendiente y motivo de retraso (ej. "Connection refused").</li>
                    <li><strong><code>mail</code>:</strong> Cliente consola. Modos lectura (<code>mail</code>) y envío (<code>mail -s "Asunto" user &lt;&lt;&lt; "Msg"</code>).</li>
                    <li><strong><code>newaliases</code>:</strong> Actualiza base de datos de alias tras modificar <code>/etc/aliases</code>.</li>
                </ul>

                <h3>Personalización de la entrega</h3>
                <ul>
                    <li><strong><code>~/.forward</code>:</strong> Archivo en el directorio personal para reenviar correos. No necesita <code>newaliases</code> y debe ser escribible solo por el propietario.</li>
                    <li><strong><code>/etc/aliases</code>:</strong> Alias del sistema (ej. <code>postmaster: carol</code>). Requiere <code>newaliases</code>.</li>
                </ul>
            </section>

            <section id="108.4" class="lesson-section">
                <h2>108.4 Gestión de la impresión y las impresoras</h2>
                <p>A pesar del "papelless office", la impresión es clave. CUPS facilita esto enviando archivos a una cola, procesándolos con filtros.</p>

                <h3>Servicio CUPS y su configuración</h3>
                <p>Instalación: <code>sudo apt install cups</code> (Debian) o <code>sudo dnf install cups</code> (Fedora), luego <code>sudo systemctl start cups.service</code>.</p>
                <p>Configuración en <code>/etc/cups/</code>:</p>
                <ul>
                    <li><strong><code>cupsd.conf</code>:</strong> Configura servicio, acceso web (<code>WebInterface Yes</code>).</li>
                    <li><strong><code>printers.conf</code>:</strong> Configuración de impresoras (no editar estando activo).</li>
                    <li><strong><code>printcap</code>:</strong> Archivo legacy LPD, enlace a <code>/run/cups/printcap</code>.</li>
                    <li><strong><code>ppd/</code>:</strong> Archivos de descripción de impresora.</li>
                </ul>
                <p>Logs en <code>/var/log/cups/</code>. Interfaz web en <code>http://localhost:631</code>.</p>

                <h3>Herramientas legacy de lpd</h3>
                <ul>
                    <li><strong><code>lpr</code>:</strong> Envía a impresora por defecto.</li>
                    <li><strong><code>lprm</code>:</strong> Cancela trabajos (ej. <code>lprm 20</code>).</li>
                    <li><strong><code>lpq</code>:</strong> Muestra cola y estados (ej. <code>lpq -a</code> todas las colas).</li>
                    <li><strong><code>lpstat</code>:</strong> Estado de impresoras (ej. <code>lpstat -p</code> disponibles).</li>
                </ul>
            </section>

        </div>
    </div>
</div>
