# Registro de testes

Este arquivo registra as execuções relevantes dos testes automatizados e das verificações da aplicação.

## Etapa 2 — Interface e entrada de código-fonte

| Data | Funcionalidade | Tipo de verificação | Comando ou ação | Resultado | Observações |
| --- | --- | --- | --- | --- | --- |
| A preencher após a primeira execução local | Frontend | Testes de interface | `cd frontend && npm install && npm test` | Pendente | Verifica tela, exemplos, entrada vazia, envio e falha de comunicação. |
| A preencher após a primeira execução local | Backend | Testes de endpoint | `cd backend && npm install && npm test` | Pendente | Verifica envio válido, entrada vazia, campo ausente e regressão de `/api/hello`. |
| A preencher após a primeira execução local | Aplicação completa | Docker Compose | `docker compose up --build` | Pendente | Verificar acesso em `http://localhost:5173` e envio de um exemplo. |

## Como preencher

Após executar cada verificação, substitua **Pendente** por **Aprovado** ou **Reprovado**, informe a data e registre na coluna de observações qualquer correção necessária. Não registre como aprovado sem executar o comando correspondente.
