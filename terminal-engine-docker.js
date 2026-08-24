export default {
  mode: 'docker',
  system: {
    distribution: 'Rocky Linux',
    release: '9.4',
    codename: 'Blue Onyx',
    id: 'rocky',
    kernel: '5.14.0-427.el9.x86_64',
    architecture: 'x86_64',
    docker: '29.7.2'
  },
  environment: {
    eyebrow: 'SANDBOX · DOCKER',
    heading: 'Terminal Docker',
    machine: 'MÁQUINA · DOCKER-HOST',
    os: 'Rocky Linux 9.4 · Docker host',
    cheat: 'CHEATSHEET · DOCKER',
    practice: 'PRÁCTICAS GUIADAS · DOCKER',
    host: 'docker-host',
    description: 'Un host Rocky Linux con Docker Engine listo para practicar imágenes, contenedores, Dockerfiles, redes, volúmenes, recursos y Compose.'
  },
  commandSet: 'linux-docker',
  commands: ['docker','docker-compose','jq'],
  map: { zone: 'docker', title: 'TALLER DE CONTENEDORES', accent: '#3b82a0' }
};
