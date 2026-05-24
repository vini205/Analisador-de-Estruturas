// --- LÓGICA DO MENU DE FERRAMENTAS ---

// 1. Selecionamos todos os botões que têm a classe 'toolbar-btn'
const botoesMenu = document.querySelectorAll('.toolbar-btn');

// Variável global para sabermos qual é a ferramenta ativa neste momento
// Usamos window.ferramentaAtual para que o outro arquivo (grelha.js) consiga ler
window.ferramentaAtual = 'Inserir Barra'; 


botoesMenu.forEach(botao => {
    botao.addEventListener('click', function() {
        botoesMenu.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Atualiza a ferramenta global
        window.ferramentaAtual = this.querySelector('span').innerText;
        
        // Cancela desenhos pendentes sempre que trocar de ferramenta
        if (typeof window.cancelarDesenhoBarra === 'function') {
            window.cancelarDesenhoBarra();
        }

        
        console.log("🛠️ Ferramenta ativa:", window.ferramentaAtual);
    });
});

const btnApagar = document.querySelector('#confirmarApagarGrelha')
btnApagar.addEventListener('click',()=>{
    // --- APAGAR TUDO ---
        if (window.ferramentaAtual === 'Apagar') {

            window.apagarTodaEstrutura();
            
            // Nós forçamos um clique no botão "Selecionar" 
            const botaoSelecionar = document.querySelector('[title="Selecionar (Mover)"]');
            if (botaoSelecionar) {
                botaoSelecionar.click(); 
            }
            const modalElement = document.getElementById('eraseGridModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
        }
})
