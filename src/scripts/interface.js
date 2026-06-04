const header = document.querySelector('header');
const containerGrelha = document.getElementById('container');

// Variável para guardar a última posição do scroll
let ultimaPosicaoScroll = window.scrollY;

// --- 1. COMPORTAMENTO POR MOVIMENTO DO RATO (DESKTOP) ---

// Esconde o menu quando o rato entra na área de desenho da grelha
containerGrelha.addEventListener('mouseenter', () => {
    header.classList.add('header-oculto');
});

// Mostra o menu quando o rato se aproxima do topo do ecrã (menos de 60px)
document.addEventListener('mousemove', (e) => {
    if (e.clientY < 60) {
        header.classList.remove('header-oculto');
    }
});


// --- 2. COMPORTAMENTO POR ROLAGEM / SCROLL (DESKTOP E TELEMÓVEL) ---

window.addEventListener('scroll', () => {
    const posicaoScrollAtual = window.scrollY;

    // Se o utilizador fez scroll para baixo e já passou de 40px do topo: OCULTA
    if (posicaoScrollAtual > 10) {
        header.classList.add('header-oculto');
    } 
    // Se o utilizador fez scroll para cima: MOSTRA
    else if (posicaoScrollAtual < 10) {
        header.classList.remove('header-oculto');
    }
    
    // Atualiza a posição para a próxima comparação
    ultimaPosicaoScroll = posicaoScrollAtual;
});


// --- 3. COMPORTAMENTO POR TOQUE (TELEMÓVEL) ---

// Se o utilizador tocar na grelha para desenhar ou interagir, o menu recolhe logo
containerGrelha.addEventListener('touchstart', () => {
    header.classList.add('header-oculto');
}, { passive: true });