# Software Educacional para o Ensino de Compiladores

Aplicação web educacional para apoiar o estudo das etapas iniciais de compilação.

## Objetivo desta primeira etapa

Disponibilizar uma estrutura mínima, reproduzível e documentada com frontend, backend e Docker. Ao executar o projeto, a interface consulta o backend e mostra a mensagem **Hello, World!**.

## Linguagem analisada: C

A linguagem escolhida é **C**, por ser recorrente na formação em Computação e permitir relacionar exemplos de programação conhecidos a conceitos de compiladores.

### Subconjunto inicial

A primeira versão do analisador trabalhará apenas com:

- declarações de variáveis inteiras, como `int total;`;
- atribuições, como `total = 10;`;
- literais inteiros;
- operadores aritméticos `+`, `-`, `*` e `/`;
- parênteses e ponto e vírgula.

Estruturas condicionais, repetições, funções, vetores, ponteiros, análise semântica e geração de código ficam fora desta primeira versão. Esse recorte mantém o projeto viável e permite concentrar a explicação na análise léxica e sintática.

## Tecnologias

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Containers: Docker e Docker Compose

## Estrutura do projeto

```text
compiladores-educacional/
├── frontend/          # Interface web
├── backend/           # API e futuro analisador
├── docker-compose.yml # Orquestra frontend e backend
└── README.md
```

## Pré-requisitos

- Docker 24 ou superior
- Docker Compose v2 ou superior

Verifique a instalação com:

```bash
docker --version
docker compose version
```

## Como executar

Na raiz do projeto, execute:

```bash
docker compose up --build
```

Depois, acesse <http://localhost:5173> no navegador.

A página deve mostrar a mensagem retornada pela API: **Hello, World!**.

## Como encerrar

No terminal que está executando o projeto, pressione `Ctrl + C`. Em seguida, execute:

```bash
docker compose down
```

## Teste da API

Com os contêineres em execução, a API pode ser testada diretamente:

```bash
curl http://localhost:3000/api/hello
```

Resposta esperada:

```json
{"message":"Hello, World!"}
```
