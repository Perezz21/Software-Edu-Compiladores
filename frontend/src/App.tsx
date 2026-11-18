import { FormEvent, ReactNode, useState } from "react";

type Token = { tipo: string; lexema: string; linha: number; coluna: number };
type Erro = { tipo: string; lexema?: string; linha: number; coluna: number; mensagem: string };
type NoAST = {
  tipo: string; linha: number; coluna: number; linhaFinal: number; colunaFinal: number;
  atributos: Record<string, string | number | boolean | null>; filhos: NoAST[];
};
type ApiResponse = {
  sucesso: boolean; message: string; tokens: Token[]; erros: Erro[];
  sintatico: { sucesso: boolean; executada: boolean; ast: NoAST | null; erros: Erro[] } | null;
};
type Result = { type: "info" | "success" | "error"; message: string };

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const examples = [
  { id: "declaracao", title: "Declaração de variável", description: "Crie e inicialize uma variável inteira.", color: "example-dot--green", code: "int numero = 10;" },
  { id: "operacao", title: "Operação aritmética", description: "Observe precedência entre operadores.", color: "example-dot--yellow", code: "int resultado = 10 + 5 * 2;" },
  { id: "condicional", title: "Condicional", description: "Analise uma condição e um bloco.", color: "example-dot--purple", code: "if (resultado >= 10) { return; }" },
  { id: "repeticao", title: "Repetição", description: "Utilize while e atribuição.", color: "example-dot--green", code: "int contador = 3; while (contador > 0) { contador = contador - 1; }" }
];

const tokenPattern = /(\/\/[^\n]*|\b(?:int|if|else|while|return)\b|\b\d+\b|==|!=|<=|>=|&&|\|\||[+\-*/=!><;(),{}\[\]])/g;
function getTokenClassName(token: string) {
  if (token.startsWith("//")) return "token-comment";
  if (/^(int|if|else|while|return)$/.test(token)) return "token-keyword";
  if (/^\d+$/.test(token)) return "token-number";
  if (/^[(){}\[\],;]$/.test(token)) return "token-delimiter";
  return "token-operator";
}
function highlightCode(code: string) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  for (const match of code.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(code.slice(lastIndex, index));
    nodes.push(<span className={getTokenClassName(match[0])} key={String(index) + match[0]}>{match[0]}</span>);
    lastIndex = index + match[0].length;
  }
  nodes.push(code.slice(lastIndex));
  return nodes;
}
function obterContagem(tokens: Token[]) {
  return tokens.reduce<Record<string, number>>((contagem, token) => {
    contagem[token.tipo] = (contagem[token.tipo] ?? 0) + 1;
    return contagem;
  }, {});
}
function formatarTipo(tipo: string) { return tipo.toLowerCase().split("_").join(" "); }

function TreeNode({ node }: { node: NoAST }) {
  const atributos = Object.entries(node.atributos);
  return (
    <li className="ast-node">
      <details open>
        <summary>
          <span className="ast-node-type">{formatarTipo(node.tipo)}</span>
          {atributos.length > 0 && <span className="ast-attributes">{atributos.map(([key, value]) => key + ": " + String(value)).join(" · ")}</span>}
          <span className="ast-position">L{node.linha}:C{node.coluna}</span>
        </summary>
        {node.filhos.length > 0 && <ul>{node.filhos.map((child, index) => <TreeNode key={node.tipo + "-" + index + "-" + child.linha + "-" + child.coluna} node={child} />)}</ul>}
      </details>
    </li>
  );
}

export default function App() {
  const [code, setCode] = useState("");
  const [selectedExample, setSelectedExample] = useState("");
  const [editorScroll, setEditorScroll] = useState({ left: 0, top: 0 });
  const [result, setResult] = useState<Result>({ type: "info", message: "Escolha um exemplo ou escreva um código C para começar." });
  const [analysis, setAnalysis] = useState<ApiResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lineNumbers = Array.from({ length: code.split("\n").length }, (_, index) => index + 1);

  function loadExample(exampleId: string) {
    const example = examples.find((item) => item.id === exampleId);
    if (!example) return;
    setSelectedExample(exampleId); setCode(example.code); setAnalysis(null);
    setResult({ type: "info", message: "Exemplo carregado. Você pode editá-lo antes de solicitar a análise." });
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.trim().length === 0) {
      setAnalysis(null);
      setResult({ type: "error", message: "Informe um código-fonte antes de solicitar a análise." });
      return;
    }
    setIsSubmitting(true); setAnalysis(null);
    setResult({ type: "info", message: "Executando análise léxica e sintática..." });
    try {
      const response = await fetch(apiUrl + "/api/analisar", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codigo: code })
      });
      const data = (await response.json()) as ApiResponse;
      if (!Array.isArray(data.tokens) || !Array.isArray(data.erros)) {
        setResult({ type: "error", message: data.message ?? "O servidor retornou uma resposta inválida." });
        return;
      }
      setAnalysis(data);
      setResult({ type: data.sucesso ? "success" : "error", message: data.message });
    } catch {
      setResult({ type: "error", message: "Não foi possível comunicar com o servidor. Verifique a conexão e tente novamente." });
    } finally { setIsSubmitting(false); }
  }

  const contagem = analysis ? obterContagem(analysis.tokens) : {};
  return (
    <main className="workspace">
      <header className="site-header">
        <div className="site-mark" aria-hidden="true" />
        <div><h1>Laboratório de Compiladores</h1><p>Experimente pequenos trechos do subconjunto da linguagem C.</p></div>
      </header>
      <div className="workspace-grid">
        <aside className="panel examples-panel" aria-labelledby="titulo-exemplos">
          <div className="panel-heading"><h2 id="titulo-exemplos">Exemplos</h2><p>Carregue um exemplo e modifique-o como quiser.</p></div>
          <div className="example-list">
            {examples.map((example) => (
              <button className={"example-row " + (selectedExample === example.id ? "example-row--selected" : "")} type="button" key={example.id} onClick={() => loadExample(example.id)}>
                <span className={"example-dot " + example.color} aria-hidden="true" />
                <span><strong>{example.title}</strong><small>{example.description}</small></span>
              </button>
            ))}
          </div>
        </aside>
        <section className="panel editor-panel" aria-labelledby="titulo-codigo">
          <div className="panel-heading"><h2 id="titulo-codigo">Código-fonte em C</h2><p>Escreva ou carregue um exemplo.</p></div>
          <form onSubmit={submitCode}>
            <label className="sr-only" htmlFor="code">Editor de código-fonte em C</label>
            <div className="code-editor">
              <div className="line-numbers" aria-hidden="true"><div style={{ transform: "translateY(" + -editorScroll.top + "px)" }}>{lineNumbers.map((line) => <span key={line}>{line}</span>)}</div></div>
              <div className="code-surface">
                <pre className="syntax-preview" aria-hidden="true" style={{ transform: "translate(" + -editorScroll.left + "px, " + -editorScroll.top + "px)" }}>{highlightCode(code || " ")}</pre>
                <textarea id="code" className="syntax-input" value={code} onChange={(event) => setCode(event.target.value)}
                  onScroll={(event) => setEditorScroll({ left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop })}
                  placeholder="Exemplo: int numero = 10;" spellCheck="false" wrap="off" rows={12} />
              </div>
            </div>
            <p className="editor-note">O sistema realiza análise léxica, análise sintática e construção da AST. A análise semântica será desenvolvida em etapa posterior.</p>
            <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Analisando..." : "Analisar código"}</button>
          </form>
        </section>
        <section className={"panel result-panel result-panel--" + result.type} aria-labelledby="titulo-resultado">
          <div className="panel-heading"><h2 id="titulo-resultado">Resultado da análise</h2><p>Tokens, diagnósticos e árvore sintática abstrata.</p></div>
          <div className="result-content" role="status" aria-live="polite"><span className="result-indicator" aria-hidden="true" /><p>{result.message}</p></div>
          {analysis && (
            <div className="analysis-details">
              <p className="analysis-explanation"><strong>Token</strong> é uma categoria reconhecida pelo scanner; <strong>lexema</strong> é o trecho de código correspondente. A <strong>AST</strong> representa a estrutura sintática do programa em forma de árvore.</p>
              <div className="analysis-summary" aria-label="Resumo da análise">
                <span>{analysis.tokens.length} token(s)</span><span>{analysis.erros.length} erro(s) léxico(s)</span>
                {Object.entries(contagem).map(([tipo, quantidade]) => <span key={tipo}>{quantidade} {formatarTipo(tipo)}</span>)}
                {analysis.sintatico && <span>{analysis.sintatico.executada ? (analysis.sintatico.sucesso ? "Sintaxe válida" : "Erro sintático") : "Parser não executado"}</span>}
              </div>
              {analysis.tokens.length > 0 && (
                <section className="tokens-section" aria-labelledby="titulo-tokens">
                  <h3 id="titulo-tokens">Tokens identificados</h3><div className="table-wrapper"><table>
                    <caption className="sr-only">Lista de tokens identificados pelo scanner</caption>
                    <thead><tr><th scope="col">Tipo</th><th scope="col">Lexema</th><th scope="col">Linha</th><th scope="col">Coluna</th></tr></thead>
                    <tbody>{analysis.tokens.map((token, index) => <tr key={token.linha + "-" + token.coluna + "-" + index}><td>{formatarTipo(token.tipo)}</td><td><code>{token.lexema}</code></td><td>{token.linha}</td><td>{token.coluna}</td></tr>)}</tbody>
                  </table></div>
                </section>
              )}
              {analysis.erros.length > 0 && (
                <section className="errors-section" aria-labelledby="titulo-erros"><h3 id="titulo-erros">Erros léxicos</h3><ul>
                  {analysis.erros.map((erro, index) => <li key={erro.linha + "-" + erro.coluna + "-" + index}><strong>Linha {erro.linha}, coluna {erro.coluna}:</strong> {erro.mensagem}</li>)}
                </ul></section>
              )}
              {analysis.sintatico && !analysis.sintatico.executada && <p className="analysis-explanation">A etapa sintática não foi executada porque foram encontrados erros léxicos. Corrija-os para que o parser possa receber uma sequência válida de tokens.</p>}
              {analysis.sintatico?.erros.length ? (
                <section className="errors-section" aria-labelledby="titulo-erros-sintaticos"><h3 id="titulo-erros-sintaticos">Erros sintáticos</h3><ul>
                  {analysis.sintatico.erros.map((erro, index) => <li key={erro.linha + "-" + erro.coluna + "-" + index}><strong>Linha {erro.linha}, coluna {erro.coluna}:</strong> {erro.mensagem}</li>)}
                </ul></section>
              ) : null}
              {analysis.sintatico?.ast && (
                <section className="ast-section" aria-labelledby="titulo-ast">
                  <h3 id="titulo-ast">Árvore sintática abstrata (AST)</h3>
                  <p className="ast-help">Expanda ou recolha os nós para explorar a estrutura do programa.</p>
                  <div className="ast-tree"><ul><TreeNode node={analysis.sintatico.ast} /></ul></div>
                </section>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
