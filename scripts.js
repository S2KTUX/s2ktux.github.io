document.addEventListener('DOMContentLoaded', function() {
    // Mostrar/ocultar botón de volver arriba
    window.onscroll = function() {
        const backToTop = document.getElementById('back-to-top');
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }

        // Barra de progreso de lectura
        const progressBar = document.querySelector('.reading-progress');
        if (progressBar) {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrollPosition = window.scrollY;
            const progress = (scrollPosition / documentHeight) * 100;
            progressBar.style.width = progress + '%';
        }
    };

    // Acordeón para cursos.html
    const accordions = document.getElementsByClassName('course-accordeon');
    for (let i = 0; i < accordions.length; i++) {
        accordions[i].addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    }

    // Cambio de tema oscuro/claro
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }

    // Efecto de escritura en el hero
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        typeWriter();
    }

    // Modo de enfoque para cursos
    const focusButton = document.getElementById('focus-mode');
    if (focusButton) {
        focusButton.addEventListener('click', function() {
            document.body.classList.toggle('focus-mode');
            focusButton.textContent = document.body.classList.contains('focus-mode') ? 'Salir del modo enfoque' : 'Modo enfoque';
        });
    }

    // Efecto 3D en las tarjetas
    const cards = document.querySelectorAll('.course-card, .project-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });
});
