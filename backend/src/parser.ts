import type { Token } from "./scanner.js";

export type NoAST = {
  tipo: string;
  linha: number;
  coluna: number;
  linhaFinal: number;
  colunaFinal: number;
  atributos: Record<string, string | number | boolean | null>;
  filhos: NoAST[];
};

export type ErroSintatico = {
  tipo: "ERRO_SINTATICO";
  linha: number;
  coluna: number;
  encontrado: string;
  esperado: string[];
  mensagem: string;
};

export type ResultadoSintatico = {
  sucesso: boolean;
  ast: NoAST | null;
  erros: ErroSintatico[];
};

class FalhaSintatica extends Error {
  constructor(public readonly diagnostico: ErroSintatico) {
    super(diagnostico.mensagem);
  }
}

class Parser {
  private atual = 0;

  constructor(private readonly tokens: Token[]) {}

  analisar(): NoAST {
    const primeiro = this.peek();
    const filhos: NoAST[] = [];
    while (!this.fim()) {
      const posicaoAnterior = this.atual;
      filhos.push(this.declaracaoOuComando());
      if (this.atual === posicaoAnterior) this.falhar(["declaração", "comando"]);
    }
    const ultimo = this.tokens[this.tokens.length - 1] ?? primeiro;
    return this.no("PROGRAMA", primeiro, ultimo, {}, filhos);
  }

  private declaracaoOuComando(): NoAST {
    return this.lexema("int") ? this.declaracao() : this.comando();
  }

  private declaracao(): NoAST {
    const inicio = this.consumir("int");
    const nome = this.consumirTipo("IDENTIFICADOR", "identificador após int");
    const filhos = this.corresponde("=") ? [this.expressao()] : [];
    const fim = this.consumir(";");
    return this.no("DECLARACAO_VARIAVEL", inicio, fim, { tipoDado: "int", nome: nome.lexema }, filhos);
  }

  private comando(): NoAST {
    if (this.lexema("{")) return this.bloco();
    if (this.lexema("if")) return this.condicional();
    if (this.lexema("while")) return this.repeticao();
    if (this.lexema("return")) return this.retorno();
    if (this.tipo("IDENTIFICADOR") && this.tokens[this.atual + 1]?.lexema === "=") return this.atribuicao();
    return this.falhar(["bloco", "if", "while", "return", "atribuição ou declaração"]);
  }

  private bloco(): NoAST {
    const inicio = this.consumir("{");
    const filhos: NoAST[] = [];
    while (!this.fim() && !this.lexema("}")) filhos.push(this.declaracaoOuComando());
    const fim = this.consumir("}");
    return this.no("BLOCO", inicio, fim, {}, filhos);
  }

  private condicional(): NoAST {
    const inicio = this.consumir("if");
    this.consumir("(");
    const condicao = this.expressao();
    this.consumir(")");
    const filhos = [condicao, this.comando()];
    if (this.corresponde("else")) filhos.push(this.comando());
    return this.no("CONDICIONAL", inicio, this.tokens[this.atual - 1] ?? inicio,
      { possuiSenao: filhos.length === 3 }, filhos);
  }

  private repeticao(): NoAST {
    const inicio = this.consumir("while");
    this.consumir("(");
    const condicao = this.expressao();
    this.consumir(")");
    const corpo = this.comando();
    return this.no("REPETICAO_WHILE", inicio, this.tokens[this.atual - 1] ?? inicio, {}, [condicao, corpo]);
  }

  private retorno(): NoAST {
    const inicio = this.consumir("return");
    const filhos = this.lexema(";") ? [] : [this.expressao()];
    const fim = this.consumir(";");
    return this.no("RETORNO", inicio, fim, {}, filhos);
  }

  private atribuicao(): NoAST {
    const nome = this.consumirTipo("IDENTIFICADOR", "identificador");
    this.consumir("=");
    const valor = this.expressao();
    const fim = this.consumir(";");
    return this.no("ATRIBUICAO", nome, fim, { nome: nome.lexema }, [valor]);
  }

  private expressao(): NoAST { return this.binaria(() => this.logicaE(), ["||"]); }
  private logicaE(): NoAST { return this.binaria(() => this.igualdade(), ["&&"]); }
  private igualdade(): NoAST { return this.binaria(() => this.relacional(), ["==", "!="]); }
  private relacional(): NoAST { return this.binaria(() => this.aditiva(), ["<", ">", "<=", ">="]); }
  private aditiva(): NoAST { return this.binaria(() => this.multiplicativa(), ["+", "-"]); }
  private multiplicativa(): NoAST { return this.binaria(() => this.unaria(), ["*", "/"]); }

  private unaria(): NoAST {
    if (this.corresponde("!") || this.corresponde("-")) {
      const operador = this.tokens[this.atual - 1];
      const operando = this.unaria();
      return this.no(operador.lexema === "!" ? "NEGACAO_LOGICA" : "NEGACAO_ARITMETICA",
        operador, this.tokens[this.atual - 1] ?? operador, { operador: operador.lexema }, [operando]);
    }
    return this.primaria();
  }

  private primaria(): NoAST {
    if (this.corresponde("(")) {
      const expressao = this.expressao();
      this.consumir(")");
      return expressao;
    }
    if (this.tipo("LITERAL_INTEIRO")) {
      const token = this.avancar();
      return this.no("LITERAL_INTEIRO", token, token, { valor: Number(token.lexema) }, []);
    }
    if (this.tipo("IDENTIFICADOR")) {
      const token = this.avancar();
      return this.no("IDENTIFICADOR", token, token, { nome: token.lexema }, []);
    }
    return this.falhar(["identificador", "literal inteiro ou parêntese"]);
  }

  private binaria(proxima: () => NoAST, operadores: string[]): NoAST {
    let esquerda = proxima();
    while (!this.fim() && operadores.includes(this.peek().lexema)) {
      const operador = this.avancar();
      const direita = proxima();
      const tipos: Record<string, string> = {
        "+": "ADICAO", "-": "SUBTRACAO", "*": "MULTIPLICACAO", "/": "DIVISAO",
        "&&": "OPERACAO_LOGICA", "||": "OPERACAO_LOGICA",
        "==": "COMPARACAO", "!=": "COMPARACAO", "<": "COMPARACAO",
        ">": "COMPARACAO", "<=": "COMPARACAO", ">=": "COMPARACAO"
      };
      esquerda = this.no(tipos[operador.lexema], esquerda, direita,
        { operador: operador.lexema }, [esquerda, direita]);
    }
    return esquerda;
  }

  private no(tipo: string, inicio: Token | NoAST, fim: Token | NoAST,
    atributos: Record<string, string | number | boolean | null>, filhos: NoAST[]): NoAST {
    const linhaInicial = inicio.linha;
    const colunaInicial = inicio.coluna;
    const linhaFinal = "linhaFinal" in fim ? fim.linhaFinal : fim.linha;
    const colunaFinal = "colunaFinal" in fim ? fim.colunaFinal : fim.coluna + fim.lexema.length - 1;
    return { tipo, linha: linhaInicial, coluna: colunaInicial, linhaFinal, colunaFinal, atributos, filhos };
  }

  private consumir(lexema: string): Token {
    if (this.lexema(lexema)) return this.avancar();
    return this.falhar([lexema]);
  }

  private consumirTipo(tipo: string, descricao: string): Token {
    if (this.tipo(tipo)) return this.avancar();
    return this.falhar([descricao]);
  }

  private corresponde(lexema: string): boolean {
    if (!this.lexema(lexema)) return false;
    this.avancar();
    return true;
  }

  private lexema(lexema: string): boolean { return !this.fim() && this.peek().lexema === lexema; }
  private tipo(tipo: string): boolean { return !this.fim() && this.peek().tipo === tipo; }

  private peek(): Token {
    return this.tokens[this.atual] ?? {
      tipo: "DELIMITADOR", lexema: "fim do código",
      linha: this.tokens[this.tokens.length - 1]?.linha ?? 1,
      coluna: (this.tokens[this.tokens.length - 1]?.coluna ?? 0) +
        (this.tokens[this.tokens.length - 1]?.lexema.length ?? 0)
    };
  }

  private avancar(): Token {
    const token = this.peek();
    if (!this.fim()) this.atual += 1;
    return token;
  }

  private fim(): boolean { return this.atual >= this.tokens.length; }

  private falhar(esperado: string[]): never {
    const token = this.peek();
    const encontrado = this.fim() ? "fim do código" : "'" + token.lexema + "'";
    const mensagem = "Erro sintático na linha " + token.linha + ", coluna " + token.coluna +
      ": era esperado " + esperado.join(" ou ") + ", mas foi encontrado " + encontrado + ".";
    throw new FalhaSintatica({
      tipo: "ERRO_SINTATICO", linha: token.linha, coluna: token.coluna,
      encontrado, esperado, mensagem
    });
  }
}

export function analisarSintaticamente(tokens: Token[]): ResultadoSintatico {
  try {
    return { sucesso: true, ast: new Parser(tokens).analisar(), erros: [] };
  } catch (erro) {
    if (erro instanceof FalhaSintatica) return { sucesso: false, ast: null, erros: [erro.diagnostico] };
    throw erro;
  }
}
