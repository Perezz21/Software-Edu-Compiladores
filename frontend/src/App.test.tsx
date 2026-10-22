import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const respostaSucesso = {
  sucesso: true,
  message: "Análise léxica concluída. Consulte os tokens identificados abaixo.",
  erros: [],
  tokens: [
    { tipo: "PALAVRA_RESERVADA", lexema: "int", linha: 1, coluna: 1 },
    { tipo: "IDENTIFICADOR", lexema: "numero", linha: 1, coluna: 5 }
  ]
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App", () => {
  it("apresenta os elementos principais da tela", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Laboratório de Compiladores" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Declaração de variável/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Editor de código-fonte em C")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analisar código" })).toBeInTheDocument();
  });

  it("carrega um exemplo na área de código", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Operação aritmética/i }));

    expect(screen.getByLabelText("Editor de código-fonte em C")).toHaveValue(
      "int resultado = 10 + 5;"
    );
  });

  it("exibe uma orientação quando o código está vazio", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Analisar código" }));

    expect(
      screen.getByText("Informe um código-fonte antes de solicitar a análise.")
    ).toBeInTheDocument();
  });

  it("envia o código ao backend e exibe os tokens retornados", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => respostaSucesso
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);
    fireEvent.change(screen.getByLabelText("Editor de código-fonte em C"), {
      target: { value: "int numero = 10;" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Analisar código" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:3000/api/analisar",
        expect.objectContaining({ method: "POST" })
      );
    });

    expect(await screen.findByText("Tokens identificados")).toBeInTheDocument();
    expect(screen.getByText("palavra reservada")).toBeInTheDocument();
    expect(screen.getByText("identificador")).toBeInTheDocument();
    expect(screen.getByText("2 token(s)")).toBeInTheDocument();
  });

  it("exibe os erros léxicos sem interromper a interface", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        sucesso: false,
        message: "A análise encontrou erros léxicos. Corrija-os e tente novamente.",
        tokens: [],
        erros: [
          {
            tipo: "ERRO_LEXICO",
            lexema: "@",
            linha: 2,
            coluna: 4,
            mensagem: "Caractere não reconhecido: '@'."
          }
        ]
      })
    }));

    render(<App />);
    fireEvent.change(screen.getByLabelText("Editor de código-fonte em C"), {
      target: { value: "int @numero = 10;" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Analisar código" }));

    expect(await screen.findByText("Erros léxicos")).toBeInTheDocument();
    expect(screen.getByText(/Linha 2, coluna 4:/)).toBeInTheDocument();
  });

  it("apresenta uma mensagem compreensível quando não consegue acessar o servidor", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Falha de rede")));

    render(<App />);
    fireEvent.change(screen.getByLabelText("Editor de código-fonte em C"), {
      target: { value: "int numero = 10;" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Analisar código" }));

    expect(
      await screen.findByText(
        "Não foi possível comunicar com o servidor. Verifique a conexão e tente novamente."
      )
    ).toBeInTheDocument();
  });

  it("atualiza a numeração conforme as linhas digitadas", () => {
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
