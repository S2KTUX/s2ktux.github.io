// Solo parejas que ya piden el mismo resultado en ambos laboratorios.
// Los escenarios con otros datos o requisitos conservan su propia variante.
export const commonPractices = {
  linux: [
    {id:'sim-01',index:0,title:'Recupera la contraseña de root',goal:'Recupera el acceso a root desde GRUB y cambia su contraseña a titanio7. Al volver al sistema, SELinux debe seguir Enforcing.'},
    {id:'sim-04',index:3,title:'Apache en un puerto no estándar',goal:'Haz que Apache escuche en 8090 y responda con curl. Permite ese puerto en SELinux, conserva el contenido de /var/www/html y mantén SELinux Enforcing. El servicio debe quedar activo y habilitado.'},
    {id:'sim-05',index:4,title:'Crea usuarios, grupos y pertenencias',goal:'Crea el grupo olimpo. zeus y hera deben pertenecer a olimpo como grupo secundario; ares tendrá shell nologin y no pertenecerá a olimpo. Contraseña de los tres: cambiame1.'},
    {id:'sim-06',index:5,title:'Crea un directorio colaborativo',goal:'Crea /datos/olimpo, propiedad de root:olimpo, con permisos 2770. Los archivos nuevos deben heredar el grupo olimpo.'},
    {id:'sim-08',index:7,title:'Copia de /var/log con bzip2',goal:'Guarda /var/log en /root/varlog-backup.tar.bz2 usando tar y compresión bzip2.'},
    {id:'sim-09',index:8,title:'Copia un fichero y ajusta sus ACL',goal:'Copia /etc/hosts a /var/tmp/hosts, con propietario root:root y sin permisos de ejecución. zeus podrá leer y escribir; ares no podrá leer ni escribir, y el resto podrá leer.'},
    {id:'sim-12',index:11,title:'Extrae las líneas coincidentes',goal:'Guarda en /root/coincidencias todas las líneas de /usr/share/dict/words que contengan rich, respetando el orden y las mayúsculas.'},
    {id:'sim-13',index:12,title:'Crea un usuario con UID concreto',goal:'Crea apolo con UID 4120 y contraseña orquidea3.'},
    {id:'sim-14',index:13,title:'Permite administrar sin contraseña',goal:'Permite a zeus ejecutar cualquier comando mediante sudo sin que se le pida contraseña. La configuración debe tener sintaxis válida.'},
    {id:'sim-19',index:18,title:'Crea un script que salude',goal:'Crea /usr/local/bin/saludo, ejecutable por todos, que imprima Hola equipo olimpo. Debe ser un script Bash simple y válido.'},
  ],
  docker: [
    {id:'primer',index:1,title:'Tu primer contenedor',goal:'Deja ejecutándose en segundo plano un contenedor llamado primer-alpine basado en Alpine.'},
    {id:'ciclo',index:2,title:'Controla el ciclo de vida',goal:'Crea un contenedor llamado ciclo, detenlo, vuelve a arrancarlo y reinícialo. Déjalo activo.'},
    {id:'web',index:3,title:'Publica un servidor web',goal:'Deja activo un contenedor Nginx llamado web. Publica su puerto 80 en el puerto 8080 de esta máquina Linux y comprueba que responde.'},
    {id:'diagnostico',index:4,title:'Investiga el servidor web',goal:'Consulta la configuración, los registros, los procesos y los puertos publicados del contenedor web.'},
    {id:'build-run',index:6,title:'Ejecuta tu build',goal:'Deja funcionando miweb-app desde miweb:v1 y publica su puerto 80 en el puerto 8081 de esta máquina.'},
    {id:'exportar',index:7,title:'Etiqueta y exporta la imagen',goal:'Etiqueta miweb:v1 como alumno/miweb:1.0 y expórtala a /root/miweb-1.0.tar.'},
    {id:'volumen',index:8,title:'Conserva los datos',goal:'Crea el volumen datos y móntalo en /var/lib/app dentro de un contenedor activo llamado persistente.'},
    {id:'bind',index:9,title:'Sirve contenido del host',goal:'Crea una página en /root/site y monta ese directorio en /usr/share/nginx/html dentro de bindweb. La web debe responder en el puerto 8082.'},
    {id:'red',index:10,title:'Conecta dos contenedores',goal:'Crea labnet y conecta dos contenedores activos llamados frontend y backend. Backend será un Nginx; comprueba que frontend puede acceder a él por su nombre.'},
    {id:'limites',index:11,title:'Limita un servicio',goal:'Deja activo limitado con un máximo de 256 MiB de memoria, 0,5 CPU y política unless-stopped. Consulta su consumo.'},
    {id:'compose-scale',index:13,title:'Opera el proyecto',goal:'Consulta la configuración, los contenedores y los logs de tienda. Deja tres réplicas activas del servicio web.'},
  ],
};

export function commonPractice(mode, exercise, index) {
  const shared = commonPractices[mode]?.find(item => index === undefined ? item.id === exercise.id : item.index === index);
  return shared ? {...exercise, title:shared.title, goal:shared.goal, commonId:shared.id} : exercise;
}
