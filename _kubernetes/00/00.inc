<div class="lesson-wrapper">
  <header class="lesson-header">
    <span class="badge">KUBERNETES Clase 00</span>
    <h1>Introducción a Kubernetes y al CKA</h1>
    <p>Qué hace Kubernetes, su arquitectura básica y cómo es el examen CKA.</p>
  </header>
  <div class="lesson-layout">
    <aside class="lesson-toc">
      <h2>Contenido</h2>
      <ul>
        <li><a href="#que-es-kubernetes">1. Qué es Kubernetes</a></li>
        <li><a href="#arquitectura">2. Arquitectura</a></li>
        <li><a href="#cka">3. CKA</a></li>
      </ul>
    </aside>
    <div class="course-content">
      <section id="que-es-kubernetes" class="lesson-section">
        <h2>1. Qué es Kubernetes</h2>
        <p>Kubernetes es un proyecto de código abierto que sirve para gestionar aplicaciones que funcionan en contenedores.</p>
        <p>La idea principal es no tener que gestionar los contenedores manualmente. Nosotros indicamos lo que queremos y Kubernetes intenta mantenerlo.</p>
        <p>Es decir, queremos distribuir aplicaciones entre nodos, gestionar múltiples contenedores y tener varias réplicas de una aplicación. Si una aplicación falla, Kubernetes puede intentar recuperarla. Esto ayuda a mantenerla disponible, aunque no garantiza que nunca haya interrupciones.</p>
        <p>Un <strong>clúster</strong> es un conjunto de máquinas que trabajan juntas. Cada una de esas máquinas es un <strong>nodo</strong>, ya sea físico o virtual.</p>
        <p>Un <strong>Pod</strong> es la unidad mínima que Kubernetes gestiona. Contiene uno o más contenedores que trabajan juntos.</p>
      </section>
      <section id="arquitectura" class="lesson-section">
        <h2>2. Arquitectura</h2>
        <p>En cuanto a la arquitectura, tenemos un <strong>control plane</strong>, que sería el cerebro: coordina el clúster. Luego están los <strong>workers</strong>, que son los trabajadores: ejecutan las aplicaciones.</p>
        <p>En ambos tenemos <strong>kubelet</strong>, el agente de Kubernetes en cada nodo. Se encarga de que los Pods asignados a ese nodo estén funcionando.</p>
        <p>También tenemos el <strong>runtime de contenedores</strong>, que es el software que ejecuta los contenedores. En nuestro laboratorio usaremos <strong>containerd</strong>.</p>
        <p>En el control plane tenemos el <strong>API Server</strong>, que recibe las peticiones para consultar o cambiar el clúster. Por ejemplo, cuando usamos <code>kubectl</code>. También está <strong>etcd</strong>, la base de datos que guarda el estado y la configuración del clúster.</p>
        <p>El <strong>Scheduler</strong> elige en qué nodo ejecutar cada Pod que todavía no tiene uno asignado. El <strong>Controller Manager</strong> detecta diferencias entre lo que queremos y lo que existe, y actúa para corregirlas.</p>
        <p>Por otro lado tenemos los workers, donde ejecutaremos los Pods de nuestras aplicaciones. También tenemos <strong>kube-proxy</strong>, que mantiene reglas de red para que el tráfico de los Services llegue a los Pods. No es exclusivo de los workers: en nuestro laboratorio también puede ejecutarse en los nodos del control plane.</p>
        <p>Pongo una imagen de ejemplo que ayuda a entender cómo funciona:</p>
        <figure>
          <img src="/images/arquitectura-kubernetes-basica.png" alt="Clúster Kubernetes: el control plane coordina mediante API Server, etcd, Scheduler y Controller Manager; los workers ejecutan los Pods con kubelet, containerd y kube-proxy. El control plane también necesita kubelet y un runtime." width="1672" height="941" loading="lazy" decoding="async">
          <figcaption>Control plane y worker son roles. En el laboratorio, las aplicaciones se ejecutan en los workers.</figcaption>
        </figure>
      </section>
      <section id="cka" class="lesson-section">
        <h2>3. CKA</h2>
        <p>Este curso está pensado para adquirir un buen nivel de Kubernetes y prepararnos para la certificación <strong>CKA (Certified Kubernetes Administrator)</strong>, con la que podemos mejorar nuestro perfil profesional.</p>
        <p>El examen es parecido al RHCSA, para quienes lo hayáis hecho: es totalmente práctico, se realiza online y tenemos <strong>2 horas</strong> para completar las tareas. Podemos hacerlo en <strong>inglés</strong>, pero no está disponible en español.</p>
        <p>Como en el RHCSA, un <strong>supervisor</strong> nos vigila durante el examen. Para aprobar necesitamos una puntuación de <strong>66 % o más</strong>.</p>
        <p>No podemos navegar libremente por Internet, pero sí consultar los recursos autorizados desde el navegador del entorno del examen, como la documentación oficial de Kubernetes, Helm y Gateway API. Recomiendo tener la documentación abierta mientras hacéis los laboratorios para familiarizaros con ella.</p>
        <p>En el temario oficial, <strong>Storage</strong> supone el 10 %, <strong>Troubleshooting</strong> el 30 % y <strong>Workloads &amp; Scheduling</strong> el 15 %.</p>
        <p>El 25 % corresponde a <strong>Cluster Architecture, Installation &amp; Configuration</strong>, y el 20 % a <strong>Services &amp; Networking</strong>.</p>
        <p>El curso se basará en <strong>Kubernetes 1.35</strong>, pero la versión del examen puede cambiar según cuándo lo hagas.</p>
        <p>Referencias: <a href="https://v1-35.docs.kubernetes.io/docs/concepts/overview/components/" target="_blank" rel="noopener">arquitectura de Kubernetes</a>, <a href="https://docs.linuxfoundation.org/tc-docs/certification/faq-cka-ckad-cks" target="_blank" rel="noopener">información oficial del CKA</a>, <a href="https://docs.linuxfoundation.org/tc-docs/certification/certification-resources-allowed" target="_blank" rel="noopener">recursos permitidos</a> y <a href="https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/" target="_blank" rel="noopener">temario oficial</a>.</p>
      </section>
    </div>
  </div>
</div>
