// --- DATA ---
const coursesDB = {
    "rhcsa": {
        title: "RHCSA EX200",
        chapters: [
            { id: 1, title: "Clase 1: Herramientas Básicas", file: "/cursos/rhcsa/1/test.html" },
            { id: 2, title: "Clase 2: Gestión de Software", file: "/cursos/rhcesa/2/2.html" },
            { id: 3, title: "Clase 3: Usuarios y Grupos", file: "/cursos/rhcsa/3/3.html" }
        ]
    },
    "lpic1": {
        title: "LPIC-1 101-500",
        quaters: [
            { id: 101, title: "Arquitectura de Sistema", file: "/cursos/lpic/101/101.html" },
            { id: 102, title: "Instalación de Linux", file: "/cursos/lpic/102/102.html" }
        ]
    }
};
const projectsDB = {
    "deployer": { title: "S2KTUX Optimized Deployer", content: "<h1>S2KTUX Deployer</h1><p>Automatización de despliegues...</p>" },
    "ansible": { title: "Ansible Playbooks", content: "<h1>Ansible</h1><p>Playbooks de seguridad...</p>" }
};

let currentCourseId = null;
let currentFileUrl = null;
let currentPath = '~';

// --- SPLASH SCREEN ---
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash');
        splash.classList.add('hidden');
        setTimeout(() => splash.remove(), 800);
    }, 1500);
});

// --- MOBILE MENU ---
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const burger = document.getElementById('hamburger');
    menu.classList.toggle('active');
    burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', burger.classList.contains('active'));
}

// --- TYPEWRITER ---
const welcomeText = "Plataforma híbrida para administradores de sistemas. Aprende con cursos estructurados o practica en nuestro entorno interactivo.";
const typeWriterElement = document.getElementById('typing-text');
let typeIndex = 0;
function typeWriter() {
    if (typeIndex < welcomeText.length) {
        typeWriterElement.innerHTML += welcomeText.charAt(typeIndex);
        typeIndex++;
        setTimeout(typeWriter, 30);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    typeWriter();
    checkHash();
});

// --- AUTO-HIDE NAVBAR ---
let idleTimer;
let scrollY = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    resetTimer();
});
document.addEventListener('mousemove', resetTimer);
document.addEventListener('keydown', resetTimer);
function resetTimer() {
    clearTimeout(idleTimer);
    const nav = document.getElementById('mainNav');
    nav.classList.remove('nav-hidden');
    if (scrollY > 50) {
        const activePage = document.querySelector('.page-section.active').id;
        if (activePage === 'reader' || activePage === 'project-view' || activePage === 'terminal') {
            idleTimer = setTimeout(() => {
                nav.classList.add('nav-hidden');
            }, 2000);
        }
    }
}

// --- THEME SYSTEM ---
function toggleThemeMenu() {
    document.getElementById('themeMenu').classList.toggle('active');
}
function setTheme(colorName, isLight) {
    const body = document.body;
    body.classList.remove('color-blue', 'color-purple', 'color-matrix', 'color-ruby', 'color-sunset', 'mode-light');
    if (colorName !== 'blue') {
        body.classList.add('color-' + colorName);
    }
    if (isLight) body.classList.add('mode-light');
    const icon = document.getElementById('theme-icon');
    if (isLight) {
        icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    } else {
        icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    }
    document.getElementById('themeMenu').classList.remove('active');
    localStorage.setItem('s2ktux_theme', JSON.stringify({ color: colorName, light: isLight }));
}
const savedTheme = JSON.parse(localStorage.getItem('sustux_theme'));
if (savedTheme) setTheme(savedTheme.color, savedTheme.light);
document.addEventListener('click', (e) => {
    if (!e.target.closest('.theme-btn') && !e.target.closest('.theme-selector')) {
        document.getElementById('themeMenu').classList.remove('active');
    }
});

// --- NAVIGATION ---
function navigate(pageId) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    const map = { 'home':0, 'courses':1, 'terminal':2, 'projects':3 };
    if (map[pageId] !== undefined) document.querySelectorAll('.nav-link')[map[pageId]].classList.add('active');
    window.history.pushState({ page: pageId }, null, `#${pageId}`);
    if (pageId === 'terminal') {
        setTimeout(() => document.getElementById('term-input').focus(), 100);
        if (currentPath !== '~') currentPath = '~';
    }
    window.scrollTo(0,0);
    resetTimer();
}
window.onpopstate = function(event) {
    let pageId = 'home';
    if (event.state && event.state.page) pageId = event.state.page;
    else {
        const hash = window.location.hash.replace('#', '');
        if (hash) pageId = hash;
    }
    if (pageId === 'reader' && currentCourseId) {
        backToSyllabus();
        return;
    }
    if (pageId === 'project-view') {
        navigate('projects');
        return;
    }
    document.querySelectorAll('.page-section'). Each(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link'). Each(l => l.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    resetTimer();
};
function checkHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== 'reader' && hash !== 'image-container') && hash !== 'project-view') navigate(hash);
}

// --- COURSES ---
function openSyllabus(courseId) {
    const course = coursesDB[courseId];
    if (!course) return;
    currentCourseId = courseId;
    document.getElementById('syllabus-title').innerText = course.title;
    const list = document.getElementById('syllabus-list');
    list.innerHTML = '';
    let readCount = 0;
    course.chapters.forEach(chap => {
        if (localStorage.getItem('s2ktux_read_' + chap.file)) readCount++;
    });
    const progress = Math.round((readCount / course.chapters.length) * 100);
    const bar = document.getElementById('course-progress-bar');
    const text = document.getElementById('course-progress-text');
    bar.style.width = '0%';
    setTimeout(() => bar.style.width = `${progress}%`, 100);
    text.innerText = `${progress}% Completado`;
    course.chapters.forEach(chap => {
        const isRead = localStorage.getItem('s2ktux_read_' + chap.file);
        const div = document.createElement('div');
        div.className = `chapter-item ${isRead ? 'completed' : ''}`;
        div.innerHTML = `<div class="chapter-info"><h4>${chap.title}</h4><span>Módulo ${chap.id}</span></div><div class="chapter-check">&#10003;</div>`;
        div.onclick = () => openReader(chap.file);
        list.appendChild(div);
    });
    navigate('syllabus');
}
// --- READER & IMÁGENES (MODIFICADO) ---
async function openReader(fileUrl) {
    const readerContent = document.getElementById('reader-content');
    readerContent.innerHTML = '<div style="text-align:center; padding:100px; color:var(--text-muted);">Cargando lección...</div>';
    
    navigate('reader');
    currentFileUrl = fileUrl;
    localStorage.setItem('s2ktux_read_' + fileUrl, true);

    try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("404");

        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        let content = doc.querySelector('main') || doc.querySelector('body') || doc;

        // 1. LIMPIEZA DE ESTILOS INLINE (Importante para que funcione)
        const allElements = content.querySelectorAll('*');
        allElements.forEach(el => el.removeAttribute('style'));

        // 2. Inyectar contenido limpio
        readerContent.innerHTML = content.innerHTML;
        
        // 3. Aplicar clase base
        readerContent.classList.add('course-content');

        // 4. ESTILOS DE IMÁGENES (Mover la lógica aquí)
        const images = readerContent.querySelectorAll('img');
        images.forEach(img => {
            img.classList.add('lesson-img');
            img.loading = 'lazy';
            // Fallback si la imagen no carga
            img.onerror = function() { this.src = '/images/placeholder.png'; }; 
        });

        // 5. Heredar tema
        if (document.body.classList.contains('mode-light')) {
            readerContent.classList.add('mode-light');
        }

        // 6. Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 7. Botón Siguiente
        addNextButton();

    } catch (e) {
        readerContent.innerHTML = `
            <div style="text-align:center; padding:80px; color:#ef4444;">
                <h3>✗ No se pudo cargar la lección</h3>
                <p style="color:var(--text-muted)">Verifica que el archivo existe y que la ruta es correcta.</p>
                <div style="margin-top:20px;">
                    <button onclick="backToSyllabus()" class="cyber-back-btn">Volver al temario</button>
                </div>
            </div>`;
    }
}

function addNextButton() {
    if (!currentCourseId) return;
    const course = coursesDB[currentCourseId];
    const idx = course.chapters.findIndex(c => c.file === currentFileUrl);
    const nextChapter = course.chapters[idx + 1];
    const btnContainer = document.createElement('div');
    btnContainer.className = 'next-btn-container';
    if (nextChapter) {
        btnContainer.innerHTML = `<button class="next-btn" onclick="openReader('${nextChapter.file}')">Siguiente: ${nextChapter.title} &rarr;</button>`;
    } else {
        btnContainer.innerHTML = `<div style="text-align:right; color:var(--text-muted);">¡Curso completado! 🎉</div>`;
    }
    document.getElementById('reader-content').appendChild(btnContainer);
}

function backToSyllabus() {
    navigate('syllabus');
    if (currentCourseId) openSyllabus(currentCourseId);
}

function openProject(id) {
    const proj = projectsDB[id];
    if (!proj) return;
    document.getElementById('project-content').innerHTML = `<h1>${proj.title}</h1>${proj.content}`;
    navigate('project-view');
}

// --- TERMINAL ---
const termInput = document.getElementById('term-input');
const termBody = document.getElementById('term-body');
const termInputWrapper = document.getElementById('term-input-wrapper');
const termTitle = document.getElementById('term-title');
let commandHistory = [];
// Sistema de archivos virtual
let virtualFS = {
    "~": ["cursos", "proyectos", "README.md"],
    "~/cursos": ["rhcsa", "lpic1"],
    "~/proyectos": ["deployer", "ansible"],
    "files": {
        "README.md": "Bienvenido a S2KTUX. Escribe 'help' para comenzar."
    }
};
function updateTerminalUI() {
    const fullPath = `visitor@s2ktux:${currentPath}$`;
    termTitle.innerText = fullPath.replace('$', ''); 
    document.querySelector('.term-prompt').innerText = fullPath; 
}
termInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const cmd = this.value.trim();
        if (cmd) {
            commandHistory.push(cmd);
            const historyLine = document.createElement('div');
            historyLine.className = 'term-line';
            historyLine.innerHTML = `<span style="color:var(--accent); font-weight:bold;">${document.querySelector('.term-prompt').innerText}</span> ${cmd}`;
            termBody.insertBefore(historyLine, termInputWrapper);
            processTermCommand(cmd);
        } else {
            const emptyLine = document.createElement('div');
            emptyLine.className = 'term-line';
            termBody.insertBefore(emptyLine, termInputWrapper);
        }
        this.value = '';
        termBody.scrollTop = termBody.scrollHeight;
        setTimeout(() => termInput.focus(), 0);
    }
});
document.getElementById('terminal').addEventListener('click', () => { termInput.focus(); });
document.getElementById('terminal').addEventListener('touchstart', () => { termInput.focus(); });
function processTermCommand(cmd) {
    const args = cmd.split(' ');
    const mainCmd = args[0].toLowerCase();
    const arg1 = args[1];
    const response = document.createElement('div');
    response.className = 'term-line';
    switch(mainCmd) {
        case 'help':
            response.innerHTML = `<span class="cmd-info">Comandos disponibles:</span><br> - help, ls, cd, pwd, echo, clear, whoami, date, uname, history, mkdir, touch, rm, apt update, open [curso], exit`;
            break;
        case 'ls':
            if (virtualFS[currentPath]) {
                response.innerHTML = virtualFS[currentPath].join(' ');
            } else {
                response.innerHTML = `<span class="cmd-error">ls: cannot access '${currentPath}': No such file or directory</span>`;
            }
            break;
        case 'cd':
            if (!arg1) {
                currentPath = '~';
            } else if (arg1 === '..') {
                currentPath = '~';
                navigate('home');
            } else if (arg1 === 'cursos') {
                currentPath = '~/cursos';
                navigate('courses');
            } else if (arg1 === 'proyectos') {
                currentPath = '~/proyectos';
                navigate('projects');
            } else {
                response.innerHTML = `<span class="cmd-error">bash: cd: ${arg1}: No such file or directory</span>`;
            }
            updateTerminalUI();
            break;
        case 'pwd':
            response.innerHTML = `/home/visitor${currentPath === '~' ? '' : currentPath.replace('~', '')}`;
            break;
        case 'echo':
            response.innerHTML = args.slice(1).join(' ') || '';
            break;
        case 'mkdir':
            if(arg1) {
                if(!virtualFS[currentPath].includes(arg1)) {
                    virtualFS[currentPath].push(arg1);
                    response.innerHTML = '';
                } else {
                    response.innerHTML = `<span class="cmd-error">mkdir: cannot create directory '${arg1}': File exists</span>`;
                }
            } else {
                response.innerHTML = `mkdir: missing operand`;
            }
            break;
        case 'touch':
            if(arg1) {
                if(!virtualFS[currentPath].includes(arg1)) {
                    virtualFS[currentPath].push(arg1);
                    response.innerHTML = ''; 
                } else {
                    response.innerHTML = ``;
                }
            }
            break;
        case 'rm':
            if(arg1) {
                const idx = virtualFS[currentPath].indexOf(arg1);
                if(idx > -1) {
                    virtualFS[currentPath].splice(idx, 1);
                    response.innerHTML = '';
                } else {
                    response.innerHTML = `<span class="cmd-error">rm: cannot remove '${arg1}': No such file or directory</span>`;
                }
            }
            break;
        case 'apt':
            if(arg1 === 'update') {
                response.innerHTML = `<span class="cmd-info">Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease</span><br> <span class="cmd-info">Get:2 http://security.ubuntu.com/ubuntu jammy-security InRelease [110 kB]</span><br> <span class="cmd-info">Get:3 http://archive.ubuntu.com/ubuntu jammy-updates InRelease [119 kB]</span><br> <span class="cmd-success">Reading package lists... Done</span><br> <span class="cmd-success">Building dependency tree... Done</span><br><span class="cmd-success">Calculating upgrade... Done</span><br> <span class="cmd-success">0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.</span>`;
            } else {
                response.innerHTML = `apt: missing command`;
            }
            break;
        case 'whoami': response.innerHTML = `<span class="cmd-success">visitor</span>`; break;
        case 'date': response.innerHTML = new Date().toString(); break;
        case 'uname': response.innerHTML = args[1] === '-a' ? "S2KTUX s2ktux-ssh 7.1.0-generic #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux" : "S2KTUX"; break;
        case 'history': response.innerHTML = commandHistory.map((c, i) => `${i+1}  ${c}`).join('<br>'); break;
        case 'clear': termBody.querySelectorAll('.term-line').forEach(l => l.remove()); return;
        case 'exit': navigate('home'); currentPath = '~'; updateTerminalUI(); return;
        case 'open':
            if (arg1 === 'rhcsa') {
                navigate('courses'); openSyllabus('rhcsa');
                response.innerHTML = '<span class="cmd-success">Abriendo curso RHCSA...</span>';
            } else if (arg1 === 'lpic1') {
                navigate('courses'); openSyllabus('lpic1');
                response.innerHTML = '<span class="cmd-success">Abriendo curso LPIC-1...</span>';
            } else {
                response.innerHTML = '<span class="cmd-error">Curso no encontrado. Usa: open rhcsa o open lpic1</span>';
            }
            break;
        default: response.innerHTML = `<span class="cmd-error">bash: ${mainCmd}: command not found</span>`;
    }
    termBody.insertBefore(response, termInputWrapper);
    termBody.appendChild(termInputWrapper);
}
