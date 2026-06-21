function criaLabel(dados) {

    let dy = dados.y1 - dados.y2;
    let dx = dados.x1 - dados.x2;
    let comprimento = Math.sqrt( dx*dx + dy*dy);
    
    const angulo = (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(2);
    let label;
    if (dados.tipo == 'Carga') {
        label = ` ${dados.tipo}:\n Módulo: ${dados.modulo.toFixed(2)} N\n θ: ${angulo}º`;
    } else{
        label = ` ${dados.tipo}:\nL: ${comprimento}\n θ: ${angulo}º`;
    }
    return label;

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
    return new Promise((resolve) => {
        const id = Date.now();
        let [x1, x2, y1, y2] = [
            (xPonta - tamanhoGrelha) / tamanhoGrelha, (xCauda - tamanhoGrelha) / tamanhoGrelha,
            (yPonta - tamanhoGrelha) / tamanhoGrelha, (yCauda - tamanhoGrelha) / tamanhoGrelha
        ];
        const modalElement = document.getElementById('modalEntradaCarga');
        const inputElement = document.getElementById('inputModuloCarga');
        const btnConfirmar = document.getElementById('btnConfirmarCarga');
        const btnCancelar = document.getElementById('btnCancelarCarga');
        
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        inputElement.value = ''; 
        modalInstance.show();

        btnConfirmar.onclick = () => {
            let entradaUsuario = inputElement.value;
            let modulo = parseFloat(entradaUsuario.replace(',', '.'));

            if (isNaN(modulo)) {
                notificacao("Erro: O valor inserido não é numérico.");
                return; 
            }
            modalInstance.hide(); 
            const dados = {
                tipo: 'Carga', id: id,
                x1: x1, y1: y1,
                x2: x2, y2: y2,
                'modulo': modulo
            };

            let label = criaLabel(dados);  
            const cargaKonva = new Konva.Arrow({
                points: [xCauda, yCauda, xPonta, yPonta], 
                pointerLength: 10, pointerWidth: 10, fill: '#dc3545', 
                stroke: '#dc3545', strokeWidth: 4, id: id
            });
            
            if (typeof hearMeOut === 'function') hearMeOut();
            resolve(new ElementoGrelha('carga', cargaKonva, sistemaEstatico.cargas, dados, label));
        };

        // 5. Lógica de Cancelamento
        const cancelarOperacao = () => {
            modalInstance.hide();
            console.warn("Criação abortada.");
            resolve(null); 
        };

        btnCancelar.onclick = cancelarOperacao;
        modalElement.addEventListener('hidden.bs.modal', () => {
            resolve(null); 
        }, { once: true }); // Executa apenas uma vez para evitar loops de evento
    });
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


function modificarCarga(carga) {
    
}