import { Body, Controller, Get, Post, Query, Req, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CarteiraService } from "../service/carteira.service";
import { Carteira } from "../model/carteira.entity";
import { TransacaoCarteira } from "../model/transacao-carteira.entity";

export class DepositoIdentificadoDto {
    @ApiProperty({ description: 'ID da carteira de destino (opcional; usa a principal caso omitido)', required: false })
    carteiraId?: string;

    @ApiProperty({ description: 'Valor a ser depositado na carteira', example: 150.00 })
    valor: number;

    @ApiProperty({ description: 'Identificador do depósito (ex: comprovante, código pix)', required: false })
    identificador?: string;

    @ApiProperty({ description: 'Descrição da operação', required: false, example: 'Depósito identificado via PIX' })
    descricao?: string;

    @ApiProperty({ description: 'Metadados adicionais da transação', required: false })
    metadados?: any;
}

export class PagarFaturaComCarteiraDto {
    @ApiProperty({ description: 'ID da carteira pagadora (opcional; usa a principal caso omitido)', required: false })
    carteiraId?: string;

    @ApiProperty({ description: 'Identificador único da fatura a ser liquidada', example: 'FAT-2026-0091' })
    faturaId: string;

    @ApiProperty({ description: 'Valor da fatura a ser debitado da carteira', example: 89.90 })
    valor: number;

    @ApiProperty({ description: 'Descrição do pagamento', required: false, example: 'Pagamento de fatura de serviços de nuvem' })
    descricao?: string;

    @ApiProperty({ description: 'Metadados adicionais da fatura', required: false })
    metadados?: any;
}

export class CriarCarteiraDto {
    @ApiProperty({ description: 'Nome ou apelido da carteira', required: false, example: 'Reserva em Dólar' })
    nome?: string;

    @ApiProperty({ description: 'Descrição ou finalidade da carteira', required: false })
    descricao?: string;

    @ApiProperty({ description: 'Tipo de lastro: MOEDA_REAL ou PARAMETRIZADA', enum: ['MOEDA_REAL', 'PARAMETRIZADA'], default: 'MOEDA_REAL', required: false })
    tipoLastro?: 'MOEDA_REAL' | 'PARAMETRIZADA';

    @ApiProperty({ description: 'Código da moeda real ou parametrizada', default: 'BRL', required: false, example: 'BRL' })
    moeda?: string;

    @ApiProperty({ description: 'Símbolo de exibição da moeda/unidade', required: false, example: 'R$' })
    simboloMoeda?: string;

    @ApiProperty({ description: 'Nome descritivo do ativo/moeda de lastro', required: false, example: 'Real Brasileiro' })
    nomeMoeda?: string;

    @ApiProperty({ description: 'Fator de conversão / cotação de referência em BRL (1 unidade = X R$)', required: false, example: 1.0 })
    fatorConversaoBrl?: number;

    @ApiProperty({ description: 'Saldo / posição inicial de abertura da carteira', required: false, example: 0 })
    saldoInicial?: number;

    @ApiProperty({ description: 'Limite operacional diário desejado', required: false, example: 10000.00 })
    limiteDiario?: number;

    @ApiProperty({ description: 'Definir como carteira principal', required: false, default: false })
    principal?: boolean;

    @ApiProperty({ description: 'Cor do tema visual do cartão', required: false, example: 'indigo' })
    corTema?: string;

    @ApiProperty({ description: 'Parâmetros adicionais do lastro parametrizado', required: false })
    parametrosLastro?: {
        indexador?: string;
        casasDecimais?: number;
        permiteSaldoNegativo?: boolean;
        emissor?: string;
        observacoesLastro?: string;
        metaPosicao?: number;
    };

    @ApiProperty({ description: 'Aceite dos termos de uso da carteira', default: true, required: false })
    termosAceitos?: boolean;
}

export class LancamentoPosicaoCarteiraDto {
    @ApiProperty({ description: 'ID da carteira a ser atualizada', required: false })
    carteiraId?: string;

    @ApiProperty({ description: 'Modo de lançamento: MOVIMENTACAO (entrada/saída) ou DEFINIR_POSICAO (ajuste direto do saldo atual)', enum: ['MOVIMENTACAO', 'DEFINIR_POSICAO'], default: 'MOVIMENTACAO' })
    modo: 'MOVIMENTACAO' | 'DEFINIR_POSICAO';

    @ApiProperty({ description: 'Tipo da movimentação quando modo = MOVIMENTACAO', enum: ['ENTRADA', 'SAIDA'], required: false })
    tipo?: 'ENTRADA' | 'SAIDA';

    @ApiProperty({ description: 'Valor da movimentação quando modo = MOVIMENTACAO', required: false, example: 500.00 })
    valor?: number;

    @ApiProperty({ description: 'Nova posição / saldo consolidado quando modo = DEFINIR_POSICAO', required: false, example: 2500.00 })
    novaPosicao?: number;

    @ApiProperty({ description: 'Nova cotação / fator de conversão em BRL (opcional)', required: false, example: 5.80 })
    novaCotacaoBrl?: number;

    @ApiProperty({ description: 'Nova meta de posição da carteira (opcional)', required: false })
    novaMetaPosicao?: number;

    @ApiProperty({
        description: 'Categoria do lançamento',
        enum: ['DEPOSITO', 'PAGAMENTO_FATURA', 'TRANSFERENCIA', 'ESTORNO', 'AJUSTE_POSICAO', 'RENDIMENTO', 'APORTE', 'RETIRADA', 'VALORIZACAO', 'OUTROS'],
        required: false
    })
    categoria?: 'DEPOSITO' | 'PAGAMENTO_FATURA' | 'TRANSFERENCIA' | 'ESTORNO' | 'AJUSTE_POSICAO' | 'RENDIMENTO' | 'APORTE' | 'RETIRADA' | 'VALORIZACAO' | 'OUTROS';

    @ApiProperty({ description: 'Identificador ou documento de referência', required: false })
    identificador?: string;

    @ApiProperty({ description: 'Descrição / justificativa da atualização de posição', required: false })
    descricao?: string;

    @ApiProperty({ description: 'Metadados adicionais do lançamento', required: false })
    metadados?: any;
}

@ApiTags('Carteira')
@Controller('Financeiro/Carteira')
export class CarteiraController {
    constructor(
        private readonly carteiraService: CarteiraService
    ) { }

    private getUserId(req: any): string {
        const userId = req.user?.id || req.chaveAcesso;
        if (!userId) {
            return 'guest_user_demo';
        }
        return userId;
    }

    /**
     * Retorna a visão geral da carteira do usuário atual (saldo, lista de todas as carteiras, patrimônio consolidado, dashboard de ganhos/perdas e movimentações).
     */
    @Get('Minha')
    @ApiOperation({ operationId: 'CarteiraGetMinha', summary: 'Obtém a carteira selecionada, todas as carteiras do usuário, dashboard de ganhos/perdas e histórico recente' })
    async getMinhaCarteira(
        @Req() req: any,
        @Query('autoCreate') autoCreate?: string,
        @Query('carteiraId') carteiraId?: string,
        @Query('periodo') periodo?: '7D' | '30D' | '90D' | '12M' | 'TUDO'
    ) {
        const userId = this.getUserId(req);
        const deveCriar = autoCreate === 'true';
        return await this.carteiraService.obterVisaoGeralCarteira(userId, deveCriar, carteiraId, periodo || '30D');
    }

    /**
     * Retorna o Dashboard Consolidado de Ganhos, Perdas, Alocação e Série Temporal das Carteiras
     */
    @Get('Dashboard')
    @ApiOperation({ operationId: 'CarteiraGetDashboard', summary: 'Obtém o dashboard de visão geral das carteiras com evolução de ganhos e perdas ao longo do tempo' })
    async getDashboardCarteiras(
        @Req() req: any,
        @Query('periodo') periodo?: '7D' | '30D' | '90D' | '12M' | 'TUDO',
        @Query('carteiraId') carteiraId?: string
    ) {
        const userId = this.getUserId(req);
        return await this.carteiraService.obterDashboardCarteiras(userId, {
            periodo: periodo || '30D',
            carteiraId,
        });
    }

    /**
     * Lista todas as carteiras do usuário (reais e parametrizadas)
     */
    @Get('Listar')
    @ApiOperation({ operationId: 'CarteiraListar', summary: 'Lista todas as carteiras digitais do usuário' })
    async listarCarteiras(@Req() req: any) {
        const userId = this.getUserId(req);
        const carteiras = await this.carteiraService.listarCarteirasUsuario(userId);
        return {
            possuiCarteira: carteiras.length > 0,
            carteiras,
        };
    }

    /**
     * Cria explicitamente uma nova carteira digital (permitindo múltiplas carteiras com lastro real ou parametrizado)
     */
    @Post('Criar')
    @ApiOperation({ operationId: 'CarteiraCriar', summary: 'Cria uma nova carteira digital para o usuário' })
    async criarCarteira(
        @Req() req: any,
        @Body() body?: CriarCarteiraDto
    ) {
        const userId = this.getUserId(req);
        return await this.carteiraService.criarCarteira(userId, body);
    }

    /**
     * Realiza lançamento de movimentação (entrada/saída) ou atualização direta da posição da carteira
     */
    @Post('LancamentoPosicao')
    @ApiOperation({ operationId: 'CarteiraLancamentoPosicao', summary: 'Realiza lançamento ou atualiza diretamente a posição de uma carteira' })
    async lancarPosicao(
        @Req() req: any,
        @Body() body: LancamentoPosicaoCarteiraDto
    ) {
        const userId = this.getUserId(req);
        return await this.carteiraService.lancarPosicaoCarteira(userId, body);
    }

    /**
     * Registra um depósito identificado na carteira do usuário
     */
    @Post('Deposito')
    @ApiOperation({ operationId: 'CarteiraRegistrarDeposito', summary: 'Registra um depósito identificado e adiciona saldo' })
    async registrarDeposito(
        @Req() req: any,
        @Body() body: DepositoIdentificadoDto
    ) {
        const userId = this.getUserId(req);
        return await this.carteiraService.registrarDeposito(userId, body);
    }

    /**
     * Realiza o pagamento de uma fatura utilizando o saldo da carteira
     */
    @Post('PagarFatura')
    @ApiOperation({ operationId: 'CarteiraPagarFatura', summary: 'Paga uma fatura utilizando o saldo disponível na carteira' })
    async pagarFatura(
        @Req() req: any,
        @Body() body: PagarFaturaComCarteiraDto
    ) {
        const userId = this.getUserId(req);
        return await this.carteiraService.pagarFatura(userId, body);
    }

    /**
     * Consulta o extrato de transações de entrada e saída com filtros
     */
    @Get('Transacoes')
    @ApiOperation({ operationId: 'CarteiraListarTransacoes', summary: 'Lista extrato de movimentações da carteira' })
    async listarTransacoes(
        @Req() req: any,
        @Query('carteiraId') carteiraId?: string,
        @Query('tipo') tipo?: 'ENTRADA' | 'SAIDA',
        @Query('categoria') categoria?: string,
        @Query('take') take?: string,
        @Query('skip') skip?: string
    ) {
        const userId = this.getUserId(req);
        return await this.carteiraService.listarTransacoes(userId, {
            carteiraId,
            tipo,
            categoria,
            take: take ? parseInt(take, 10) : 50,
            skip: skip ? parseInt(skip, 10) : 0,
        });
    }

    /**
     * Avalia se o usuário cumpriu os requisitos para receber a ROLE DEVELOPER como cortesia:
     * - E-mail verificado (emailVerificado === true)
     * - Saldo na carteira >= 50
     * - Autoria comprovada no projeto (PR aceito na branch development) vinculada ao mesmo e-mail
     */
    @Post('AvaliarRoleDeveloper')
    @ApiOperation({ operationId: 'CarteiraAvaliarRoleDeveloper', summary: 'Avalia e concede a ROLE DEVELOPER de cortesia por autoria e saldo' })
    async avaliarRoleDeveloper(@Req() req: any) {
        const userId = this.getUserId(req);
        return await this.carteiraService.verificarEConcederRoleDeveloper(userId);
    }
}
