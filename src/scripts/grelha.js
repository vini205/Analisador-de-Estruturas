//Grelha!!!

// 1. Pegamos o tamanho da tela
const width = (window.innerWidth) * 0.8;
const height = (window.innerHeight) * 0.5;
let tamanhoGrelha = calcularTamanhoGrelha(window.innerWidth);

function calcularTamanhoGrelha(width) {
    if (width < 880 && width > 300) return 40;
    if (width <= 300) return 30;
    return 50;
}


// 2. Criamos o "Palco" (Stage) onde tudo será desenhado
const stage = new Konva.Stage({
    container: 'container', // O ID da div lá no HTML
    width: width,
    height: height,
});

// NOVA CAMADA: Camada da Estrutura (barras, forças, apoios)
const layerEstrutura = new Konva.Layer(); 
stage.add(layerEstrutura);

const layerGrelha = new Konva.Layer();
stage.add(layerGrelha);

window.addEventListener('resize',()=>{
    stage.width(window.innerWidth * 0.8);
    stage.height(window.innerHeight * 0.5);
    
    tamanhoGrelha = calcularTamanhoGrelha(window.innerWidth);
    desenharGrelha();
    
    layerEstrutura.draw();

})

desenharGrelha();

// --- 3. LÓGICA DE DESENHO E GRELHA ---

// dicionario que guarda o ponto inicial11
let pontoInicialBarra = null;

// Memória para a barra selecionada e o texto de inspeção
window.barraSelecionada = null;
let tooltipInspecao = null;

// Função para cancelar o desenho da barra
window.cancelarDesenhoBarra = function() {
    if (pontoInicialBarra) {
        pontoInicialBarra.referencia.fill('#a0a0a0'); // Volta cor original
        pontoInicialBarra.referencia.radius(2);       // Volta tamanho original
        layerGrelha.draw();
        pontoInicialBarra = null;
        console.log("Ponto cancelado por mudança de ferramenta.");
    }
}

// NOVA FUNÇÃO: Limpa a seleção de qualquer barra ativa
window.limparSelecao = function() {
    if (window.barraSelecionada) {
        window.barraSelecionada.stroke('#212529'); // Volta para a cor escura original
        window.barraSelecionada.strokeWidth(5);
        window.barraSelecionada = null;
    }
    if (tooltipInspecao) {
        tooltipInspecao.destroy(); // Apaga a etiqueta de texto
        tooltipInspecao = null;
    }
    layerEstrutura.draw();
}

function desenharGrelha() {
    const width = stage.width();
    const height = stage.height();
    layerGrelha.destroyChildren();
    console.log(width,height,tamanhoGrelha)
    console.log("Desenhando a grelha interativa...");
    for (let x = tamanhoGrelha; x <= width; x += tamanhoGrelha) {
        for (let y = tamanhoGrelha; y <= height; y += tamanhoGrelha) {
            
            const ponto = new Konva.Circle({
                x: x,
                y: y,
                radius: 2,
                fill: '#a0a0a0', 
                stroke: 'transparent', // Borda invisível
                strokeWidth: 10, 
                listening: true, // Ouve os cliques
                perfectDrawEnabled: false
            });
            // area de clicável
            ponto.hitFunc(function (context){
                context.beginPath();
                context.arc(0, 0, 8, 0, Math.PI * 2, true);
                context.closePath();
                context.fillStrokeShape(this);
            })
            // Efeito do mouse
            ponto.on('mouseenter', function () { document.body.style.cursor = 'crosshair'; });
            ponto.on('mouseleave', function () { document.body.style.cursor = 'default'; });

            // EVENTO PRINCIPAL DE CLIQUE NO PONTO
            ponto.on('click tap', function () {
                
                // Fica neutro (Navegação Segura) e limpa seleções se clicar no nada
                if (window.ferramentaAtual === 'Selecionar') {
                    window.limparSelecao();
                    return; // Impede que faça qualquer outra coisa
                }

                if (window.ferramentaAtual === 'Inserir Barra') {
                    
                    if (pontoInicialBarra === null) {
                        // --- PRIMEIRO CLIQUE ---
                        pontoInicialBarra = {
                            x: this.x(),
                            y: this.y(),
                            referencia: this
                        };
                        
                        this.fill('#0d6efd'); // Azul
                        this.radius(5);
                        layerGrelha.draw();
                        console.log("Ponto 1 selecionado. Aguardando Ponto 2...");

                    } else {
                        // --- SEGUNDO CLIQUE ---
                        if (this.x() === pontoInicialBarra.x && this.y() === pontoInicialBarra.y) {
                            window.cancelarDesenhoBarra();
                            return;
                        }

                        // Cria a Barra
                        const barra = new Konva.Line({
                            points: [pontoInicialBarra.x, pontoInicialBarra.y, this.x(), this.y()],
                            stroke: '#212529',
                            strokeWidth: 5,
                            hitStrokeWidth: 15,
                            lineCap: 'round',
                            lineJoin: 'round',
                            listening: true // Permite clicar nela!
                        });

                        barra.on('click tap', function(e) {
                            if (window.ferramentaAtual === 'Selecionar') {
                                // Impede que o clique "vaze" para a grelha embaixo dela
                                e.cancelBubble = true; 

                                // Limpa a seleção anterior (se houver)
                                window.limparSelecao();

                                // Seleciona esta barra (fica vermelha indicando foco)
                                window.barraSelecionada = this;
                                this.stroke('#dc3545'); // Vermelho alerta
                                
                                // Matemática de Inspeção
                                const pts = this.points();
                                // Transformamos de pixels para a unidade da grelha (/50)
                                const dx = (pts[2] - pts[0]) / tamanhoGrelha;
                                // Multiplicamos por -1 no Y porque no canvas o eixo Y cresce para baixo
                                const dy = (pts[3] - pts[1]) / tamanhoGrelha * -1; 

                                const comprimento = Math.sqrt(dx*dx + dy*dy).toFixed(2);
                                const angulo = (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(1);

                                // Cria o balão de texto (Tooltip) com a informação
                                tooltipInspecao = new Konva.Label({
                                    x: (pts[0] + pts[2]) / 2, // Posiciona no meio da barra
                                    y: (pts[1] + pts[3]) / 2 - 15,
                                    opacity: 0.95
                                });
                                
                                tooltipInspecao.add(new Konva.Tag({
                                    fill: '#343a40',
                                    pointerDirection: 'down',
                                    pointerWidth: 10,
                                    pointerHeight: 10,
                                    cornerRadius: 4
                                }));
                                
                                tooltipInspecao.add(new Konva.Text({
                                    text: `L: ${comprimento}m\nθ: ${angulo}°`,
                                    fontFamily: 'Arial',
                                    fontSize: 13,
                                    padding: 8,
                                    fill: 'white'
                                }));

                                layerEstrutura.add(tooltipInspecao);
                                layerEstrutura.draw();
                                
                                console.log(`🔍 Inspeção - Comprimento: ${comprimento} | Ângulo: ${angulo}°`);
                            }
                        });
                        
                        // Muda o cursor ao passar o mouse por cima da barra no modo Selecionar
                        barra.on('mouseenter', function() {
                            if (window.ferramentaAtual === 'Selecionar') document.body.style.cursor = 'pointer';
                        });
                        barra.on('mouseleave', function() {
                            document.body.style.cursor = 'default';
                        });

                        layerEstrutura.add(barra);
                        layerEstrutura.draw();

                        console.log("Barra criada com sucesso!");

                        // Reseta
                        pontoInicialBarra.referencia.fill('#a0a0a0');
                        pontoInicialBarra.referencia.radius(2);
                        pontoInicialBarra = null;
                        layerGrelha.draw();
                    }
                }
            });

            layerGrelha.add(ponto);
        }
    }


    //Sistemas de Coordenadas//

    // 5. Criando o Sistema de Eixos de Coordenadas
    const origemX = tamanhoGrelha;
    const origemY = tamanhoGrelha;
    const espacamento = tamanhoGrelha*0.2;
    // --- EIXO X (Horizontal) ---
    const eixoX = new Konva.Arrow({
        points: [origemX, origemY, width - 10, origemY], 
        pointerLength: 10,
        pointerWidth: 10,
        fill: '#ff3333',     
        stroke: '#ff3333',   
        strokeWidth: 2,      
    });

    const labelX = new Konva.Text({
        x: width - 20,
        y: origemY - 25,     
        text: 'x',
        fontSize: 20,
        fontStyle: 'bold',
        fill: '#ff3333',
    });

    // --- EIXO Y (Vertical) ---
    const eixoY = new Konva.Arrow({
        points: [origemX, origemY, origemX, height - 10], 
        pointerLength: 10,
        pointerWidth: 10,
        fill: '#3333ff',     
        stroke: '#3333ff',   
        strokeWidth: 2,
    });

    const labelY = new Konva.Text({
        x: origemX - 25,     
        y: height - 30,
        text: 'y',
        fontSize: 20,
        fontStyle: 'bold',
        fill: '#3333ff',
    });

    // 6. Adicionamos os eixos e textos na mesma camada da grelha
    layerGrelha.add(eixoX);
    layerGrelha.add(labelX);
    layerGrelha.add(eixoY);
    layerGrelha.add(labelY);

    //Indices nos eixos//
    for (let x = tamanhoGrelha; x < width; x = x + tamanhoGrelha) { 
        const indice = new Konva.Text({
            x: 5+x,
            y: tamanhoGrelha+7,
            text: ((x-tamanhoGrelha)/tamanhoGrelha),
            fontSize: 14,
            fontStyle: 'bold',
            fill: '#0e0e0e',
        });
        layerGrelha.add(indice);
    }

    for (let y = 2*tamanhoGrelha; y < height; y = y + tamanhoGrelha) { 
        const indice = new Konva.Text({
            y: y,
            x: tamanhoGrelha+10,
            text: ((y-tamanhoGrelha)/tamanhoGrelha),
            fontSize: 15,
            fontStyle: 'bold',
            fill: '#0e0e0e',
        });
        layerGrelha.add(indice);
    }
    //_______________Fim dos indices nos eixos_________________//
}






// --- LÓGICA DE EXCLUSÃO PELO TECLADO (Delete ou Backspace) ---
document.addEventListener('keydown', function(event) {
    if ((event.key === 'Delete' || event.key === 'Backspace') && window.ferramentaAtual === 'Selecionar') {
        if (window.barraSelecionada) {
            window.barraSelecionada.destroy(); // Remove a barra do Konva
            window.barraSelecionada = null;
            
            if (tooltipInspecao) {
                tooltipInspecao.destroy();
                tooltipInspecao = null;
            }
            
            layerEstrutura.draw();
            console.log("Barra excluída com sucesso!");
        }
    }
});




//__________ Botao Apagar Menu Ferramentas _________________//

// --- NOVA FUNÇÃO: APAGAR TODA A ESTRUTURA ---
window.apagarTodaEstrutura = function() {
    // 1. Cancela qualquer barra que esteja sendo desenhada pela metade
    window.cancelarDesenhoBarra();
    
    // 2. Limpa qualquer barra que esteja selecionada/vermelha
    window.limparSelecao();
    
    // 3. O Konva tem um comando nativo maravilhoso que destroi todos os elementos de uma camada:
    layerEstrutura.destroyChildren();
    
    // 4. Redesenha a camada (agora vazia)
    layerEstrutura.draw();
    
    console.log("🧹 Toda a estrutura foi apagada da tela!");
};

//__________ Fim do Botao Apagar do Menu Ferramentas ____________//






//Logica de Deseleçao das barras quando clicando fora delas//


// --- DESSELECIONAR AO CLICAR FORA DO CANVAS (Menu, fundo do site, etc) ---
        document.addEventListener('click', function(e) {
            // Pegamos a div container onde o Konva mora
            const container = document.getElementById('container');
            
            // Se o elemento clicado (e.target) NÃO estiver dentro do container do canvas
            if (!container.contains(e.target)) {
                // Limpa a seleção das barras
                if (typeof window.limparSelecao === 'function') {
                    window.limparSelecao();
                }
            }
        });


        // --- DESSELECIONAR AO CLICAR NO ESPAÇO VAZIO DA GRELHA ---
        stage.on('click tap', function (e) {
            // Verifica se o alvo exato do clique foi o fundo (stage)
            if (e.target === stage) {
                window.limparSelecao();
                
                // Se quiser, pode também cancelar o início de uma barra se clicar no vazio
                if (window.ferramentaAtual === 'Inserir Barra') {
                    window.cancelarDesenhoBarra();
                }
            }
        });

//______ Fim da lógica de deseleção das Barras quando clicando fora delas ______//