/* const header = document.querySelector('header');
const containerGrelha = document.getElementById('container');
if (header && containerGrelha) {
    
    // --- 1. COMPORTAMENTO EXCLUSIVO PARA DESKTOP (MOUSE) ---
    if (window.matchMedia("(pointer: fine)").matches) {
        
        containerGrelha.addEventListener('mouseenter', () => {
            if (!header.classList.contains('header-oculto')) {
                header.classList.add('header-oculto');
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (e.clientY < 30) {
                if (header.classList.contains('header-oculto')) {
                    header.classList.remove('header-oculto');
                }
            }
        });
    }

    // --- 2. COMPORTAMENTO EXCLUSIVO PARA CELULARES/TABLETS (TOUCH & SCROLL) ---
    if (window.matchMedia("(pointer: coarse)").matches) {
        let ultimaPosicaoScroll = window.scrollY;

        window.addEventListener('scroll', () => {
            const posicaoScrollAtual = window.scrollY;
            
            // Avaliação Vetorial: Se o delta é positivo (descendo) e passou de um limiar
            if (posicaoScrollAtual > ultimaPosicaoScroll && posicaoScrollAtual > 50) {
                if (!header.classList.contains('header-oculto')) {
                    header.classList.add('header-oculto');
                }
            } 
            // Avaliação Vetorial: Se o delta é negativo (subindo)
            else if (posicaoScrollAtual < ultimaPosicaoScroll) {
                if (header.classList.contains('header-oculto')) {
                    header.classList.remove('header-oculto');
                }
            }
            
            ultimaPosicaoScroll = posicaoScrollAtual;
        }, { passive: true }); // A flag passive melhora o framerate da rolagem

        containerGrelha.addEventListener('touchstart', () => {
            console.log("aqui")
            if (!header.classList.contains('header-oculto') && window.scrollY > 50 ) {
                header.classList.add('header-oculto');
            }
        }, { passive: true });
    }
        
}  */