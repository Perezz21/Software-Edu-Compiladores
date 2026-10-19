# Registro de testes

Este arquivo registra as execuções relevantes dos testes automatizados e das verificações da aplicação.

## Etapa 2 — Interface e entrada de código-fonte

| Data | Funcionalidade | Tipo de verificação | Comando ou ação | Resultado | Observações |
| --- | --- | --- | --- | --- | --- |
| 19/10/2026 | Frontend | Testes de interface | `npm test` | Aprovado | 6 testes aprovados: tela, seleção de exemplo, entrada vazia, envio ao backend, falha de comunicação e numeração dinâmica de linhas. |
| 19/10/2026 | Frontend | Build | `npm run build` | Aprovado | Compilação TypeScript e build Vite concluídos. |
| 19/10/2026 | Backend | Testes de endpoint e TypeScript | `npm test` e `npx tsc --noEmit` | Aprovado | 4 testes aprovados: envio válido, entrada vazia, campo ausente e regressão de `/api/hello`. |
| 19/10/2026 | Aplicação completa | Docker Compose | `docker compose up --build` | Aprovado | Frontend acessível em `http://localhost:5173`; exemplos, edição do código e envio ao backend verificados. |

Os três primeiros resultados foram executados automaticamente pelo GitHub Actions no fluxo [Testes automatizados](../.github/workflows/tests.yml).

## Próxima verificação

Depois de executar o Docker Compose no computador local, substitua **Pendente** por **Aprovado** ou **Reprovado** e registre qualquer correção necessária. Não registre como aprovado sem executar o comando correspondente.
