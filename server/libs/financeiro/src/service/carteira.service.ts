import { Injectable, BadRequestException, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Carteira } from "../model/carteira.entity";
import { TransacaoCarteira } from "../model/transacao-carteira.entity";
import { User } from "@ci/auth/models/user.entity";
import { Application } from "@ci/manager/model/application.entity";
import { ClientVersionCatalog } from "@ci/manager/model/client-version-catalog.entity";
import { execSync } from "child_process";

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

        // Avalia em segundo plano concessão de cortesia da ROLE DEVELOPER se saldo >= 50
        if (carteira.saldo >= 50 && userId && userId !== 'guest_user_demo') {
            this.verificarEConcederRoleDeveloper(userId).catch(err => {
                this.logger.warn(`Erro na verificação de cortesia DEVELOPER: ${err?.message}`);
            });
        }

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

        // Avalia promoção para ROLE DEVELOPER se novo saldo atingir o patamar de 50
        if (saldoPosterior >= 50 && userId && userId !== 'guest_user_demo') {
            this.verificarEConcederRoleDeveloper(userId).catch(err => {
                this.logger.warn(`Erro na verificação de cortesia DEVELOPER após depósito: ${err?.message}`);
            });
        }

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

    /**
     * Verifica se o e-mail do usuário possui registro de autoria no ecossistema:
     * 1. No catálogo de versões do cliente (ClientVersionCatalog.collaborators)
     * 2. Na lista de colaboradores de qualquer Application (Application.collaborators)
     * 3. No histórico de commits do repositório Git (git log na branch development / HEAD)
     */
    async verificarAutoriaEmail(email: string): Promise<boolean> {
        if (!email || !email.trim()) return false;
        const cleanEmail = email.trim().toLowerCase();

        // 1. Verifica no banco de dados se consta como colaborador em ClientVersionCatalog
        try {
            const versionRepo = this.carteiraRepo.manager.getRepository(ClientVersionCatalog);
            const catalogs = await versionRepo.find({ select: ['collaborators'] });
            for (const cat of catalogs) {
                if (cat.collaborators && Array.isArray(cat.collaborators)) {
                    if (cat.collaborators.some(c => c.toLowerCase().includes(cleanEmail))) {
                        return true;
                    }
                }
            }
        } catch (e) {
            this.logger.warn(`Erro ao verificar autoria em ClientVersionCatalog: ${e?.message}`);
        }

        // 2. Verifica no banco de dados se consta como colaborador em Application
        try {
            const appRepo = this.carteiraRepo.manager.getRepository(Application);
            const apps = await appRepo.find({ select: ['collaborators'] });
            for (const app of apps) {
                if (app.collaborators && Array.isArray(app.collaborators)) {
                    if (app.collaborators.some(c => c.toLowerCase().includes(cleanEmail))) {
                        return true;
                    }
                }
            }
        } catch (e) {
            this.logger.warn(`Erro ao verificar autoria em Application: ${e?.message}`);
        }

        // 3. Verifica diretamente no Git log (commits de autores e co-autores na branch development ou histórico local)
        try {
            const gitAuthors = execSync(`git log --format="%aE%x09%aN%x09%B" -n 500`, { encoding: 'utf-8', timeout: 5000 });
            if (gitAuthors && gitAuthors.toLowerCase().includes(cleanEmail)) {
                return true;
            }
        } catch (e) {
            this.logger.warn(`Erro ao verificar autoria no Git log: ${e?.message}`);
        }

        return false;
    }

    /**
     * Avalia e concede a ROLE 'DEVELOPER' como cortesia para o usuário caso cumpra os requisitos:
     * - E-mail verificado (emailVerificado === true)
     * - Saldo na carteira >= 50
     * - Autoria comprovada no projeto vinculada ao mesmo e-mail (via PR aceito para a branch de desenvolvimento)
     */
    async verificarEConcederRoleDeveloper(userId: string): Promise<{
        promovido: boolean;
        motivo: string;
        user?: { id: string; email: string; roles: string[]; emailVerificado: boolean };
        saldoAtual?: number;
    }> {
        if (!userId) {
            return { promovido: false, motivo: 'ID do usuário não fornecido.' };
        }

        const userRepo = this.carteiraRepo.manager.getRepository(User);
        const user = await userRepo.findOne({ where: { id: userId } });

        if (!user) {
            return { promovido: false, motivo: 'Usuário não encontrado.' };
        }

        if (!user.email) {
            return { promovido: false, motivo: 'Usuário não possui e-mail cadastrado.' };
        }

        const currentRoles = Array.isArray(user.roles) ? user.roles : (user.roles ? [user.roles] : ['USER']);

        if (currentRoles.includes('DEVELOPER')) {
            return {
                promovido: false,
                motivo: 'Usuário já possui a ROLE DEVELOPER.',
                user: { id: user.id, email: user.email, roles: currentRoles, emailVerificado: !!user.emailVerificado }
            };
        }

        if (!user.emailVerificado) {
            return {
                promovido: false,
                motivo: 'E-mail do usuário ainda não foi verificado.',
                user: { id: user.id, email: user.email, roles: currentRoles, emailVerificado: false }
            };
        }

        const carteira = await this.obterOuCriarCarteira(userId);
        const saldoAtual = Number(carteira.saldo) || 0;

        if (saldoAtual < 50) {
            return {
                promovido: false,
                motivo: `Saldo insuficiente (R$ ${saldoAtual.toFixed(2)}). É necessário alcançar ao menos 50 de saldo na plataforma.`,
                saldoAtual,
                user: { id: user.id, email: user.email, roles: currentRoles, emailVerificado: true }
            };
        }

        const temAutoria = await this.verificarAutoriaEmail(user.email);
        if (!temAutoria) {
            return {
                promovido: false,
                motivo: `Nenhuma autoria comprovada encontrada para o e-mail verificado (${user.email}). Faça um PR para a branch de desenvolvimento; uma vez aceito, a autoria será reconhecida.`,
                saldoAtual,
                user: { id: user.id, email: user.email, roles: currentRoles, emailVerificado: true }
            };
        }

        // Concede a ROLE DEVELOPER como cortesia
        const newRoles = Array.from(new Set([...currentRoles, 'DEVELOPER']));
        user.roles = newRoles;
        await userRepo.save(user);

        this.logger.log(
            `[CORTESIA DEVELOPER CONCEDIDA] Usuário ${user.email} (ID: ${user.id}) alcançou saldo de R$ ${saldoAtual.toFixed(2)} com autoria verificada e recebeu a ROLE DEVELOPER.`
        );

        return {
            promovido: true,
            motivo: 'Parabéns! Sua autoria no projeto e saldo alcançado de 50 conferem a você a ROLE DEVELOPER como cortesia da plataforma.',
            saldoAtual,
            user: { id: user.id, email: user.email, roles: newRoles, emailVerificado: true }
        };
    }
}
