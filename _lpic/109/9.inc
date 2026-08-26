<div class="lesson-wrapper">
    <header class="lesson-header">
        <span class="badge">LPIC-1 Examen 109</span>
        <h1>Fundamentos de redes</h1>
        <p>Domina los conceptos básicos de redes, configuración, DNS y resolución de problemas en Linux.</p>
    </header>

    <div class="lesson-layout">
        <aside class="lesson-toc">
            <h2>Objetivos del bloque</h2>
            <ul>
                <li><a href="#109.1">109.1 Fundamentos de los protocolos de Internet</a></li>
                <li><a href="#109.2">109.2 Configuración de red persistente</a></li>
                <li><a href="#109.3">109.3 Resolución de problemas básicos de red</a></li>
                <li><a href="#109.4">109.4 Configuración DNS en el lado del cliente</a></li>
            </ul>
        </aside>

        <div class="course-content" style="min-width:0;max-width:100%;overflow-wrap:anywhere">
            
            <section id="109.1" class="lesson-section">
                <h2>109.1 Fundamentos de los protocolos de Internet</h2>
                <p>TCP/IP es una pila de protocolos que permite la comunicación entre dispositivos mediante protocolos como IP, TCP, UDP, DNS y SMTP.</p>

                <h3>IPv4: Direccionamiento y máscaras</h3>
                <p>IPv4 es el protocolo de direccionamiento lógico que asigna direcciones únicas (32 bits) para enviar paquetes entre hosts.</p>
                <ul>
                    <li><strong>Estructura:</strong> 32 bits divididos en 4 octetos (ej. 192.168.10.20). En binario: <code>11000000.10101000.00001010.00010100</code>.</li>
                    <li><strong>Clases de direcciones:</strong>
                        <ul>
                            <li><strong>Clase A:</strong> 1-126 (Redes grandes).</li>
                            <li><strong>Clase B:</strong> 128-191 (Redes medianas).</li>
                            <li><strong>Clase C:</strong> 192-223 (Redes pequeñas).</li>
                        </ul>
                    </li>
                    <li><strong>Máscara de red:</strong> Define qué parte es red y qué parte es host (ej. <code>255.255.0.0</code> <code>/24</code>).</li>
                    <li><strong>Reservados (privados):</strong> No enrutables en internet.
                        <ul>
                            <li>10.0.0.0/8: Redes grandes (10.0.0.0 a 10.255.255.255).</li>
                            <li>172.16.0.0/12: Redes medianas (172.16.0.0 a 172.31.255.255).</li>
                            <li>192.168.0.0/16: Redes pequeñas (192.168.0.0 a 192.168.255.255).</li>
                        </ul>
                    </li>
                </ul>

                <h3>Protocolos: TCP, UDP e ICMP</h3>
                <p>Protocolos de transporte y red para la comunicación.</p>
                <ul>
                    <li><strong>Puertos:</strong> 16 bits (1-65535).
                        <ul>
                            <li>1-1023: Puertos privilegiados (ej. 80 HTTP, 53 DNS, 443 HTTPS).</li>
                            <li>1024-65535: Puertos no privilegiados.</li>
                        </ul>
                    </li>
                    <li><strong>TCP:</strong> Orientado a conexión, garantiza entrega ordenada y retransmisión. Lento pero fiable (ideal para correo).</li>
                    <li><strong>UDP:</strong> Sin conexión, rápido, sin control de errores (ideal para streaming).</li>
                    <li><strong>ICMP:</strong> Analiza y controla la red. <code>ping</code> usa esto para verificar conectividad (Echo Request/Reply).</li>
                </ul>

                <h3>IPv6: Direcciones y diferencias</h3>
                <p>IPv6 usa direcciones de 128 bits.</p>
                <ul>
                    <li><strong>Formato:</strong> 8 grupos de 16 bits en hexadecimal (ej. <code>2001:db8:3241::1</code>).</li>
                    <li><strong>Tipos:</strong> Unicast (una interfaz), Multicast (grupo), Anycast (grupo).</li>
                    <li><strong>Diferencias:</strong>
                        <ul>
                            <li>Puertos: IPv6 usa corchetes <code>[]</code> (ej. <code>[2001:0db8::1]:443</code>).</li>
                            <li>No admite broadcast, usa multicast en su lugar.</li>
                            <li><strong>Hop Limit:</strong> Reemplaza al TTL de IPv4.</li>
                        </ul>
                    </li>
                </ul>
            </section>

            <section id="109.2" class="lesson-section">
                <h2>109.2 Configuración de red persistente</h2>
                <p>Las configuraciones de red se guardan en archivos en <code>/etc</code> para aplicar al arrancar.</p>

                <h3>Interfaces de red</h3>
                <p>Las interfaces (ej. <code>enp3s5</code> para Ethernet o <code>wlo1</code> para Wi-Fi) conectan el sistema a la red. <code>ip link show</code> las lista.</p>
                <p>Los nombres modernos (Predictable Network Interface Names) se basan en su ubicación física (bus, slot).</p>

                <h3>Gestionar interfaces</h3>
                <ul>
                    <li><strong>ifup / ifdown:</strong> Activa/desactiva interfaces según <code>/etc/network/interfaces</code>.
                        <ul>
                            <li>Ejemplo estático: <code>iface enp3s5 inet static</code>, <code>address 192.168.1.2/24</code>.</li>
                        </ul>
                    </li>
                    <li><strong>Comandos:</strong>
                        <ul>
                            <li>Ver: <code>ip link set dev enp0s8 up</code>.</li>
                            <li>Asignar IP: <code>ip addr add 192.168.5.5/24 dev enp0s8</code>.</li>
                        </ul>
                    </li>
                </ul>

                <h3>Nombres y resolución</h3>
                <ul>
                    <li><strong>Nombre host:</strong> <code>/etc/hostname</code> define el nombre estático. Cambio permanente: <code>hostnamectl set-hostname nuevo-nombre</code>.</li>
                    <li><strong>Mapeo local:</strong> <code>/etc/hosts</code> (ej. <code>127.0.0.1 localhost</code>).</li>
                    <li><strong>Resolución:</strong> <code>/etc/nsswitch.conf</code> define el orden (ej. <code>hosts: files dns</code>).</li>
                    <li><strong>DNS:</strong> <code>/etc/resolv.conf</code> define <code>nameserver 8.8.8.8</code> y <code>search lpi.org</code>.</li>
                </ul>

                <h3>NetworkManager y systemd</h3>
                <ul>
                    <li><strong>nmcli:</strong> Gestiona conexiones (ej. <code>nmcli connection show</code>).</li>
                    <li><strong>nmtui:</strong> Interfaz curses para ajustes interactivos.</li>
                    <li><strong>systemd-networkd:</strong> Usa archivos <code>.network</code> en <code>/etc/systemd/network</code> (ej. <code>Address=192.168.0.100/24</code>).</li>
                </ul>
            </section>

            <section id="109.3" class="lesson-section">
                <h2>109.3 Resolución de problemas básicos de red</h2>
                <p>El diagnóstico se realiza con estas herramientas clave:</p>

                <h3>Configurar tu red</h3>
                <ul>
                    <li><strong>Ver interfaces:</strong> <code>ip link show</code> (muestra <code>enp0s3</code>, <code>lo</code>).</li>
                    <li><strong>Activar:</strong> <code>ip link set dev enp0s8 up</code>.</li>
                    <li><strong>Asignar IP:</strong> <code>ip addr add 192.168.5.5/24 dev enp0s8</code>.</li>
                </ul>

                <h3>Herramientas para buscar problemas</h3>
                <ul>
                    <li><strong>ping / ping6:</strong> Prueba conectividad ICMP. <code>ping 8.8.8.8</code>.</li>
                    <li><strong>traceroute / traceroute6:</strong> Rastrea la ruta mostrando saltos (routers).</li>
                    <li><strong>netcat:</strong> Prueba puertos. <code>nc -zv 192.168.1.1 80</code> (si muestra "open", el puerto está abierto).</li>
                </ul>

                <h3>Ver y entender las rutas</h3>
                <ul>
                    <li><strong>Tabla de enrutamiento:</strong> <code>ip route</code>.</li>
                    <li>Ejemplo de salida: <code>default via 10.0.2.2 dev enp0s3 proto dhcp metric 100</code>.</li>
                    <li><strong>Añadir ruta:</strong> <code>ip route add 192.168.10.0/24 via 192.168.1.1</code>.</li>
                    <li><strong>IPv6:</strong> <code>ip -6 route</code> (muestra prefijos de red como <code>2001:db8::/64</code>).</li>
                </ul>

                <h3>Ver conexiones con netstat y ss</h3>
                <p>Monitorea conexiones activas y puertos.</p>
                <ul>
                    <li><strong>netstat -t:</strong> Conexiones TCP (ej. <code>ESTAB 0 0 192.168.1.100:22</code>).</li>
                    <li><strong>netstat -l:</strong> Puertos en escucha.</li>
                    <li><strong>netstat -p:</strong> Muestra el proceso (ej. <code>1234/sshd</code>).</li>
                    <li><strong>ss:</strong> Alternativa moderna. Usa <code>ss -tulnp</code> para ver todo: TCP/UDP, escuchando, numéricos y programas (ej. <code>nginx</code> en puerto 80).</li>
                </ul>
            </section>

            <section id="109.4" class="lesson-section">
                <h2>109.4 Configuración DNS en el lado del cliente</h2>
                <p>La resolución de nombres convierte "google.com" en una IP.</p>

                <h3>Cómo se buscan los nombres</h3>
                <p>El proceso sigue el orden definido en <code>/etc/nsswitch.conf</code> (ej. <code>hosts: files dns</code>).</p>

                <h3>Archivos importantes</h3>
                <ul>
                    <li><strong>/etc/hosts:</strong> Mapeo estático. Ej: <code>127.0.0.1 localhost</code> o <code>192.168.1.10 foo.mydomain.org</code>.</li>
                    <li><strong>/etc/resolv.conf:</strong> Servidores DNS (<code>nameserver 8.8.8.8</code>) y dominios de búsqueda (<code>search lpi.org</code>).</li>
                    <li><strong>/etc/nsswitch.conf:</strong> Define el orden (si buscar primero en archivos locales o en DNS).</li>
                </ul>

                <h3>Herramientas útiles</h3>
                <ul>
                    <li><strong>host:</strong> Consultas simples. Ej: <code>host google.com</code> (muestra IP).</li>
                    <li><strong>dig:</strong> Consultas detalladas. Ej: <code>dig google.com</code> (muestra IP, TTL, servidores).</li>
                    <li><strong>getent:</strong> Busca según <code>/etc/nsswitch.conf</code>. Ej.: <code>getent hosts google.com</code> (muestra la IP encontrada).</li>
                </ul>
            </section>

        </div>
    </div>
</div>
