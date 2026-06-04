const header = document.querySelector('header');
const containerGrelha = document.getElementById('container');

// Variável para rastrear a última posição da rolagem da tela
let ultimaPosicaoScroll = window.scrollY;

// --- 1. COMPORTAMENTO PARA DESKTOP (MOUSE) ---
// Mantém a agilidade no computador ao entrar na área de desenho
containerGrelha.addEventListener('mouseenter', () => {
    header.classList.add('header-oculto');
});

document.addEventListener('mousemove', (e) => {
    if (e.clientY < 60) {
        header.classList.remove('header-oculto');
    }
});


// --- 2. COMPORTAMENTO INTERATIVO PARA CELULAR (TOUCH / SCROLL) ---

// Detecção de Rolagem: Esconde ao descer, mostra ao subir
window.addEventListener('scroll', () => {
    const posicaoScrollAtual = window.scrollY;

    // Se o usuário rolou para baixo e passou de 50px do topo, esconde o menu
    if (posicaoScrollAtual > ultimaPosicaoScroll && posicaoScrollAtual > 50) {
        header.classList.add('header-oculto');
    } 
    // Se o usuário rolou para cima (mesmo que um pouquinho), mostra o menu de volta
    else if (posicaoScrollAtual < ultimaPosicaoScroll) {
        header.classList.remove('header-oculto');
    }
    
    // Atualiza a posição para a próxima comparação
    ultimaPosicaoScroll = posicaoScrollAtual;
});

// Toque na Grelha: Se o celular disparar um evento de desenho na tela, 
// garante que o menu suma para liberar espaço visual imediato.
containerGrelha.addEventListener('touchstart', () => {
    header.classList.add('header-oculto');
}, { passive: true });