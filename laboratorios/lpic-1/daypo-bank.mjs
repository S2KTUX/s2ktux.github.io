// Preguntas de Deza92 en Daypo, reutilizadas con autorización confirmada por el responsable de S2KTUX.
// Sus derechos no quedan sustituidos por la licencia del código o de los apuntes de S2KTUX.
// Explicaciones y correcciones: S2KTUX. Registro: /contenido/lpic-1-correcciones.md
export const bankSources=[
  {
    "exam": "101",
    "url": "https://www.daypo.com/lpic-101-500.html",
    "title": "LPIC 101-500",
    "author": "Deza92",
    "testId": "777660",
    "count": 120,
    "sourceSha256": "776a4ef1efa0ff34142960bca2cf40523533418ff2d76d3609951b3c4e30018b",
    "permission": "El responsable de S2KTUX confirma disponer de permiso de reutilización; no es una licencia general de Daypo."
  },
  {
    "exam": "102",
    "url": "https://www.daypo.com/lpic-102-500.html",
    "title": "LPIC 102-500",
    "author": "Deza92",
    "testId": "902497",
    "count": 120,
    "sourceSha256": "13758ad703713fff5b7b429b17afe18f894c37eb319154699a032a48802613a4",
    "permission": "El responsable de S2KTUX confirma disponer de permiso de reutilización; no es una licencia general de Daypo."
  }
];
export const daypoQuestions=[
  {
    "id": "daypo-101-001",
    "exam": "101",
    "sourceIndex": 1,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "07e347ea60911f978fad3c20d45c1c607ab3ff9d8c4bbfbc7a8588c49945d827",
    "type": "single",
    "prompt": "¿Qué tipo de sistema de archivos crea mkfs cuando se ejecuta solo con el nombre del dispositivo de bloque y sin ningún parámetro adicional?",
    "answers": [
      2
    ],
    "objective": "104.1",
    "explanation": "Sin indicar -t, el frontal mkfs utiliza ext2 de forma predeterminada.",
    "topic": 104,
    "choices": [
      "XFS",
      "VFAT",
      "ext2",
      "ext3",
      "ext4"
    ]
  },
  {
    "id": "daypo-101-002",
    "exam": "101",
    "sourceIndex": 2,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "fd141e107f0e1bab51ceac2fe00504ce5720915ae720fd0841d17532a432ca1d",
    "type": "single",
    "prompt": "¿Qué valor de umask garantiza que los nuevos directorios puedan ser leídos, escritos y listados por su usuario propietario, leídos y listados por su grupo propietario y que no sean accesibles en absoluto para todos los demás?",
    "answers": [
      1
    ],
    "objective": "104.5",
    "explanation": "La máscara 027 retira la escritura al grupo y todos los permisos a los demás: los directorios parten de 777 y quedan en 750.",
    "topic": 104,
    "choices": [
      "0750",
      "0027",
      "0036",
      "7640",
      "0029"
    ]
  },
  {
    "id": "daypo-101-003",
    "exam": "101",
    "sourceIndex": 3,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "e90adf498d1e3f5a4c35eec8818293361ba0c142a36209fdc3e09735312cdd80",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos cambia el número de días antes de que el sistema de archivos ext3 en /dev/sda1 tenga que ejecutar una verificación completa del sistema de archivos en el arranque?",
    "answers": [
      1
    ],
    "objective": "104.2",
    "explanation": "tune2fs -i configura el intervalo temporal entre comprobaciones; sin sufijo, el valor se interpreta en días.",
    "topic": 104,
    "choices": [
      "tune2fs -d 200 /dev/sda1",
      "tune2fs -i 200 /dev/sda1",
      "tune2fs -c 200 /dev/sda1",
      "tune2fs -n 200 /dev/sda1",
      "tune2fs --dias 200 /dev/sda1"
    ]
  },
  {
    "id": "daypo-101-004",
    "exam": "101",
    "sourceIndex": 4,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "a42a3c2b9f594e664a21c28f9b45f872b32f12326d6dac89fdcd47ee5e47cd1d",
    "type": "single",
    "prompt": "¿Cuál es el porcentaje por defecto de espacio reservado para el usuario root en los nuevos sistemas de archivos ext4?",
    "answers": [
      4
    ],
    "objective": "104.2",
    "explanation": "mke2fs reserva habitualmente un 5 % para usuarios privilegiados; ese porcentaje se puede cambiar.",
    "topic": 104,
    "choices": [
      "10%",
      "3%",
      "15%",
      "0%",
      "5%"
    ]
  },
  {
    "id": "daypo-101-005",
    "exam": "101",
    "sourceIndex": 5,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "342830959d3e8b5d45bedf4ac7c9a8573ad63a5909bb2e87b5737e7c3406d349",
    "type": "single",
    "prompt": "¿Cuál de las siguientes afirmaciones es verdadera cuando un sistema de archivos, que no figura en /etc/fstab ni es conocido por el sistema, se monta manualmente?",
    "answers": [
      2
    ],
    "objective": "104.3",
    "explanation": "systemd observa los montajes existentes y los representa como unidades .mount, aunque no procedan de fstab.",
    "topic": 104,
    "choices": [
      "systemd ignora cualquier manual de montaje que no se realice usando el comando systemctl mount",
      "El comando systemctl mountsync se puede utilizar para crear una unidad de montaje basada en el montaje existente.",
      "systemd genera automáticamente una unidad de montaje y supervisa el punto de montaje sin modificarlo",
      "A menos que se cree una unidad de montaje systemd, systemd desmonta el archivo",
      "Se debe usar systemctl unmount para eliminar el montaje porque el sistema abre un descriptor de archivo en el punto de montaje."
    ]
  },
  {
    "id": "daypo-101-006",
    "exam": "101",
    "sourceIndex": 6,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "5f05a4dddae150df39085a7ecb6c01901efca0fa67ebef47672ada4e712618b7",
    "type": "written",
    "prompt": "¿Qué programa actualiza la base de datos que utiliza el comando locate? (Especifique solo el comando sin ruta ni parámetros)",
    "answers": [
      "updatedb"
    ],
    "objective": "104.7",
    "explanation": "updatedb actualiza la base que consulta locate; no realiza la búsqueda de nombres por sí mismo.",
    "topic": 104
  },
  {
    "id": "daypo-101-007",
    "exam": "101",
    "sourceIndex": 7,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "671f9c67b8c1f02cb3c5745eb57fdb9b2338d1eb7a5c2ebbf53053e3a3faf490",
    "type": "single",
    "prompt": "¿Qué hace el comando mount --bind?",
    "answers": [
      0
    ],
    "objective": "104.3",
    "explanation": "Un bind mount presenta el mismo contenido en otro punto de montaje, sin crear una copia de los archivos.",
    "topic": 104,
    "choices": [
      "Hace que el contenido de un directorio esté disponible en otro directorio.",
      "Monta todos los sistemas de archivos disponibles en el directorio actual.",
      "Monta todos los sistemas de archivos montables por el usuario en el directorio de inicio del usuario.",
      "Monta todos los sistemas de archivos almacenados en /etc/fstab que tienen la opción userbind configurada",
      "Monta permanentemente un archivo normal en un directorio"
    ]
  },
  {
    "id": "daypo-101-008",
    "exam": "101",
    "sourceIndex": 8,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "afe3c0a4dc1eea842f971e6aa898067850da3829c755c309f1131356f220d79a",
    "type": "single",
    "prompt": "Considere el siguiente resultado del comando ls -i:\n\n-rw-wr-r---...... a.txt\n\nlrwxrwxrwx.... b.txt -> a.txt\n\n¿Cómo se crearía un nuevo archivo llamado c.txt con el mismo número de inodo que a.txt (Inodo 525385)?",
    "answers": [
      2
    ],
    "objective": "104.6",
    "explanation": "ln sin -s crea un enlace duro: a.txt y c.txt serán dos nombres del mismo inodo.",
    "topic": 104,
    "choices": [
      "ln -h a.txt c.txt",
      "ln c.txt a.txt",
      "ln a.txt c.txt",
      "ln -f c.txt a.txt",
      "ln -i 525385 c.txt"
    ],
    "correction": "Se restaura ln en las dos opciones que el original traducía como «en»."
  },
  {
    "id": "daypo-101-009",
    "exam": "101",
    "sourceIndex": 9,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "acfcd75f261963a3e3b7bcda1ae3584f8abd78ac6cd54d2ac95a5bb5c9ad6ae7",
    "type": "multiple",
    "prompt": "Considere el siguiente directorio:\n\ndrwxrwxrwx 2 root ventas 4096 ENE 15:21 ventas\n\n¿Qué comando garantiza que los nuevos archivos creados dentro del directorio de ventas sean propiedad del grupo de ventas? (Escoge dos.)",
    "answers": [
      0,
      4
    ],
    "objective": "104.5",
    "explanation": "SGID en un directorio hace que las nuevas entradas hereden su grupo. Se puede activar con g+s o con el dígito especial 2.",
    "topic": 104,
    "choices": [
      "chmod g+s ventas",
      "setpol -R newgroup=ventas ventas",
      "chgrp -p ventas ventas",
      "chown --persistent *.ventas ventas",
      "chmod 2775 ventas"
    ],
    "correction": "Se unifican el directorio y el grupo ventas: el original mostraba otro grupo y mezclaba ventas con sales."
  },
  {
    "id": "daypo-101-010",
    "exam": "101",
    "sourceIndex": 10,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "6b5107313a9cdc2fb3565f373f71ecd850b1225e062df536ad9a47c60153c206",
    "type": "multiple",
    "prompt": "Para mostrar todos los sistemas de archivos actualmente montados, ¿cuál de los siguientes comandos podría usarse? (Escoge dos.)",
    "answers": [
      0,
      3
    ],
    "objective": "104.3",
    "explanation": "mount sin argumentos y /proc/self/mounts permiten consultar los montajes del proceso actual.",
    "topic": 104,
    "choices": [
      "cat /proc/self/mounts",
      "free",
      "lsmounts",
      "mount",
      "cat /proc/filesystems"
    ]
  },
  {
    "id": "daypo-101-011",
    "exam": "101",
    "sourceIndex": 11,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "47c30abd4bcf3686b936b33d7430a41c292adf45ed0d4c1957fdf1acc23645be",
    "type": "written",
    "prompt": "¿Qué comando muestra el uso actual del espacio en disco para todos los sistemas de archivos montados? (Especifique SÓLO el comando sin ruta ni parámetros).",
    "answers": [
      "df"
    ],
    "objective": "104.2",
    "explanation": "df muestra la utilización de los sistemas de archivos; du calcula el espacio ocupado por archivos.",
    "topic": 104
  },
  {
    "id": "daypo-101-012",
    "exam": "101",
    "sourceIndex": 12,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "0da1b14bd37e2906941c395c50aa12900054a835c86f5d039a66210b84e5d4cf",
    "type": "single",
    "prompt": "¿Qué comando chown cambia la propiedad a dave y el grupo a staff en un archivo llamado data.txt?",
    "answers": [
      4
    ],
    "objective": "104.5",
    "explanation": "chown acepta propietario:grupo. En este caso cambia ambos atributos de data.txt.",
    "topic": 104,
    "choices": [
      "chown dave/staff data.txt",
      "chown -u dave -g staff data.txt",
      "chown --user dave --group staff data.txt",
      "chown dave+staff data.txt",
      "chown dave:staff data.txt"
    ]
  },
  {
    "id": "daypo-101-013",
    "exam": "101",
    "sourceIndex": 13,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "ebb64415f57786651c00fd0d1c03855e0b11a122daf49b666053b51ba9fdd49c",
    "type": "single",
    "prompt": "Al considerar el uso de enlaces duros (fisicos), ¿cuáles son las razones válidas para no utilizar enlaces duros?",
    "answers": [
      2
    ],
    "objective": "104.6",
    "explanation": "Un enlace duro referencia un inodo del mismo sistema de archivos; no puede apuntar a otro sistema de archivos.",
    "topic": 104,
    "choices": [
      "Los enlaces duros no están disponibles en todos los sistemas Linux porque los sistemas de archivos tradicionales, como ext4, no los admiten",
      "Cada enlace duro tiene propiedad, permisos y ACL individuales que pueden provocar la divulgación no intencionada del contenido del archivo.",
      "Los enlaces duros son específicos de un sistema de archivos y no pueden apuntar a archivos en otro sistema de archivos.",
      "Si otros usuarios además del root deberían poder crear enlaces duros, se debe instalar y configurar su ln.",
      "Cuando se modifica un archivo vinculado, se crea una copia del archivo y consume espacio adicional."
    ]
  },
  {
    "id": "daypo-101-014",
    "exam": "101",
    "sourceIndex": 14,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "196417a668cff1429ff9ffeee19bd5ca94ca5673a2f41f8de3730392e6b0eb0d",
    "type": "single",
    "prompt": "De conformidad con la FHS, ¿en cuál de los directorios se encuentran las páginas de manual?",
    "answers": [
      2
    ],
    "objective": "104.7",
    "explanation": "La ubicación estándar de las páginas de manual compartidas es /usr/share/man.",
    "topic": 104,
    "choices": [
      "/opt/man/",
      "/usr/doc/",
      "/usr/share/man/",
      "/var/pkg/man",
      "/var/man/"
    ]
  },
  {
    "id": "daypo-101-015",
    "exam": "101",
    "sourceIndex": 15,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "5308120c16762d34fdde541ad97c1fe76e07418d84383257aa21d4f66222d2dd",
    "type": "written",
    "prompt": "¿Qué archivo en el sistema de archivos /proc enumera los parámetros pasados desde el gestor de arranque al kernel? (Especifique el nombre del archivo únicamente sin ninguna ruta).",
    "answers": [
      "cmdline"
    ],
    "objective": "101.2",
    "explanation": "/proc/cmdline contiene los argumentos con los que arrancó el kernel. Se pide únicamente cmdline.",
    "topic": 101
  },
  {
    "id": "daypo-101-016",
    "exam": "101",
    "sourceIndex": 16,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "6894b98235124ad9c6a8d077918a3d6ab18f41178e8e0538f3ed259d176c52d5",
    "type": "single",
    "prompt": "¿Cuál es el número de identificación del proceso de inicio en un sistema basado en System V?",
    "answers": [
      2
    ],
    "objective": "101.2",
    "explanation": "El proceso init del sistema tiene PID 1, también cuando ese papel lo desempeña systemd.",
    "topic": 101,
    "choices": [
      "-1",
      "0",
      "1",
      "Es diferente con cada reinicio.",
      "Está configurado en el nivel de ejecución actual."
    ]
  },
  {
    "id": "daypo-101-017",
    "exam": "101",
    "sourceIndex": 17,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "d9e84fa4e98b92d81876b670c63a15c072306abc02b84f096fff47e24abb4ca6",
    "type": "single",
    "prompt": "¿Qué demonio maneja los eventos de administración de energía en un sistema Linux?",
    "answers": [
      0
    ],
    "objective": "101.3",
    "explanation": "acpid recibe y procesa eventos ACPI de gestión de energía.",
    "topic": 101,
    "choices": [
      "acpid",
      "batteryd",
      "pwrmgntd",
      "psd",
      "inetd"
    ]
  },
  {
    "id": "daypo-101-018",
    "exam": "101",
    "sourceIndex": 18,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "5b2b111235225036941617f453f8adcc338bb8b1ea69a4d7dc3bba87cfef2f94",
    "type": "multiple",
    "prompt": "¿Cuál de las siguientes afirmaciones es cierta sobre la secuencia de inicio de una PC mediante BIOS? (Escoge dos.)",
    "answers": [
      0,
      3
    ],
    "objective": "101.2",
    "explanation": "El firmware BIOS inicia la secuencia al encender el equipo y permite configurar parte del arranque.",
    "topic": 101,
    "choices": [
      "Algunas partes del proceso de arranque se pueden configurar desde el BIOS.",
      "Linux no requiere la ayuda del BIOS para iniciar una computadora",
      "El proceso de inicio del BIOS se inicia solo si el almacenamiento secundario, como el disco duro, funciona",
      "El BIOS inicia el proceso de arranque después de encender la computadora.",
      "El BIOS se inicia cargando controladores de hardware desde el almacenamiento secundario, como el disco duro."
    ]
  },
  {
    "id": "daypo-101-019",
    "exam": "101",
    "sourceIndex": 19,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "83811455bfe9f9ec86f85139f85aef5c68411be8fa91b6ba322fe11ee6b51736",
    "type": "multiple",
    "prompt": "¿Qué es cierto con respecto al firmware UEFI? (Escoge dos.)",
    "answers": [
      0,
      1
    ],
    "objective": "101.2",
    "explanation": "UEFI puede interpretar tablas de particiones y leer sistemas de archivos admitidos para cargar ejecutables de arranque.",
    "topic": 101,
    "choices": [
      "Puede leer e interpretar tablas de particiones.",
      "Puede usar y leer ciertos sistemas de archivos.",
      "Almacena toda su configuración en la partición /boot/",
      "Se almacena en un área especial dentro de los metadatos GPT.",
      "Se carga desde una posición fija del disco de arranque."
    ]
  },
  {
    "id": "daypo-101-020",
    "exam": "101",
    "sourceIndex": 20,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "f765f2ce7d44550f0139e697bbcb9dc30b89adbbaf06c65aa5a0370cd5aedcdd",
    "type": "single",
    "prompt": "Un módulo del kernel defectuoso está causando problemas con una tarjeta de interfaz de red.\n¿Cuál de las siguientes acciones evita su carga automática mediante alias de modprobe?",
    "answers": [
      3
    ],
    "objective": "101.1",
    "explanation": "Una regla blacklist evita la selección automática por alias mediante modprobe; no impide una carga explícita ni una dependencia.",
    "topic": 101,
    "choices": [
      "Usar lsmod --remove --autoclean sin especificar el nombre de un módulo específico",
      "Usar modinfo -k seguido del nombre del módulo infractor",
      "Usando modprobe -r seguido del nombre del módulo infractor",
      "Agregar una línea de lista negra que incluya el nombre del módulo infractor al archivo /etc/modprobe.d/blacklist.conf",
      "Eliminar el directorio del módulo del kernel del sistema de archivos y recompilar el kernel, incluidos sus módulos"
    ],
    "correction": "Se acota blacklist a la autocarga mediante alias; no bloquea por sí solo toda carga explícita o por dependencia."
  },
  {
    "id": "daypo-101-021",
    "exam": "101",
    "sourceIndex": 21,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "8f0e8663f479caa5f4d1c33bdbe6d53be133691dce96f8c018e29e8fec2ba717",
    "type": "multiple",
    "prompt": "¿Cuándo se restablece el contenido de la memoria cíclica del núcleo? (Escoge dos.)",
    "answers": [
      0,
      4
    ],
    "objective": "101.2",
    "explanation": "dmesg --clear vacía el búfer; un nuevo arranque también comienza con un búfer nuevo.",
    "topic": 101,
    "choices": [
      "Cuando el búfer circular se restablece explícitamente usando el comando dmesg --clear",
      "Cuando el búfer circular se lee usando dmesg sin ningún parámetro adicional",
      "Cuando ha transcurrido un tiempo configurable, 15 minutos por defecto",
      "Cuando el kernel carga un módulo del kernel previamente descargado",
      "Cuando el sistema se apaga o reinicia"
    ]
  },
  {
    "id": "daypo-101-022",
    "exam": "101",
    "sourceIndex": 22,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "baeefa82d3cce455bc3a930565d82930c1775eb08d1cd55dbf96d80d5f9b5378",
    "type": "single",
    "prompt": "¿Cuál es el primer programa que inicia el kernel de Linux en el momento del arranque cuando se utiliza System V init?",
    "answers": [
      3
    ],
    "objective": "101.2",
    "explanation": "En el esquema tradicional de System V, /sbin/init es el programa que asume el papel de init.",
    "topic": 101,
    "choices": [
      "/lib/init.so",
      "/proc/sys/kernel/init",
      "/etc/rc.d/rcinit",
      "/sbin/init",
      "/boot/init"
    ]
  },
  {
    "id": "daypo-101-023",
    "exam": "101",
    "sourceIndex": 23,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "6f7d1352c2c2136a8e78816b874f6fdc0c194603ba5fcbbfa94be9a0cda738e3",
    "type": "single",
    "prompt": "Un paquete Debian crea varios archivos durante su instalación. ¿Cuál de los siguientes comandos busca paquetes que posean el archivo /etc/debian_version?",
    "answers": [
      3
    ],
    "objective": "102.4",
    "explanation": "dpkg -S busca qué paquete instalado registra una ruta concreta.",
    "topic": 102,
    "choices": [
      "apt-get search /etc/debian_version",
      "apt -r /etc/debian_version",
      "find /etc/debian_version -dpkg",
      "dpkg -S /etc/debian_version",
      "apt-file /etc/debian_version"
    ]
  },
  {
    "id": "daypo-101-024",
    "exam": "101",
    "sourceIndex": 24,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "e70458027b4ffff74d5cecc5d9582bb7da8226e28d18a863c68d72675b99bf11",
    "type": "single",
    "prompt": "¿Qué contiene la partición del sistema EFI?",
    "answers": [
      1
    ],
    "objective": "102.1",
    "explanation": "La partición ESP contiene ejecutables EFI, incluidos los cargadores de arranque.",
    "topic": 102,
    "choices": [
      "El sistema de archivos raíz de Linux",
      "Los cargadores de arranque y otros ejecutables EFI.",
      "El archivo de espacio swap por defecto",
      "Los binarios del shell por defecto de Linux",
      "Los directorios personales del usuario"
    ],
    "correction": "Se elimina «de la primera etapa», una descripción imprecisa del cargador UEFI."
  },
  {
    "id": "daypo-101-025",
    "exam": "101",
    "sourceIndex": 25,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "7ab97fc46b90577faf16a0ca42d657d31a2df163c53a45654847c6560d90afe1",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes directorios en un sistema Linux de 64 bits suele contener bibliotecas compartidas? (Escoge dos.)",
    "answers": [
      1,
      3
    ],
    "objective": "102.3",
    "explanation": "/lib64 y /usr/lib64 son ubicaciones habituales en distribuciones de 64 bits; otras usan directorios multiarch.",
    "topic": 102,
    "choices": [
      "~/.lib64/",
      "/usr/lib64/",
      "/var/lib64/",
      "/lib64/",
      "/opt/lib64/"
    ]
  },
  {
    "id": "daypo-101-026",
    "exam": "101",
    "sourceIndex": 26,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "859794f107ef3934d1f5058297817a45488b0055bd5fc8f3e78c81448f349799",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes archivos existe en una instalación de GRUB 2 para BIOS (plataforma i386-pc)? Elige 2",
    "answers": [
      1,
      3
    ],
    "objective": "102.2",
    "explanation": "grub.cfg contiene el menú generado; i386-pc/lvm.mod es un módulo de una instalación GRUB para BIOS.",
    "topic": 102,
    "choices": [
      "/boot/grub/stages/stage0",
      "/boot/grub/i386-pc/lvm.mod",
      "/boot/grub/fstab",
      "/boot/grub/grub.cfg",
      "/boot/grub/linux/vmlinuz"
    ],
    "correction": "Se especifica una instalación GRUB para BIOS: i386-pc no es la plataforma de un GRUB UEFI."
  },
  {
    "id": "daypo-101-027",
    "exam": "101",
    "sourceIndex": 27,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "3a56988e77ab91770d082efdb082926bc29d1cb34c953d70e2aa2f188de785d2",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos instala todos los paquetes con un nombre que termina con la cadena foo?",
    "answers": [
      3
    ],
    "objective": "102.5",
    "explanation": "Zypper instala el patrón *foo; las comillas impiden que la shell lo expanda antes.",
    "topic": 102,
    "choices": [
      "zypper get \"*foo\"",
      "ypper update \"foo?\"",
      "zypper force \"foo*\"",
      "zypper install \"*foo\"",
      "zypper add \".*foo\""
    ]
  },
  {
    "id": "daypo-101-028",
    "exam": "101",
    "sourceIndex": 28,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "e5ef0a5bce64fd980b10f824f102f5f41e307da0db958dd89cfef9c6f56d8237",
    "type": "multiple",
    "prompt": "¿Cuál de las siguientes propiedades de un sistema Linux se debe cambiar cuando se clona una máquina virtual? (Escoge dos.)",
    "answers": [
      2,
      4
    ],
    "objective": "102.6",
    "explanation": "Una copia de una VM necesita una identidad propia de máquina y claves de identidad SSH de servidor nuevas.",
    "topic": 102,
    "choices": [
      "El esquema de particiones.",
      "El sistema de archivos.",
      "El identificador de máquina de D-Bus.",
      "Los permisos de /root/.",
      "Las claves de identidad del servidor SSH."
    ],
    "correction": "Se traducen las opciones que permanecían en inglés, sin cambiar sus respuestas."
  },
  {
    "id": "daypo-101-029",
    "exam": "101",
    "sourceIndex": 29,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "0a934a6828c543daa93a2df24ac8098ef6f0ebee3817c10af893298896694829",
    "type": "single",
    "prompt": "En un sistema BIOS con discos /dev/sd*, ¿cuál de los siguientes comandos instala GRUB 2 en el registro de arranque maestro del tercer disco duro?",
    "answers": [
      4
    ],
    "objective": "102.2",
    "explanation": "En una instalación BIOS con discos sd*, /dev/sdc identifica el tercer disco; no una de sus particiones.",
    "topic": 102,
    "choices": [
      "grub2 install /dev/sdc",
      "grub-mkrescue /dev/sdc",
      "grub-mbrinstall /dev/sdc",
      "grub-setup /dev/sdc",
      "grub-install /dev/sdc"
    ],
    "correction": "Se especifica el arranque BIOS y la nomenclatura sd* para identificar sin ambigüedad el MBR del tercer disco."
  },
  {
    "id": "daypo-101-030",
    "exam": "101",
    "sourceIndex": 30,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "2f2ac8fc9badabc30f30ff16b98e611c44141a0701c08aa125b92c663e2760bc",
    "type": "single",
    "prompt": "¿Cuál de los siguientes tipos de partición se utiliza para los espacios de intercambio de Linux en una tabla de particiones MBR?",
    "answers": [
      1
    ],
    "objective": "104.1",
    "explanation": "82 es el identificador hexadecimal tradicional de una partición Linux swap en MBR; GPT usa otros identificadores.",
    "topic": 104,
    "choices": [
      "7",
      "82",
      "83",
      "8e",
      "fd"
    ],
    "correction": "Se acota el código 82 a una tabla MBR; no es el identificador de swap de GPT."
  },
  {
    "id": "daypo-101-031",
    "exam": "101",
    "sourceIndex": 31,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "6da05bae970f26854b461a2cfa2662ef822c35e1e992fe58b987a14ba637c4de",
    "type": "multiple",
    "prompt": "¿Qué hay de cierto respecto a la configuración de yum? (Escoge dos.)",
    "answers": [
      2,
      3
    ],
    "objective": "102.5",
    "explanation": "YUM admite archivos .repo separados y variables como $basearch y $releasever. No necesita reiniciar un supuesto yumd.",
    "topic": 102,
    "choices": [
      "Los cambios en la configuración del repositorio se activan después de ejecutar yum confupdate",
      "Los cambios en la configuración de yum se activan después de reiniciar el servicio yumd",
      "La configuración de los repositorios de paquetes se puede dividir en varios archivos.",
      "Las configuraciones del repositorio pueden incluir variables como $basearch o $releasever",
      "En caso de que /etc/yum.repos.d/ contenga archivos, se ignora /etc/yum.conf"
    ]
  },
  {
    "id": "daypo-101-032",
    "exam": "101",
    "sourceIndex": 32,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "9bb2cf1fde1b020bb499a643977bd1afd695cd84d4813c6f8486bc6319df25d8",
    "type": "multiple",
    "prompt": "En las versiones actuales de apt-get, ¿qué dos subcomandos equivalentes realizan la actualización completa resolviendo también cambios en las dependencias? (Escoge dos.)",
    "answers": [
      1,
      2
    ],
    "objective": "102.4",
    "explanation": "dist-upgrade y su alias full-upgrade actualizan resolviendo cambios de dependencias que pueden requerir instalar o retirar paquetes.",
    "topic": 102,
    "choices": [
      "auto-update",
      "dist-upgrade",
      "full-upgrade",
      "install",
      "update"
    ],
    "correction": "Las versiones actuales de apt-get reconocen también full-upgrade como alias de dist-upgrade. Se aceptan las dos opciones."
  },
  {
    "id": "daypo-101-033",
    "exam": "101",
    "sourceIndex": 33,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "973cad5bb9d79c447313a35abe8be2786da9fe6de488bbcae923a156ffe6eb8f",
    "type": "single",
    "prompt": "¿Qué comando desinstala un paquete pero conserva sus archivos de configuración en caso de que se reinstale el paquete?",
    "answers": [
      4
    ],
    "objective": "102.4",
    "explanation": "dpkg -r elimina el paquete, conservando su configuración registrada; -P solicita purgarla.",
    "topic": 102,
    "choices": [
      "dpkg -s pkgname",
      "dpkg -L pkgname",
      "dpkg -P pkgname",
      "dpkg -v pkgname",
      "dpkg -r pkgname"
    ]
  },
  {
    "id": "daypo-101-034",
    "exam": "101",
    "sourceIndex": 34,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "e719807e6174551f4f8d339be6599b35f04a0e1dd9c693af350d3a839ecd489f",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos enumera las dependencias del archivo del paquete RPM foo.rpm?",
    "answers": [
      0
    ],
    "objective": "102.5",
    "explanation": "-q consulta, -p indica un archivo RPM y -R enumera sus requisitos.",
    "topic": 102,
    "choices": [
      "rpm -qpR foo.rpm",
      "rpm -dep foo",
      "rpm -ld foo.rpm",
      "rpm -R foo.rpm",
      "rpm -pD foo"
    ]
  },
  {
    "id": "daypo-101-035",
    "exam": "101",
    "sourceIndex": 35,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "6a8c180a439809ec6cd69ea6d119c78a9596694ad843d262fb2abe928a485a48",
    "type": "single",
    "prompt": "¿Cuál es el valor máximo de nice que un usuario normal puede asignar a un proceso con el comando nice al ejecutar un nuevo proceso?",
    "answers": [
      2
    ],
    "objective": "103.6",
    "explanation": "19 es el valor nice máximo habitual y corresponde a menor prioridad relativa de CPU.",
    "topic": 103,
    "choices": [
      "9",
      "15",
      "19",
      "49",
      "99"
    ]
  },
  {
    "id": "daypo-101-036",
    "exam": "101",
    "sourceIndex": 36,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "157d44f30e7722b13c6ca6b60352b031733e15d22144aafc3c6d14936ac44d8e",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes comandos enumera todos los archivos y directorios dentro del directorio /tmp/ y sus subdirectorios que son propiedad del usuario raíz? (Escoge dos.)",
    "answers": [
      0,
      3
    ],
    "objective": "103.3",
    "explanation": "find -user root selecciona los archivos de root. Sin una acción explícita, find imprime las coincidencias.",
    "topic": 103,
    "choices": [
      "find /tmp -user root -print",
      "find -path /tmp -uid root",
      "find /tmp -uid root -print",
      "find /tmp -user root",
      "find -path /tmp -user root -print"
    ]
  },
  {
    "id": "daypo-101-037",
    "exam": "101",
    "sourceIndex": 37,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "17a55bf110dc77b154f299a465f6bf0aa46985e0e1452a0e1938aa81345c35f7",
    "type": "multiple",
    "prompt": "¿Cuáles de los siguientes son operadores de redirección de flujo válidos dentro de Bash? (Escoge dos.)",
    "answers": [
      0,
      4
    ],
    "objective": "103.4",
    "explanation": "< redirige entrada y 2>&1 copia en el descriptor 2 el destino que tenga el descriptor 1.",
    "topic": 103,
    "choices": [
      "<",
      "#>",
      "%>",
      ">>>",
      "2>&1"
    ]
  },
  {
    "id": "daypo-101-038",
    "exam": "101",
    "sourceIndex": 38,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "5d49c3c1f16472c76e5c198d4bc926c67bc89120b18e59073aa867f3efc9b19e",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos vi elimina dos líneas, la línea actual y la siguiente?",
    "answers": [
      2
    ],
    "objective": "103.8",
    "explanation": "El contador 2 ante dd elimina dos líneas desde la línea actual.",
    "topic": 103,
    "choices": [
      "d2",
      "2d",
      "2dd",
      "dd2",
      "de12"
    ]
  },
  {
    "id": "daypo-101-039",
    "exam": "101",
    "sourceIndex": 39,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "a7c51eb6ca75947bbb78be9783ed237a105c0b20d6ab8a3cdee569b1010bd700",
    "type": "single",
    "prompt": "El comando dbmaint & se usó para ejecutar dbmaint en segundo plano. Sin embargo, dbmaint finaliza después de cerrar sesión en el sistema. ¿Qué invocación alternativa de dbmaint permite que dbmaint continúe ejecutándose incluso cuando el usuario que ejecuta el programa cierra sesión?",
    "answers": [
      2
    ],
    "objective": "103.5",
    "explanation": "nohup hace que el programa ignore SIGHUP; & solicita ejecutarlo en segundo plano.",
    "topic": 103,
    "choices": [
      "job -b dmaint",
      "dbmaint &>/dev/pts/null",
      "nohup dbmaint &",
      "bg dbmaint",
      "wait dbmaint"
    ]
  },
  {
    "id": "daypo-101-040",
    "exam": "101",
    "sourceIndex": 40,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "b8e6020d5f234c8ef7e9483dabd9733d2741ab495eb0612ac8eabbd5572483c0",
    "type": "multiple",
    "prompt": "Desde un shell Bash, ¿cuál de los siguientes comandos ejecuta directamente las instrucciones del archivo /usr/local/bin/runme.sh sin iniciar un subshell? (Escoge dos.)",
    "answers": [
      0,
      3
    ],
    "objective": "103.1",
    "explanation": "source y el punto ejecutan el archivo en la shell actual, por lo que pueden modificar sus variables.",
    "topic": 103,
    "choices": [
      "source /usr/local/bin/runme.sh",
      "/usr/local/bin/runme.sh",
      "/bin/bash /usr/local/bin/runme.sh",
      ". /usr/local/bin/runme.sh",
      "run /usr/local/bin/runme.sh"
    ]
  },
  {
    "id": "daypo-101-041",
    "exam": "101",
    "sourceIndex": 41,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "0b37c9813b1ef3195932f91546be3363f6e67d4f9ac19816a77f107f4d8ad0de",
    "type": "written",
    "prompt": "¿Qué programa ejecuta un comando en intervalos específicos y actualiza la visualización de la salida del programa? (Especifique SÓLO el comando sin ruta ni parámetros).",
    "answers": [
      "watch"
    ],
    "objective": "103.5",
    "explanation": "watch repite una orden y actualiza la visualización de su salida.",
    "topic": 103
  },
  {
    "id": "daypo-101-042",
    "exam": "101",
    "sourceIndex": 42,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "62843f582638506fada2b87f218a89eb641f44d5cccf137fe35e993ae2006d6c",
    "type": "single",
    "prompt": "Inmediatamente después de eliminar 3 líneas de texto en vi y mover el cursor a una línea diferente, ¿qué comando de un solo carácter insertará el contenido eliminado debajo de la línea actual?",
    "answers": [
      1
    ],
    "objective": "103.8",
    "explanation": "p pega el contenido del registro después del cursor o debajo de la línea cuando el registro contiene líneas.",
    "topic": 103,
    "choices": [
      "i",
      "p",
      "P",
      "U",
      "u"
    ]
  },
  {
    "id": "daypo-101-043",
    "exam": "101",
    "sourceIndex": 43,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "2b0a4f549dacbd16c64bd7d8fb48b2d1ea8193a07a8bfd4c6c57a4ed7b3ec850",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos cambia todos los saltos de línea CR-LF en el archivo de texto userlist.txt a saltos de línea LF estándar de Linux y almacena el resultado en newlist.txt?",
    "answers": [
      0
    ],
    "objective": "103.2",
    "explanation": "tr -d elimina los retornos de carro; las redirecciones separan el archivo de entrada del archivo de salida.",
    "topic": 103,
    "choices": [
      "tr -d '\\r' < userlist.txt > newlist.txt",
      "tr -c '\\n\\r' '' <newlist.txt> userlist.txt",
      "tr '\\r\\n' '' <userlist.txt> newlist.txt",
      "tr '\\r' '\\n' userlist.txt newlist.txt",
      "tr -s '/^M/^J/' userlist.txt newlist.txt"
    ]
  },
  {
    "id": "daypo-101-044",
    "exam": "101",
    "sourceIndex": 44,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "dac01779376db2fdf82b33464a0c08681ac641b3dd242b4fffc3d0dd9a16ad26",
    "type": "single",
    "prompt": "Dado el siguiente flujo de entrada:\ntxt1.txt\natxt.txt\ntxtB.txt\n\n¿Cuál de las siguientes expresiones regulares convierte este flujo de entrada en el siguiente flujo de salida?\ntxt1.bak.txt\natxt.bak.txt\ntxtB.bak.txt",
    "answers": [
      2
    ],
    "objective": "103.7",
    "explanation": "El patrón txt$ solo coincide con txt al final; se sustituye por bak.txt.",
    "topic": 103,
    "choices": [
      "s/^.txt/.bak/",
      "s/txt/bak.txt/",
      "s/txt$/bak.txt/",
      "s/^txt$/.bak^/",
      "s/[.txt]/.bak$1/"
    ]
  },
  {
    "id": "daypo-101-045",
    "exam": "101",
    "sourceIndex": 45,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "e92b8d4e07c6312c383634b4a47d444aaf17d66d653bb8120373b90a55485a04",
    "type": "single",
    "prompt": "¿Qué comando se debe ingresar antes de salir de vi para guardar el archivo actual como filea.txt?",
    "answers": [
      3
    ],
    "objective": "103.8",
    "explanation": ":w filea.txt escribe el contenido con ese nombre. No obliga a salir del editor.",
    "topic": 103,
    "choices": [
      "%s filea.txt",
      "%w filea.txt",
      ":save filea.txt",
      ":w filea.txt",
      ":s filea.txt"
    ]
  },
  {
    "id": "daypo-101-046",
    "exam": "101",
    "sourceIndex": 46,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "3502d3e96a95ec3f8509712a937b632b6ba2cd49e2a092220c43d67a738cbb7d",
    "type": "single",
    "prompt": "¿Cuál de las siguientes señales se envía a un proceso cuando se presiona la combinación de teclas Ctrl+C en el teclado?",
    "answers": [
      4
    ],
    "objective": "103.5",
    "explanation": "Ctrl+C solicita interrupción mediante SIGINT al grupo de procesos de primer plano.",
    "topic": 103,
    "choices": [
      "SIGTERM",
      "SIGCONT",
      "SIGSTOP",
      "SIGKILL",
      "SIGINT"
    ]
  },
  {
    "id": "daypo-101-047",
    "exam": "101",
    "sourceIndex": 47,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "602847364ce54a48d7c3df7dea43e0bcc66277698741b54492ed3d2c0322af95",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos muestra el resultado del comando foo en la pantalla y también lo escribe en un archivo llamado /tmp/foodata?",
    "answers": [
      3
    ],
    "objective": "103.4",
    "explanation": "tee copia la entrada tanto a la salida estándar como al archivo indicado.",
    "topic": 103,
    "choices": [
      "foo | less /tmp/foodata",
      "foo | cp /tmp/foodata",
      "foo > /tmp/foodata",
      "foo | tee /tmp/foodata",
      "foo > stdout >> /tmp/foodata"
    ]
  },
  {
    "id": "daypo-101-048",
    "exam": "101",
    "sourceIndex": 48,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "f0943adb502f1e84be4c342598ea999cb8a92946baca0f9ff96c3f85033e41e7",
    "type": "single",
    "prompt": "¿Qué resultado se mostrará cuando el usuario fred ejecute el siguiente comando? echo 'fred $USER'",
    "answers": [
      3
    ],
    "objective": "103.1",
    "explanation": "Las comillas simples conservan $USER literalmente: no se sustituye por el nombre del usuario.",
    "topic": 103,
    "choices": [
      "fred fred",
      "fred /home/fred/",
      "'fred $USER'",
      "fred $USER",
      "'fred fred'"
    ],
    "correction": "Se restaura $USER en el comando: el original traducía el nombre de variable, pero conservaba $USER en las opciones."
  },
  {
    "id": "daypo-101-049",
    "exam": "101",
    "sourceIndex": 49,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "b751315e21474b7216e130a32433f3a82752167099fb2468b8f23808a2e1da5e",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos muestra la ruta al archivo ejecutable que se ejecutaría cuando se invoca el comando foo?",
    "answers": [
      4
    ],
    "objective": "104.7",
    "explanation": "which busca el ejecutable en PATH; en Bash, type también permite conocer cómo se interpreta un nombre.",
    "topic": 104,
    "choices": [
      "lsattr foo",
      "apropos foo",
      "locate foo",
      "whatis foo",
      "which foo"
    ]
  },
  {
    "id": "daypo-101-050",
    "exam": "101",
    "sourceIndex": 50,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "a93b014b6e8dfbbea0bd4c92492c683c8ae538fa55df6d8e8f339869dea41002",
    "type": "single",
    "prompt": "Al redirigir la salida de find al comando xargs, ¿qué opción de búsqueda es útil si los nombres de archivos contienen espacios?",
    "answers": [
      4
    ],
    "objective": "103.3",
    "explanation": "find -print0 usa separadores nulos; para procesarlos correctamente se combina con xargs -0.",
    "topic": 103,
    "choices": [
      "-rep-space",
      "-printnul",
      "-nospace",
      "-ignore-space",
      "-print0"
    ]
  },
  {
    "id": "daypo-101-051",
    "exam": "101",
    "sourceIndex": 51,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "90a5f6ff87341636da9012ff736b5ad749002dbadc1107211a65e90f42ed393c",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes comandos se puede utilizar para determinar cuánto tiempo ha estado funcionando el sistema? (Escoge dos.)",
    "answers": [
      0,
      4
    ],
    "objective": "103.5",
    "explanation": "uptime informa del tiempo desde el arranque; top también lo muestra en su cabecera habitual.",
    "topic": 103,
    "choices": [
      "uptime",
      "up",
      "time --up",
      "uname -u",
      "top"
    ]
  },
  {
    "id": "daypo-101-052",
    "exam": "101",
    "sourceIndex": 52,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "3b20ebc1cfb3d0e1e363b18bff1b81cccbf5a313a0f6edf035e819a65180c374",
    "type": "single",
    "prompt": "¿Qué ocurre al ejecutar ls > archivos si todavía no existe el archivo llamado archivos?",
    "answers": [
      1
    ],
    "objective": "103.4",
    "explanation": "La redirección > crea el archivo de destino y guarda en él la salida estándar.",
    "topic": 103,
    "choices": [
      "La salida de ls se imprime en la terminal.",
      "Se crea el archivo archivos con la salida de ls.",
      "Se muestra un mensaje de error y ls no se ejecuta",
      "Los archivos de comando se ejecutan y reciben la salida de ls",
      "Cualquier salida de ls se descarta"
    ],
    "correction": "Se aclara que archivos es el nombre del fichero de destino, no una referencia a varios archivos."
  },
  {
    "id": "daypo-101-053",
    "exam": "101",
    "sourceIndex": 53,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "95fa82dc290440f7d3c4e6bfede3198d86769265ef72789afdeff76632a76b89",
    "type": "single",
    "prompt": "¿Cuál de los siguientes archivos, ubicados en el directorio de inicio de un usuario, contiene el historial de Bash?",
    "answers": [
      3
    ],
    "objective": "103.1",
    "explanation": "Bash utiliza normalmente ~/.bash_history; HISTFILE permite cambiar esa ubicación.",
    "topic": 103,
    "choices": [
      ".bashrc_history",
      ".bash_histfile",
      ".history",
      ".bash_history",
      ".history_bash"
    ]
  },
  {
    "id": "daypo-101-054",
    "exam": "101",
    "sourceIndex": 54,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "00b8144333236964292a1c4023654893a98227d5e73438b3ab6890b34accf5dc",
    "type": "multiple",
    "prompt": "¿Qué comodines coincidirán con los siguientes nombres de archivos? (Escoge dos.)\nttyS0\nttyS1\nttyS2",
    "answers": [
      1,
      3
    ],
    "objective": "103.1",
    "explanation": "Ambos patrones incluyen ttyS0, ttyS1 y ttyS2; pueden coincidir además con otros nombres.",
    "topic": 103,
    "choices": [
      "ttyS[1-5]",
      "tty?[0-5]",
      "tty*2",
      "tty[A-Z][012]",
      "tty[Ss][02]"
    ]
  },
  {
    "id": "daypo-101-055",
    "exam": "101",
    "sourceIndex": 55,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "adcad151ceb406b4568d98bd8649144c128471114e83c233c060ca4f2fb1434d",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos muestra el contenido de un archivo tar comprimido con gzip?",
    "answers": [
      4
    ],
    "objective": "103.3",
    "explanation": "tar ztf lista el archivo comprimido con gzip, sin extraer su contenido.",
    "topic": 103,
    "choices": [
      "gzip archive.tgz | tar xvf -",
      "tar -fzt archive.tgz",
      "gzip -d archive.tgz | tar tvf -",
      "tar cf archive.tgz",
      "tar ztf archive.tgz"
    ]
  },
  {
    "id": "daypo-101-056",
    "exam": "101",
    "sourceIndex": 56,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "3a9dd69aad4636a8228afdfc14a8659716901da87710ed1a55c1f1e87cb949ad",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos redirige la salida de ls al error estándar?",
    "answers": [
      2
    ],
    "objective": "103.4",
    "explanation": ">&2 duplica el destino del descriptor 2 sobre la salida estándar.",
    "topic": 103,
    "choices": [
      "ls >-1",
      "ls <<ERR",
      "ls >&2",
      "ls >>2",
      "ls |error"
    ]
  },
  {
    "id": "daypo-101-057",
    "exam": "101",
    "sourceIndex": 57,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "24c246f95c6276f4a73c0db833e2e31015242c0690b4c458b950987153df0781",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos imprime una lista de nombres de usuario (primera columna) y su grupo principal (cuarta columna) del archivo /etc/passwd?",
    "answers": [
      1
    ],
    "objective": "103.2",
    "explanation": "cut selecciona los campos 1 y 4 utilizando los dos puntos como separador.",
    "topic": 103,
    "choices": [
      "fmt -f 1,4 /etc/passwd",
      "cut -d : -f 1,4 /etc/passwd",
      "sort -t : -k 1,4 /etc/passwd",
      "paste -f 1,4 /etc/passwd",
      "split -c 1,4 /etc/passwd"
    ]
  },
  {
    "id": "daypo-101-058",
    "exam": "101",
    "sourceIndex": 58,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "f4df4fb0bbf787acc48de3c03eb73c7f12586d73b36f59452054ea46faba578b",
    "type": "single",
    "prompt": "¿Cuál de las siguientes expresiones regulares representa una sola letra mayúscula?",
    "answers": [
      1
    ],
    "objective": "103.7",
    "explanation": "[A-Z] expresa una letra mayúscula en la interpretación habitual del ejercicio; las clases dependen de la configuración regional.",
    "topic": 103,
    "choices": [
      ":UPPER:",
      "[A-Z]",
      "!a-z",
      "%C",
      "{AZ}"
    ]
  },
  {
    "id": "daypo-101-059",
    "exam": "101",
    "sourceIndex": 59,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "fb4c187b7e8b085ae3b020442d0704d21870af70606c2a81ef7139038aa00cef",
    "type": "written",
    "prompt": "¿Qué comando se utiliza para iniciar otro comando con un nivel agradable determinado? (Especifique SÓLO el comando sin ruta ni parámetros).",
    "answers": [
      "nice"
    ],
    "objective": "103.6",
    "explanation": "nice inicia un comando con un ajuste de prioridad; renice modifica procesos existentes.",
    "topic": 103
  },
  {
    "id": "daypo-101-060",
    "exam": "101",
    "sourceIndex": 60,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "69f851177e320ebd697cfacd6f2fafff12e81b7e0cfaebecc6f1d4177cada5fe",
    "type": "single",
    "prompt": "Dado un archivo de registro loga.log con marcas de tiempo del formato DD/MM/AAAA:hh:mm:ss, ¿qué comando filtra todas las entradas de registro en el período de tiempo entre las 8:00 am y las 8:59 am?",
    "answers": [
      4
    ],
    "objective": "103.7",
    "explanation": "El patrón busca el tramo :08: seguido de minutos y segundos numéricos en las marcas de tiempo dadas.",
    "topic": 103,
    "choices": [
      "grep -E ':08:[09]+:[09]+' loga.log",
      "grep -E ':08:[00]+' loga.log",
      "grep -E loga.log ':08:[0-9]+:[0-9]+'",
      "grep loga.log ':08:[0-9]:[0-9]'",
      "grep -E ':08:[0-9]+:[0-9]+' loga.log"
    ]
  },
  {
    "id": "daypo-101-061",
    "exam": "101",
    "sourceIndex": 61,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "2e15c65c34c27d76ec0ab80f853aa726859fcf7bb22cdd674eff14934aec3075",
    "type": "multiple",
    "prompt": "En lugar de proporcionar un dispositivo explícito en /etc/fstab para el montaje, ¿qué otras opciones se pueden utilizar para identificar la partición deseada? (Escoge dos.)",
    "answers": [
      0,
      4
    ],
    "objective": "104.3",
    "explanation": "LABEL y UUID permiten identificar sistemas de archivos sin depender solo del nombre /dev/sd*.",
    "topic": 104,
    "choices": [
      "LABEL",
      "ID",
      "FIND",
      "NAME",
      "UUID"
    ]
  },
  {
    "id": "daypo-101-062",
    "exam": "101",
    "sourceIndex": 62,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "7edf33e004c5b87b762de171f23b4d13a99c09316e6577e69f0337a193230cca",
    "type": "single",
    "prompt": "Un repositorio yum puede declarar conjuntos de paquetes relacionados. ¿Qué comando yum instala todos los paquetes que pertenecen al grupo admintools?",
    "answers": [
      2
    ],
    "objective": "102.5",
    "explanation": "yum groupinstall instala los paquetes del grupo solicitado según los metadatos del repositorio.",
    "topic": 102,
    "choices": [
      "yum pkgsel --install admintools",
      "yum install admintools/*",
      "yum groupinstall admintools",
      "yum taskinstall admintools",
      "yum collection install admintools"
    ]
  },
  {
    "id": "daypo-101-063",
    "exam": "101",
    "sourceIndex": 63,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "bb3eb54f5d3314592a814ee0da12fc27fb3664fa2ba5dae4c6a21f65dbc074e1",
    "type": "written",
    "prompt": "¿Qué directorio contiene archivos de configuración para repositorios yum adicionales? (Especifique la ruta completa al directorio)",
    "answers": [
      "/etc/yum.repos.d/",
      "/etc/yum.repos.d"
    ],
    "objective": "102.5",
    "explanation": "Los repositorios adicionales de YUM se configuran habitualmente en archivos .repo de /etc/yum.repos.d.",
    "topic": 102
  },
  {
    "id": "daypo-101-064",
    "exam": "101",
    "sourceIndex": 64,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "bddeb302eb0ea0d976511094f9d0e847b0472f5b452a3ad564f96eb6e5b784bc",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos instala los archivos de arranque de GRUB en los sistemas de archivos actualmente activos y el cargador de arranque en el MBR del primer disco de un sistema BIOS?",
    "answers": [
      0
    ],
    "objective": "102.2",
    "explanation": "Para instalar GRUB en el MBR se indica el disco /dev/sda, no /dev/sda1.",
    "topic": 102,
    "choices": [
      "grub-install /dev/sda",
      "grub-install /dev/sda1",
      "grub-install current /dev/sda0",
      "grub-install /dev/sda0",
      "grub-install current /dev/sda1"
    ],
    "correction": "Se corrige «primera partición» por MBR del disco: la respuesta /dev/sda instala en el disco, no en /dev/sda1."
  },
  {
    "id": "daypo-101-065",
    "exam": "101",
    "sourceIndex": 65,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "13f4509ea5d7fa54a33681c7f5af98c2984d03b6dd2bcca66009879ffeb58b6d",
    "type": "multiple",
    "prompt": "¿Cuáles de los siguientes archivos se encuentran en el sistema de archivos /boot/? (Escoge dos.)",
    "answers": [
      0,
      3
    ],
    "objective": "102.1",
    "explanation": "/boot contiene habitualmente imágenes del kernel e imágenes iniciales initramfs o initrd.",
    "topic": 102,
    "choices": [
      "Imágenes del kernel de Linux",
      "Binarios del shell Bash",
      "unidades de servicio y destino de systemd",
      "Imágenes iniciales del disco RAM",
      "binarios fsck"
    ]
  },
  {
    "id": "daypo-101-066",
    "exam": "101",
    "sourceIndex": 66,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "22126a0523bbbc50faa52ab1bb29c89d652111e15d54fb1dff1c399083a66057",
    "type": "single",
    "prompt": "¿Qué archivo define las ubicaciones de red desde donde el administrador de paquetes de Debian descarga paquetes de software?",
    "answers": [
      4
    ],
    "objective": "102.4",
    "explanation": "sources.list es la configuración tradicional de repositorios APT; también existen fragmentos en sources.list.d.",
    "topic": 102,
    "choices": [
      "/etc/dpkg/dpkg.cfg",
      "/etc/apt/apt.conf.d",
      "/etc/apt/apt.conf",
      "/etc/dpkg/dselect.cfg",
      "/etc/apt/sources.list"
    ]
  },
  {
    "id": "daypo-101-067",
    "exam": "101",
    "sourceIndex": 67,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "65988c3aa90f58d3b9946afb6dcd9438122bf386a276da635b5b926fa0159865",
    "type": "single",
    "prompt": "Al eliminar un paquete en un sistema mediante la administración de paquetes dedpkg, ¿Qué opción de dpkg garantiza que también se eliminen los archivos deconfiguración?",
    "answers": [
      1
    ],
    "objective": "102.4",
    "explanation": "--purge retira el paquete y sus archivos de configuración gestionados por dpkg.",
    "topic": 102,
    "choices": [
      "--clean",
      "--purge",
      "--vacuum",
      "--remove",
      "--declare"
    ]
  },
  {
    "id": "daypo-101-068",
    "exam": "101",
    "sourceIndex": 68,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "5652cb43f2c3243cb2c6bd7de41e11e0dd1d46545b33bc9e3e6dc9847fe09e22",
    "type": "multiple",
    "prompt": "¿Cuál de las siguientes afirmaciones es correcta al comparar contenedores de Linux con máquinas virtuales tradicionales (por ejemplo, LXC frente a KVM)? (Elige tres.)",
    "answers": [
      0,
      1,
      3
    ],
    "objective": "102.6",
    "explanation": "Los contenedores comparten el kernel; la virtualización completa proporciona hardware virtual para otro sistema operativo.",
    "topic": 102,
    "choices": [
      "Los contenedores son un método de virtualización ligero en el que el kernel controla el aislamiento de procesos y la gestión de recursos.",
      "Las máquinas totalmente virtualizadas pueden ejecutar cualquier sistema operativo para una arquitectura de hardware específica dentro de la máquina virtual.",
      "Los contenedores están completamente desacoplados del hardware físico del sistema host y solo pueden utilizar dispositivos de hardware virtuales emulados.",
      "El entorno invitado para máquinas totalmente virtualizadas lo crea un hipervisor que proporciona dispositivos de hardware virtuales y emulados.",
      "Los contenedores en el mismo host pueden usar diferentes sistemas operativos, ya que el hipervisor del contenedor crea una ejecución del kernel separada."
    ]
  },
  {
    "id": "daypo-101-069",
    "exam": "101",
    "sourceIndex": 69,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "aa5ac55b68442802a426d078be696c3cfe492c37d78c7e5f65bc804075141a7d",
    "type": "single",
    "prompt": "La instalación de un paquete Debian local falló debido a dependencias no satisfechas. ¿Cuál de los siguientes comandos instala las dependencias que faltan y completa la instalación del paquete interrumpido?",
    "answers": [
      4
    ],
    "objective": "102.4",
    "explanation": "apt-get install -f intenta reparar dependencias incumplidas y completar la instalación pendiente.",
    "topic": 102,
    "choices": [
      "dpkg --fix --all",
      "apt-get autoinstall",
      "dpkg-reconfigure --all",
      "apt-get all",
      "apt-get install -f"
    ]
  },
  {
    "id": "daypo-101-070",
    "exam": "101",
    "sourceIndex": 70,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "85bdb82ebb17eadfb8aabb4ec18b5b7d27cb4b695c7a5d3714738cc0179f5b03",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos enumera todos los paquetes actualmente instalados cuando se usa la administración de paquetes RPM?",
    "answers": [
      4
    ],
    "objective": "102.5",
    "explanation": "rpm --query --all, equivalente a rpm -qa, consulta todos los paquetes instalados en la base RPM.",
    "topic": 102,
    "choices": [
      "yum --query --all",
      "yum --list --installed",
      "rpm --query --list",
      "rpm --list --installed",
      "rpm --query --all"
    ]
  },
  {
    "id": "daypo-101-071",
    "exam": "101",
    "sourceIndex": 71,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "d13a7115a28e44ee7a0ddbb6b1ca8c360353c0008e67d9a20d6ff6142dec0027",
    "type": "multiple",
    "prompt": "¿Cuáles de los siguientes comandos son válidos en el archivo de configuración de GRUB 2? (Escoge dos.)",
    "answers": [
      0,
      3
    ],
    "objective": "102.2",
    "explanation": "menuentry define entradas de menú e insmod carga módulos de GRUB.",
    "topic": 102,
    "choices": [
      "menuentry",
      "uefi",
      "pxe-ifconfig",
      "insmod",
      "kpartx"
    ]
  },
  {
    "id": "daypo-101-072",
    "exam": "101",
    "sourceIndex": 72,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "7b7e8330e60428507f4eeb063e27728114a4d4ba9eddc37c3f2a00af34a6c6ee",
    "type": "single",
    "prompt": "¿Cuál es el propósito del comando ldd?",
    "answers": [
      0
    ],
    "objective": "102.3",
    "explanation": "ldd muestra las bibliotecas compartidas requeridas; debe usarse solo con ejecutables de confianza.",
    "topic": 102,
    "choices": [
      "Lista que librerías compartidas necesita ejecutar un comando.",
      "Instala y actualiza las librerías compartidas instaladas.",
      "Convierte un binario enlazado dinámicamente en binario estático.",
      "Define que versión de una librería debe usarse por defecto.",
      "Ejecuta un binario con una ruta de búsqueda de librería alternativa."
    ]
  },
  {
    "id": "daypo-101-073",
    "exam": "101",
    "sourceIndex": 73,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "af06f6a68a706f31e9b121ab15846d5f305a02575ebfcf7da41e6e68093c03c7",
    "type": "multiple",
    "prompt": "¿Para qué se puede utilizar el Administrador de volúmenes lógicos (LVM)? (Elige tres.)",
    "answers": [
      0,
      1,
      2
    ],
    "objective": "102.1",
    "explanation": "LVM permite crear y eliminar volúmenes, modificar sus tamaños y crear instantáneas compatibles.",
    "topic": 102,
    "choices": [
      "Para crear instantáneas.",
      "Cambiar dinámicamente el tamaño de los volúmenes lógicos.",
      "Para crear o eliminar dinámicamente volúmenes lógicos.",
      "Para crear matrices RAID 9.",
      "Para cifrar volúmenes lógicos."
    ]
  },
  {
    "id": "daypo-101-074",
    "exam": "101",
    "sourceIndex": 74,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "a59a6ed33c76c47d274ceb7664e5c29935a7d48cd76caf27f1dfa57d139f3a19",
    "type": "multiple",
    "prompt": "¿Cuáles son las principales diferencias entre las tablas de particiones GPT y MBR con respecto al número máximo y tamaño de particiones? Suponga sectores de 512 bytes. (Escoge dos.)",
    "answers": [
      1,
      3
    ],
    "objective": "102.1",
    "explanation": "Con sectores de 512 bytes, MBR ronda los 2 TiB. GPT admite direcciones mayores y suele prepararse con 128 entradas.",
    "topic": 102,
    "choices": [
      "MBR puede manejar tamaños de partición de hasta 4 TB, mientras que GPT admite tamaños de partición de hasta 128 ZB.",
      "De forma predeterminada, GPT puede administrar hasta 128 particiones, mientras que MBR solo admite cuatro particiones primarias.",
      "De forma predeterminada, GPT puede administrar hasta 64 particiones, mientras que MBR solo admite 16 particiones primarias",
      "MBR puede manejar tamaños de partición de hasta 2,2 TB, mientras que GPT admite tamaños de hasta 9,4 ZB.",
      "anto GPT como MBR admiten hasta cuatro particiones primarias, cada una con hasta 4096 TB"
    ],
    "correction": "Se explicita el supuesto de sectores de 512 bytes usado en los tamaños indicados; 128 es una cantidad habitual de entradas GPT, no un máximo universal."
  },
  {
    "id": "daypo-101-075",
    "exam": "101",
    "sourceIndex": 75,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "7203e43812a332cb368f5c58efda464561eea42c8ebe31e2484fb7307ac557a2",
    "type": "multiple",
    "prompt": "Un software de copia de seguridad utiliza en gran medida enlaces duros entre archivos que no se han modificado entre dos\nejecuciones de respaldo. ¿Qué beneficios se obtienen gracias a estos enlaces duros? (Escoge dos.)",
    "answers": [
      3,
      4
    ],
    "objective": "104.6",
    "explanation": "Los enlaces duros reutilizan los mismos datos e inodos, evitando duplicar contenido en una copia de seguridad.",
    "topic": 104,
    "choices": [
      "Las copias de seguridad antiguas se pueden mover a medios de copia de seguridad lentos, como cintas, y al mismo tiempo seguir sirviendo como destino de enlace físico en las nuevas copias de seguridad.",
      "La copia de seguridad se ejecuta más rápido porque los enlaces físicos son operaciones asincrónicas, lo que pospone la operación de copia para un momento posterior.",
      "Se garantiza que la copia de seguridad no tendrá costo porque un archivo vinculado no se puede modificar después de su creación.",
      "La copia de seguridad consume menos espacio porque los enlaces físicos apuntan a los mismos datos en el disco en lugar de almacenar copias redundantes",
      "La copia de seguridad se ejecuta más rápido porque, en lugar de copiar los datos de cada archivo, los enlaces físicos solo cambian los metadatos del sistema de archivos."
    ]
  },
  {
    "id": "daypo-101-076",
    "exam": "101",
    "sourceIndex": 76,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "6161ccaca35726495e246442ba940e29a5b114add6a7723f61988b84e78b9fc8",
    "type": "written",
    "prompt": "¿Qué archivo del sistema de archivos /proc/ contiene una lista de todos los dispositivos actualmente montados? (Especifique el nombre completo del archivo, incluida la ruta).",
    "answers": [
      "/proc/self/mounts",
      "/proc/mounts"
    ],
    "objective": "104.3",
    "explanation": "/proc/self/mounts enumera los montajes del proceso. /proc/mounts suele ser un enlace a esa misma información.",
    "topic": 104,
    "correction": "Se acepta también /proc/mounts, enlace habitual a /proc/self/mounts."
  },
  {
    "id": "daypo-101-077",
    "exam": "101",
    "sourceIndex": 77,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "fd5b386c8d748bb0de9757664e4f78b2fdd4df83283b72114928f652bfea1607",
    "type": "single",
    "prompt": "¿Cuántos campos tiene una entrada completa de /etc/fstab, incluyendo los campos dump y pass?",
    "answers": [
      3
    ],
    "objective": "104.3",
    "explanation": "Una entrada completa de fstab tiene seis campos; algunas implementaciones admiten omitir los dos últimos con valores predeterminados.",
    "topic": 104,
    "choices": [
      "3",
      "4",
      "5",
      "6",
      "7"
    ],
    "correction": "Se pregunta por la entrada completa de seis campos: algunas implementaciones aceptan omitir dump y pass."
  },
  {
    "id": "daypo-101-078",
    "exam": "101",
    "sourceIndex": 78,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "397b7d261911ac8102f58a564221082f2995b9bc0e3284b942ad4be5e3373cc2",
    "type": "multiple",
    "prompt": "Ejecutar chmod 640 filea.txt como usuario normal no cambia los permisos que muestra ls -l para filea.txt. ¿Cuál podría ser la razón por la cual chmod no puede modificar los permisos? (Escoge dos.)",
    "answers": [
      0,
      1
    ],
    "objective": "104.5",
    "explanation": "Un usuario normal no cambia archivos ajenos. En un enlace simbólico, chmod actúa sobre el destino, no sobre el modo propio del enlace.",
    "topic": 104,
    "choices": [
      "filea.txt es propiedad de otro usuario y un usuario regular no puede cambiar los permisos del archivo de otro usuario.",
      "filea.txt es un enlace simbólico: su modo propio permanece fijo y chmod actúa sobre el destino.",
      "filea.txt tiene el sticky bit establecido y un usuario regular no puede eliminar estepermiso.",
      "filea.txt es un enlace duro del original, cuyos permisos se heredan y no se puedeconfigurar directamente",
      "filea.txt tiene el fijado el SetUID que impone la restricción de que solo el usuario rootpuede realizar cambios en el archivo."
    ],
    "correction": "Se aclara que chmod sigue el enlace simbólico y cambia su destino, no el modo propio que muestra ls -l para el enlace."
  },
  {
    "id": "daypo-101-079",
    "exam": "101",
    "sourceIndex": 79,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "9a265d9bf06b3ac86c98a0254e6834596d395283bc9ba3da5d1785417346031d",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes sistemas de archivos de Linux asigna previamente una cantidad fija de inodos al crear un nuevo sistema de archivos en lugar de generarlos según sea necesario? (Escoge dos)",
    "answers": [
      1,
      3
    ],
    "objective": "104.2",
    "explanation": "ext2 y ext3 fijan la cantidad de inodos al crear el sistema de archivos; XFS puede asignarlos dinámicamente.",
    "topic": 104,
    "choices": [
      "JFS",
      "ext3",
      "XFS",
      "ext2",
      "procfs"
    ]
  },
  {
    "id": "daypo-101-080",
    "exam": "101",
    "sourceIndex": 80,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "8d5074df9305e5c96d0086b4fb0e8186ee2b9189cfd4028f6fd7abe488cd925a",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos establece el permiso SetUID en el ejecutable /bin/foo?",
    "answers": [
      0
    ],
    "objective": "104.5",
    "explanation": "El dígito especial 4 activa SUID; 755 define los permisos ordinarios del ejecutable.",
    "topic": 104,
    "choices": [
      "chmod 4755 /bin/foo",
      "chmod 1755 /bin/foo",
      "chmod u-s /bin/foo",
      "chmod 755+s /bin/foo",
      "chmod 2755 /bin/foo"
    ]
  },
  {
    "id": "daypo-101-081",
    "exam": "101",
    "sourceIndex": 81,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "0da17d7b4e2155b6fc20ba7ac20b4651c408b16b7ef149f4a18f9fcf641a4afb",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes comandos se puede utilizar para mostrar el número de inodo de un archivo determinado? (Escoge dos.)",
    "answers": [
      2,
      4
    ],
    "objective": "104.6",
    "explanation": "ls -i y stat permiten consultar el número de inodo de un archivo.",
    "topic": 104,
    "choices": [
      "inode",
      "ln",
      "ls",
      "cp",
      "stat"
    ]
  },
  {
    "id": "daypo-101-082",
    "exam": "101",
    "sourceIndex": 82,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "99dc6a545ea65b39cee622841bc9e313e232b51da8145cc96b580ebd00043cf1",
    "type": "single",
    "prompt": "¿Cuál de las siguientes configuraciones para umask garantiza que los archivos nuevos tengan los permisos predeterminados -rw-r-----?",
    "answers": [
      4
    ],
    "objective": "104.5",
    "explanation": "Los archivos regulares parten normalmente de 666. La máscara 027 retira los permisos necesarios para obtener 640.",
    "topic": 104,
    "choices": [
      "0017",
      "0640",
      "0038",
      "0227",
      "0027"
    ]
  },
  {
    "id": "daypo-101-083",
    "exam": "101",
    "sourceIndex": 83,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "b5485c101ef991a16d3694ad1c493fe6c0da7f64e8351433a40e8a4859361136",
    "type": "single",
    "prompt": "Después de un corte de energía, el sistema de archivos XFS de /dev/sda3 es inconsistente. ¿Cómo se pueden solucionar los errores del sistema de archivos existentes?",
    "answers": [
      4
    ],
    "objective": "104.2",
    "explanation": "xfs_repair repara XFS sin montar. Hay que revisar el diagnóstico y no forzar opciones destructivas sin comprenderlas.",
    "topic": 104,
    "choices": [
      "Usando mount -f para forzar un montaje del sistema de archivos",
      "Ejecutando xfsck en el sistema de archivos",
      "Montando el sistema de archivos con la opción xfs_repair",
      "Ejecutando la reparación de xfsadmin en el sistema de archivos",
      "Ejecutando xfs_repair en el sistema de archivos"
    ]
  },
  {
    "id": "daypo-101-084",
    "exam": "101",
    "sourceIndex": 84,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "3643c5eef34fb84e23a80dee1fd2cf8c75a3a1745b0c1d311f64d1791b89edbe",
    "type": "single",
    "prompt": "¿Cuál de las siguientes propiedades de un archivo existente cambia cuando se crea un enlace duro que apunta a ese archivo?",
    "answers": [
      1
    ],
    "objective": "104.6",
    "explanation": "Crear otro enlace duro incrementa el contador de enlaces del mismo inodo, sin duplicar los datos.",
    "topic": 104,
    "choices": [
      "Tamaño del archivo",
      "Recuento de enlaces",
      "Modificar marca de tiempo",
      "Número de inodo",
      "Permisos"
    ]
  },
  {
    "id": "daypo-101-085",
    "exam": "101",
    "sourceIndex": 85,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "7b86b1448bb4d29462c0fce2bf3ea15e33bde89846c03dec0622a71f20fe2ef6",
    "type": "written",
    "prompt": "Siguiendo el Estándar de jerarquía del sistema de archivos (FHS), ¿dónde deben colocarse los archivos binarios compilados por el administrador del sistema para que estén disponibles para todos los usuarios del sistema? (Especifique la ruta completa al directorio).",
    "answers": [
      "/usr/local/bin/",
      "/usr/local/bin"
    ],
    "objective": "104.7",
    "explanation": "/usr/local/bin se utiliza para ejecutables instalados localmente por el administrador y disponibles para los usuarios.",
    "topic": 104
  },
  {
    "id": "daypo-101-086",
    "exam": "101",
    "sourceIndex": 86,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "fa8980edc82e829addfcd136ec43bde9e4a95911cebac23578328b30f0544989",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos muestra cómo el shell maneja un comando específico?",
    "answers": [
      1
    ],
    "objective": "103.1",
    "explanation": "type muestra si Bash interpreta el nombre como alias, función, orden interna o ejecutable.",
    "topic": 103,
    "choices": [
      "where",
      "type",
      "stat",
      "case",
      "fileinfo"
    ]
  },
  {
    "id": "daypo-101-087",
    "exam": "101",
    "sourceIndex": 87,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "63ab5fe1555b4a0b88a7e44bff7a625e2995d18a4a3970c81a77f3b11ac3f35f",
    "type": "single",
    "prompt": "En el modo normal de vi (modo comando), ¿Qué carácter se puede usar paracomenzar una búsqueda inversa del texto?",
    "answers": [
      3
    ],
    "objective": "103.8",
    "explanation": "En vi, ? inicia una búsqueda hacia atrás; / busca hacia delante.",
    "topic": 103,
    "choices": [
      "r",
      "/",
      "F",
      "?",
      "s"
    ]
  },
  {
    "id": "daypo-101-088",
    "exam": "101",
    "sourceIndex": 88,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "95d0a632d5767c92054aadfe063c2448912df4b4ce51006d18a5c1e42c8d5c29",
    "type": "multiple",
    "prompt": "¿Cuáles de los siguientes comandos muestran la página command de la sección 1 del manual? (Escoge dos.)",
    "answers": [
      2,
      4
    ],
    "objective": "103.1",
    "explanation": "man 1 command y man -s 1 command seleccionan la sección 1 del manual.",
    "topic": 103,
    "choices": [
      "man command(1)",
      "man command@1",
      "man 1 command",
      "man 1.command",
      "man -s 1 command"
    ],
    "correction": "Hay dos sintaxis válidas de man entre las opciones. Se aceptan ambas y se convierte la pregunta en selección múltiple."
  },
  {
    "id": "daypo-101-089",
    "exam": "101",
    "sourceIndex": 89,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "9620cb111df54dd971e988d4ad603b626a96df5d31a54f2a4f3f545cc90eacd1",
    "type": "multiple",
    "prompt": "En Bash, ¿cuáles de los siguientes comandos crean o sobrescriben data con la salida estándar de ls, aunque también puedan guardar el error estándar? (Escoge dos.)",
    "answers": [
      1,
      2
    ],
    "objective": "103.4",
    "explanation": "En Bash, > guarda la salida estándar y >& archivo guarda salida estándar y error; ambas variantes crean o sobrescriben el destino.",
    "topic": 103,
    "choices": [
      "ls 3> data",
      "ls >& data",
      "ls > data",
      "ls >> data",
      "ls >>> data"
    ],
    "correction": "En Bash, tanto > como >& archivo crean o sobrescriben el destino. Se aceptan ambas, indicando que la segunda también redirige errores."
  },
  {
    "id": "daypo-101-090",
    "exam": "101",
    "sourceIndex": 90,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "d5da7e113a80b07afd439384e633a852ec0095d5ab6c3f377bcf550a32598fb7",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos se utiliza para cambiar opciones y parámetros posicionales dentro de un shell Bash en ejecución?",
    "answers": [
      3
    ],
    "objective": "103.1",
    "explanation": "set permite gestionar opciones y parámetros posicionales de la shell actual.",
    "topic": 103,
    "choices": [
      "history",
      "setsh",
      "bashconf",
      "set",
      "envsetup"
    ]
  },
  {
    "id": "daypo-101-091",
    "exam": "101",
    "sourceIndex": 91,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "2e2ffb1757cfc18b39b2fef355e77a755c8296f726dd9c5cbc20d9cf3b2a3146",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes comandos muestra los ID de todos los procesos propiedad de root? (Escoge dos.)",
    "answers": [
      1,
      3
    ],
    "objective": "103.5",
    "explanation": "pgrep -u selecciona UID efectivos; -U selecciona UID reales. root se corresponde habitualmente con UID 0.",
    "topic": 103,
    "choices": [
      "pgrep -c root",
      "pgrep -u root",
      "pgrep -f root",
      "pgrep -U 0",
      "ep -c 0"
    ]
  },
  {
    "id": "daypo-101-092",
    "exam": "101",
    "sourceIndex": 92,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "1d93b7420041387f0e2ff2da8379bd16da7eafec54ddc9dc15421a6ba6dde803",
    "type": "multiple",
    "prompt": "¿Cuál de las siguientes secuencias en el editor vi guarda el documento abierto y sale del editor? (Escoge dos.)",
    "answers": [
      3,
      4
    ],
    "objective": "103.8",
    "explanation": ":wq escribe y sale. ZZ también guarda si hay cambios y sale desde el modo normal.",
    "topic": 103,
    "choices": [
      "Ctrl XX",
      "Ctrl :W",
      "Esc zz",
      "Esc :wq",
      "Esc ZZ"
    ]
  },
  {
    "id": "daypo-101-093",
    "exam": "101",
    "sourceIndex": 93,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "cca3d172e8c8899f34f6e89763ce9c2f11e310523550c5b3dcd4a624a43c2895",
    "type": "single",
    "prompt": "¿Cuál es el efecto de la opción -v para el comando grep?",
    "answers": [
      2
    ],
    "objective": "103.7",
    "explanation": "grep -v invierte la selección y presenta las líneas que no coinciden.",
    "topic": 103,
    "choices": [
      "Habilita que el color resalte en las partes coincidentes.",
      "Muestra la información de la versión del comando.",
      "Solo muestra líneas que no coinciden.",
      "Cambia el orden de salida mostrando primero la última línea coincidente.",
      "Muestra la salida de todas las líneas y prefijos coincidentes con a+"
    ]
  },
  {
    "id": "daypo-101-094",
    "exam": "101",
    "sourceIndex": 94,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "746a4579e4b77378669ec082ff0bac63fdd6f9e47113c8dbe25d1d6dbbf85b7b",
    "type": "multiple",
    "prompt": "¿Cuál de las siguientes herramientas puede mostrar la ruta completa de un archivo ejecutable que el shell actual ejecutaría al iniciar un comando sin especificar su ruta completa? (Elija dos.)",
    "answers": [
      2,
      4
    ],
    "objective": "103.1",
    "explanation": "Para un ejecutable externo, which y type pueden indicar la ruta que se encuentra mediante PATH.",
    "topic": 103,
    "choices": [
      "find",
      "pwd",
      "which",
      "locate",
      "type"
    ]
  },
  {
    "id": "daypo-101-095",
    "exam": "101",
    "sourceIndex": 95,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "677178d35c8bda535194839615d3415308f2ad4e87dc9358e3ec2ac1a78568bc",
    "type": "single",
    "prompt": "¿Cuál de las siguientes señales se envía a un proceso cuando se presiona la combinación de teclas Ctrl+Z en el teclado?",
    "answers": [
      2
    ],
    "objective": "103.5",
    "explanation": "Ctrl+Z envía normalmente SIGTSTP. SIGSTOP también detiene, pero no es la señal producida por esa combinación.",
    "topic": 103,
    "choices": [
      "SIGTERM",
      "SIGCONT",
      "SIGTSTP",
      "SIGKILL",
      "SIGINT"
    ],
    "correction": "Ctrl+Z envía SIGTSTP, no SIGSTOP. Se corrige la opción marcada por la fuente."
  },
  {
    "id": "daypo-101-096",
    "exam": "101",
    "sourceIndex": 96,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "05dd7e80a039a367024350b7ac09c28b12251fae69412fa21e75225a09fe43b7",
    "type": "single",
    "prompt": "¿Cuál es el resultado cuando se aplica la expresión regular s/[ABC][abc]/xx/ a la siguiente cadena? ABCabc",
    "answers": [
      0
    ],
    "objective": "103.7",
    "explanation": "Sin un espacio entre las clases, el patrón encuentra Ca y lo sustituye por xx: ABxxbc.",
    "topic": 103,
    "choices": [
      "ABxxbc",
      "xxCxxc",
      "xxxxxx",
      "ABCabc",
      "Axxaxx"
    ],
    "correction": "Se retira el espacio accidental entre [ABC] y [abc]; con el espacio original no había coincidencia en ABCabc."
  },
  {
    "id": "daypo-101-097",
    "exam": "101",
    "sourceIndex": 97,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "37a875d30df62daf277d972986deccfd678360a0ff5591e6371347ede8706076",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes comandos imprime el directorio de trabajo actual cuando se utiliza un shell Bash? (Escoge dos.)",
    "answers": [
      0,
      3
    ],
    "objective": "103.1",
    "explanation": "PWD contiene el directorio de trabajo en Bash y pwd lo muestra. Las mayúsculas de la variable importan.",
    "topic": 103,
    "choices": [
      "echo \"${PWD}\"",
      "echo \"${WD}\"",
      "printwd",
      "pwd",
      "echo \"${pwd}\""
    ]
  },
  {
    "id": "daypo-101-098",
    "exam": "101",
    "sourceIndex": 98,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "fc634abc4512660e46c6daa18a1516c0130cbc9b59a0c2e1b6955c0d50b3872e",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos pasa el texto test a la entrada estándar de cat mediante un documento here?",
    "answers": [
      4
    ],
    "objective": "103.4",
    "explanation": "Un documento here empieza tras <<EOT y termina con EOT en una línea propia; cat recibe el texto por su entrada.",
    "topic": 103,
    "choices": [
      "cat <!EOT test EOT",
      "cat <|EOT test EOT",
      "cat !<EOT test EOT",
      "cat &<EOT test EOT",
      "cat <<EOT\ntest\nEOT"
    ],
    "correction": "Se conservan los saltos de línea necesarios del documento here y se aclara que el texto se entrega a cat."
  },
  {
    "id": "daypo-101-099",
    "exam": "101",
    "sourceIndex": 99,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "5b1515427988d83c889f9e827621f8c31d91e5fa5044243bf24fefb46c896f2d",
    "type": "single",
    "prompt": "Desde una shell con nice 0, ¿qué valor nice solicita normalmente nice al iniciar un comando sin indicar -n?",
    "answers": [
      2
    ],
    "objective": "103.6",
    "explanation": "Sin -n, nice solicita un incremento de 10 sobre el nice heredado; no fija siempre un valor absoluto de 10.",
    "topic": 103,
    "choices": [
      "-10",
      "0",
      "10",
      "15",
      "20"
    ],
    "correction": "Se especifica nice heredado 0: el incremento predeterminado es 10, no un valor absoluto universal."
  },
  {
    "id": "daypo-101-100",
    "exam": "101",
    "sourceIndex": 100,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "1fe3ebeb6428f16bd2e30dcbf91bbed594ce3cc89013cbcc318b1fad6abaf89a",
    "type": "single",
    "prompt": "Un usuario creó accidentalmente el subdirectorio \\dir en su directorio home. ¿Cuálde los siguientes comandos eliminará ese directorio?",
    "answers": [
      0
    ],
    "objective": "103.3",
    "explanation": "La barra inversa literal necesita protegerse. Dos barras consecutivas pasan una sola barra al nombre del directorio.",
    "topic": 103,
    "choices": [
      "rmdir ~/\\\\dir",
      "rmdir \"~/\\dir\"",
      "rmdir ~/'dir'",
      "rmdir ~/\\dir",
      "rmdir '~/\\dir'"
    ],
    "correction": "Se corrige la clave: la opción con dos barras inversas transmite una barra literal; la opción marcada por Daypo no lo hacía."
  },
  {
    "id": "daypo-101-101",
    "exam": "101",
    "sourceIndex": 101,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "a131521a97165adc3451edc3cc3b9e743939a34c86a7a6ccbc1640851838ea26",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos puede realizar búsquedas en el contenido de archivos utilizando expresiones regulares?",
    "answers": [
      2
    ],
    "objective": "103.7",
    "explanation": "grep busca patrones en el contenido; find y locate buscan nombres o atributos.",
    "topic": 103,
    "choices": [
      "find",
      "locate",
      "grep",
      "reggrep",
      "pgrep"
    ]
  },
  {
    "id": "daypo-101-102",
    "exam": "101",
    "sourceIndex": 102,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "b36dca7e0a6565ad7283fa3def6d2c9f02df8479b08aa2a446ddadeb8fffbf51",
    "type": "single",
    "prompt": "En una estructura de directorio anidada, ¿qué opción de línea de comando de búsqueda se usaría para restringir el comando a buscar un número particular de subdirectorios?",
    "answers": [
      0
    ],
    "objective": "103.3",
    "explanation": "-maxdepth limita la profundidad de recorrido de find desde los puntos de partida.",
    "topic": 103,
    "choices": [
      "-maxdepth",
      "-dirmax",
      "-maxlevels",
      "-s",
      "-n"
    ]
  },
  {
    "id": "daypo-101-103",
    "exam": "101",
    "sourceIndex": 103,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "1a4a67d48a2a89006b3b495a720db13708405d0ab52189b814d11d8e463432d8",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos determina el formato de un archivo mediante el uso de un archivo de base de datos de definición que contiene información sobre todos los tipos de archivos comunes?",
    "answers": [
      1
    ],
    "objective": "103.3",
    "explanation": "file reconoce formatos mediante pruebas y una base de patrones de identificación, no solo por la extensión.",
    "topic": 103,
    "choices": [
      "type",
      "file",
      "magic",
      "pmagic",
      "hash"
    ]
  },
  {
    "id": "daypo-101-104",
    "exam": "101",
    "sourceIndex": 104,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "367b97b997121eb7710c5d7047116d129dd4e30db5030d8aac5d0a8e8b54239e",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos genera una lista de nombres de usuarios de /etc/passwd junto con su shell de inicio de sesión?",
    "answers": [
      4
    ],
    "objective": "103.2",
    "explanation": "Los campos 1 y 7 de passwd son el nombre de la cuenta y su shell.",
    "topic": 103,
    "choices": [
      "column -s : 1,7 /etc/passwd",
      "chop -c 1,7 /etc/passwd",
      "colrm 1,7 /etc/passwd",
      "sort -t: -k1,7 /etc/passwd",
      "cut -d: -f1,7 /etc/passwd"
    ]
  },
  {
    "id": "daypo-101-105",
    "exam": "101",
    "sourceIndex": 105,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "7c4a3381c510cdb45a3a1d6e4608d3d467b895c8910c325edfe6f228b70da2b3",
    "type": "single",
    "prompt": "Si el archivo tar comprimido con gzip texts.tgz contiene los archivos a.txt y b.txt, ¿qué archivos estarán presentes en el directorio actual después de ejecutar gunzip texts.tgz?",
    "answers": [
      4
    ],
    "objective": "103.3",
    "explanation": "gunzip descomprime el contenedor gzip, pero no extrae los miembros del archivo tar resultante.",
    "topic": 103,
    "choices": [
      "Solo a.txt, b.txt y texts.tgz",
      "Solo texts.tar y texts.tgz",
      "Solo a.txt.gz y b.txt.gz",
      "Solo a.txt y b.txt",
      "Solo texts.tar"
    ],
    "correction": "Se traducen las cinco opciones que permanecían en inglés, conservando el resultado de descomprimir sin extraer el tar."
  },
  {
    "id": "daypo-101-106",
    "exam": "101",
    "sourceIndex": 106,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "6b3bad27c6d944c05398b6d51e30bd8f0df08792aa0f0d8e1790104a627592dc",
    "type": "single",
    "prompt": "En el editor vi, ¿cómo se pueden emitir varias veces o aplicarse a varias filas comandos como mover el cursor o copiar líneas en el búfer?",
    "answers": [
      1
    ],
    "objective": "103.8",
    "explanation": "En vi puede anteponerse un contador al comando o movimiento para repetir su efecto.",
    "topic": 103,
    "choices": [
      "Usando el comando :repeat seguido del número y el comando",
      "Especificando el número justo delante de un comando, como 4l o 2yj.",
      "Seleccionando todas las líneas afectadas usando Mayús y las teclas de cursor antes de aplicar el comando.",
      "Emitiendo un comando como: establecer repetición = 4 con repeticiones en cada comando posterior 4 veces.",
      "Especificando el número después de un comando como 14 o yj2 seguido de escape."
    ],
    "correction": "Se corrige 41 por 4l en el ejemplo y la traducción errónea de Shift por Mayús."
  },
  {
    "id": "daypo-101-107",
    "exam": "101",
    "sourceIndex": 107,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "139f4aa4d21fb2da27b6ca671d4ba867c14154e68202fde96f3f42da0bf1fa15",
    "type": "single",
    "prompt": "¿Cuál de las siguientes afirmaciones es correcta para un comando que termina con el carácter &?",
    "answers": [
      1
    ],
    "objective": "103.5",
    "explanation": "& ejecuta el comando de forma asíncrona en segundo plano; la shell puede continuar recibiendo órdenes.",
    "topic": 103,
    "choices": [
      "La salida del comando se redirige a /dev/null.",
      "El comando se ejecuta en segundo plano del shell actual.",
      "La salida del comando es ejecutada por el shell.",
      "El comando se ejecuta directamente como un hijo del proceso init.",
      "La entrada del comando se lee desde /dev/null."
    ]
  },
  {
    "id": "daypo-101-108",
    "exam": "101",
    "sourceIndex": 108,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "3c1a1a81f49e9a23f1c89795ed069833bd023b0081740057527edc5d9c44b277",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos lee un archivo y crea fragmentos separados de un tamaño determinado a partir del contenido del archivo?",
    "answers": [
      3
    ],
    "objective": "103.2",
    "explanation": "split divide la entrada en archivos según el número de líneas o bytes solicitado.",
    "topic": 103,
    "choices": [
      "ar",
      "cat",
      "break",
      "split",
      "parted"
    ]
  },
  {
    "id": "daypo-101-109",
    "exam": "101",
    "sourceIndex": 109,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "b84b053715efa3a36b34406edcd7f3e28355de16aa78011f7f248dcf82e084aa",
    "type": "single",
    "prompt": "¿Cuál es el propósito del comando xargs?",
    "answers": [
      2
    ],
    "objective": "103.4",
    "explanation": "xargs construye argumentos para ejecutar órdenes a partir de la entrada estándar.",
    "topic": 103,
    "choices": [
      "Pasa argumentos a un servidor de X.",
      "Repite la ejecución de un comando usando diferentes parámetros para cada invocación.",
      "Lee la entrada estándar y crea comandos para ejecutar",
      "Hace una pregunta, gráficamente y devuelve la respuesta al shell.",
      "Permite especificar opciones largas (como --help) para comandos que normalmente solo aceptan opciones cortas (como -h)"
    ]
  },
  {
    "id": "daypo-101-110",
    "exam": "101",
    "sourceIndex": 110,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "72630976eda605464b28e3be23e01c00db38ade601a3292d48e135fa43e83cc5",
    "type": "written",
    "prompt": "¿Qué comando muestra una lista de todas las tareas en segundo plano que se ejecutan en el shell actual? (Especifique solo el comando sin ninguna ruta oparámetro)",
    "answers": [
      "jobs"
    ],
    "objective": "103.5",
    "explanation": "jobs consulta los trabajos de la shell actual, no todos los procesos del equipo.",
    "topic": 103
  },
  {
    "id": "daypo-101-111",
    "exam": "101",
    "sourceIndex": 111,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "6d560249979ce72dadcd9eb5f038ac70c195f362d5ef763b191d38c37c7b3366",
    "type": "written",
    "prompt": "¿Qué comando se usa para cambiar la prioridad de un proceso que ya se está ejecutando? (especifique solo el comando sin ninguna ruta o parámetro)",
    "answers": [
      "renice"
    ],
    "objective": "103.6",
    "explanation": "renice modifica el valor nice de procesos existentes, sujeto a los permisos del usuario.",
    "topic": 103
  },
  {
    "id": "daypo-101-112",
    "exam": "101",
    "sourceIndex": 112,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "d7f624440cdd89e1c50de55a504cb0ab003565541adf729bf6c22832a160d104",
    "type": "single",
    "prompt": "En Bash, insertar 1>&2 después de un comando redirige",
    "answers": [
      1
    ],
    "objective": "103.4",
    "explanation": "1>&2 dirige la salida estándar hacia el destino del error estándar.",
    "topic": 103,
    "choices": [
      "El error estándar a la entrada estándar.",
      "La salida estándar al error estándar.",
      "La entrada estándar al error estándar",
      "El error estándar a la salida estándar.",
      "La salida estándar a la entrada estándar."
    ]
  },
  {
    "id": "daypo-101-113",
    "exam": "101",
    "sourceIndex": 113,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "b506366dae95e3446aa0ef4176c3c4fd4d0c1827264e204fa78301f92517fe03",
    "type": "single",
    "prompt": "Al arrancar desde el disco duro, una computadora carga exitosamente el kernel de Linux e initramfs pero se bloquea durante las tareas de inicio posteriores. El sistema se inicia utilizando un CD de rescate basado en Linux para investigar el problema. ¿Cuál de los siguientes métodos ayuda a identificar la causa raíz del problema?",
    "answers": [
      2
    ],
    "objective": "101.2",
    "explanation": "Los registros persistentes del disco pueden conservar el fallo anterior; dmesg del rescate pertenece al kernel del rescate.",
    "topic": 101,
    "choices": [
      "Usar el comando dmesg desde el shell del CD de rescate para ver los registros de arranque del sistema original.",
      "Investigar el archivo /proc/kmsg en el disco duro de la computadora en busca de posibles errores.",
      "Investigar los registros guardados en el directorio /var/log del disco duro en busca de errores.",
      "Usar chroot para cambiar al sistema de archivos en el disco duro y usar dmesg para ver los registros.",
      "Reiniciar nuevamente desde el disco duro ya que el sistema se inició exitosamente desde el CD de rescate."
    ],
    "correction": "Se identifica /var/log como directorio y se pide revisar los registros persistentes del disco, no el kernel del rescate."
  },
  {
    "id": "daypo-101-114",
    "exam": "101",
    "sourceIndex": 114,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "fadf24968c06aba7399414679b6261b59756cbcf6cc16a18406c0b6dd35cc28a",
    "type": "single",
    "prompt": "¿Dónde se almacena el gestor de arranque en el disco duro de un sistema UEFI?",
    "answers": [
      2
    ],
    "objective": "102.2",
    "explanation": "El cargador UEFI se guarda en la partición ESP, como un ejecutable EFI.",
    "topic": 102,
    "choices": [
      "En el registro de arranque EFI (EBR).",
      "En el Master Boot Record (MBR)",
      "En la partición del sistema EFI (ESP)",
      "En la partición etiquetada como boot.",
      "En la partición número 127."
    ]
  },
  {
    "id": "daypo-101-115",
    "exam": "101",
    "sourceIndex": 115,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "75b941e14a9e8d9a0737c5cf49032fd24b1b2716630407c83b282b9fbe5aee77",
    "type": "single",
    "prompt": "¿Cuál es la forma correcta de configurar el destino de arranque predeterminado de systemd en multiusuario?",
    "answers": [
      3
    ],
    "objective": "101.3",
    "explanation": "set-default elige el destino de los próximos arranques; isolate cambia el destino actual.",
    "topic": 101,
    "choices": [
      "systemctl isolate multi-user.target",
      "systemctl set-runlevel multi-user.target",
      "systemctl set-boot multi-user.targe",
      "systemctl set-default multi-user.target",
      "systemctl boot -p multi-user.target"
    ]
  },
  {
    "id": "daypo-101-116",
    "exam": "101",
    "sourceIndex": 116,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "496efaed807bd9170cf80ad607ec51600320c5871070f0942eb87fad789d1c6f",
    "type": "multiple",
    "prompt": "¿Cuál de las siguientes afirmaciones es correcta sobre el disco RAM inicial involucrado en el proceso de arranque de Linux? (Escoge dos.)",
    "answers": [
      0,
      3
    ],
    "objective": "101.2",
    "explanation": "El initramfs contiene un entorno inicial temporal que ayuda a montar la raíz real del sistema.",
    "topic": 101,
    "choices": [
      "Un initramfs, es un archivo de sistema de archivos comprimido, que se puededescomprimir para examinar su contenido.",
      "Un archivo initramfs contiene el MBR, el gestor de arranque y el kernel de Linux.",
      "Después de un arranque correcto, el contenido de initramfs está disponible en/run/initramfs/.",
      "El kernel usa intramfs temporalmente, antes de acceder al sistema de archivos raíz real.",
      "Un initramfs no depende de una versión específica del kernel y no se modifica después de la instalación inicial."
    ]
  },
  {
    "id": "daypo-101-117",
    "exam": "101",
    "sourceIndex": 117,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "89a19ca175494cef78741ee37bbe21e37bdbe21db0ec4e29a1a7b6bbaea55282",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos carga un módulo del kernel junto con los módulos de dependencias requeridos?",
    "answers": [
      1
    ],
    "objective": "101.1",
    "explanation": "modprobe usa la información de dependencias para cargar el módulo y los módulos que necesita.",
    "topic": 101,
    "choices": [
      "depmod",
      "modprobe",
      "module_install",
      "insmod",
      "loadmod"
    ]
  },
  {
    "id": "daypo-101-118",
    "exam": "101",
    "sourceIndex": 118,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "f8c5f1a8d100054b381935748d20c2782d1acbd86283b05a28bfabcb7a1a80e6",
    "type": "multiple",
    "prompt": "¿Qué información puede mostrar el comando lspci sobre el hardware del sistema?(Escoge tres)",
    "answers": [
      1,
      2,
      4
    ],
    "objective": "101.1",
    "explanation": "Con las opciones apropiadas, lspci muestra identificadores, recursos e información del enlace o bus PCI.",
    "topic": 101,
    "choices": [
      "Tipo de batería del sistema",
      "Configuración de IRQ del dispositivo",
      "Velocidad del bus PCI",
      "Dirección MAC de la tarjeta de red",
      "Identificación del fabricante del dispositivo"
    ]
  },
  {
    "id": "daypo-101-119",
    "exam": "101",
    "sourceIndex": 119,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "9e8f8ec86e7f3ee07b138d4192baaf03f70a440e55abc4b681b02b0311ad0395",
    "type": "written",
    "prompt": "¿Qué archivo de configuración de inicio de System V se usa comúnmente para establecer el nivel de ejecución predeterminado? (Especifique el nombre completo del archivo, incluída la ruta)",
    "answers": [
      "/etc/inittab"
    ],
    "objective": "101.3",
    "explanation": "/etc/inittab define habitualmente el nivel predeterminado en System V; systemd utiliza destinos.",
    "topic": 101
  },
  {
    "id": "daypo-101-120",
    "exam": "101",
    "sourceIndex": 120,
    "sourceUrl": "https://www.daypo.com/lpic-101-500.html",
    "sourceSha256": "8c08793c6ccd3273eedd6ad746f5d74d138495b849555441fb4410f2fe562a98",
    "type": "multiple",
    "prompt": "Dados los siguientes dos enlaces simbólicos en una configuración de inicio de System V:\n/etc/rc1.d/K01apache2\n/etc/rc2.d/S02apache2\n¿Cuándo se ejecutan los scripts a los que hacen referencia estos enlaces? (Escoge dos.)",
    "answers": [
      0,
      4
    ],
    "objective": "101.3",
    "explanation": "Los enlaces S y K del nivel al que se entra indican qué servicios se inician y cuáles se detienen.",
    "topic": 101,
    "choices": [
      "S02apache2 se ejecuta cuando se ingresa al nivel de ejecución 2.",
      "S02apache2 se ejecuta cuando se abandona el nivel de ejecución 2",
      "K01apache2 nunca se ejecuta porque K indica un servicio desactivado.",
      "Tanto S02apache2 como K01apache2 se ejecutan durante el apagado del sistema.",
      "K01apache2 se ejecuta cuando se ingresa el nivel de ejecución 1."
    ]
  },
  {
    "id": "daypo-102-001",
    "exam": "102",
    "sourceIndex": 1,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "e475f4c62a800887125c76a0177aa5dbf878f19e52523e5589bfc2a36848cdf7",
    "type": "written",
    "prompt": "¿Qué comando se utiliza para establecer el nombre de host del sistema local?",
    "answers": [
      "hostname",
      "hostnamectl"
    ],
    "objective": "109.2",
    "explanation": "hostname permite establecer el nombre del equipo; en sistemas con systemd también puede utilizarse hostnamectl.",
    "topic": 109,
    "correction": "Se admite también hostnamectl como herramienta para establecer el nombre en sistemas systemd."
  },
  {
    "id": "daypo-102-002",
    "exam": "102",
    "sourceIndex": 2,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "5a22f8f21a7da2c332ec67ec50b3478914348bc01600397b03d9d927fc20c5a3",
    "type": "single",
    "prompt": "¿Cuál de las siguientes es una dirección IPv6 válida?",
    "answers": [
      2
    ],
    "objective": "109.1",
    "explanation": "En IPv6 solo hay dígitos hexadecimales y :: puede emplearse una única vez para comprimir grupos de ceros.",
    "topic": 109,
    "choices": [
      "2001:db8:0g21::1",
      "2001::db8:4581::1",
      "2001:db8:3241::1",
      "2001%db8%9990%%1",
      "2001.db8.819f..1"
    ]
  },
  {
    "id": "daypo-102-003",
    "exam": "102",
    "sourceIndex": 3,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "249ea40ebfaf676afc73e22172b21ed965d6b091083c1c4bf06ae08201ed30b1",
    "type": "written",
    "prompt": "¿Qué comando, dependiendo de sus opciones, puede mostrar las conexiones TCP abiertas, las tablas de enrutamiento, así como las estadísticas de la interfaz de red? (Especifique solo el comando sin ninguna ruta ni parámetros).",
    "answers": [
      "netstat"
    ],
    "objective": "109.3",
    "explanation": "netstat puede consultar conexiones, rutas y estadísticas con opciones diferentes. ss e ip cubren hoy muchas de esas funciones.",
    "topic": 109
  },
  {
    "id": "daypo-102-004",
    "exam": "102",
    "sourceIndex": 4,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "53cb6450687d32590c4ec98c83bd1ed44530806cd49c644e282b8690b8c6ca99",
    "type": "written",
    "prompt": "¿Qué comando incluido en NetworkManager es una aplicación de curses que proporciona acceso fácil a NetworkManager en la línea de comandos? (Especifique solo el comando sin ninguna ruta ni parámetros).",
    "answers": [
      "nmtui"
    ],
    "objective": "109.2",
    "explanation": "nmtui es la interfaz de texto con menús de NetworkManager. nmcli es su interfaz de órdenes.",
    "topic": 109
  },
  {
    "id": "daypo-102-005",
    "exam": "102",
    "sourceIndex": 5,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "e6981bdbf181c9af2c16518f5caf54980868d347b29c045e9e186c0bce365579",
    "type": "single",
    "prompt": "¿Cuál de las siguientes herramientas utilizadas para la depuración de DNS, informa no sólo de la respuesta del servidor de nombres, si no también, de los detalles de la consulta?",
    "answers": [
      2
    ],
    "objective": "109.4",
    "explanation": "dig presenta la pregunta DNS, cabeceras, respuesta y otros detalles de la consulta.",
    "topic": 109,
    "choices": [
      "dnsq",
      "hostname",
      "dig",
      "dnslookup",
      "zoneinfo"
    ]
  },
  {
    "id": "daypo-102-006",
    "exam": "102",
    "sourceIndex": 6,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "98da9417556c4dedccf4b8bf3248ae3f2fcea96cc775b216d589eb6d68810a07",
    "type": "single",
    "prompt": "¿Cuál de las siguientes afirmaciones es válida en el archivo /etc/nsswitch.conf?",
    "answers": [
      4
    ],
    "objective": "109.4",
    "explanation": "La entrada hosts: files dns ordena consultar los archivos locales y después DNS.",
    "topic": 109,
    "choices": [
      "multi on",
      "192.168.168.4 dns-server",
      "namespaces: net mount procs",
      "include /etc/nsswitch.d/",
      "hosts: files dns"
    ]
  },
  {
    "id": "daypo-102-007",
    "exam": "102",
    "sourceIndex": 7,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "a5386d1f28d43b707c93f216c8f3e7f715d93fbe0031a45074a623b0a6f5f49a",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes tipos de conexión, como se ve en la conexión nmcli, puede existir en NetworkManager? (Elija tres).",
    "answers": [
      1,
      2,
      4
    ],
    "objective": "109.2",
    "explanation": "ethernet, wifi y bridge son tipos de conexión de NetworkManager; TCP e IPv6 no son tipos de perfil equivalentes.",
    "topic": 109,
    "choices": [
      "tcp",
      "ethernet",
      "wifi",
      "ipv6",
      "bridge"
    ]
  },
  {
    "id": "daypo-102-008",
    "exam": "102",
    "sourceIndex": 8,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "0091153299e2fb9e19568e8427e5ac9a578bb732b3cea10a942355f5503c4eef",
    "type": "single",
    "prompt": "En una estación de trabajo Linux, el comando route tarda mucho tiempo antes de imprimir la tabla de enrutamiento. ¿Cuál de los siguientes errores indica esto?",
    "answers": [
      4
    ],
    "objective": "109.3",
    "explanation": "route intenta resolver nombres si no se pide salida numérica; un fallo DNS puede retrasar la presentación.",
    "topic": 109,
    "choices": [
      "La información de enrutamiento local puede estar dañada y debe volver a validarse utilizando un protocolo de enrutamiento.",
      "Uno de los enrutadores en la tabla de enrutamiento no está disponible, lo que hace que el mecanismo de detección automática de fallas de enrutador (ARF-D) espere un tiempo de espera.",
      "Puede haber accidentalmente más de un enrutador predeterminado, en cuyo caso se debe realizar una elección de enrutador predeterminado en la red para elegir un enrutador como predeterminado.",
      "El demonio de enrutamiento del kernel de Linux (LKRD) no se está ejecutando y debe iniciarse utilizando su script de inicio o la unidad systemd.",
      "La resolución de DNS puede no funcionar ya que la ruta predeterminada intenta resolver los nombres de los enrutadores y destinos y puede encontrarse con un tiempo de espera."
    ]
  },
  {
    "id": "daypo-102-009",
    "exam": "102",
    "sourceIndex": 9,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "a9ff94ef54943ca384504fca16335f9629c3ea65c19c862581416b17477f1a79",
    "type": "single",
    "prompt": "¿Qué es cierto acerca del campo Hop Limit en el encabezado de IPv6?",
    "answers": [
      3
    ],
    "objective": "109.1",
    "explanation": "Cada router reduce Hop Limit y descarta el paquete si se agota, evitando bucles indefinidos.",
    "topic": 109,
    "choices": [
      "El campo no se modifica durante el transporte de un paquete.",
      "El campo se transmite dentro de un encabezado de extensión salto a salto.",
      "Cada enrutador que reenvía el paquete aumenta el valor del campo.",
      "Cada enrutador que reenvía el paquete disminuye el valor del campo",
      "Para los paquetes de multidifusión, el valor del campo siempre es 1"
    ]
  },
  {
    "id": "daypo-102-010",
    "exam": "102",
    "sourceIndex": 10,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "3768a72f48bfe801014c18e27c8ecb2e4f1943445e9d01ba836ad37ac170dbcf",
    "type": "multiple",
    "prompt": "¿Cuáles de los siguientes subcomandos nmcli existen? (Elija dos opciones).",
    "answers": [
      1,
      4
    ],
    "objective": "109.2",
    "explanation": "device y connection son objetos principales de nmcli; wifi se utiliza dentro de device.",
    "topic": 109,
    "choices": [
      "nmcli ethernet",
      "nmcli device",
      "nmcli wifi",
      "nmcli address",
      "nmcli connection"
    ]
  },
  {
    "id": "daypo-102-011",
    "exam": "102",
    "sourceIndex": 11,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "143bdd641eeaef821bc715251a9cd205c9c40d52a63b62c81ddc125ef1a8a83a",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes cambios puede ocurrir como consecuencia del uso del comando ip? (Elija tres opciones).",
    "answers": [
      0,
      3,
      4
    ],
    "objective": "109.3",
    "explanation": "ip modifica enlaces, direcciones y rutas del kernel. No edita por sí solo la configuración persistente del resolutor.",
    "topic": 109,
    "choices": [
      "Las interfaces de red pueden volverse activas o inactivas.",
      "Se pueden agregar nuevos servidores de nombres a la configuración del solucionador.",
      "El nombre de host del sistema puede cambiar.",
      "Las direcciones IP pueden cambiar.",
      "La tabla de enrutamiento puede cambiar."
    ]
  },
  {
    "id": "daypo-102-012",
    "exam": "102",
    "sourceIndex": 12,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "431c119f772fe4522465a2c6963db1500c5299ea784cefa6084353a249033600",
    "type": "single",
    "prompt": "¿Cuántas direcciones IP se pueden utilizar para hosts únicos dentro de la subred IPv4 192.168.2.128/26?",
    "answers": [
      3
    ],
    "objective": "109.1",
    "explanation": "Un /26 contiene 64 direcciones. En una subred IPv4 convencional se reservan red y broadcast: quedan 62 hosts.",
    "topic": 109,
    "choices": [
      "6",
      "14",
      "30",
      "62",
      "126"
    ]
  },
  {
    "id": "daypo-102-013",
    "exam": "102",
    "sourceIndex": 13,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "f9fb9a530dfaaa43f199617f3a17a3cba026ea43ffc63ac1374bbd5a36721850",
    "type": "multiple",
    "prompt": "¿Cuáles de las siguientes redes IPv4 están reservadas por IANA para la asignación de direcciones privadas y el enrutamiento privado? (Elija tres opciones).",
    "answers": [
      0,
      3,
      4
    ],
    "objective": "109.1",
    "explanation": "Los rangos privados son 10/8, 172.16/12 y 192.168/16. Loopback no es uno de esos rangos privados.",
    "topic": 109,
    "choices": [
      "10.0.0.0/8",
      "127.0.0.0/8",
      "169.255.0.0/16",
      "172.16.0.0/12",
      "192.168.0.0/16"
    ]
  },
  {
    "id": "daypo-102-014",
    "exam": "102",
    "sourceIndex": 14,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "cff44f39869c153142b46e50ddf121835d4941ca6ccb343d2b3f80a18adce40d",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes comandos configura interfaces de red en función de los archivos de configuración específicos de la distribución existentes del sistema? (Elija dos opciones).",
    "answers": [
      1,
      4
    ],
    "objective": "109.2",
    "explanation": "ifup aplica una configuración e ifdown la retira según el mecanismo de red de la distribución.",
    "topic": 109,
    "choices": [
      "ifconf",
      "ifdown",
      "ifpause",
      "ifstart",
      "ifup"
    ]
  },
  {
    "id": "daypo-102-015",
    "exam": "102",
    "sourceIndex": 15,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "743fccb1a2d988867c90b806bcd15de5672f3efbf6f6e3764a3ef49df1b90890",
    "type": "single",
    "prompt": "¿Cuál de las siguientes afirmaciones es verdadera si el UID de un usuario normal es idéntico al GID de un grupo?",
    "answers": [
      2
    ],
    "objective": "107.1",
    "explanation": "UID identifica usuarios y GID identifica grupos; son espacios de identificadores distintos.",
    "topic": 107,
    "choices": [
      "Los UID tienen prioridad sobre los GID, por lo tanto, el usuario está disponible mientras que el grupo no.",
      "El usuario y el grupo no están disponibles para evitar ambigüedades debido al conflicto de ID.",
      "Los UID y los GID son independientes entre sí, por lo tanto, tanto el usuario como el grupo siguen estando disponibles.",
      "El usuario es el único miembro del grupo, incluso si la configuración del grupo contiene otros miembros.",
      "Los GID tienen prioridad sobre los UID, por lo tanto, el grupo está disponible mientras que el usuario no lo está."
    ]
  },
  {
    "id": "daypo-102-016",
    "exam": "102",
    "sourceIndex": 16,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "08588157db600aef07baf664e4739fd45a2f484d11ace4ce82c45b0eb2a488d3",
    "type": "single",
    "prompt": "¿Cuál de la siguiente información se almacena en /etc/shadow para cada usuario?",
    "answers": [
      2
    ],
    "objective": "107.1",
    "explanation": "shadow guarda el hash de contraseña o un marcador de bloqueo, además de datos de caducidad; no una contraseña reversible.",
    "topic": 107,
    "choices": [
      "La marca de tiempo del último inicio de sesión del usuario",
      "Las claves SSH privadas del usuario",
      "El hash de contraseña o un marcador de bloqueo de la cuenta.",
      "El ID de usuario numérico (UID)",
      "La ruta al directorio de inicio del usuario"
    ],
    "correction": "Se corrige «contraseña cifrada» por hash o marcador de bloqueo: shadow no almacena una contraseña reversible."
  },
  {
    "id": "daypo-102-017",
    "exam": "102",
    "sourceIndex": 17,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "5bb4407212fb03ec469e5bc16c68995953dec5bfe62725392a66ee4c081eca09",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos muestra todos los temporizadores activos de systemd?",
    "answers": [
      3
    ],
    "objective": "107.2",
    "explanation": "systemctl list-timers consulta los temporizadores cargados y sus activaciones.",
    "topic": 107,
    "choices": [
      "systemctl-timer show",
      "timectl list",
      "systemctl -t",
      "systemctl list-timers",
      "timeq"
    ]
  },
  {
    "id": "daypo-102-018",
    "exam": "102",
    "sourceIndex": 18,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "21a392d11432d47546e09942321e8a5b6faf870cdbd4d509b0f2536ba247de7b",
    "type": "multiple",
    "prompt": "¿Cuál de las siguientes tareas puede realizar el comando date? (Elija dos opciones).",
    "answers": [
      0,
      4
    ],
    "objective": "108.1",
    "explanation": "date puede mostrar o ajustar el reloj del sistema; modificarlo requiere los permisos correspondientes.",
    "topic": 108,
    "choices": [
      "Establecer la fecha y la hora del sistema.",
      "Establecer la fecha del sistema, pero no la hora.",
      "Calcular el lapso de tiempo entre dos fechas.",
      "Imprimir un calendario para un mes o un año.",
      "Mostrar la hora en un formato específico."
    ]
  },
  {
    "id": "daypo-102-019",
    "exam": "102",
    "sourceIndex": 19,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "0fe7fa52e5addf27b27507de6a623e70d066b833ded5c96643c595ceb536f036",
    "type": "written",
    "prompt": "¿Qué archivo, si está presente, debe contener todos los usuarios que tienen permiso para utilizar el sistema de programación cron? (Especifique el nombre completo del archivo, incluida la ruta).",
    "answers": [
      "/etc/cron.allow"
    ],
    "objective": "107.2",
    "explanation": "Si existe cron.allow, el usuario debe estar incluido para que ese control permita utilizar crontab.",
    "topic": 107
  },
  {
    "id": "daypo-102-020",
    "exam": "102",
    "sourceIndex": 20,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "10b51ff3aefbaf4e05fbdfd32997d5517f92a516598e3b5cf4c796efa1dd055b",
    "type": "multiple",
    "prompt": "¿Qué se puede especificar con useradd? (Elija dos opciones).",
    "answers": [
      1,
      4
    ],
    "objective": "107.1",
    "explanation": "useradd permite indicar el directorio con -d y el UID con -u; crear el directorio puede requerir además -m.",
    "topic": 107,
    "choices": [
      "Comandos que el usuario puede ejecutar usando sudo.",
      "La ruta absoluta al directorio de inicio del usuario.",
      "Qué impresoras están disponibles para el nuevo usuario.",
      "Las claves SSH utilizadas para iniciar sesión en la nueva cuenta.",
      "El ID de usuario numérico (UID) del usuario."
    ]
  },
  {
    "id": "daypo-102-021",
    "exam": "102",
    "sourceIndex": 21,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "8ed05ad6b4465457c6607bc97aac56c9fd4b76a5931bca34845ca7fa79e0f2d1",
    "type": "single",
    "prompt": "¿Qué es cierto acerca del archivo /etc/localtime?",
    "answers": [
      4
    ],
    "objective": "107.3",
    "explanation": "/etc/localtime contiene los datos de zona o un enlace a un archivo de /usr/share/zoneinfo.",
    "topic": 107,
    "choices": [
      "Es un archivo de texto sin formato que contiene una cadena como Europe/Berlin",
      "Lo crea y lo mantiene el servicio NTP en función de la ubicación de la dirección IP del sistema.",
      "Es un enlace simbólico a /sys/device/clock/ltime y siempre contiene la hora local actual.",
      "Después de cambiar este archivo, se debe ejecutar newtzconfig para que los cambios surtan efecto.",
      "Es un enlace simbólico a un archivo de información de zona horaria como /usr/share/zoneinfo/Europe/Berlin o una copia de este."
    ]
  },
  {
    "id": "daypo-102-022",
    "exam": "102",
    "sourceIndex": 22,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "52db08ff5d1642a860208ae58280dc01ef8a688267cc28d27d9e83406d3f3ae2",
    "type": "single",
    "prompt": "¿Cuál de las siguientes afirmaciones es verdadera con respecto a las unidades de temporizador de systemd?",
    "answers": [
      4
    ],
    "objective": "107.2",
    "explanation": "Un timer activa por defecto el servicio homónimo, pero Unit= permite elegir otra unidad compatible.",
    "topic": 107,
    "choices": [
      "Las unidades de temporizador solo se pueden definir dentro del archivo de una unidad de servicio.",
      "El comando ejecutado por el temporizador se especifica en la sección [Cmd] de la unidad de temporizador.",
      "Un servicio de sistema dedicado, systemd-cron, maneja la ejecución de las unidades de temporizador.",
      "Las unidades de temporizador solo existen en el ámbito del sistema y no están disponibles para los usuarios.",
      "Cada temporizador activa una unidad: por defecto, el servicio homónimo, salvo que Unit= indique otra."
    ],
    "correction": "Un timer no está obligado a activar siempre un servicio: Unit= puede seleccionar otra unidad."
  },
  {
    "id": "daypo-102-023",
    "exam": "102",
    "sourceIndex": 23,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "6611763b7a17aae523fe8bdb5787fb6aec52c5c6787c4cc8028953acebf74638",
    "type": "multiple",
    "prompt": "¿Cuáles de los siguientes campos están disponibles en el formato estándar tanto del archivo global /etc/crontab como de los archivos crontab específicos del usuario? (Elija dos opciones).",
    "answers": [
      1,
      4
    ],
    "objective": "107.2",
    "explanation": "Ambos formatos contienen los campos temporales y la orden; /etc/crontab añade un campo de usuario.",
    "topic": 107,
    "choices": [
      "Año",
      "Minuto",
      "Nombre de usuario",
      "ID de grupo efectivo",
      "Comando"
    ]
  },
  {
    "id": "daypo-102-024",
    "exam": "102",
    "sourceIndex": 24,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "91c81cdc8b08a59afc2489b4cb57c80b253ae8021e29ba2a79f89373cac9f3e9",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos cambia específicamente la categoría de locale de los mensajes a portugués (pt), suponiendo que la configuración regional esté disponible?",
    "answers": [
      1
    ],
    "objective": "107.3",
    "explanation": "LC_MESSAGES es la categoría de locale para los mensajes. LANGUAGE es además una preferencia específica que admite GNU gettext.",
    "topic": 107,
    "choices": [
      "export LANGUAGE=\"pt\"",
      "export LC_MESSAGES=\"pt\"",
      "export UI_MESSAGES=\"pt\"",
      "export MESSAGE=\"pt\"",
      "export ALL_MESSAGES=\"pt\""
    ],
    "correction": "Se pregunta específicamente por la categoría de locale de mensajes; LANGUAGE también influye en GNU gettext."
  },
  {
    "id": "daypo-102-025",
    "exam": "102",
    "sourceIndex": 25,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "093e4e9dcc9f4ff5d328932a4f6009730bbb98196614d20e8fb06d103dc21dbb",
    "type": "single",
    "prompt": "¿Cuál de los siguientes archivos asigna un usuario a su grupo principal?",
    "answers": [
      2
    ],
    "objective": "107.1",
    "explanation": "El cuarto campo de passwd contiene el GID del grupo principal de la cuenta.",
    "topic": 107,
    "choices": [
      "/etc/pgroup",
      "/etc/shadow",
      "/etc/passwd",
      "/etc/group",
      "/etc/gshadow"
    ]
  },
  {
    "id": "daypo-102-026",
    "exam": "102",
    "sourceIndex": 26,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "6c093cf717811107763954a51ae3fd829afcea1b2c99a70d1b0f8cec9a93cf50",
    "type": "single",
    "prompt": "¿Cuál de los siguientes pasos impide que un usuario obtenga una sesión de inicio de sesión interactiva?",
    "answers": [
      1
    ],
    "objective": "107.1",
    "explanation": "Una shell como /bin/false impide una sesión interactiva normal; no equivale a eliminar todos los accesos posibles a servicios.",
    "topic": 107,
    "choices": [
      "Establecer el UID del usuario en 0.",
      "Ejecutar el comando chsh -s /bin/false con el nombre de usuario.",
      "Eliminar al usuario del grupo staff.",
      "Agregar al usuario a /etc/noaccess.",
      "Crear un archivo .nologin en el directorio de inicio del usuario."
    ]
  },
  {
    "id": "daypo-102-027",
    "exam": "102",
    "sourceIndex": 27,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "2d142bc7b262efeebd81759208bd9d90941761a9a9920bbdb84a00e92bc05f6f",
    "type": "written",
    "prompt": "¿Qué comando incluido en systemd permite seleccionar mensajes del diario systemd según criterios como la hora o el nombre de la unidad? (Especifique solo el comando sin ninguna ruta ni parámetros).",
    "answers": [
      "journalctl"
    ],
    "objective": "108.2",
    "explanation": "journalctl consulta el journal y permite filtrar por unidad, tiempo y otros campos.",
    "topic": 108
  },
  {
    "id": "daypo-102-028",
    "exam": "102",
    "sourceIndex": 28,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "c5d31330c48366e53e159b1b73b6635a71eda90cca27b2a6232324a1f6bd337e",
    "type": "multiple",
    "prompt": "¿Cuáles de las siguientes afirmaciones sobre systemd-journald son verdaderas? (Elija tres opciones).",
    "answers": [
      2,
      3,
      4
    ],
    "objective": "108.2",
    "explanation": "journald conserva metadatos y facilities de syslog y puede reenviar mensajes a un servicio syslog.",
    "topic": 108,
    "choices": [
      "Es incompatible con syslog y no se puede instalar en un sistema que utilice syslog normal.",
      "Solo procesa mensajes de systemd y no mensajes de otras herramientas.",
      "Puede pasar mensajes de registro a syslog para su posterior procesamiento.",
      "Mantiene metadatos como _UID o _PID para cada mensaje.",
      "Admite funciones de syslog como kern, user y auth."
    ]
  },
  {
    "id": "daypo-102-029",
    "exam": "102",
    "sourceIndex": 29,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "f07efbcf88cfd204860da58a8769333dfbea6761516ddec8285099deab797493",
    "type": "written",
    "prompt": "¿Qué comando se debe ejecutar después de agregar un nuevo alias de correo electrónico a la configuración para que este cambio sea efectivo? (Especifique el comando sin ninguna ruta pero incluyendo todos los parámetros requeridos).",
    "answers": [
      "newaliases"
    ],
    "objective": "108.3",
    "explanation": "newaliases reconstruye la base de alias utilizada por un MTA compatible.",
    "topic": 108
  },
  {
    "id": "daypo-102-030",
    "exam": "102",
    "sourceIndex": 30,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "b7fdec160c1b1e74ab80cf938a79f05e32629c26e73c09eeed6229906f4f3842",
    "type": "single",
    "prompt": "¿Qué opción del archivo de configuración de chrony cambia el intervalo inicial de sondeos a un servidor NTP para acelerar la sincronización inicial?",
    "answers": [
      0
    ],
    "objective": "108.1",
    "explanation": "iburst solicita varios sondeos iniciales rápidos para obtener antes una estimación de la hora.",
    "topic": 108,
    "choices": [
      "iburst",
      "quickstart",
      "fast",
      "fsync",
      "flood"
    ]
  },
  {
    "id": "daypo-102-031",
    "exam": "102",
    "sourceIndex": 31,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "e404f234f5c70c89fba7b8f1d1dcc782a9f86fa8bf24cfe70942c8a71066ed93",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos se utiliza para rotar, comprimir y enviar por correo los registros del sistema?",
    "answers": [
      0
    ],
    "objective": "108.2",
    "explanation": "logrotate administra rotación, compresión, conservación y otras acciones sobre registros.",
    "topic": 108,
    "choices": [
      "logrotate",
      "striplog",
      "syslogd --rotate",
      "rotatelog",
      "logger"
    ]
  },
  {
    "id": "daypo-102-032",
    "exam": "102",
    "sourceIndex": 32,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "d9c1235c9cab136d5f582d5a5865f643770e31f1da664628606268f8f9d9f32e",
    "type": "single",
    "prompt": "¿Por qué es importante la configuración correcta de la zona horaria de un sistema?",
    "answers": [
      4
    ],
    "objective": "107.3",
    "explanation": "La zona horaria cambia la conversión y presentación de una marca de tiempo, no el instante que esta representa.",
    "topic": 107,
    "choices": [
      "Porque la zona horaria se incluye en los cálculos de suma de comprobación y los cambios de zona horaria invalidan las sumas de comprobación existentes.",
      "Porque la zona horaria se guarda como parte de las horas de modificación de los archivos y no se puede cambiar después de crear un archivo.",
      "Porque las variables de entorno LANG y LC_MESSAGES están, de manera predeterminada, configuradas de acuerdo con la zona horaria.",
      "Porque NTP elige servidores cercanos en función de la zona horaria configurada.",
      "Porque la conversión de las marcas de tiempo de Unix a la hora local depende de la configuración de la zona horaria."
    ]
  },
  {
    "id": "daypo-102-033",
    "exam": "102",
    "sourceIndex": 33,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "cc63f1ad0e0c810717e31a02b898b54e1cd8e15ea17093251dbd27b31f904653",
    "type": "written",
    "prompt": "¿Qué comando, disponible con todos los MTA compatibles con sendmail, se utiliza para listar el contenido de la cola de correo del MTA? (Especifique solo el comando sin ninguna ruta ni parámetros).",
    "answers": [
      "mailq"
    ],
    "objective": "108.3",
    "explanation": "mailq muestra la cola de correo de un MTA compatible con esta interfaz.",
    "topic": 108
  },
  {
    "id": "daypo-102-034",
    "exam": "102",
    "sourceIndex": 34,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "7500d0c7f03c4158908f2301652c64332c86c410b3fdfef6d7084c2c22b4fc8c",
    "type": "written",
    "prompt": "¿Cuál es el directorio de nivel superior que contiene los archivos de configuración de CUPS? (Especifique la ruta completa al\ndirectorio).",
    "answers": [
      "/etc/cups/",
      "/etc/cups"
    ],
    "objective": "108.4",
    "explanation": "La configuración de CUPS se ubica habitualmente bajo /etc/cups.",
    "topic": 108
  },
  {
    "id": "daypo-102-035",
    "exam": "102",
    "sourceIndex": 35,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "972b40d37a3ced2167838f067ebe33792526968e48779835a7bdbe7823739ed0",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos enumera todos los trabajos de impresión en cola?",
    "answers": [
      4
    ],
    "objective": "108.4",
    "explanation": "lpq presenta los trabajos pendientes de la cola de impresión seleccionada.",
    "topic": 108,
    "choices": [
      "lpd",
      "lpr",
      "lp",
      "lsq",
      "lpq"
    ]
  },
  {
    "id": "daypo-102-036",
    "exam": "102",
    "sourceIndex": 36,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "ab3f9a3283bab04fedf65baadb052111b07cb7093c80333fcd138b2adcea0232",
    "type": "single",
    "prompt": "¿Qué entradas de /etc/syslog.conf guardan todos los eventos de correo en /var/log/maillog y envían todos los eventos críticos o más graves al servidor logger.example.com?",
    "answers": [
      3
    ],
    "objective": "108.2",
    "explanation": "mail.* selecciona todo el correo y *.crit selecciona todas las facilities con prioridad crítica o más grave.",
    "topic": 108,
    "choices": [
      "mail.* /var/log/maillog\nmail,crit @logger.example.org",
      "mail.* /var/log/maillog\nmail.crit syslog://logger.example.org",
      "mail /var/log/maillog\nmail.crit @logger.example.org",
      "mail.* /var/log/maillog\n*.crit @logger.example.com",
      "mail * /var/log/maillog\nmail crit @logger.example.org"
    ],
    "correction": "Se traduce el enunciado y se corrige la regla: todos los eventos críticos usan *.crit y el servidor indicado es logger.example.com."
  },
  {
    "id": "daypo-102-037",
    "exam": "102",
    "sourceIndex": 37,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "ba8bfc4f8857bbd60f23fdf39d280bf38ac42c463e5de48fa90f534a1e904b5c",
    "type": "written",
    "prompt": "¿Qué opción del archivo /etc/ntp.conf especifica una fuente NTP externa que se consultará para obtener información de tiempo? (Especifique solo la opción sin ningún valor ni parámetro).",
    "answers": [
      "server"
    ],
    "objective": "108.1",
    "explanation": "server declara un servidor NTP remoto al que se consultará; no es el nombre de una zona horaria.",
    "topic": 108
  },
  {
    "id": "daypo-102-038",
    "exam": "102",
    "sourceIndex": 38,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "12f168084dab4331e606c42a0c666ab1a6b9863e00413ac0a4e9f64380f7828e",
    "type": "single",
    "prompt": "¿Cuál de los siguientes protocolos está relacionado con el término retransmisión abierta?",
    "answers": [
      0
    ],
    "objective": "108.3",
    "explanation": "Un open relay es un servidor de correo SMTP que permite retransmisión no autorizada.",
    "topic": 108,
    "choices": [
      "SMTP",
      "POP3",
      "NTP",
      "IMAP",
      "LDAP"
    ]
  },
  {
    "id": "daypo-102-039",
    "exam": "102",
    "sourceIndex": 39,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "e50efc46b9fe9fa73c8aa373562a54ccb1664a3195a57f3abbf65ab3993b7eac",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos muestra todas las variables de entorno y de shell?",
    "answers": [
      3
    ],
    "objective": "105.1",
    "explanation": "set muestra las variables de shell, incluidas las no exportadas. env se limita al entorno exportado.",
    "topic": 105,
    "choices": [
      "getargs",
      "lsenv",
      "ls",
      "set",
      "lsshell"
    ],
    "correction": "La respuesta correcta para todas las variables de shell y entorno es set, no env. Se restaura set como opción."
  },
  {
    "id": "daypo-102-040",
    "exam": "102",
    "sourceIndex": 40,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "aba012cff88cf19d574fdcea4aa4e61711e04aedbc6776c37f263a008f288a48",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes operadores de comparación para pruebas funciona con elementos del sistema de archivos? (Elija dos opciones).",
    "answers": [
      2,
      3
    ],
    "objective": "105.2",
    "explanation": "test -d comprueba directorios y test -f archivos regulares.",
    "topic": 105,
    "choices": [
      "-z",
      "-eq",
      "-d",
      "-f",
      "-lt"
    ]
  },
  {
    "id": "daypo-102-041",
    "exam": "102",
    "sourceIndex": 41,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "ac522f4a6da4ee74f6adccf6c14a24c69b6d3d0aa1a34a7e0e69edb569d75258",
    "type": "single",
    "prompt": "¿Qué información proporciona el comando echo $$?",
    "answers": [
      0
    ],
    "objective": "105.1",
    "explanation": "$$ contiene el PID de la shell, con los matices de las subshells de Bash.",
    "topic": 105,
    "choices": [
      "El ID de proceso del shell actual.",
      "El ID de proceso del siguiente comando.",
      "El ID de proceso del último comando ejecutado.",
      "El ID de proceso del último comando que se ha colocado en segundo plano.",
      "El ID de proceso del comando echo"
    ]
  },
  {
    "id": "daypo-102-042",
    "exam": "102",
    "sourceIndex": 42,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "29a740dbd6936a5f343fa6208af656a08813d4c794be007c8c80110d17220a1b",
    "type": "single",
    "prompt": "¿Qué comando hace que la variable de shell denominada VARIABLE sea visible para las subcapas?",
    "answers": [
      4
    ],
    "objective": "105.1",
    "explanation": "export incorpora la variable al entorno que reciben los procesos hijos.",
    "topic": 105,
    "choices": [
      "export $VARIABLE",
      "env VARIABLE",
      "set $VARIABL",
      "set VARIABLE",
      "export VARIABLE"
    ]
  },
  {
    "id": "daypo-102-043",
    "exam": "102",
    "sourceIndex": 43,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "1d82b43398bfe4252abdaf9b7ac31febce6f201feb20c4fb7d5049f94e565c39",
    "type": "single",
    "prompt": "¿Qué salida se produce con la siguiente secuencia de comandos?\necho '1 2 3 4 5 6' | while read a b c; do\necho result: $c $b $a;\ndone",
    "answers": [
      2
    ],
    "objective": "105.2",
    "explanation": "read asigna los dos primeros campos a a y b; el resto de la línea queda en c.",
    "topic": 105,
    "choices": [
      "result: 6 5 4",
      "result: 1 2 3 4 5 6",
      "result: 3 4 5 6 2 1",
      "result: 6 5 4 3 2 1",
      "result: 3 2 1"
    ],
    "correction": "Se restaura el signo : tras result en echo para que el comando coincida con las opciones de salida."
  },
  {
    "id": "daypo-102-044",
    "exam": "102",
    "sourceIndex": 44,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "e11a9e4588620a94170ccca6b94b94bc8817a3434d8bf8dd8ec3477e18fc650c",
    "type": "single",
    "prompt": "¿Cuál de los siguientes archivos de configuración se debe modificar para establecer de forma global las variables de shell para todos los usuarios?",
    "answers": [
      0
    ],
    "objective": "105.1",
    "explanation": "/etc/profile establece configuración general de las shells de login compatibles; no se aplica a cualquier proceso por sí solo.",
    "topic": 105,
    "choices": [
      "/etc/profile",
      "/etc/bashrc",
      "~/.bash_profile",
      "/etc/.bashrc",
      "/etc/shellenv"
    ]
  },
  {
    "id": "daypo-102-045",
    "exam": "102",
    "sourceIndex": 45,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "4a10da9726b6d74b20ee58ef24349b24d23ad564d60361e20ed99756d9cb8b7f",
    "type": "single",
    "prompt": "¿Qué salida produce el comando seq 10?",
    "answers": [
      4
    ],
    "objective": "105.2",
    "explanation": "seq 10 produce una secuencia desde 1 hasta 10, con un valor por línea.",
    "topic": 105,
    "choices": [
      "Un flujo continuo de números que aumentan en incrementos de 10 hasta que se detiene el comando.",
      "No crea ninguna salida porque falta un segundo parámetro.",
      "Los números del 0 al 9 con un número por línea.",
      "El número 10 a la salida estándar.",
      "Los números del 1 al 10 con un número por línea."
    ]
  },
  {
    "id": "daypo-102-046",
    "exam": "102",
    "sourceIndex": 46,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "e137e5e8393a1cb200d5771cea6e341a9d8752008c3f0449c1585749f3f80a34",
    "type": "written",
    "prompt": "¿Qué comando enumera los alias definidos en el shell Bash actual? (Especifique solo el comando sin ninguna ruta ni parámetros).",
    "answers": [
      "alias"
    ],
    "objective": "105.1",
    "explanation": "alias sin argumentos enumera los alias de la shell actual.",
    "topic": 105
  },
  {
    "id": "daypo-102-047",
    "exam": "102",
    "sourceIndex": 47,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "e70925d2a7edc8a91af139ab8461a8b215d6b2bc506c556ab8eab684e4dd07a8",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos se puede utilizar para limitar la cantidad de memoria que puede utilizar un usuario?",
    "answers": [
      3
    ],
    "objective": "110.1",
    "explanation": "ulimit administra límites de recursos de la shell y sus procesos hijos; algunos límites dependen del sistema.",
    "topic": 110,
    "choices": [
      "umask",
      "usermod",
      "passwd",
      "ulimit",
      "chag"
    ]
  },
  {
    "id": "daypo-102-048",
    "exam": "102",
    "sourceIndex": 48,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "a763dc1fbc1544d6f59204d888cf89e251ec5b7a123297f6fbd2477513115b5a",
    "type": "single",
    "prompt": "¿Cuál es el propósito de una clave de host SSH?",
    "answers": [
      2
    ],
    "objective": "110.3",
    "explanation": "La clave de host identifica al servidor SSH. No es la clave pública personal con la que se autoriza a un usuario.",
    "topic": 110,
    "choices": [
      "Debe ser enviada por cualquier cliente SSH además de una clave de usuario para identificar el host del cliente.",
      "Es la clave raíz con la que se deben firmar todas las claves SSH de usuario.",
      "Proporciona la información de identidad del servidor a los clientes SSH que se conectan.",
      "Autentica a cualquier usuario que inicie sesión en una máquina remota desde el host de la clave.",
      "La utilizan los servicios del sistema como cron, syslog o un trabajo de respaldo para conectarse automáticamente a hosts remotos."
    ]
  },
  {
    "id": "daypo-102-049",
    "exam": "102",
    "sourceIndex": 49,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "95a4b3b5a015bdcf50753225d6e32400b6c73823f7a50d10061784848f643d68",
    "type": "single",
    "prompt": "¿Cuál es el propósito de TCP Wrapper?",
    "answers": [
      4
    ],
    "objective": "110.2",
    "explanation": "TCP Wrappers restringe conexiones de servicios compatibles; no es un cortafuegos general para todos los procesos.",
    "topic": 110,
    "choices": [
      "Administrar y ajustar el ancho de banda utilizado por los servicios TCP.",
      "Vincular un servicio de red a un puerto TCP.",
      "Encapsular mensajes TCP en paquetes IP.",
      "Agregar compatibilidad con SSL a los servicios TCP de texto sin formato.",
      "Limitar el acceso a un servicio de red."
    ]
  },
  {
    "id": "daypo-102-050",
    "exam": "102",
    "sourceIndex": 50,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "cad56a4483f5ad47e09e688ebfef482b5bbd0f10b2ffcd26ab81fd28dc9904e0",
    "type": "multiple",
    "prompt": "Dado el siguiente extracto de la configuración de sudo:\njane ALL=NOPASSWD: /bin/kill, /bin/id, PASSWD: /sbin/fdisk\n¿Cuáles de las siguientes afirmaciones son verdaderas? (Elija tres).",
    "answers": [
      2,
      3,
      4
    ],
    "objective": "110.1",
    "explanation": "NOPASSWD se mantiene para kill e id; PASSWD vuelve a exigir autenticación para fdisk según la política ordinaria.",
    "topic": 110,
    "choices": [
      "Jane puede ejecutar /bin/id solo después de especificar su contraseña.",
      "Jane puede ejecutar /sbin/fdisk después de especificar la contraseña de root.",
      "Jane puede ejecutar /sbin/fdisk después de especificar su contraseña.",
      "Jane puede ejecutar /bin/kill sin especificar una contraseña.",
      "Jane puede ejecutar /bin/id sin especificar su contraseña."
    ],
    "correction": "Se sustituye el host ANY no definido por ALL, sin cambiar los comandos ni las etiquetas PASSWD y NOPASSWD."
  },
  {
    "id": "daypo-102-051",
    "exam": "102",
    "sourceIndex": 51,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "4eced610233241c81d17ecce460f9bdc81b3ca40ebc676a515a8bc70bcf5b3e6",
    "type": "single",
    "prompt": "¿Qué archivo de configuración contiene las opciones predeterminadas para los clientes SSH?",
    "answers": [
      2
    ],
    "objective": "110.3",
    "explanation": "ssh_config contiene opciones del cliente; sshd_config corresponde al servidor.",
    "topic": 110,
    "choices": [
      "/etc/ssh/sshd_config",
      "/etc/ssh/ssh",
      "/etc/ssh/ssh_config",
      "/etc/ssh/client",
      "/etc/ssh/ssh_client"
    ]
  },
  {
    "id": "daypo-102-052",
    "exam": "102",
    "sourceIndex": 52,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "6c44ac9a8b8f601570e5240228cd530c143d86307a575d07dcaad3d30fe68c9e",
    "type": "single",
    "prompt": "Según la configuración del sistema, ¿cuál de los siguientes archivos se puede utilizar para habilitar y deshabilitar los servicios de red que se ejecutan en este host?",
    "answers": [
      1
    ],
    "objective": "110.2",
    "explanation": "xinetd.conf configura el superservidor xinetd, que inicia servicios de red definidos en su configuración.",
    "topic": 110,
    "choices": [
      "/etc/profile",
      "/etc/xinetd.conf",
      "/etc/ports",
      "/etc/services",
      "/etc/host.conf"
    ]
  },
  {
    "id": "daypo-102-053",
    "exam": "102",
    "sourceIndex": 53,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "3f8dd106118325d621faf49c93b7b7d1e3f884d00611fe563305265247296471",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos puede identificar el PID de un proceso que abrió un puerto TCP?",
    "answers": [
      3
    ],
    "objective": "110.1",
    "explanation": "lsof permite relacionar descriptores abiertos, sockets y procesos; algunos datos requieren privilegios.",
    "topic": 110,
    "choices": [
      "ptrace",
      "stracedebug",
      "debug",
      "lsof",
      "nessus"
    ]
  },
  {
    "id": "daypo-102-054",
    "exam": "102",
    "sourceIndex": 54,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "344ba65a7f87cecfcb41231e1fc2363c205460a252c3f9e774e590b05f348d6e",
    "type": "written",
    "prompt": "Al utilizar el reenvío X11 en SSH, ¿qué variable de entorno se configura automáticamente en el shell remoto para ayudar a las aplicaciones a conectarse al servidor X11 correcto? (Especifique solo la variable de entorno sin ningún comando o valor adicional).",
    "answers": [
      "DISPLAY"
    ],
    "objective": "110.3",
    "explanation": "El reenvío X11 configura DISPLAY en la sesión remota para apuntar al extremo del túnel creado por SSH.",
    "topic": 110
  },
  {
    "id": "daypo-102-055",
    "exam": "102",
    "sourceIndex": 55,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "df9e07ae49cb327a23985b7814b9c9edeb83ab8baf6df12c4e9304ff7d65bdd8",
    "type": "written",
    "prompt": "¿La presencia de qué archivo impedirá temporalmente que todos los usuarios excepto root inicien sesión en un sistema? (Especifique el nombre completo del archivo, incluida la ruta).",
    "answers": [
      "/etc/nologin"
    ],
    "objective": "110.2",
    "explanation": "/etc/nologin permite impedir temporalmente accesos de usuarios ordinarios en los mecanismos de login que lo consultan.",
    "topic": 110
  },
  {
    "id": "daypo-102-056",
    "exam": "102",
    "sourceIndex": 56,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "76c390a0947d3e090c810d718906d379194e5ab3a10783f3c5b46e4af731545f",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos actúa como agente que mantiene las identidades SSH para utilizarlas en conexiones posteriores?",
    "answers": [
      4
    ],
    "objective": "110.3",
    "explanation": "ssh-agent mantiene identidades para autenticación; ssh-add añade claves al agente.",
    "topic": 110,
    "choices": [
      "sshd",
      "ssh-keyring",
      "ssh-keygen",
      "ssh-pki",
      "ssh-agent"
    ],
    "correction": "Se aclara la función del agente: ssh-agent mantiene las identidades y ssh-add añade las claves."
  },
  {
    "id": "daypo-102-057",
    "exam": "102",
    "sourceIndex": 57,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "ca1ce8266b4071b3b47d3e4624c9e35a3ed5abd631192578eebca105053a1a05",
    "type": "single",
    "prompt": "En una máquina que ejecuta varios servidores X, ¿cómo identifican los programas las diferentes instancias del servidor X11?",
    "answers": [
      1
    ],
    "objective": "106.1",
    "explanation": "Los nombres de display incluyen un número de servidor, como :1, y opcionalmente una pantalla.",
    "topic": 106,
    "choices": [
      "Mediante un UUID fijo que se define en el archivo de configuración X11.",
      "Mediante un nombre de display como :1.",
      "Mediante el nombre del usuario que ejecuta el servidor X como x11:bob.",
      "Mediante un nombre de dispositivo como /dev/X11/xservers/1.",
      "Mediante una dirección IPv6 única de la subred fe80::/64"
    ],
    "correction": "Se restaura el nombre de display :1, que había quedado mal separado en la traducción."
  },
  {
    "id": "daypo-102-058",
    "exam": "102",
    "sourceIndex": 58,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "ffbba017b4f5246faafc5c8f8031aa1509d03ee41042bfbc2312c6c095544c78",
    "type": "single",
    "prompt": "¿Cuál es el propósito de un lector de pantalla?",
    "answers": [
      4
    ],
    "objective": "106.3",
    "explanation": "Un lector de pantalla presenta el contenido mediante voz o braille para facilitar el acceso no visual.",
    "topic": 106,
    "choices": [
      "Administra los teclados virtuales en las pantallas táctiles.",
      "Lee los parámetros de los monitores conectados y crea una configuración X11 adecuada.",
      "Muestra líneas y marcadores para ayudar a las personas a utilizar técnicas de lectura rápida.",
      "Administra y muestra archivos que contienen libros electrónicos.",
      "Lee el texto que se muestra para satisfacer las necesidades de las personas ciegas o con discapacidad visual."
    ]
  },
  {
    "id": "daypo-102-059",
    "exam": "102",
    "sourceIndex": 59,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "f7cd8a98c99a2eabf217471f223b6d387ce91c96677620974c8b17e04b2f3548",
    "type": "single",
    "prompt": "El archivo de configuración X11 xorg.conf se agrupa en secciones. ¿Cómo se representa el contenido de la sección SectionName?",
    "answers": [
      2
    ],
    "objective": "106.1",
    "explanation": "La sintaxis de X.Org delimita cada bloque con Section \"nombre\" y EndSection.",
    "topic": 106,
    "choices": [
      "Se coloca entre llaves como en la sección SectionName {…}.",
      "Se coloca entre las etiquetas <Section name=\"SectionName\"> y </Section>.",
      "Se coloca entre una línea Section \"SectionName\" y una línea EndSection.",
      "Se coloca después de la fila [SectionName].",
      "Se coloca después de una sección inicial sin sangría \"SectionName\" y debe tener una sangría de exactamente un carácter de tabulación."
    ],
    "correction": "Se conserva el token literal Section de la sintaxis X.Org, sin traducirlo."
  },
  {
    "id": "daypo-102-060",
    "exam": "102",
    "sourceIndex": 60,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "7a95b4a862798adb3fc6ea48a22316661272bdd92847bf5d8813011ac4aab695",
    "type": "multiple",
    "prompt": "¿Cuáles de las siguientes funciones ofrece SPICE? (Elija dos opciones).",
    "answers": [
      0,
      1
    ],
    "objective": "106.2",
    "explanation": "SPICE proporciona acceso gráfico remoto y redirección de dispositivos USB; no instala aplicaciones locales como función equivalente.",
    "topic": 106,
    "choices": [
      "Conectar dispositivos USB locales a aplicaciones remotas.",
      "Acceder a aplicaciones gráficas en un host remoto.",
      "Reemplazar Xorg como servidor X11 local.",
      "Descargar e instalar localmente aplicaciones desde una máquina remota.",
      "Cargar y ejecutar un programa binario en una máquina remota."
    ],
    "correction": "Se corrige la clave SPICE: las funciones son acceso gráfico y redirección USB, no instalar aplicaciones locales."
  },
  {
    "id": "daypo-102-061",
    "exam": "102",
    "sourceIndex": 61,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "72b619f0c187eab4ea53f84ea4154945ba86efadd7520d74b4d98d74f1ef7c1c",
    "type": "single",
    "prompt": "¿Dónde se almacena el journal de systemd?",
    "answers": [
      2
    ],
    "objective": "108.2",
    "explanation": "/run/log/journal es volátil; /var/log/journal se utiliza para almacenamiento persistente.",
    "topic": 108,
    "choices": [
      "/var/jlog/ y /var/jlogd/",
      "/proc/log/ y /proc/klog/",
      "/run/log/journal/ o /var/log/journal/",
      "/var/log/syslog.bin o /var/log/syslog.jrn",
      "/etc/systemd/journal/ o /usr/lib/systemd/journal/"
    ],
    "correction": "Se corrige «qué» por «dónde»: las opciones son rutas donde se guarda el journal."
  },
  {
    "id": "daypo-102-062",
    "exam": "102",
    "sourceIndex": 62,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "81abd83ca19c97235615367e96315d8e2ba8caeb442ff17257bbb52b84e3400d",
    "type": "single",
    "prompt": "¿Cuál de las siguientes afirmaciones es verdadera con respecto al comando sendmail?",
    "answers": [
      4
    ],
    "objective": "108.3",
    "explanation": "Los MTA habituales proporcionan una interfaz sendmail compatible, aunque su implementación interna sea distinta.",
    "topic": 108,
    "choices": [
      "Con cualquier MTA, el comando sendmail debe ser ejecutado periódicamente por el demonio cron.",
      "Cuando se utiliza systemd, sendmail es un alias de relayctl.",
      "El comando sendmail imprime el historial de la cola del MTA de los correos que se han enviado correctamente.",
      "Solo está disponible cuando el MTA sendmail está instalado.",
      "Todos los MTA comunes, incluidos Postfix y Exim, proporcionan un comando sendmail."
    ]
  },
  {
    "id": "daypo-102-063",
    "exam": "102",
    "sourceIndex": 63,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "3b652eb53c2f0f831c8d088f47de456e0241f4e9cb77a334296e2db03e9cb43f",
    "type": "single",
    "prompt": "¿Qué archivo dentro del directorio de configuración de CUPS contiene la configuración de las impresoras?",
    "answers": [
      2
    ],
    "objective": "108.4",
    "explanation": "printers.conf contiene las definiciones de impresoras administradas por CUPS.",
    "topic": 108,
    "choices": [
      "cups-devices.conf",
      "snmp.conf",
      "printers.conf",
      "printcap.conf"
    ],
    "correction": "Se retira una copia de la opción incorrecta printcap.conf, que aparecía duplicada."
  },
  {
    "id": "daypo-102-064",
    "exam": "102",
    "sourceIndex": 64,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "eb0a07b464052cde3d3fea62a440d67827958b14c3152a8664107999a0722299",
    "type": "written",
    "prompt": "¿Qué archivo procesa newaliases? (Especifique el nombre completo del archivo, incluida la ruta).",
    "answers": [
      "/etc/mail/aliases",
      "/etc/aliases"
    ],
    "objective": "108.3",
    "explanation": "La ruta de aliases depende del MTA y la distribución: son habituales /etc/aliases y /etc/mail/aliases.",
    "topic": 108,
    "correction": "Se admiten las dos rutas habituales de aliases, que dependen del MTA y la distribución."
  },
  {
    "id": "daypo-102-065",
    "exam": "102",
    "sourceIndex": 65,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "2f99dc0917abc7a683af4d8fea6ffb75564c79d849023fc1a3e18c0256ddfe88",
    "type": "multiple",
    "prompt": "¿Cuáles de las siguientes son funciones de syslog? (Elija dos opciones).",
    "answers": [
      0,
      2
    ],
    "objective": "108.2",
    "explanation": "local5 y mail son facilities de syslog; no deben confundirse con prioridades como err.",
    "topic": 108,
    "choices": [
      "local5",
      "accounting",
      "mail",
      "postmaster",
      "remote"
    ]
  },
  {
    "id": "daypo-102-066",
    "exam": "102",
    "sourceIndex": 66,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "2ff30faf7aac7072a69e92f1408b250d44ded1c7d28bb62163eb9c288d3045e6",
    "type": "multiple",
    "prompt": "¿Cuáles de los siguientes parámetros se utilizan para que journalctl limite el período de tiempo de la salida? (Elija dos opciones).",
    "answers": [
      0,
      2
    ],
    "objective": "108.2",
    "explanation": "--since y --until delimitan el intervalo temporal que consulta journalctl.",
    "topic": 108,
    "choices": [
      "--since=",
      "--from=",
      "--until=",
      "--upto=",
      "--date="
    ]
  },
  {
    "id": "daypo-102-067",
    "exam": "102",
    "sourceIndex": 67,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "1676a621d7282e5ac8ba5e9918a7309d9a6a11b637e4eb0f7cecf2eb08199674",
    "type": "single",
    "prompt": "¿Qué es cierto con respecto al archivo ~/.forward?",
    "answers": [
      0
    ],
    "objective": "108.3",
    "explanation": "Un sistema de entrega local compatible puede usar ~/.forward para dirigir el correo a otros destinatarios.",
    "topic": 108,
    "choices": [
      "Cuando se configura correctamente, ~/.forward se puede utilizar para reenviar cada correo entrante a uno o más\ndestinatarios.",
      "Después de editar ~/.forward, el usuario debe ejecutar newaliases para que el servidor de correo esté al tanto de los\ncambios.",
      "Al utilizar ~/.forward, el usuario root puede configurar cualquier dirección de correo electrónico, mientras que los demás usuarios pueden configurar solo\nsus propias direcciones.",
      "Como ~/.forward es propiedad del MTA y el usuario no puede escribir sobre él, se debe editar con el comando\neditaliases.",
      "De forma predeterminada, solo se procesan los archivos ~/.forward de los usuarios del grupo mailq, mientras que se ignoran los archivos ~/\n.forward de todos los demás usuarios."
    ]
  },
  {
    "id": "daypo-102-068",
    "exam": "102",
    "sourceIndex": 68,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "929662c6ebba2109a607bb881d67bd3a079c53c897677d026d71368184b32551",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes comandos muestra una lista de trabajos en la cola de impresión? (Elija dos).",
    "answers": [
      2,
      4
    ],
    "objective": "108.4",
    "explanation": "lpq y lpstat permiten consultar trabajos de impresión; las opciones de lpstat seleccionan qué información mostrar.",
    "topic": 108,
    "choices": [
      "cups --list",
      "lprm -l",
      "lpstat",
      "lpr -q",
      "lpq"
    ]
  },
  {
    "id": "daypo-102-069",
    "exam": "102",
    "sourceIndex": 69,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "99027c749a9f0d0b64f7ec15586195fdf3e76a112d7625e2212b94b237de5d5e",
    "type": "multiple",
    "prompt": "En un sistema que utiliza systemd-journald, ¿cuál de los siguientes comandos agrega el mensaje Howdy al registro del sistema? (Elija dos opciones).",
    "answers": [
      1,
      2
    ],
    "objective": "108.2",
    "explanation": "logger envía un mensaje al registro; systemd-cat conecta la salida de una orden con el journal.",
    "topic": 108,
    "choices": [
      "append Howdy",
      "logger Howdy",
      "systemd-cat echo Howdy",
      "echo Howdy > /dev/journal",
      "journalctl add Howdy"
    ]
  },
  {
    "id": "daypo-102-070",
    "exam": "102",
    "sourceIndex": 70,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "d249c03dfd08e86dd5b34d30c3362c28a76db91d2dd6e60f32abb05d33dede7c",
    "type": "multiple",
    "prompt": "¿Cuál de las siguientes opciones en el archivo de configuración de chrony define fuentes de tiempo remotas? (Elija dos)",
    "answers": [
      3,
      4
    ],
    "objective": "108.1",
    "explanation": "server identifica un servidor y pool permite obtener varias fuentes del nombre de un conjunto de servidores.",
    "topic": 108,
    "choices": [
      "source",
      "clock",
      "remote",
      "pool",
      "server"
    ]
  },
  {
    "id": "daypo-102-071",
    "exam": "102",
    "sourceIndex": 71,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "11899bd132eb269551571da3e6648266d6a7e5cadd30c845cdb9c518a49d110b",
    "type": "written",
    "prompt": "¿Qué comando se utiliza para sincronizar el reloj del hardware con el reloj del sistema? (Especifique solo el comando sin ninguna ruta ni parámetros).",
    "answers": [
      "hwclock"
    ],
    "objective": "108.1",
    "explanation": "hwclock sincroniza ambos relojes según la opción: --systohc escribe el hardware y --hctosys ajusta el sistema.",
    "topic": 108
  },
  {
    "id": "daypo-102-072",
    "exam": "102",
    "sourceIndex": 72,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "a4e28c6573909a5a4af46f85420e161eda484cd79806435e4f7efcd588fc140c",
    "type": "single",
    "prompt": "¿Cuál de las siguientes situaciones observa y corrige un cliente NTP?",
    "answers": [
      4
    ],
    "objective": "108.1",
    "explanation": "El cliente NTP estima y corrige el desfase respecto a sus fuentes de referencia, además de ajustar la deriva.",
    "topic": 108,
    "choices": [
      "El desfase horario entre el reloj del sistema y el reloj del hardware del equipo.",
      "La ubicación física y la configuración de la zona horaria.",
      "Cambios en la zona horaria de la ubicación actual del equipo.",
      "Ajuste necesario para admitir el horario de verano.",
      "El desfase horario entre el reloj del sistema y el reloj de referencia."
    ]
  },
  {
    "id": "daypo-102-073",
    "exam": "102",
    "sourceIndex": 73,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "091e56dc89698557bdcb78d895756d7aaabdb96f91950352010a54fa2fd89a97",
    "type": "single",
    "prompt": "Si existe un alias ls, ¿cuál de los siguientes comandos actualiza el alias para que apunte al comando ls -l en lugar del destino actual del alias?",
    "answers": [
      1
    ],
    "objective": "105.1",
    "explanation": "Volver a definir un alias con el mismo nombre sustituye su definición anterior.",
    "topic": 105,
    "choices": [
      "set ls='ls -l'",
      "alias ls='ls -l'",
      "alias --force ls='ls -l'",
      "alias --update ls ls='ls -l'",
      "realias ls='ls -l'."
    ]
  },
  {
    "id": "daypo-102-074",
    "exam": "102",
    "sourceIndex": 74,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "24dd9fbc330d9bb4421e102c3560f5bb23c9e838cf7bd7690daf6e5ffdf75341",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos coloca la salida del comando date en la variable de shell mydate?",
    "answers": [
      3
    ],
    "objective": "105.1",
    "explanation": "$(date) ejecuta date y sustituye la expresión por su salida, retirando los saltos finales.",
    "topic": 105,
    "choices": [
      "mydate=\"date\"",
      "mydate=\"exec date\"",
      "mydate=\"$((date))\"",
      "mydate=\"$(date)\"",
      "mydate=\"${date}\""
    ]
  },
  {
    "id": "daypo-102-075",
    "exam": "102",
    "sourceIndex": 75,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "56b08c6fc7efa7ac89bdf89c10f30a4e6929db2a66835770bf4e09f97c944964",
    "type": "single",
    "prompt": "¿Qué información muestra el comando echo $?",
    "answers": [
      1
    ],
    "objective": "105.1",
    "explanation": "$? contiene el estado de salida del último comando ejecutado en ese contexto.",
    "topic": 105,
    "choices": [
      "El ID de proceso del comando echo.",
      "El valor de salida del comando ejecutado inmediatamente antes de echo.",
      "El ID de proceso que se utilizará para el próximo comando.",
      "El valor de salida del comando echo",
      "El ID de proceso del shell actual."
    ]
  },
  {
    "id": "daypo-102-076",
    "exam": "102",
    "sourceIndex": 76,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "e464b31ffdce759cad5be5725c3b7cef8403c1b4305755b7bb3da79d621810d9",
    "type": "single",
    "prompt": "¿Cuál de los siguientes archivos no se lee directamente mediante un shell de inicio de sesión de Bash?",
    "answers": [
      0
    ],
    "objective": "105.1",
    "explanation": "Una shell Bash de login no lee .bashrc directamente; un archivo de login puede cargarlo expresamente.",
    "topic": 105,
    "choices": [
      "~/.bashrc",
      "~/.bash_profile",
      "~/.bash_login",
      "~/.profile",
      "/etc/profile"
    ]
  },
  {
    "id": "daypo-102-077",
    "exam": "102",
    "sourceIndex": 77,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "b1051f4207b16b890dc318c91cc2f22c074d8526f1ee701e43266f0eaa594e73",
    "type": "single",
    "prompt": "¿Qué es cierto acerca del archivo .profile en el directorio personal de un usuario?",
    "answers": [
      2
    ],
    "objective": "105.1",
    "explanation": ".profile contiene instrucciones con sintaxis de shell; debe ser compatible con las shells que lo utilicen.",
    "topic": 105,
    "choices": [
      "Debe ser ejecutable.",
      "Debe llamar al binario del shell de inicio de sesión.",
      "Debe utilizar una sintaxis de script de shell válida.",
      "Debe comenzar con un shebang.",
      "Debe ser legible solo para su propietario."
    ]
  },
  {
    "id": "daypo-102-078",
    "exam": "102",
    "sourceIndex": 78,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "157240887f01937a3e1ab26b23d5f18969b2bb116295c6b8aed9839161eb8848",
    "type": "multiple",
    "prompt": "¿Qué es cierto con respecto a la afirmación que comienza con #! que se encuentra en la primera línea del script? (Elija dos opciones).",
    "answers": [
      2,
      4
    ],
    "objective": "105.2",
    "explanation": "El kernel utiliza el shebang para elegir intérprete; para la shell, esa línea se interpreta como comentario.",
    "topic": 105,
    "choices": [
      "Impide que los scripts se ejecuten hasta que se elimine el signo !.",
      "Activa la instalación del intérprete del script.",
      "Especifica la ruta y los argumentos del intérprete utilizado para ejecutar el script.",
      "Define la codificación de caracteres del script.",
      "Es un comentario que el intérprete del script ignora."
    ]
  },
  {
    "id": "daypo-102-079",
    "exam": "102",
    "sourceIndex": 79,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "809bbbe52de83ff4373b3a851404f7c7b9fd42a3f877389508aac2381dce0379",
    "type": "single",
    "prompt": "¿Qué salida produce el comando seq 1 5 20?",
    "answers": [
      1
    ],
    "objective": "105.2",
    "explanation": "seq interpreta inicio, incremento y límite: comienza en 1 y suma 5 sin superar 20.",
    "topic": 105,
    "choices": [
      "1\n5\n10\n15",
      "1\n6\n11\n16",
      "1\n2\n3\n4",
      "2\n3\n4\n5",
      "5\n10\n15\n20"
    ]
  },
  {
    "id": "daypo-102-080",
    "exam": "102",
    "sourceIndex": 80,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "fd2365ad854c8dfaeb9d9497ede2aaa7d690e78b2005cb76bf3ab7c6700aeb1b",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos enumera todas las variables y funciones definidas dentro de Bash?",
    "answers": [
      3
    ],
    "objective": "105.1",
    "explanation": "En Bash, set sin argumentos muestra variables y funciones definidas en el contexto de la shell.",
    "topic": 105,
    "choices": [
      "env",
      "export",
      "env -a",
      "set",
      "echo $ENV"
    ]
  },
  {
    "id": "daypo-102-081",
    "exam": "102",
    "sourceIndex": 81,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "1dc89a58f5bc909cf5874f9e8001e55ff420b053f91246ca8c445ef7357b1f3b",
    "type": "single",
    "prompt": "¿Qué información relacionada con una cuenta de usuario se modifica mediante el comando chage?",
    "answers": [
      3
    ],
    "objective": "107.1",
    "explanation": "chage administra los períodos de validez, los avisos y otros datos de caducidad de contraseñas.",
    "topic": 107,
    "choices": [
      "Propiedad predeterminada para los archivos nuevos",
      "Membresía de grupo",
      "Conjunto de comandos disponibles para el usuario",
      "Información de vencimiento de contraseña",
      "Permisos predeterminados para los archivos nuevos"
    ]
  },
  {
    "id": "daypo-102-082",
    "exam": "102",
    "sourceIndex": 82,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "e6c0a8bdab590b4138075e6cb13bb685e9e2c7902a20b74f2baa66266bc3fb93",
    "type": "single",
    "prompt": "¿Qué comando se utiliza para establecer restricciones en el tamaño de un archivo de núcleo que se crea para un usuario cuando falla un programa?",
    "answers": [
      3
    ],
    "objective": "110.1",
    "explanation": "ulimit -c establece el límite de tamaño de los volcados de núcleo de los procesos afectados.",
    "topic": 110,
    "choices": [
      "core",
      "edquota",
      "quota",
      "ulimit",
      "ktrace"
    ]
  },
  {
    "id": "daypo-102-083",
    "exam": "102",
    "sourceIndex": 83,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "345a94484a0f425f13227619e8df7218372741d4eaddfaec2fdd6e95ac5a3290",
    "type": "single",
    "prompt": "¿Cómo mejoran las contraseñas shadow la seguridad de las contraseñas en comparación con las contraseñas estándar sin shadow?",
    "answers": [
      0
    ],
    "objective": "107.1",
    "explanation": "Separar los hashes en shadow permite restringir su lectura sin ocultar la información pública de passwd.",
    "topic": 107,
    "choices": [
      "Los usuarios normales no tienen acceso a los hashes de contraseñas shadow.",
      "Cada contraseña shadow es válida durante 45 días y debe cambiarse después.",
      "La clave de host del sistema se utiliza para cifrar todas las contraseñas shadow.",
      "Las contraseñas shadow siempre se combinan con una clave pública que debe coincidir con la clave privada del usuario.",
      "Las contraseñas shadow se almacenan en texto sin formato y se pueden comprobar para detectar contraseñas débiles."
    ]
  },
  {
    "id": "daypo-102-084",
    "exam": "102",
    "sourceIndex": 84,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "3cdb94d49a8fe223c9f0fea5d210e2df1406f4e6520808bf217e683508a10939",
    "type": "single",
    "prompt": "Después de editar la configuración del contenedor TCP para otorgar acceso a un servicio a hosts específicos, ¿cuándo entran en vigencia estos cambios?",
    "answers": [
      4
    ],
    "objective": "110.2",
    "explanation": "Los servicios que consultan TCP Wrappers comprueban sus reglas para las conexiones nuevas.",
    "topic": 110,
    "choices": [
      "La nueva configuración entra en vigencia después de reiniciar el servicio respectivo.",
      "La nueva configuración entra en vigencia en el siguiente reinicio del sistema.",
      "La nueva configuración entra en vigencia cuando se cierra la última conexión establecida con el servicio.",
      "La nueva configuración entra en vigencia después de reiniciar el servicio tcpd.",
      "La nueva configuración entra en vigencia inmediatamente para todas las conexiones nuevas."
    ]
  },
  {
    "id": "daypo-102-085",
    "exam": "102",
    "sourceIndex": 85,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "2895c9ed48c90fd4520e51cc1b9f33ddfa814a1738918c9025775a7710b063df",
    "type": "multiple",
    "prompt": "¿Qué es cierto con respecto a las claves SSH públicas y privadas? (Elija dos opciones).",
    "answers": [
      1,
      3
    ],
    "objective": "110.3",
    "explanation": "La clave pública se puede distribuir; la privada debe generarse y custodiarse sin exponerla a terceros.",
    "topic": 110,
    "choices": [
      "Para cada cuenta de usuario, existe exactamente un par de claves que se puede utilizar para iniciar sesión en esa cuenta.",
      "La clave privada nunca debe revelarse a nadie.",
      "Se pueden generar varias claves públicas diferentes para la misma clave privada.",
      "El par de claves debe generarse y custodiarse de forma que solo su propietario pueda acceder a la clave privada.",
      "Para permitir inicios de sesión remotos, la clave privada del usuario debe copiarse al servidor remoto."
    ],
    "correction": "Se sustituye la obligación absoluta de generar personalmente la clave por la recomendación precisa de generación y custodia sin exponer la privada."
  },
  {
    "id": "daypo-102-086",
    "exam": "102",
    "sourceIndex": 86,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "76adf02ea94ba4c32c67cbff7c4aac14e2ef20883d4849c2b4f06a88cb55163d",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos encuentra todos los archivos propiedad de root que tienen el bit SetUID establecido?",
    "answers": [
      0
    ],
    "objective": "110.1",
    "explanation": "find combina el propietario root y el bit SUID mediante -user root y -perm -4000.",
    "topic": 110,
    "choices": [
      "find / -user root -perm -4000",
      "find / -user 0 -mode +s",
      "find / -owner root -setuid",
      "find / -owner 0 -permbits 0x100000000",
      "find / --filter uid=1 --filter pers=u+s"
    ]
  },
  {
    "id": "daypo-102-087",
    "exam": "102",
    "sourceIndex": 87,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "da8aa9ae43a5b1c86060d81aeb4e794ad35a63176aaa461784cce81154e79a41",
    "type": "written",
    "prompt": "¿Qué comando se utiliza para agregar claves privadas OpenSSH a una instancia de ssh-agent en ejecución? (Especifique solo el nombre del comando sin ninguna ruta).",
    "answers": [
      "ssh-add"
    ],
    "objective": "110.3",
    "explanation": "ssh-add incorpora identidades al agente; no genera por sí mismo un nuevo par de claves.",
    "topic": 110
  },
  {
    "id": "daypo-102-088",
    "exam": "102",
    "sourceIndex": 88,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "b97f3a1ce4c6b35b5c2fb24b8294935485185e8797041ac74cf6704ea16167f4",
    "type": "written",
    "prompt": "¿Qué directorio contiene los archivos de configuración para los servicios xinetd? (Especifique la ruta completa al directorio).",
    "answers": [
      "/etc/xinetd.d/",
      "/etc/xinetd.d"
    ],
    "objective": "110.2",
    "explanation": "/etc/xinetd.d contiene habitualmente los archivos de configuración individuales de los servicios de xinetd.",
    "topic": 110
  },
  {
    "id": "daypo-102-089",
    "exam": "102",
    "sourceIndex": 89,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "88928a4e65df15e4a5aef10c24b2c759be6fc67e3ae58ad515bfeb8e6849a0c5",
    "type": "single",
    "prompt": "¿Qué mecanismo utiliza ssh para interactuar con el agente SSH?",
    "answers": [
      4
    ],
    "objective": "110.3",
    "explanation": "SSH_AUTH_SOCK indica el socket por el que el cliente puede comunicarse con su agente.",
    "topic": 110,
    "choices": [
      "Conectarse al puerto 2222, que es utilizado por el agente SSH de todo el sistema.",
      "Utilizar el socket fijo .ssh-agent/ipc.",
      "Crear un alias que reemplace ssh con llamadas a ssh-agent.",
      "Iniciar ssh-agent como un proceso secundario para cada invocación de ssh.",
      "Evaluar variables de entorno como SSH_AUTH_SOCK."
    ]
  },
  {
    "id": "daypo-102-090",
    "exam": "102",
    "sourceIndex": 90,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "acce747fb3d125c23409c59378c7e1289de04caf8f64f57fe84257fbf84b7f0c",
    "type": "written",
    "prompt": "¿Qué parámetro del comando ssh especifica la ubicación de la clave privada utilizada para los intentos de inicio de sesión?\n(Especifique solo el nombre de la opción sin ningún valor ni parámetro)",
    "answers": [
      "-i"
    ],
    "objective": "110.3",
    "explanation": "-i selecciona el archivo de identidad. La pregunta pide solo la opción, no la orden completa.",
    "topic": 110,
    "correction": "La pregunta pide solo la opción: se acepta -i, no la orden ssh -i completa."
  },
  {
    "id": "daypo-102-091",
    "exam": "102",
    "sourceIndex": 91,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "d1a7b406f86e645c458945daab516f2231b0a5ef691c7001b78e342032f55992",
    "type": "single",
    "prompt": "¿Cuál de las siguientes afirmaciones es verdadera sobre IPv6?",
    "answers": [
      0
    ],
    "objective": "109.1",
    "explanation": "IPv6 no utiliza broadcast; emplea multicast y otros mecanismos para sus funciones de descubrimiento.",
    "topic": 109,
    "choices": [
      "IPv6 ya no admite direcciones de difusión.",
      "Con IPv6, los números de puerto TCP de la mayoría de los servicios han cambiado.",
      "Las direcciones IPv4 se pueden utilizar sin ningún cambio con IPv6",
      "IPv6 ya no admite direcciones de multidifusión.",
      "Para IPv6, UDP y TCP han sido reemplazados por el Protocolo de transmisión rápida (RTP)."
    ]
  },
  {
    "id": "daypo-102-092",
    "exam": "102",
    "sourceIndex": 92,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "9eac4a5a3bdd31815fe0c91b8c0829ee374a9b11085178f65afc5af9338de2d9",
    "type": "single",
    "prompt": "Suponiendo que el SSID está disponible y se dispone de las credenciales necesarias, ¿qué intenta hacer el siguiente comando?\nnmcli device wifi connect WIFIoI",
    "answers": [
      2
    ],
    "objective": "109.2",
    "explanation": "nmcli device wifi connect intenta conectar al SSID indicado y crear un perfil si hace falta; requiere una red disponible y credenciales válidas.",
    "topic": 109,
    "choices": [
      "NetworkManager abre un nuevo punto de acceso público con el SSID WIFIoI.",
      "NetworkManager crea una nueva interfaz de red virtual no configurada denominada WIFIoI.",
      "NetworkManager crea una nueva conexión wifi WIFIoI y la activa.",
      "NetworkManager devuelve un error en caso de que la conexión WIFIoI no exista.",
      "NetworkManager devuelve un error porque WIFIoI es un dispositivo wifi no válido"
    ],
    "correction": "Se explicitan las condiciones necesarias para conectar: SSID disponible y credenciales válidas, si hacen falta."
  },
  {
    "id": "daypo-102-093",
    "exam": "102",
    "sourceIndex": 93,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "369a439bd9c58c975ba15c44f04ef45ce4bb544f9f6622e2ad5d80daf847da0b",
    "type": "single",
    "prompt": "¿Cuál de los comandos siguientes podría haber producido el siguiente resultado?",
    "answers": [
      2
    ],
    "objective": "109.4",
    "explanation": "En la imagen, QUESTION SECTION solicita IN NS. El SOA de AUTHORITY no cambia el tipo de pregunta realizada.",
    "topic": 109,
    "choices": [
      "dig -t mx www.example.org",
      "dig www.example.org",
      "dig -t ns www.example.org",
      "dig -t a www.example.org",
      "dig -t soa www.example.org"
    ],
    "image": {
      "src": "/images/lpic-daypo-102-093.jpg",
      "alt": "Salida de dig: QUESTION SECTION contiene www.example.org., IN, NS; la sección de autoridad devuelve un registro SOA de example.org."
    }
  },
  {
    "id": "daypo-102-094",
    "exam": "102",
    "sourceIndex": 94,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "c9fe802968550c527c722c69f11a2573b621cf9b034b44c2f2f11ed68f217549",
    "type": "written",
    "prompt": "¿Qué parámetro falta en el comando: \"ip link set ____ dev eth0\" para activar la interfaz de red eth0 previamente inactiva? (Especifique solo el parámetro sin ningún comando, ruta u opciones adicionales).",
    "answers": [
      "up"
    ],
    "objective": "109.3",
    "explanation": "up solicita activar administrativamente el enlace; no asigna por sí solo una dirección IP.",
    "topic": 109
  },
  {
    "id": "daypo-102-095",
    "exam": "102",
    "sourceIndex": 95,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "86539a3db6fd86e9545ef24900100da1d18efdc1c2d0443ffa98a648f95ee8a0",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes estados puede mostrar NetworkManager con respecto a la conectividad de red del sistema?\n(Elija dos opciones).",
    "answers": [
      1,
      2
    ],
    "objective": "109.2",
    "explanation": "NetworkManager distingue estados como full y portal al comprobar la conectividad externa.",
    "topic": 109,
    "choices": [
      "up",
      "portal",
      "full",
      "login-required",
      "firewalled"
    ]
  },
  {
    "id": "daypo-102-096",
    "exam": "102",
    "sourceIndex": 96,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "b8337f78986e735a6cad7cc8e11696b57c796c4a5a01004555b12536d6d4c761",
    "type": "multiple",
    "prompt": "¿Cuáles de las siguientes son direcciones de host válidas para la subred 203.0.113.64/28? (Elija dos)",
    "answers": [
      1,
      2
    ],
    "objective": "109.1",
    "explanation": "203.0.113.64/28 abarca .64 a .79: .64 es red, .79 broadcast y .65 a .78 son hosts.",
    "topic": 109,
    "choices": [
      "203.0.113.64",
      "203.0.113.78",
      "203.0.113.65",
      "203.0.113.80",
      "203.0.113.81"
    ]
  },
  {
    "id": "daypo-102-097",
    "exam": "102",
    "sourceIndex": 97,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "f98f2c80fc358d059c1eeb7288763d34c2d6891c8b85fb22742c9c0f0fd8ec3b",
    "type": "multiple",
    "prompt": "¿Cuál de las siguientes palabras clave se puede utilizar en el archivo /etc/resolv.conf? (Elija dos).",
    "answers": [
      2,
      3
    ],
    "objective": "109.4",
    "explanation": "resolv.conf admite nameserver para servidores DNS y search para dominios de búsqueda.",
    "topic": 109,
    "choices": [
      "substitute",
      "lookup",
      "search",
      "nameserver",
      "method"
    ],
    "correction": "Se corrige la ruta /etc/resolv/conf por /etc/resolv.conf."
  },
  {
    "id": "daypo-102-098",
    "exam": "102",
    "sourceIndex": 98,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "1a9e077c1621c2f9b9ea10161b45769f365ab75169f04dc4f7ba2a2fce50869d",
    "type": "single",
    "prompt": "¿Cómo funciona el comando ping de forma predeterminada?",
    "answers": [
      0
    ],
    "objective": "109.3",
    "explanation": "ping utiliza solicitudes y respuestas de eco ICMP; que no haya respuesta no demuestra por sí solo que el host esté apagado.",
    "topic": 109,
    "choices": [
      "Envía una solicitud de eco ICMP a un host remoto y espera recibir una respuesta de eco ICMP a cambio.",
      "Envía una solicitud ARP a un host remoto y espera recibir una respuesta ARP a cambio.",
      "Envía un paquete TCP SYN a un host remoto y espera recibir una respuesta TCP ACK a cambio.",
      "Envía un paquete de difusión a todos los hosts de la red y espera recibir, entre otras cosas, una respuesta del\nsistema de destino.",
      "Envía un paquete UDP al puerto 0 del host remoto y espera recibir una respuesta de error UDP a cambio."
    ]
  },
  {
    "id": "daypo-102-099",
    "exam": "102",
    "sourceIndex": 99,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "86f4c3e9c560c3db8482c2cc16f95de49370302ff6bc8e7e056722bf11ae21a7",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes comandos muestra la cantidad de bytes transmitidos y recibidos a través de la interfaz de red eth0? (Elija dos).",
    "answers": [
      3,
      4
    ],
    "objective": "109.3",
    "explanation": "ifconfig e ip -s link muestran contadores de interfaz, incluidos los bytes recibidos y transmitidos.",
    "topic": 109,
    "choices": [
      "route -v via eth0",
      "ip stats show dev eth0",
      "netstat -s -i eth0",
      "ifconfig eth0",
      "ip -s link show eth0"
    ]
  },
  {
    "id": "daypo-102-100",
    "exam": "102",
    "sourceIndex": 100,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "95c4e1fa938edeb316cb984d4037f3ea30fde8f3dbc5c5fd41dac82976ef2ad0",
    "type": "single",
    "prompt": "Dada la siguiente tabla de enrutamiento:\n¿Cómo se manejaría un paquete saliente al destino 192.168.2.150?",
    "answers": [
      3
    ],
    "objective": "109.3",
    "explanation": "La ruta específica a 192.168.2.0/24 utiliza 192.168.1.1 por eth0 y gana a la ruta predeterminada.",
    "topic": 109,
    "choices": [
      "Se pasaría al enrutador predeterminado 192.168.178.1 en wlan0.",
      "Se transmitiría directamente en el dispositivo eth0.",
      "Se pasaría al enrutador predeterminado 255.255.255.0 en eth0.",
      "Se pasaría al enrutador 192.168.1.1 en eth0.",
      "Se transmitiría directamente en el dispositivo wlan0."
    ],
    "image": {
      "src": "/images/lpic-daypo-102-100.jpg",
      "alt": "Tabla de rutas: default vía 192.168.178.1 por wlan0; 192.168.1.0/24 directa por eth0; 192.168.2.0/24 vía 192.168.1.1 por eth0; 192.168.178.0/24 directa por wlan0."
    }
  },
  {
    "id": "daypo-102-101",
    "exam": "102",
    "sourceIndex": 101,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "8accf9c0001df39eb8cbfa83151a1b2b2da203915cd648a2f82da3c86c949200",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes comandos eliminará la puerta de enlace predeterminada de la tabla de enrutamiento IP del sistema?\n(Elija dos).",
    "answers": [
      1,
      2
    ],
    "objective": "109.3",
    "explanation": "route del default e ip route del default retiran una ruta predeterminada coincidente del kernel.",
    "topic": 109,
    "choices": [
      "ifconfig unset default",
      "route del default",
      "ip route del default",
      "netstat -r default",
      "sysctl ipv4.default_gw=0"
    ]
  },
  {
    "id": "daypo-102-102",
    "exam": "102",
    "sourceIndex": 102,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "4fa51d9a397292cf514f36f0170d9e4d9a5876c185bccb41b8f220be89009086",
    "type": "written",
    "prompt": "¿Qué comando habilita una interfaz de red según la configuración específica de la distribución, como /etc/network/interfaces o /etc/sysconfig/network-scripts/ifcfg-eth0? (Especifique solo el comando sin ninguna ruta ni parámetros).",
    "answers": [
      "ifup"
    ],
    "objective": "109.2",
    "explanation": "ifup aplica el perfil definido por el mecanismo de red correspondiente; los archivos concretos dependen de la distribución.",
    "topic": 109
  },
  {
    "id": "daypo-102-103",
    "exam": "102",
    "sourceIndex": 103,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "319d01ea3bf36881b0f46fbca2544483604eafab19f17805f43084b134402a50",
    "type": "multiple",
    "prompt": "En Debian, con el plugin ifupdown de NetworkManager configurado con managed=false, ¿cuáles de las siguientes afirmaciones son correctas? (Elige dos.)",
    "answers": [
      2,
      4
    ],
    "objective": "109.2",
    "explanation": "Con ifupdown y managed=false, NetworkManager deja sin gestionar las interfaces declaradas en interfaces; sus plugins determinan cómo leer perfiles.",
    "topic": 109,
    "choices": [
      "NetworkManager reconfigura todas las interfaces de red para utilizar DHCP a menos que estén específicamente administradas por NetworkManager.",
      "NetworkManager debe estar habilitado explícitamente para cada interfaz que debe administrar.",
      "NetworkManager, de manera predeterminada, no cambia las interfaces que ya están configuradas.",
      "NetworkManager deshabilita todas las interfaces que no fueron configuradas por NetworkManager.",
      "NetworkManager se puede configurar para utilizar la configuración de la interfaz de red de la distribución."
    ],
    "correction": "Se acota la pregunta al plugin ifupdown con managed=false y se corrige la clave: la gestión no exige habilitar individualmente todas las interfaces."
  },
  {
    "id": "daypo-102-104",
    "exam": "102",
    "sourceIndex": 104,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "9c6a1b467252c6cd22c8211490521f9efb7e3ba0dacb1eb2c6bef3c7f150af36",
    "type": "single",
    "prompt": "¿Qué puerto TCP estandarizado utilizan los servicios HTTPS?",
    "answers": [
      3
    ],
    "objective": "109.1",
    "explanation": "El puerto TCP estándar de HTTPS es 443; una aplicación puede configurarse para usar otro.",
    "topic": 109,
    "choices": [
      "25",
      "80",
      "8080",
      "443",
      "636"
    ]
  },
  {
    "id": "daypo-102-105",
    "exam": "102",
    "sourceIndex": 105,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "7547d38dafdb621f17e10b5f751d6abca7616e4621e3cfd749f53e719764ff64",
    "type": "multiple",
    "prompt": "¿Cuál de las siguientes variables de entorno se puede definir en locale.conf? (Elija dos).",
    "answers": [
      1,
      4
    ],
    "objective": "107.3",
    "explanation": "locale.conf admite LANG y LC_TIME, pero no permite configurar LC_ALL en ese archivo.",
    "topic": 107,
    "choices": [
      "LC_ALL",
      "LANG",
      "LC_UTF8",
      "LC_GEOGRAPHY",
      "LC_TIME"
    ],
    "correction": "locale.conf no admite LC_ALL. Se incorpora LANG y se corrige la pareja válida a LANG y LC_TIME."
  },
  {
    "id": "daypo-102-106",
    "exam": "102",
    "sourceIndex": 106,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "577fc849be0a8d5d6dc570ee74ffc7e47ec4bc0ca7335957e5ff8f229d3a346b",
    "type": "single",
    "prompt": "¿Cuál de los siguientes comandos establece la zona horaria del sistema en la hora del este de Canadá?",
    "answers": [
      4
    ],
    "objective": "107.3",
    "explanation": "El enlace a los datos de Canada/Eastern selecciona esa zona para convertir la hora del sistema en hora local.",
    "topic": 107,
    "choices": [
      "localegen -t -f /usr/share/zoneinfo/Canada/Eastern > /etc/locate.tz",
      "tzconf /etc/localtime",
      "sysctl -w clock.tz='Canada/Eastern'",
      "modprobe tz_ca_est",
      "ln -sf /usr/share/zoneinfo/Canada/Eastern /etc/localtime"
    ]
  },
  {
    "id": "daypo-102-107",
    "exam": "102",
    "sourceIndex": 107,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "4149dbd8027014095397c48094a11cea301bdc454adcc5895cc976a25f4b9560",
    "type": "written",
    "prompt": "¿Qué opción de useradd crea un nuevo directorio de inicio de usuario y lo aprovisiona con un conjunto de archivos estándar?\n(Especifique solo el nombre de la opción sin ningún valor ni parámetro).",
    "answers": [
      "-m",
      "--create-home"
    ],
    "objective": "107.1",
    "explanation": "useradd -m crea el directorio personal e incorpora los archivos de plantilla configurados.",
    "topic": 107,
    "correction": "Se admite la forma larga --create-home además de -m."
  },
  {
    "id": "daypo-102-108",
    "exam": "102",
    "sourceIndex": 108,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "5bb5c32ea0c87c2ffabfc23158f3d815d12b7f6028a3f0fc27f73ee4f053ea89",
    "type": "single",
    "prompt": "Si no existe /etc/at.allow, ¿cómo se puede evitar que un usuario específico programe tareas con at?",
    "answers": [
      3
    ],
    "objective": "107.2",
    "explanation": "at.deny excluye usuarios cuando no existe una lista at.allow que tenga prioridad.",
    "topic": 107,
    "choices": [
      "Agregando el usuario específico al archivo /etc/at.allow.",
      "Agregando el usuario específico a la sección [deny] del archivo /etc/atd.conf.",
      "Agregando el usuario específico al grupo nojobs.",
      "Agregando el usuario específico al archivo /etc/at.deny.",
      "Ejecutando el comando atd --deny [user]."
    ],
    "correction": "Se explicita que no existe at.allow, porque esa lista tiene prioridad sobre at.deny."
  },
  {
    "id": "daypo-102-109",
    "exam": "102",
    "sourceIndex": 109,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "b6a8f3914ceb97c40189dfa6da15dedcb74cfdb1fca6519e1a60bd032ab6b2ab",
    "type": "single",
    "prompt": "¿Qué archivo contiene los datos del último cambio de contraseña de un usuario?",
    "answers": [
      4
    ],
    "objective": "107.1",
    "explanation": "shadow conserva el día del último cambio y los campos de caducidad de contraseña.",
    "topic": 107,
    "choices": [
      "/etc/gshadow",
      "/etc/passwd",
      "/etc/pwdlog",
      "/var/log/shadow",
      "/etc/shadow"
    ]
  },
  {
    "id": "daypo-102-110",
    "exam": "102",
    "sourceIndex": 110,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "80425addedf0cd974d7d53f4fee6621c8f4083944906611c7176b30834917885",
    "type": "multiple",
    "prompt": "¿Cuál de los siguientes campos se puede encontrar en el archivo /etc/group? (Elija dos opciones).",
    "answers": [
      1,
      2
    ],
    "objective": "107.1",
    "explanation": "group contiene nombre, marcador de contraseña, GID y lista de miembros suplementarios; no enumera necesariamente los miembros por grupo principal.",
    "topic": 107,
    "choices": [
      "El directorio de inicio del grupo.",
      "La lista de usuarios que pertenecen al grupo.",
      "El nombre del grupo.",
      "La lista de control de acceso (ACL) predeterminada del grupo.",
      "La descripción del grupo."
    ]
  },
  {
    "id": "daypo-102-111",
    "exam": "102",
    "sourceIndex": 111,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "f142e00846614128b27dfcd1d4e5f179aaf334982be364dce5a7549ab5cde1d4",
    "type": "single",
    "prompt": "¿Cuál de las siguientes secciones existe en una unidad de temporizador systemd?",
    "answers": [
      1
    ],
    "objective": "107.2",
    "explanation": "[Timer] agrupa las opciones específicas del temporizador, junto a las secciones generales que correspondan.",
    "topic": 107,
    "choices": [
      "[Events]",
      "[Timer]",
      "[cron]",
      "[Schedule]",
      "[Trigger]"
    ]
  },
  {
    "id": "daypo-102-112",
    "exam": "102",
    "sourceIndex": 112,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "6cea0cb82ffa77dbcca53acc5a73b6c2f9af0d299068e94270ce51d3bf08ae2f",
    "type": "single",
    "prompt": "¿Cuál de las siguientes invocaciones de getent enumera todos los usuarios existentes?",
    "answers": [
      2
    ],
    "objective": "107.1",
    "explanation": "getent passwd consulta las fuentes de cuentas configuradas por NSS, no solo el archivo passwd local.",
    "topic": 107,
    "choices": [
      "getent homes",
      "getent uids",
      "getent passwd",
      "getent users",
      "getent logins"
    ]
  },
  {
    "id": "daypo-102-113",
    "exam": "102",
    "sourceIndex": 113,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "5d47b14f24f11cd71eb63c529dd467ebd89d919b9972567f07fa7739896a8f77",
    "type": "single",
    "prompt": "Dada la siguiente entrada del crontab del usuario:\n15 14 * * 1-5 /usr/local/bin/example.sh\n¿Cuándo se ejecutará el script /usr/local/bin/example.sh?",
    "answers": [
      4
    ],
    "objective": "107.2",
    "explanation": "Los campos indican minuto 15, hora 14 y días semanales del 1 al 5: de lunes a viernes.",
    "topic": 107,
    "choices": [
      "A las 14:15 hora local, de enero a mayo.",
      "A las 15:14 hora local, del 1.º al 5.º día del mes.",
      "A las 14:15 hora local, de febrero a junio.",
      "A las 14:15 hora local, del 1.º al 5.º día del mes.",
      "A las 14:15 hora local, de lunes a viernes."
    ]
  },
  {
    "id": "daypo-102-114",
    "exam": "102",
    "sourceIndex": 114,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "32455d421611b6f91419faad4ca1cc379db82b9bc6d31f7524741a8e05c597ce",
    "type": "single",
    "prompt": "En Cronie, si no existen cron.allow ni cron.deny en /etc/, ¿cuál de las siguientes afirmaciones es verdadera?",
    "answers": [
      1
    ],
    "objective": "107.2",
    "explanation": "En Cronie, si faltan ambos archivos, el comportamiento documentado permite crontab únicamente al superusuario.",
    "topic": 107,
    "choices": [
      "Sin configuración adicional, todos los usuarios pueden crear crontabs específicos para el usuario.",
      "Sin configuración adicional, solo root puede crear crontabs específicos para el usuario.",
      "El demonio cron se negará a iniciarse e informará de los archivos faltantes en el archivo de registro del sistema.",
      "Cuando un usuario crea un crontab específico para el usuario, el administrador del sistema debe aprobarlo explícitamente.",
      "La configuración predeterminada de /etc/crond.conf define si los crontabs específicos para el usuario están permitidos o no."
    ],
    "correction": "Se identifica Cronie: el comportamiento sin cron.allow ni cron.deny depende de la implementación de cron."
  },
  {
    "id": "daypo-102-115",
    "exam": "102",
    "sourceIndex": 115,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "9e7b8e48bcc6ce4adeb51c658eb86ecef83a9c19ccc8168fbeffd88be8d67c23",
    "type": "single",
    "prompt": "¿Cuál es el propósito del comando iconv?",
    "answers": [
      2
    ],
    "objective": "107.3",
    "explanation": "iconv convierte texto entre codificaciones de caracteres; no traduce su idioma.",
    "topic": 107,
    "choices": [
      "Convierte imágenes de mapa de bits de un formato a otro, como PNG a JPEG.",
      "Verifica que el árbol de directorios raíz se compile según todas las convenciones del Estándar de jerarquía del sistema de archivos (FHS).",
      "Convierte archivos de un conjunto de caracteres a otro.",
      "Cambia el modo de un inodo en el sistema de archivos ext4.",
      "Muestra información meta adicional de los archivos de iconos que terminan en .ico."
    ]
  },
  {
    "id": "daypo-102-116",
    "exam": "102",
    "sourceIndex": 116,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "b094e5e50f83663efdb23aa5261e936d485070a05554f34ba7062150bc4ba4e8",
    "type": "single",
    "prompt": "¿Qué carácter en el campo de contraseña de /etc/passwd se utiliza para indicar que la contraseña cifrada está almacenada en /etc/shadow?",
    "answers": [
      4
    ],
    "objective": "107.1",
    "explanation": "x en el segundo campo de passwd indica que los datos de contraseña se consultan en shadow.",
    "topic": 107,
    "choices": [
      "*",
      "-",
      "s",
      "#",
      "x"
    ]
  },
  {
    "id": "daypo-102-117",
    "exam": "102",
    "sourceIndex": 117,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "ed126636261ca89082951886a9eab9f01134458770a7f568de3f0317276b2b4a",
    "type": "single",
    "prompt": "¿A qué se refiere el término Braille Display?",
    "answers": [
      3
    ],
    "objective": "106.3",
    "explanation": "Una línea braille usa puntos físicos móviles para representar caracteres de forma táctil.",
    "topic": 106,
    "choices": [
      "¿Un tema gráfico estandarizado de alto contraste para aplicaciones de escritorio?",
      "Un entorno de escritorio Linux similar a KDE y GNOME.",
      "Una tecnología de visualización heredada reemplazada por LCD.",
      "Una representación física de caracteres mediante pequeños puntos.",
      "Un formato de archivo estándar para el intercambio de datos, similar a XML."
    ]
  },
  {
    "id": "daypo-102-118",
    "exam": "102",
    "sourceIndex": 118,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "45a47d75d6a3582e5d9884b6404d502e5c19a5c9895613a35bb7643852b1fd29",
    "type": "written",
    "prompt": "¿Qué variable de entorno utiliza un cliente X11 para determinar el servidor X al que conectarse? (Especifique solo\nel nombre de la variable sin ningún comando o valor precedente).",
    "answers": [
      "DISPLAY"
    ],
    "objective": "106.1",
    "explanation": "DISPLAY identifica el servidor y la pantalla de destino de una aplicación X11.",
    "topic": 106
  },
  {
    "id": "daypo-102-119",
    "exam": "102",
    "sourceIndex": 119,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "d53f5028f0b02fe7ddd0d49a3bd1dad2589ddb0850fb421ef0afcaf0845575db",
    "type": "multiple",
    "prompt": "¿Cuáles de las siguientes tareas se gestionan mediante un administrador de pantalla como XDM o KDM? (Elija dos opciones).",
    "answers": [
      1,
      4
    ],
    "objective": "106.1",
    "explanation": "El display manager gestiona la autenticación gráfica y el inicio de la sesión del usuario.",
    "topic": 106,
    "choices": [
      "Configurar dispositivos adicionales, como nuevos monitores o proyectores, cuando se conectan.",
      "Iniciar y preparar el entorno de escritorio para el usuario.",
      "Crear un archivo de configuración X11 para los dispositivos gráficos y monitores actuales.",
      "Bloquear la pantalla cuando el usuario estuvo inactivo durante un período de tiempo configurable.",
      "Gestionar el inicio de sesión de un usuario."
    ],
    "correction": "Se corrige KMD por KDM."
  },
  {
    "id": "daypo-102-120",
    "exam": "102",
    "sourceIndex": 120,
    "sourceUrl": "https://www.daypo.com/lpic-102-500.html",
    "sourceSha256": "834f82934c22d84a23966f4a828a441f312b427b55dc1467a48b7251c76b32b0",
    "type": "single",
    "prompt": "¿Cuál de los siguientes protocolos está diseñado para acceder a la salida de la tarjeta de vídeo de una máquina virtual?",
    "answers": [
      3
    ],
    "objective": "106.2",
    "explanation": "SPICE proporciona acceso remoto a la salida gráfica y a otros dispositivos de una máquina virtual.",
    "topic": 106,
    "choices": [
      "KDE",
      "X11",
      "Xfce",
      "SPICE",
      "XDMCP"
    ]
  }
];
