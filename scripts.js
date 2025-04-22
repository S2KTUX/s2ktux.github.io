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

        // Efecto parallax en proyectos
        const parallaxCards = document.querySelectorAll('.parallax-card');
        parallaxCards.forEach(card => {
            const image = card.querySelector('.parallax-image');
            const position = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            const scrollFactor = (position - windowHeight) * 0.5;
            image.style.transform = `translateY(${scrollFactor * 0.3}px)`;
        });
    };

    // Pestañas para cursos.html
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(button.getAttribute('data-tab')).classList.add('active');
        });
    });

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
            if (document.body.classList.contains('focus-mode')) {
                unlockAchievement('Modo Enfoque Activado', '¡Usaste el modo enfoque por primera vez!');
            }
        });
    }

    // Efecto 3D en las tarjetas
    const cards = document.querySelectorAll('.course-card, .parallax-card');
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

    // Sistema de logros
    const achievements = [
        { id: 'visit-all', name: 'Explorador', description: 'Visita todas las páginas del sitio.', unlocked: false },
        { id: 'focus-mode', name: 'Modo Enfoque Activado', description: '¡Usaste el modo enfoque por primera vez!', unlocked: false },
        { id: 'chat-use', name: 'Conversador', description: 'Usaste el chat por primera vez.', unlocked: false },
        { id: 'study-session', name: 'Estudiante Dedicado', description: 'Completaste una sesión de estudio.', unlocked: false }
    ];

    function loadAchievements() {
        const savedAchievements = JSON.parse(localStorage.getItem('achievements')) || achievements;
        const achievementList = document.getElementById('achievement-list');
        achievementList.innerHTML = '';
        savedAchievements.forEach(achievement => {
            const achievementItem = document.createElement('div');
            achievementItem.classList.add('achievement-item');
            if (achievement.unlocked) {
                achievementItem.classList.add('unlocked');
            }
            achievementItem.innerHTML = `
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
            `;
            achievementList.appendChild(achievementItem);
        });
        return savedAchievements;
    }

    function saveAchievements(achievements) {
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }

    function unlockAchievement(name, description) {
        let currentAchievements = loadAchievements();
        const achievement = currentAchievements.find(a => a.name === name);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            saveAchievements(currentAchievements);
            loadAchievements();
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            alert(`¡Logro desbloqueado: ${name}! - ${description}`);
        }
    }

    // Verificar logro de visitar todas las páginas
    let visitedPages = JSON.parse(localStorage.getItem('visitedPages')) || [];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (!visitedPages.includes(currentPage)) {
        visitedPages.push(currentPage);
        localStorage.setItem('visitedPages', JSON.stringify(visitedPages));
    }
    if (visitedPages.length >= 5) { // Ajusta según el número de páginas
        unlockAchievement('Explorador', 'Visita todas las páginas del sitio.');
    }

    loadAchievements();

    // Chatbot interactivo
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    let chatUsed = false;

    function addMessage(message, isBot = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        if (isBot) messageDiv.classList.add('bot-message');
        messageDiv.textContent = message;
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && chatbotInput.value.trim()) {
            const userMessage = chatbotInput.value.trim();
            addMessage(userMessage);
            if (!chatUsed) {
                unlockAchievement('Conversador', 'Usaste el chat por primera vez.');
                chatUsed = true;
            }

            // Respuestas simples del bot
            let botResponse = '¡Hola! ¿En qué puedo ayudarte?';
            if (userMessage.toLowerCase().includes('curso')) {
                botResponse = 'Tenemos cursos como Redes Básicas y Terminal Linux. ¿Quieres ver alguno?';
            } else if (userMessage.toLowerCase().includes('proyecto')) {
                botResponse = 'Puedes explorar proyectos como Servidor Local o Backup Automático en la página de Proyectos.';
            } else if (userMessage.toLowerCase().includes('hola')) {
                botResponse = '¡Hola! ¿Qué quieres aprender hoy?';
            }
            setTimeout(() => addMessage(botResponse, true), 500);
            chatbotInput.value = '';
        }
    });

    // Temporizador de estudio
    const timerDisplay = document.getElementById('timer-display');
    const timerStart = document.getElementById('timer-start');
    const timerReset = document.getElementById('timer-reset');
    let timerInterval;
    let timeLeft = 25 * 60; // 25 minutos en segundos

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    timerStart.addEventListener('click', () => {
        if (!timerInterval) {
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    timerStart.textContent = 'Iniciar';
                    alert('¡Tiempo de estudio terminado! Toma un descanso.');
                    unlockAchievement('Estudiante Dedicado', 'Completaste una sesión de estudio.');
                }
            }, 1000);
            timerStart.textContent = 'Pausar';
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            timerStart.textContent = 'Iniciar';
        }
    });

    timerReset.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerInterval = null;
        timeLeft = 25 * 60;
        updateTimerDisplay();
        timerStart.textContent = 'Iniciar';
    });

    if (timerDisplay) updateTimerDisplay();
});
