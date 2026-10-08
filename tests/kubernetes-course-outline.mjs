import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const context = { window: {} };
vm.runInNewContext(read('courses-data.js'), context);
const modules = context.window.S2KTUX_COURSES.kubernetes.modules;
const titles = [
  'Fundamentos de Kubernetes', 'Preparación del laboratorio', 'Pods', 'ReplicaSet',
  'Deployment', 'Services', 'NameSpaces', 'Requests y limits', 'LimitRange y ResourceQuota',
  'Probes y Health Checks (Sondas)', 'Environment variables y ConfigMap', 'Secrets',
  'Volumenes', 'RBAC : Usuarios y grupos', 'ServiceAccount', 'Ingress', 'DaemonSets',
  'StatefulSets', 'Jobs y CronJobs', 'Scheduling I: nodeSelector y Node Affinity',
  'Scheduling II: Taints y Tolerations', 'NetworkPolicies', 'CoreDNS y descubrimiento de servicios',
  'Gateway API', 'Static Pods, control plane y HA esencial', 'kubeadm init y CNI',
  'kubeadm join: nodos, tokens y certificados', 'Mantenimiento y actualización del clúster',
  'Backup y restauración de etcd', 'Autoscaling: Metrics Server y HPA', 'Helm y Kustomize',
  'CRD y Operators', 'Troubleshooting de Pods', 'Troubleshooting de nodos y control plane',
  'Troubleshooting de red y almacenamiento'
];
assert.equal(modules.length, 35);
modules.forEach((module, index) => {
  assert.equal(module.n, String(index).padStart(2, '0'));
  assert.equal(module.title, titles[index]);
  if (index > 0) assert.equal(module.desc, '');
  assert.equal(module.video, '');
  assert.equal(module.topics.length, index === 0 ? 3 : 0);
});
const html = read('cursos/kubernetes-cka/index.html');
assert.deepEqual(
  [...html.matchAll(/class="module-index" aria-hidden="true">(\d+)<\/span>/g)].map(match => match[1]),
  Array.from(modules, module => module.n)
);
assert.equal((html.match(/class="module-row coming"/g) || []).length, 34);
assert.equal((html.match(/PRÓXIMAMENTE/g) || []).length, 34);
assert.doesNotMatch(html, /CLASE 35|Simulacro|0 apartados/i);
assert.match(html, /name="robots" content="index,follow,max-image-preview:large"/);
assert.deepEqual(fs.readdirSync(path.join(root, 'cursos/kubernetes-cka')).sort(), ['clase-00-fundamentos-de-kubernetes', 'index.html']);
const routesContext = { window: {} };
vm.runInNewContext(read('learning-routes.js'), routesContext);
assert.deepEqual(Object.keys(routesContext.window.S2KTUX_LEARNING_ROUTES.lessons).filter(key => key.startsWith('kubernetes:')), ['kubernetes:0']);
assert.match(read('cursos.html'), /35 clases/);
const lesson = read('cursos/kubernetes-cka/clase-00-fundamentos-de-kubernetes/index.html');
assert.match(lesson, /Clase 00 \/ 34/);
assert.match(lesson, /66 % o más/);
assert.match(lesson, /containerd/);
assert.match(lesson, /No es exclusivo de los workers/);
assert.doesNotMatch(read('_kubernetes/00/00.inc'), /<ul>[\s\S]*?<\/ul>[\s\S]*?<ul>|japonés|chino|imagen pendiente|Estado: borrador/i);
assert.equal((lesson.match(/class="lesson-section"/g) || []).length, 3);
assert.ok(fs.existsSync(path.join(root, 'images/arquitectura-kubernetes-basica.png')));
console.log('✓ Kubernetes: solo clase 00 publicada, estilo natural y arquitectura revisada; 01–34 pendientes, sin simulacro.');
