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

// Botón de copiar código en bloques <pre>
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

// Botones de navegación entre secciones
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.content section');
    sections.forEach((section, index) => {
        const navDiv = document.createElement('div');
        navDiv.className = 'section-nav';
        navDiv.style.display = 'flex';
        navDiv.style.justifyContent = 'space-between';
        navDiv.style.marginTop = '20px';

        if (index > 0) {
            const prevButton = document.createElement('button');
            prevButton.textContent = '← Anterior';
            prevButton.className = 'nav-button';
            prevButton.style.padding = '5px 10px';
            prevButton.style.backgroundColor = '#007bff';
            prevButton.style.color = '#fff';
            prevButton.style.border = 'none';
            prevButton.style.borderRadius = '3px';
            prevButton.style.cursor = 'pointer';
            prevButton.addEventListener('click', () => {
                const prevSection = sections[index - 1];
                window.scrollTo({
                    top: prevSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            });
            navDiv.appendChild(prevButton);
        } else {
            navDiv.appendChild(document.createElement('span')); // Espacio vacío
        }

        if (index < sections.length - 1) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Siguiente →';
            nextButton.className = 'nav-button';
            nextButton.style.padding = '5px 10px';
            nextButton.style.backgroundColor = '#007bff';
            nextButton.style.color = '#fff';
            nextButton.style.border = 'none';
            nextButton.style.borderRadius = '3px';
            nextButton.style.cursor = 'pointer';
            nextButton.addEventListener('click', () => {
                const nextSection = sections[index + 1];
                window.scrollTo({
                    top: nextSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            });
            navDiv.appendChild(nextButton);
        }

        section.appendChild(navDiv);
    });
});
