2. Lista de Operações do Módulo
O módulo de Vendas (Service/Controller) deve expor, no mínimo, as seguintes capacidades para ser funcional em um ambiente multi-negócios:

Gestão do Ciclo de Vida da Venda

createDraft(businessId, customerId): Iniciar uma nova venda/carrinho em estado DRAFT.

addItem(saleId, itemDto): Adicionar item, validando estoque (chamada síncrona ou assíncrona ao módulo de estoque) e calculando subtotais.

removeItem(saleId, itemId): Remover item e recalcular totais.

updateItemQuantity(saleId, itemId, quantity): Ajustar quantidades.

applyDiscount(saleId, discountDto): Aplicar desconto global ou por item (validando regras de negócio).

Checkout e Pagamento
6.  closeSale(saleId): "Fechar" o pedido, impedindo novas edições de itens e alterando status para PENDING.
7.  registerPayment(saleId, paymentDto): Registrar uma tentativa de pagamento. Deve suportar pagamentos parciais (split payment).
8.  processPaymentWebhook(payload): Receber confirmação assíncrona de gateways (Stripe, Pagar.me, etc.) e atualizar o status do pagamento e da venda.

Pós-Venda
9.  cancelSale(saleId, reason): Cancelar venda (dispara estorno de estoque e financeiro).
10. getSalesByBusiness(businessId, filters): Listagem com paginação e filtros (data, status, cliente).
11. getSaleDetails(saleId): Visão detalhada da venda com itens e histórico de pagamentos.

Integração (Internal)
12. emitInvoiceTrigger(saleId): Disparar evento para o módulo Fiscal (NFe) após confirmação de pagamento.