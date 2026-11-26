# Card (`ImplCard` e `ci-cards`)

[voltar](../readme.md) | [Especificação de Manutenção](./especificacao-manutencao.md#53-sistema-de-blocks-cards-e-dashboards-modulares)

Os cards são micro-componentes reutilizáveis que podem acessar as APIs da plataforma e exibir visualizações específicas em dashboards modulares (`BoardComponent`).

- **Registro de Metadados:** Os metadados de descoberta, categoria, ícones, tags e dimensões padrão dos cards são catalogados em `KNOWN_CARD_METADATA` no arquivo [`cards.registry.ts`](file:///c:/projetos/br.dev.ci.apps/apps/projects/ci/components/src/lib/board/cards.registry.ts) (`@ci/components`).
- **Exemplos de `ci-cards`:** O módulo `@ci-apps/Financeiro` modularizou o painel da Carteira Digital utilizando `ci-cards` dedicados (`CarteiraPatrimonioKpiCard`, `CarteiraGanhosKpiCard`, `CarteiraPerdasKpiCard`, `CarteiraResultadoLiquidoKpiCard`, `CarteiraEvolucaoTemporalCard`, `CarteiraAlocacaoLastroCard`, `CarteiraDesempenhoComparativoCard`).
- **Como criar novos blocos:** Consulte a seção [6.4. Criar um Novo Bloco Visual (`ImplCard`)](./especificacao-manutencao.md#64-criar-um-novo-bloco-visual-implcard).

