class MatrizSimbolica {
  constructor(linhas, colunas) {
    this.linhas = linhas;
    this.colunas = colunas;
    // Inicializa a matriz com strings (expressões algébricas vazias começam em "0")
    this.dados = Array.from({ length: linhas }, () => Array(colunas).fill("0"));
  }

  definir(linha, coluna, expressao) {
    this.dados[linha][coluna] = expressao.toString();
  }

  obter(linha, coluna) {
    return this.dados[linha][coluna];
  }

  // Calcula o determinante simbólico usando a expansão de Laplace
  calcularDeterminante() {
    if (this.linhas !== this.colunas) {
      throw new Error("A matriz precisa ser quadrada.");
    }
    return this._detRecursivo(this.dados);
  }

  _detRecursivo(matrizDados) {
    const n = matrizDados.length;
    if (n === 1) return matrizDados[0][0];

    if (n === 2) {
      // (a * d) - (b * c) de forma simbólica
      const termo1 = `(${matrizDados[0][0]}) * (${matrizDados[1][1]})`;
      const termo2 = `(${matrizDados[0][1]}) * (${matrizDados[1][0]})`;
      return math.simplify(`${termo1} - ${termo2}`).toString();
    }

    let detExpressao = "0";

    for (let j = 0; j < n; j++) {
      const submatriz = matrizDados.slice(1).map(linha =>
        linha.filter((_, colIndex) => colIndex !== j)
      );

      const sinal = (j % 2 === 0) ? "+1" : "-1";
      const elemento = matrizDados[0][j];
      
      // Chamada recursiva para a submatriz
      const subDet = this._detRecursivo(submatriz);

      // Concatena a expressão algébrica
      detExpressao += ` + (${sinal}) * (${elemento}) * (${subDet})`;
    }

    
    // Retorna a expressão completamente simplificada pelo mathjs
    return math.rationalize(detExpressao).toString();
  }

  /**
   * Resolve o sistema linear usando a Regra de Cramer.
   * @param {Array<string>} vetorTermosIndependentes - O vetor coluna dos resultados B.
   * @returns {Object} Um objeto contendo as expressões finais de cada incógnita do sistema.
   */
  resolverCramer(vetorTermosIndependentes) {
    if (vetorTermosIndependentes.length !== this.linhas) {
      throw new Error("O tamanho do vetor de resultados deve ser igual ao número de linhas.");
    }

    // 1. Calcula o determinante principal (D)
    const D = this.calcularDeterminante();
    if (D === "0") {
      throw new Error("O determinante principal é zero. O sistema é impossível ou indeterminado.");
    }

    const resultados = [];

    // 2. Calcula Dx, Dy, Dz... substituindo cada coluna pelo vetor B
    for (let j = 0; j < this.colunas; j++) {
      // Clona os dados da matriz original
      const dadosSubstituidos = this.dados.map(linha => [...linha]);

      // Substitui a coluna j pelos termos independentes
      for (let i = 0; i < this.linhas; i++) {
        dadosSubstituidos[i][j] = vetorTermosIndependentes[i].toString();
      }

      // Calcula o determinante da matriz modificada (Dj)
      const Dj = this._detRecursivo(dadosSubstituidos);

      // A incógnita final j é dada por Dj / D
      const expressaoFinal = math.rationalize(`(${Dj}) / (${D})`).toString({lowerExp: -Infinity,upperExp: Infinity});
      
      resultados[j] = expressaoFinal;
    }

    return {
      determinanteGeral: D,
      solucoes: resultados
    };
  }
}