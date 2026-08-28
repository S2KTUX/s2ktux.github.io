<div class="lesson-wrapper">
    <header class="lesson-header">
        <span class="badge">RHCSA Objetivo 5</span>
        <h1>Configuración del almacenamiento local</h1>
        <p>Particiones, LVM y montaje persistente de sistemas de archivos</p>
        
        <a href="https://youtu.be/RMWPYC6xllw" target="_blank" rel="noopener" class="video-card">
            <div class="video-icon">🎬</div>
            <div class="video-text">
                <strong>VER VIDEO YOUTUBE - CLASE 5</strong>
                <span>Almacenamiento local paso a paso para RHCSA</span>
            </div>
        </a>
    </header>

    <div class="lesson-layout">

        <aside class="lesson-toc">
            <h2>Objetivos del bloque</h2>
            <ul>
                <li><a href="#obj1">1. Particiones GPT</a></li>
                <li><a href="#obj2">2. Volúmenes físicos (PV)</a></li>
                <li><a href="#obj3">3. Grupos de volúmenes (VG)</a></li>
                <li><a href="#obj4">4. Volúmenes lógicos (LV)</a></li>
                <li><a href="#obj5">5. Montaje con UUID o LABEL</a></li>
                <li><a href="#obj6">6. Cambios no destructivos y SWAP</a></li>
            </ul>
        </aside>
        

        <div class="course-content u-inline-285c4804ec">

            <section id="obj1" class="lesson-section">
                <h2>1. Listar, crear y eliminar particiones GPT</h2>
                <p>Antes de poder utilizar un disco debemos crear particiones. El estándar actual es <strong>GPT</strong>, que sustituye a MBR, aunque este se sigue usando.</p>
                <p> Las diferencias principales entre MBR y GPT son que MBR está limitado a 2TB y 4 particiones, mientras que GPT  permite discos más grandes, particiones casi ilimitadas y mayor recuperación de datos.</p>
                <p> Para listar los discos o particiones que tenemos podemos usar los siguientes comandos, que cualquiera es valido para hacer comprobaciones : </p>
                <ul>
                    <li><strong>lsblk</strong> → Vista clara de discos y particiones.</li>
                    <li><strong>blkid</strong> → UUID y tipo de filesystem.</li>
                    <li><strong>parted -l</strong> → Información de tabla GPT/MBR.</li>
                    <li><strong>fdisk -l</strong> → Información técnica detallada.</li>
                    <li><strong>df -h</strong> → Espacio usado en sistemas montados.</li>
                </ul>
                <p>Las particiones pueden gestionarse con <code>fdisk</code>, <code>gdisk</code> o <code>parted</code> (recomendado en Red Hat). Tras modificar particiones ejecutamos <code>partprobe</code> para actualizar el kernel.</p>
                <img class="u-inline-525b23bb9f" src="/images/listado-part.png" alt="Listado de discos y particiones" width="1290" height="680">
                <p>Una vez listados los discos, podemos crear o eliminar particiones usando <code>fdisk</code>, <code>gdisk</code> o <code>parted</code>. Tened en cuenta que  gdisk funciona practicamente igual que fdisk.</p>
                <p>Para usar <code>fdisk</code> ejecutamos <code>fdisk /dev/sdX</code> (el disco se obtiene con <code>fdisk -l</code>) y desde el menú interactivo podemos crear o borrar particiones.</p>
                <img class="u-inline-525b23bb9f" src="/images/part-fdisk.png" alt="Creación de particiones con fdisk" width="744" height="757">
                <p>Con <code>n</code> creamos particiones, con <code>d</code> las eliminamos y con <code>t</code> cambiamos su tipo.</p>
                <img class="u-inline-525b23bb9f" src="/images/mod-tipo-part-fdisk.png" alt="Cambio de tipo de partición a LVM" width="851" height="529">
                <p> Por otro lado, podemos utilizar parted que. Escribiendo help vemos todas las opciones. Por ejemplo vamos a crear varias particiones : </p>
                <img class="u-inline-525b23bb9f" src="/images/parted-all.png" alt="Crear parted particiones ejemplo" width="1076" height="550">
                <p>Primero creamos la tabla de particiones GPT, después la partición y, si es necesario, le asignamos el tipo. Recuerda que el inicio de la primera partición es <strong>1MiB</strong>.</p>
                <p>Al salir de <code>parted</code> es necesario ejecutar <code>partprobe -s</code> para que el sistema detecte los cambios. Luego podemos comprobar las particiones con comandos como <code>lsblk</code>. </p>
                <p> Por ultimo, aunque no muy relevante pero si podría salir en el examen, existen unas etiquetas INTERNAS de las tablas de GPT. Podemos asignarlas con el comando <code>parted disco name 1(partición) "NOMBRE"</code>. No confundir estas etiquetas con las etiquetas de las particiones que veremos despues.</p>


            </section>

            <section id="obj2" class="lesson-section">
                <h2>2. Crear y eliminar volúmenes físicos (PV)</h2>
                <p>LVM organiza el almacenamiento en tres capas: <strong>PV → VG → LV</strong>. Un volumen físico es una partición o disco preparado para LVM.</p>
                <p> Por ejemplo, vamos a crear dos PV, borrar uno y comprobar(pvs o pvdisplay para más información) :</p>
                <img class="u-inline-525b23bb9f" src="/images/pv-ex.png" alt="pv ejemplo" width="572" height="516">
                <p>Es importante que la partición tenga tipo LVM antes de crear el PV.</p>
            </section>

            <section id="obj3" class="lesson-section">
                <h2>3. Crear y gestionar grupos de volúmenes (VG)</h2>
                <p>Un <strong>Volume Group</strong> combina varios PV creando un espacio de almacenamiento común.</p>
                <p> En los VG entra el concepto de PE que es la unidad basica de almacenamiento en LVM. Nosotros asignamos X tamaño pero internamente LVM utilizará los PE. Por defecto son 4MB, entonces si por ejemplo tenemos 10GB, LVM usará 2560PE (10GIB / 4MB)</p>
                <img class="u-inline-525b23bb9f" src="/images/vg-ex.png" alt="vg ejemplo" width="532" height="674">
                <p> Vemos com hemos creado, extendido, reducido y borrado VG, así como comprobado con vgs o vgdisplay. Por ultimo, podriamos activar o desactivar con <code>vgchange -ay/-an nombre-VG</code>, siendo -ay para activar y -an para desactivar</p>
        
            </section>

            <section id="obj4" class="lesson-section">
                <h2>4. Crear y administrar volúmenes lógicos (LV)</h2>
                <p>Los volúmenes lógicos son los dispositivos finales que se formatean y montan en el sistema.</p>
                <p> Para crear un volumen lógico (LV) podemos indicar el tamaño en gigabytes con <code>-L</code> o usando extensiones físicas (PE) con <code>-l</code> y le daremos un nombre con <code>-n</code>. Por ejemplo:</p>
                <img class="u-inline-525b23bb9f" src="/images/lv-primera.png" alt="lv ejemplo" width="862" height="339">
                <p> Una vez creados, podemos extender, reducir, borrar... Pero primeramente vamos a darle un formato y montandolos en el sistema para identificarlos. Recordar comprobar con lsblk, df -Th, lvs ...</p>
                <img class="u-inline-525b23bb9f" src="/images/lv_segunda.png" alt="lv-formatear y montar ejemplo" width="754" height="510">
                <p> Una vez formateados y montados, ya podriamos extender y reducir, aunque para reducir deben estan DESMONTADOS. Al extender, si añadimos <code>-r</code> se extenderá automaticamente. En caso de que no lo añadamos, tendriamos que ejecutar resize2fs (para ext4) o xfs_growfs (para XFS)  </p>
                <img class="u-inline-525b23bb9f" src="/images/lv_tercera.png" alt="lv extend ejemplo" width="1076" height="718">
                <img class="u-inline-525b23bb9f" src="/images/lv_cuarta.png" alt="lv reduce ejemplo" width="1054" height="757">
                <p> Importante mencionar que extender podemos con todos los filesystem pero REDUCIR no es posible con algunos como xfs y cuando reducimos indicamos el tamaño final que queremos. Tambien podriamos  extender usando % de espacio libre con <code>lvextend -r -l +50%FREE particion</code>. </p>
            </section>

            <section id="obj5" class="lesson-section">
                <h2>5. Montar sistemas de archivos usando UUID o LABEL</h2>
                <p>El montaje persistente se configura en <code>/etc/fstab</code>. Se recomienda usar <strong>UUID</strong> o <strong>LABEL</strong> para evitar problemas si cambia el nombre del dispositivo.</p>
                <p> En cuanto las LABEL(etiquetas) podemos asignarlas de diferentes maneras </p>
                <ul>
                    <li><code>mkfs.ext4 -L NOMBRE DISCO</code> → Crear filesystem con etiqueta. Es la más recomendada</li>
                    <li><code>tune2fs -L</code> → Cambiar etiqueta en EXT.</li>
                    <li><code>swaplabel -L</code> → Etiquetar SWAP.</li>
                    <li><code>blkid</code> → Obtener UUID.</li>
                </ul>
                <p> La sintaxis para montar un sistema de archivos de forma automatica al arrancar el sistema es : <code>[dispositivo] [montaje] [fs] [opciones] [dump] [pass]</code> (donde dump es siempre 0 y pass(verificar un filesystem al arrancar) suele ser 0 (no verificar) o 2 (verificar en segundo lugar). Las opciones, si no dicen lo contrario, usar defaults</p>
                <img class="u-inline-525b23bb9f" src="/images/fstab.png" alt="Entrada persistente de un sistema de archivos en /etc/fstab" width="1037" height="482">
                <p>Tras modificarlo, lanzamos <code>mount -a</code> y  systemctl daemon-reload y .</p>
            </section>

                <section id="obj6" class="lesson-section">
                <h2>6. Cambios no destructivos y configuración SWAP</h2>
                <p>Los cambios no destructivos consisten en ampliar almacenamiento sin perder datos mediante <code>vgextend</code> y <code>lvextend -r</code>. Reducir incorrectamente puede provocar pérdida de información.</p>
                <p> Uno de los mayores errores que hace que sea destructivo es una vez hemos extendido o reducido, formatear el disco <code>mkfs</code>, ya que borraría todos los datos. El otro error sería borrar la tabla de particiones o la partición con <code>fdisk</code> o <code>parted</code>.</p>
                <p> El SWAP es una zona del disco duro que el sistema utiliza como "memoria RAM de emergencia" cuando la principal se queda sin espacio. Teniamos creada la primera partición como swap en el punto 1. Para formatearla deberiamos de :  </p>
                <img class="u-inline-525b23bb9f" src="/images/swap.png" alt="Creación, activación y persistencia de un archivo swap" width="888" height="537">
                <p> Hemos creado la partición SWAP, le hemos dado formato y la hemos activo. Por ultimo, añadiendola a <code>/etc/fstab</code> la hacemos persistente. Tambien podríamos crear SWAP a traves de archivo aunque dudo mucho que salga en el examen. En caso de sería :</p>
                <pre><code>
fallocate -l 1G /swapfile #FORMA RAPIDA
dd if=/dev/zero of=/swapfile bs=1M count=1024 # FORMA LENTA 
    
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo "/swapfile swap swap defaults 0 0" >> /etc/fstab</code></pre>
            </section>

        </div>
    </div>
</div>
