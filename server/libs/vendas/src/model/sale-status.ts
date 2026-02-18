export enum SaleStatus {
    DRAFT = 'DRAFT',        // Orçamento/Carrinho aberto
    PENDING = 'PENDING',    // Aguardando pagamento
    PAID = 'PAID',          // Pago
    CANCELED = 'CANCELED',  // Cancelado
    REFUNDED = 'REFUNDED',  // Estornado
}