# Registro de testes

Este arquivo registra as execuções relevantes dos testes automatizados e das verificações da aplicação.

## Etapa 2 — Interface e entrada de código-fonte

| Data | Funcionalidade | Tipo de verificação | Comando ou ação | Resultado | Observações |
| --- | --- | --- | --- | --- | --- |
| 19/10/2026 | Frontend | Testes de interface | npm test | Aprovado | 6 testes aprovados: tela, seleção de exemplo, entrada vazia, envio ao backend, falha de comunicação e numeração dinâmica de linhas. |
| 19/10/2026 | Frontend | Build | npm run build | Aprovado | Compilação TypeScript e build Vite concluídos. |
| 19/10/2026 | Backend | Testes de endpoint e TypeScript | npm test e npx tsc --noEmit | Aprovado | 4 testes aprovados: envio válido, entrada vazia, campo ausente e regressão de /api/hello. |
| 19/10/2026 | Aplicação completa | Docker Compose | docker compose up --build | Aprovado | Frontend acessível em http://localhost:5173; exemplos, edição do código e envio ao backend verificados. |

## Etapa 3 — Análise léxica

| Data | Funcionalidade | Tipo de verificação | Comando ou ação | Resultado | Observações |
| --- | --- | --- | --- | --- | --- |
| 22/10/2026 | Scanner | Testes unitários | cd backend e npm test | Aprovado | GitHub Actions validou palavras reservadas, identificadores, inteiros, comentários, operadores compostos, posições e erros léxicos. |
| 22/10/2026 | API | Testes de endpoint | cd backend e npm test | Aprovado | GitHub Actions validou retorno de tokens, erro léxico com HTTP 422, entrada vazia, campo ausente e regressão de /api/hello. |
| 22/10/2026 | Interface | Testes de interface | cd frontend e npm test | Aprovado | GitHub Actions executou 7 testes: tabela de tokens, erros, exemplos, comunicação, validação e numeração dinâmica. |
| 22/10/2026 | Frontend | Build de produção | cd frontend e npm run build | Aprovado | GitHub Actions confirmou a compilação TypeScript e o build do Vite. |
| 22/10/2026 | Aplicação completa | Docker Compose | docker compose up --build | Pendente | Inserir código válido e código com @; confirmar tokens, erros e comunicação entre serviços. |

## Validação local obrigatória

Antes da entrega, execute os comandos documentados e substitua Pendente por Aprovado ou Reprovado. Não registre um resultado como aprovado sem executar o comando correspondente.

Sequência recomendada:

~~~bash
cd backend
npm install
npm test
~~~

~~~bash
cd frontend
npm install
npm test
npm run build
~~~

Na raiz do projeto:

~~~bash
docker compose up --build
~~~

No navegador, abra http://localhost:5173 e valide:

1. um exemplo válido, como int numero = 10;;
2. um caractere inválido, como int @numero = 10;;
3. um comentário de bloco não fechado;
4. a continuidade da numeração de linhas e dos exemplos.

Para encerrar:

~~~bash
docker compose down
~~~
