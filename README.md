# plano-semana

Barra fixa acima do prompt do Claude Code com o uso semanal do plano.

- 5 partes, uma por dia, cada uma vale 20% do plano da semana (preenchimento contínuo).
- A marca `┃` mostra onde você deveria estar agora (o consumo esperado cresce 20% por dia, de forma contínua, dentro da janela de 7 dias que termina no reinício do plano).
- **Azul**: dentro do ritmo diário. **Amarelo**: acima.
- Sem dados ainda, a barra aparece vazia ("aguardando dados do plano"). Só funciona em contas cujo limite de uso é informado pela sessão (assinatura).

## Instalar

No prompt de uma sessão de terminal:

```
/plugin install plano-semana --marketplace Gajardo78/plano-semana
```

Responda `y` para adicionar o marketplace e escolha o escopo (user, para valer em todas as sessões).

## Ajustar

O número de dias está em `hooks/barra.ts` (`DIAS = 5`). Troque por 7 para dividir a semana em 7 partes.

## Testes

```
claude plugin test .
```
