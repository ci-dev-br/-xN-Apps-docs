import { Injectable, BadRequestException, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Carteira } from "../model/carteira.entity";
import { TransacaoCarteira } from "../model/transacao-carteira.entity";
import { User } from "@ci/auth/models/user.entity";
import { Application } from "@ci/manager/model/application.entity";
import { ClientVersionCatalog } from "@ci/manager/model/client-version-catalog.entity";
import { execSync } from "child_process";

export interface DepositoDto {
    carteiraId?: string;
    valor: number;
    identificador?: string;
    descricao?: string;
    metadados?: any;
}

export interface PagarFaturaDto {
    carteiraId?: string;
    faturaId: string;
    valor: number;
    descricao?: string;
    metadados?: any;
}

export interface CriarCarteiraPayload {
    nome?: string;
    descricao?: string;
    tipoLastro?: 'MOEDA_REAL' | 'PARAMETRIZADA';
    moeda?: string;
    simboloMoeda?: string;
    nomeMoeda?: string;
    fatorConversaoBrl?: number;
    saldoInicial?: number;
    limiteDiario?: number;
    principal?: boolean;
    corTema?: string;
    parametrosLastro?: {
        indexador?: string;
        casasDecimais?: number;
        permiteSaldoNegativo?: boolean;
        emissor?: string;
        observacoesLastro?: string;
        metaPosicao?: number;
    };
}

export interface LancamentoPosicaoDto {
    carteiraId?: string;
    modo: 'MOVIMENTACAO' | 'DEFINIR_POSICAO';
    tipo?: 'ENTRADA' | 'SAIDA';
    valor?: number;
    novaPosicao?: number;
    novaCotacaoBrl?: number;
    novaMetaPosicao?: number;
    categoria?: 'DEPOSITO' | 'PAGAMENTO_FATURA' | 'TRANSFERENCIA' | 'ESTORNO' | 'AJUSTE_POSICAO' | 'RENDIMENTO' | 'APORTE' | 'RETIRADA' | 'VALORIZACAO' | 'OUTROS';
    identificador?: string;
    descricao?: string;
    metadados?: any;
}

export type PeriodoDashboardCarteira = '7D' | '30D' | '90D' | '12M' | 'TUDO';

export interface PontoSerieTemporalCarteiraDto {
    indice: number;
    dataIso: string;
    rotulo: string;
    descricaoEvento: string;
    patrimonioBrl: number;
    ganhosBrl: number;
    perdasBrl: number;
    resultadoLiquidoBrl: number;
    ganhoAcumuladoBrl: number;
    variacaoPercentualAcumulada: number;
}

export interface DesempenhoCarteiraItemDto {
    carteiraId: string;
    nome: string;
    numeroCarteira: string;
    moeda: string;
    simboloMoeda: string;
    nomeMoeda: string;
    tipoLastro: 'MOEDA_REAL' | 'PARAMETRIZADA';
    corTema: string;
    principal: boolean;
    saldoAtual: number;
    fatorConversaoBrl: number;
    saldoAtualBrl: number;
    participacaoPercentual: number;
    ganhosPeriodoMoeda: number;
    perdasPeriodoMoeda: number;
    resultadoLiquidoMoeda: number;
    ganhosPeriodoBrl: number;
    perdasPeriodoBrl: number;
    resultadoLiquidoBrl: number;
    rentabilidadePercentual: number;
    metaPosicao: number | null;
    progressoMetaPercentual: number | null;
    totalTransacoes: number;
}

export interface ResumoDashboardCarteiraDto {
    patrimonioTotalBrl: number;
    patrimonioMoedaRealBrl: number;
    patrimonioParametrizadoBrl: number;
    percentualMoedaReal: number;
    percentualParametrizado: number;
    ganhosTotaisPeriodoBrl: number;
    perdasTotaisPeriodoBrl: number;
    resultadoLiquidoPeriodoBrl: number;
    variacaoPercentualPeriodo: number;
    ganhosRendimentosValorizacaoBrl: number;
    aportesDepositosBrl: number;
    retiradasPagamentosBrl: number;
    totalMovimentacoesPeriodo: number;
    eventosPositivos: number;
    eventosNegativos: number;
    melhorCarteira: {
        carteiraId: string;
        nome: string;
        moeda: string;
        simboloMoeda: string;
        resultadoLiquidoBrl: number;
        rentabilidadePercentual: number;
    } | null;
}

export interface DashboardCarteirasDto {
    periodo: PeriodoDashboardCarteira;
    escopoCarteiraId: string | 'TODAS';
    resumo: ResumoDashboardCarteiraDto;
    desempenhoCarteiras: DesempenhoCarteiraItemDto[];
    serieTemporal: PontoSerieTemporalCarteiraDto[];
}

const MOEDAS_REAIS_PADRAO: Record<string, { simbolo: string; nome: string; fatorBrl: number; corTema: string }> = {
    BRL: { simbolo: 'R$', nome: 'Real Brasileiro', fatorBrl: 1.0, corTema: 'indigo' },
    USD: { simbolo: 'US$', nome: 'Dólar Americano', fatorBrl: 5.80, corTema: 'emerald' },
    EUR: { simbolo: '€', nome: 'Euro', fatorBrl: 6.15, corTema: 'blue' },
    GBP: { simbolo: '£', nome: 'Libra Esterlina', fatorBrl: 7.35, corTema: 'purple' },
    BTC: { simbolo: '₿', nome: 'Bitcoin', fatorBrl: 520000.0, corTema: 'amber' },
};

@Injectable()
export class CarteiraService {
    private readonly logger = new Logger(CarteiraService.name);

    constructor(
        @InjectRepository(Carteira)
        private readonly carteiraRepo: Repository<Carteira>,
        @InjectRepository(TransacaoCarteira)
        private readonly transacaoRepo: Repository<TransacaoCarteira>,
    ) { }

    private resolverMetadadosMoeda(dados?: CriarCarteiraPayload) {
        const codigoMoeda = (dados?.moeda || 'BRL').trim().toUpperCase();
        const padrao = MOEDAS_REAIS_PADRAO[codigoMoeda];
        const tipoLastro: 'MOEDA_REAL' | 'PARAMETRIZADA' =
            dados?.tipoLastro || (padrao ? 'MOEDA_REAL' : 'PARAMETRIZADA');

        const simboloMoeda = dados?.simboloMoeda?.trim() || padrao?.simbolo || codigoMoeda;
        const nomeMoeda = dados?.nomeMoeda?.trim() || padrao?.nome || (tipoLastro === 'PARAMETRIZADA' ? `Ativo Parametrizado (${codigoMoeda})` : codigoMoeda);
        const fatorConversaoBrl = dados?.fatorConversaoBrl !== undefined && dados?.fatorConversaoBrl !== null && Number(dados.fatorConversaoBrl) > 0
            ? Number(dados.fatorConversaoBrl)
            : (padrao?.fatorBrl ?? 1.0);
        const corTema = dados?.corTema || padrao?.corTema || (tipoLastro === 'PARAMETRIZADA' ? 'violet' : 'indigo');

        return {
            moeda: codigoMoeda,
            tipoLastro,
            simboloMoeda,
            nomeMoeda,
            fatorConversaoBrl,
            corTema,
        };
    }

    private normalizarCarteira(carteira: Carteira): Carteira {
        if (!carteira) return carteira;
        const meta = this.resolverMetadadosMoeda({
            moeda: carteira.moeda,
            tipoLastro: carteira.tipoLastro,
            simboloMoeda: carteira.simboloMoeda,
            nomeMoeda: carteira.nomeMoeda,
            fatorConversaoBrl: carteira.fatorConversaoBrl,
            corTema: carteira.corTema,
        });
        carteira.saldo = Number(carteira.saldo) || 0;
        carteira.tipoLastro = carteira.tipoLastro || meta.tipoLastro;
        carteira.simboloMoeda = carteira.simboloMoeda || meta.simboloMoeda;
        carteira.nomeMoeda = carteira.nomeMoeda || meta.nomeMoeda;
        carteira.fatorConversaoBrl = Number(carteira.fatorConversaoBrl) > 0 ? Number(carteira.fatorConversaoBrl) : meta.fatorConversaoBrl;
        carteira.corTema = carteira.corTema || meta.corTema;
        carteira.nome = carteira.nome || `Carteira ${carteira.moeda}`;
        if (carteira.limiteDiario !== undefined && carteira.limiteDiario !== null) {
            carteira.limiteDiario = Number(carteira.limiteDiario) || 0;
        }
        return carteira;
    }

    /**
     * Lista todas as carteiras ativas/existentes do usuário
     */
    async listarCarteirasUsuario(userId: string): Promise<Carteira[]> {
        if (!userId) {
            throw new BadRequestException('ID do usuário é obrigatório.');
        }

        const carteiras = await this.carteiraRepo.find({
            where: { userId },
            order: { createdAt: 'ASC' },
        });

        const normalizadas = carteiras
            .filter(c => !c.deleted)
            .map(c => this.normalizarCarteira(c));

        normalizadas.sort((a, b) => {
            if (a.principal && !b.principal) return -1;
            if (!a.principal && b.principal) return 1;
            return 0;
        });

        return normalizadas;
    }

    /**
     * Obtém uma carteira existente do usuário (específica por ID ou a principal) sem criá-la automaticamente
     */
    async obterCarteiraExistente(userId: string, carteiraId?: string): Promise<Carteira | null> {
        const carteiras = await this.listarCarteirasUsuario(userId);
        if (carteiras.length === 0) return null;

        if (carteiraId) {
            const encontrada = carteiras.find(c => c.internalId === carteiraId || c.numeroCarteira === carteiraId);
            if (encontrada) return encontrada;
        }

        return carteiras.find(c => c.principal) || carteiras[0];
    }

    /**
     * Cria explicitamente uma nova carteira digital (permitindo múltiplas carteiras por usuário com lastro real ou parametrizado)
     */
    async criarCarteira(
        userId: string,
        dados?: CriarCarteiraPayload
    ): Promise<{ possuiCarteira: boolean; carteira: Carteira; carteiras: Carteira[]; criada: boolean }> {
        if (!userId) {
            throw new BadRequestException('ID do usuário é obrigatório.');
        }

        const carteirasExistentes = await this.listarCarteirasUsuario(userId);
        const ehPrimeira = carteirasExistentes.length === 0;
        const definirComoPrincipal = ehPrimeira || !!dados?.principal;

        if (definirComoPrincipal && carteirasExistentes.length > 0) {
            for (const c of carteirasExistentes) {
                if (c.principal) {
                    c.principal = false;
                    await this.carteiraRepo.save(c);
                }
            }
        }

        const meta = this.resolverMetadadosMoeda(dados);
        const prefixoMoeda = meta.moeda.replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'WAL';
        const numeroCarteira = `CI-${prefixoMoeda}-${Date.now().toString(36).toUpperCase().slice(-5)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const nomePadrao = dados?.nome?.trim() || (ehPrimeira ? `Carteira Principal (${meta.moeda})` : `Carteira ${meta.nomeMoeda}`);
        const saldoInicial = dados?.saldoInicial !== undefined && dados?.saldoInicial !== null && !isNaN(Number(dados.saldoInicial))
            ? Number(Number(dados.saldoInicial).toFixed(4))
            : 0;

        let carteira = this.carteiraRepo.create({
            userId,
            nome: nomePadrao,
            descricao: dados?.descricao?.trim() || undefined,
            numeroCarteira,
            saldo: saldoInicial,
            tipoLastro: meta.tipoLastro,
            moeda: meta.moeda,
            simboloMoeda: meta.simboloMoeda,
            nomeMoeda: meta.nomeMoeda,
            fatorConversaoBrl: meta.fatorConversaoBrl,
            parametrosLastro: dados?.parametrosLastro || {
                indexador: meta.tipoLastro === 'PARAMETRIZADA' ? 'PARAMETRIZADO' : 'CAMBIO_OFICIAL',
                casasDecimais: 2,
                permiteSaldoNegativo: false,
            },
            principal: definirComoPrincipal,
            corTema: meta.corTema,
            status: 'ATIVA',
            limiteDiario: dados?.limiteDiario || 10000.00,
        });

        carteira = await this.carteiraRepo.save(carteira);
        carteira = this.normalizarCarteira(carteira);

        if (saldoInicial !== 0) {
            const txInicial = this.transacaoRepo.create({
                carteiraId: carteira.internalId,
                tipo: saldoInicial >= 0 ? 'ENTRADA' : 'SAIDA',
                categoria: 'AJUSTE_POSICAO',
                valor: Math.abs(saldoInicial),
                saldoAnterior: 0,
                saldoPosterior: saldoInicial,
                descricao: `Posição inicial na abertura da carteira (${meta.simboloMoeda} ${saldoInicial})`,
                identificador: `INI-${Date.now().toString(36).toUpperCase()}`,
                status: 'CONCLUIDA',
                metadados: { aberturaCarteira: true, tipoLastro: meta.tipoLastro, moeda: meta.moeda },
            });
            await this.transacaoRepo.save(txInicial);
        }

        this.logger.log(`Nova carteira ${numeroCarteira} (${meta.moeda} / ${meta.tipoLastro}) criada para o usuário ${userId}`);
        const todasCarteiras = await this.listarCarteirasUsuario(userId);

        return { possuiCarteira: true, carteira, carteiras: todasCarteiras, criada: true };
    }

    /**
     * Obtém ou inicializa a carteira digital do usuário
     */
    async obterOuCriarCarteira(userId: string, carteiraId?: string): Promise<Carteira> {
        if (!userId) {
            throw new BadRequestException('ID do usuário é obrigatório.');
        }

        const existente = await this.obterCarteiraExistente(userId, carteiraId);
        if (existente) {
            return existente;
        }

        const criada = await this.criarCarteira(userId, { moeda: 'BRL', tipoLastro: 'MOEDA_REAL' });
        return criada.carteira;
    }

    private calcularPatrimonioTotalBrl(carteiras: Carteira[]): number {
        const soma = carteiras.reduce((acc, c) => {
            const saldo = Number(c.saldo) || 0;
            const fator = Number(c.fatorConversaoBrl) > 0 ? Number(c.fatorConversaoBrl) : 1;
            return acc + (saldo * fator);
        }, 0);
        return Number(soma.toFixed(2));
    }

    /**
     * Calcula o Dashboard Consolidado de Ganhos, Perdas, Alocação e Série Temporal das Carteiras
     */
    async obterDashboardCarteiras(
        userId: string,
        opcoes?: { periodo?: PeriodoDashboardCarteira; carteiraId?: string }
    ): Promise<DashboardCarteirasDto> {
        const periodo: PeriodoDashboardCarteira = opcoes?.periodo || '30D';
        const escopoCarteiraId = opcoes?.carteiraId && opcoes.carteiraId !== 'TODAS' ? opcoes.carteiraId : 'TODAS';

        const todasCarteiras = await this.listarCarteirasUsuario(userId);
        const carteirasEscopo = escopoCarteiraId === 'TODAS'
            ? todasCarteiras
            : todasCarteiras.filter(c => c.internalId === escopoCarteiraId || c.numeroCarteira === escopoCarteiraId);

        const carteirasConsideradas = carteirasEscopo.length > 0 ? carteirasEscopo : todasCarteiras;

        if (carteirasConsideradas.length === 0) {
            return {
                periodo,
                escopoCarteiraId,
                resumo: {
                    patrimonioTotalBrl: 0,
                    patrimonioMoedaRealBrl: 0,
                    patrimonioParametrizadoBrl: 0,
                    percentualMoedaReal: 0,
                    percentualParametrizado: 0,
                    ganhosTotaisPeriodoBrl: 0,
                    perdasTotaisPeriodoBrl: 0,
                    resultadoLiquidoPeriodoBrl: 0,
                    variacaoPercentualPeriodo: 0,
                    ganhosRendimentosValorizacaoBrl: 0,
                    aportesDepositosBrl: 0,
                    retiradasPagamentosBrl: 0,
                    totalMovimentacoesPeriodo: 0,
                    eventosPositivos: 0,
                    eventosNegativos: 0,
                    melhorCarteira: null,
                },
                desempenhoCarteiras: [],
                serieTemporal: [],
            };
        }

        const idsCarteiras = todasCarteiras.map(c => c.internalId);
        const todasTransacoes = idsCarteiras.length > 0
            ? await this.transacaoRepo.find({
                where: { carteiraId: In(idsCarteiras) },
                order: { createdAt: 'ASC' },
            })
            : [];

        const mapaCarteira = new Map<string, Carteira>();
        for (const c of todasCarteiras) {
            mapaCarteira.set(c.internalId, c);
        }

        const agora = new Date();
        const inicioPeriodo = new Date(agora);
        if (periodo === '7D') {
            inicioPeriodo.setDate(agora.getDate() - 7);
        } else if (periodo === '30D') {
            inicioPeriodo.setDate(agora.getDate() - 30);
        } else if (periodo === '90D') {
            inicioPeriodo.setDate(agora.getDate() - 90);
        } else if (periodo === '12M') {
            inicioPeriodo.setFullYear(agora.getFullYear() - 1);
        } else {
            inicioPeriodo.setFullYear(2020, 0, 1);
        }

        const patrimonioTotalGeralBrl = this.calcularPatrimonioTotalBrl(todasCarteiras);
        const patrimonioEscopoBrl = this.calcularPatrimonioTotalBrl(carteirasConsideradas);

        let patrimonioMoedaRealBrl = 0;
        let patrimonioParametrizadoBrl = 0;
        for (const c of todasCarteiras) {
            const valBrl = (Number(c.saldo) || 0) * (Number(c.fatorConversaoBrl) > 0 ? Number(c.fatorConversaoBrl) : 1);
            if (c.tipoLastro === 'PARAMETRIZADA') {
                patrimonioParametrizadoBrl += valBrl;
            } else {
                patrimonioMoedaRealBrl += valBrl;
            }
        }
        patrimonioMoedaRealBrl = Number(patrimonioMoedaRealBrl.toFixed(2));
        patrimonioParametrizadoBrl = Number(patrimonioParametrizadoBrl.toFixed(2));

        const percentualMoedaReal = patrimonioTotalGeralBrl > 0
            ? Number(((patrimonioMoedaRealBrl / patrimonioTotalGeralBrl) * 100).toFixed(1))
            : 0;
        const percentualParametrizado = patrimonioTotalGeralBrl > 0
            ? Number((100 - percentualMoedaReal).toFixed(1))
            : 0;

        // Desempenho individual por carteira
        const desempenhoCarteiras: DesempenhoCarteiraItemDto[] = [];
        let ganhosTotaisPeriodoBrl = 0;
        let perdasTotaisPeriodoBrl = 0;
        let ganhosRendimentosValorizacaoBrl = 0;
        let aportesDepositosBrl = 0;
        let retiradasPagamentosBrl = 0;
        let totalMovimentacoesPeriodo = 0;
        let eventosPositivos = 0;
        let eventosNegativos = 0;

        for (const c of todasCarteiras) {
            const fatorAtual = Number(c.fatorConversaoBrl) > 0 ? Number(c.fatorConversaoBrl) : 1;
            const saldoAtual = Number(c.saldo) || 0;
            const saldoAtualBrl = Number((saldoAtual * fatorAtual).toFixed(2));
            const participacaoPercentual = patrimonioTotalGeralBrl > 0
                ? Number(((saldoAtualBrl / patrimonioTotalGeralBrl) * 100).toFixed(1))
                : 0;

            const txsCarteira = todasTransacoes.filter(t => t.carteiraId === c.internalId);
            const txsPeriodo = txsCarteira.filter(t => !t.createdAt || new Date(t.createdAt) >= inicioPeriodo);

            let ganhosMoeda = 0;
            let perdasMoeda = 0;
            let ganhosBrl = 0;
            let perdasBrl = 0;

            for (const tx of txsPeriodo) {
                const valorTx = Math.abs(Number(tx.valor) || 0);
                const fatorTx = Number(tx.metadados?.fatorConversaoBrl) > 0
                    ? Number(tx.metadados.fatorConversaoBrl)
                    : fatorAtual;
                const valorBrl = valorTx * fatorTx;

                if (tx.tipo === 'ENTRADA') {
                    ganhosMoeda += valorTx;
                    ganhosBrl += valorBrl;
                } else {
                    perdasMoeda += valorTx;
                    perdasBrl += valorBrl;
                }

                // Contabiliza nos totais do escopo se esta carteira faz parte do escopo
                if (escopoCarteiraId === 'TODAS' || c.internalId === escopoCarteiraId) {
                    totalMovimentacoesPeriodo++;
                    if (tx.tipo === 'ENTRADA') {
                        if (valorTx > 0) eventosPositivos++;
                        ganhosTotaisPeriodoBrl += valorBrl;
                        if (tx.categoria === 'RENDIMENTO' || tx.categoria === 'VALORIZACAO' || tx.categoria === 'AJUSTE_POSICAO') {
                            ganhosRendimentosValorizacaoBrl += valorBrl;
                        } else {
                            aportesDepositosBrl += valorBrl;
                        }
                    } else {
                        if (valorTx > 0) eventosNegativos++;
                        perdasTotaisPeriodoBrl += valorBrl;
                        retiradasPagamentosBrl += valorBrl;
                    }
                }
            }

            // Se a carteira possui saldo positivo mas não teve transação gravada (ex.: criada antes do log de tx inicial)
            if (txsCarteira.length === 0 && saldoAtual > 0) {
                ganhosMoeda = saldoAtual;
                ganhosBrl = saldoAtualBrl;
                if (escopoCarteiraId === 'TODAS' || c.internalId === escopoCarteiraId) {
                    ganhosTotaisPeriodoBrl += saldoAtualBrl;
                    ganhosRendimentosValorizacaoBrl += saldoAtualBrl;
                    eventosPositivos++;
                    totalMovimentacoesPeriodo++;
                }
            }

            const resultadoLiquidoMoeda = Number((ganhosMoeda - perdasMoeda).toFixed(4));
            const resultadoLiquidoBrl = Number((ganhosBrl - perdasBrl).toFixed(2));
            const baseReferencia = ganhosMoeda > 0 ? ganhosMoeda : (saldoAtual > 0 ? saldoAtual : 1);
            const rentabilidadePercentual = (ganhosMoeda > 0 || perdasMoeda > 0)
                ? Number((((ganhosMoeda - perdasMoeda) / baseReferencia) * 100).toFixed(2))
                : 0;

            const metaPosicao = c.parametrosLastro?.metaPosicao ? Number(c.parametrosLastro.metaPosicao) : null;
            const progressoMetaPercentual = metaPosicao && metaPosicao > 0
                ? Math.min(100, Math.max(0, Number(((saldoAtual / metaPosicao) * 100).toFixed(1))))
                : null;

            desempenhoCarteiras.push({
                carteiraId: c.internalId,
                nome: c.nome || `Carteira ${c.moeda}`,
                numeroCarteira: c.numeroCarteira,
                moeda: c.moeda,
                simboloMoeda: c.simboloMoeda || c.moeda,
                nomeMoeda: c.nomeMoeda || c.moeda,
                tipoLastro: c.tipoLastro || 'MOEDA_REAL',
                corTema: c.corTema || 'indigo',
                principal: !!c.principal,
                saldoAtual: Number(saldoAtual.toFixed(4)),
                fatorConversaoBrl: fatorAtual,
                saldoAtualBrl,
                participacaoPercentual,
                ganhosPeriodoMoeda: Number(ganhosMoeda.toFixed(4)),
                perdasPeriodoMoeda: Number(perdasMoeda.toFixed(4)),
                resultadoLiquidoMoeda,
                ganhosPeriodoBrl: Number(ganhosBrl.toFixed(2)),
                perdasPeriodoBrl: Number(perdasBrl.toFixed(2)),
                resultadoLiquidoBrl,
                rentabilidadePercentual,
                metaPosicao,
                progressoMetaPercentual,
                totalTransacoes: txsCarteira.length,
            });
        }

        ganhosTotaisPeriodoBrl = Number(ganhosTotaisPeriodoBrl.toFixed(2));
        perdasTotaisPeriodoBrl = Number(perdasTotaisPeriodoBrl.toFixed(2));
        const resultadoLiquidoPeriodoBrl = Number((ganhosTotaisPeriodoBrl - perdasTotaisPeriodoBrl).toFixed(2));
        const baseTotalRef = ganhosTotaisPeriodoBrl > 0 ? ganhosTotaisPeriodoBrl : (patrimonioEscopoBrl > 0 ? patrimonioEscopoBrl : 1);
        const variacaoPercentualPeriodo = (ganhosTotaisPeriodoBrl > 0 || perdasTotaisPeriodoBrl > 0)
            ? Number(((resultadoLiquidoPeriodoBrl / baseTotalRef) * 100).toFixed(2))
            : 0;

        const ordenadasPorResultado = [...desempenhoCarteiras].sort((a, b) => b.resultadoLiquidoBrl - a.resultadoLiquidoBrl);
        const melhor = ordenadasPorResultado[0] || null;

        // Construção da Série Temporal de Evolução Patrimonial e Ganhos/Perdas
        const idsEscopoSet = new Set(carteirasConsideradas.map(c => c.internalId));
        const txsEscopo = todasTransacoes.filter(t => idsEscopoSet.has(t.carteiraId));

        const serieTemporal: PontoSerieTemporalCarteiraDto[] = [];
        let acumuladoPatrimonio = 0;
        let ganhoAcumulado = 0;

        // Ponto Zero (Abertura / Início do Período)
        const dataZero = txsEscopo[0]?.createdAt
            ? new Date(new Date(txsEscopo[0].createdAt).getTime() - 3600 * 1000)
            : new Date(agora.getTime() - 7 * 86400 * 1000);

        serieTemporal.push({
            indice: 0,
            dataIso: dataZero.toISOString(),
            rotulo: 'Início',
            descricaoEvento: 'Posição Inicial do Período',
            patrimonioBrl: 0,
            ganhosBrl: 0,
            perdasBrl: 0,
            resultadoLiquidoBrl: 0,
            ganhoAcumuladoBrl: 0,
            variacaoPercentualAcumulada: 0,
        });

        // Se houver transações, cria os marcos cronológicos de evolução
        for (const tx of txsEscopo) {
            const c = mapaCarteira.get(tx.carteiraId);
            if (!c) continue;
            const fator = Number(tx.metadados?.fatorConversaoBrl) > 0
                ? Number(tx.metadados.fatorConversaoBrl)
                : (Number(c.fatorConversaoBrl) > 0 ? Number(c.fatorConversaoBrl) : 1);
            const valorBrl = Number(((Math.abs(Number(tx.valor) || 0)) * fator).toFixed(2));
            const ehEntrada = tx.tipo === 'ENTRADA';
            const ganhoPonto = ehEntrada ? valorBrl : 0;
            const perdaPonto = !ehEntrada ? valorBrl : 0;
            const liquidoPonto = Number((ganhoPonto - perdaPonto).toFixed(2));

            acumuladoPatrimonio = Number(Math.max(0, acumuladoPatrimonio + liquidoPonto).toFixed(2));
            ganhoAcumulado = Number((ganhoAcumulado + liquidoPonto).toFixed(2));

            const dt = tx.createdAt ? new Date(tx.createdAt) : agora;
            const diaMes = `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
            const horaMin = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;

            serieTemporal.push({
                indice: serieTemporal.length,
                dataIso: dt.toISOString(),
                rotulo: `${diaMes} ${horaMin}`,
                descricaoEvento: `${c.nome}: ${tx.descricao || tx.categoria} (${c.simboloMoeda} ${Number(tx.valor).toFixed(2)})`,
                patrimonioBrl: acumuladoPatrimonio,
                ganhosBrl: ganhoPonto,
                perdasBrl: perdaPonto,
                resultadoLiquidoBrl: liquidoPonto,
                ganhoAcumuladoBrl: ganhoAcumulado,
                variacaoPercentualAcumulada: patrimonioEscopoBrl > 0
                    ? Number(((acumuladoPatrimonio / patrimonioEscopoBrl) * 100).toFixed(1))
                    : 100,
            });
        }

        // Garante que o ponto final reflita exatamente o patrimônio consolidado atual das carteiras
        if (Math.abs(acumuladoPatrimonio - patrimonioEscopoBrl) > 0.01 || serieTemporal.length === 1) {
            const ajusteFinal = Number((patrimonioEscopoBrl - acumuladoPatrimonio).toFixed(2));
            const ganhoFinal = ajusteFinal > 0 ? ajusteFinal : 0;
            const perdaFinal = ajusteFinal < 0 ? Math.abs(ajusteFinal) : 0;
            ganhoAcumulado = Number((ganhoAcumulado + ajusteFinal).toFixed(2));

            serieTemporal.push({
                indice: serieTemporal.length,
                dataIso: agora.toISOString(),
                rotulo: 'Posição Atual',
                descricaoEvento: 'Posição Consolidada Atual das Carteiras',
                patrimonioBrl: patrimonioEscopoBrl,
                ganhosBrl: ganhoFinal,
                perdasBrl: perdaFinal,
                resultadoLiquidoBrl: ajusteFinal,
                ganhoAcumuladoBrl: ganhoAcumulado,
                variacaoPercentualAcumulada: variacaoPercentualPeriodo,
            });
        }

        return {
            periodo,
            escopoCarteiraId,
            resumo: {
                patrimonioTotalBrl: patrimonioEscopoBrl,
                patrimonioMoedaRealBrl,
                patrimonioParametrizadoBrl,
                percentualMoedaReal,
                percentualParametrizado,
                ganhosTotaisPeriodoBrl,
                perdasTotaisPeriodoBrl,
                resultadoLiquidoPeriodoBrl,
                variacaoPercentualPeriodo,
                ganhosRendimentosValorizacaoBrl: Number(ganhosRendimentosValorizacaoBrl.toFixed(2)),
                aportesDepositosBrl: Number(aportesDepositosBrl.toFixed(2)),
                retiradasPagamentosBrl: Number(retiradasPagamentosBrl.toFixed(2)),
                totalMovimentacoesPeriodo,
                eventosPositivos,
                eventosNegativos,
                melhorCarteira: melhor ? {
                    carteiraId: melhor.carteiraId,
                    nome: melhor.nome,
                    moeda: melhor.moeda,
                    simboloMoeda: melhor.simboloMoeda,
                    resultadoLiquidoBrl: melhor.resultadoLiquidoBrl,
                    rentabilidadePercentual: melhor.rentabilidadePercentual,
                } : null,
            },
            desempenhoCarteiras,
            serieTemporal,
        };
    }

    /**
     * Retorna a visão geral da carteira selecionada + lista de todas as carteiras do usuário, dashboard de ganhos/perdas e extrato recente.
     */
    async obterVisaoGeralCarteira(
        userId: string,
        autoCriar: boolean = false,
        carteiraId?: string,
        periodoDashboard: PeriodoDashboardCarteira = '30D'
    ): Promise<{
        possuiCarteira: boolean;
        carteira: Carteira | null;
        carteiras: Carteira[];
        patrimonioTotalBrl: number;
        transacoesRecentes: TransacaoCarteira[];
        dashboard: DashboardCarteirasDto;
    }> {
        let carteiras = await this.listarCarteirasUsuario(userId);

        if (carteiras.length === 0) {
            if (!autoCriar) {
                const emptyDashboard = await this.obterDashboardCarteiras(userId, { periodo: periodoDashboard });
                return {
                    possuiCarteira: false,
                    carteira: null,
                    carteiras: [],
                    patrimonioTotalBrl: 0,
                    transacoesRecentes: [],
                    dashboard: emptyDashboard,
                };
            }
            const res = await this.criarCarteira(userId, { moeda: 'BRL' });
            carteiras = res.carteiras;
        }

        const carteira = (carteiraId ? carteiras.find(c => c.internalId === carteiraId || c.numeroCarteira === carteiraId) : null)
            || carteiras.find(c => c.principal)
            || carteiras[0];

        const transacoesRecentes = await this.transacaoRepo.find({
            where: { carteiraId: carteira.internalId },
            order: { createdAt: 'DESC' },
            take: 30,
        });

        for (const tx of transacoesRecentes) {
            tx.valor = Number(tx.valor) || 0;
            if (tx.saldoAnterior !== undefined && tx.saldoAnterior !== null) {
                tx.saldoAnterior = Number(tx.saldoAnterior);
            }
            if (tx.saldoPosterior !== undefined && tx.saldoPosterior !== null) {
                tx.saldoPosterior = Number(tx.saldoPosterior);
            }
        }

        const patrimonioTotalBrl = this.calcularPatrimonioTotalBrl(carteiras);
        const dashboard = await this.obterDashboardCarteiras(userId, { periodo: periodoDashboard });

        // Avalia em segundo plano concessão de cortesia da ROLE DEVELOPER se patrimônio >= 50
        if (patrimonioTotalBrl >= 50 && userId && userId !== 'guest_user_demo') {
            this.verificarEConcederRoleDeveloper(userId).catch(err => {
                this.logger.warn(`Erro na verificação de cortesia DEVELOPER: ${err?.message}`);
            });
        }

        return {
            possuiCarteira: true,
            carteira,
            carteiras,
            patrimonioTotalBrl,
            transacoesRecentes,
            dashboard,
        };
    }

    /**
     * Realiza lançamento de movimentação ou atualização/ajuste direto da posição da carteira
     */
    async lancarPosicaoCarteira(
        userId: string,
        dados: LancamentoPosicaoDto
    ): Promise<{
        carteira: Carteira;
        transacao: TransacaoCarteira;
        carteiras: Carteira[];
        patrimonioTotalBrl: number;
    }> {
        const carteira = await this.obterOuCriarCarteira(userId, dados.carteiraId);

        if (carteira.status !== 'ATIVA') {
            throw new BadRequestException(`Carteira ${carteira.status.toLowerCase()}. Não é possível atualizar a posição.`);
        }

        const saldoAnterior = Number(carteira.saldo) || 0;
        let saldoPosterior = saldoAnterior;
        let tipoMovimento: 'ENTRADA' | 'SAIDA' = 'ENTRADA';
        let valorMovimento = 0;
        let categoriaMovimento = dados.categoria || 'AJUSTE_POSICAO';

        if (dados.modo === 'DEFINIR_POSICAO') {
            const novaPosicao = Number(dados.novaPosicao);
            if (isNaN(novaPosicao)) {
                throw new BadRequestException('Informe um valor numérico válido para a nova posição da carteira.');
            }
            const permiteNegativo = !!carteira.parametrosLastro?.permiteSaldoNegativo;
            if (novaPosicao < 0 && !permiteNegativo) {
                throw new BadRequestException('Esta carteira não permite posição negativa. Habilite nas configurações de lastro caso necessário.');
            }
            const diferenca = Number((novaPosicao - saldoAnterior).toFixed(4));
            saldoPosterior = Number(novaPosicao.toFixed(4));
            tipoMovimento = diferenca >= 0 ? 'ENTRADA' : 'SAIDA';
            valorMovimento = Math.abs(diferenca);
            categoriaMovimento = dados.categoria || 'AJUSTE_POSICAO';
        } else {
            const valor = Number(dados.valor);
            if (isNaN(valor) || valor <= 0) {
                throw new BadRequestException('O valor do lançamento deve ser maior que zero.');
            }
            tipoMovimento = dados.tipo || 'ENTRADA';
            valorMovimento = Number(valor.toFixed(4));
            if (tipoMovimento === 'SAIDA') {
                const permiteNegativo = !!carteira.parametrosLastro?.permiteSaldoNegativo;
                if (saldoAnterior < valorMovimento && !permiteNegativo) {
                    throw new BadRequestException(
                        `Saldo insuficiente na carteira ${carteira.nome} (${carteira.simboloMoeda} ${saldoAnterior.toFixed(2)}).`
                    );
                }
                saldoPosterior = Number((saldoAnterior - valorMovimento).toFixed(4));
            } else {
                saldoPosterior = Number((saldoAnterior + valorMovimento).toFixed(4));
            }
            categoriaMovimento = dados.categoria || (tipoMovimento === 'ENTRADA' ? 'APORTE' : 'RETIRADA');
        }

        if (dados.novaCotacaoBrl !== undefined && dados.novaCotacaoBrl !== null && Number(dados.novaCotacaoBrl) > 0) {
            carteira.fatorConversaoBrl = Number(dados.novaCotacaoBrl);
        }

        if (dados.novaMetaPosicao !== undefined && dados.novaMetaPosicao !== null && !isNaN(Number(dados.novaMetaPosicao))) {
            carteira.parametrosLastro = {
                ...(carteira.parametrosLastro || {}),
                metaPosicao: Number(dados.novaMetaPosicao),
            };
        }

        const identificador = dados.identificador?.trim() || `POS-${Date.now().toString(36).toUpperCase()}`;
        const descricaoPadrao = dados.modo === 'DEFINIR_POSICAO'
            ? `Atualização de Posição (${carteira.simboloMoeda} ${saldoAnterior.toFixed(2)} → ${carteira.simboloMoeda} ${saldoPosterior.toFixed(2)})`
            : `${tipoMovimento === 'ENTRADA' ? 'Lançamento de Entrada' : 'Lançamento de Saída'} (${categoriaMovimento})`;

        const transacao = this.transacaoRepo.create({
            carteiraId: carteira.internalId,
            tipo: tipoMovimento,
            categoria: categoriaMovimento,
            valor: valorMovimento,
            saldoAnterior,
            saldoPosterior,
            descricao: dados.descricao?.trim() || descricaoPadrao,
            identificador,
            status: 'CONCLUIDA',
            metadados: {
                ...(dados.metadados || {}),
                modoLancamento: dados.modo,
                fatorConversaoBrl: carteira.fatorConversaoBrl,
                moeda: carteira.moeda,
            },
        });

        const savedTransacao = await this.transacaoRepo.save(transacao);
        savedTransacao.valor = Number(savedTransacao.valor) || 0;
        savedTransacao.saldoAnterior = Number(savedTransacao.saldoAnterior) || 0;
        savedTransacao.saldoPosterior = Number(savedTransacao.saldoPosterior) || 0;

        carteira.saldo = saldoPosterior;
        let savedCarteira = await this.carteiraRepo.save(carteira);
        savedCarteira = this.normalizarCarteira(savedCarteira);

        const carteiras = await this.listarCarteirasUsuario(userId);
        const patrimonioTotalBrl = this.calcularPatrimonioTotalBrl(carteiras);

        this.logger.log(
            `Posição da carteira ${carteira.numeroCarteira} (${carteira.moeda}) atualizada: ${saldoAnterior} -> ${saldoPosterior}`
        );

        return {
            carteira: savedCarteira,
            transacao: savedTransacao,
            carteiras,
            patrimonioTotalBrl,
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

        const carteira = await this.obterOuCriarCarteira(userId, dados.carteiraId);

        if (carteira.status !== 'ATIVA') {
            throw new BadRequestException(`Carteira ${carteira.status.toLowerCase()}. Não é possível receber depósitos.`);
        }

        const saldoAnterior = Number(carteira.saldo) || 0;
        const saldoPosterior = Number((saldoAnterior + valor).toFixed(4));

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
        savedTransacao.valor = Number(savedTransacao.valor) || 0;
        savedTransacao.saldoAnterior = Number(savedTransacao.saldoAnterior) || 0;
        savedTransacao.saldoPosterior = Number(savedTransacao.saldoPosterior) || 0;

        carteira.saldo = saldoPosterior;
        let savedCarteira = await this.carteiraRepo.save(carteira);
        savedCarteira = this.normalizarCarteira(savedCarteira);

        this.logger.log(`Depósito de ${carteira.simboloMoeda} ${valor} registrado na carteira ${carteira.numeroCarteira}. Novo saldo: ${saldoPosterior}`);

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

        const carteira = await this.obterOuCriarCarteira(userId, dados.carteiraId);

        if (carteira.status !== 'ATIVA') {
            throw new BadRequestException(`Carteira ${carteira.status.toLowerCase()}. Não é possível realizar pagamentos.`);
        }

        const saldoAnterior = Number(carteira.saldo) || 0;
        if (saldoAnterior < valor && !carteira.parametrosLastro?.permiteSaldoNegativo) {
            throw new BadRequestException(
                `Saldo insuficiente. Saldo atual: ${carteira.simboloMoeda || 'R$'} ${saldoAnterior.toFixed(2)}, valor da fatura: ${carteira.simboloMoeda || 'R$'} ${valor.toFixed(2)}.`
            );
        }

        const saldoPosterior = Number((saldoAnterior - valor).toFixed(4));

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
        savedTransacao.valor = Number(savedTransacao.valor) || 0;
        savedTransacao.saldoAnterior = Number(savedTransacao.saldoAnterior) || 0;
        savedTransacao.saldoPosterior = Number(savedTransacao.saldoPosterior) || 0;

        carteira.saldo = saldoPosterior;
        let savedCarteira = await this.carteiraRepo.save(carteira);
        savedCarteira = this.normalizarCarteira(savedCarteira);

        this.logger.log(`Fatura ${dados.faturaId} paga com sucesso (${valor}) via carteira ${carteira.numeroCarteira}`);

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
        filtros?: { carteiraId?: string; tipo?: 'ENTRADA' | 'SAIDA'; categoria?: string; take?: number; skip?: number }
    ): Promise<{ transacoes: TransacaoCarteira[]; total: number }> {
        const carteira = await this.obterOuCriarCarteira(userId, filtros?.carteiraId);

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
