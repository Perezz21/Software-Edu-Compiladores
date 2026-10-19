import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App", () => {
  it("apresenta os elementos principais da tela", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Laboratório de Compiladores" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Declaração de variável/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Editor de código-fonte em C")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Solicitar análise" })).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("button", { name: "Solicitar análise" }));

    expect(
      screen.getByText("Informe um código-fonte antes de solicitar a análise.")
    ).toBeInTheDocument();
  });

  it("envia o código ao backend e apresenta a confirmação", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        received: true,
        message:
          "Código recebido com sucesso. As análises léxica e sintática serão disponibilizadas nas próximas etapas."
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);
    fireEvent.change(screen.getByLabelText("Editor de código-fonte em C"), {
      target: { value: "int numero = 10;" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Solicitar análise" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:3000/api/analisar",
        expect.objectContaining({ method: "POST" })
      );
    });

    expect(
      await screen.findByText(
        "Código recebido com sucesso. As análises léxica e sintática serão disponibilizadas nas próximas etapas."
      )
    ).toBeInTheDocument();
  });

  it("apresenta uma mensagem compreensível quando não consegue acessar o servidor", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Falha de rede")));

    render(<App />);
    fireEvent.change(screen.getByLabelText("Editor de código-fonte em C"), {
      target: { value: "int numero = 10;" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Solicitar análise" }));

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
