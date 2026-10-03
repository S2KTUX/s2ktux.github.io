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
  assert.equal(module.desc, '');
  assert.equal(module.video, '');
  assert.equal(module.topics.length, 0);
});
const html = read('cursos/kubernetes-cka/index.html');
assert.deepEqual(
  [...html.matchAll(/class="module-index" aria-hidden="true">(\d+)<\/span>/g)].map(match => match[1]),
  Array.from(modules, module => module.n)
);
assert.equal((html.match(/class="module-row coming"/g) || []).length, 35);
assert.equal((html.match(/PRÓXIMAMENTE/g) || []).length, 35);
assert.doesNotMatch(html, /CLASE 35|Simulacro|0 apartados|guía escrita|class="module-description"/i);
assert.match(html, /name="robots" content="noindex,follow"/);
assert.deepEqual(fs.readdirSync(path.join(root, 'cursos/kubernetes-cka')), ['index.html']);
const routesContext = { window: {} };
vm.runInNewContext(read('learning-routes.js'), routesContext);
assert.ok(!Object.keys(routesContext.window.S2KTUX_LEARNING_ROUTES.lessons).some(key => key.startsWith('kubernetes:')));
assert.match(read('cursos.html'), /35 clases/);
console.log('✓ Kubernetes: clases 00–34, sin simulacro ni contenido; diseño y estado pendiente conservados.');
