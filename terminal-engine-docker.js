export default {
  mode: 'docker',
  environment: {
    eyebrow: 'SANDBOX · DOCKER',
    heading: 'Terminal Docker',
    machine: 'MÁQUINA · DOCKER-HOST',
    os: 'Rocky Linux 9 · Docker host',
    cheat: 'CHEATSHEET · DOCKER',
    practice: 'PRÁCTICAS GUIADAS · DOCKER',
    host: 'docker-host',
    description: 'Un host Linux limpio para instalar Docker y practicar contenedores, imágenes, Dockerfiles, redes, volúmenes, recursos y Compose.'
  },
  commandSet: 'linux-docker',
  commands: ['docker','docker-compose','dockerd','jq'],
  map: { zone: 'docker', title: 'TALLER DE CONTENEDORES', accent: '#3b82a0' }
};
