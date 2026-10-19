# Registro de testes

Este arquivo registra as execuções relevantes dos testes automatizados e das verificações da aplicação.

## Etapa 2 — Interface e entrada de código-fonte

| Data | Funcionalidade | Tipo de verificação | Comando ou ação | Resultado | Observações |
| --- | --- | --- | --- | --- | --- |
| 19/10/2026 | Frontend | Testes de interface | `npm test` | Aprovado | 5 testes aprovados: tela, seleção de exemplo, entrada vazia, envio ao backend e falha de comunicação. |
| 19/10/2026 | Frontend | Build | `npm run build` | Aprovado | Compilação TypeScript e build Vite concluídos. |
| 19/10/2026 | Backend | Testes de endpoint e TypeScript | `npm test` e `npx tsc --noEmit` | Aprovado | 4 testes aprovados: envio válido, entrada vazia, campo ausente e regressão de `/api/hello`. |
| Pendente de validação local | Aplicação completa | Docker Compose | `docker compose up --build` | Pendente | Verificar acesso em `http://localhost:5173`, seleção de exemplo e envio do código. |

Os três primeiros resultados foram executados automaticamente pelo GitHub Actions no fluxo [Testes automatizados](../.github/workflows/tests.yml).

## Próxima verificação

Depois de executar o Docker Compose no computador local, substitua **Pendente** por **Aprovado** ou **Reprovado** e registre qualquer correção necessária. Não registre como aprovado sem executar o comando correspondente.
