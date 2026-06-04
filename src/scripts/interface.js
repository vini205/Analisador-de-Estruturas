const header = document.querySelector('header');
const containerGrelha = document.getElementById('container');

// Esconde ao entrar na grelha
containerGrelha.addEventListener('mouseenter', () => {
    header.classList.add('header-oculto');
});

// Mostra ao encostar o mouse no topo (menos de 60px da borda superior)
document.addEventListener('mousemove', (e) => {
    if (e.clientY < 60) {
        header.classList.remove('header-oculto');
    }
});