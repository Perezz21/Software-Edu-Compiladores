# Software Educacional para o Ensino de Compiladores

Aplicação web educacional para apoiar estudantes na compreensão das etapas iniciais de compilação. A versão atual implementa a análise léxica de pequenos trechos de C: o scanner lê o código, identifica tokens e informa erros com linha e coluna.

## Objetivo da versão atual

O estudante pode escrever, editar ou carregar um exemplo em C e solicitar a análise. O frontend envia o código ao backend; o scanner transforma os caracteres em tokens e a interface apresenta os resultados de modo didático.

A análise sintática ainda não está implementada. Nesta etapa, o sistema reconhece tokens válidos mesmo que o programa tenha erros de estrutura.

## Linguagem analisada: C

C foi escolhida por ser recorrente na formação em Computação e permitir relacionar exemplos conhecidos de programação aos conceitos de compiladores.

### Subconjunto léxico suportado

| Categoria | Regra ou exemplos reconhecidos |
| --- | --- |
| Palavras reservadas | int, if, else, while, return |
| Identificadores | Começam com letra ou _. Podem conter letras, dígitos e _, como numero, resultado e _x1 |
| Literais inteiros | Sequências de dígitos, como 0, 10 e 42 |
| Operadores | +, -, *, /, =, ==, !=, >, <, >=, <=, !, &&, || |
| Delimitadores | (, ), {, }, [, ], ; e , |
| Comentários | // comentário e /* comentário */ |
| Espaços em branco | São ignorados e não geram tokens |
| Caracteres inválidos | Geram erro léxico com caractere, linha, coluna e mensagem didática |

Literais reais, strings, caracteres, diretivas de pré-processador, ponteiros, funções, vetores e outros recursos de C ficam fora do escopo atual.

## Como o scanner foi implementado

O scanner foi implementado em TypeScript no arquivo backend/src/scanner.ts, sem dependência externa. Ele percorre o código-fonte caractere a caractere, agrupa lexemas e produz:

- tokens com tipo, lexema, linha e coluna;
- erros léxicos acumulados, sem interromper a análise;
- tratamento para comentários de linha e bloco;
- mensagens para caracteres não reconhecidos, números malformados e comentários de bloco não fechados.

A implementação manual é adequada ao objetivo educacional porque permite associar diretamente o código digitado pelo estudante à lista de tokens exibida pela aplicação.

## Tecnologias

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Testes: Vitest, Testing Library e Supertest
- Containers: Docker e Docker Compose

## Estrutura do projeto

~~~text
Software-Edu-Compiladores/
├── frontend/          # Interface, exemplos e testes de interface
├── backend/           # API, scanner e testes unitários
├── docs/              # Registro das execuções de teste
├── docker-compose.yml # Orquestra frontend e backend
└── README.md
~~~

## Pré-requisitos

- Docker 24 ou superior
- Docker Compose v2 ou superior

Verifique a instalação:

~~~bash
docker --version
docker compose version
~~~

## Como executar

Na raiz do projeto, execute:

~~~bash
docker compose up --build
~~~

Depois, acesse http://localhost:5173 no navegador.

Para encerrar:

~~~bash
docker compose down
~~~

## Como usar a interface

1. Escolha um exemplo ou escreva um trecho do subconjunto de C.
2. Edite o código livremente no editor.
3. Clique em Analisar código.
4. Leia a explicação de token e lexema, a contagem por categoria e a tabela gerada.
5. Caso existam erros, consulte a seção de erros léxicos, que informa linha, coluna e uma orientação de correção.

A numeração de linhas e a coloração do editor facilitam a leitura, mas a classificação exibida nos resultados é produzida pelo scanner do backend.

### Exemplos disponíveis

| Exemplo | Construção demonstrada |
| --- | --- |
| Declaração de variável | int numero = 10; |
| Operação aritmética | int resultado = 10 + 5; |
| Comparação condicional | if (resultado >= 10) { return; } |

## Comunicação entre frontend e backend

Ao clicar no botão, o frontend envia uma requisição POST para:

~~~text
http://localhost:3000/api/analisar
~~~

Corpo da requisição:

~~~json
{ "codigo": "int numero = 10;" }
~~~

Resposta para uma análise bem-sucedida:

~~~json
{
  "sucesso": true,
  "message": "Análise léxica concluída. Consulte os tokens identificados abaixo.",
  "tokens": [
    {
      "tipo": "PALAVRA_RESERVADA",
      "lexema": "int",
      "linha": 1,
      "coluna": 1
    },
    {
      "tipo": "IDENTIFICADOR",
      "lexema": "numero",
      "linha": 1,
      "coluna": 5
    }
  ],
  "erros": []
}
~~~

Quando existem erros léxicos, o endpoint responde com HTTP 422, sucesso igual a false, os tokens reconhecidos e a lista de erros:

~~~json
{
  "sucesso": false,
  "message": "A análise encontrou erros léxicos. Corrija-os e tente novamente.",
  "tokens": [],
  "erros": [
    {
      "tipo": "ERRO_LEXICO",
      "lexema": "@",
      "linha": 1,
      "coluna": 5,
      "mensagem": "Caractere não reconhecido: '@'. Verifique se ele faz parte do subconjunto de C suportado."
    }
  ]
}
~~~

Para campo ausente, texto inválido ou código vazio, o backend retorna HTTP 400.

## Testes automatizados

Os testes cobrem:

- scanner: palavras reservadas, identificadores, inteiros, operadores, delimitadores, comentários, posições e erros léxicos;
- endpoint: retorno de tokens, retorno de erros, validação de entrada e regressão de /api/hello;
- interface: exemplos, validação local, comunicação com backend, tabela de tokens, erros léxicos e numeração dinâmica;
- regressão: os testes das Etapas 1 e 2 continuam incluídos.

Execute os testes em terminais separados:

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

Registre as execuções em docs/registro-testes.md.

## Teste manual da API

Com os contêineres em execução:

~~~bash
curl -X POST http://localhost:3000/api/analisar \
  -H "Content-Type: application/json" \
  -d "{\"codigo\":\"int numero = 10;\"}"
~~~

Para observar um erro léxico:

~~~bash
curl -X POST http://localhost:3000/api/analisar \
  -H "Content-Type: application/json" \
  -d "{\"codigo\":\"int @numero = 10;\"}"
~~~

## Limitações conhecidas e próxima etapa

- O sistema não executa programas em C.
- Literais reais, strings e caracteres ainda não fazem parte do subconjunto.
- A análise sintática, a árvore sintática e a análise semântica não foram implementadas.
- A Etapa 4 utilizará os tokens produzidos aqui para validar a estrutura do programa.
