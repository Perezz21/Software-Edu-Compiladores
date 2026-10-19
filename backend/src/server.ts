import cors from "cors";
import express from "express";

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
      message: "Envie o campo obrigatório \"codigo\" em formato de texto.",
      received: false
    });
  }

  if (codigo.trim().length === 0) {
    return response.status(400).json({
      message: "Informe um código-fonte antes de solicitar a análise.",
      received: false
    });
  }

  return response.status(200).json({
    message:
      "Código recebido com sucesso. As análises léxica e sintática serão disponibilizadas nas próximas etapas.",
    received: true,
    codeLength: codigo.length
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
