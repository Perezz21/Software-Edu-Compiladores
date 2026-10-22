import cors from "cors";
import express from "express";
import { analisarLexicamente } from "./scanner.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/hello", (_request, response) => {
  response.json({ message: "Hello, World!" });
});

app.post("/api/analisar", (request, response) => {
  const { codigo } = request.body ?? {};

  if (typeof codigo !== "string") {
    return response.status(400).json({
      sucesso: false,
      message: "Envie o campo obrigatório \"codigo\" em formato de texto.",
      tokens: [],
      erros: []
    });
  }

  if (codigo.trim().length === 0) {
    return response.status(400).json({
      sucesso: false,
      message: "Informe um código-fonte antes de solicitar a análise.",
      tokens: [],
      erros: []
    });
  }

  const resultado = analisarLexicamente(codigo);
  const sucesso = resultado.erros.length === 0;

  return response.status(sucesso ? 200 : 422).json({
    sucesso,
    message: sucesso
      ? "Análise léxica concluída. Consulte os tokens identificados abaixo."
      : "A análise encontrou erros léxicos. Corrija-os e tente novamente.",
    tokens: resultado.tokens,
    erros: resultado.erros
  });
});

export function startServer(port = 3000) {
  return app.listen(port, "0.0.0.0", () => {
    console.log(`Backend disponível em http://localhost:${port}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}
