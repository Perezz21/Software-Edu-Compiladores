import cors from "cors";
import express from "express";
import { analisarLexicamente } from "./scanner.js";
import { analisarSintaticamente } from "./parser.js";

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
      message: 'Envie o campo obrigatório "codigo" em formato de texto.',
      tokens: [], erros: [], lexico: null, sintatico: null
    });
  }
  if (codigo.trim().length === 0) {
    return response.status(400).json({
      sucesso: false,
      message: "Informe um código-fonte antes de solicitar a análise.",
      tokens: [], erros: [], lexico: null, sintatico: null
    });
  }

  const lexico = analisarLexicamente(codigo);
  const possuiErrosLexicos = lexico.erros.length > 0;
  const sintatico = possuiErrosLexicos
    ? { sucesso: false, executada: false, ast: null, erros: [] }
    : { ...analisarSintaticamente(lexico.tokens), executada: true };

  const sucesso = !possuiErrosLexicos && sintatico.sucesso;
  const message = possuiErrosLexicos
    ? "A análise encontrou erros léxicos. A análise sintática não foi executada."
    : sintatico.sucesso
      ? "Análises léxica e sintática concluídas. Consulte os tokens e a AST."
      : "A análise encontrou erros sintáticos. Consulte os diagnósticos abaixo.";

  return response.status(sucesso ? 200 : 422).json({
    sucesso, message,
    tokens: lexico.tokens,
    erros: lexico.erros,
    lexico: { sucesso: !possuiErrosLexicos, tokens: lexico.tokens, erros: lexico.erros },
    sintatico
  });
});

export function startServer(port = 3000) {
  return app.listen(port, "0.0.0.0", () => {
    console.log("Backend disponível em http://localhost:" + port);
  });
}

if (process.env.NODE_ENV !== "test") startServer();
