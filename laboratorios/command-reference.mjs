const groups=[
 ['Archivos y texto',[
  ['pwd · ls · cd RUTA','Ver dónde estás, listar y cambiar de directorio.'],
  ['mkdir DIR · touch ARCHIVO','Crear un directorio o un archivo vacío.'],
  ['cp ORIGEN DESTINO · mv ORIGEN DESTINO','Copiar o mover.'],
  ['cat ARCHIVO · less ARCHIVO','Leer un archivo. En less, q sale.'],
  ['grep TEXTO ARCHIVO · find RUTA -name NOMBRE','Buscar texto o archivos.'],
  ['> ARCHIVO · >> ARCHIVO','Guardar una salida o añadirla al final.'],
  ['tar -czf copia.tar.gz DIR','Crear una copia comprimida con gzip.'],
  ['vi ARCHIVO','Editar: i escribe; Esc y :wq guarda y sale; :q! sale sin guardar.'],
 ]],
 ['Usuarios y permisos',[
  ['useradd -m USUARIO · passwd USUARIO','Crear una cuenta y ponerle contraseña.'],
  ['su - USUARIO · exit','Cambiar de usuario y volver a la sesión anterior.'],
  ['groupadd GRUPO · usermod -aG GRUPO USUARIO','Crear un grupo y añadir una cuenta sin quitar sus otros grupos.'],
  ['id USUARIO · ls -l ARCHIVO','Consultar grupos, propietario y permisos.'],
  ['chmod 640 ARCHIVO · chown USUARIO:GRUPO ARCHIVO','Cambiar permisos y propietario.'],
  ['umask 027','Los nuevos archivos parten normalmente de 640 y los directorios de 750. No cambia los existentes.'],
  ['chage -M 90 -m 1 -W 7 USUARIO · chage -l USUARIO','Configurar y consultar la caducidad de contraseña.'],
  ['visudo','Editar y validar las reglas de sudo.'],
 ]],
 ['Sistema y red',[
  ['systemctl status SERVICIO','Consultar un servicio. enable --now lo habilita e inicia.'],
  ['journalctl -u SERVICIO','Consultar sus registros.'],
  ['ps -ef · kill PID','Listar procesos o pedir a uno que termine.'],
  ['crontab -e · crontab -l','Editar o consultar tareas periódicas.'],
  ['ip a · ip route · nmcli con show · nmtui','Consultar direcciones, rutas y conexiones; nmtui abre un menú.'],
  ['hostnamectl set-hostname NOMBRE','Cambiar el nombre del sistema.'],
  ['curl URL · ping -c 3 HOST','Probar un servicio web o la conectividad.'],
  ['firewall-cmd --permanent --add-service=http','Permitir HTTP; aplica los cambios con firewall-cmd --reload.'],
 ]],
 ['Paquetes, discos y SELinux',[
  ['dnf install PAQUETE · dnf repolist · rpm -q PAQUETE','Instalar RPM, listar repositorios y consultar paquetes. En Debian, DNF solo gestiona los RPM de prácticas.'],
  ['lsblk -f · blkid · df -h','Identificar discos, sistemas de archivos y espacio.'],
  ['pvs · vgs · lvs','Consultar volúmenes físicos, grupos y volúmenes lógicos.'],
  ['pvcreate DISPOSITIVO · vgcreate VG DISPOSITIVO','Preparar un dispositivo libre para LVM y crear el grupo.'],
  ['lvcreate -L 256M -n datos VG','Crear un volumen lógico.'],
  ['mount DISPOSITIVO DIRECTORIO · /etc/fstab','Montar ahora; fstab define los montajes al arrancar. Formatear borra datos: identifica primero el disco de prácticas.'],
  ['getenforce · ls -Z RUTA · restorecon -Rv RUTA','Consultar SELinux, ver etiquetas y restaurarlas.'],
  ['semanage fcontext -a -t TIPO PATRÓN','Guardar una regla de contexto; restorecon la aplica.'],
  ['semanage port -a -t http_port_t -p tcp PUERTO','Permitir un puerto HTTP en SELinux. No abre el firewall.'],
 ]],
];
export function mountCommandReference(root){
 const details=document.createElement('details');details.className='lab-reference';
 const title=document.createElement('summary');title.textContent='Referencia breve de comandos';details.append(title);
 for(const [name,entries]of groups){const heading=document.createElement('h3');heading.textContent=name;details.append(heading);const list=document.createElement('dl');for(const [command,description]of entries){const dt=document.createElement('dt'),code=document.createElement('code'),dd=document.createElement('dd');code.textContent=command;dt.append(code);dd.textContent=description;list.append(dt,dd);}details.append(list);}
 root.append(details);
}
for(const root of document.querySelectorAll('[data-command-reference]'))mountCommandReference(root);
