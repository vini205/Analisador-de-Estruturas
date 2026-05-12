        // 1. Pegamos o tamanho da tela
        const width = (window.innerWidth)*0.8;
        const height = (window.innerHeight)*0.5;
        const tamanhoGrelha = 50;

        // 2. Criamos o "Palco" (Stage) onde tudo será desenhado
        const stage = new Konva.Stage({
            container: 'container', // O ID da div lá no HTML
            width: width,
            height: height,
        });

        // 3. Criamos a "Camada" (Layer) da Grelha
        const layerGrelha = new Konva.Layer();
        stage.add(layerGrelha); // Adicionamos a camada ao palco

        // 4. Desenhamos os pontos com os ciclos For
        
        for (let x = 0; x <= width; x += tamanhoGrelha) {
            for (let y = 0; y <= height; y += tamanhoGrelha) {
                
                // Criamos um ponto
                const ponto = new Konva.Circle({
                    x: x,
                    y: y,
                    radius: 2,
                    fill: '#a0a0a0', // Cor cinza
                    listening: false, // Ignora o mouse para o site não ficar lento
                    perfectDrawEnabled: false
                });

                // Colocamos o ponto na camada
                layerGrelha.add(ponto);
            }
        }