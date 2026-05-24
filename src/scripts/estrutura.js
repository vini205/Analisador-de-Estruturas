console.log("✅ Iniciando o aplicativo...");

        // --- 1. CONFIGURAÇÕES BASE ---
        const width = window.innerWidth;
        const height = window.innerHeight;
        const tamanhoGrelha = 50;

        const stage = new Konva.Stage({
            container: 'container', 
            width: width,
            height: height,
        });

        // NOVA CAMADA: Camada da Estrutura (barras, forças, apoios)
        // Ela é adicionada depois, por isso ficará "por cima" da grelha visualmente
        const layerEstrutura = new Konva.Layer();
        stage.add(layerEstrutura);

        // --- 2. LÓGICA DO MENU ---
        const botoesMenu = document.querySelectorAll('.toolbar-btn');
        let ferramentaAtual = 'Inserir Barra'; // Ferramenta padrão

        botoesMenu.forEach(botao => {
            botao.addEventListener('click', function() {
                botoesMenu.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                ferramentaAtual = this.querySelector('span').innerText;
                
                // Se o usuário mudar de ferramenta no meio do desenho de uma barra, cancelamos a ação
                if (pontoInicialBarra !== null) {
                    cancelarDesenhoBarra();
                }
                
                console.log("🛠️ Ferramenta ativa:", ferramentaAtual);
            });
        });


        // --- 3. LÓGICA DE DESENHO E GRELHA ---
        
        // Memória para guardar o primeiro clique da barra
        let pontoInicialBarra = null;

        // Função para cancelar o desenho se o usuário desistir ou trocar de ferramenta
        function cancelarDesenhoBarra() {
            if (pontoInicialBarra) {
                pontoInicialBarra.referencia.fill('#a0a0a0'); // Volta cor original
                pontoInicialBarra.referencia.radius(2);       // Volta tamanho original
                layerGrelha.draw();
                pontoInicialBarra = null;
            }
        }

        console.log("✅ Desenhando a grelha interativa...");
        for (let x = 0; x <= width; x += tamanhoGrelha) {
            for (let y = 0; y <= height; y += tamanhoGrelha) {
                
                const ponto = new Konva.Circle({
                    x: x,
                    y: y,
                    radius: 2,
                    fill: '#a0a0a0', 
                    listening: true, // Ouve os cliques
                    perfectDrawEnabled: false
                });

                // Efeito do mouse
                ponto.on('mouseenter', function () { document.body.style.cursor = 'crosshair'; });
                ponto.on('mouseleave', function () { document.body.style.cursor = 'default'; });

                // EVENTO PRINCIPAL DE CLIQUE NO PONTO
                ponto.on('click tap', function () {
                    
                    if (ferramentaAtual === 'Inserir Barra') {
                        
                        if (pontoInicialBarra === null) {
                            // --- PRIMEIRO CLIQUE ---
                            // Guarda as coordenadas e a referência do círculo clicado
                            pontoInicialBarra = {
                                x: this.x(),
                                y: this.y(),
                                referencia: this
                            };
                            
                            // Destaca o ponto para o usuário saber que "pegou"
                            this.fill('#0d6efd'); // Azul
                            this.radius(5);
                            layerGrelha.draw();
                            console.log("Ponto 1 selecionado. Aguardando Ponto 2...");

                        } else {
                            // --- SEGUNDO CLIQUE ---
                            
                            // Impede que o usuário clique no mesmo ponto duas vezes
                            if (this.x() === pontoInicialBarra.x && this.y() === pontoInicialBarra.y) {
                                cancelarDesenhoBarra();
                                return;
                            }

                            // Desenha a barra (Linha) conectando os dois pontos
                            const barra = new Konva.Line({
                                points: [pontoInicialBarra.x, pontoInicialBarra.y, this.x(), this.y()],
                                stroke: '#212529', // Cor preta/cinza escuro
                                strokeWidth: 5,    // Espessura da barra
                                lineCap: 'round',
                                lineJoin: 'round',
                                listening: true    // No futuro, permitiremos clicar na barra para apagá-la ou botar carga
                            });

                            layerEstrutura.add(barra);
                            layerEstrutura.draw(); // Atualiza apenas a camada da estrutura

                            console.log("Barra criada com sucesso!");

                            // Reseta o primeiro ponto para a cor original (Fim do processo)
                            pontoInicialBarra.referencia.fill('#a0a0a0');
                            pontoInicialBarra.referencia.radius(2);
                            pontoInicialBarra = null;
                            layerGrelha.draw(); // Atualiza a grelha para apagar a bolinha azul
                        }
                    }
                });

                layerGrelha.add(ponto);
            }
        }