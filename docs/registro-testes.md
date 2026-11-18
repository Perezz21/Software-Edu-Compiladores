# Registro de testes

Este arquivo registra as execuções relevantes dos testes automatizados e das verificações da aplicação. Resultados automatizados e verificações manuais são identificados separadamente.

## Etapa 2 — Interface e entrada de código-fonte

| Data | Funcionalidade | Tipo de verificação | Comando ou ação | Resultado | Observações |
| --- | --- | --- | --- | --- | --- |
| 19/10/2026 | Frontend | Testes de interface | `npm test` | Aprovado | 6 testes aprovados: tela, seleção de exemplo, entrada vazia, envio ao backend, falha de comunicação e numeração dinâmica de linhas. |
| 19/10/2026 | Frontend | Build | `npm run build` | Aprovado | Compilação TypeScript e build Vite concluídos. |
| 19/10/2026 | Backend | Testes de endpoint e TypeScript | `npm test` e `npx tsc --noEmit` | Aprovado | 4 testes aprovados: envio válido, entrada vazia, campo ausente e regressão de `/api/hello`. |
| 19/10/2026 | Aplicação completa | Docker Compose | `docker compose up --build` | Aprovado | Frontend acessível em `http://localhost:5173`; exemplos, edição do código e envio ao backend verificados. |

## Etapa 3 — Análise léxica

| Data | Funcionalidade | Tipo de verificação | Comando ou ação | Resultado | Observações |
| --- | --- | --- | --- | --- | --- |
| 22/10/2026 | Scanner | Testes unitários | `cd backend` e `npm test` | Aprovado | GitHub Actions validou palavras reservadas, identificadores, inteiros, comentários, operadores compostos, posições e erros léxicos. |
| 22/10/2026 | API | Testes de endpoint | `cd backend` e `npm test` | Aprovado | GitHub Actions validou retorno de tokens, erro léxico com HTTP 422, entrada vazia, campo ausente e regressão de `/api/hello`. |
| 22/10/2026 | Interface | Testes de interface | `cd frontend` e `npm test` | Aprovado | GitHub Actions executou 7 testes: tabela de tokens, erros, exemplos, comunicação, validação e numeração dinâmica. |
| 22/10/2026 | Frontend | Build de produção | `cd frontend` e `npm run build` | Aprovado | GitHub Actions confirmou a compilação TypeScript e o build do Vite. |
| 22/10/2026 | Aplicação completa | Docker Compose | `docker compose up --build` | Pendente | A execução integrada por Docker precisa ser registrada separadamente. |

## Etapa 4 — Análise sintática e AST

### Testes automatizados locais

| Data | Componente | Comando | Resultado | Observações |
| --- | --- | --- | --- | --- |
| 18/11/2026 | Backend | `cd backend && npm test` | Aprovado | 18 testes aprovados em 3 arquivos: scanner (6), parser (7) e servidor/API (5). |
| 18/11/2026 | Frontend | `cd frontend && npm test` | Aprovado | 8 testes aprovados em `App.test.tsx`, incluindo AST, erros léxicos/sintáticos e falha de comunicação. |

### Integração manual local

| Data | Cenário | Ambiente/ação | Resultado | Observações |
| --- | --- | --- | --- | --- |
| 18/11/2026 | Inicialização do backend | `npm run dev` em terminal próprio | Aprovado | Servidor disponível em `http://localhost:3000`. |
| 18/11/2026 | Inicialização do frontend | `npm run dev` em terminal próprio | Aprovado | Vite disponível em `http://localhost:5173`. |
| 18/11/2026 | Declaração simples | `int numero = 10;` no navegador | Aprovado | Tokens e AST exibidos. |
| 18/11/2026 | Erro sintático | `int numero = ;` no navegador | Aprovado | Erro sintático apresentado separadamente. |
| 18/11/2026 | Erro léxico | `int numero = 10 @ 5;` no navegador | Aprovado | Caractere inválido identificado; parser não executado. |
| 18/11/2026 | Precedência aritmética | `int resultado = 10 + 5 * 2;` no navegador | Aprovado | AST representa multiplicação como subárvore da adição. |
| 18/11/2026 | Condicional | Exemplo com `if/else` no navegador | Aprovado | Condição, blocos e atribuições representados na AST. |
| 18/11/2026 | Repetição | Exemplo com `while` no navegador | Aprovado | Condição, bloco e atribuição representados na AST. |

### Integração contínua (GitHub Actions)

| Data | Workflow | Backend | Frontend | Resultado |
| --- | --- | --- | --- | --- |
| 18/11/2026 | Testes automatizados — execução associada ao commit da Etapa 4 | Testes e verificação TypeScript aprovados | Testes e build aprovados | Aprovado |

### Verificações ainda pendentes

- Executar e registrar os casos adicionais de borda P12 a P15 descritos em `plano-testes-etapa-4.md`.
- Executar `docker compose up --build` na versão atual da Etapa 4, caso o ambiente Docker esteja disponível.
- Realizar avaliação com participantes somente se essa atividade fizer parte da entrega solicitada; não presumir que foi realizada.

**Nota:** os testes automatizados e a integração manual local foram realizados em ambientes distintos. O teste manual utilizou os servidores de desenvolvimento Node/Vite, sem Docker. A execução de CI confirmou os testes do backend, a verificação TypeScript, os testes do frontend e o build.
