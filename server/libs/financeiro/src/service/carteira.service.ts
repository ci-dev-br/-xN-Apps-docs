import { Injectable, BadRequestException, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Carteira } from "../model/carteira.entity";
import { TransacaoCarteira } from "../model/transacao-carteira.entity";

export interface DepositoDto {
    valor: number;
    identificador?: string;
    descricao?: string;
    metadados?: any;
}

export interface PagarFaturaDto {
    faturaId: string;
    valor: number;
    descricao?: string;
    metadados?: any;
}

@Injectable()
export class CarteiraService {
    private readonly logger = new Logger(CarteiraService.name);

    constructor(
        @InjectRepository(Carteira)
        private readonly carteiraRepo: Repository<Carteira>,
        @InjectRepository(TransacaoCarteira)
        private readonly transacaoRepo: Repository<TransacaoCarteira>,
    ) { }

    /**
     * Obtém ou inicializa a carteira digital do usuário
     */
    async obterOuCriarCarteira(userId: string): Promise<Carteira> {
        if (!userId) {
            throw new BadRequestException('ID do usuário é obrigatório.');
        }

        let carteira = await this.carteiraRepo.findOne({
            where: { userId },
            relations: ['transacoes'],
        });

        if (!carteira) {
            const numeroCarteira = `CI-WAL-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
            carteira = this.carteiraRepo.create({
                userId,
                numeroCarteira,
                saldo: 0.00,
                moeda: 'BRL',
                status: 'ATIVA',
            });
            carteira = await this.carteiraRepo.save(carteira);
            this.logger.log(`Nova carteira ${numeroCarteira} criada para o usuário ${userId}`);
        }

        return carteira;
    }

    /**
     * Retorna a carteira com o extrato recente de movimentações
     */
    async obterVisaoGeralCarteira(userId: string): Promise<{ carteira: Carteira; transacoesRecentes: TransacaoCarteira[] }> {
        const carteira = await this.obterOuCriarCarteira(userId);

        const transacoesRecentes = await this.transacaoRepo.find({
            where: { carteiraId: carteira.internalId },
            order: { createdAt: 'DESC' },
            take: 20,
        });

        // Converte saldo para número caso o TypeORM retorne como string numérica
        carteira.saldo = Number(carteira.saldo) || 0;

        return {
            carteira,
            transacoesRecentes,
        };
    }

    /**
     * Registra um depósito identificado na carteira (entrada de saldo)
     */
    async registrarDeposito(userId: string, dados: DepositoDto): Promise<{ carteira: Carteira; transacao: TransacaoCarteira }> {
        const valor = Number(dados.valor);
        if (isNaN(valor) || valor <= 0) {
            throw new BadRequestException('O valor do depósito deve ser maior que zero.');
        }

        const carteira = await this.obterOuCriarCarteira(userId);

        if (carteira.status !== 'ATIVA') {
            throw new BadRequestException(`Carteira ${carteira.status.toLowerCase()}. Não é possível receber depósitos.`);
        }

        const saldoAnterior = Number(carteira.saldo) || 0;
        const saldoPosterior = Number((saldoAnterior + valor).toFixed(2));

        const identificador = dados.identificador || `DEP-${Date.now().toString(36).toUpperCase()}`;

        const transacao = this.transacaoRepo.create({
            carteiraId: carteira.internalId,
            tipo: 'ENTRADA',
            categoria: 'DEPOSITO',
            valor,
            saldoAnterior,
            saldoPosterior,
            descricao: dados.descricao || `Depósito Identificado (${identificador})`,
            identificador,
            status: 'CONCLUIDA',
            metadados: dados.metadados,
        });

        const savedTransacao = await this.transacaoRepo.save(transacao);

        carteira.saldo = saldoPosterior;
        const savedCarteira = await this.carteiraRepo.save(carteira);

        this.logger.log(`Depósito de R$ ${valor} registrado na carteira ${carteira.numeroCarteira}. Novo saldo: R$ ${saldoPosterior}`);

        return {
            carteira: savedCarteira,
            transacao: savedTransacao,
        };
    }

    /**
     * Executa o pagamento de uma fatura utilizando o saldo disponível na carteira (saída de saldo)
     */
    async pagarFatura(userId: string, dados: PagarFaturaDto): Promise<{ carteira: Carteira; transacao: TransacaoCarteira }> {
        const valor = Number(dados.valor);
        if (isNaN(valor) || valor <= 0) {
            throw new BadRequestException('Valor da fatura inválido.');
        }
        if (!dados.faturaId || dados.faturaId.trim().length === 0) {
            throw new BadRequestException('Identificador da fatura é obrigatório.');
        }

        const carteira = await this.obterOuCriarCarteira(userId);

        if (carteira.status !== 'ATIVA') {
            throw new BadRequestException(`Carteira ${carteira.status.toLowerCase()}. Não é possível realizar pagamentos.`);
        }

        const saldoAnterior = Number(carteira.saldo) || 0;
        if (saldoAnterior < valor) {
            throw new BadRequestException(
                `Saldo insuficiente. Saldo atual: R$ ${saldoAnterior.toFixed(2)}, valor da fatura: R$ ${valor.toFixed(2)}.`
            );
        }

        const saldoPosterior = Number((saldoAnterior - valor).toFixed(2));

        const transacao = this.transacaoRepo.create({
            carteiraId: carteira.internalId,
            tipo: 'SAIDA',
            categoria: 'PAGAMENTO_FATURA',
            valor,
            saldoAnterior,
            saldoPosterior,
            descricao: dados.descricao || `Pagamento de Fatura #${dados.faturaId}`,
            referenciaFaturaId: dados.faturaId,
            identificador: `FAT-PAG-${dados.faturaId}`,
            status: 'CONCLUIDA',
            metadados: dados.metadados,
        });

        const savedTransacao = await this.transacaoRepo.save(transacao);

        carteira.saldo = saldoPosterior;
        const savedCarteira = await this.carteiraRepo.save(carteira);

        this.logger.log(`Fatura ${dados.faturaId} paga com sucesso (R$ ${valor}) via carteira ${carteira.numeroCarteira}`);

        return {
            carteira: savedCarteira,
            transacao: savedTransacao,
        };
    }

    /**
     * Lista o histórico completo de transações com filtros
     */
    async listarTransacoes(
        userId: string,
        filtros?: { tipo?: 'ENTRADA' | 'SAIDA'; categoria?: string; take?: number; skip?: number }
    ): Promise<{ transacoes: TransacaoCarteira[]; total: number }> {
        const carteira = await this.obterOuCriarCarteira(userId);

        const qb = this.transacaoRepo.createQueryBuilder('t')
            .where('t.carteiraId = :carteiraId', { carteiraId: carteira.internalId });

        if (filtros?.tipo) {
            qb.andWhere('t.tipo = :tipo', { tipo: filtros.tipo });
        }
        if (filtros?.categoria) {
            qb.andWhere('t.categoria = :categoria', { categoria: filtros.categoria });
        }

        qb.orderBy('t.createdAt', 'DESC')
            .take(filtros?.take || 50)
            .skip(filtros?.skip || 0);

        const [transacoes, total] = await qb.getManyAndCount();

        return { transacoes, total };
    }
}
