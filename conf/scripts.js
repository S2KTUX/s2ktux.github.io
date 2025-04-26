// Barra de progreso de lectura
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (scrollTop / scrollHeight) * 100;
    document.querySelector('.reading-progress').style.width = scrolled + '%';
});

// Botón de volver arriba
const backToTopButton = document.getElementById('back-to-top');
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

// 1. Tabla de contenidos dinámica
document.addEventListener('DOMContentLoaded', () => {
    const content = document.querySelector('.content');
    if (!content) return;

    const headings = content.querySelectorAll('h2');
    if (headings.length === 0) return;

    const toc = document.createElement('div');
    toc.className = 'table-of-contents';
    toc.innerHTML = '<h3>Tabla de Contenidos</h3><ul></ul>';

    const tocList = toc.querySelector('ul');
    headings.forEach((heading, index) => {
        const id = heading.id || `section-${index}`;
        heading.id = id;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = heading.textContent;
        li.appendChild(a);
        tocList.appendChild(li);
    });

    content.insertBefore(toc, content.firstChild);
});

// 2. Botón de copiar código en bloques <pre>
document.addEventListener('DOMContentLoaded', () => {
    const preBlocks = document.querySelectorAll('pre');
    preBlocks.forEach((pre, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        wrapper.style.position = 'relative';

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copiar';
        copyButton.style.position = 'absolute';
        copyButton.style.top = '5px';
        copyButton.style.right = '5px';
        copyButton.style.padding = '5px 10px';
        copyButton.style.backgroundColor = '#007bff';
        copyButton.style.color = '#fff';
        copyButton.style.border = 'none';
        copyButton.style.borderRadius = '3px';
        copyButton.style.cursor = 'pointer';
        copyButton.style.fontSize = '12px';

        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        wrapper.appendChild(copyButton);

        copyButton.addEventListener('click', () => {
            const code = pre.textContent;
            navigator.clipboard.writeText(code).then(() => {
                copyButton.textContent = '¡Copiado!';
                setTimeout(() => {
                    copyButton.textContent = 'Copiar';
                }, 2000);
            }).catch(() => {
                copyButton.textContent = 'Error';
            });
        });
    });
});

// 3. Resaltado de enlaces en el sidebar según la sección visible
window.addEventListener('scroll', () => {
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('.content section');
    let currentSectionId = '';

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 100; // Ajuste para el header
        if (window.scrollY >= sectionTop) {
            currentSectionId = section.id;
        }
    });

    sidebarLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
});
