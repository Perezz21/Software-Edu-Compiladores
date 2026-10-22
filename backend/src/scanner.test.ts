import { describe, expect, it } from "vitest";
import { analisarLexicamente } from "./scanner.js";

describe("analisarLexicamente", () => {
  it("reconhece palavras reservadas, identificadores, inteiros, operadores e delimitadores", () => {
    const resultado = analisarLexicamente("int numero = 10;");

    expect(resultado.erros).toEqual([]);
    expect(resultado.tokens).toEqual([
      { tipo: "PALAVRA_RESERVADA", lexema: "int", linha: 1, coluna: 1 },
      { tipo: "IDENTIFICADOR", lexema: "numero", linha: 1, coluna: 5 },
      { tipo: "OPERADOR", lexema: "=", linha: 1, coluna: 12 },
      { tipo: "LITERAL_INTEIRO", lexema: "10", linha: 1, coluna: 14 },
      { tipo: "DELIMITADOR", lexema: ";", linha: 1, coluna: 16 }
    ]);
  });

  it("ignora comentários e espaços em branco", () => {
    const resultado = analisarLexicamente("// valor inicial\nint total = 2; /* comentário */");

    expect(resultado.erros).toEqual([]);
    expect(resultado.tokens.map((token) => token.lexema)).toEqual(["int", "total", "=", "2", ";"]);
    expect(resultado.tokens[0]).toMatchObject({ linha: 2, coluna: 1 });
  });

  it("reconhece operadores compostos e delimitadores", () => {
    const resultado = analisarLexicamente("if (total >= 10 && total != 12) { return; }");

    expect(resultado.erros).toEqual([]);
    expect(resultado.tokens.map((token) => token.lexema)).toEqual([
      "if", "(", "total", ">=", "10", "&&", "total", "!=", "12", ")", "{", "return", ";", "}"
    ]);
  });

  it("registra caracteres inválidos e continua a análise", () => {
    const resultado = analisarLexicamente("int @valor = 1;");

    expect(resultado.tokens.map((token) => token.lexema)).toEqual(["int", "valor", "=", "1", ";"]);
    expect(resultado.erros).toEqual([
      {
        tipo: "ERRO_LEXICO",
        lexema: "@",
        linha: 1,
        coluna: 5,
        mensagem: "Caractere não reconhecido: '@'. Verifique se ele faz parte do subconjunto de C suportado."
      }
    ]);
  });

  it("identifica comentário de bloco não fechado", () => {
    const resultado = analisarLexicamente("int numero; /* sem fechamento");

    expect(resultado.tokens.map((token) => token.lexema)).toEqual(["int", "numero", ";"]);
    expect(resultado.erros[0]).toMatchObject({
      lexema: "/*",
      linha: 1,
      coluna: 13,
      mensagem: expect.stringContaining("não foi fechado")
    });
  });

  it("identifica literal inteiro malformado", () => {
    const resultado = analisarLexicamente("int valor = 12abc;");

    expect(resultado.erros[0]).toMatchObject({
      lexema: "12abc",
      linha: 1,
      coluna: 13,
      mensagem: expect.stringContaining("Literal inteiro inválido")
    });
  });
});
