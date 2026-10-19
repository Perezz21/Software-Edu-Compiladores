import { FormEvent, ReactNode, useState } from "react";

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
    title: "Declaração de variável",
    description: "Crie e inicialize uma variável inteira.",
    color: "example-dot--green",
    code: "int numero = 10;"
  },
  {
    id: "operacao",
    title: "Operação aritmética",
    description: "Combine valores inteiros com operadores.",
    color: "example-dot--yellow",
    code: "int resultado = 10 + 5;"
  },
  {
    id: "parenteses",
    title: "Expressão com parênteses",
    description: "Defina a ordem de uma expressão.",
    color: "example-dot--purple",
    code: "int total = (10 + 5) * 2;"
  }
];

const tokenPattern =
  /(\/\/[^\n]*|"(?:\\.|[^"\\])*"|#\s*include\b|\b(?:int|return)\b|\b\d+\b|[+\-*/=;(){}])/g;

function getTokenClassName(token: string) {
  if (token.startsWith("//")) return "token-comment";
  if (token.startsWith('"')) return "token-string";
  if (token.startsWith("#")) return "token-directive";
  if (/^(int|return)$/.test(token)) return "token-keyword";
  if (/^\d+$/.test(token)) return "token-number";
  return "token-operator";
}

function highlightCode(code: string) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of code.matchAll(tokenPattern)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      nodes.push(code.slice(lastIndex, index));
    }

    nodes.push(
      <span className={getTokenClassName(match[0])} key={`${index}-${match[0]}`}>
        {match[0]}
      </span>
    );
    lastIndex = index + match[0].length;
  }

  nodes.push(code.slice(lastIndex));
  return nodes;
}

export default function App() {
  const [code, setCode] = useState("");
  const [selectedExample, setSelectedExample] = useState("");
  const [editorScroll, setEditorScroll] = useState({ left: 0, top: 0 });
  const [result, setResult] = useState<Result>({
    type: "info",
    message: "Escolha um exemplo ou escreva um código C para começar."
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lineNumbers = Array.from({ length: code.split("\n").length }, (_, index) => index + 1);

  function loadExample(exampleId: string) {
    const example = examples.find((item) => item.id === exampleId);

    if (!example) {
      return;
    }

    setSelectedExample(exampleId);
    setCode(example.code);
    setResult({
      type: "info",
      message: "Exemplo carregado. Você pode editá-lo antes de solicitar a análise."
    });
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
        setResult({ type: "error", message: data.message });
        return;
      }

      setResult({ type: "success", message: data.message });
    } catch {
      setResult({
        type: "error",
        message: "Não foi possível comunicar com o servidor. Verifique a conexão e tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="workspace">
      <header className="site-header">
        <div className="site-mark" aria-hidden="true" />
        <div>
          <h1>Laboratório de Compiladores</h1>
          <p>Experimente pequenos trechos do subconjunto da linguagem C.</p>
        </div>
      </header>

      <div className="workspace-grid">
        <aside className="panel examples-panel" aria-labelledby="titulo-exemplos">
          <div className="panel-heading">
            <h2 id="titulo-exemplos">Exemplos</h2>
            <p>Carregue um exemplo e modifique-o como quiser.</p>
          </div>

          <div className="example-list">
            {examples.map((example) => (
              <button
                className={`example-row ${selectedExample === example.id ? "example-row--selected" : ""}`}
                type="button"
                key={example.id}
                onClick={() => loadExample(example.id)}
              >
                <span className={`example-dot ${example.color}`} aria-hidden="true" />
                <span>
                  <strong>{example.title}</strong>
                  <small>{example.description}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="panel editor-panel" aria-labelledby="titulo-codigo">
          <div className="panel-heading">
            <h2 id="titulo-codigo">Código-fonte em C</h2>
            <p>Escreva ou carregue um exemplo.</p>
          </div>

          <form onSubmit={submitCode}>
            <label className="sr-only" htmlFor="code">
              Editor de código-fonte em C
            </label>
            <div className="code-editor">
              <div className="line-numbers" aria-hidden="true">
                <div style={{ transform: `translateY(${-editorScroll.top}px)` }}>
                  {lineNumbers.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </div>
              </div>
              <div className="code-surface">
                <pre
                  className="syntax-preview"
                  aria-hidden="true"
                  style={{
                    transform: `translate(${-editorScroll.left}px, ${-editorScroll.top}px)`
                  }}
                >
                  {highlightCode(code || " ")}
                </pre>
                <textarea
                  id="code"
                  className="syntax-input"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  onScroll={(event) =>
                    setEditorScroll({
                      left: event.currentTarget.scrollLeft,
                      top: event.currentTarget.scrollTop
                    })
                  }
                  placeholder="Exemplo: int numero = 10;"
                  spellCheck="false"
                  wrap="off"
                  rows={12}
                />
              </div>
            </div>

            <p className="editor-note">
              As cores são apenas um recurso visual do editor. Nesta etapa, o código é
              recebido e validado; a análise léxica e sintática será desenvolvida nas
              próximas etapas.
            </p>

            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Solicitar análise"}
            </button>
          </form>
        </section>

        <section
          className={`panel result-panel result-panel--${result.type}`}
          aria-labelledby="titulo-resultado"
        >
          <div className="panel-heading">
            <h2 id="titulo-resultado">Resultado</h2>
            <p>Retorno do processamento solicitado.</p>
          </div>
          <div className="result-content" role="status">
            <span className="result-indicator" aria-hidden="true" />
            <p>{result.message}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
