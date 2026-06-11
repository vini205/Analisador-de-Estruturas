
// ==========================================
// 5. CLASSE BASE ESTRUTURAL
// ==========================================
class ElementoGrelha {
    constructor(tipo, shape, arrayDestino, dados = {}) {
        this.tipo = tipo;
        this.shape = shape;
        this.arrayDestino = arrayDestino;
        this.dados = dados;

        this.shape.setAttr('elementoRef', this);
        this.init();
    }

    // --- MÉTODOS INTELIGENTES DE COR ---
    mudarCorVisual(cor) {
        // Se for grupo (Apoio Simples), aplica a cor no primeiro elemento (o Triângulo)
        const alvo = this.shape.getClassName() === 'Group' ? this.shape.getChildren()[0] : this.shape;
        
        if (this.tipo === 'nos') {
            alvo.fill(cor); // Nós usam preenchimento
        } else {
            alvo.stroke(cor); // Barras, Cargas e Apoio Fixo usam borda
        }
    }

    salvarCorOriginal() {
        if (!this.shape.getAttr('corOriginal')) {
            const alvo = this.shape.getClassName() === 'Group' ? this.shape.getChildren()[0] : this.shape;
            const corBase = this.tipo === 'nos' ? alvo.fill() : alvo.stroke();
            this.shape.setAttr('corOriginal', corBase);
        }
    }

    restaurarCorOriginal() {
        const corAntiga = this.shape.getAttr('corOriginal') || '#212529';
        this.mudarCorVisual(corAntiga);
    }

    // --- INICIALIZAÇÃO E EVENTOS ---
    init() {
        this.shape.on('mouseenter', () => {
            if (window.ferramentaAtual === 'Selecionar' || window.ferramentaAtual === 'Apagar') {
                document.body.style.cursor = 'pointer';
                
                // Aplica o efeito Laranja (Hover) só se não estiver já selecionado
                if (elementoSelecionado !== this) {
                    this.salvarCorOriginal();
                    this.mudarCorVisual('#f39c12'); 
                    layerEstrutura.draw();
                }
            }
        });

        this.shape.on('mouseleave', () => {
            document.body.style.cursor = 'default';
            
            // Só restaura a cor se ele não for o elemento atualmente clicado
            if (elementoSelecionado !== this) {
                this.restaurarCorOriginal();
                layerEstrutura.draw();
            }
        });

        this.shape.on('click tap', (e) => {
            if (window.ferramentaAtual === 'Selecionar' || window.ferramentaAtual === 'Apagar') {
                e.cancelBubble = true; 
                selecionarElemento(this);
            }
        });

        layerEstrutura.add(this.shape);
        this.arrayDestino.push(this);
        layerEstrutura.draw();
    }

    remover() {
        this.shape.destroy(); 
        const index = this.arrayDestino.indexOf(this);
        if (index > -1) {
            this.arrayDestino.splice(index, 1);
        }
        layerEstrutura.draw();
    }
}