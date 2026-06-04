const header = document.querySelector('header');
const containerGrelha = document.getElementById('container');

// --- 1. COMPORTAMENTO EXCLUSIVO PARA DESKTOP (MOUSE) ---
// Só ativa se o dispositivo NÃO for puramente móvel/touch
if (window.matchMedia("(pointer: fine)").matches) {
    
    // Esconde o menu quando o mouse entra na área de desenho da grelha
    containerGrelha.addEventListener('mouseenter', () => {
        header.classList.add('header-oculto');
    });

    // Mostra o menu quando o mouse se aproxima do topo da tela (menos de 60px)
    document.addEventListener('mousemove', (e) => {
        if (e.clientY < 60) {
            header.classList.remove('header-oculto');
        }
    });
}

// --- 2. COMPORTAMENTO EXCLUSIVO PARA CELULARES/TABLETS (TOUCH & SCROLL) ---
// Só ativa se o dispositivo principal for toque (móvel)
if (window.matchMedia("(pointer: coarse)").matches) {
    let ultimaPosicaoScroll = window.scrollY;

    // Controla o menu através do movimento de arrastar a página
    window.addEventListener('scroll', () => {
        const posicaoScrollAtual = window.scrollY;

        // Se o usuário arrastou para baixo: OCULTA
        if (posicaoScrollAtual > 5) {
            header.classList.add('header-oculto');
        } 
        // Se o usuário arrastou para cima: MOSTRA
        else if (posicaoScrollAtual < 10) {
            header.classList.remove('header-oculto');
        }
        
        ultimaPosicaoScroll = posicaoScrollAtual;
    });

    // Se o usuário tocar na área da grelha para interagir, recolhe o menu imediatamente
    containerGrelha.addEventListener('touchstart', () => {
        header.classList.add('header-oculto');
    }, { passive: true });
}