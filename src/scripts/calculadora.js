function calcularTudo(sistemaNovo){
    console.log("A estrutura mudou! Recalculando reações...");
    try{
        if(ciclico) throw new Error("Sistemas cíclicos não podem ser resolvidos.");
        calcularReacoes(sistemaNovo);//Dados novos será autualizado.
        //apoios simples: vão ganhar o atributo f:
        //apoios fixos: vão ganhar o atributo fx e fy

        console.log("APOIOS FIXOS:\n", sistemaNovo.apoiosFixos);
        console.log("APOIOS SIMPLES:\n", sistemaNovo.apoiosSimples);
        //implementar a impressao com o acima
        let mensagem = `<div class="relatorio-estrutural container my-4">`;
        mensagem += `<h3 class="mb-3 text-primary" >Reações de Apoio</h3><ul class="list-group mb-4">`;
        for(const apoio of sistemaNovo.apoiosFixos){
            const { x, y, fx, fy } = apoio.dados; 
                mensagem += `
                    <li class="list-group-item">
                        <strong>Apoio Fixo em (${x}, ${y}) :</strong> 
                        F<sub>x</sub> = ${fx.toPrecision(3)} | F<sub>y</sub> = ${fy.toPrecision(3)}
                    </li>`;
        }
        for(const apoio of sistemaNovo.apoiosSimples){
        const { x, y, f } = apoio.dados;
        mensagem += `
            <li class="list-group-item">
                <strong>Apoio Simples em (${x}, ${y}) :</strong> 
                F = ${f.toPrecision(3)}
            </li>`;
        }
        mensagem += `</ul>`;

        const container = document.getElementById("resultado");
        
        //console.log(mensagem);
        
        mensagem += `<h3 class="mb-3 text-primary mt-4"  >Esforços Internos das Barras</h3>`

        //calculando as barras
        let barrasCopiadas = [...sistemaNovo.barras];
        for(const barra of sistemaNovo.barras){
            const barrasId = barrasCopiadas.filter(b => b.dados.id == barra.dados.id);
            if(barrasId.length == 0) continue;
            barrasId.sort((a, b) => a.dados.x1 - b.dados.x1);
            for(const bID of barrasId){
                calcularFuncaoBarra(bID, barrasId[0].dados.x1, -barrasId[0].dados.y1);
            }
            barrasCopiadas = barrasCopiadas.filter(b => b.dados.id != barra.dados.id);
        }

        barrasCopiadas = [...sistemaNovo.barras];
        for(const barra of barrasCopiadas){
            const barrasComMesmoId = barrasCopiadas.filter(b => b.dados.id == barra.dados.id);
            if(barrasComMesmoId.length == 0) continue;
            barrasComMesmoId.sort((a, b) => a.dados.x1 - b.dados.x1);

            mensagem += `
            <div class="mb-3 table-responsive">
                <h5 class="h5 text-secondary mb-3"> Barra: (${  barrasComMesmoId[0].dados.x1.toPrecision(2) }, ${ barrasComMesmoId[0].dados.y1.toPrecision(2) }) até (${barrasComMesmoId[barrasComMesmoId.length-1].dados.x2.toPrecision(2)}, ${barrasComMesmoId[barrasComMesmoId.length-1].dados.y2.toPrecision(2)})</h5>
                <table class= "table table-bordered table-striped table-hover text-center align-middle mb-0">
                    <thead class="table-primary">
                        <tr>
                            <th>Intervalo (z)</th>
                            <th>Normal (N)</th>
                            <th>Cortante (V)</th>
                            <th>Momento (M)</th>
                        </tr>
                    </thead>
                    <tbody>`;

            let x0 = barrasComMesmoId[0].dados.x1;
            let y0 = barrasComMesmoId[0].dados.y1;
            
            const zs = [0];
            for(const barraId of barrasComMesmoId){
                zs.push(Math.sqrt((barraId.dados.x2-x0)*(barraId.dados.x2-x0)+(barraId.dados.y2-y0)*(barraId.dados.y2-y0)).toFixed(3)); 
            } console.log(zs);
            for(let i = 0; i<barrasComMesmoId.length; i++){
                console.log(barrasComMesmoId)

                mensagem += `
                <tr>
                    <td>[${zs[i]} , ${zs[i+1]}]</td>
                    <td>${formatMath(barrasComMesmoId[i].dados.N)}</td>
                    <td>${formatMath(barrasComMesmoId[i].dados.V)}</td>
                    <td>${formatMath(barrasComMesmoId[i].dados.M)}</td>
                </tr>`;
            }
            mensagem += `</tbody></table></div><br>`;
            barrasCopiadas = barrasCopiadas.filter(b => b.dados.id !== barra.dados.id);
        }
        mensagem += `</div>`;
        //console.log(mensagem);
        container.innerHTML = mensagem;

    }catch(erro){
        const containerErro = document.getElementById("resultado");
        containerErro.innerHTML = "<h1>"+erro.message+"</h1>";
    }
    return;
}


// formata a string com números da biblioteca Math.js para arredondamentos
function formatMath(text) {
    try {
        text = String(text);
        const regexNumerique = /\b\d+(\.\d+)?\b/g;
    
        const texteFormate = text.replace(regexNumerique, (correspondance) => {
           
            return (parseFloat(correspondance)).toPrecision(3).toString();
        });
        
        console.log(texteFormate);
        return texteFormate;
    
    } catch (error) {
        console.log(error.message, text)
    }


}

function calcularReacoes(sistema){
    const variaveis = sistema.apoiosSimples.length + (2*sistema.apoiosFixos.length);
    let solucao;
    if(variaveis == 0) return;
    
    if(variaveis>3){
        notificacao("Sistema hiperistático")
        throw new Error("Sistema hiperistático");
    }
    const [Rx, Ry, M] = calcularResultantes(sistema.cargas);
    //3 equações, 2 incóginitas. Tem que bater a ultima linha 
    if(variaveis<3){
        if(sistema.apoiosFixos.length==1){
            const fx = -Rx;
            const fy = -Ry;
            console.log(fx, fy, M);
            if(-fx*sistema.apoiosFixos[0].dados.y+fy*sistema.apoiosFixos[0].dados.x == -M){
                sistema.apoiosFixos[0].dados.fx = fx;
                sistema.apoiosFixos[0].dados.fy = fy;
                return;
            }
            else{
                notificacao("Sistema hipostático")
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
                notificacao("Sistema hipostático")
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
                notificacao("Sistema hipostático")
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
        M += (forca.dados.x1 - forca.dados.x2)*(forca.dados.y1) + (forca.dados.y2 - forca.dados.y1)*forca.dados.x1;
    }
    return [Rx, Ry, M];
}

function calcularFuncaoBarra(barra, x1, y1){
    let [Rx, Ry, Mr] = [0,0,0];

    for(const forca of barra.dados.cargas1){
        Rx += forca.dados.x1 - forca.dados.x2;
        Ry += - forca.dados.y1 + forca.dados.y2;
        Mr += (forca.dados.x1 - forca.dados.x2)*(forca.dados.y1+y1) + (forca.dados.y2 - forca.dados.y1)*(forca.dados.x1-x1);
    }

    for(const apoio of barra.dados.apoios1){
        if(apoio.dados.tipo == "apoioFixo"){
            Rx += apoio.dados.fx;
            Ry += apoio.dados.fy;
            Mr += apoio.dados.fx*(apoio.dados.y+y1) + apoio.dados.fy*(apoio.dados.x-x1);
        }
        else{
            Ry += apoio.dados.f;
            Mr += apoio.dados.f*(apoio.dados.x-x1);
        }
    }

    if(barra.dados.x1 === barra.dados.x2){
        const sinal = (barra.dados.y1 > barra.dados.y2) ? 1 : -1;

        matriz3 = new MatrizSimbolica(3,3);
        matriz3.definir(0,0, 0); matriz3.definir(0,1, -1*sinal); matriz3.definir(0,2, 0);
        matriz3.definir(1,0, 1*sinal); matriz3.definir(1,1, 0); matriz3.definir(1,2, 0);
        matriz3.definir(2,0, 0); matriz3.definir(2,1, "z"); matriz3.definir(2,2, 1);
        
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

    console.log(Rx, Ry, Mr);
    /* MATRIZ
        | a b c || N  |   | -Rx  |
        | d e f || -V |   | -Ry  |
        | g h i || M  |   | -Mr  |

    onde a=cos, b=-sen, c=0
         d=sen, e=cos,  f=0,
         g=0, h="z", i=1
    */

    matriz3 = new MatrizSimbolica(3, 3);


    matriz3.definir(0,0, cosseno); matriz3.definir(0,1, -seno); matriz3.definir(0,2, 0);
    matriz3.definir(1,0, seno); matriz3.definir(1,1, cosseno); matriz3.definir(1,2, 0);
    matriz3.definir(2,0, 0); matriz3.definir(2,1, "z"); matriz3.definir(2,2, 1);

    const solucao = matriz3.resolverCramer([-Rx, -Ry, -Mr]).solucoes;
    console.log(solucao);
    barra.dados.N = solucao[0];
    barra.dados.V = (-solucao[1]).toString();
    barra.dados.M = solucao[2];
}