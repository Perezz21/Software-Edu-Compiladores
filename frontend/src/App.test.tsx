import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const respostaSucesso = {
  sucesso: true,
  message: "Análises léxica e sintática concluídas. Consulte os tokens e a AST.",
  erros: [],
  tokens: [
    { tipo: "PALAVRA_RESERVADA", lexema: "int", linha: 1, coluna: 1 },
    { tipo: "IDENTIFICADOR", lexema: "numero", linha: 1, coluna: 5 }
  ],
  sintatico: {
    sucesso: true, executada: true, erros: [],
    ast: {
      tipo: "PROGRAMA", linha: 1, coluna: 1, linhaFinal: 1, colunaFinal: 10,
      atributos: {}, filhos: [{
        tipo: "DECLARACAO_VARIAVEL", linha: 1, coluna: 1, linhaFinal: 1, colunaFinal: 10,
        atributos: { tipoDado: "int", nome: "numero" }, filhos: []
      }]
    }
  }
};

afterEach(() => vi.restoreAllMocks());

describe("App", () => {
  it("apresenta os elementos principais da tela", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Laboratório de Compiladores" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Declaração de variável/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Editor de código-fonte em C")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analisar código" })).toBeInTheDocument();
  });

  it("carrega exemplo no editor", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Operação aritmética/i }));
    expect(screen.getByLabelText("Editor de código-fonte em C")).toHaveValue("int resultado = 10 + 5 * 2;");
  });

  it("orienta quando o código está vazio", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Analisar código" }));
    expect(screen.getByText("Informe um código-fonte antes de solicitar a análise.")).toBeInTheDocument();
  });

  it("envia o código e exibe tokens e AST", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => respostaSucesso });
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);
    fireEvent.change(screen.getByLabelText("Editor de código-fonte em C"), { target: { value: "int numero = 10;" } });
    fireEvent.click(screen.getByRole("button", { name: "Analisar código" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/analisar", expect.objectContaining({ method: "POST" })
    ));
    expect(await screen.findByText("Tokens identificados")).toBeInTheDocument();
    expect(screen.getByText("palavra reservada")).toBeInTheDocument();
    expect(screen.getByText("identificador")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Árvore sintática abstrata (AST)" })).toBeInTheDocument();
    expect(screen.getByText("declaracao variavel")).toBeInTheDocument();
  });

  it("exibe erros léxicos e informa que o parser não foi executado", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        sucesso: false, message: "A análise encontrou erros léxicos. A análise sintática não foi executada.",
        tokens: [], erros: [{ tipo: "ERRO_LEXICO", lexema: "@", linha: 2, coluna: 4, mensagem: "Caractere não reconhecido." }],
        sintatico: { sucesso: false, executada: false, ast: null, erros: [] }
      })
    }));
    render(<App />);
    fireEvent.change(screen.getByLabelText("Editor de código-fonte em C"), { target: { value: "int @numero = 10;" } });
    fireEvent.click(screen.getByRole("button", { name: "Analisar código" }));
    expect(await screen.findByText("Erros léxicos")).toBeInTheDocument();
    expect(screen.getByText(/Linha 2, coluna 4:/)).toBeInTheDocument();
    expect(screen.getByText(/parser possa receber uma sequência válida de tokens/)).toBeInTheDocument();
  });

  it("exibe erro sintático separado de erros léxicos", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        sucesso: false, message: "A análise encontrou erros sintáticos.",
        tokens: [], erros: [],
        sintatico: { sucesso: false, executada: true, ast: null,
          erros: [{ tipo: "ERRO_SINTATICO", linha: 1, coluna: 11, mensagem: "Era esperado ;." }] }
      })
    }));
    render(<App />);
    fireEvent.change(screen.getByLabelText("Editor de código-fonte em C"), { target: { value: "int numero = 10" } });
    fireEvent.click(screen.getByRole("button", { name: "Analisar código" }));
    expect(await screen.findByText("Erros sintáticos")).toBeInTheDocument();
    expect(screen.getByText(/Linha 1, coluna 11:/)).toBeInTheDocument();
  });

  it("apresenta mensagem quando não consegue acessar o servidor", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Falha de rede")));
    render(<App />);
    fireEvent.change(screen.getByLabelText("Editor de código-fonte em C"), { target: { value: "int numero = 10;" } });
    fireEvent.click(screen.getByRole("button", { name: "Analisar código" }));
    expect(await screen.findByText("Não foi possível comunicar com o servidor. Verifique a conexão e tente novamente.")).toBeInTheDocument();
  });

  it("atualiza numeração conforme as linhas digitadas", () => {
    const { container } = render(<App />);
    fireEvent.change(screen.getByLabelText("Editor de código-fonte em C"), {
      target: { value: "int primeiro = 1;\nint segundo = 2;" }
    });
    const lines = container.querySelectorAll(".line-numbers span");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveTextContent("1");
    expect(lines[1]).toHaveTextContent("2");
  });
});
