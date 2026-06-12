function calcularTudo(sistemaNovo){
    console.log("A estrutura mudou! Recalculando reações...");
    try{
        calcularReacoes(sistemaNovo);//Dados novos será autualizado.
        //apoios simples: vão ganhar o atributo f:
        //apoios fixos: vão ganhar o atributo fx e fy
        console.log("APOIOS FIXOS:\n", sistemaNovo.apoiosFixos);
        console.log("APOIOS SIMPLES:\n", sistemaNovo.apoiosSimples);
        //implementar a impressao com o acima

        //calculando as barras
        for(const barra of sistemaNovo.barras){
            calcularFuncaoBarra(barra);
        }
    }catch(erro){
        //imprime ou não o o erro
        console.log(erro.message);
    }
    return;
}

function calcularReacoes(sistema){
    const variaveis = sistema.apoiosSimples.length + (2*sistema.apoiosFixos.length);
    let solucao;
    if(variaveis == 0) return;
    
    if(variaveis>3){
        throw new Error("Sistema hiperistático");
    }
    const [Rx, Ry, M] = calcularResultantes(sistema.cargas);
    if(variaveis<3){
        if(sistema.apoiosFixos.length==1){
            //3 equações, 2 incóginitas. Tem que bater a ultima linha 
            const fx = -Rx;
            const fy = -Ry;
            console.log(fx, fy, M);
            if(-fx*sistema.apoiosFixos[0].dados.y+fy*sistema.apoiosFixos[0].dados.x == -M){
                sistema.apoiosFixos[0].dados.fx = fx;
                sistema.apoiosFixos[0].dados.fy = fy;
                return;
            }
            else{
                throw new Error("Sistema hipostático");
            }
        }
        else if(variaveis==2){//2 apoios simples
            /* MATRIZ
                | a b || f1 | = | -Ry  |
                | c d || f2 |   | -M   |
             */
            matriz2 = new MatrizSimbolica(2, 2);
            matriz2.definir(0,0, 1); matriz2.definir(0,1, 1);
            matriz2.definir(1,0, sistema.apoiosSimples[0].dados.x); matriz2.definir(1,1, sistema.apoiosSimples[1].dados.x);
            
            solucao = matriz2.resolverCramer([-Ry, -M]).solucoes.map(Number);
            
            if(Rx == 0){ //Da para resolver
                sistema.apoiosSimples[0].dados.f = solucao[0];
                sistema.apoiosSimples[1].dados.f = solucao[1];
                return;
            }
            else{
                throw new Error("Sistema hipostático");
            }
        }
        else{//3 equacoes 1 incognita. Tem que ser a mesma equacao
            const f = -Ry;
            if(f*sistema.apoiosSimples[0].dados.x  == -M && Rx == 0){
                sistema.apoiosSimples[0].dados.f = f;
                return;
            }
            else{
                throw new Error("Sistema hipostático");
            }
        }
    }
    else{
        matriz3 = new MatrizSimbolica(3, 3);
        /* MATRIZ
        | a b c || f1 |   | -Rx  |
        | d e f || f2 | = | -Ry  |
        | g h i || f3 |   | -M   |
        */
        if(sistema.apoiosFixos.length==1){
            //f1 e f2 pertecem a esse apoio fixo, sendo f1 em x e f2 em y
            matriz3.definir(0,0, 1); matriz3.definir(0,1, 0); matriz3.definir(0,2, 0);
            matriz3.definir(1,0, 0); matriz3.definir(1,1, 1); matriz3.definir(1,2, 1);
            matriz3.definir(2,0, sistema.apoiosFixos[0].dados.y); matriz3.definir(2,1, sistema.apoiosFixos[0].dados.x); matriz3.definir(2,2, sistema.apoiosSimples[0].dados.x);

            solucao = matriz3.resolverCramer([-Rx, -Ry, -M]).solucoes.map(Number);
            sistema.apoiosFixos[0].dados.fx = solucao[0];
            sistema.apoiosFixos[0].dados.fy = solucao[1];
            sistema.apoiosSimples[0].dados.f = solucao[2];
            return
        }
        else{
            //f1, f2, f3 são verticais. Vai dar erro. (Det = 0)
            matriz3.definir(0,0, 0); matriz3.definir(0,1, 0); matriz3.definir(0,2, 0);
            matriz3.definir(1,0, 1); matriz3.definir(1,1, 1); matriz3.definir(1,2, 1);
            matriz3.definir(2,0, sistema.apoiosSimples[0].dados.x); matriz3.definir(2,1, sistema.apoiosSimples[1].dados.x); matriz3.definir(2,2, sistema.apoiosSimples[2].dados.x);   

            return matriz3.resolverCramer([-Rx, -Ry, -M]).solucoes.map(Number);
        }
    }
}

function calcularResultantes(cargas){
    let [Rx, Ry, M]=[0,0,0];
    for(const forca of cargas){
        Rx += forca.dados.x1 - forca.dados.x2;
        Ry += - forca.dados.y1 + forca.dados.y2;
        M += (forca.dados.x1 - forca.dados.x2)*(-forca.dados.y1) + (forca.dados.y2 - forca.dados.y1)*forca.dados.x1;
    }
    return [Rx, Ry, M];
}

function calcularFuncaoBarra(barra){
    let [Rx, Ry, Mr] = calcularResultantes(barra.dados.cargas1);

    if(barra.dados.x1 === barra.dados.x2){
        const sinal = (barra.dados.y1 > barra.dados.y2) ? 1 : -1;

        matriz3 = new MatrizSimbolica(3,3);
        matriz3.definir(0,0, 0); matriz3.definir(0,1, -1*sinal); matriz3.definir(0,2, 0);
        matriz3.definir(1,0, 1*sinal); matriz3.definir(1,1, 0); matriz3.definir(1,2, 0);
        matriz3.definir(2,0, sinal*barra.dados.x1); matriz3.definir(2,1, (sinal*(barra.dados.y1)).toString() + "+x"); matriz3.definir(2,2, 1);
        
        const solucao = matriz3.resolverCramer([-Rx, -Ry, -Mr]).solucoes;
        console.log(solucao);
        barra.dados.N = solucao[0];
        barra.dados.V = -solucao[1];
        barra.dados.M = solucao[2];

        return;
    }

    
    const tangente = (barra.dados.y1 -barra.dados.y2)/((barra.dados.x2 -barra.dados.x1))
    const cosAbsoluto = 1 / Math.sqrt(1 + Math.pow(tangente, 2));
    const cosseno = tangente >= 0 ? cosAbsoluto : -cosAbsoluto;
    const seno = tangente * cosseno;

    
    for(const apoio of barra.dados.apoios1){
        if(apoio.dados.tipo == "apoioFixo"){
            Rx += apoio.dados.fx;
            Ry += apoio.dados.fy;
            Mr += apoio.dados.fx*apoio.dados.y + apoio.dados.fy*apoio.dados.x;
        }
        else{
            Ry += apoio.dados.f;
            Mr += apoio.dados.f*apoio.dados.x;
        }
    }
    console.log(Rx, Ry, Mr);
    /* MATRIZ
        | a b c || N  |   | -Rx  |
        | d e f || -V |   | -Ry  |
        | g h i || M  |   | -Mr  |

    onde a=cos, b=-sen, c=0
         d=sen, e=cos,  f=0,
         g=k*cos; h=-sen*(k)+raiz(x1²+(y1-k)²)+x; i=1
        (sendo k=y1+tan*x1)

    */
    const x1 = barra.dados.x1;
    const y1 = barra.dados.y1;
    const k = y1 + (tangente*x1);
    const h = (-seno*k + Math.sqrt(x1*x1 + (y1-k)*(y1-k)));

    matriz3 = new MatrizSimbolica(3, 3);


    matriz3.definir(0,0, cosseno); matriz3.definir(0,1, -seno); matriz3.definir(0,2, 0);
    matriz3.definir(1,0, seno); matriz3.definir(1,1, cosseno); matriz3.definir(1,2, 0);
    matriz3.definir(2,0, k*cosseno); matriz3.definir(2,1, h.toString()+"+x"); matriz3.definir(2,2, 1);

    const solucao = matriz3.resolverCramer([-Rx, -Ry, -Mr]).solucoes;
    console.log(solucao);
    barra.dados.N = solucao[0];
    barra.dados.V = -solucao[1];
    barra.dados.M = solucao[2];
}