// Barra de progreso de lectura
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (scrollTop / scrollHeight) * 100;
    document.querySelector('.reading-progress').style.width = scrolled + '%';
});

// Botón de volver arriba
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.style.display = 'block';
    } else {
        backToTop.style.display = 'none';
    }
});

backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Cambiar tema claro/oscuro
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
});

// Edición de contenido
document.querySelectorAll('.edit-toggle').forEach(button => {
    button.addEventListener('click', () => {
        const timelineItems = document.querySelectorAll('.timeline-item');
        const isEditing = button.textContent === 'Editar Contenido';

        timelineItems.forEach(item => {
            item.contentEditable = isEditing;
            item.focus();
        });

        button.textContent = isEditing ? 'Guardar Cambios' : 'Editar Contenido';

        if (!isEditing) {
            // Guardar cambios en localStorage
            const content = {};
            timelineItems.forEach((item, index) => {
                content[`section-${index}`] = item.innerHTML;
            });
            localStorage.setItem('courseContent', JSON.stringify(content));
        }
    });
});

// Cargar contenido guardado desde localStorage
window.addEventListener('load', () => {
    const savedContent = localStorage.getItem('courseContent');
    if (savedContent) {
        const content = JSON.parse(savedContent);
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            if (content[`section-${index}`]) {
                item.innerHTML = content[`section-${index}`];
            }
        });
    }
});
