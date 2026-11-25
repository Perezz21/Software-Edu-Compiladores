import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./server.js";

describe("POST /api/analisar", () => {
  it("retorna tokens e AST para código sintaticamente válido", async () => {
    const response = await request(app).post("/api/analisar").send({
      codigo: "int numero = 10 + 5 * 2;"
    });
    expect(response.status).toBe(200);
    expect(response.body.sucesso).toBe(true);
    expect(response.body.erros).toEqual([]);
    expect(response.body.sintatico).toMatchObject({
      sucesso: true, executada: true, erros: [],
      ast: { tipo: "PROGRAMA", filhos: [{ tipo: "DECLARACAO_VARIAVEL" }] }
    });
  });

  it("retorna erro sintático localizado para código malformado", async () => {
    const response = await request(app).post("/api/analisar").send({ codigo: "int numero = 10" });
    expect(response.status).toBe(422);
    expect(response.body.sintatico).toMatchObject({
      sucesso: false, executada: true, ast: null,
      erros: [expect.objectContaining({ tipo: "ERRO_SINTATICO", esperado: [";"] })]
    });
  });

  it("não executa parser quando existem erros léxicos", async () => {
    const response = await request(app).post("/api/analisar").send({ codigo: "int @numero = 10;" });
    expect(response.status).toBe(422);
    expect(response.body.erros).toHaveLength(1);
    expect(response.body.sintatico).toEqual({
      sucesso: false, executada: false, ast: null, erros: []
    });
  });

  it("rejeita entrada vazia ou sem codigo", async () => {
    const vazio = await request(app).post("/api/analisar").send({ codigo: " " });
    const ausente = await request(app).post("/api/analisar").send({});
    expect(vazio.status).toBe(400);
    expect(ausente.status).toBe(400);
  });

  it("mantém endpoint de saúde disponível", async () => {
    const response = await request(app).get("/api/hello");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello, World!" });
  });
});
