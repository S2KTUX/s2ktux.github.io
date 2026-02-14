COPIA INDEX :
----------------------------------------------------------------

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="SysRiser - Aprende sistemas y redes de forma sencilla. Prepárate para tu futuro en tecnología con nuestros cursos y proyectos prácticos.">
    <meta name="keywords" content="sistemas, redes, cursos, tecnología, Linux, proyectos, academia">
    <meta name="author" content="S2KTUX">
    <title>S2KTUX - Aprende Sistemas Linux</title>
    <link rel="stylesheet" href="/conf/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="images/favicon.png">
</head>
<body>
    <div class="gradient-bg"></div>
    <header>
        <div class="header-left">
            <a href="/index.html" class="header-logo">S2KTUX</a>
        </div>
        <nav>
            <a href="/index.html">Inicio</a>
            <a href="/cursos/cursos.html">Cursos</a>
            <a href="/proyectos/proyectos.html">Proyectos</a>
        </nav>
    </header>
    <main id="contenido">
        <!-- Sección de Bienvenida -->
        <section class="welcome-section">
            <div class="welcome-content">
                <h1>Bienvenido a S2KTUX</h1>
                <p>Tu camino hacia el dominio de sistemas comienza aquí. Aprende con cursos prácticos y proyectos reales, diseñados para prepararte para el futuro de la tecnología.</p>
                <a href="/cursos/cursos.html" class="cta-button">Explora los Cursos</a>
            </div>
        </section>
        
        <section id="terminal-section">
            <div class="terminal">
                <div class="terminal-header">
                    <div class="buttons">
                    <div class="dot red"></div>
                    <div class="dot yellow"></div>
                    <div class="dot green"></div>
                </div>
                <div class="title">s2ktux@server:/home/s2ktux</div>
            </div>
            <div id="terminal-body" class="terminal-body"></div>
            </div>
        </section>

        <!-- Sección Sobre Nosotros -->
        <section class="about-section">
            <h2>Sobre Nosotros</h2>
            <p>En S2KTUX, El objetivo es convertirnos en la academia líder en formación de sistemas y redes. Ofrecemos contenido práctico y accesible para que cualquier persona, desde principiantes hasta profesionales, pueda dominar las habilidades necesarias para el mundo tecnológico.</p>
            <p>Con un enfoque en la práctica, te ayudamos a construir una base sólida mientras trabajas en proyectos reales que puedes aplicar en tu carrera.</p>
        </section>

        <!-- Sección Primeros Pasos -->
        <section class="first-steps-section">
            <h2>Primeros Pasos: Configura tu Entorno</h2>
            <p>Si eres nuevo en sistemas y redes, aquí tienes una guía rápida para empezar:</p>
            <div class="steps-container">
                <div class="step-card">
                    <h3>Paso 1: Instala Linux</h3>
                    <p>Descarga e instala una distribución de Linux como AlmaLinux Es un sistema operativo esencial para aprender sistemas orientado a REDHAT.</p>
                </div>
                <div class="step-card">
                    <h3>Paso 2: Aprende Comandos Básicos</h3>
                    <p>Practica comandos como <code>ls</code>, <code>cd</code>, y <code>pwd</code> en la terminal para familiarizarte con el entorno.</p>
                </div>
                <div class="step-card">
                    <h3>Paso 3: Configura una Red</h3>
                    <p>Conecta tu máquina a una red y prueba comandos como <code>ping</code> para verificar la conectividad.</p>
                </div>
            </div>
        </section>

    </main>
    <footer>
        <div class="footer-content">
            <p>S2KTUX | Un lugar para aprender sistemas y redes</p>
            <div class="footer-links">
                <a href="https://github.com/s2ktux" data-tooltip="Visita nuestro GitHub">GitHub</a>
                <a href="mailto:contact@s2ktux.com" data-tooltip="Envíanos un correo">Contacto</a>
                <a href="https://linkedin.com" data-tooltip="Conéctate en LinkedIn">LinkedIn</a>
                <a href="https://www.youtube.com/@s2ktux" data-tooltip="Mira nuestros videos">YouTube</a>
            </div>
        </div>
    </footer>
    <a href="#" id="back-to-top">↑ Volver arriba</a>
    <script src="/conf/scripts.js"></script>
</body>
</html>


-------------------------------------------------------------------------------------------------
COPIA CSS
-------------------------------------------------------------------------------------------------
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    scroll-behavior: smooth;
}

body {
    font-family: 'Poppins', sans-serif;
    background-color: #f9f9f9;
    color: #1a1a1a;
    line-height: 1.6;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
}

/* Fondo estático */
.gradient-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #e6f0fa, #f0f4f8);
    z-index: -1;
    opacity: 0.5;
}

/* Barra de progreso de lectura */
.reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 4px;
    background-color: #007bff;
    z-index: 100;
    transition: width 0.3s;
}

header {
    background-color: #0056b3;
    border-bottom: 1px solid #003f87;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 10;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.header-logo {
    font-size: 24px;
    font-weight: 600;
    color: #fff;
    text-decoration: none;
}

nav {
    display: flex;
    gap: 20px;
    align-items: center;
}

nav a {
    color: #fff;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    transition: color 0.3s;
}

nav a:hover {
    color: #a3cfff;
}

/* Sección de bienvenida (index.html) */
.welcome-section {
    position: relative;
    height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80') no-repeat center center/cover;
    background-attachment: fixed;
}

.welcome-content {
    background: rgba(255, 255, 255, 0.9);
    padding: 40px;
    border-radius: 10px;
    max-width: 600px;
}

.welcome-content h1 {
    font-size: 48px;
    margin-bottom: 20px;
    color: #1a1a1a;
}

.welcome-content p {
    font-size: 18px;
    color: #3d3d3d;
    margin-bottom: 30px;
}

.cta-button {
    display: inline-block;
    padding: 15px 30px;
    background-color: #007bff;
    color: #fff;
    text-decoration: none;
    font-weight: 600;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.cta-button:hover {
    background-color: #0056b3;
}

/* Sección Sobre Nosotros (index.html) */
.about-section {
    padding: 50px 20px;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
}

.about-section h2 {
    font-size: 32px;
    margin-bottom: 20px;
    color: #1a1a1a;
}

.about-section p {
    font-size: 16px;
    color: #3d3d3d;
    margin-bottom: 15px;
}

/* Sección Primeros Pasos (index.html) */
.first-steps-section {
    padding: 50px 20px;
    background-color: #f0f4f8;
}

.first-steps-section h2 {
    font-size: 32px;
    text-align: center;
    margin-bottom: 30px;
    color: #1a1a1a;
}

.first-steps-section p {
    text-align: center;
    font-size: 16px;
    color: #3d3d3d;
    margin-bottom: 30px;
}

.steps-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
}

.step-card {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 20px;
    width: 300px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;
}

.step-card:hover {
    transform: translateY(-5px);
}

.step-card h3 {
    font-size: 20px;
    margin-bottom: 10px;
    color: #1a1a1a;
}

.step-card p {
    font-size: 14px;
    color: #3d3d3d;
}

/* Sección Testimonios (index.html) */
.testimonials-section {
    padding: 50px 20px;
    text-align: center;
}

.testimonials-section h2 {
    font-size: 32px;
    margin-bottom: 30px;
    color: #1a1a1a;
}

.testimonials-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
}

.testimonial-card {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 20px;
    width: 300px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.testimonial-card p {
    font-size: 14px;
    color: #3d3d3d;
    margin-bottom: 10px;
    font-style: italic;
}

.testimonial-card h4 {
    font-size: 16px;
    color: #1a1a1a;
}

/* Sección Suscripción (index.html) */
.subscribe-section {
    padding: 50px 20px;
    background-color: #f0f4f8;
}

.subscribe-section h2 {
    font-size: 32px;
    margin-bottom: 20px;
    color: #1a1a1a;
}

.subscribe-section p {
    font-size: 16px;
    color: #3d3d3d;
    margin-bottom: 30px;
}

.subscribe-form {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
}

.subscribe-form input {
    padding: 10px;
    width: 300px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
}

.subscribe-form button {
    padding: 10px 20px;
}

.form-note {
    font-size: 12px;
    color: #3d3d3d;
}

/* Hero */
.hero {
    padding: 30px 20px;
    text-align: center;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.5s forwards;
}

.hero h1 {
    font-size: 36px;
    margin-bottom: 10px;
    color: #1a1a1a;
}

.hero p {
    font-size: 18px;
    color: #3d3d3d;
}

main {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    position: relative;
    z-index: 10;
}

#contenido h2 {
    color: #1a1a1a;
    margin-bottom: 20px;
    font-size: 24px;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.5s forwards 0.2s;
}

/* Contenedor para las tarjetas */
.box-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
}

/* Estilo para las tarjetas (index.html) */
.course-card {
    background-color: #ffffff;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 20px;
    width: 300px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.5s forwards;
}

.course-card:nth-child(2) { animation-delay: 0.1s; }
.course-card:nth-child(3) { animation-delay: 0.2s; }
.course-card:nth-child(4) { animation-delay: 0.3s; }
.course-card:nth-child(5) { animation-delay: 0.4s; }
.course-card:nth-child(6) { animation-delay: 0.5s; }

.course-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(to right, #007bff, #00c4b4);
}

.course-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.course-card h3 {
    font-size: 20px;
    color: #1a1a1a;
    margin-bottom: 10px;
}

.course-card img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 5px;
    margin-bottom: 15px;
}

.course-card a {
    color: #007bff;
    text-decoration: none;
    font-weight: 600;
}

.course-card a:hover {
    text-decoration: underline;
}

/* Estilo para las tarjetas parallax (proyectos.html) */
.parallax-container {
    max-width: 800px;
    margin: 0 auto;
}

.parallax-card {
    display: block;
    position: relative;
    margin-bottom: 40px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.5s forwards;
    text-decoration: none;
    color: inherit;
}

.parallax-card:nth-child(2) { animation-delay: 0.1s; }
.parallax-card:nth-child(3) { animation-delay: 0.2s; }
.parallax-card:nth-child(4) { animation-delay: 0.3s; }
.parallax-card:nth-child(5) { animation-delay: 0.4s; }
.parallax-card:nth-child(6) { animation-delay: 0.5s; }

.parallax-image {
    width: 100%;
    height: 300px;
}

.parallax-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.parallax-card:hover .parallax-image img {
    transform: scale(1.05);
}

.parallax-content {
    padding: 20px;
    background-color: #fff;
    position: relative;
    z-index: 1;
}

.parallax-content h3 {
    font-size: 22px;
    color: #1a1a1a;
    margin-bottom: 10px;
}

.parallax-content p {
    color: #3d3d3d;
    font-size: 14px;
}

/* Estilo para las pestañas (cursos.html) */
.course-tabs {
    max-width: 800px;
    margin: 0 auto;
}

.tab-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    overflow-x: auto;
}

.tab-button {
    background-color: #f0f4f8;
    color: #1a1a1a;
    padding: 10px 20px;
    border: none;
    border-radius: 20px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.3s;
}

.tab-button:hover {
    background-color: #e8ecef;
    transform: scale(1.05);
}

.tab-button.active {
    background-color: #007bff;
    color: #fff;
}

.tab-content {
    display: none;
    padding: 20px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s, transform 0.3s;
}

.tab-content.active {
    display: block;
    opacity: 1;
    transform: translateY(0);
}

.tab-content p {
    color: #3d3d3d;
    font-size: 14px;
    margin-bottom: 15px;
}

.tab-content h4 {
    font-size: 16px;
    color: #1a1a1a;
    margin-bottom: 10px;
}

.tab-content ul {
    list-style: none;
    padding-left: 0;
}

.tab-content ul li {
    margin-bottom: 10px;
}

.tab-content ul li a {
    color: #007bff;
    text-decoration: none;
}

.tab-content ul li a:hover {
    text-decoration: underline;
}

.course-link {
    display: inline-block;
    margin-top: 10px;
    color: #007bff;
    text-decoration: none;
    font-weight: 600;
}

.course-link:hover {
    text-decoration: underline;
}

/* Estilo para las páginas de cursos y proyectos */
.course-page, .project-content {
    display: flex;
    gap: 20px;
    margin-top: 20px;
}

/* Sidebar para subtemas */
.sidebar {
    width: 250px;
    background-color: #fff;
    border-right: 1px solid #ddd;
    padding: 20px;
    position: sticky;
    top: 20px;
    height: fit-content;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    border-radius: 5px;
}

.sidebar h3 {
    font-size: 18px;
    color: #1a1a1a;
    margin-bottom: 15px;
}

.sidebar ul {
    list-style: none;
    padding: 0;
}

.sidebar ul li {
    margin-bottom: 10px;
}

.sidebar ul li a {
    color: #007bff;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s;
}

.sidebar ul li a:hover {
    color: #0056b3;
    text-decoration: underline;
}

.content, .project-content {
    flex: 1;
    padding: 20px;
    width: 100%;
    overflow-x: hidden;
}

.content section, .project-content section {
    margin-bottom: 40px;
}

.content h2, .project-content h2 {
    font-size: 24px;
    margin-bottom: 15px;
    color: #1a1a1a;
}

.content h3, .project-content h3 {
    font-size: 20px;
    margin-bottom: 10px;
    color: #1a1a1a;
}

.content p, .project-content p {
    margin-bottom: 15px;
    color: #3d3d3d;
    word-wrap: break-word;
}

.content ul, .project-content ul, .content ol, .project-content ol {
    list-style: disc inside;
    padding-left: 0;
    margin-left: 0;
}

.content ul li, .project-content ul li, .content ol li, .project-content ol li {
    margin-bottom: 10px;
    color: #3d3d3d;
    word-wrap: break-word;
}

.content pre, .project-content pre {
    background-color: #f0f4f8;
    padding: 10px;
    border-radius: 5px;
    overflow-x: auto;
    font-size: 14px;
    white-space: pre-wrap;
    word-wrap: break-word;
}

/* Estilo para la etiqueta <code> */
code {
    font-family: 'Courier New', Courier, monospace;
    padding: 2px 4px;
    font-size: 1em;
    line-height: inherit;
    color: #D32F2F;
}

/* Estilo para la etiqueta <strong> */
strong {
    color: #FF0000; /* Rojo más intenso que <code> (#D32F2F) */
    font-weight: bold;
}

/* Estilo para tablas */
table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

th, td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
    vertical-align: top;
}

th {
    background-color: #f0f4f8;
    font-weight: 600;
}

/* Footer */
footer {
    background-color: #0056b3;
    border-top: 1px solid #003f87;
    padding: 20px;
    text-align: center;
    margin-top: auto;
    width: 100%;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
}

.footer-content p {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.footer-links a {
    color: #a3cfff;
    text-decoration: none;
    font-weight: 600;
}

.footer-links a:hover {
    text-decoration: underline;
}

.footer-links a[data-tooltip]::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: #fff;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
}

.footer-links a:hover[data-tooltip]::after {
    opacity: 1;
}

/* Botón de volver arriba */
#back-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #007bff;
    color: #fff;
    padding: 10px 15px;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 600;
    display: none;
    transition: opacity 0.3s;
}

#back-to-top:hover {
    background-color: #0056b3;
}

/* Animaciones */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Estilo para el botón de copiar en los bloques de código */
.code-block-wrapper {
    position: relative;
}

.copy-button:hover {
    background-color: #0056b3;
}

/* Estilo para los botones de navegación entre secciones */
.nav-button:hover {
    background-color: #0056b3;
}

/* Media Queries para Responsividad */
@media (max-width: 768px) {
    header {
        flex-direction: column;
        gap: 10px;
    }

    .header-left {
        margin-bottom: 10px;
    }

    nav {
        flex-direction: column;
        gap: 10px;
    }

    .welcome-section {
        height: 60vh;
    }

    .welcome-content {
        padding: 20px;
        max-width: 90%;
    }

    .welcome-content h1 {
        font-size: 32px;
    }

    .welcome-content p {
        font-size: 16px;
    }

    .about-section {
        padding: 30px 15px;
    }

    .about-section h2 {
        font-size: 24px;
    }

    .about-section p {
        font-size: 14px;
    }

    .first-steps-section {
        padding: 30px 15px;
    }

    .first-steps-section h2 {
        font-size: 24px;
    }

    .steps-container {
        flex-direction: column;
        align-items: center;
    }

    .step-card {
        width: 100%;
        max-width: 400px;
    }

    .testimonials-section {
        padding: 30px 15px;
    }

    .testimonials-section h2 {
        font-size: 24px;
    }

    .testimonials-container {
        flex-direction: column;
        align-items: center;
    }

    .testimonial-card {
        width: 100%;
        max-width: 400px;
    }

    .subscribe-section {
        padding: 30px 15px;
    }

    .subscribe-section h2 {
        font-size: 24px;
    }

    .subscribe-form {
        flex-direction: column;
        align-items: center;
    }

    .subscribe-form input {
        width: 100%;
        max-width: 300px;
    }

    .course-page, .project-content {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
        position: static;
        border-right: none;
        border-bottom: 1px solid #ddd;
        margin-bottom: 20px;
    }

    .content, .project-content {
        padding: 15px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
    }

    .content h2, .project-content h2 {
        font-size: 20px;
    }

    .content h3, .project-content h3 {
        font-size: 18px;
    }

    .content p, .project-content p {
        font-size: 14px;
        word-wrap: break-word;
    }

    .content ul, .project-content ul, .content ol, .project-content ol {
        padding-left: 15px;
        margin-left: 0;
    }

    .content ul li, .project-content ul li, .content ol li, .project-content ol li {
        font-size: 14px;
        word-wrap: break-word;
    }

    .content pre, .project-content pre {
        font-size: 12px;
        padding: 8px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .parallax-container {
        max-width: 100%;
    }

    .parallax-card {
        margin-bottom: 20px;
    }

    .parallax-image {
        height: 200px;
    }

    .course-tabs {
        max-width: 100%;
    }

    .tab-buttons {
        flex-wrap: wrap;
        justify-content: center;
    }

    .tab-button {
        font-size: 14px;
        padding: 8px 15px;
    }

    table {
        width: 100%;
        box-sizing: border-box;
    }

    th, td {
        padding: 8px;
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
    }

    .copy-button {
        font-size: 10px;
        padding: 4px 8px;
    }
}

@media (max-width: 480px) {
    .welcome-content h1 {
        font-size: 24px;
    }

    .welcome-content p {
        font-size: 14px;
    }

    .cta-button {
        padding: 10px 20px;
        font-size: 14px;
    }

    .about-section h2 {
        font-size: 20px;
    }

    .first-steps-section h2 {
        font-size: 20px;
    }

    .testimonials-section h2 {
        font-size: 20px;
    }

    .subscribe-section h2 {
        font-size: 20px;
    }

    .hero h1 {
        font-size: 28px;
    }

    .hero p {
        font-size: 16px;
    }

    .content h2, .project-content h2 {
        font-size: 18px;
    }

    .content h3, .project-content h3 {
        font-size: 16px;
    }

    .content p, .project-content p {
        font-size: 13px;
        word-wrap: break-word;
    }

    .content ul li, .project-content ul li, .content ol li, .project-content ol li {
        font-size: 13px;
        word-wrap: break-word;
    }

    .content pre, .project-content pre {
        font-size: 11px;
        padding: 6px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    table {
        width: 100%;
    }

    th, td {
        padding: 6px;
        font-size: 12px;
        line-height: 1.3;
        word-wrap: break-word;
    }

    .copy-button {
        font-size: 9px;
        padding: 3px 6px;
    }
}

/* ===== TERMINAL ===== */

#terminal-section .terminal{
    width:900px;
    margin:60px auto;
    background:#0f1117;
    border-radius:14px;
    overflow:hidden;
    box-shadow:0 20px 40px rgba(0,0,0,.4);
    font-family:monospace;
}

#terminal-section .terminal-header{
    position:relative;
    background:#2b2b2b;
    padding:12px;
    display:flex;
    align-items:center;
}

#terminal-section .buttons{
    display:flex;
    gap:6px;
}

#terminal-section .dot{
    width:12px;
    height:12px;
    border-radius:50%;
}

#terminal-section .red{background:#ff5f56;}
#terminal-section .yellow{background:#ffbd2e;}
#terminal-section .green{background:#27c93f;}

#terminal-section .title{
    position:absolute;
    left:50%;
    transform:translateX(-50%);
    color:#cfcfcf;
    font-size:14px;
}

#terminal-section .terminal-body{
    padding:20px;
    min-height:420px;
    color:#00ff9c;
    white-space:pre-wrap;
}

#terminal-section .input-line{
    display:flex;
}

#terminal-section .prompt{
    margin-right:6px;
    color:#00ff9c;
}

#terminal-section .terminal-input{
    background:transparent;
    border:none;
    outline:none;
    color:white;
    font-family:monospace;
    width:100%;
}

#terminal-section .terminal-input::placeholder{
    color:rgba(255,255,255,0.35);
}

#terminal-section .output{ color:#9cdcfe; }
#terminal-section .error{ color:#ff6b6b; }

---------------------------------------------------------------
COPIA JS
---------------------------------------------------------------
// Barra de progreso de lectura
window.addEventListener('scroll', () => {

    const progressBar = document.querySelector('.reading-progress');
    if(!progressBar) return;

    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;

    progressBar.style.width = scrolled + '%';
});


// Botón de volver arriba
const backToTopButton = document.getElementById('back-to-top');

if(backToTopButton){
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


// Manejo de pestañas
document.addEventListener('DOMContentLoaded', () => {

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');

            const tab = document.getElementById(tabId);
            if(tab) tab.classList.add('active');
        });
    });
});



/* ===== TERMINAL ===== */

document.addEventListener("DOMContentLoaded", function(){

const terminal = document.getElementById("terminal-body");
if(!terminal) return;

function print(text, type="output"){
    const line = document.createElement("div");
    line.className = type;
    line.textContent = text;
    terminal.appendChild(line);
}

function boot(){

    print("Bienvenido a s2ktux");
    print("---------------------------------------");
    print("Aquí podrás aprender sobre Linux");
    print("Preparación para certificados LPIC y RHCSA");
    print("Y proyectos pequeños...");
    print('Escribe "help" para comenzar.');
}

function createInput(){

    const wrapper = document.createElement("div");
    wrapper.className = "input-line";

    const prompt = document.createElement("span");
    prompt.className = "prompt";
    prompt.textContent = "s2ktux@server:~$";

    const input = document.createElement("input");
    input.className = "terminal-input";
    input.placeholder = "Escribe algo... (ej: help)";

    wrapper.appendChild(prompt);
    wrapper.appendChild(input);
    terminal.appendChild(wrapper);

    input.focus();

    input.addEventListener("keydown", function(e){

        if(e.key === "Enter"){

            const cmd = input.value.trim();
            input.disabled = true;

            runCommand(cmd);

            createInput();
            terminal.scrollTop = terminal.scrollHeight;
        }
    });
}

function runCommand(cmd){

    if(cmd === "help"){
        print("");
        print("Comandos disponibles:");
        print("help");
        print("about");
        print("cursos");
        print("proyectos");
        print("whoami");
        print("pwd");
        print("sudo");
        print("clear");
    }

    else if(cmd === "about"){
        print(" Trabajo en el area de sistemas desde hace años y me gusta mucho Linux. Al mismo tiempo que aprendo, me gusta compartirlo para todo aquel que esté siguiendo o quiera seguir el mismo camino");
    }

    else if(cmd === "cursos"){
        print("Actualmente cuento con el curso de LPIC1 y RHCSA. RHCSA está tambien en el canal de Youtube!!");
    }

    else if(cmd === "proyectos"){
        print("Proximamente..");
    }

    else if(cmd === "clear"){
        terminal.innerHTML="";
        boot();
    }

    else if(cmd === "whoami"){
        print("s2ktux");
    }

    else if(cmd === "pwd"){
        print("/home/s2ktux");
    }

    else if(cmd === "sudo"){
        print("Buen intento!!😄", "error");
    }

    else if(cmd !== ""){
        print("Command not found: "+cmd,"error");
    }
}

boot();
createInput();

});
