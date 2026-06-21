function draw(expression, range, divId, chartTitle) {
    try {
        const expr = math.compile(expression);
        const zInicio = parseFloat(range[0]);
        const zFim = parseFloat(range[1]);

        const zValues = math.range(zInicio, zFim, 0.1, true).toArray();
        if (zValues[zValues.length - 1] !== zFim) zValues.push(zFim); 

        const yValues = zValues.map(z => expr.evaluate({ z: z }));

        const trace1 = {
            x: zValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines',
            fill: 'tozeroy', 
            fillcolor: 'rgba(220, 53, 69, 0.2)',
            line: { color: '#dc3545', width: 2 }
        };

        const isMoment = chartTitle.toLowerCase().includes('momento');
        const layout = {
            title: chartTitle,
            xaxis: { title: 'z (m)', zeroline: true },
            yaxis: { 
                title: isMoment ? 'M (N.m)' : 'Força (N)', 
                autorange: isMoment ? 'reversed' : true, // inverte caso for momento
                zeroline: true 
            }, 
            margin: { t: 40, b: 40, l: 50, r: 20 }
        };

        Plotly.newPlot(divId, [trace1], layout, { responsive: true });
    }
    catch (err) {
        console.error("Erro de execução no gráfico :", err);
    }
}

function criarModalEPlotar(expression, range,title) {
    const modalId = 'modalGraficoDinamico';
    let modalElement = document.getElementById(modalId);

    // Cria a estrutura HTML do modal apenas se ele ainda não existir no documento
    if (!modalElement) {
        modalElement = document.createElement('div');
        modalElement.className = 'modal fade';
        modalElement.id = modalId;
        modalElement.setAttribute('tabindex', '-1');
        modalElement.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Visualização do Gráfico: ${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div id="plotContainer" style="width: 100%; height: 400px;"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalElement);
    }

    // Instancia o modal utilizando a API do Bootstrap
    const bsModal = new bootstrap.Modal(modalElement);

    // Cria o listener para desenhar o gráfico EXATAMENTE quando a animação do modal terminar
    const onModalShown = () => {
        draw(expression, range, 'plotContainer',title);
        // Remove o evento após a execução para evitar múltiplas chamadas em aberturas futuras
        modalElement.removeEventListener('shown.bs.modal', onModalShown);
    };

    modalElement.addEventListener('shown.bs.modal', onModalShown);

    // Exibe o modal na tela
    bsModal.show();
}