import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./server.js";

describe("POST /api/analisar", () => {
  it("retorna os tokens de um código válido", async () => {
    const response = await request(app)
      .post("/api/analisar")
      .send({ codigo: "int numero = 10;" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      sucesso: true,
      message: "Análise léxica concluída. Consulte os tokens identificados abaixo.",
      erros: []
    });
    expect(response.body.tokens).toEqual([
      { tipo: "PALAVRA_RESERVADA", lexema: "int", linha: 1, coluna: 1 },
      { tipo: "IDENTIFICADOR", lexema: "numero", linha: 1, coluna: 5 },
      { tipo: "OPERADOR", lexema: "=", linha: 1, coluna: 12 },
      { tipo: "LITERAL_INTEIRO", lexema: "10", linha: 1, coluna: 14 },
      { tipo: "DELIMITADOR", lexema: ";", linha: 1, coluna: 16 }
    ]);
  });

  it("retorna os tokens reconhecidos e erros léxicos quando a entrada é inválida", async () => {
    const response = await request(app)
      .post("/api/analisar")
      .send({ codigo: "int @numero = 10;" });

    expect(response.status).toBe(422);
    expect(response.body.sucesso).toBe(false);
    expect(response.body.tokens).toHaveLength(5);
    expect(response.body.erros).toEqual([
      expect.objectContaining({
        tipo: "ERRO_LEXICO",
        lexema: "@",
        linha: 1,
        coluna: 5
      })
    ]);
  });

  it("rejeita uma entrada vazia", async () => {
    const response = await request(app)
      .post("/api/analisar")
      .send({ codigo: "   " });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      sucesso: false,
      message: "Informe um código-fonte antes de solicitar a análise.",
      tokens: [],
      erros: []
    });
  });

  it("rejeita uma requisição sem o campo codigo", async () => {
    const response = await request(app).post("/api/analisar").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      sucesso: false,
      message: "Envie o campo obrigatório \"codigo\" em formato de texto.",
      tokens: [],
      erros: []
    });
  });

  it("mantém o endpoint da primeira etapa disponível", async () => {
    const response = await request(app).get("/api/hello");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello, World!" });
  });
});
