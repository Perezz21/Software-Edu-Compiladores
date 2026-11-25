import { describe, expect, it } from "vitest";
import { analisarLexicamente } from "./scanner.js";
import { analisarSintaticamente } from "./parser.js";

function analisar(codigo: string) {
  const lexico = analisarLexicamente(codigo);
  expect(lexico.erros).toEqual([]);
  return analisarSintaticamente(lexico.tokens);
}

describe("analisarSintaticamente", () => {
  it("constrói AST e respeita precedência da multiplicação", () => {
    const resultado = analisar("int resultado = 10 + 5 * 2;");
    expect(resultado.sucesso).toBe(true);
    expect(resultado.ast?.filhos[0]).toMatchObject({
      tipo: "DECLARACAO_VARIAVEL",
      atributos: { tipoDado: "int", nome: "resultado" },
      filhos: [{ tipo: "ADICAO", filhos: [{ tipo: "LITERAL_INTEIRO" }, { tipo: "MULTIPLICACAO" }] }]
    });
  });

  it("preserva associatividade à esquerda", () => {
    const resultado = analisar("int x = 20 - 5 - 3;");
    expect(resultado.ast?.filhos[0].filhos[0]).toMatchObject({
      tipo: "SUBTRACAO", filhos: [{ tipo: "SUBTRACAO" }, { tipo: "LITERAL_INTEIRO" }]
    });
  });

  it("analisa atribuição, bloco, if/else, while e return", () => {
    const resultado = analisar("int x = 1; if (x < 3) { x = x + 1; } else { while (x > 0) return; }");
    expect(resultado.sucesso).toBe(true);
    expect(resultado.ast?.filhos.map((no) => no.tipo)).toEqual(["DECLARACAO_VARIAVEL", "CONDICIONAL"]);
  });

  it("localiza ponto e vírgula ausente", () => {
    const resultado = analisar("int x = 10");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.ast).toBeNull();
    expect(resultado.erros[0]).toMatchObject({ tipo: "ERRO_SINTATICO", linha: 1, coluna: 11, esperado: [";"] });
  });

  it("detecta parêntese de condição ausente", () => {
    const resultado = analisar("if (x > 0 { return; }");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erros[0].esperado).toEqual([")"]);
  });

  it("aceita entrada sem tokens", () => {
    expect(analisarSintaticamente([])).toMatchObject({
      sucesso: true, ast: { tipo: "PROGRAMA", filhos: [] }, erros: []
    });
  });

  it("registra posições dos nós", () => {
    const resultado = analisar("int x = 4;");
    expect(resultado.ast?.filhos[0]).toMatchObject({ linha: 1, coluna: 1, linhaFinal: 1, colunaFinal: 10 });
  });

  it("reconhece operador unário e mantém a precedência multiplicativa", () => {
    const resultado = analisar("int x = -3 + 2 * 4;");
    expect(resultado.sucesso).toBe(true);
    expect(resultado.ast?.filhos[0].filhos[0]).toMatchObject({
      tipo: "ADICAO",
      filhos: [
        { tipo: "NEGACAO_ARITMETICA" },
        { tipo: "MULTIPLICACAO" }
      ]
    });
  });

  it("associa else ao if mais próximo e aceita bloco vazio", () => {
    const resultado = analisar("if (x > 0) { if (x > 1) return; else return 0; } else {}");
    expect(resultado.sucesso).toBe(true);
    const condicionalExterno = resultado.ast?.filhos[0];
    expect(condicionalExterno).toMatchObject({ tipo: "CONDICIONAL", atributos: { possuiSenao: true } });
    expect(condicionalExterno?.filhos[1].filhos[0]).toMatchObject({
      tipo: "CONDICIONAL",
      atributos: { possuiSenao: true }
    });
    expect(condicionalExterno?.filhos[2]).toMatchObject({ tipo: "BLOCO", filhos: [] });
  });

  it("informa chave de fechamento ausente", () => {
    const resultado = analisar("while (x > 0) { x = x - 1;");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erros[0].esperado).toEqual(["}"]);
  });

  it("localiza token inesperado depois de um comando completo", () => {
    const resultado = analisar("int x = 1; else");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erros[0].encontrado).toBe("'else'");
  });
});
