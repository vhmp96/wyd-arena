# Trabalhos Futuros — Loki 7

## Fórmula Loki Power
A fórmula de conversão de Score Quest para Loki Power ainda não foi definida para o Loki 7.
No Loki 6 era: `LOKI POWER = SCORE POWER + SCORE QUEST × 200`
Quando confirmada, atualizar `calcLokiPower` em `apps/web/src/lib/lokiStorage.ts` e remover o aviso "fórmula Loki 6" na `LokiPage.tsx`.

## Fórmula Pedra Espiritual
A fórmula de Score Power para Pedra Espiritual (base fixa 1500) com Refinação > 0 ainda não foi verificada.
Valor atual usa `(base + tier × 100) × refinement` — confirmar se está correto.

## Marcos Loki 7
Os marcos usados são do Loki 6. Confirmar com a organização se os marcos mudaram para o Loki 7.

## Select de personagem
A planilha indicou dois sets de equipamento (dois personagens). Quando a feature for definida, adicionar suporte a múltiplos perfis no `LokiState` com seletor de personagem ativo.
