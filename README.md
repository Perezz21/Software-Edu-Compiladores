# Software Educacional para o Ensino de Compiladores

Aplicação web educacional para apoiar estudantes na compreensão das etapas iniciais de compilação.

## Objetivo da versão atual

Esta versão oferece uma interface para inserir, editar ou carregar pequenos trechos de código em C. Ao solicitar a análise, o frontend envia o conteúdo ao backend, que realiza validações iniciais e confirma o recebimento.

A análise léxica, sintática e semântica ainda **não** está implementada. Elas serão desenvolvidas nas próximas etapas.

## Linguagem analisada: C

A linguagem escolhida é **C**, por ser recorrente na formação em Computação e permitir relacionar exemplos de programação conhecidos a conceitos de compiladores.

### Subconjunto inicial

A primeira versão do analisador trabalhará apenas com:

- declarações de variáveis inteiras, como `int total;`;
- atribuições, como `total = 10;`;
- literais inteiros;
- operadores aritméticos `+`, `-`, `*` e `/`;
- parênteses e ponto e vírgula.

Estruturas condicionais, repetições, funções, vetores, ponteiros, análise semântica e geração de código ficam fora desta primeira versão.

## Tecnologias

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Testes: Vitest, Testing Library e Supertest
- Containers: Docker e Docker Compose

## Estrutura do projeto

```text
Software-Edu-Compiladores/
├── frontend/          # Interface, exemplos e testes de interface
├── backend/           # API, validações e testes dos endpoints
├── docs/              # Registro das execuções de teste
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

Para encerrar:

```bash
docker compose down
```

## Como usar a interface

1. Escreva ou cole um pequeno trecho do subconjunto de C no campo **Código-fonte em C**.
2. Opcionalmente, selecione um exemplo no campo **Exemplos em C**. O conteúdo pode ser editado depois de carregado.
3. Clique em **Solicitar análise**.
4. A área **Resultado** mostrará uma confirmação ou uma mensagem de validação.

### Exemplos disponíveis

| Exemplo | Construção demonstrada |
| --- | --- |
| Declaração e inicialização | `int numero = 10;` |
| Operação aritmética | `int resultado = 10 + 5;` |
| Expressão com parênteses | `int total = (10 + 5) * 2;` |

## Comunicação entre frontend e backend

Ao clicar no botão, o frontend envia uma requisição `POST` para:

```text
http://localhost:3000/api/analisar
```

Corpo da requisição:

```json
{ "codigo": "int numero = 10;" }
```

Resposta de sucesso:

```json
{
  "message": "Código recebido com sucesso. As análises léxica e sintática serão disponibilizadas nas próximas etapas.",
  "received": true,
  "codeLength": 16
}
```

O backend retorna HTTP 400 quando o campo `codigo` está ausente, não é texto ou contém somente espaços.

## Testes automatizados

Os testes cobrem os principais comportamentos implementados nesta etapa:

- elementos da interface;
- carregamento dos três exemplos;
- validação de entrada vazia;
- envio do código pelo frontend;
- falha de comunicação;
- endpoint de recebimento, entradas inválidas e regressão do endpoint `/api/hello`.

Execute os testes em terminais separados:

```bash
cd backend
npm install
npm test
```

```bash
cd frontend
npm install
npm test
```

Registre o resultado de cada execução em [docs/registro-testes.md](docs/registro-testes.md).

## Teste manual da API

Com os contêineres em execução, teste o endpoint diretamente:

```bash
curl -X POST http://localhost:3000/api/analisar \
  -H "Content-Type: application/json" \
  -d "{\"codigo\":\"int numero = 10;\"}"
```

## Limitações conhecidas

- O sistema ainda não executa programas em C.
- Não há análise léxica, sintática ou semântica nesta versão.
- Os exemplos representam somente o subconjunto inicial definido para o projeto.
