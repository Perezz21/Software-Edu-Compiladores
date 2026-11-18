# Fluxograma da análise do código-fonte

O fluxograma representa o comportamento implementado nesta etapa. A análise semântica e a tabela de símbolos aparecem como atividades futuras, não executadas.

```mermaid
flowchart TD
    A[Entrada do código-fonte na interface] --> B[POST /api/analisar]
    B --> C[Validação da entrada]
    C -->|Vazia ou inválida| D[HTTP 400 e mensagem]
    C -->|Válida| E[Scanner: análise léxica]
    E --> F{Há erros léxicos?}
    F -->|Sim| G[Retorna tokens e erros léxicos]
    G --> H[Não executa o parser]
    F -->|Não| I[Parser descendente recursivo]
    I --> J{Estrutura conforme a gramática?}
    J -->|Não| K[Retorna erro sintático com posição]
    J -->|Sim| L[Constrói AST]
    L --> M[Retorna tokens e AST]
    H --> N[Interface apresenta diagnóstico]
    K --> N
    M --> O[Interface apresenta tokens e árvore AST]
    N --> P[Etapa 5: análise semântica - futura]
    O --> P
    P -.-> Q[Tabela de símbolos e erros semânticos - futuros]
```

## Estado das etapas

| Componente | Estado nesta versão |
| --- | --- |
| Entrada e validação | Implementado |
| Análise léxica | Implementado |
| Decisão de bloquear parser diante de erros léxicos | Implementado |
| Análise sintática | Implementado |
| Construção da AST | Implementado |
| Apresentação da AST na interface | Implementado |
| Análise semântica | Pendente — próxima etapa |
| Tabela de símbolos | Pendente — próxima etapa |

## Contrato resumido entre frontend e backend

A interface envia `POST /api/analisar` com `{ "codigo": "..." }`. O backend retorna `sucesso`, `message`, `tokens`, `erros`, `lexico` e `sintatico`. Os erros léxicos ficam em `erros`; os sintáticos em `sintatico.erros`. O campo `sintatico.executada` informa se o parser foi chamado. Quando executado com sucesso, `sintatico.ast` contém a árvore; diante de erro sintático, a AST é nula.
