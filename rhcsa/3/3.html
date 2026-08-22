<div class="lesson-wrapper">
    <header class="lesson-header">
        <span class="badge">RHCSA Objetivo 3</span>
        <h1>Crear scripts de shell simples</h1>
        <p>Automatización básica y lógica de programación con Bash</p>
        
        <a href="https://youtu.be/CRaP1XjdS4A" target="_blank" rel="noopener" class="video-card">
            <div class="video-icon">🎬</div>
            <div class="video-text">
                <strong>VER VIDEO YOUTUBE - CLASE 3</strong>
                <span>Tutorial completo de scripting y automatización</span>
            </div>
        </a>
    </header>

    <div class="lesson-layout">
        <aside class="lesson-toc">
            <h2>Objetivos del bloque</h2>
            <ul>
                <li><a href="#obj1">1. Código condicional</a></li>
                <li><a href="#obj2">2. Uso de bucles</a></li>
                <li><a href="#obj3">3. Entradas de scripts</a></li>
                <li><a href="#obj4">4. Salida de comandos</a></li>
            </ul>
        </aside>

        <div class="course-content" style="min-width:0;max-width:100%;overflow-wrap:anywhere">

            <section id="obj1" class="lesson-section">
                <h2>1. Ejecutar código condicionalmente (if,test,[]...)</h2>
                <p>Los scripts de shell permiten ejecutar comandos de forma automática. El control condicional se realiza principalmente con <strong>if</strong>, <strong>test</strong> y los corchetes de evaluación.</p>
                <p>El shebang (#!) indica qué intérprete ejecutará el script (#!/bin/bash), usando luego comandos como <code>read</code> para guardar datos, <code>echo</code> para mostrar resultados.</p>
                <img src="/images/script1.png" alt="Script basico" width="575" height="221" style="max-width:100%;height:auto">
                <p>Debemos recordar que siempre que editemos un archivo para crear un script habrá que darle permisos de ejecución con <code>chmod +x nombre-script</code>.</p>
                <img src="/images/script2.png" alt="resultado script basico" width="450" height="158" style="max-width:100%;height:auto">
                <h3>Operadores lógicos de archivos:</h3>
                <ul>
                    <li><strong>-e</strong><small> : Existe archivo/dir</small></li>
                    <li><strong>-f</strong><small> : Es archivo regular</small></li>
                    <li><strong>-d</strong><small> : Es un directorio</small></li>
                    <li><strong>-r/w/x</strong><small> : Permisos r, w o x</small></li>
                </ul>

                <h3>Comparación de cadenas y números:</h3>
                <ul>
                    <li><strong>Cadenas:</strong> <code>-z</code> (vacía), <code>-n</code> (no vacía), <code>=</code> (igual), <code>!=</code> (distinta).</li>
                    <li><strong>Números:</strong> <code>-eq</code> (==), <code>-ne</code> (!=), <code>-lt</code> (<), <code>-gt</code> (>), <code>-ge</code> (>=).</li>
                </ul>

                <p>En Bash, los espacios dentro de <code>[ ]</code> son obligatorios: <code>[ "$num" -eq 5 ]</code> es correcto, mientras que <code>["$num"-eq5]</code> fallará.</p>
                <img src="/images/script3.png" alt="Script con operadores" width="597" height="469" style="max-width:100%;height:auto">
                <img src="/images/script4.png" alt="Resultado operadores" width="475" height="144" style="max-width:100%;height:auto">

                <h3>Condiciones compuestas y [[ ]]:</h3>
                <p>En el scripting moderno se utilizan los dobles corchetes <code>[[ ]]</code> por ser más seguros. Soportan operadores estándar:</p>
                <ul>
                    <li><strong>&amp;&amp;</strong> (AND), <strong>||</strong> (OR), <strong>!</strong> (NOT), <strong>==</strong> (Igualdad), <strong>!=</strong> (Desigualdad).</li>
                </ul>
                <img src="/images/script5.png" alt="Script condicional compuesto" width="573" height="410" style="max-width:100%;height:auto">
                <img src="/images/script6.png" alt="Resultado condicional compuesto" width="523" height="377" style="max-width:100%;height:auto">

                <p>También disponemos de <code>case</code> para múltiples opciones de forma más limpia:</p>
                <img src="/images/script7.png" alt="Sintaxis de case" width="565" height="258" style="max-width:100%;height:auto">
            </section>

            
            <section id="obj2" class="lesson-section">
                <h2>2. Uso de bucles para procesar archivos y entradas</h2>
                <p><strong>Bucle for:</strong> Ideal para iterar sobre una lista conocida de elementos, archivos o salidas de comandos.</p>
                <img src="/images/script8.png" alt="Ejemplo bucle for" width="812" height="400" style="max-width:100%;height:auto">
                <img src="/images/script9.png" alt="Resultado bucle for" width="698" height="556" style="max-width:100%;height:auto">
               <p><strong>Bucle while:</strong> Ideal para lecturas línea a línea (con <code>read</code>) o contadores. Podemos usar <code>IFS</code> para definir separadores en archivos como CSV.</p>
                <img src="/images/script10.png" alt="Ejemplo bucle while" width="722" height="304" style="max-width:100%;height:auto">
                <img src="/images/script11.png" alt="Resultado bucle while" width="481" height="188" style="max-width:100%;height:auto">
                <p>Usamos for cuando conocemos los elementos a recorrer, while mientras una condición sea verdadera y until mientras sea falsa.</p>

            </section>
            
            <section id="obj3" class="lesson-section">
                <h2>3. Procesar entradas de scripts</h2>
                <p>Los scripts pueden recibir argumentos desde la línea de comandos. Estos son los tipos principales:</p>
                <ul>
                    <li><strong>$0</strong> → Nombre del script.</li>
                    <li><strong>$1, $2...</strong> → Argumentos posicionales individuales.</li>
                    <li><strong>$#</strong> → Número total de argumentos recibidos.</li>
                    <li><strong>$@</strong> → Lista de todos los argumentos.</li>
                    <li><strong>$?</strong> → Estado de salida del último comando (0 = éxito).</li>
                    <li><strong>$?</strong> → Estado del script</li>
                </ul>
                <img src="/images/script12.png" alt="Uso de argumentos" width="763" height="447" style="max-width:100%;height:auto">
                <img src="/images/script13.png" alt="Resultado de argumentos" width="538" height="418" style="max-width:100%;height:auto">
                <p>Podemos forzar la finalización de un script con un código de error específico usando <code>exit 1</code>.</p>
            </section>
            <section id="obj4" class="lesson-section">
                <h2>4. Procesar la salida de comandos dentro de un script</h2>
                <p>La salida de comandos puede almacenarse en variables usando la sintaxis <code>$(comando)</code>.</p>
                <p>Esto permite capturar información del sistema para procesarla más tarde o redirigirla, combinándola con lo aprendido en la Clase 1 sobre redirecciones de flujo.</p>
                <img src="/images/script14.png" alt="Procesando y redirigiendo" width="677" height="253" style="max-width:100%;height:auto">
                <img src="/images/script15.png" alt="Resultado redirección en script" width="679" height="452" style="max-width:100%;height:auto">
                <div class="lesson-alert" style="background: rgba(0, 123, 255, 0.1); border-left: 4px solid #007bff; padding: 15px; margin-top: 20px;">
                    <strong>💡 CONSEJO :</strong> La mayoría de errores en scripts vienen de fallos de sintaxis: falta de espacios en los corchetes, no dar permisos de ejecución o usar rutas relativas en lugar de absolutas.
                </div>
            </section>

        </div>
    </div>
</div>
