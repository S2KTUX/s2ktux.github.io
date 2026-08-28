<div class="lesson-wrapper">
    <header class="lesson-header">
        <span class="badge">LPIC-1 Examen 103</span>
        <h1>Comandos GNU y Unix</h1>
        <p>Domina la línea de comandos, procesamiento de texto, gestión de archivos y procesos en Linux.</p>
        
    </header>

    <div class="lesson-layout">
        <aside class="lesson-toc">
            <h2>Objetivos del bloque</h2>
            <ul>
                <li><a href="#103.1">103.1 Trabajar desde la línea de comandos</a></li>
                <li><a href="#103.2">103.2 Procesar secuencias de texto usando filtros</a></li>
                <li><a href="#103.3">103.3 Administración básica de archivos</a></li>
                <li><a href="#103.4">103.4 Uso de secuencias, tuberías y redirecciones</a></li>
                <li><a href="#103.5">103.5 Crear, supervisar y matar procesos</a></li>
                <li><a href="#103.6">103.6 Modificar la prioridad de procesos</a></li>
                <li><a href="#103.7">103.7 Búsquedas con expresiones regulares</a></li>
                <li><a href="#103.8">103.8 Edición básica de archivos</a></li>
            </ul>
        </aside>

        <div class="course-content u-inline-285c4804ec">
            
            <section id="103.1" class="lesson-section">
                <h2>103.1 Trabajar desde la línea de comandos</h2>
                
                <h3>Obteniendo información del sistema</h3>
                <ul>
                    <li><strong><code>pwd</code></strong>: Muestra el directorio actual.</li>
                    <li><strong><code>touch</code></strong>: Crea un archivo vacío.</li>
                    <li><strong><code>ls</code></strong>: Lista archivos y carpetas.</li>
                    <li><strong><code>uname -a</code></strong>: Muestra información completa del sistema.</li>
                </ul>

                <h3>Información de los comandos</h3>
                <ul>
                    <li><strong><code>man</code></strong>: Muestra el manual de un comando.</li>
                    <li><strong><code>apropos</code></strong>: Busca páginas de manual por palabra clave.</li>
                    <li><strong><code>type</code></strong>: Indica el tipo de comando (integrado, alias).</li>
                    <li><strong><code>which</code></strong>: Muestra la ruta absoluta de un comando.</li>
                    <li><strong><code>history</code></strong>: Lista comandos ejecutados.</li>
                </ul>

                <h3>Variables de entorno</h3>
                <ul>
                    <li><strong><code>env</code></strong>: Muestra todas las variables de entorno.</li>
                    <li><strong><code>echo $VAR</code></strong>: Muestra el valor de una variable.</li>
                    <li><strong><code>export VAR</code></strong>: Crea o exporta una variable.</li>
                    <li><strong><code>unset VAR</code></strong>: Elimina una variable.</li>
                </ul>

                <h3>Caracteres especiales</h3>
                <p>Para interpretar caracteres especiales literalmente (como espacios), usa:</p>
                <ul>
                    <li><strong>Comillas simples <code>''</code></strong>: Interpreta todo literalmente.</li>
                    <li><strong>Comillas dobles <code>""</code></strong>: Interpreta <code>$</code>, <code>`</code> y <code>\</code>.</li>
                    <li><strong>Contrabarra <code>\</code></strong>: Escapa el siguiente carácter.</li>
                </ul>
            </section>

            <section id="103.2" class="lesson-section">
                <h2>103.2 Procesar secuencias de texto usando filtros</h2>
                
                <h3>Redirecciones y Tuberías</h3>
                <ul>
                    <li><strong><code>></code></strong>: Redirige salida (sobrescribe).</li>
                    <li><strong><code>>></code></strong>: Añade salida.</li>
                    <li><strong><code>|</code></strong>: Envía salida de un comando a otro.</li>
                    <li><strong><code>grep</code></strong>: Filtra texto (<code>-i</code> ignora mayúsculas).</li>
                </ul>

                <h3>Archivos comprimidos</h3>
                <ul>
                    <li><strong><code>gzip</code> / <code>gunzip</code></strong>: Compresión estándar.</li>
                    <li><strong><code>bzip2</code> / <code>bunzip2</code></strong>: Compresión alternativa.</li>
                    <li><strong><code>xz</code> / <code>unxz</code></strong>: Alta compresión.</li>
                    <li><strong><code>zcat</code>, <code>bzcat</code>, <code>xzcat</code></strong>: Leen contenido sin descomprimir.</li>
                </ul>

                <h3>Ver y manipular texto</h3>
                <ul>
                    <li><strong><code>less</code></strong>: Navega página por página.</li>
                    <li><strong><code>head</code> / <code>tail</code></strong>: Muestra principio o final de un archivo.</li>
                    <li><strong><code>wc -l</code></strong>: Cuenta líneas.</li>
                    <li><strong><code>cut</code></strong>: Extrae campos (ej. <code>cut -d' ' -f1</code>).</li>
                    <li><strong><code>sort</code></strong>: Ordena líneas.</li>
                    <li><strong><code>tr</code></strong>: Sustituye caracteres.</li>
                </ul>

                <h3>Integridad de datos</h3>
                <ul>
                    <li><strong><code>sha256sum archivo</code></strong>: Genera hash.</li>
                    <li><strong><code>sha256sum -c archivo_hash</code></strong>: Verifica integridad.</li>
                </ul>
            </section>

            <section id="103.3" class="lesson-section">
                <h2>103.3 Administración básica de archivos</h2>
                
                <h3>Comandos básicos</h3>
                <ul>
                    <li><strong><code>ls -l</code></strong>: Lista con detalles (permisos, propietario).</li>
                    <li><strong><code>cp</code></strong>: Copia archivos (<code>-r</code> para directorios).</li>
                    <li><strong><code>mv</code></strong>: Mueve o renombra.</li>
                    <li><strong><code>rm</code></strong>: Elimina (<code>-r</code> recursivo).</li>
                    <li><strong><code>mkdir</code> / <code>rmdir</code></strong>: Crea/Elimina directorios.</li>
                </ul>

                <h3>Globbing y Wildcards</h3>
                <ul>
                    <li><strong><code>*</code></strong>: Coincide con cualquier cadena.</li>
                    <li><strong><code>?</code></strong>: Coincide con un carácter.</li>
                    <li><strong><code>[...]</code></strong>: Coincide con un conjunto o rango.</li>
                </ul>

                <h3>Encontrar archivos (<code>find</code>)</h3>
                <ul>
                    <li><strong>Por nombre:</strong> <code>find / -name "archivo.txt"</code>.</li>
                    <li><strong>Por tipo:</strong> <code>find / -type d</code> (directorios).</li>
                    <li><strong>Por tamaño:</strong> <code>find /home -size +5M</code>.</li>
                    <li><strong>Ejecutar acción:</strong> <code>find ... -exec comando {} \;</code>.</li>
                </ul>

                <h3>Archivado (<code>tar</code>)</h3>
                <ul>
                    <li><strong>Crear:</strong> <code>tar -czvf archivo.tar.gz dir/</code>.</li>
                    <li><strong>Extraer:</strong> <code>tar -xzvf archivo.tar.gz</code>.</li>
                    <li><strong>Ver:</strong> <code>tar -tzvf archivo.tar.gz</code>.</li>
                </ul>
            </section>

            <section id="103.4" class="lesson-section">
                <h2>103.4 Uso de secuencias, tuberías y redirecciones</h2>
                
                <h3>Redirecciones de E/S</h3>
                <ul>
                    <li><strong><code>&lt;</code></strong>: Entrada desde archivo.</li>
                    <li><strong><code>&gt;</code> / <code>&gt;&gt;</code></strong>: Salida estándar (sobrescribir / añadir).</li>
                    <li><strong><code>2&gt;</code> / <code>2&gt;&gt;</code></strong>: Salida de error.</li>
                    <li><strong><code>&amp;&gt;</code></strong>: Redirige salida y error juntos.</li>
                </ul>

                <h3>Here Document y Here String</h3>
                <ul>
                    <li><strong>Here Document:</strong> <code>comando << EOF ... EOF</code> (varias líneas).</li>
                    <li><strong>Here String:</strong> <code>comando <<< "texto"</code> (una línea).</li>
                </ul>

                <h3>Tuberías (Pipes)</h3>
                <p>Conectar salida de un comando con entrada de otro: <code>cmd1 | cmd2</code>.</p>
                <p>Ejemplo: <code>ps aux | grep python | sort</code>.</p>

                <h3>Sustitución de comando</h3>
                <ul>
                    <li><strong>Comillas invertidas:</strong> <code>`comando`</code>.</li>
                    <li><strong>Dólar paréntesis:</strong> <code>$(comando)</code>.</li>
                    <li><strong>xargs:</strong> Construye y ejecuta líneas de comando desde la entrada estándar.</li>
                </ul>
            </section>

            <section id="103.5" class="lesson-section">
                <h2>103.5 Crear, supervisar y matar procesos</h2>
                
                <h3>Control de trabajos</h3>
                <ul>
                    <li><strong><code>&amp;</code></strong>: Ejecuta en segundo plano.</li>
                    <li><strong><code>jobs</code></strong>: Lista trabajos en segundo plano.</li>
                    <li><strong><code>fg</code> / <code>bg</code></strong>: Trae a primer plano / envía a segundo plano.</li>
                    <li><strong><code>nohup</code></strong>: Ejecuta inmune a cierres de sesión.</li>
                    <li><strong><code>kill</code></strong>: Envía señales a procesos (<code>-9</code> para forzar).</li>
                </ul>

                <h3>Monitoreo</h3>
                <ul>
                    <li><strong><code>top</code></strong>: Vista en tiempo real (teclas: M por memoria, P por CPU).</li>
                    <li><strong><code>ps</code></strong>: Vista estática (<code>ps aux</code>, <code>ps -ef</code>).</li>
                    <li><strong><code>pgrep</code> / <code>pkill</code></strong>: Busca y mata por nombre.</li>
                </ul>

                <h3>Multiplexores (Screen / Tmux)</h3>
                <table class="u-inline-7f220dc963">
                    <thead>
                        <tr class="u-inline-08c0e9470f">
                            <th class="u-inline-5a695e0c20">Acción</th>
                            <th class="u-inline-5a695e0c20">Screen</th>
                            <th class="u-inline-5a695e0c20">Tmux</th>
                        </tr>
                    </thead>
                    <tbody class="u-inline-570db7fd1a">
                        <tr><td class="u-inline-e69dd109bb">Crear ventana</td><td class="u-inline-c7aa49fe84">Ctrl + a c</td><td class="u-inline-c7aa49fe84">Ctrl + b c</td></tr>
                        <tr><td class="u-inline-e69dd109bb">Cambiar ventana</td><td class="u-inline-c7aa49fe84">Ctrl + a 0-9</td><td class="u-inline-c7aa49fe84">Ctrl + b 0-9</td></tr>
                        <tr><td class="u-inline-e69dd109bb">Desconectar (Detach)</td><td class="u-inline-c7aa49fe84">Ctrl + a d</td><td class="u-inline-c7aa49fe84">Ctrl + b d</td></tr>
                        <tr><td class="u-inline-c7aa49fe84">Reconectar</td><td class="u-inline-c7aa49fe84"><code>screen -r</code></td><td class="u-inline-c7aa49fe84"><code>tmux attach</code></td></tr>
                    </tbody>
                </table>
            </section>

            <section id="103.6" class="lesson-section">
                <h2>103.6 Modificar la prioridad de ejecución de los procesos</h2>
                
                <h3>El planificador y Prioridades</h3>
                <p>Valores <em>nice</em> van de -20 (alta prioridad) a 19 (baja). Por defecto es 0.</p>
                <ul>
                    <li><strong>Procesos tiempo real:</strong> Prioridad 0-99.</li>
                    <li><strong>Procesos normales:</strong> Prioridad 100-139 (nice mapeado aquí).</li>
                </ul>

                <h3>Gestión de Niceness</h3>
                <ul>
                    <li><strong><code>nice -n 10 comando</code></strong>: Inicia con prioridad 10.</li>
                    <li><strong><code>renice 15 PID</code></strong>: Cambia prioridad en ejecución.</li>
                    <li><strong><code>top</code></strong>: Muestra columna PRI/NI.</li>
                </ul>
            </section>

            <section id="103.7" class="lesson-section">
                <h2>103.7 Búsquedas con expresiones regulares</h2>
                
                <h3>RE Básicas (grep)</h3>
                <ul>
                    <li><strong><code>.</code></strong>: Cualquier carácter.</li>
                    <li><strong><code>^</code></strong>: Inicio de línea.</li>
                    <li><strong><code>$</code></strong>: Final de línea.</li>
                    <li><strong><code>[...]</code></strong>: Conjunto de caracteres.</li>
                </ul>

                <h3>Clases de caracteres</h3>
                <p><code>[:alpha:]</code> (letras), <code>[:digit:]</code> (números), <code>[:lower:]</code> (minúsculas).</p>

                <h3>Cuantificadores (Extended grep -E)</h3>
                <ul>
                    <li><strong><code>*</code></strong>: 0 o más.</li>
                    <li><strong><code>+</code></strong>: 1 o más.</li>
                    <li><strong><code>?</code></strong>: 0 o 1.</li>
                    <li><strong><code>{n}</code></strong>: Exactamente n.</li>
                </ul>

                <h3>Comandos</h3>
                <ul>
                    <li><strong><code>grep</code></strong>: Busca texto.</li>
                    <li><strong><code>sed</code></strong>: Edita flujos de texto (ej. <code>sed 's/old/new/g'</code>).</li>
                    <li><strong><code>find -regex</code></strong>: Busca archivos por patrón.</li>
                </ul>
            </section>

            <section id="103.8" class="lesson-section">
                <h2>103.8 Edición básica de archivos</h2>
                
                <h3>vi / vim</h3>
                <ul>
                    <li><strong>Modos:</strong> Normal (navegar) e Inserción (escribir, tecla <code>i</code>).</li>
                    <li><strong>Navegación:</strong> <code>h,j,k,l</code>, <code>w</code> (palabra), <code>G</code> (fin).</li>
                    <li><strong>Acciones:</strong> <code>x</code> (borrar), <code>yy</code> (copiar), <code>p</code> (pegar), <code>u</code> (deshacer).</li>
                </ul>

                <h3>Comandos Colon (:)</h3>
                <ul>
                    <li><strong><code>:w</code></strong>: Guardar.</li>
                    <li><strong><code>:q</code></strong>: Salir.</li>
                    <li><strong><code>:wq</code></strong>: Guardar y salir.</li>
                    <li><strong><code>:s/old/new/g</code></strong>: Reemplazar en línea actual.</li>
                </ul>

                <h3>Editores alternativos</h3>
                <ul>
                    <li><strong>nano:</strong> Simple, menú visual (<code>Ctrl+O</code> guardar, <code>Ctrl+X</code> salir).</li>
                    <li><strong>emacs:</strong> Potente, personalizable.</li>
                </ul>
            </section>

        </div>
    </div>
</div>
