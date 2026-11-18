# Gramática do subconjunto de C

O símbolo inicial é `programa`. O parser é descendente recursivo, implementado manualmente em TypeScript.

## EBNF

```ebnf
programa       = { declaracao | comando } ;
declaracao     = "int", IDENTIFICADOR, [ "=", expressao ], ";" ;
comando        = bloco | atribuicao | condicional | repeticao | retorno ;
bloco          = "{", { declaracao | comando }, "}" ;
atribuicao     = IDENTIFICADOR, "=", expressao, ";" ;
condicional    = "if", "(", expressao, ")", comando, [ "else", comando ] ;
repeticao      = "while", "(", expressao, ")", comando ;
retorno        = "return", [ expressao ], ";" ;
expressao      = logica_ou ;
logica_ou      = logica_e, { "||", logica_e } ;
logica_e       = igualdade, { "&&", igualdade } ;
igualdade      = relacional, { ("==" | "!="), relacional } ;
relacional     = aditiva, { ("<" | ">" | "<=" | ">="), aditiva } ;
aditiva        = multiplicativa, { ("+" | "-"), multiplicativa } ;
multiplicativa = unaria, { ("*" | "/"), unaria } ;
unaria         = ("!" | "-"), unaria | primaria ;
primaria       = IDENTIFICADOR | LITERAL_INTEIRO | "(", expressao, ")" ;
```

## Terminais

Palavras reservadas: `int`, `if`, `else`, `while` e `return`. Identificadores e literais inteiros são fornecidos pelo scanner. Operadores: `+`, `-`, `*`, `/`, `=`, `>`, `<`, `!`, `==`, `!=`, `<=`, `>=`, `&&` e `||`. Delimitadores usados: parênteses, chaves e ponto e vírgula.

## Precedência

Da maior para a menor: operadores unários; multiplicação/divisão; adição/subtração; relacionais; igualdade; AND lógico; OR lógico. Operadores binários de cada nível são associativos à esquerda. Parênteses alteram o agrupamento.

## Limites do subconjunto

Não são contemplados tipos diferentes de `int`, literais reais, strings, caracteres, declarações e chamadas de função, parâmetros, `for`, vetores, ponteiros, atribuições compostas ou pré-processador. A análise semântica não integra esta etapa.

## Exemplos para validação

Válido: `int resultado = 10 + 5 * 2;`

Válido: `if (resultado >= 20) { resultado = resultado - 1; } else { return; }`

Inválido: `int numero = 10` (ponto e vírgula ausente).

Inválido: `if (numero > 0 { return; }` (parêntese de fechamento ausente).

## Decisão sobre erros léxicos

O parser só é executado quando o scanner não registra erros léxicos. Nesse caso, tokens e erros léxicos são retornados separadamente, e o backend informa que a etapa sintática não foi executada. O parser retorna o primeiro erro sintático localizado; não há recuperação para continuar a análise após o erro.
