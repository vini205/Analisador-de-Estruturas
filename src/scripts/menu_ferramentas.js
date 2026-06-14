// ==========================================
// LÓGICA DO MENU DE FERRAMENTAS
// ==========================================

// 1. Selecionamos todos os botões da barra de ferramentas
const botoesMenu = document.querySelectorAll('.toolbar-btn');

// Variável global lida pelo grelha.js para saber o que desenhar
window.ferramentaAtual = 'Inserir Barra'; 

botoesMenu.forEach(botao => {
    botao.addEventListener('click', function() {
        // Remove o visual 'ativo' de todos e coloca apenas no clicado
        botoesMenu.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Atualiza a ferramenta global
        window.ferramentaAtual = this.querySelector('span').innerText;
        
        // --- INTEGRAÇÃO COM A NOVA GRELHA ---
        
        // 1. Desmarca qualquer elemento que estivesse selecionado
        if (typeof limparSelecao === 'function') {
            limparSelecao();
        }

        // 2. Cancela qualquer desenho pendente (ex: se o utilizador deu 1 clique na Barra/Carga e trocou de ferramenta)
        if (typeof window.cancelarDesenhoBarra === 'function') {
            window.cancelarDesenhoBarra();
        }

        console.log("🛠️ Ferramenta ativa:", window.ferramentaAtual);
    });
});


// ==========================================
// LÓGICA DE APAGAR TODA A ESTRUTURA (MODAL)
// ==========================================
const btnApagar = document.querySelector('#confirmarApagarGrelha');

if (btnApagar) {
    btnApagar.addEventListener('click', () => {
        // Apenas apaga tudo se a intenção for realmente o "Apagar"
        if (window.ferramentaAtual === 'Apagar') {

            // Chama a nossa nova função refatorada que limpa as classes e os arrays
            if (typeof apagarTodaEstrutura === 'function') {
                apagarTodaEstrutura();
            }
            
            // Força a mudança para a ferramenta "Selecionar" logo após apagar a tela, 
            // evitando que o utilizador continue a apagar coisas sem querer.
            const botaoSelecionar = document.querySelector('[title="Selecionar (Mover)"]');
            if (botaoSelecionar) {
                botaoSelecionar.click(); 
            }
            
            // Fecha o Modal do Bootstrap de forma segura
            const modalElement = document.getElementById('eraseGridModal');
            if (modalElement) {
                const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                modalInstance.hide();
            }
        } 
    });
}



function notificacao(message) {
    const toast = document.getElementById('notificacaoSistema');
    const corpo = document.getElementById('corpoToast');

    if (!toast || !corpo) {
        console.warn("Elementos não encontrados.");
        return;
    }

    corpo.textContent = message;

    const instanceToast = bootstrap.Toast.getOrCreateInstance(toast, {
        delay: 3000 
    });


    instanceToast.show();
}