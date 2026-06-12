function calcularTudo(sistemaNovo){
    console.log("A estrutura mudou! Recalculando reações...");
    try{
        calcularReacoes(sistemaNovo);//Dados novos será autualizado.
        //apoios simples: vão ganhar o atributo f:
        //apoios fixos: vão ganhar o atributo fx e fy
        console.log("APOIOS FIXOS:\n", sistemaNovo.apoiosFixos);
        console.log("APOIOS SIMPLES:\n", sistemaNovo.apoiosSimples);
        //implementar a impressao com o acima

        //verificando os nos:

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
            matriz2.definir(0,0, 1); matriz2.definir(0,0, 1);
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

function calcularResultantes(forcas){
    let [Rx, Ry, M]=[0,0,0];
    for(const forca of forcas){
        Rx += forca.dados.x1 - forca.dados.x2;
        Ry += - forca.dados.y1 + forca.dados.y2;
        M += (forca.dados.x1 - forca.dados.x2)*(-forca.dados.y1) + (forca.dados.y2 - forca.dados.y1)*forca.dados.x1;
    }
    return [Rx, Ry, M];
}