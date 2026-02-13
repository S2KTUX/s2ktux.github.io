// Barra de progreso de lectura
window.addEventListener('scroll', () => {

    const progressBar = document.querySelector('.reading-progress');

    // si no existe, no hacemos nada
    if(!progressBar) return;

    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;

    progressBar.style.width = scrolled + '%';
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

// Manejo de pestañas
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase active de todos los botones y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Añadir clase active al botón clicado y al contenido correspondiente
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
});



/* ===== TERMINAL ===== */

document.addEventListener("DOMContentLoaded", function(){

const terminal = document.getElementById("terminal-body");
if(!terminal) return; // evita errores si no existe

function print(text, type="output"){
    const line = document.createElement("div");
    line.className = type;
    line.textContent = text;
    terminal.appendChild(line);
}

/* mensaje inicial */

function boot(){

    print("Bienvenido a s2ktux");
    print("---------------------------------------");
    print("Aquí podrás aprender sobre Linux");
    print("Preparación para certificados LPIC y RHCSA");
    print("Y proyectos pequeños...");
    print('Escribe "help" para comenzar.');
}

/* crear input */

function createInput(){

    const wrapper = document.createElement("div");
    wrapper.className = "input-line";

    const prompt = document.createElement("span");
    prompt.className = "prompt";
    prompt.textContent = "s2ktux@web:~$";

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

/* comandos */

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
        print(" Trabajo en el area de sistemas desde hace años y me gusta mucho Linux. Al mismo tiempo que aprendo, me gusta compartirlo para todo aquel que esté siguiendo mi mismo camino");
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
    print("Buen intento 😄", "error!");
}

    else if(cmd !== ""){
        print("Command not found: "+cmd,"error");
    }
}

/* iniciar terminal */

boot();
createInput();

};
