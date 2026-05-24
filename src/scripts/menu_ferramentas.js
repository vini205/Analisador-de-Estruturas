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

        // --- LÓGICA EXCLUSIVA DO BOTÃO APAGAR TUDO ---
        if (window.ferramentaAtual === 'Apagar') {
            
            // Uma caixinha de segurança do navegador pergunta se ele tem certeza
            const confirmar = confirm("Tem certeza que deseja apagar toda a estrutura? Esta ação não pode ser desfeita.");
            
            if (confirmar && typeof window.apagarTodaEstrutura === 'function') {
                window.apagarTodaEstrutura();
            }
            
            // Detalhe de Ouro (UX): Como ele já apagou tudo, não faz sentido continuar na ferramenta "Apagar".
            // Nós forçamos um clique no botão "Selecionar" para voltar ao modo seguro automaticamente.
            const botaoSelecionar = document.querySelector('[title="Selecionar (Mover)"]');
            if (botaoSelecionar) {
                botaoSelecionar.click(); 
            }
        }
        
        console.log("🛠️ Ferramenta ativa:", window.ferramentaAtual);
    });
});