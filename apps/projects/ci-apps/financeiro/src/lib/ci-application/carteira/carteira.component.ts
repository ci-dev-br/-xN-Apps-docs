import { Component, OnInit, OnDestroy, Optional, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { TenantFilterBarComponent } from '@ci/components';
import { Subscription } from 'rxjs';
import {
    CarteiraService,
    CarteiraDto,
    TransacaoCarteiraDto,
    CategoriaTransacaoCarteira,
    DashboardCarteirasDto,
    DesempenhoCarteiraItemDto,
    PeriodoDashboardCarteira,
    PontoSerieTemporalCarteiraDto
} from '@ci/portal-api';
import {
    CarteiraPatrimonioKpiCard,
    CarteiraGanhosKpiCard,
    CarteiraPerdasKpiCard,
    CarteiraResultadoLiquidoKpiCard,
} from '../../ci-cards/carteira-kpis.card';
import { CarteiraEvolucaoTemporalCard } from '../../ci-cards/carteira-evolucao-temporal.card';
import { CarteiraAlocacaoLastroCard } from '../../ci-cards/carteira-alocacao-lastro.card';
import { CarteiraDesempenhoComparativoCard } from '../../ci-cards/carteira-desempenho-comparativo.card';

export interface PontoRenderGrafico {
    indice: number;
    x: number;
    yPatrimonio: number;
    yZero: number;
    yBarraGanho: number;
    alturaBarraGanho: number;
    yBarraPerda: number;
    alturaBarraPerda: number;
    dados: PontoSerieTemporalCarteiraDto;
}

export interface MoedaPresetItem {
    codigo: string;
    simbolo: string;
    nome: string;
    fatorBrl: number;
    corTema: string;
    indexador?: string;
    descricaoCurta: string;
}

@Component({
    selector: 'ci-financeiro-carteira',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatSelectModule,
        CarteiraPatrimonioKpiCard,
        CarteiraGanhosKpiCard,
        CarteiraPerdasKpiCard,
        CarteiraResultadoLiquidoKpiCard,
        CarteiraEvolucaoTemporalCard,
        CarteiraAlocacaoLastroCard,
        CarteiraDesempenhoComparativoCard,
        TenantFilterBarComponent,
    ],
    templateUrl: './carteira.component.html',
    styleUrls: ['./carteira.component.scss']
})
export class CarteiraComponent implements OnInit, OnDestroy {
    selectedTenantIds: string[] = [];
    carteira?: CarteiraDto;
    carteiras: CarteiraDto[] = [];
    patrimonioTotalBrl = 0;
    transacoes: TransacaoCarteiraDto[] = [];
    transacoesFiltradas: TransacaoCarteiraDto[] = [];

    loading = false;
    possuiCarteira = false;
    criandoCarteira = false;
    processando = false;
    mostrarSaldo = true;
    filtroTipo: 'TODOS' | 'ENTRADA' | 'SAIDA' = 'TODOS';

    // Navegação interna da Carteira: Visão Geral & Dashboard vs Tela de Lançamento de Posição
    abaAtiva: 'VISAO_GERAL' | 'LANCAMENTO_POSICAO' = 'VISAO_GERAL';

    // Estado do Dashboard de Visão Geral e Ganhos/Perdas ao Longo do Tempo
    dashboard?: DashboardCarteirasDto;
    periodoDashboard: PeriodoDashboardCarteira = '30D';
    escopoDashboard: string = 'TODAS';
    modoGraficoDashboard: 'EVOLUCAO_E_BARRAS' | 'GANHOS_PERDAS' = 'EVOLUCAO_E_BARRAS';
    indicePontoSelecionado: number | null = null;
    carregandoDashboard = false;
    exibirDashboardConsolidado = true;

    // Presets de Moedas Reais (Fiduciárias / Cripto)
    moedasReaisPreset: MoedaPresetItem[] = [
        { codigo: 'BRL', simbolo: 'R$', nome: 'Real Brasileiro', fatorBrl: 1.00, corTema: 'indigo', descricaoCurta: 'Moeda oficial nacional' },
        { codigo: 'USD', simbolo: 'US$', nome: 'Dólar Americano', fatorBrl: 5.80, corTema: 'emerald', descricaoCurta: 'Reserva cambial internacional' },
        { codigo: 'EUR', simbolo: '€', nome: 'Euro', fatorBrl: 6.15, corTema: 'blue', descricaoCurta: 'Zona do Euro' },
        { codigo: 'GBP', simbolo: '£', nome: 'Libra Esterlina', fatorBrl: 7.35, corTema: 'purple', descricaoCurta: 'Reino Unido' },
        { codigo: 'BTC', simbolo: '₿', nome: 'Bitcoin', fatorBrl: 520000.00, corTema: 'amber', descricaoCurta: 'Ativo digital descentralizado' },
    ];

    // Presets de Moedas / Ativos Parametrizados
    moedasParametrizadasPreset: MoedaPresetItem[] = [
        { codigo: 'CRD-IA', simbolo: 'TK', nome: 'Créditos de Computação CI', fatorBrl: 1.00, corTema: 'violet', indexador: 'CREDITO_INTERNO', descricaoCurta: 'Unidade de consumo de nuvem e IA' },
        { codigo: 'HORA', simbolo: 'h', nome: 'Hora Técnica de Engenharia', fatorBrl: 180.00, corTema: 'emerald', indexador: 'UNIDADE_SERVICO', descricaoCurta: 'Banco de horas técnicas parametrizado' },
        { codigo: 'IDX-CI', simbolo: 'IDX', nome: 'Cota Patrimonial Indexada', fatorBrl: 100.00, corTema: 'blue', indexador: 'COTA_PATRIMONIAL', descricaoCurta: 'Unidade referenciada em cesta de ativos' },
        { codigo: 'PTS', simbolo: 'PTS', nome: 'Pontos de Recompensa', fatorBrl: 0.10, corTema: 'amber', indexador: 'PROGRAMA_PONTOS', descricaoCurta: 'Programa de fidelidade e benefícios' },
        { codigo: 'OURO', simbolo: 'g', nome: 'Ouro Físico (Grama)', fatorBrl: 480.00, corTema: 'amber', indexador: 'COMMODITY', descricaoCurta: 'Lastro em grama de metal precioso' },
        { codigo: 'CUSTOM', simbolo: 'UN', nome: 'Moeda Parametrizada Customizada', fatorBrl: 1.00, corTema: 'indigo', indexador: 'PARAMETRIZADO', descricaoCurta: 'Defina livremente código, símbolo e paridade' },
    ];

    presetParametrizadoSelecionado = 'CRD-IA';

    // Formulário de Criação de Carteira (usado na Tela de Boas-Vindas e no Modal de Nova Carteira)
    nomeNovaCarteira = '';
    descricaoNovaCarteira = '';
    tipoLastroNovaCarteira: 'MOEDA_REAL' | 'PARAMETRIZADA' = 'MOEDA_REAL';
    moedaNovaCarteira = 'BRL';
    simboloNovaCarteira = 'R$';
    nomeMoedaNovaCarteira = 'Real Brasileiro';
    fatorConversaoNovaCarteira = 1.00;
    saldoInicialNovaCarteira: number | null = 0;
    limiteDiarioSugerido = 10000;
    indexadorNovaCarteira = 'CAMBIO_OFICIAL';
    casasDecimaisNovaCarteira = 2;
    permiteSaldoNegativoNovaCarteira = false;
    metaPosicaoNovaCarteira: number | null = null;
    principalNovaCarteira = false;
    corTemaNovaCarteira = 'indigo';
    termosAceitos = true;

    // Estados para modais de ações
    modalAberto: 'DEPOSITO' | 'FATURA' | 'NOVA_CARTEIRA' | 'OPERACOES_FUTURAS' | null = null;

    // Formulário da Tela de Lançamento e Atualização de Posição
    lancamentoCarteiraId = '';
    lancamentoModo: 'DEFINIR_POSICAO' | 'MOVIMENTACAO' = 'DEFINIR_POSICAO';
    lancamentoTipo: 'ENTRADA' | 'SAIDA' = 'ENTRADA';
    lancamentoCategoria: CategoriaTransacaoCarteira = 'AJUSTE_POSICAO';
    lancamentoValor: number | null = null;
    lancamentoNovaPosicao: number | null = null;
    lancamentoNovaCotacaoBrl: number | null = null;
    lancamentoNovaMetaPosicao: number | null = null;
    lancamentoIdentificador = '';
    lancamentoDescricao = '';

    // Formulário de depósito rápido
    depositoValor: number | null = null;
    depositoIdentificador = '';
    depositoDescricao = '';

    // Formulário de pagamento de fatura
    faturaId = '';
    faturaValor: number | null = null;
    faturaDescricao = '';

    private sub?: Subscription;

    constructor(
        private carteiraService: CarteiraService,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef,
        @Optional() private route?: ActivatedRoute
    ) { }

    ngOnInit(): void {
        const abaRota = this.route?.snapshot?.data?.['abaInicial'];
        if (abaRota === 'LANCAMENTO_POSICAO') {
            this.abaAtiva = 'LANCAMENTO_POSICAO';
        }
        this.resetarFormularioNovaCarteira(true);
        this.carregarDadosCarteira();
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    resetarFormularioNovaCarteira(primeiraCarteira = false): void {
        this.tipoLastroNovaCarteira = 'MOEDA_REAL';
        this.moedaNovaCarteira = 'BRL';
        this.simboloNovaCarteira = 'R$';
        this.nomeMoedaNovaCarteira = 'Real Brasileiro';
        this.fatorConversaoNovaCarteira = 1.00;
        this.nomeNovaCarteira = primeiraCarteira ? 'Carteira Principal (BRL)' : 'Carteira Real (BRL)';
        this.descricaoNovaCarteira = '';
        this.saldoInicialNovaCarteira = 0;
        this.limiteDiarioSugerido = 10000;
        this.indexadorNovaCarteira = 'CAMBIO_OFICIAL';
        this.casasDecimaisNovaCarteira = 2;
        this.permiteSaldoNegativoNovaCarteira = false;
        this.metaPosicaoNovaCarteira = null;
        this.principalNovaCarteira = primeiraCarteira;
        this.corTemaNovaCarteira = 'indigo';
        this.termosAceitos = true;
    }

    selecionarTipoLastro(tipo: 'MOEDA_REAL' | 'PARAMETRIZADA'): void {
        this.tipoLastroNovaCarteira = tipo;
        if (tipo === 'MOEDA_REAL') {
            this.selecionarMoedaRealPreset(this.moedasReaisPreset[0]);
        } else {
            this.selecionarPresetParametrizado(this.moedasParametrizadasPreset[0]);
        }
    }

    selecionarMoedaRealPreset(preset: MoedaPresetItem): void {
        this.tipoLastroNovaCarteira = 'MOEDA_REAL';
        this.moedaNovaCarteira = preset.codigo;
        this.simboloNovaCarteira = preset.simbolo;
        this.nomeMoedaNovaCarteira = preset.nome;
        this.fatorConversaoNovaCarteira = preset.fatorBrl;
        this.corTemaNovaCarteira = preset.corTema;
        this.indexadorNovaCarteira = 'CAMBIO_OFICIAL';
        this.nomeNovaCarteira = !this.possuiCarteira
            ? `Carteira Principal (${preset.codigo})`
            : `Carteira ${preset.nome} (${preset.codigo})`;
    }

    selecionarPresetParametrizado(preset: MoedaPresetItem): void {
        this.tipoLastroNovaCarteira = 'PARAMETRIZADA';
        this.presetParametrizadoSelecionado = preset.codigo;
        this.moedaNovaCarteira = preset.codigo === 'CUSTOM' ? 'TOKEN-CI' : preset.codigo;
        this.simboloNovaCarteira = preset.simbolo;
        this.nomeMoedaNovaCarteira = preset.nome;
        this.fatorConversaoNovaCarteira = preset.fatorBrl;
        this.corTemaNovaCarteira = preset.corTema;
        this.indexadorNovaCarteira = preset.indexador || 'PARAMETRIZADO';
        this.nomeNovaCarteira = `Carteira ${preset.nome}`;
    }

    onTenantFilterChange(tenantIds: string[]): void {
        this.selectedTenantIds = Array.isArray(tenantIds) ? tenantIds : [];
        this.carregarDadosCarteira();
    }

    carregarDadosCarteira(carteiraId?: string): void {
        const targetId = carteiraId || this.carteira?.internalId;
        this.loading = true;
        this.sub?.unsubscribe();
        try {
            this.sub = this.carteiraService.obterMinhaCarteira(
                false,
                targetId,
                this.periodoDashboard,
                this.selectedTenantIds.length > 0 ? this.selectedTenantIds : undefined,
            ).subscribe({
                next: (res: any) => {
                    this.loading = false;
                    const listaCarteiras = Array.isArray(res?.carteiras) ? res.carteiras : (res?.carteira ? [res.carteira] : []);
                    this.carteiras = listaCarteiras;
                    this.patrimonioTotalBrl = Number(res?.patrimonioTotalBrl) || this.calcularPatrimonioLocal(listaCarteiras);

                    if (res && res.carteira && res.possuiCarteira !== false) {
                        this.possuiCarteira = true;
                        this.carteira = res.carteira;
                        this.transacoes = res.transacoesRecentes || [];
                        this.aplicarFiltro(this.filtroTipo);
                        this.sincronizarFormularioLancamento(res.carteira);
                        if (res.dashboard) {
                            this.dashboard = res.dashboard;
                        } else {
                            this.dashboard = this.construirDashboardLocal();
                        }
                        this.indicePontoSelecionado = null;
                    } else {
                        this.possuiCarteira = false;
                        this.carteira = undefined;
                        this.transacoes = [];
                        this.transacoesFiltradas = [];
                        this.dashboard = undefined;
                    }
                    this.cdr.markForCheck();
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.loading = false;
                    this.snackBar.open('Erro ao carregar dados da carteira.', 'Fechar', { duration: 3500 });
                    this.cdr.markForCheck();
                    this.cdr.detectChanges();
                }
            });
        } catch {
            this.loading = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
        }
    }

    private calcularPatrimonioLocal(carteiras: CarteiraDto[]): number {
        return carteiras.reduce((acc, c) => {
            const saldo = Number(c.saldo) || 0;
            const fator = Number(c.fatorConversaoBrl) > 0 ? Number(c.fatorConversaoBrl) : 1;
            return acc + (saldo * fator);
        }, 0);
    }

    selecionarCarteira(c: CarteiraDto): void {
        if (!c?.internalId) return;
        this.carteira = c;
        this.sincronizarFormularioLancamento(c);
        this.carregarDadosCarteira(c.internalId);
    }

    alternarAba(aba: 'VISAO_GERAL' | 'LANCAMENTO_POSICAO'): void {
        this.abaAtiva = aba;
        if (aba === 'LANCAMENTO_POSICAO' && this.carteira) {
            this.sincronizarFormularioLancamento(this.carteira);
        }
        this.cdr.markForCheck();
        this.cdr.detectChanges();
    }

    sincronizarFormularioLancamento(c?: CarteiraDto): void {
        const alvo = c || this.carteira;
        if (!alvo) return;
        this.lancamentoCarteiraId = alvo.internalId || '';
        this.lancamentoNovaPosicao = Number(alvo.saldo) || 0;
        this.lancamentoNovaCotacaoBrl = Number(alvo.fatorConversaoBrl) || 1;
        this.lancamentoNovaMetaPosicao = alvo.parametrosLastro?.metaPosicao ?? null;
        this.lancamentoIdentificador = `POS-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    onChangeCarteiraLancamento(carteiraId: string): void {
        const encontrada = this.carteiras.find(c => c.internalId === carteiraId);
        if (encontrada) {
            this.sincronizarFormularioLancamento(encontrada);
        }
    }

    selecionarModoLancamento(modo: 'DEFINIR_POSICAO' | 'MOVIMENTACAO'): void {
        this.lancamentoModo = modo;
        if (modo === 'DEFINIR_POSICAO') {
            this.lancamentoCategoria = 'AJUSTE_POSICAO';
            const alvo = this.carteiraAlvoLancamento();
            if (alvo) {
                this.lancamentoNovaPosicao = Number(alvo.saldo) || 0;
            }
        } else {
            this.lancamentoCategoria = this.lancamentoTipo === 'ENTRADA' ? 'APORTE' : 'RETIRADA';
        }
    }

    carteiraAlvoLancamento(): CarteiraDto | undefined {
        if (this.lancamentoCarteiraId) {
            const c = this.carteiras.find(item => item.internalId === this.lancamentoCarteiraId);
            if (c) return c;
        }
        return this.carteira;
    }

    posicaoAtualAlvo(): number {
        return Number(this.carteiraAlvoLancamento()?.saldo) || 0;
    }

    posicaoProjetadaAlvo(): number {
        const atual = this.posicaoAtualAlvo();
        if (this.lancamentoModo === 'DEFINIR_POSICAO') {
            if (this.lancamentoNovaPosicao === null || this.lancamentoNovaPosicao === undefined || isNaN(Number(this.lancamentoNovaPosicao))) {
                return atual;
            }
            return Number(this.lancamentoNovaPosicao);
        } else {
            const val = Number(this.lancamentoValor) || 0;
            return this.lancamentoTipo === 'ENTRADA' ? atual + val : atual - val;
        }
    }

    variacaoProjetadaAlvo(): number {
        return Number((this.posicaoProjetadaAlvo() - this.posicaoAtualAlvo()).toFixed(4));
    }

    cotacaoProjetadaAlvo(): number {
        if (this.lancamentoNovaCotacaoBrl && Number(this.lancamentoNovaCotacaoBrl) > 0) {
            return Number(this.lancamentoNovaCotacaoBrl);
        }
        return Number(this.carteiraAlvoLancamento()?.fatorConversaoBrl) || 1;
    }

    equivalenteBrlProjetado(): number {
        return Number((this.posicaoProjetadaAlvo() * this.cotacaoProjetadaAlvo()).toFixed(2));
    }

    criarNovaCarteira(): void {
        if (!this.possuiCarteira && !this.termosAceitos) {
            this.snackBar.open('Por favor, aceite os termos para ativar sua Carteira Digital.', 'OK', { duration: 3500 });
            return;
        }

        const codigoMoeda = (this.moedaNovaCarteira || 'BRL').trim().toUpperCase();
        if (!codigoMoeda) {
            this.snackBar.open('Informe o código da moeda ou ativo de lastro.', 'OK', { duration: 3000 });
            return;
        }

        this.criandoCarteira = true;
        this.carteiraService.criarCarteira({
            nome: this.nomeNovaCarteira?.trim() || `Carteira ${codigoMoeda}`,
            descricao: this.descricaoNovaCarteira?.trim() || undefined,
            tipoLastro: this.tipoLastroNovaCarteira,
            moeda: codigoMoeda,
            simboloMoeda: this.simboloNovaCarteira?.trim() || codigoMoeda,
            nomeMoeda: this.nomeMoedaNovaCarteira?.trim() || codigoMoeda,
            fatorConversaoBrl: Number(this.fatorConversaoNovaCarteira) > 0 ? Number(this.fatorConversaoNovaCarteira) : 1,
            saldoInicial: Number(this.saldoInicialNovaCarteira) || 0,
            limiteDiario: Number(this.limiteDiarioSugerido) || 10000,
            principal: this.principalNovaCarteira || !this.possuiCarteira,
            corTema: this.corTemaNovaCarteira || 'indigo',
            parametrosLastro: {
                indexador: this.indexadorNovaCarteira || (this.tipoLastroNovaCarteira === 'PARAMETRIZADA' ? 'PARAMETRIZADO' : 'CAMBIO_OFICIAL'),
                casasDecimais: Number(this.casasDecimaisNovaCarteira) || 2,
                permiteSaldoNegativo: !!this.permiteSaldoNegativoNovaCarteira,
                metaPosicao: this.metaPosicaoNovaCarteira !== null && this.metaPosicaoNovaCarteira !== undefined ? Number(this.metaPosicaoNovaCarteira) : undefined,
            },
            termosAceitos: this.termosAceitos,
            ...(this.selectedTenantIds.length > 0 ? { tenantIds: [...this.selectedTenantIds] } : {}),
        }).subscribe({
            next: (res) => {
                this.criandoCarteira = false;
                if (res && res.carteira) {
                    this.carteira = res.carteira;
                    this.carteiras = Array.isArray(res.carteiras) && res.carteiras.length > 0 ? res.carteiras : [...this.carteiras, res.carteira];
                    this.patrimonioTotalBrl = this.calcularPatrimonioLocal(this.carteiras);
                    this.possuiCarteira = true;
                    this.fecharModal();
                    this.carregarDadosCarteira(res.carteira.internalId);
                    this.snackBar.open(`Carteira "${res.carteira.nome || res.carteira.numeroCarteira}" (${res.carteira.moeda}) criada com sucesso!`, 'OK', { duration: 4000 });
                }
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.criandoCarteira = false;
                const msg = err?.error?.message || 'Falha ao criar sua carteira. Tente novamente.';
                this.snackBar.open(msg, 'Fechar', { duration: 4000 });
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            }
        });
    }

    executarLancamentoPosicao(): void {
        const alvo = this.carteiraAlvoLancamento();
        if (!alvo) {
            this.snackBar.open('Selecione uma carteira para lançar a posição.', 'OK', { duration: 3000 });
            return;
        }

        if (this.lancamentoModo === 'DEFINIR_POSICAO') {
            if (this.lancamentoNovaPosicao === null || this.lancamentoNovaPosicao === undefined || isNaN(Number(this.lancamentoNovaPosicao))) {
                this.snackBar.open('Informe o valor da nova posição consolidada.', 'OK', { duration: 3000 });
                return;
            }
        } else {
            if (!this.lancamentoValor || Number(this.lancamentoValor) <= 0) {
                this.snackBar.open('Informe um valor maior que zero para o lançamento.', 'OK', { duration: 3000 });
                return;
            }
        }

        this.processando = true;
        this.carteiraService.lancarPosicaoCarteira({
            carteiraId: alvo.internalId,
            modo: this.lancamentoModo,
            tipo: this.lancamentoTipo,
            valor: this.lancamentoModo === 'MOVIMENTACAO' ? Number(this.lancamentoValor) : undefined,
            novaPosicao: this.lancamentoModo === 'DEFINIR_POSICAO' ? Number(this.lancamentoNovaPosicao) : undefined,
            novaCotacaoBrl: this.lancamentoNovaCotacaoBrl && Number(this.lancamentoNovaCotacaoBrl) > 0 ? Number(this.lancamentoNovaCotacaoBrl) : undefined,
            novaMetaPosicao: this.lancamentoNovaMetaPosicao !== null && this.lancamentoNovaMetaPosicao !== undefined ? Number(this.lancamentoNovaMetaPosicao) : undefined,
            categoria: this.lancamentoCategoria,
            identificador: this.lancamentoIdentificador,
            descricao: this.lancamentoDescricao,
        }).subscribe({
            next: (res) => {
                this.processando = false;
                this.carteira = res.carteira;
                if (Array.isArray(res.carteiras)) {
                    this.carteiras = res.carteiras;
                }
                this.patrimonioTotalBrl = Number(res.patrimonioTotalBrl) || this.calcularPatrimonioLocal(this.carteiras);
                if (res.transacao) {
                    this.transacoes.unshift(res.transacao);
                    this.aplicarFiltro(this.filtroTipo);
                }
                this.lancamentoValor = null;
                this.lancamentoDescricao = '';
                this.sincronizarFormularioLancamento(res.carteira);
                this.carregarDashboardRemoto();
                this.snackBar.open(
                    `Posição da carteira "${res.carteira.nome}" atualizada para ${res.carteira.simboloMoeda || res.carteira.moeda} ${Number(res.carteira.saldo).toFixed(2)}!`,
                    'OK',
                    { duration: 4000 }
                );
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.processando = false;
                const msg = err?.error?.message || 'Falha ao atualizar posição da carteira.';
                this.snackBar.open(msg, 'Fechar', { duration: 4000 });
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            }
        });
    }

    aplicarFiltro(tipo: 'TODOS' | 'ENTRADA' | 'SAIDA'): void {
        this.filtroTipo = tipo;
        if (tipo === 'TODOS') {
            this.transacoesFiltradas = this.transacoes;
        } else {
            this.transacoesFiltradas = this.transacoes.filter(t => t.tipo === tipo);
        }
    }

    toggleMostrarSaldo(): void {
        this.mostrarSaldo = !this.mostrarSaldo;
    }

    copiarIdentificador(): void {
        if (!this.carteira?.numeroCarteira) return;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.carteira.numeroCarteira).then(() => {
                this.snackBar.open('Número da carteira copiado para a área de transferência!', 'OK', { duration: 2500 });
            });
        }
    }

    abrirModal(modal: 'DEPOSITO' | 'FATURA' | 'NOVA_CARTEIRA' | 'OPERACOES_FUTURAS'): void {
        this.modalAberto = modal;
        if (modal === 'NOVA_CARTEIRA') {
            this.resetarFormularioNovaCarteira(false);
        }
        this.depositoValor = null;
        this.depositoIdentificador = `PIX-${Math.floor(100000 + Math.random() * 900000)}`;
        this.depositoDescricao = '';
        this.faturaId = '';
        this.faturaValor = null;
        this.faturaDescricao = '';
    }

    fecharModal(): void {
        this.modalAberto = null;
    }

    executarDeposito(): void {
        if (!this.depositoValor || this.depositoValor <= 0) {
            this.snackBar.open('Informe um valor válido maior que zero.', 'OK', { duration: 3000 });
            return;
        }

        this.processando = true;
        this.carteiraService.registrarDeposito({
            carteiraId: this.carteira?.internalId,
            valor: this.depositoValor,
            identificador: this.depositoIdentificador,
            descricao: this.depositoDescricao || `Depósito Identificado (${this.depositoIdentificador})`
        }).subscribe({
            next: (res) => {
                this.carteira = res.carteira;
                const idx = this.carteiras.findIndex(c => c.internalId === res.carteira.internalId);
                if (idx >= 0) this.carteiras[idx] = res.carteira;
                this.patrimonioTotalBrl = this.calcularPatrimonioLocal(this.carteiras);
                this.transacoes.unshift(res.transacao);
                this.aplicarFiltro(this.filtroTipo);
                this.processando = false;
                this.fecharModal();
                this.carregarDashboardRemoto();
                this.snackBar.open(`Depósito de ${this.simboloCarteiraAtiva()} ${Number(res.transacao?.valor || this.depositoValor || 0).toFixed(2)} confirmado com sucesso!`, 'OK', { duration: 3500 });
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.processando = false;
                const msg = err?.error?.message || 'Falha ao processar o depósito.';
                this.snackBar.open(msg, 'Fechar', { duration: 4000 });
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            }
        });
    }

    executarPagamentoFatura(): void {
        if (!this.faturaId || !this.faturaId.trim()) {
            this.snackBar.open('Informe o código ou ID da fatura.', 'OK', { duration: 3000 });
            return;
        }
        if (!this.faturaValor || this.faturaValor <= 0) {
            this.snackBar.open('Informe o valor da fatura.', 'OK', { duration: 3000 });
            return;
        }

        const saldoAtual = Number(this.carteira?.saldo) || 0;
        if (saldoAtual < this.faturaValor && !this.carteira?.parametrosLastro?.permiteSaldoNegativo) {
            this.snackBar.open(`Saldo insuficiente (${this.simboloCarteiraAtiva()} ${saldoAtual.toFixed(2)}) para pagar fatura de ${this.simboloCarteiraAtiva()} ${this.faturaValor.toFixed(2)}.`, 'Fechar', { duration: 4000 });
            return;
        }

        this.processando = true;
        this.carteiraService.pagarFatura({
            carteiraId: this.carteira?.internalId,
            faturaId: this.faturaId.trim(),
            valor: this.faturaValor,
            descricao: this.faturaDescricao || `Pagamento da Fatura #${this.faturaId.trim()}`
        }).subscribe({
            next: (res) => {
                this.carteira = res.carteira;
                const idx = this.carteiras.findIndex(c => c.internalId === res.carteira.internalId);
                if (idx >= 0) this.carteiras[idx] = res.carteira;
                this.patrimonioTotalBrl = this.calcularPatrimonioLocal(this.carteiras);
                this.transacoes.unshift(res.transacao);
                this.aplicarFiltro(this.filtroTipo);
                this.processando = false;
                this.fecharModal();
                this.carregarDashboardRemoto();
                this.snackBar.open(`Fatura #${res.transacao.referenciaFaturaId} liquidada com sucesso!`, 'OK', { duration: 3500 });
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.processando = false;
                const msg = err?.error?.message || 'Falha ao liquidar a fatura.';
                this.snackBar.open(msg, 'Fechar', { duration: 4000 });
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            }
        });
    }

    simboloCarteiraAtiva(): string {
        return this.carteira?.simboloMoeda || (this.carteira?.moeda === 'BRL' ? 'R$' : this.carteira?.moeda || 'R$');
    }

    equivalenteBrlCarteira(c?: CarteiraDto): number {
        const alvo = c || this.carteira;
        if (!alvo) return 0;
        const saldo = Number(alvo.saldo) || 0;
        const fator = Number(alvo.fatorConversaoBrl) > 0 ? Number(alvo.fatorConversaoBrl) : 1;
        return Number((saldo * fator).toFixed(2));
    }

    totalEntradas(): number {
        return this.transacoes
            .filter(t => t.tipo === 'ENTRADA')
            .reduce((acc, t) => acc + Number(t.valor || 0), 0);
    }

    totalSaidas(): number {
        return this.transacoes
            .filter(t => t.tipo === 'SAIDA')
            .reduce((acc, t) => acc + Number(t.valor || 0), 0);
    }

    // -------------------------------------------------------------------------
    // DASHBOARD DE VISÃO GERAL E GANHOS / PERDAS AO LONGO DO TEMPO
    // -------------------------------------------------------------------------
    selecionarPeriodoDashboard(periodo: PeriodoDashboardCarteira): void {
        if (this.periodoDashboard === periodo) return;
        this.periodoDashboard = periodo;
        this.carregarDashboardRemoto();
    }

    selecionarEscopoDashboard(escopo: string): void {
        this.escopoDashboard = escopo;
        this.carregarDashboardRemoto();
    }

    carregarDashboardRemoto(): void {
        if (!this.carteiraService || typeof this.carteiraService.obterDashboardCarteiras !== 'function') {
            this.dashboard = this.construirDashboardLocal();
            this.cdr.markForCheck();
            this.cdr.detectChanges();
            return;
        }
        this.carregandoDashboard = true;
        const carteiraFiltro = this.escopoDashboard === 'TODAS' ? undefined : this.escopoDashboard;
        this.carteiraService.obterDashboardCarteiras(
            this.periodoDashboard,
            carteiraFiltro,
            this.selectedTenantIds.length > 0 ? this.selectedTenantIds : undefined,
        ).subscribe({
            next: (dash) => {
                this.carregandoDashboard = false;
                this.dashboard = dash || this.construirDashboardLocal();
                this.indicePontoSelecionado = null;
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            },
            error: () => {
                this.carregandoDashboard = false;
                this.dashboard = this.construirDashboardLocal();
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            }
        });
    }

    construirDashboardLocal(): DashboardCarteirasDto {
        const totalBrl = this.calcularPatrimonioLocal(this.carteiras);
        let realBrl = 0;
        let paramBrl = 0;
        const desempenhoCarteiras: DesempenhoCarteiraItemDto[] = this.carteiras.map((c) => {
            const fator = Number(c.fatorConversaoBrl) > 0 ? Number(c.fatorConversaoBrl) : 1;
            const saldo = Number(c.saldo) || 0;
            const saldoBrl = Number((saldo * fator).toFixed(2));
            if (c.tipoLastro === 'PARAMETRIZADA') {
                paramBrl += saldoBrl;
            } else {
                realBrl += saldoBrl;
            }
            const txs = c.internalId === this.carteira?.internalId ? this.transacoes : [];
            const ganhosMoeda = txs.filter(t => t.tipo === 'ENTRADA').reduce((a, t) => a + Number(t.valor || 0), 0) || (saldo > 0 ? saldo : 0);
            const perdasMoeda = txs.filter(t => t.tipo === 'SAIDA').reduce((a, t) => a + Number(t.valor || 0), 0);
            const ganhosBrl = Number((ganhosMoeda * fator).toFixed(2));
            const perdasBrl = Number((perdasMoeda * fator).toFixed(2));
            const liquidoBrl = Number((ganhosBrl - perdasBrl).toFixed(2));
            const base = ganhosBrl > 0 ? ganhosBrl : (saldoBrl > 0 ? saldoBrl : 1);
            return {
                carteiraId: c.internalId || c.numeroCarteira,
                nome: c.nome || `Carteira ${c.moeda}`,
                numeroCarteira: c.numeroCarteira,
                moeda: c.moeda,
                simboloMoeda: c.simboloMoeda || c.moeda,
                nomeMoeda: c.nomeMoeda || c.moeda,
                tipoLastro: c.tipoLastro || 'MOEDA_REAL',
                corTema: c.corTema || 'indigo',
                principal: !!c.principal,
                saldoAtual: saldo,
                fatorConversaoBrl: fator,
                saldoAtualBrl: saldoBrl,
                participacaoPercentual: totalBrl > 0 ? Number(((saldoBrl / totalBrl) * 100).toFixed(1)) : 0,
                ganhosPeriodoMoeda: ganhosMoeda,
                perdasPeriodoMoeda: perdasMoeda,
                resultadoLiquidoMoeda: Number((ganhosMoeda - perdasMoeda).toFixed(4)),
                ganhosPeriodoBrl: ganhosBrl,
                perdasPeriodoBrl: perdasBrl,
                resultadoLiquidoBrl: liquidoBrl,
                rentabilidadePercentual: Number(((liquidoBrl / base) * 100).toFixed(2)),
                metaPosicao: c.parametrosLastro?.metaPosicao || null,
                progressoMetaPercentual: c.parametrosLastro?.metaPosicao
                    ? Math.min(100, Number(((saldo / Number(c.parametrosLastro.metaPosicao)) * 100).toFixed(1)))
                    : null,
                totalTransacoes: txs.length,
            };
        });

        const ganhosTotais = desempenhoCarteiras.reduce((a, d) => a + d.ganhosPeriodoBrl, 0);
        const perdasTotais = desempenhoCarteiras.reduce((a, d) => a + d.perdasPeriodoBrl, 0);
        const liquidoTotal = Number((ganhosTotais - perdasTotais).toFixed(2));
        const melhor = [...desempenhoCarteiras].sort((a, b) => b.resultadoLiquidoBrl - a.resultadoLiquidoBrl)[0] || null;

        const serieTemporal: PontoSerieTemporalCarteiraDto[] = [
            {
                indice: 0,
                dataIso: new Date(Date.now() - 86400000).toISOString(),
                rotulo: 'Início',
                descricaoEvento: 'Abertura do Período',
                patrimonioBrl: 0,
                ganhosBrl: 0,
                perdasBrl: 0,
                resultadoLiquidoBrl: 0,
                ganhoAcumuladoBrl: 0,
                variacaoPercentualAcumulada: 0,
            },
            {
                indice: 1,
                dataIso: new Date().toISOString(),
                rotulo: 'Atual',
                descricaoEvento: 'Posição Consolidada Atual',
                patrimonioBrl: totalBrl,
                ganhosBrl: ganhosTotais,
                perdasBrl: perdasTotais,
                resultadoLiquidoBrl: liquidoTotal,
                ganhoAcumuladoBrl: liquidoTotal,
                variacaoPercentualAcumulada: ganhosTotais > 0 ? Number(((liquidoTotal / ganhosTotais) * 100).toFixed(1)) : 100,
            }
        ];

        return {
            periodo: this.periodoDashboard,
            escopoCarteiraId: this.escopoDashboard,
            resumo: {
                patrimonioTotalBrl: totalBrl,
                patrimonioMoedaRealBrl: Number(realBrl.toFixed(2)),
                patrimonioParametrizadoBrl: Number(paramBrl.toFixed(2)),
                percentualMoedaReal: totalBrl > 0 ? Number(((realBrl / totalBrl) * 100).toFixed(1)) : 0,
                percentualParametrizado: totalBrl > 0 ? Number(((paramBrl / totalBrl) * 100).toFixed(1)) : 0,
                ganhosTotaisPeriodoBrl: Number(ganhosTotais.toFixed(2)),
                perdasTotaisPeriodoBrl: Number(perdasTotais.toFixed(2)),
                resultadoLiquidoPeriodoBrl: liquidoTotal,
                variacaoPercentualPeriodo: ganhosTotais > 0 ? Number(((liquidoTotal / ganhosTotais) * 100).toFixed(2)) : 0,
                ganhosRendimentosValorizacaoBrl: Number(ganhosTotais.toFixed(2)),
                aportesDepositosBrl: Number(ganhosTotais.toFixed(2)),
                retiradasPagamentosBrl: Number(perdasTotais.toFixed(2)),
                totalMovimentacoesPeriodo: this.transacoes.length || this.carteiras.length,
                eventosPositivos: this.carteiras.length,
                eventosNegativos: 0,
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

    pontosGraficoRender(): PontoRenderGrafico[] {
        const serie = this.dashboard?.serieTemporal || [];
        if (serie.length === 0) return [];

        const larguraUtil = 680; // viewBox 760 - 2 * 40
        const offsetX = 44;
        const topoY = 24;
        const basePatrimonioY = 198;
        const alturaUtil = basePatrimonioY - topoY;

        const maxVal = Math.max(
            1,
            ...serie.map(p => Math.max(p.patrimonioBrl || 0, p.ganhosBrl || 0, p.perdasBrl || 0))
        );

        return serie.map((p, idx) => {
            const x = serie.length === 1
                ? offsetX + larguraUtil / 2
                : Number((offsetX + (idx / (serie.length - 1)) * larguraUtil).toFixed(1));

            const ratioPat = Math.min(1, Math.max(0, (p.patrimonioBrl || 0) / maxVal));
            const yPatrimonio = Number((basePatrimonioY - ratioPat * alturaUtil).toFixed(1));

            const alturaBarraGanho = Number((Math.min(1, (p.ganhosBrl || 0) / maxVal) * (alturaUtil * 0.72)).toFixed(1));
            const yBarraGanho = Number((basePatrimonioY - alturaBarraGanho).toFixed(1));

            const alturaBarraPerda = Number((Math.min(1, (p.perdasBrl || 0) / maxVal) * (alturaUtil * 0.72)).toFixed(1));
            const yBarraPerda = Number((basePatrimonioY - alturaBarraPerda).toFixed(1));

            return {
                indice: idx,
                x,
                yPatrimonio,
                yZero: basePatrimonioY,
                yBarraGanho,
                alturaBarraGanho,
                yBarraPerda,
                alturaBarraPerda,
                dados: p,
            };
        });
    }

    caminhoCurvaPatrimonioSvg(): string {
        const pts = this.pontosGraficoRender();
        if (pts.length === 0) return '';
        if (pts.length === 1) {
            return `M 44 ${pts[0].yPatrimonio} L 724 ${pts[0].yPatrimonio}`;
        }
        return pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.yPatrimonio}`).join(' ');
    }

    caminhoAreaPatrimonioSvg(): string {
        const pts = this.pontosGraficoRender();
        if (pts.length === 0) return '';
        const base = 198;
        if (pts.length === 1) {
            return `M 44 ${base} L 44 ${pts[0].yPatrimonio} L 724 ${pts[0].yPatrimonio} L 724 ${base} Z`;
        }
        const linha = pts.map(pt => `L ${pt.x} ${pt.yPatrimonio}`).join(' ');
        return `M ${pts[0].x} ${base} ${linha} L ${pts[pts.length - 1].x} ${base} Z`;
    }

    pontoInspecionado(): PontoSerieTemporalCarteiraDto | null {
        const serie = this.dashboard?.serieTemporal || [];
        if (serie.length === 0) return null;
        if (this.indicePontoSelecionado !== null && serie[this.indicePontoSelecionado]) {
            return serie[this.indicePontoSelecionado];
        }
        return serie[serie.length - 1];
    }

    selecionarPontoGrafico(indice: number): void {
        this.indicePontoSelecionado = indice;
    }

    corHexPorTema(tema?: string): string {
        const mapa: Record<string, string> = {
            indigo: '#4f46e5',
            emerald: '#10b981',
            blue: '#2563eb',
            violet: '#7c3aed',
            amber: '#f59e0b',
            purple: '#9333ea',
        };
        return mapa[tema || 'indigo'] || '#4f46e5';
    }

    irParaLancamentoDaCarteira(carteiraId: string): void {
        const encontrada = this.carteiras.find(c => c.internalId === carteiraId);
        if (encontrada) {
            this.carteira = encontrada;
            this.sincronizarFormularioLancamento(encontrada);
        }
        this.alternarAba('LANCAMENTO_POSICAO');
    }

    focarExtratoCarteira(carteiraId: string): void {
        const encontrada = this.carteiras.find(c => c.internalId === carteiraId);
        if (encontrada) {
            this.selecionarCarteira(encontrada);
        }
    }
}
