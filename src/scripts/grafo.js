let pontos = []; 
//um ponto eh dado por x:, y:, barras1:(barras com x1,y1 = x,y), barras2: 
let conexo = true;
let ciclico = false;


function inserirBarra(sistema, barra){
    procurarPonto(barra.dados.x1, barra.dados.y1);
    procurarPonto(barra.dados.x2, barra.dados.y2);

    const pontosI = interceptaPonto(barra);
    for(let i=1; i<pontosI.length-1; i++){
        const barraCortada = {dados: { ...barra.dados, apoios1: [...barra.dados.apoios1],
                                            apoios2: [...barra.dados.apoios2],
                                            cargas1: [...barra.dados.cargas1],
                                            cargas2: [...barra.dados.cargas2]}};
        barraCortada.dados.x2 = pontosI[i].x;
        barraCortada.dados.y2 = pontosI[i].y;
        sistema.barras.push(barraCortada);
        pontosI[i-1].barras1.push(barraCortada);
        pontosI[i].barras2.push(barraCortada);
        
        barraCortada.apoios1 =  pontosI[i-1].apoios;
        barraCortada.apoios2 =  pontosI[i].apoios;
        barraCortada.cargas1 =  pontosI[i-1].cargas;
        barraCortada.cargas2 =  pontosI[i].cargas;

        barra.dados.x1 = barraCortada.dados.x2;
        barra.dados.y1 = barraCortada.dados.y2;
    }
    
    pontosI[pontosI.length-2].barras1.push(barra);
    pontosI[pontosI.length-1].barras2.push(barra);
    barra.dados.apoios1.push(...pontosI[pontosI.length-2].apoios);
    barra.dados.cargas1.push(...pontosI[pontosI.length-2].cargas);
    barra.dados.apoios2.push(...pontosI[pontosI.length-1].apoios);
    barra.dados.cargas2.push(...pontosI[pontosI.length-1].cargas);

    colocarApoiosPonto(pontosI[pontosI.length -2], barra, barra.dados.apoios2, barra.dados.cargas2);
    colocarApoiosPonto(pontosI[pontosI.length -1], barra, barra.dados.apoios1, barra.dados.cargas1);
}

function inserirCarga(carga){
    const ponto =  procurarPonto(carga.dados.x1, carga.dados.y1);
    colocarApoiosPonto(ponto, {dados:{}}, [], [carga]);
}

function inserirApoio(apoio){
    const ponto =  procurarPonto(apoio.dados.x, apoio.dados.y);
    colocarApoiosPonto(ponto, {dados:{}}, [apoio], []);
}

function inserirNo(no){     
    const barra = interceptaBarra(no.dados, sistemaEstatico);
    if(barra != null) barra.nos.push(no);
}

function removerBarra(barra){
    const p1 = procurarPonto(barra.dados.x1, barra.dados.y1);
    const p2 = procurarPonto(barra.dados.x2, barra.dados.y2);

    removerApoiosPonto(p1, barra, barra.dados.apoios2, barra.dados.cargas2);
    removerApoiosPonto(p2, barra, barra.dados.apoios1, barra.dados.cargas1);

    p1.barras1 = p1.barras1.filter(b => b.dados.id != barra.dados.id);
    p2.barras2 = p2.barras2.filter(b => b.dados.id != barra.dados.id);

    if(p1.apoios.length + p1.barras1.length + p1.barras2.length + p1.cargas.length == 0){
        pontos = pontos.filter(ps => (ps.x != p1.x || ps.y != p1.y))
    }
    if(p2.apoios.length + p2.barras1.length + p2.barras2.length + p2.cargas.length == 0){
        pontos = pontos.filter(ps => (ps.x != p2.x || ps.y != p2.y))
    }

    if(ciclico) refazerGrafo(sistemaEstatico);
}

function removerApoio(apoio){
    const p = procurarPonto(apoio.dados.x, apoio.dados.y);

    removerApoiosPonto(p, {}, [apoio], []);
    if(p.apoios.length + p.barras1.length + p.barras2.length + p.cargas.length == 0){
        pontos = pontos.filter(ps => (ps.x != p.x || ps.y != p.y))
    }
}

function removerCarga(carga){
    const p = procurarPonto(carga.dados.x1, carga.dados.y1);

    removerApoiosPonto(p, {}, [], [carga]);
    if(p.apoios.length + p.barras1.length + p.barras2.length + p.cargas.length == 0){
        pontos = pontos.filter(ps => (ps.x != p.x || ps.y != p.y))
    }
}

function removerObjetoGrafo(objeto){
    switch (objeto.tipo) {
        case "barra":
            removerBarra(objeto);
            break;
        case "apoioFixo":
            removerApoio(objeto);
            break;
        case "apoioSimples":
            removerApoio(objeto);
            break;
        case "carga":
            removerCarga(objeto);
            break;
        default:
            break;
    }
}

function colocarApoiosPonto(ponto, barraOrigem, apoios, cargas){
  if(ciclico) return;
  //Checar se eh ciclico
  for(const apoioP of ponto.apoios){
    for(const apoio of apoios){
        if(apoio.dados.id === apoioP.dados.id){ 
            ciclico=true;
            limparGrafo(sistemaEstatico);
            return;
        }
    }
  }
  for(const cargaP of ponto.cargas){
    for(const carga of cargas){
        if(carga.dados.id === cargaP.dados.id){ 
            ciclico=true;
            limparGrafo(sistemaEstatico);
            return;}
    }
  }

  ponto.apoios.push(...apoios)
  ponto.cargas.push(...cargas)

  const pontoFiltrado = {...ponto, 
                         barras1: ponto.barras1.filter(b => b != barraOrigem),
                         barras2: ponto.barras2.filter(b => b != barraOrigem)
                            }

  for(const barra of pontoFiltrado.barras1){
    barra.dados.apoios1.push(...apoios);
    barra.dados.cargas1.push(...cargas);
    colocarApoiosPonto(procurarPonto(barra.dados.x2,barra.dados.y2), barra, apoios, cargas);
  }
  for(const barra of pontoFiltrado.barras2){
    barra.dados.apoios2.push(...apoios);
    barra.dados.cargas2.push(...cargas);
    colocarApoiosPonto(procurarPonto(barra.dados.x1,barra.dados.y1), barra, apoios, cargas);
  }
}

function removerApoiosPonto(ponto, barraOrigem, apoios, cargas){
    if(ciclico) return;

    //Checar se eh ciclico
    for(const apoioP of ponto.apoios){
        for(const apoio of apoios){
            if(apoio.dados.id != apoioP.dados.id){ 
                ciclico=true;
                limparGrafo(sistemaEstatico);
                return;}
        }
    }
    for(const cargaP of ponto.cargas){
        for(const carga of cargas){
            if(carga.dados.id != cargaP.dados.id){ 
                ciclico=true;
                limparGrafo(sistemaEstatico);
                return;}
        }
    }

    ponto.barras1 = ponto.barras1.filter(b => b != barraOrigem),
    ponto.barras2 = ponto.barras2.filter(b => b != barraOrigem),
    ponto.cargas = ponto.cargas.filter(carga => {return !cargas.some(cargaRemover => cargaRemover.dados.id === carga.dados.id);}),
    ponto.apoios = ponto.apoios.filter(apoio => {return !apoios.some(apoioRemover => apoioRemover.dados.id === apoio.dados.id);})

    for(const barra of ponto.barras1){
        barra.dados.apoios1 = barra.dados.apoios1.filter(apoio => {return !apoios.some(apoioRemover => apoioRemover.dados.id === apoio.dados.id);});
        barra.dados.cargas1 = barra.dados.cargas1.filter(carga => {return !cargas.some(cargaRemover => cargaRemover.dados.id === carga.dados.id);});
        
        removerApoiosPonto(procurarPonto(barra.dados.x2, barra.dados.y2), barra, apoios, cargas);
    }
    for(const barra of ponto.barras2){
        barra.dados.apoios2 = barra.dados.apoios2.filter(apoio => {return !apoios.some(apoioRemover => apoioRemover.dados.id === apoio.dados.id);});
        barra.dados.cargas2 = barra.dados.cargas2.filter(carga => {return !cargas.some(cargaRemover => cargaRemover.dados.id === carga.dados.id);});
        
        removerApoiosPonto(procurarPonto(barra.dados.x1, barra.dados.y1), barra, apoios, cargas);
    }
}

function procurarPonto(x, y){
  for(const ponto of pontos){
    if(x === ponto.x && y === ponto.y) return ponto;
  }
  const novoPonto = {x: x, y:y, barras1:[],barras2:[], apoios:[], cargas: []};
  pontos.push(novoPonto);
  const barraInterceptada = interceptaBarra(novoPonto, sistemaEstatico);
  if(barraInterceptada != null){
    const barraCortada = {dados: { ...barraInterceptada.dados, apoios1: [...barraInterceptada.dados.apoios1],
                                            apoios2: [...barraInterceptada.dados.apoios2],
                                            cargas1: [...barraInterceptada.dados.cargas1],
                                            cargas2: [...barraInterceptada.dados.cargas2]}};
    barraCortada.dados.x2 = novoPonto.x;
    barraCortada.dados.y2 = novoPonto.y;
    
    const ponto = procurarPonto(barraCortada.dados.x1, barraCortada.dados.y1)
    ponto.barras1 = ponto.barras1.filter(b => b !== barraInterceptada);
    ponto.barras1.push(barraCortada);

    barraInterceptada.dados.x1 = novoPonto.x;
    barraInterceptada.dados.y1 = novoPonto.y;
    //adicionando ao sistema
    sistemaEstatico.barras.push(barraCortada);
    //Adicionando ao ponto
    novoPonto.barras1.push(barraInterceptada);
    novoPonto.barras2.push(barraCortada);
  }  
  return novoPonto;
}

function interceptaPonto(barra){
  /*
  ax+b = y
  (y1-y2)x + (x1-x2)y1 + (y1-y2) = y
  */
    const x1 = barra.dados.x1;
    const x2 = barra.dados.x2;
    const y1 = barra.dados.y1;
    const y2 = barra.dados.y2;
  
    const interceptados = [];
    
    // Define os limites do segmento uma única vez fora do loop
    const minX = Math.min(x1, x2)
    const maxX = Math.max(x1, x2)
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

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
    if( (px == x1 && py == y1) || (px == x2 && py == y2 )) return false;    

    // 2. O produto vetorial deve ser zero para confirmar que estão alinhados
    // Fórmula: (y2 - y1) * (px - x1) - (x2 - x1) * (py - y1)
    const crossProduct = (y2 - y1) * (px - x1) - (x2 - x1) * (py - y1);
    
    return crossProduct === 0;
}

// Para testar com vários segmentos:
function interceptaBarra(ponto, sistema) {
    for (const barra of sistema.barras) {
        // Supondo que cada segmento seja [{x, y}, {x, y}]
        if (pontoNoSegmento(ponto.x, ponto.y, barra.dados.x1, barra.dados.y1,  barra.dados.x2, barra.dados.y2)) {
            return barra;
        }
    }
    return null;
}

function limparGrafo(sistema){
    for(const barra of sistema.barras){
        barra.dados.apoios1.length = 0;
        barra.dados.apoios2.length = 0;
        barra.dados.cargas1.length = 0;
        barra.dados.cargas2.length = 0;
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