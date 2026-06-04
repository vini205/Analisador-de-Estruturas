//Grelha!!!;

// 1. Pegamos o tamanho da tela
const width = (window.innerWidth) * 0.8;
const height = (window.innerHeight) * 0.5;
let tamanhoGrelha = calcularTamanhoGrelha(window.innerWidth);

function calcularTamanhoGrelha(width) {
    if (width < 880 && width > 300) return 40;
    if (width <= 300) return 20;
    return 50;
}

// 2. Criamos o "Palco" (Stage) onde tudo será desenhado
const stage = new Konva.Stage({
    container: 'container', // O ID da div lá no HTML
    width: width,
    height: height,
});

// Camadas da Estrutura
const layerGrelha = new Konva.Layer();
const layerEstrutura = new Konva.Layer(); 
stage.add(layerEstrutura);
stage.add(layerGrelha);


// --- REDIMENSIONAMENTO INTELIGENTE DA TELA ---
window.addEventListener('resize', () => {
    // 1. Por segurança, cancelamos qualquer barra/carga que o usuário 
    // estava desenhando pela metade no momento em que a tela mudou de tamanho
    if (typeof window.cancelarDesenhoBarra === 'function') {
        window.cancelarDesenhoBarra();
    }

    // 2. Guardamos o tamanho antigo antes de calcular o novo
    const tamanhoGrelhaAntigo = tamanhoGrelha;
    
    // Atualiza o tamanho do Canvas
    stage.width(window.innerWidth * 0.8);
    stage.height(window.innerHeight * 0.5);
    
    // Calcula o novo tamanho da grelha
    tamanhoGrelha = calcularTamanhoGrelha(window.innerWidth);
    
    // 3. Descobrimos a taxa de proporção (ex: 40 / 50 = 0.8)
    const proporcao = tamanhoGrelha / tamanhoGrelhaAntigo;

    // Redesenha a grelha no fundo
    desenharGrelha();
    
    // 4. Se o tamanho da grelha realmente sofreu alteração, 
    // ajustamos as coordenadas de toda a estrutura para que acompanhem os novos pontos
    if (proporcao !== 1) {
        recalcularPosicoesEstrutura(proporcao);
    }
    
    layerEstrutura.draw();
});

// NOVA FUNÇÃO: Varre a camada da estrutura recalculando as posições
function recalcularPosicoesEstrutura(proporcao) {
    // getChildren() pega todas as Barras, Cargas, Apoios e Nós desenhados
    layerEstrutura.getChildren().forEach(elemento => {
        
        // Atualiza as coordenadas base (X e Y) usadas pelos Nós, Grupos e Apoios Fixos
        elemento.x(elemento.x() * proporcao);
        elemento.y(elemento.y() * proporcao);

        // Se o elemento for uma Linha (Barra) ou Seta (Carga),
        // precisamos atualizar o Array de coordenadas internamente
        if (elemento.className === 'Line' || elemento.className === 'Arrow') {
            const pontosAntigos = elemento.points();
            // Multiplica cada ponto x, y do array pela proporção
            const novosPontos = pontosAntigos.map(p => p * proporcao);
            elemento.points(novosPontos);
        }
    });
    
    console.log(`📏 Estrutura ajustada à nova escala (Proporção: ${proporcao})`);
}

desenharGrelha();

// --- 3. LÓGICA DE DESENHO E GRELHA ---
let pontoInicialBarra = null;
let pontoInicialCarga = null; // Variável para controlar o primeiro clique da carga
window.barraSelecionada = null;
let tooltipInspecao = null;

// Função para cancelar o desenho da barra ou da carga
window.cancelarDesenhoBarra = function() {
    if (pontoInicialBarra) {
        pontoInicialBarra.referencia.fill('#a0a0a0'); 
        pontoInicialBarra.referencia.radius(2);       
        pontoInicialBarra = null;
    }
    if (pontoInicialCarga) {
        pontoInicialCarga.referencia.fill('#a0a0a0');
        pontoInicialCarga.referencia.radius(2);
        pontoInicialCarga = null;
    }
    layerGrelha.draw();
    console.log("Desenho cancelado por mudança de ferramenta.");
}


// Função para limpar seleções ativas
window.limparSelecao = function() {
    if (window.barraSelecionada) {
        // Se for um Nó (Circle) e não um apoio/barra
        if (window.barraSelecionada.className === 'Circle' && !window.barraSelecionada.name()) {
            const cor = window.barraSelecionada.getAttr('corOriginal') || '#212529';
            window.barraSelecionada.fill(cor);
        } else {
            // Barras, Cargas e Apoios usam Stroke
            const cor = window.barraSelecionada.getAttr('corOriginal') || '#212529';
            const espessura = window.barraSelecionada.getAttr('espOriginal') || 5;
            
            window.barraSelecionada.stroke(cor); 
            window.barraSelecionada.strokeWidth(espessura);
        }
        window.barraSelecionada = null;
    }
    if (tooltipInspecao) {
        tooltipInspecao.destroy(); 
        tooltipInspecao = null;
    }
    layerEstrutura.draw();
}


function desenharGrelha() {
    const width = stage.width();
    const height = stage.height();
    layerGrelha.destroyChildren();

    for (let x = tamanhoGrelha; x <= width; x += tamanhoGrelha) {
        for (let y = tamanhoGrelha; y <= height; y += tamanhoGrelha) {
            
            const ponto = new Konva.Circle({
                x: x,
                y: y,
                radius: 2,
                fill: '#a0a0a0', 
                stroke: 'transparent',
                strokeWidth: 10, 
                listening: true,
                perfectDrawEnabled: false
            });

            ponto.hitFunc(function (context){
                context.beginPath();
                context.arc(0, 0, 8, 0, Math.PI * 2, true);
                context.closePath();
                context.fillStrokeShape(this);
            });

            ponto.on('mouseenter', function () { document.body.style.cursor = 'crosshair'; });
            ponto.on('mouseleave', function () { document.body.style.cursor = 'default'; });

            // EVENTO DE CLIQUE NO PONTO DA GRELHA
            ponto.on('click tap', function () {
                if (window.ferramentaAtual === 'Selecionar') {
                    window.limparSelecao();
                    
                    // TRUQUE: Desativa temporariamente o sensor da grelha para ver o que está atrás
                    layerGrelha.listening(false);
                    const pos = stage.getPointerPosition();
                    const elementoAtras = stage.getIntersection(pos); // Procura barras, nós ou apoios na mesma posição
                    layerGrelha.listening(true); // Reativa a grelha imediatamente
                    
                    // Se encontrou o Nó ou outro elemento atrás do ponto, simula o clique nele!
                    if (elementoAtras) {
                        elementoAtras.fire('click', { cancelBubble: true });
                        elementoAtras.fire('tap', { cancelBubble: true });
                    }
                    return; 
                }

                // --- INSERIR BARRA ---
                if (window.ferramentaAtual === 'Inserir Barra') {
                    if (pontoInicialBarra === null) {
                        pontoInicialBarra = { x: this.x(), y: this.y(), referencia: this };
                        this.fill('#0d6efd'); 
                        this.radius(5);
                        layerGrelha.draw();
                    } else {
                        if (this.x() === pontoInicialBarra.x && this.y() === pontoInicialBarra.y) {
                            window.cancelarDesenhoBarra();
                            return;
                        }

                        const barra = new Konva.Line({
                            points: [pontoInicialBarra.x, pontoInicialBarra.y, this.x(), this.y()],
                            stroke: '#212529',
                            strokeWidth: 5,
                            hitStrokeWidth: 15,
                            lineCap: 'round',
                            lineJoin: 'round',
                            listening: true
                        });

                        barra.on('click tap', function(e) {
                            if (window.ferramentaAtual === 'Selecionar') {
                                e.cancelBubble = true; 
                                window.limparSelecao();

                                window.barraSelecionada = this;
                                this.stroke('#dc3545'); 
                                
                                const pts = this.points();
                                const dx = (pts[2] - pts[0]) / tamanhoGrelha;
                                const dy = (pts[3] - pts[1]) / tamanhoGrelha * -1; 
                                const comprimento = Math.sqrt(dx*dx + dy*dy).toFixed(2);
                                const angulo = (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(1);

                                tooltipInspecao = new Konva.Group({
                                    x: (pts[0] + pts[2]) / 2, 
                                    y: (pts[1] + pts[3]) / 2 - 30, 
                                });

                                const fundoTooltip = new Konva.Rect({
                                    x: -50, y: -35, width: 100, height: 65, fill: '#343a40d4', cornerRadius: 6,
                                    shadowColor: 'black', shadowBlur: 4, shadowOpacity: 0.3, shadowOffset: { x: 0, y: 2 }
                                });
                                const ponta = new Konva.Line({ points: [-6, 30, 6, 30, 0, 38], fill: '#343a40', closed: true });
                                const infoTexto = new Konva.Text({
                                    x: -50, y: -28, text: `L: ${comprimento}m\nθ: ${angulo}°`,
                                    fontFamily: 'Arial', fontSize: 13, fill: 'white', width: 100, align: 'center', lineHeight: 1.3
                                });
                                const botaoApagarGrupo = new Konva.Group({ x: -35, y: 8, listening: true });
                                const fundoBotao = new Konva.Rect({ width: 70, height: 18, fill: '#dc3545', cornerRadius: 3 });
                                const textoBotao = new Konva.Text({
                                    text: 'Apagar', width: 70, height: 18, fontFamily: 'Arial', fontSize: 11, fontStyle: 'bold', fill: 'white', align: 'center', verticalAlign: 'middle'
                                });
                                
                                botaoApagarGrupo.add(fundoBotao, textoBotao);
                                botaoApagarGrupo.on('click tap', function(e) { e.cancelBubble = true; apagarBarra(); });
                                botaoApagarGrupo.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
                                botaoApagarGrupo.on('mouseleave', () => { document.body.style.cursor = 'default'; });

                                tooltipInspecao.add(fundoTooltip, ponta, infoTexto, botaoApagarGrupo);
                                layerEstrutura.add(tooltipInspecao);
                                tooltipInspecao.moveToTop();
                                layerEstrutura.draw();
                            }
                        });
                        
                        barra.on('mouseenter', function() { if (window.ferramentaAtual === 'Selecionar') document.body.style.cursor = 'pointer'; });
                        barra.on('mouseleave', function() { document.body.style.cursor = 'default'; });

                        layerEstrutura.add(barra);
                        layerEstrutura.draw();

                        pontoInicialBarra.referencia.fill('#a0a0a0');
                        pontoInicialBarra.referencia.radius(2);
                        pontoInicialBarra = null;
                        layerGrelha.draw();
                    }
                }

                // --- INSERIR APOIO FIXO ---
                if (window.ferramentaAtual === 'Apoio Fixo') {
                    const apoio = new Konva.RegularPolygon({
                        x: this.x(), y: this.y() + 10, sides: 3, radius: 12,
                        fill: '#198754', stroke: '#212529', strokeWidth: 2, listening: true
                    });

                    apoio.on('click tap', function(e) {
                        if (window.ferramentaAtual === 'Selecionar') {
                            e.cancelBubble = true; window.limparSelecao();
                            this.setAttr('corOriginal', this.stroke());
                            this.setAttr('espOriginal', this.strokeWidth());
                            window.barraSelecionada = this; 
                            this.stroke('#ffc107'); this.strokeWidth(4);

                            tooltipInspecao = new Konva.Group({ x: this.x(), y: this.y() - 40 });
                            const fundoTooltip = new Konva.Rect({ x: -40, y: -20, width: 80, height: 40, fill: '#343a40d4', cornerRadius: 6, shadowColor: 'black', shadowBlur: 4, shadowOpacity: 0.3, shadowOffset: { x: 0, y: 2 } });
                            const ponta = new Konva.Line({ points: [-6, 20, 6, 20, 0, 28], fill: '#343a40', closed: true });
                            const botaoApagarGrupo = new Konva.Group({ x: -35, y: -10, listening: true });
                            const fundoBotao = new Konva.Rect({ width: 70, height: 20, fill: '#dc3545', cornerRadius: 3 });
                            const textoBotao = new Konva.Text({ text: 'Apagar', width: 70, height: 20, fontFamily: 'Arial', fontSize: 12, fontStyle: 'bold', fill: 'white', align: 'center', verticalAlign: 'middle' });

                            botaoApagarGrupo.add(fundoBotao, textoBotao);
                            botaoApagarGrupo.on('click tap', function(e) { e.cancelBubble = true; apagarBarra(); });
                            botaoApagarGrupo.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
                            botaoApagarGrupo.on('mouseleave', () => { document.body.style.cursor = 'default'; });

                            tooltipInspecao.add(fundoTooltip, ponta, botaoApagarGrupo);
                            layerEstrutura.add(tooltipInspecao);
                            tooltipInspecao.moveToTop();
                            layerEstrutura.draw();
                        }
                    });
                    apoio.on('mouseenter', function() { if (window.ferramentaAtual === 'Selecionar') document.body.style.cursor = 'pointer'; });
                    apoio.on('mouseleave', function() { document.body.style.cursor = 'default'; });

                    layerEstrutura.add(apoio);
                    layerEstrutura.draw();
                    
                    this.fill('#198754');
                    setTimeout(() => { this.fill('#a0a0a0'); layerGrelha.draw(); }, 200);
                }

                // --- INSERIR APOIO SIMPLES ---
                if (window.ferramentaAtual === 'Apoio Simples') {
                    const xAlvo = this.x();
                    const yAlvo = this.y();

                    const apoioSimplesGrupo = new Konva.Group({ x: xAlvo, y: yAlvo, listening: true });

                    const triangulo = new Konva.RegularPolygon({
                        x: 0, y: 10, sides: 3, radius: 12,
                        fill: '#198754', stroke: '#212529', strokeWidth: 2,
                        name: 'trianguloApoioSimples', 
                        listening: true
                    });

                    const circulinhoBranco = new Konva.Circle({
                        x: 0, y: 0, radius: 4, fill: 'white', stroke: '#212529', strokeWidth: 1.5, listening: false 
                    });

                    apoioSimplesGrupo.add(triangulo, circulinhoBranco);

                    apoioSimplesGrupo.on('click tap', function(e) {
                        if (window.ferramentaAtual === 'Selecionar') {
                            e.cancelBubble = true; window.limparSelecao();
                            
                            triangulo.setAttr('corOriginal', triangulo.stroke());
                            triangulo.setAttr('espOriginal', triangulo.strokeWidth());
                            
                            window.barraSelecionada = triangulo; 
                            triangulo.stroke('#ffc107'); 
                            triangulo.strokeWidth(4);

                            tooltipInspecao = new Konva.Group({ x: xAlvo, y: yAlvo - 40 });
                            const fundoTooltip = new Konva.Rect({ x: -40, y: -20, width: 80, height: 40, fill: '#343a40d4', cornerRadius: 6, shadowColor: 'black', shadowBlur: 4, shadowOpacity: 0.3, shadowOffset: { x: 0, y: 2 } });
                            const ponta = new Konva.Line({ points: [-6, 20, 6, 20, 0, 28], fill: '#343a40', closed: true });
                            const botaoApagarGrupo = new Konva.Group({ x: -35, y: -10, listening: true });
                            const fundoBotao = new Konva.Rect({ width: 70, height: 20, fill: '#dc3545', cornerRadius: 3 });
                            const textoBotao = new Konva.Text({ text: 'Apagar', width: 70, height: 20, fontFamily: 'Arial', fontSize: 12, fontStyle: 'bold', fill: 'white', align: 'center', verticalAlign: 'middle' });

                            botaoApagarGrupo.add(fundoBotao, textoBotao);
                            botaoApagarGrupo.on('click tap', function(e) { e.cancelBubble = true; apagarBarra(); });
                            botaoApagarGrupo.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
                            botaoApagarGrupo.on('mouseleave', () => { document.body.style.cursor = 'default'; });

                            tooltipInspecao.add(fundoTooltip, ponta, botaoApagarGrupo);
                            layerEstrutura.add(tooltipInspecao);
                            tooltipInspecao.moveToTop();
                            layerEstrutura.draw();
                        }
                    });

                    apoioSimplesGrupo.on('mouseenter', function() { if (window.ferramentaAtual === 'Selecionar') document.body.style.cursor = 'pointer'; });
                    apoioSimplesGrupo.on('mouseleave', function() { document.body.style.cursor = 'default'; });

                    layerEstrutura.add(apoioSimplesGrupo);
                    layerEstrutura.draw();
                    
                    this.fill('#198754');
                    setTimeout(() => { this.fill('#a0a0a0'); layerGrelha.draw(); }, 200);
                }

                // --- [MODIFICADO] INSERIR CARGA CONCENTRADA POR 2 CLIQUES ---
                if (window.ferramentaAtual === 'Carga') {
                    if (pontoInicialCarga === null) {
                        // Primeiro clique define a PONTA DA SETA
                        pontoInicialCarga = { x: this.x(), y: this.y(), referencia: this };
                        this.fill('#dc3545'); // Altera para vermelho indicando início do desenho
                        this.radius(5);
                        layerGrelha.draw();
                    } else {
                        // Se o segundo clique for no mesmo ponto, cancela
                        if (this.x() === pontoInicialCarga.x && this.y() === pontoInicialCarga.y) {
                            window.cancelarDesenhoBarra();
                            return;
                        }

                        // Segundo clique define o FINAL (Cauda).
                        // Passamos o ponto atual (cauda) primeiro e o ponto inicial (ponta) por último
                        const carga = new Konva.Arrow({
                            points: [this.x(), this.y(), pontoInicialCarga.x, pontoInicialCarga.y], 
                            pointerLength: 10, 
                            pointerWidth: 10, 
                            fill: '#dc3545', 
                            stroke: '#dc3545', 
                            strokeWidth: 4, 
                            listening: true
                        });

                        carga.on('click tap', function(e) {
                            if (window.ferramentaAtual === 'Selecionar') {
                                e.cancelBubble = true; window.limparSelecao();
                                this.setAttr('corOriginal', this.stroke());
                                this.setAttr('espOriginal', this.strokeWidth());
                                window.barraSelecionada = this; 
                                this.stroke('#ffc107'); this.strokeWidth(5);

                                // Calcula o ponto médio da seta para posicionar o balão de forma limpa
                                const pts = this.points(); 
                                tooltipInspecao = new Konva.Group({ 
                                    x: (pts[0] + pts[2]) / 2, 
                                    y: (pts[1] + pts[3]) / 2 - 25 
                                });
                                
                                const fundoTooltip = new Konva.Rect({ x: -40, y: -20, width: 80, height: 40, fill: '#343a40d4', cornerRadius: 6, shadowColor: 'black', shadowBlur: 4, shadowOpacity: 0.3, shadowOffset: { x: 0, y: 2 } });
                                const ponta = new Konva.Line({ points: [-6, 20, 6, 20, 0, 28], fill: '#343a40', closed: true });
                                const botaoApagarGrupo = new Konva.Group({ x: -35, y: -10, listening: true });
                                const fundoBotao = new Konva.Rect({ width: 70, height: 20, fill: '#dc3545', cornerRadius: 3 });
                                const textoBotao = new Konva.Text({ text: 'Apagar', width: 70, height: 20, fontFamily: 'Arial', fontSize: 12, fontStyle: 'bold', fill: 'white', align: 'center', verticalAlign: 'middle' });

                                botaoApagarGrupo.add(fundoBotao, textoBotao);
                                botaoApagarGrupo.on('click tap', function(e) { e.cancelBubble = true; apagarBarra(); });
                                botaoApagarGrupo.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
                                botaoApagarGrupo.on('mouseleave', () => { document.body.style.cursor = 'default'; });

                                tooltipInspecao.add(fundoTooltip, ponta, botaoApagarGrupo);
                                layerEstrutura.add(tooltipInspecao);
                                tooltipInspecao.moveToTop();
                                layerEstrutura.draw();
                            }
                        });
                        carga.on('mouseenter', function() { if (window.ferramentaAtual === 'Selecionar') document.body.style.cursor = 'pointer'; });
                        carga.on('mouseleave', function() { document.body.style.cursor = 'default'; });

                        layerEstrutura.add(carga);
                        layerEstrutura.draw();

                        // Reseta a marcação visual do primeiro ponto
                        pontoInicialCarga.referencia.fill('#a0a0a0');
                        pontoInicialCarga.referencia.radius(2);
                        pontoInicialCarga = null;
                        layerGrelha.draw();
                    }
                }
                
                // --- INSERIR NÓ ---
                if (window.ferramentaAtual === 'Inserir Nó') {
                    const noEstrutural = new Konva.Circle({ 
                        x: this.x(), y: this.y(), radius: 5, fill: '#212529', listening: true 
                    });

                    noEstrutural.on('click tap', function(e) {
                        if (window.ferramentaAtual === 'Selecionar') {
                            e.cancelBubble = true; 
                            window.limparSelecao();

                            // Guarda a cor original preta antes de amarelar
                            this.setAttr('corOriginal', this.fill());
                            window.barraSelecionada = this;
                            this.fill('#ffc107'); // Fica amarelo ao selecionar
                            
                            // Cria o menu flutuante de Apagar logo acima do Nó
                            tooltipInspecao = new Konva.Group({ x: this.x(), y: this.y() - 25 });
                            const fundoTooltip = new Konva.Rect({ x: -40, y: -20, width: 80, height: 40, fill: '#343a40d4', cornerRadius: 6, shadowColor: 'black', shadowBlur: 4, shadowOpacity: 0.3, shadowOffset: { x: 0, y: 2 } });
                            const ponta = new Konva.Line({ points: [-6, 20, 6, 20, 0, 28], fill: '#343a40', closed: true });
                            const botaoApagarGrupo = new Konva.Group({ x: -35, y: -10, listening: true });
                            const fundoBotao = new Konva.Rect({ width: 70, height: 20, fill: '#dc3545', cornerRadius: 3 });
                            const textoBotao = new Konva.Text({ text: 'Apagar', width: 70, height: 20, fontFamily: 'Arial', fontSize: 12, fontStyle: 'bold', fill: 'white', align: 'center', verticalAlign: 'middle' });

                            botaoApagarGrupo.add(fundoBotao, textoBotao);
                            botaoApagarGrupo.on('click tap', function(e) { e.cancelBubble = true; apagarBarra(); });
                            botaoApagarGrupo.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
                            botaoApagarGrupo.on('mouseleave', () => { document.body.style.cursor = 'default'; });

                            tooltipInspecao.add(fundoTooltip, ponta, botaoApagarGrupo);
                            layerEstrutura.add(tooltipInspecao);
                            tooltipInspecao.moveToTop();
                            layerEstrutura.draw();
                        }
                    });

                    noEstrutural.on('mouseenter', function() { if (window.ferramentaAtual === 'Selecionar') document.body.style.cursor = 'pointer'; });
                    noEstrutural.on('mouseleave', function() { document.body.style.cursor = 'default'; });
                    
                    layerEstrutura.add(noEstrutural);
                    layerEstrutura.draw();
                }

            });

            layerGrelha.add(ponto);
        }
    }

    // Sistema de Coordenadas
    const origemX = tamanhoGrelha;
    const origemY = tamanhoGrelha;
    const eixoX = new Konva.Arrow({ points: [origemX, origemY, width - 10, origemY], pointerLength: 10, pointerWidth: 10, fill: '#ff3333', stroke: '#ff3333', strokeWidth: 2 });
    const labelX = new Konva.Text({ x: width - 20, y: origemY - 25, text: 'x', fontSize: 20, fontStyle: 'bold', fill: '#ff3333' });
    const eixoY = new Konva.Arrow({ points: [origemX, origemY, origemX, height - 10], pointerLength: 10, pointerWidth: 10, fill: '#3333ff', stroke: '#3333ff', strokeWidth: 2 });
    const labelY = new Konva.Text({ x: origemX - 25, y: height - 30, text: 'y', fontSize: 20, fontStyle: 'bold', fill: '#3333ff' });

    layerGrelha.add(eixoX, labelX, eixoY, labelY);

    for (let x = tamanhoGrelha; x < width; x = x + tamanhoGrelha) { 
        const indice = new Konva.Text({ x: 5+x, y: tamanhoGrelha+7, text: ((x-tamanhoGrelha)/tamanhoGrelha), fontSize: 14, fontStyle: 'bold', fill: '#0e0e0e' });
        layerGrelha.add(indice);
    }
    for (let y = 2*tamanhoGrelha; y < height; y = y + tamanhoGrelha) { 
        const indice = new Konva.Text({ y: y, x: tamanhoGrelha+10, text: ((y-tamanhoGrelha)/tamanhoGrelha), fontSize: 15, fontStyle: 'bold', fill: '#0e0e0e' });
        layerGrelha.add(indice);
    }
}

// Exclusão por Teclado
document.addEventListener('keydown', function(event) {
    if ((event.key === 'Delete' || event.key === 'Backspace') && window.ferramentaAtual === 'Selecionar') {
       apagarBarra();
    }
});

function apagarBarra() {
    if (window.barraSelecionada) {
            if (window.barraSelecionada.name() === 'trianguloApoioSimples' && window.barraSelecionada.getParent()) {
                window.barraSelecionada.getParent().destroy();
            } else {
                window.barraSelecionada.destroy(); 
            }
            
            window.barraSelecionada = null;
            if (tooltipInspecao) {
                tooltipInspecao.destroy();
                tooltipInspecao = null;
            }
            layerEstrutura.draw();
            console.log("Elemento excluído com sucesso!");
    }
}

window.apagarTodaEstrutura = function() {
    window.cancelarDesenhoBarra();
    window.limparSelecao();
    layerEstrutura.destroyChildren();
    layerEstrutura.draw();
    console.log("🧹 Toda a estrutura foi apagada da tela!");
};

// Desselecionar ao clicar fora do canvas
document.addEventListener('click', function(e) {
    const container = document.getElementById('container');
    if (!container.contains(e.target)) {
        if (typeof window.limparSelecao === 'function') {
            window.limparSelecao();
        }
    }
});

stage.on('click tap', function (e) {
    if (e.target === stage) {
        window.limparSelecao();
        if (window.ferramentaAtual === 'Inserir Barra' || window.ferramentaAtual === 'Carga') {
            window.cancelarDesenhoBarra();
        }
    }
});