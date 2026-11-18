# Plano de testes da Etapa 4

## Objetivo

Verificar se o parser reconhece as construções descritas em \`gramatica.md\`, constrói uma AST coerente, respeita precedência e associatividade, localiza erros sintáticos e mantém o contrato entre backend e interface.

## Critérios de aceitação

1. Código léxica e sintaticamente válido deve retornar HTTP 200, \`sucesso: true\` e uma AST com raiz \`PROGRAMA\`.
2. A AST deve conter nós correspondentes às construções reconhecidas e posições de linha/coluna.
3. Multiplicação/divisão deve ter precedência sobre adição/subtração; os operadores de mesmo nível devem agrupar à esquerda.
4. Código com erro sintático deve retornar HTTP 422, \`sintatico.executada: true\`, AST nula e diagnóstico com posição e elementos esperados.
5. Código com erro léxico deve retornar HTTP 422, preservar os diagnósticos léxicos e informar \`sintatico.executada: false\`.
6. A interface deve distinguir erros léxicos de sintáticos e apresentar a AST quando houver sucesso sintático.
7. Entrada vazia ou campo ausente deve continuar retornando HTTP 400.

## Casos de teste previstos/automatizados

| ID | Entrada ou cenário | Resultado esperado |
| --- | --- | --- |
| P01 | \`int resultado = 10 + 5 * 2;\` | AST de declaração; raiz da expressão é adição e lado direito é multiplicação |
| P02 | \`int x = 20 - 5 - 3;\` | Subtrações agrupadas à esquerda |
| P03 | \`int x = 1; if (x < 3) { x = x + 1; } else { while (x > 0) return; }\` | Reconhecimento de declaração, if/else, bloco, while, atribuição e return |
| P04 | \`int x = 10\` | Erro sintático por ausência de \`;\`, com localização |
| P05 | \`if (x > 0 { return; }\` | Erro sintático por ausência de \`)\` |
| P06 | \`int @x = 1;\` | Erro léxico e parser não executado |
| P07 | Entrada sem tokens | Programa vazio aceito pela gramática |
| P08 | \`int x = 4;\` | Posições inicial e final do nó registradas |
| P09 | Campo \`codigo\` ausente ou texto vazio | HTTP 400 |
| P10 | Interface recebe AST válida | Árvore expansível apresentada |
| P11 | Interface recebe erro sintático | Seção de erros sintáticos apresentada separadamente |

## Execução

Backend:
\`\`\`bash
cd backend
npm test
npx tsc --noEmit
\`\`\`

Frontend:
\`\`\`bash
cd frontend
npm test
npm run build
\`\`\`

Integração:
\`\`\`bash
docker compose up --build
\`\`\`

Os resultados reais, data, ambiente e eventuais falhas devem ser registrados em \`registro-testes.md\`. Os casos descritos como automatizados só devem ser considerados aprovados após execução local ou CI confirmada.

## Avaliação com participantes

A avaliação por pares deve ser realizada após a versão integrada estar executável. Convidar estudantes de Ciência da Computação ou Inteligência Artificial que já cursaram ou estejam cursando Compiladores. Solicitar que executem tarefas: carregar exemplo, alterar código, analisar caso válido, provocar erro léxico e sintático e explorar a AST. Aplicar escala Likert de cinco pontos sobre clareza das mensagens, facilidade de uso, compreensão da árvore, utilidade didática e organização da interface, além de perguntas abertas sobre dificuldades e melhorias. A avaliação não deve ser declarada realizada antes da coleta das respostas.
