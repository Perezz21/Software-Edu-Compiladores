import { FormEvent, useState } from "react";

type ApiResponse = {
  message: string;
  received: boolean;
};

type Result = {
  type: "info" | "success" | "error";
  message: string;
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const examples = [
  {
    id: "declaracao",
    label: "Declaração e inicialização",
    code: "int numero = 10;"
  },
  {
    id: "operacao",
    label: "Operação aritmética",
    code: "int resultado = 10 + 5;"
  },
  {
    id: "parenteses",
    label: "Expressão com parênteses",
    code: "int total = (10 + 5) * 2;"
  }
];

export default function App() {
  const [code, setCode] = useState("");
  const [selectedExample, setSelectedExample] = useState("");
  const [result, setResult] = useState<Result>({
    type: "info",
    message: "Insira ou escolha um exemplo de código C para começar."
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadExample(exampleId: string) {
    setSelectedExample(exampleId);
    const example = examples.find((item) => item.id === exampleId);

    if (example) {
      setCode(example.code);
      setResult({
        type: "info",
        message: "Exemplo carregado. Você pode editá-lo antes de solicitar a análise."
      });
    }
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (code.trim().length === 0) {
      setResult({
        type: "error",
        message: "Informe um código-fonte antes de solicitar a análise."
      });
      return;
    }

    setIsSubmitting(true);
    setResult({ type: "info", message: "Enviando o código ao servidor..." });

    try {
      const response = await fetch(`${apiUrl}/api/analisar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: code })
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(data.message);
      }

      setResult({ type: "success", message: data.message });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Não foi possível comunicar com o servidor. Verifique a conexão e tente novamente.";

      setResult({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <section className="app-card" aria-labelledby="titulo-aplicacao">
        <header>
          <p className="tag">Ambiente de experimentação</p>
          <h1 id="titulo-aplicacao">Software Educacional para o Ensino de Compiladores</h1>
          <p className="description">
            Insira pequenos trechos do subconjunto da linguagem C e envie-os para o
            processamento inicial. As análises léxica e sintática serão incluídas nas
            próximas etapas.
          </p>
        </header>

        <form onSubmit={submitCode}>
          <div className="field">
            <label htmlFor="example">Exemplos em C</label>
            <select
              id="example"
              value={selectedExample}
              onChange={(event) => loadExample(event.target.value)}
            >
              <option value="">Selecione um exemplo</option>
              {examples.map((example) => (
                <option key={example.id} value={example.id}>
                  {example.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="code">Código-fonte em C</label>
            <textarea
              id="code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Exemplo: int numero = 10;"
              spellCheck="false"
              rows={12}
            />
            <small>
              Nesta etapa, o código é recebido e validado; ele ainda não é executado
              nem analisado sintaticamente.
            </small>
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Solicitar análise"}
          </button>
        </form>

        <section className={`result result--${result.type}`} aria-labelledby="resultado">
          <h2 id="resultado">Resultado</h2>
          <p role="status">{result.message}</p>
        </section>
      </section>
    </main>
  );
}
