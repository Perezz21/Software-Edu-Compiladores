import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./server.js";

describe("POST /api/analisar", () => {
  it("confirma o recebimento de um código-fonte", async () => {
    const response = await request(app)
      .post("/api/analisar")
      .send({ codigo: "int numero = 10;" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      received: true,
      codeLength: 16
    });
  });

  it("rejeita uma entrada vazia", async () => {
    const response = await request(app)
      .post("/api/analisar")
      .send({ codigo: "   " });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Informe um código-fonte antes de solicitar a análise.",
      received: false
    });
  });

  it("rejeita uma requisição sem o campo codigo", async () => {
    const response = await request(app).post("/api/analisar").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Envie o campo obrigatório \"codigo\" em formato de texto.",
      received: false
    });
  });

  it("mantém o endpoint da primeira etapa disponível", async () => {
    const response = await request(app).get("/api/hello");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello, World!" });
  });
});
