// Revisión manual de los 240 enunciados frente al texto publicado del curso (20/10/2026).
// «Explicado» se refiere al concepto necesario, no a que se memorice la respuesta literal.
export const courseGaps={
 '101':{
  partial:{10:'mount está explicado; falta /proc/self/mounts.',25:'Falta mencionar /usr/lib64 entre las rutas habituales.',28:'Se explica machine-id al clonar, pero no regenerar las claves de host SSH.',37:'Faltan los duplicados de descriptores, como 2>&1.',38:'Faltan dd y los prefijos numéricos de vi.',42:'Falta explicar el búfer de borrado de vi.',43:'tr se menciona sin -d ni el tratamiento CR-LF.',45:'Falta :w con otro nombre de archivo.',51:'top sí aparece; uptime no.',68:'Falta explicar el aislamiento de contenedores frente al hardware virtualizado.',73:'LVM se presenta sin snapshots ni ejemplos de redimensionado.',78:'Falta explicar chmod sobre un enlace simbólico.',89:'Se explica >, pero no >& archivo en Bash.',92:'Se explica :wq, pero no ZZ.',97:'pwd está explicado; falta la variable PWD.',98:'El ejemplo de here-document no conserva una sintaxis útil y usa < sin escapar en HTML.',105:'Se explica descompresión, no el cambio .tgz a .tar.',117:'modprobe se menciona, pero su ejemplo de consulta es incorrecto y no se muestra la carga básica.'},
  missing:{5:'Falta el seguimiento por systemd de montajes hechos manualmente.',7:'Falta mount --bind.',23:'Falta dpkg -S.',31:'Faltan variables $basearch/$releasever de YUM.',32:'Falta apt-get dist-upgrade/full-upgrade.',34:'Falta rpm -qpR.',46:'Falta relacionar Ctrl+C con SIGINT.',47:'Falta tee.',53:'Falta .bash_history.',56:'Falta >&2.',62:'Falta yum groupinstall.',69:'Falta apt-get install -f.',71:'Faltan menuentry e insmod de GRUB.',76:'Faltan /proc/mounts y /proc/self/mounts.',79:'Falta el reparto de inodos de ext2/ext3.',87:'Falta la búsqueda inversa ? de vi.',88:'Falta seleccionar la sección del manual.',90:'Falta set para opciones y parámetros posicionales.',91:'Faltan pgrep -u y -U.',93:'Falta grep -v.',95:'Falta relacionar Ctrl+Z con SIGTSTP.',99:'Falta el incremento por defecto de nice y su diferencia respecto al valor heredado.',106:'Faltan los prefijos numéricos para movimientos y operadores de vi.',108:'Falta split.',112:'Falta 1>&2.'}
 },
 '102':{
  partial:{3:'netstat se presenta sin sus opciones de rutas y estadísticas.',7:'Faltan los tipos de conexión de NetworkManager.',9:'Falta explicar cómo disminuye Hop Limit.',10:'Se muestra connection, no device.',15:'Falta aclarar que UID y GID son espacios independientes.',20:'Se explica useradd -d, pero no -u.',22:'Falta Unit= y el destino de activación de un timer.',37:'Falta un ejemplo server en ntp.conf.',43:'Falta cómo read reparte los campos entre varias variables.',48:'Falta explicar expresamente la identidad que acredita la clave de host.',50:'Faltan PASSWD y la herencia de etiquetas en listas sudoers.',53:'lsof aparece para archivos abiertos, no para sockets TCP.',54:'Falta explicar que ssh -X configura DISPLAY en la sesión remota.',66:'Se explica --since, pero no --until.',68:'lpstat se menciona sin explicar su listado de trabajos.',78:'Falta diferenciar el tratamiento de #! por el kernel y por el intérprete.',82:'Falta el límite de archivos core con ulimit.',85:'Falta una explicación clara de custodia de claves públicas y privadas.',100:'Falta una regla explícita de selección por prefijo más específico.',101:'Falta eliminar la ruta por defecto.',105:'Se presenta locale.conf sin advertir que no admite LC_ALL.'},
  missing:{8:'Faltan route y los retrasos de resolución de nombres.',12:'Falta calcular hosts útiles a partir de CIDR.',17:'Falta systemctl list-timers.',26:'Faltan chsh y el uso de /bin/false como shell.',28:'Faltan los metadatos y el reenvío de journald.',36:'Falta una regla concreta de syslog con prioridades y destino remoto.',38:'Falta el concepto de open relay de correo.',51:'Falta /etc/ssh/ssh_config.',84:'Falta cuándo se aplican cambios de TCP Wrappers.',89:'Falta SSH_AUTH_SOCK.',90:'Falta ssh -i.',92:'Falta nmcli device wifi connect.',93:'Falta dig -t ns y la lectura del tipo consultado.',95:'Faltan los estados de conectividad portal/full.',96:'Falta calcular el rango de hosts de una subred.',99:'Faltan ifconfig e ip -s link para estadísticas.',103:'Falta la interacción ifupdown/NetworkManager managed=false.',114:'Falta el comportamiento de Cronie si no existen allow/deny.'}
 }
};
export const courseErrors=[
 [101,'101.1','modprobe -p no es la consulta de parámetros mostrada: corresponde modinfo -p.'],
 [101,'101.2','system.unit debe ser systemd.unit.'],
 [101,'101.2','El arranque anterior se consulta con journalctl -b -1, no -b 1.'],
 [101,'101.2','El kernel no monta las entradas de /etc/fstab: lo hace el espacio de usuario.'],
 [101,'101.3','Systemd sí usa /etc/fstab mediante su generador de unidades.'],
 [103,'103.4','Los operadores << y <<< necesitan escaparse en HTML y el here-document debe mostrarse en varias líneas.'],
 [103,'103.6','nice -n indica un incremento sobre el nice heredado, no siempre un valor absoluto.'],
 [104,'104.1','fdisk moderno también soporta GPT; no es exclusivamente MBR.'],
 [104,'104.5','umask elimina bits mediante una máscara; no es una resta aritmética general.'],
 [105,'105.1','Los nombres de variables admiten guion bajo, no guion medio; exportar no depende de las mayúsculas.'],
 [107,'107.1','Shadow guarda un hash o marcador, no una contraseña cifrada reversible.'],
 [109,'109.1','255.255.0.0 equivale a /16, no /24.'],
 [110,'110.1','/etc/shadow tiene nueve campos, incluido el reservado; aquí se afirman ocho.']
];
export const bankGaps=[
 'Paquetería: bibliotecas con ldconfig/LD_LIBRARY_PATH, verificaciones e información adicional de paquetes.',
 'Filtros y archivos: uniq, paste, nl, od, checksums, cpio y dd; hay muchas preguntas de redirecciones pero no de todas estas herramientas.',
 'Escritura de scripts con if/for/while, funciones y exec: no basta con preguntas sobre variables y seq.',
 'Accesibilidad y escritorios: el banco se concentra en DISPLAY, SPICE y lectores de pantalla.',
 'NTP: comprobar el estado y las fuentes con chronyc/ntpq; impresión: enviar y cancelar trabajos, no solo listar.',
 'Seguridad: GPG no tiene preguntas en este banco; faltan también túneles SSH y varias tareas de auditoría.'
];
