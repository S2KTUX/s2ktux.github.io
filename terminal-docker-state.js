const IMAGE_COMMANDS = Object.freeze({
  nginx: "/docker-entrypoint.sh nginx -g 'daemon off;'",
  httpd: 'httpd-foreground',
  mariadb: 'docker-entrypoint.sh mariadbd',
  mysql: 'docker-entrypoint.sh mysqld',
  postgres: 'docker-entrypoint.sh postgres',
  redis: 'docker-entrypoint.sh redis-server',
  alpine: '/bin/sh',
  ubuntu: '/bin/bash',
  debian: '/bin/bash',
  'hello-world': '/hello',
});

export const DOCKER_REGISTRY_CATALOG = Object.freeze([
  {name:'alpine',description:'A minimal Docker image based on Alpine Linux',stars:'11K',official:true,size:'7.8MB',layers:['4abcf2066143']},
  {name:'alpine/git',description:'A simple git container running in Alpine Linux',stars:'240',official:false,size:'28MB',layers:['4abcf2066143','d6a8c3b56f41']},
  {name:'alpinelinux/docker-cli',description:'Docker CLI in an Alpine Linux image',stars:'190',official:false,size:'42MB',layers:['4abcf2066143','51c8c8a42d6f']},
  {name:'nginx',description:'Official build of Nginx',stars:'21K',official:true,size:'192MB',layers:['c6b49c7dca7c','b0b2a5e23e61','9b5e1e5aa1b8','4f4fb700ef54']},
  {name:'nginxinc/nginx-unprivileged',description:'Unprivileged NGINX image',stars:'190',official:false,size:'191MB',layers:['c6b49c7dca7c','1e4fcb927968']},
  {name:'httpd',description:'The Apache HTTP Server Project',stars:'5.1K',official:true,size:'148MB',layers:['8a1e25ce7c4f','c7b7c2d5f4e1','dd3f31b31b31']},
  {name:'debian',description:'Debian is a Linux distribution composed of free software',stars:'5.3K',official:true,size:'117MB',layers:['e4fff0779e6d']},
  {name:'ubuntu',description:'Ubuntu is a Debian-based Linux operating system',stars:'17K',official:true,size:'78.1MB',layers:['c920ba4cfca0']},
  {name:'rockylinux',description:'The official Rocky Linux image',stars:'190',official:true,size:'206MB',layers:['a42f6fe7c35d']},
  {name:'busybox',description:'Busybox base image',stars:'3.5K',official:true,size:'4.3MB',layers:['80bfbb8a41a2']},
  {name:'mariadb',description:'MariaDB Server is a high performing open source database',stars:'6.2K',official:true,size:'410MB',layers:['e2a8cdd1a724','7b41c9a6041e','c0ffeece2757','585b9b9e2e34']},
  {name:'mysql',description:'MySQL is a widely used open source relational database',stars:'16K',official:true,size:'602MB',layers:['a2abf6c4d29d','b2f0a90a6f92','d55a7d2a4f4d','9f2c7a07d92a']},
  {name:'postgres',description:'The PostgreSQL object-relational database system',stars:'14K',official:true,size:'435MB',layers:['44cf07d57ee4','2f3c1b2f332f','7e4d7d2f51c4']},
  {name:'redis',description:'Redis is an open source key-value store',stars:'14K',official:true,size:'138MB',layers:['9824c27679d3','b1bad32ba8af','4f4fb700ef54']},
  {name:'mongo',description:'MongoDB document databases provide high availability',stars:'11K',official:true,size:'801MB',layers:['e4fff0779e6d','a1f2c3d4e5f6','f91e9a4a32bc']},
  {name:'node',description:'Node.js is a JavaScript-based platform',stars:'14K',official:true,size:'1.1GB',layers:['e4fff0779e6d','bbca4097a1b8','fbf931c92f2d']},
  {name:'python',description:'Python is an interpreted high-level language',stars:'11K',official:true,size:'1.02GB',layers:['e4fff0779e6d','a3ed95caeb02','c1f4f9e9e7ad']},
  {name:'php',description:'PHP is a server-side scripting language',stars:'3.8K',official:true,size:'521MB',layers:['e4fff0779e6d','2296e2aa6bc3']},
  {name:'traefik',description:'Traefik cloud-native application proxy',stars:'3.4K',official:true,size:'185MB',layers:['4abcf2066143','6095c180e208']},
  {name:'rabbitmq',description:'RabbitMQ is an open source message broker',stars:'5.5K',official:true,size:'282MB',layers:['e4fff0779e6d','bf7d89f24a2f']},
  {name:'wordpress',description:'The WordPress rich content management system',stars:'7.2K',official:true,size:'702MB',layers:['e4fff0779e6d','44f9e3a5d6c1']},
  {name:'hello-world',description:'Hello World! (an example of minimal Dockerization)',stars:'2.5K',official:true,size:'13.3kB',layers:['17eec7bbc9d7']},
]);

export const defaultDockerImageCommand = (repository) => IMAGE_COMMANDS[repository] || '/bin/sh';

export const parseDockerImageReference = (reference) => {
  const raw = String(reference || '').replace(/^docker\.io\/(?:library\/)?/, '');
  const slash = raw.lastIndexOf('/');
  const colon = raw.lastIndexOf(':');
  return colon > slash
    ? { repo: raw.slice(0, colon), tag: raw.slice(colon + 1) || 'latest' }
    : { repo: raw, tag: 'latest' };
};

export const dockerRegistryMetadata = (repository) =>
  DOCKER_REGISTRY_CATALOG.find((item) => item.name === repository);
