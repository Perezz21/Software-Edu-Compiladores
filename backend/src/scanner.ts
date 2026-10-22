export type TipoToken =
  | "PALAVRA_RESERVADA"
  | "IDENTIFICADOR"
  | "LITERAL_INTEIRO"
  | "OPERADOR"
  | "DELIMITADOR";

export type Token = {
  tipo: TipoToken;
  lexema: string;
  linha: number;
  coluna: number;
};

export type ErroLexico = {
  tipo: "ERRO_LEXICO";
  lexema: string;
  linha: number;
  coluna: number;
  mensagem: string;
};

export type ResultadoLexico = {
  tokens: Token[];
  erros: ErroLexico[];
};

const palavrasReservadas = new Set(["int", "if", "else", "while", "return"]);
const operadoresDuplos = new Set(["==", "!=", "<=", ">=", "&&", "||"]);
const operadoresSimples = new Set(["+", "-", "*", "/", "=", ">", "<", "!"]);
const delimitadores = new Set(["(", ")", "{", "}", "[", "]", ";", ","]);

const letraOuSublinhado = (caractere: string) => /[A-Za-z_]/.test(caractere);
const letraDigitoOuSublinhado = (caractere: string) => /[A-Za-z0-9_]/.test(caractere);
const digito = (caractere: string) => /[0-9]/.test(caractere);

export function analisarLexicamente(codigo: string): ResultadoLexico {
  const tokens: Token[] = [];
  const erros: ErroLexico[] = [];
  let indice = 0;
  let linha = 1;
  let coluna = 1;

  const atual = () => codigo[indice] ?? "";
  const proximo = () => codigo[indice + 1] ?? "";

  function avancar() {
    const caractere = atual();
    indice += 1;

    if (caractere === "\n") {
      linha += 1;
      coluna = 1;
      return;
    }

    coluna += 1;
  }

  function adicionarToken(tipo: TipoToken, inicio: number, linhaInicial: number, colunaInicial: number) {
    tokens.push({
      tipo,
      lexema: codigo.slice(inicio, indice),
      linha: linhaInicial,
      coluna: colunaInicial
    });
  }

  function adicionarErro(
    lexema: string,
    linhaInicial: number,
    colunaInicial: number,
    mensagem: string
  ) {
    erros.push({
      tipo: "ERRO_LEXICO",
      lexema,
      linha: linhaInicial,
      coluna: colunaInicial,
      mensagem
    });
  }

  while (indice < codigo.length) {
    const caractere = atual();

    if (/\s/.test(caractere)) {
      avancar();
      continue;
    }

    const linhaInicial = linha;
    const colunaInicial = coluna;
    const inicio = indice;

    if (caractere === "/" && proximo() === "/") {
      avancar();
      avancar();

      while (indice < codigo.length && atual() !== "\n") {
        avancar();
      }

      continue;
    }

    if (caractere === "/" && proximo() === "*") {
      avancar();
      avancar();

      while (indice < codigo.length && !(atual() === "*" && proximo() === "/")) {
        avancar();
      }

      if (indice >= codigo.length) {
        adicionarErro(
          "/*",
          linhaInicial,
          colunaInicial,
          "Comentário de bloco não foi fechado. Adicione */ para encerrá-lo."
        );
      } else {
        avancar();
        avancar();
      }

      continue;
    }

    if (letraOuSublinhado(caractere)) {
      avancar();

      while (letraDigitoOuSublinhado(atual())) {
        avancar();
      }

      const lexema = codigo.slice(inicio, indice);
      adicionarToken(
        palavrasReservadas.has(lexema) ? "PALAVRA_RESERVADA" : "IDENTIFICADOR",
        inicio,
        linhaInicial,
        colunaInicial
      );
      continue;
    }

    if (digito(caractere)) {
      avancar();

      while (digito(atual())) {
        avancar();
      }

      if (letraOuSublinhado(atual())) {
        while (letraDigitoOuSublinhado(atual())) {
          avancar();
        }

        adicionarErro(
          codigo.slice(inicio, indice),
          linhaInicial,
          colunaInicial,
          "Literal inteiro inválido. Um número não pode ser seguido diretamente por letras ou _."
        );
      } else {
        adicionarToken("LITERAL_INTEIRO", inicio, linhaInicial, colunaInicial);
      }

      continue;
    }

    const operadorDuplo = caractere + proximo();

    if (operadoresDuplos.has(operadorDuplo)) {
      avancar();
      avancar();
      adicionarToken("OPERADOR", inicio, linhaInicial, colunaInicial);
      continue;
    }

    if (operadoresSimples.has(caractere)) {
      avancar();
      adicionarToken("OPERADOR", inicio, linhaInicial, colunaInicial);
      continue;
    }

    if (delimitadores.has(caractere)) {
      avancar();
      adicionarToken("DELIMITADOR", inicio, linhaInicial, colunaInicial);
      continue;
    }

    avancar();
    adicionarErro(
      caractere,
      linhaInicial,
      colunaInicial,
      `Caractere não reconhecido: '${caractere}'. Verifique se ele faz parte do subconjunto de C suportado.`
    );
  }

  return { tokens, erros };
}
