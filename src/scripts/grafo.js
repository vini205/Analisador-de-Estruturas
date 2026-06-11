const pontos = []; 
//um ponto eh dado por x:, y:, barras1:(barras com x1,y1 = x,y), barras2: 
let conexo = true;
let ciclico = false;


function inserirBarra(sistema, barra){
    procurarPonto(barra.x1, barra.y1);
    procurarPonto(barra.x2, barra.y2);

    const pontosI = interceptaPonto(barra);
    for(const i=1; i<pontosI.length-1; i++){
        const barraCortada ={x1: barra.x1, y1: barra.y1, x2: pontosI[i].x, y2: postosI[i].y, id:barra.id};
        sistema.barras.push(barraCortada);
        pontosI[i-1].barras1.push(barraCortada);
        pontosI[i].barras2.push(barraCortada);
        
        barraCortada.apoios1 =  pontosI[i-1].apoios;
        barraCortada.apoios2 =  pontosI[i].apoios;
        barraCortada.cargas1 =  pontosI[i-1].cargas;
        barraCortada.cargas2 =  pontosI[i].cargas;

        barraCortada.apoios1 = pontosI[i-2].
        barra.x1 = barraCortada.x2;
        barra.y1 = barraCortada.y2;
    }
    pontosI[pontosI.length-2].barras1.push(barra);
    pontosI[pontosI.length-1].barras2.push(barra);
    barra.apoios1 =  pontosI[pontosI.length-2].apoios;
    barra.cargas1 =  pontosI[pontosI.length-2].cargas;
    barra.apoios2 =  pontosI[pontosI.length-1].apoios;
    barra.cargas2 =  pontosI[pontosI.length-1].cargas;

    colocarApoiosPonto(pontosI[pontosI.length -2], barra, pontosI[pontosI.length -1].apoio);
    colocarApoiosPonto(pontosI[pontosI.length -1], barra, pontosI[pontosI.length -2].apoio);
}

function inserirCarga(carga){
    const ponto =  procurarPonto(carga.x, carga.y);
    colocarApoiosPonto(ponto, {}, [], [carga]);
}

function inserirApoio(apoio){
    const ponto =  procurarPonto(apoio.x, apoio.y);
    colocarApoiosPonto(ponto, {}, [apoio], []);
}

function inserirNo(no){
    const barra = interceptaBarra(no, sistemaEstatico);
    if(barra != null) barra.nos.push(no);
}

function removerBarra(barra){
    const p1 = procurarPonto(barra.x1, barra.y1);
    const p2 = procurarPonto(barra.x2, barra.y2);

    removerApoiosPonto(p1, barra, barra.apoios2, barra.cargas2);
    removerApoiosPonto(p2, barra, barra.apoios1, barra.cargas1);

    if(ciclico) refazerGrafo(sistemaEstatico);
}

function removerApoio(apoio){
    const p = procurarPonto(apoio.x, apoio.y);

    removerApoiosPonto(p, {}, [apoio], []);
}

function removerCarga(carga){
    const p = procurarPonto(carga.x, carga.y);

    removerApoiosPonto(p, {}, [], [carga]);
}


function colocarApoiosPonto(ponto, barraOrigem, apoios, cargas){
  if(ciclico) return;

  //Checar se eh ciclico
  for(const apoioP in ponto.apoios){
    for(const apoio in apoios){
        if(apoio == apoioP){ 
            ciclico=true;
            limparGrafo(sistemaEstatico);
            return;}
    }
  }
  for(const cargaP in ponto.cargas){
    for(const carga in cargas){
        if(carga == cargaP){ 
            ciclico=true;
            limparGrafo(sistemaEstatico);
            return;}
    }
  }

  ponto.apoios.push(...apoios)
  ponto.cargas.push(...cargas)

  for(const barra of ponto.barras1){
    if(barra === barraOrigem) continue;
    barra.apoios1.push(...apoios);
    barra.cargas1.push(...cargas);
    colocarApoiosPonto(procurarPonto(barra.x2,barras.y2), barra, apoios, cargas);
  }
  for(const barra of ponto.barras2){
    if(barra === barraOrigem) continue;
    barra.apoios2.push(...apoios);
    barra.cargas2.push(...cargas);
    colocarApoiosPonto(procurarPonto(barra.x1,barras.y1), barra, apoios, cargas);
  }
}

function removerApoiosPonto(ponto, barraOrigem, apoios, cargas){
    if(ciclico) return;

    //Checar se eh ciclico
    for(const apoioP in ponto.apoios){
        for(const apoio in apoios){
            if(apoio != apoioP){ 
                ciclico=true;
                limparGrafo(sistemaEstatico);
                return;}
        }
    }
    for(const cargaP in ponto.cargas){
        for(const carga in cargas){
            if(carga != cargaP){ 
                ciclico=true;
                limparGrafo(sistemaEstatico);
                return;}
        }
    }

    const pontoFiltrado = ponto.barras1.filter(b => b.id !== barraOrigem.id);
    
    for(const barra of ponto.barras1){
        barra.apoios1 = barra.apoios1.filter(apoio => {return !apoios.some(apoioRemover => apoioRemover.id === apoio .id);});
        barra.cargas1 = barra.cargas1.filter(carga => {return !cargas.some(cargaRemover => cargaRemover.id === carga .id);});
        
        removerApoiosPonto(procurarPonto(barra.x2,barras.y2), barra, apoios, cargas);
    }
    for(const barra of ponto.barras2){
        barra.apoios2 = barra.apoios2.filter(apoio => {return !apoios.some(apoioRemover => apoioRemover.id === apoio .id);});
        barra.cargas2 = barra.cargas2.filter(carga => {return !cargas.some(cargaRemover => cargaRemover.id === carga .id);});
        
        removerApoiosPonto(procurarPonto(barra.x1,barras.y1), barra, apoios, cargas);
    }
}

function procurarPonto(x, y){
  for(const ponto of pontos){
    if(x === ponto.x && y === ponto.y) return ponto;
  }
  const novoPonto = {x: x, y:y, barras1:[],barras2:[], apoios:[]};
  pontos.push(novoPonto);
  const barraInterceptada = interceptaBarra(novoPonto, sistemaEstatico);
  if(barraInterceptada != null){
    const barraCortada =   {x1: barraInterceptada.x1, y1: barraInterceptada.y1,
                            x2: novoPonto.x, y2: novoPonto.y, 
                            apoios1: barraInterceptada.apoios1, apoios2: barraInterceptada.apoios2,
                            cargas1: barraInterceptada.cargas1, cargas2: barraInterceptada.cargas2,
                            id: barraInterceptada.id
                        }
    barraInterceptada.x1 = novoPonto.x;
    barraInterceptada.y1 = novoPonto.y;
  }
  return novoPonto;
}

function interceptaPonto(barra){
  /*
  ax+b = y
  (y1-y2)x + (x1-x2)y1 + (y1-y2) = y
  */
    const x1 = barra.x1;
    const x2 = barra.x2;
    const y1 = barra.y1;
    const y2 = barra.y2;
  
    const interceptados = [];
    
    // Define os limites do segmento uma única vez fora do loop
    const minX = x1 < x2 ? x1 : x2;
    const maxX = x1 > x2 ? x1 : x2;
    const minY = y1 < y2 ? y1 : y2;
    const maxY = y1 > y2 ? y1 : y2;

    const dx = x2 - x1;
    const dy = y2 - y1;

    for (let i = 0; i < pontos.length; i++) {
        const p = pontos[i];
        const px = p.x;
        const py = p.y;

        if (px >= minX && px <= maxX && py >= minY && py <=maxY) {
            
          // 2. Produto vetorial inline
          if (dy * (px - x1) === dx * (py - y1)) {
           interceptados.push(p);
            }
        }
    }
    if (x1 !== x2) {
        // Se a reta se move horizontalmente, ordena pelo eixo X
        if (x1 < x2) {
            interceptados.sort((a, b) => a.x - b.x); // Esquerda para Direita
        } else {
            interceptados.sort((a, b) => b.x - a.x); // Direita para Esquerda
        }
    } else {
        // Se a reta for estritamente vertical, ordena pelo eixo Y
        if (y1 < y2) {
            interceptados.sort((a, b) => a.y - b.y); // Baixo para Cima
        } else {
            interceptados.sort((a, b) => b.y - a.y); // Cima para Baixo
        }
    }
    return interceptados;
}


function pontoNoSegmento(px, py, x1, y1, x2, y2) {
    // 1. O ponto deve estar dentro da caixa delimitadora do segmento
    if (px < Math.min(x1, x2) || px > Math.max(x1, x2) ||
        py < Math.min(y1, y2) || py > Math.max(y1, y2)) {
        return false;
    }

    // 2. O produto vetorial deve ser zero para confirmar que estão alinhados
    // Fórmula: (y2 - y1) * (px - x1) - (x2 - x1) * (py - y1)
    const crossProduct = (y2 - y1) * (px - x1) - (x2 - x1) * (py - y1);
    
    return crossProduct === 0;
}

// Para testar com vários segmentos:
function interceptaBarra(ponto, sistema) {
    for (const barra of sistema.barras) {
        // Supondo que cada segmento seja [{x, y}, {x, y}]
        if (pontoNoSegmento(ponto.x, ponto.y, barra.x1, barra.y1,  barra.x2, barra.y2)) {
            return barra;
        }
    }
    return null;
}

function limparGrafo(sistema){
    for(const barra of sistema.barras){
        barra.apoios1.length = 0;
        barra.apoios2.length = 0;
        barra.cargas1.length = 0;
        barra.cargas2.length = 0;
    }
    for(const ponto of pontos){
        ponto.apoios.length = 0;
        ponto.cargas.length = 0;
    }
}

function refazerGrafo(sistema){
    ciclico = false;
    for(const apoio of sistema.apoiosFixos){
        inserirApoio(apoio);
        if(ciclico) return;
    }
    for(const apoio of sistema.apoiosSimples){
        inserirApoio(apoio);
        if(ciclico) return;
    }
    for(const carga of sistema.cargas){
        inserirCarga(carga);
        if(ciclico) return;
    }
}