// ==========================================
// 1. CONFIGURAÇÕES INICIAIS E VARIÁVEIS
// ==========================================
const sistemaEstatico = {
    barras: [],
    apoiosFixos: [],
    apoiosSimples: [],
    nos: [],
    cargas: []
};



const width = window.innerWidth * 0.8;
const height = window.innerHeight * 0.85;

let tamanhoGrelha = calcularTamanhoGrelha(window.innerWidth);
let elementoSelecionado = null; 

// Variáveis de controle para os desenhos de 2 cliques
window.pontoInicialBarra = null;
window.pontoInicialCarga = null;
let tooltipInspecao = null;
function calcularTamanhoGrelha(width) {
    if (width < 880 && width > 300) return 40;
    if (width <= 300) return 20;
    return 50;
}

// 2. SETUP DO KONVA.JS
const stage = new Konva.Stage({
    container: 'container', 
    width: width,
    height: height,
});

const layerEstrutura = new Konva.Layer(); 
const layerGrelha = new Konva.Layer();
const layerUI = new Konva.Layer(); // PARA O TOOLTIP

stage.add(layerEstrutura); 
stage.add(layerGrelha);   
stage.add(layerUI);

// 3. FUNÇÃO DE CANCELAMENTO
window.cancelarDesenhoBarra = function() {
    let cancelouAlgo = false;
    limparSelecao();
    // Desmarca o Ponto Inicial da Barra (Azul)
    if (window.pontoInicialBarra && window.pontoInicialBarra.referencia) {
        window.pontoInicialBarra.referencia.fill('#a0a0a0'); 
        window.pontoInicialBarra.referencia.radius(2);       
        window.pontoInicialBarra = null;                     
        cancelouAlgo = true;
    }

    // Desmarca o Ponto Inicial da Carga (Vermelho)
    if (window.pontoInicialCarga && window.pontoInicialCarga.referencia) {
        window.pontoInicialCarga.referencia.fill('#a0a0a0'); 
        window.pontoInicialCarga.referencia.radius(2);       
        window.pontoInicialCarga = null;                     
        cancelouAlgo = true;
    }

    // Só redesenha a grelha se realmente desmarcou alguma bolinha
    if (cancelouAlgo) {
        layerGrelha.draw();
        layerUI.draw()
        console.log("✏️ Ação pendente cancelada e grelha limpa.");
    }
};

// 4. REDIMENSIONAMENTO INTELIGENTE DA TELA
window.addEventListener('resize', () => {
    // 1. Cancela qualquer ação pela metade
    if (typeof window.cancelarDesenhoBarra === 'function') window.cancelarDesenhoBarra();
        
    const tamanhoGrelhaAntigo = tamanhoGrelha;
    
    // 2. Atualiza o tamanho do Canvas
    stage.width(window.innerWidth * 0.8);
    stage.height(window.innerHeight * 0.85);
    
    // 3. Recalcula o tamanho da malha
    tamanhoGrelha = calcularTamanhoGrelha(window.innerWidth);
    const proporcao = tamanhoGrelha / tamanhoGrelhaAntigo;

    // 4. Redesenha os pontos
    desenharGrelha();
    
    // 5. Ajusta as barras já desenhadas para a nova escala
    if (proporcao !== 1) {
        recalcularPosicoesEstrutura(proporcao);
    }
    
    layerEstrutura.draw();
});

function recalcularPosicoesEstrutura(proporcao) {
    layerEstrutura.getChildren().forEach(elemento => {
        // Atualiza coordenadas base
        elemento.x(elemento.x() * proporcao);
        elemento.y(elemento.y() * proporcao);

        // Atualiza os pontos de linhas e setas (Konva usa getClassName())
        if (elemento.getClassName() === 'Line' || elemento.getClassName() === 'Arrow') {
            const pontosAntigos = elemento.points();
            const novosPontos = pontosAntigos.map(p => p * proporcao);
            elemento.points(novosPontos);
        }
    });    
    console.log(`📏 Estrutura ajustada à nova escala (Proporção: ${proporcao})`);
}
function criaLabel(dados) {
    let dx= (dados.x1 - dados.x2);
    let dy = (dados.y1 - dados.y2);
    const comprimento = Math.sqrt( dx*dx + dy*dy ).toFixed(2);
    const angulo = (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(2);
    return ` ${dados.tipo}:\nL: ${comprimento}\n θ: ${angulo}º`

}
// 6. FACTORY FUNCTIONS (CRIADORES DE OBJETOS)
function criarBarra(x1, y1, x2, y2) {
    
    const id = Date.now();
    
    const dados = {
        tipo: 'Barra', id: id,
        x1: (x1 - tamanhoGrelha) / tamanhoGrelha, y1: (y1 - tamanhoGrelha) / tamanhoGrelha,
        x2: (x2 - tamanhoGrelha) / tamanhoGrelha, y2: (y2 - tamanhoGrelha) / tamanhoGrelha,
        apoios1: [], apoios2: [], cargas1:[], cargas2: []
    };

    let label = criaLabel(dados);  
    const barraKonva = new Konva.Line({
        points: [x1, y1, x2, y2], stroke: '#212529', strokeWidth: 5, 
        hitStrokeWidth: 15, lineCap: 'round', lineJoin: 'round', id: id
    });
    
    if (typeof hearMeOut === 'function') hearMeOut(); 
    return new ElementoGrelha('barra', barraKonva, sistemaEstatico.barras, dados, label);
}

function criarCarga(xCauda, yCauda, xPonta, yPonta) {
    const id = Date.now();
    const dados = {
        tipo: 'C    arga', id: id,
        x1: (xPonta - tamanhoGrelha) / tamanhoGrelha, y1: (yPonta - tamanhoGrelha) / tamanhoGrelha,
        x2: (xCauda - tamanhoGrelha) / tamanhoGrelha, y2: (yCauda - tamanhoGrelha) / tamanhoGrelha
    };

    let label = criaLabel(dados);  
    const cargaKonva = new Konva.Arrow({
        points: [xCauda, yCauda, xPonta, yPonta], 
        pointerLength: 10, pointerWidth: 10, fill: '#dc3545', 
        stroke: '#dc3545', strokeWidth: 4, id: id
    });
    
    if (typeof hearMeOut === 'function') hearMeOut();
    return new ElementoGrelha('carga', cargaKonva, sistemaEstatico.cargas, dados, label);
}

function criarApoioFixo(x, y) {
    const id = Date.now();
    const dados = { tipo: 'apoioFixo', id: id, x: (x - tamanhoGrelha) / tamanhoGrelha, y: (y - tamanhoGrelha) / tamanhoGrelha };
    
    const apoioKonva = new Konva.RegularPolygon({
        x: x, y: y + 10, sides: 3, radius: 12, 
        fill: '#e2cdcdff', stroke: '#000000ff', strokeWidth: 2, id: id
    });
    
    if (typeof hearMeOut === 'function') hearMeOut();
    return new ElementoGrelha('apoioFixo', apoioKonva, sistemaEstatico.apoiosFixos, dados, "Apoio Fixo");
}

function criarApoioSimples(x, y) {
    const id = Date.now();
    const dados = { tipo: 'apoioSimples', id: id, x: (x - tamanhoGrelha) / tamanhoGrelha, y: (y - tamanhoGrelha) / tamanhoGrelha };
    
    const apoioSimplesGrupo = new Konva.Group({ x: x, y: y, id: id });
    const triangulo = new Konva.RegularPolygon({ x: 0, y: 10, sides: 3, radius: 12, fill: '#e2cdcdff', stroke: '#000000ff', strokeWidth: 2 });
    const circulinhoBranco = new Konva.Circle({ x: 0, y: 0, radius: 4, fill: 'white', stroke: '#000000ff', strokeWidth: 1.5 });
    
    apoioSimplesGrupo.add(triangulo, circulinhoBranco);
    
    if (typeof hearMeOut === 'function') hearMeOut();
    return new ElementoGrelha('apoioSimples', apoioSimplesGrupo, sistemaEstatico.apoiosSimples, dados, "Apoio Simples");
}

function criarNo(x, y) {
    const id = Date.now();
    const dados = { tipo: 'nos', id: id, x: (x - tamanhoGrelha) / tamanhoGrelha, y: (y - tamanhoGrelha) / tamanhoGrelha };
    
    const noKonva = new Konva.Circle({ x: x, y: y, radius: 5, fill: '#212529', id: id });
    
    if (typeof hearMeOut === 'function') hearMeOut();
    return new ElementoGrelha('nos', noKonva, sistemaEstatico.nos, dados, "Nó");
}


// 7. LÓGICA DE SELEÇÃO E EXCLUSÃO
function selecionarElemento(elemento) {
    limparSelecao();
    elementoSelecionado = elemento;
    
    // Agora pedimos para a classe lidar com a pintura de vermelho com segurança!
    elementoSelecionado.salvarCorOriginal();
    elementoSelecionado.mudarCorVisual('#dc3545'); 
    layerEstrutura.draw();

    if (window.ferramentaAtual === 'Apagar') {
        apagarElementoSelecionado();
    } else {
        // Se o ToolTip existir, chama ele passando as informações
        if (typeof fazerToolTip === 'function') {
            const pts = elemento.shape.points ? elemento.shape.points() : [elemento.shape.x(), elemento.shape.y()];
            fazerToolTip(pts, elemento.label);
        }
    }
}

function limparSelecao() {
    if (elementoSelecionado) {
        // Pede à classe para devolver à cor original em segurança
        elementoSelecionado.restaurarCorOriginal(); 
        elementoSelecionado = null;
        layerEstrutura.draw();
    }
    if (tooltipInspecao != null && tooltipInspecao != 'undefined') {
        tooltipInspecao.destroy()
        tooltipInspecao = null
        layerUI.draw()
    }
}

function apagarElementoSelecionado() {
    if (elementoSelecionado) {
        const id = elementoSelecionado.dados.id;
        sistemaEstatico.barras = sistemaEstatico.barras.filter(b => b.dados.id != id);
        removerObjetoGrafo(elementoSelecionado);
        elementoSelecionado.remover();
        elementoSelecionado = null;
        if (typeof tooltipInspecao !== 'undefined' && tooltipInspecao) {
            tooltipInspecao.destroy();
            tooltipInspecao = null;
        }
        calcularTudo(sistemaEstatico);
        console.log("Elemento excluído com sucesso!");
    }
}

function apagarTodaEstrutura() {
    sistemaEstatico.barras.length = 0;
    const todosElementos = [
        ...sistemaEstatico.barras,
        ...sistemaEstatico.cargas,
        ...sistemaEstatico.apoiosSimples,
        ...sistemaEstatico.apoiosFixos,
        ...sistemaEstatico.nos // Adicionado nós aqui também!
    ];

    todosElementos.forEach(el => el.remover());
    
    if (typeof window.cancelarDesenhoBarra === 'function') window.cancelarDesenhoBarra();
    limparSelecao();
    
    layerEstrutura.destroyChildren();
    layerEstrutura.draw();
    pontos.length = 0;
    ciclico = false;
    calcularTudo(sistemaEstatico);
    console.log("🧹 Toda a estrutura foi apagada da tela!");
}
 // 8. INTERAÇÕES COM O STAGE (FUNDO)
document.addEventListener('click', function(e) {
    const container = document.getElementById('container');
    if (container && !container.contains(e.target)) {
        limparSelecao();
    }
}); 

stage.on('click tap', function (e) {
    if (e.target === stage) {
        limparSelecao();
        if (window.ferramentaAtual === 'Inserir Barra' || window.ferramentaAtual === 'Carga') {
            if (typeof window.cancelarDesenhoBarra === 'function') window.cancelarDesenhoBarra();
        }
    }
});



// 9. DESENHAR GRELHA (PONTOS)
function desenharGrelha() {
    const width = stage.width();
    const height = stage.height();
    layerGrelha.destroyChildren();

    for (let x = tamanhoGrelha; x <= width; x += tamanhoGrelha) {
        for (let y = tamanhoGrelha; y <= height; y += tamanhoGrelha) {
            
            const ponto = new Konva.Circle({
                x: x, y: y, radius: 2, fill: '#a0a0a0', 
                stroke: 'transparent', strokeWidth: 10, 
                listening: true, perfectDrawEnabled: false
            });

            ponto.hitFunc(function (context){
                context.beginPath();
                context.arc(0, 0, 8, 0, Math.PI * 2, true);
                context.closePath();
                context.fillStrokeShape(this);
            });

            ponto.on('mouseenter', () => { document.body.style.cursor = 'crosshair'; });
            ponto.on('mouseleave', () => { document.body.style.cursor = 'default'; });

            ponto.on('click tap', function () {
                if (window.ferramentaAtual === 'Selecionar') {
                    limparSelecao();
                    layerGrelha.listening(false);
                    const pos = stage.getPointerPosition();
                    const elementoAtras = stage.getIntersection(pos); 
                    layerGrelha.listening(true); 
                    
                    if (elementoAtras) {
                        elementoAtras.fire('click', { cancelBubble: true });
                        elementoAtras.fire('tap', { cancelBubble: true });
                    }
                    return; 
                }

                if (window.ferramentaAtual === 'Inserir Barra') {
                    if (!window.pontoInicialBarra) {
                        window.pontoInicialBarra = { x: this.x(), y: this.y(), referencia: this };
                        this.fill('#0d6efd'); this.radius(5);
                        layerGrelha.draw();
                    } else {
                        if (this.x() === window.pontoInicialBarra.x && this.y() === window.pontoInicialBarra.y) {
                            if(typeof window.cancelarDesenhoBarra === 'function') window.cancelarDesenhoBarra();
                            return;
                        }
                        const novaBarra = criarBarra(window.pontoInicialBarra.x, window.pontoInicialBarra.y, this.x(), this.y());
                        console.log(novaBarra);
                        inserirBarra(sistemaEstatico, novaBarra);
                        calcularTudo(sistemaEstatico);

                        window.pontoInicialBarra.referencia.fill('#a0a0a0');
                        window.pontoInicialBarra.referencia.radius(2);
                        window.pontoInicialBarra = null;
                        layerGrelha.draw();
                    }
                    return;
                }

                if (window.ferramentaAtual === 'Apoio Fixo') {
                    const novoApoio = criarApoioFixo(this.x(), this.y());
                    piscarPonto(this, '#198754');
                    inserirApoio(novoApoio);
                    calcularTudo(sistemaEstatico);
                    return;
                }

                if (window.ferramentaAtual === 'Apoio Simples') {
                    const novoApoio = criarApoioSimples(this.x(), this.y());
                    piscarPonto(this, '#198754');
                    inserirApoio(novoApoio);
                    calcularTudo(sistemaEstatico);
                    return;
                }

                if (window.ferramentaAtual === 'Inserir Nó') {
                    criarNo(this.x(), this.y());
                    piscarPonto(this, '#212529');
                    calcularTudo(sistemaEstatico);
                    return;
                }

                if (window.ferramentaAtual === 'Carga') {
                    if (!window.pontoInicialCarga) {
                        window.pontoInicialCarga = { x: this.x(), y: this.y(), referencia: this };
                        this.fill('#dc3545'); this.radius(5);
                        layerGrelha.draw();
                    } else {
                        if (this.x() === window.pontoInicialCarga.x && this.y() === window.pontoInicialCarga.y) {
                            if(typeof window.cancelarDesenhoBarra === 'function') window.cancelarDesenhoBarra(); 
                            return;
                        }
                        const novaCarga = criarCarga(this.x(), this.y(), window.pontoInicialCarga.x, window.pontoInicialCarga.y);
                        inserirCarga(novaCarga);
                        calcularTudo(sistemaEstatico);

                        window.pontoInicialCarga.referencia.fill('#a0a0a0');
                        window.pontoInicialCarga.referencia.radius(2);
                        window.pontoInicialCarga = null;
                        layerGrelha.draw();
                    }
                    return;
                }
            });

            layerGrelha.add(ponto);
        }
    }

    const origemX = tamanhoGrelha;
    const origemY = tamanhoGrelha;
    layerGrelha.add(
        new Konva.Arrow({ points: [origemX, origemY, width - 10, origemY], pointerLength: 10, pointerWidth: 10, fill: '#ff3333', stroke: '#ff3333', strokeWidth: 2 }),
        new Konva.Text({ x: width - 20, y: origemY - 25, text: 'x', fontSize: 20, fontStyle: 'bold', fill: '#ff3333' }),
        new Konva.Arrow({ points: [origemX, origemY, origemX, height - 10], pointerLength: 10, pointerWidth: 10, fill: '#3333ff', stroke: '#3333ff', strokeWidth: 2 }),
        new Konva.Text({ x: origemX - 25, y: height - 30, text: 'y', fontSize: 20, fontStyle: 'bold', fill: '#3333ff' })
    );

    for (let x = tamanhoGrelha; x < width; x += tamanhoGrelha) { 
        layerGrelha.add(new Konva.Text({ x: 5+x, y: tamanhoGrelha+7, text: ((x-tamanhoGrelha)/tamanhoGrelha), fontSize: 14, fontStyle: 'bold', fill: '#0e0e0e' }));
    }
    for (let y = 2*tamanhoGrelha; y < height; y += tamanhoGrelha) { 
        layerGrelha.add(new Konva.Text({ y: y, x: tamanhoGrelha+10, text: ((y-tamanhoGrelha)/tamanhoGrelha), fontSize: 15, fontStyle: 'bold', fill: '#0e0e0e' }));
    }
}

function piscarPonto(ponto, cor) {
    ponto.fill(cor);
    layerGrelha.draw();
    setTimeout(() => { ponto.fill('#a0a0a0'); layerGrelha.draw(); }, 200);
}

// INICIALIZA O DESENHO
desenharGrelha();


function fazerToolTip(pts, infoLabel) {
    if (tooltipInspecao) tooltipInspecao.destroy();
    let posX, posY;
    if (pts.length >= 4) {
        posX = (pts[0] + pts[2]) / 2;
        posY = (pts[1] + pts[3]) / 2;
    } else {
        posX = pts[0];
        posY = pts[1];
    }
    tooltipInspecao = new Konva.Group({
        x: posX, 
        y: posY - 25,
    });
    
    const fundoTooltip = new Konva.Rect({
        x: -40, y: -40, width: 80, height: 60, fill: '#343a40d4', cornerRadius: 5,
        shadowColor: 'black', shadowBlur: 4, shadowOpacity: 0.3, shadowOffset: { x: 0, y: 2 }
    });
    

    const infoTexto = new Konva.Text({
        x: -40, y: -37, text: infoLabel,
        fontFamily: 'Arial', fontSize: 11, fill: 'white', width: 80, align: 'center', lineHeight: 1.2
    });
    
    const ponta = new Konva.Line({ points: [-5, 20, 5, 20, 0, 26], fill: '#343a40', closed: true });
    
    const botaoApagarGrupo = new Konva.Group({ x: -25, y: 2, listening: true });
    const fundoBotao = new Konva.Rect({ width: 50, height: 16, fill: '#dc3545', cornerRadius: 3 });
    const textoBotao = new Konva.Text({
        text: 'Apagar', width: 50, height: 16, fontFamily: 'Arial', fontSize: 10, fontStyle: 'bold', fill: 'white', align: 'center', verticalAlign: 'middle'
    });
    
    botaoApagarGrupo.add(fundoBotao, textoBotao);
    
    botaoApagarGrupo.on('click tap', function(e) { 
        e.cancelBubble = true; 
        apagarElementoSelecionado(); 
    });
    
    botaoApagarGrupo.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
    botaoApagarGrupo.on('mouseleave', () => { document.body.style.cursor = 'default'; });

    tooltipInspecao.add(fundoTooltip, ponta, infoTexto, botaoApagarGrupo);
    layerUI.add(tooltipInspecao);
    layerUI.draw();
}