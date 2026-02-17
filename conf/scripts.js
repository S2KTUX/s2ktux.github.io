const coursesDB = {
    "rhcsa": {
        title: "RHCSA EX200",
        chapters: [
            { id: 1, title: "Clase 1: Herramientas principales y su uso", file: "/cursos/rhcsa/1/1.html" },
            { id: 2, title: "Clase 2: Gestión de Software", file: "/cursos/rhcsa/2/2.html" },
            { id: 3, title: "Clase 3: Creación de scripts de shell sencillos", file: "/cursos/rhcsa/3/3.html" },
            { id: 4, title: "Clase 4: Uso de los sistemas en funcionamiento", file: "/cursos/rhcsa/4/4.html" },
            { id: 5, title: "Clase 5: Configuración del almacenamiento local", file: "/cursos/rhcsa/5/5.html" },
            { id: 6, title: "Clase 6: Creación y configuración de sistemas de archivos", file: "/cursos/rhcsa/6/6.html" },
            { id: 7, title: "Clase 7: Implementación, configuración y mantenimiento de los sistemas", file: "/cursos/rhcsa/7/7.html" },
            { id: 8, title: "Clase 8: Gestión de las conexiones de red básicas", file: "/cursos/rhcsa/8/8.html" },
            { id: 9, title: "Clase 9: Gestión de los usuarios y los grupos", file: "/cursos/rhcsa/9/9.html" },
            { id: 10, title: "Clase 10: Gestión de la seguridad", file: "/cursos/rhcsa/10/10.html" },
            { id: 11, title: "Clase EXTRA: Podman y repaso", file: "/cursos/rhcsa/EXTRA/extra.html" },
        ]
    },
    "lpic1": {
        title: "LPIC-1 101-500",
        chapters: [
            { id: 101, title: "Arquitectura de Sistema", file: "/cursos/lpic/101/101.html" },
            { id: 102, title: "Instalación de Linux", file: "/cursos/lpic/102/102.html" }
        ]
    },
    "aws": {
        title: "AWS Cloud",
        chapters: [
            { id: 101, title: "Proximamente...", file: "#" },
            { id: 102, title: "Proximamente...", file: "#" },
            { id: 103, title: "Proximamente...", file: "#" }
    ]
    }
};
const projectsDB = {
    "deployer": { title: "S2KTUX Optimized Deployer", content: "<h1>S2KTUX Deployer</h1><p>Automatización de despliegues...</p>" },
    "ansible": { title: "Ansible Playbooks", content: "<h1>Ansible</h1><p>Playbooks de seguridad...</p>" }
};

let virtualFS = {
    "~": ["cursos", "proyectos", "README.md"],
    "~/cursos": ["rhcsa", "lpic1"],
    "~/proyectos": ["deployer", "ansible"],
    "files": {
        "README.md": "Bienvenido a S2KTUX. Escribe 'help' para comenzar."
    }
};

let commandHistory = [];

let currentCourseId = null;
let currentFileUrl = null;
let currentPath = '~';

const termInput = document.getElementById('term-input');
const termBody = document.getElementById('term-body');
const termInputWrapper = document.getElementById('term-input-wrapper');
const termTitle = document.getElementById('term-title');
const terminalEl = document.getElementById('terminal');
const typeWriterElement = document.getElementById('typing-text');

window.addEventListener('load', () => {
    const splash = document.getElementById('splash');
    if(splash) {
        setTimeout(() => {
            splash.classList.add('hidden');
            setTimeout(() => splash.remove(), 800);
        }, 1500);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if(typeWriterElement) typeWriter();
    checkHash();
});

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    resetTimer();
});

document.addEventListener('mousemove', resetTimer);
document.addEventListener('keydown', (e) => {
    resetTimer();
    if (e.key === "Escape") {
        closeLightbox();
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.theme-btn') && !e.target.closest('.theme-selector')) {
        const menu = document.getElementById('themeMenu');
        if(menu) menu.classList.remove('active');
    }
    
    const tocLink = e.target.closest('.lesson-toc a');
    if (tocLink) {
        e.preventDefault(); 
        const targetId = tocLink.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const navHeight = 110; 
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navHeight;
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            if (typeof resetTimer === 'function') resetTimer();
        }
    }
});

if(termInput) {
    termInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const cmd = this.value.trim();
            if (cmd) {
                commandHistory.push(cmd);
                const historyLine = document.createElement('div');
                historyLine.className = 'term-line';
                const promptText = document.querySelector('.term-prompt') ? document.querySelector('.term-prompt').innerText : '';
                historyLine.innerHTML = `<span style="color:var(--accent); font-weight:bold;">${promptText}</span> ${cmd}`;
                if(termBody && termInputWrapper) {
                    termBody.insertBefore(historyLine, termInputWrapper);
                    processTermCommand(cmd);
                }
            } else {
                if(termBody && termInputWrapper) {
                    const emptyLine = document.createElement('div');
                    emptyLine.className = 'term-line';
                    termBody.insertBefore(emptyLine, termInputWrapper);
                }
            }
            this.value = '';
            if(termBody) termBody.scrollTop = termBody.scrollHeight;
            setTimeout(() => this.focus(), 0);
        }
    });
}

if(terminalEl) {
    terminalEl.addEventListener('click', () => { if(termInput) termInput.focus(); });
    terminalEl.addEventListener('touchstart', () => { if(termInput) termInput.focus(); });
}

window.onpopstate = function(event) {
    let pageId = 'home';
    if (event.state && event.state.page) {
        pageId = event.state.page;
    } else {
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
    
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.classList.add('active');
    
    resetTimer();
};

let idleTimer;
let scrollY = 0;

function navigate(pageId) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const pageSection = document.getElementById(pageId);
    if(pageSection) pageSection.classList.add('active');

    const map = { 'home':0, 'courses':1, 'syllabus': 1, 'terminal':2, 'projects':3 };
    if (map[pageId] !== undefined) {
        const links = document.querySelectorAll('.nav-link');
        if(links[map[pageId]]) links[map[pageId]].classList.add('active');
    }

    window.history.pushState({ page: pageId }, null, `#${pageId}`);
    if (pageId === 'terminal') {
        setTimeout(() => {
            if(termInput) termInput.focus();
        }, 100);
        if (currentPath !== '~') currentPath = '~';
    }
    window.scrollTo(0,0);
    resetTimer();
}

function checkHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== 'reader' && hash !== 'image-container' && hash !== 'project-view') {
        navigate(hash);
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const burger = document.getElementById('hamburger');
    if(menu && burger) {
        menu.classList.toggle('active');
        burger.classList.toggle('active');
        burger.setAttribute('aria-expanded', burger.classList.contains('active'));
    }
}

function resetTimer() {
    clearTimeout(idleTimer);
    const nav = document.getElementById('mainNav');
    if(nav) nav.classList.remove('nav-hidden');
    if (scrollY > 50) {
        const activePage = document.querySelector('.page-section.active');
        if(activePage) {
            const activeId = activePage.id;
            if (activeId === 'reader' || activeId === 'project-view' || activeId === 'terminal') {
                idleTimer = setTimeout(() => {
                    if(nav) nav.classList.add('nav-hidden');
                }, 2000);
            }
        }
    }
}

function toggleThemeMenu() {
    const menu = document.getElementById('themeMenu');
    if(menu) menu.classList.toggle('active');
}

function setTheme(colorName, isLight) {
    const body = document.body;
    body.classList.remove('color-blue', 'color-purple', 'color-matrix', 'color-ruby', 'color-sunset', 'mode-light');
    if (colorName !== 'blue') {
        body.classList.add('color-' + colorName);
    }
    if (isLight) body.classList.add('mode-light');
    
    const icon = document.getElementById('theme-icon');
    if (icon) {
        if (isLight) {
            icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        } else {
            icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        }
    }
    
    if(document.getElementById('themeMenu')) {
        document.getElementById('themeMenu').classList.remove('active');
    }
    localStorage.setItem('s2ktux_theme', JSON.stringify({ color: colorName, light: isLight }));
}

const savedTheme = JSON.parse(localStorage.getItem('s2ktux_theme'));
if (savedTheme) setTheme(savedTheme.color, savedTheme.light);

const welcomeText = "Tu terminal, tus reglas. Aprende administración profesional de Linux y descubre el lado creativo de las modificaciones de sistema. Expandiendo fronteras hacia el Cloud muy pronto.";
let typeIndex = 0;

function typeWriter() {
    if (typeIndex < welcomeText.length) {
        typeWriterElement.innerHTML += welcomeText.charAt(typeIndex);
        typeIndex++;
        setTimeout(typeWriter, 30);
    }
}

function openSyllabus(courseId) {
    const course = coursesDB[courseId];
    if (!course) return;
    currentCourseId = courseId;
    
    const titleEl = document.getElementById('syllabus-title');
    if(titleEl) titleEl.innerText = course.title;
    
    const list = document.getElementById('syllabus-list');
    if(!list) return;
    
    list.innerHTML = '';
    let readCount = 0;
    
    course.chapters.forEach(chap => {
        if (localStorage.getItem('s2ktux_read_' + chap.file)) readCount++;
    });
    
    const progress = Math.round((readCount / course.chapters.length) * 100);
    const bar = document.getElementById('course-progress-bar');
    const text = document.getElementById('course-progress-text');
    
    if(bar) {
        bar.style.width = '0%';
        setTimeout(() => bar.style.width = `${progress}%`, 100);
    }
    if(text) text.innerText = `${progress}% Completado`;
    
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

async function openReader(fileUrl) {
    const readerContent = document.getElementById('reader-content');
    if(!readerContent) return;

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
        const allElements = content.querySelectorAll('*');
        allElements.forEach(el => el.removeAttribute('style'));

        readerContent.innerHTML = content.innerHTML;
        
        readerContent.classList.add('course-content');

        const images = readerContent.querySelectorAll('img');
        images.forEach(img => {
            img.classList.add('lesson-img');
            img.loading = 'lazy';
            
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', function() {
                openLightbox(this.src);
            });

            img.onerror = function() { 
                this.src = '/images/placeholder.png'; 
                this.classList.add('loaded'); 
            };
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.onload = function() {
                    img.classList.add('loaded');
                };
            }
        });

        if (document.body.classList.contains('mode-light')) {
            readerContent.classList.add('mode-light');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        addNextButton();

    } catch (e) {
        console.error(e);
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
    if(idx === -1) return;

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
    const content = document.getElementById('project-content');
    if(content) content.innerHTML = `<h1>${proj.title}</h1>${proj.content}`;
    navigate('project-view');
}

function updateTerminalUI() {
    const fullPath = `visitor@s2ktux:${currentPath}$`;
    if(termTitle) termTitle.innerText = fullPath.replace('$', ''); 
    const prompt = document.querySelector('.term-prompt');
    if(prompt) prompt.innerText = fullPath; 
}

function processTermCommand(cmd) {
    if(!termBody || !termInputWrapper) return;

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
                response.innerHTML = virtualFS[currentPath].join('  ');
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
                }
            }
            break;
        case 'rm':
            if(arg1) {
                const idx = virtualFS[currentPath].indexOf(arg1);
                if(idx > -1) {
                    virtualFS[currentPath].splice(idx, 1);
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

function openLightbox(src) {
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('show'), 10);
    modalImg.src = src;
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.getElementById('lightbox-img').src = '';
    }, 300);
}
