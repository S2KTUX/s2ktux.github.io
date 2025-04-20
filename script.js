fetch('contenido.md')
    .then(response => response.text())
    .then(data => {
        document.getElementById('markdown-content').innerHTML = marked.parse(data);
    });

