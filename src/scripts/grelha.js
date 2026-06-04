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

window.addEventListener('resize',()=>{
    stage.width(window.innerWidth * 0.8);
    stage.height(window.innerHeight * 0.5);
    
    tamanhoGrelha = calcularTamanhoGrelha(window.innerWidth);
    desenharGrelha();
    
    layerEstrutura.draw();
})

desenharGrelha();

// --- 3. LÓGICA DE DESENHO E GRELHA ---
let pontoInicialBarra = null;
window.barraSelecionada = null;
let tooltipInspecao = null;

// Função para cancelar o desenho da barra
window.cancelarDesenhoBarra = function() {
    if (pontoInicialBarra) {
        pontoInicialBarra.referencia.fill('#a0a0a0'); 
        pontoInicialBarra.referencia.radius(2);       
        layerGrelha.draw();
        pontoInicialBarra = null;
        console.log("Ponto cancelado por mudança de ferramenta.");
    }
}

// Função para limpar seleções ativas
window.limparSelecao = function() {
    if (window.barraSelecionada) {
        const cor = window.barraSelecionada.getAttr('corOriginal') || '#212529';
        const espessura = window.barraSelecionada.getAttr('espOriginal') || 5;
        
        window.barraSelecionada.stroke(cor); 
        window.barraSelecionada.strokeWidth(espessura);
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

                // --- [NOVO ELEMENTO] INSERIR APOIO SIMPLES ---
                if (window.ferramentaAtual === 'Apoio Simples') {
                    const xAlvo = this.x();
                    const yAlvo = this.y();

                    const apoioSimplesGrupo = new Konva.Group({ x: xAlvo, y: yAlvo, listening: true });

                    // Triângulo base verde
                    const triangulo = new Konva.RegularPolygon({
                        x: 0, y: 10, sides: 3, radius: 12,
                        fill: '#198754', stroke: '#212529', strokeWidth: 2,
                        name: 'trianguloApoioSimples', 
                        listening: true
                    });

                    // Círculo branco exatamente na junta/nó clicado
                    const circulinhoBranco = new Konva.Circle({
                        x: 0, y: 0, radius: 4.5, fill: 'white', stroke: '#212529', strokeWidth: 1.5, listening: false 
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

                // --- INSERIR CARGA CONCENTRADA ---
                if (window.ferramentaAtual === 'Carga') {
                    const carga = new Konva.Arrow({
                        points: [this.x(), this.y() - 40, this.x(), this.y() - 5], 
                        pointerLength: 8, pointerWidth: 8, fill: '#dc3545', stroke: '#dc3545', strokeWidth: 3, listening: true
                    });

                    carga.on('click tap', function(e) {
                        if (window.ferramentaAtual === 'Selecionar') {
                            e.cancelBubble = true; window.limparSelecao();
                            this.setAttr('corOriginal', this.stroke());
                            this.setAttr('espOriginal', this.strokeWidth());
                            window.barraSelecionada = this; 
                            this.stroke('#ffc107'); this.strokeWidth(5);

                            const pts = this.points(); 
                            tooltipInspecao = new Konva.Group({ x: pts[0], y: pts[1] - 20 });
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

                    this.fill('#dc3545');
                    setTimeout(() => { this.fill('#a0a0a0'); layerGrelha.draw(); }, 200);
                }
                
                // --- INSERIR NÓ ---
                if (window.ferramentaAtual === 'Inserir Nó') {
                    const noEstrutural = new Konva.Circle({ x: this.x(), y: this.y(), radius: 4, fill: '#212529', listening: true });
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
            // Se o elemento selecionado for o triângulo do Apoio Simples, deleta o Grupo pai (triângulo + círculo branco)
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
        if (window.ferramentaAtual === 'Inserir Barra') {
            window.cancelarDesenhoBarra();
        }
    }
});