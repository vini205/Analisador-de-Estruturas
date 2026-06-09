    window.addEventListener('estruturaAlterada', (e) => {
    const dadosNovos = e.detail;
    console.log("A estrutura mudou! Recalculando reações...");
    c=calcular(dadosNovos);
    console.log(c);
    return c;
});

function calcular(sistema){
    const variaveis = sistema.apoiosSimples.length + (2*sistema.apoiosFixos.length);

    if(variaveis>3){
        throw new Error("Sistema hiperistático");
    }
    const [Rx, Ry, M] = calcularResultantes(sistema.cargas);
    if(variaveis<3){
        if(sistema.apoiosFixos.length==1){
            //3 equações, 2 incóginitas. Tem que bater a ultima linha 
            const fx = -Rx;
            const fy = -Ry;
            if(fx*sistema.apoiosFixos[0].y+fy*sistema.apoiosFixos[0].x == -M){
                return([fx, fy]);
            }
            else{
                throw new Error("Sistema hipostático");
            }
        }
        else if(variaveis==2){
            /* MATRIZ
                | a b || f1 | = | -Ry  |
                | c d || f2 |   | -M   |
             */
            matriz2 = new MatrizSimbolica(2, 2);
            matriz2.definir(0,0, 1); matriz2.definir(0,0, 1);
            matriz2.definir(1,0, sistema.apoiosSimples[0].x); matriz2.definir(1,1, sistema.apoiosSimples[1].x);
            
            return matriz2.resolverCramer([-Ry, -M]).solucoes.map(Number);
        }
        else{//3 equacoes 1 incognita. Tem que ser a mesma equacao
            const f = -Ry;
            if(f*sistema.apoiosSimples[0].x  == -M){
                return([f]);
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
            //f1 e f2 pertecem a esse apoio, sendo f1 em x e f2 em y
            matriz3.definir(0,0, 1); matriz3.definir(0,1, 0); matriz3.definir(0,2, 0);
            matriz3.definir(1,0, 0); matriz3.definir(1,1, 1); matriz3.definir(1,2, 1);
            matriz3.definir(2,0, sistema.apoiosFixos[0].y); matriz3.definir(2,1, sistema.apoiosFixos[0].x); matriz3.definir(2,2, sistema.apoiosSimples[0].x);   

            return matriz3.resolverCramer([-Rx, -Ry, -M]).solucoes.map(Number);
        }
        else{
            //f1, f2, f3 são verticais. Vai dar erro. (Det = 0)
            matriz3.definir(0,0, 0); matriz3.definir(0,1, 0); matriz3.definir(0,2, 0);
            matriz3.definir(1,0, 1); matriz3.definir(1,1, 1); matriz3.definir(1,2, 1);
            matriz3.definir(2,0, sistema.apoiosSimples[0].x); matriz3.definir(2,1, sistema.apoiosSimples[1].x); matriz3.definir(2,2, sistema.apoiosSimples[2].x);   

            return matriz3.resolverCramer([-Rx, -Ry, -M]).solucoes.map(Number);
        }
    }
}

function calcularResultantes(forcas){
    let [Rx, Ry, M]=[0,0,0];
    for(const forca of forcas){
        Rx += forca.x1 - forca.x2;
        Ry += - forca.y1 + forca.y2;
        M += (forca.x1 - forca.x2)*(-forca.y1) + (forca.y2 - forca.y1)*forca.x1;
    }
    return [Rx, Ry, M];
}